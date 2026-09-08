import { PaymentStatus, ReservationStatus } from "../../generated/prisma/enums";

export interface ICreatePaymentPayload {
	reservationId: string;
	amount: number;
	customer: {
		name: string;
		email: string;
		phone: string;
	};
	product: {
		name: string;
		category: string;
		quantity: number;
	};
}

export interface IPayment {
	id: string;
	reservationId: string;
	amount: number;
	status: PaymentStatus;
	tranId: string;
	gatewayData: unknown;
	createdAt: string;
	updatedAt: string;
}

export interface IInitiatedPayment extends IPayment {
	gatewayPageURL: string;
}

export interface ISslCommerzInitResponse {
	status: "SUCCESS" | "FAILED";
	failedreason: string;
	sessionkey: string;
	gw: {
		visa: string;
		master: string;
		amex: string;
		othercards: string;
		internetbanking: string;
		mobilebanking: string;
	};
	redirectGatewayURL: string;
	GatewayPageURL: string;
	storeBanner: string;
	storeLogo: string;
	store_name: string;
	desc: string;
	is_direct_pay_enable: string;
	directPaymentURLBank: string;
	directPaymentURLCard: string;
	directPaymentURL: string;
	redirectGatewayURLFailed: string;
	GatewayPageURLFailed: string;
	storePayOption: string;
}

export interface ISslCommerzValidationResponse {
	status: string;
	tran_id: string;
	val_id: string;
	amount: string;
	store_amount: string;
	currency: string;
	bank_tran_id: string;
	card_type: string;
	card_no: string;
	store_id: string;
	verify_sign: string;
	verify_key: string;
	error: string;
}

export interface IPaymentCallbackPayload {
	tran_id?: string;
	val_id?: string;
	amount?: string;
	currency?: string;
	bank_tran_id?: string;
	status?: string;
	card_type?: string;
	[key: string]: string | undefined;
}

export interface IPaymentCallbackResult {
	payment: IPayment;
	reservationStatus: ReservationStatus;
}
