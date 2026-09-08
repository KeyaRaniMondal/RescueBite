import {
	Prisma,
	PaymentStatus,
	ReservationStatus,
} from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import config from "../../config";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { deallocateListing } from "../foodListing/foodListing.deallocation";
import {
	ICreatePaymentPayload,
	IInitiatedPayment,
	IPayment,
	IPaymentCallbackPayload,
	IPaymentCallbackResult,
	ISslCommerzInitResponse,
	ISslCommerzValidationResponse,
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

const PAYMENT_CALLBACK_SELECT = {
	...PAYMENT_SELECT,
	reservation: {
		select: {
			id: true,
			listingId: true,
			status: true,
		},
	},
} as const;

type PaymentCallbackRow = PaymentRow & {
	reservation: {
		id: string;
		listingId: string;
		status: ReservationStatus;
	};
};

const validateSslCommerzTransaction = async (
	valId: string,
): Promise<Partial<ISslCommerzValidationResponse>> => {
	const params = new URLSearchParams();
	params.set("val_id", valId);
	params.set("store_id", config.ssl_commerz_store_id);
	params.set("store_passwd", config.ssl_commerz_store_password);
	params.set("format", "json");

	const response = await fetch(
		`${config.sslcommerz_validation_url}?${params.toString()}`,
	);
	const result =
		(await response.json()) as Partial<ISslCommerzValidationResponse>;

	return result;
};

const getPaymentByTranId = async (
	tx: Prisma.TransactionClient,
	tranId: string,
): Promise<PaymentCallbackRow> => {
	const payment = await tx.payment.findUnique({
		where: { tranId },
		select: PAYMENT_CALLBACK_SELECT,
	});

	if (!payment) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			`Payment not found for tran_id ${tranId}`,
		);
	}

	return payment;
};

const settlePayment = async (
	tranId: string,
	outcome: PaymentStatus,
	gatewayData: Prisma.InputJsonValue,
): Promise<IPaymentCallbackResult> => {
	if (outcome !== PaymentStatus.SUCCESS) {
		if (
			outcome !== PaymentStatus.FAILED &&
			outcome !== PaymentStatus.CANCELLED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Invalid payment settlement outcome",
			);
		}
	}

	const result = await prisma.$transaction(async (tx) => {
		const existing = await getPaymentByTranId(tx, tranId);

		if (existing.status === PaymentStatus.SUCCESS) {
			return {
				payment: toPayment(existing),
				reservationStatus: existing.reservation.status,
			};
		}

		if (existing.status !== PaymentStatus.PENDING) {
			throw new AppError(
				httpStatus.CONFLICT,
				`Payment already settled as ${existing.status}`,
			);
		}

		if (outcome === PaymentStatus.SUCCESS) {
			const updated = await tx.payment.update({
				where: { id: existing.id },
				data: { status: PaymentStatus.SUCCESS, gatewayData },
				select: PAYMENT_SELECT,
			});

			return {
				payment: toPayment(updated),
				reservationStatus: existing.reservation.status,
			};
		}

		await tx.payment.update({
			where: { id: existing.id },
			data: { status: outcome, gatewayData },
		});

		await tx.reservation.update({
			where: { id: existing.reservation.id },
			data: {
				status: ReservationStatus.CANCELLED,
				cancelledAt: new Date(),
			},
		});

		// release the reserved stock back to the listing
		await deallocateListing(tx, existing.reservation.listingId);

		return {
			payment: toPayment({
				...existing,
				status: outcome,
			}),
			reservationStatus: ReservationStatus.CANCELLED,
		};
	});

	return result;
};

const handleSuccessCallback = async (
	payload: IPaymentCallbackPayload,
): Promise<IPaymentCallbackResult> => {
	const tranId = payload.tran_id;

	if (!tranId) {
		throw new AppError(httpStatus.BAD_REQUEST, "tran_id is required");
	}

	if (!payload.val_id) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"val_id is required to confirm the payment",
		);
	}

	const validation = await validateSslCommerzTransaction(payload.val_id);

	if (validation.status !== "VALID" && validation.status !== "VALIDATED") {
		const reason = validation.error ?? validation.status;
		return settlePayment(tranId, PaymentStatus.FAILED, {
			...payload,
			validation,
			reason,
		});
	}

	return settlePayment(tranId, PaymentStatus.SUCCESS, {
		...payload,
		validation,
	});
};

const handleFailCallback = async (
	payload: IPaymentCallbackPayload,
): Promise<IPaymentCallbackResult> => {
	const tranId = payload.tran_id;

	if (!tranId) {
		throw new AppError(httpStatus.BAD_REQUEST, "tran_id is required");
	}

	return settlePayment(tranId, PaymentStatus.FAILED, { ...payload });
};

const handleCancelCallback = async (
	payload: IPaymentCallbackPayload,
): Promise<IPaymentCallbackResult> => {
	const tranId = payload.tran_id;

	if (!tranId) {
		throw new AppError(httpStatus.BAD_REQUEST, "tran_id is required");
	}

	return settlePayment(tranId, PaymentStatus.CANCELLED, { ...payload });
};

const handleIpnCallback = async (
	payload: IPaymentCallbackPayload,
): Promise<IPaymentCallbackResult> => {
	const tranId = payload.tran_id;

	if (!tranId) {
		throw new AppError(httpStatus.BAD_REQUEST, "tran_id is required");
	}

	if (!payload.val_id) {
		return settlePayment(tranId, PaymentStatus.FAILED, {
			...payload,
			reason: "val_id missing on IPN callback",
		});
	}

	const validation = await validateSslCommerzTransaction(payload.val_id);

	if (validation.status === "VALID" || validation.status === "VALIDATED") {
		return settlePayment(tranId, PaymentStatus.SUCCESS, {
			...payload,
			validation,
		});
	}

	const reason = validation.error ?? validation.status;
	return settlePayment(tranId, PaymentStatus.FAILED, {
		...payload,
		validation,
		reason,
	});
};

export const PaymentService = {
	createPendingPayment,
	initiateSslCommerzPayment,
	initiatePayment,
	handleSuccessCallback,
	handleFailCallback,
	handleCancelCallback,
	handleIpnCallback,
};
