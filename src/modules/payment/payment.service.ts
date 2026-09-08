import { Prisma, PaymentStatus } from "../../generated/prisma/client";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import {
	ICreatePaymentPayload,
	IInitiatedPayment,
	IPayment,
	ISslCommerzInitResponse,
} from "./payment.interface";

const PAYMENT_SELECT = {
	id: true,
	reservationId: true,
	amount: true,
	status: true,
	tranId: true,
	gatewayData: true,
	createdAt: true,
	updatedAt: true,
} as const;

type PaymentRow = {
	id: string;
	reservationId: string;
	amount: number;
	status: PaymentStatus;
	tranId: string;
	gatewayData: unknown;
	createdAt: Date;
	updatedAt: Date;
};

const toPayment = (payment: PaymentRow): IPayment => ({
	id: payment.id,
	reservationId: payment.reservationId,
	amount: payment.amount,
	status: payment.status,
	tranId: payment.tranId,
	gatewayData: payment.gatewayData,
	createdAt: payment.createdAt.toISOString(),
	updatedAt: payment.updatedAt.toISOString(),
});

const createPendingPayment = async (
	tx: Prisma.TransactionClient,
	payload: ICreatePaymentPayload,
): Promise<IPayment> => {
	const payment = await tx.payment.create({
		data: {
			reservationId: payload.reservationId,
			amount: payload.amount,
			status: PaymentStatus.PENDING,
			tranId: payload.reservationId,
		},
		select: PAYMENT_SELECT,
	});

	return toPayment(payment);
};

const initiateSslCommerzPayment = async (
	payment: IPayment,
	payload: Pick<ICreatePaymentPayload, "customer" | "product">,
): Promise<string> => {
	const params = new URLSearchParams();
	params.set("store_id", config.ssl_commerz_store_id);
	params.set("store_passwd", config.ssl_commerz_store_password);
	params.set("total_amount", payment.amount.toFixed(2));
	params.set("currency", "BDT");
	params.set("tran_id", payment.tranId);
	params.set("success_url", config.sslcommerz_success_url);
	params.set("fail_url", config.sslcommerz_fail_url);
	params.set("cancel_url", config.sslcommerz_cancel_url);
	params.set("ipn_url", config.sslcommerz_ipn_url);
	params.set("cus_name", payload.customer.name);
	params.set("cus_email", payload.customer.email);
	params.set("cus_add1", "Dhaka");
	params.set("cus_city", "Dhaka");
	params.set("cus_country", "Bangladesh");
	params.set("cus_phone", payload.customer.phone || "01700000000");
	params.set("shipping_method", "NO");
	params.set("product_name", payload.product.name);
	params.set("product_category", payload.product.category);
	params.set("product_profile", "non-physical-goods");
	params.set("num_of_item", String(payload.product.quantity));

	const response = await fetch(config.sslcommerz_init_url, {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: params.toString(),
	});

	const result = (await response.json()) as Partial<ISslCommerzInitResponse>;

	if (result.status !== "SUCCESS" || !result.GatewayPageURL) {
		const reason =
			result.failedreason ?? "Failed to initiate SSLCommerz payment";
		throw new AppError(
			httpStatus.BAD_GATEWAY,
			`SSLCommerz initiation failed: ${reason}`,
		);
	}

	return result.GatewayPageURL;
};

const initiatePayment = async (
	tx: Prisma.TransactionClient,
	payload: ICreatePaymentPayload,
): Promise<IInitiatedPayment> => {
	const payment = await createPendingPayment(tx, payload);

	const gatewayPageURL = await initiateSslCommerzPayment(payment, {
		customer: payload.customer,
		product: payload.product,
	});

	return {
		...payment,
		gatewayPageURL,
	};
};

export const PaymentService = {
	createPendingPayment,
	initiateSslCommerzPayment,
	initiatePayment,
};
