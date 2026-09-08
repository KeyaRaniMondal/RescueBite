import { ReservationStatus, PaymentStatus } from "../../generated/prisma/enums";

export interface ICreateReservationPayload {
	listingId: string;
	quantity: number;
}

export interface IReservation {
	id: string;
	listingId: string;
	customerId: string;
	quantity: number;
	status: ReservationStatus;
	foodName: string;
	category: string;
	pickupLocation: string;
	pickupStartTime: string;
	pickupEndTime: string;
	expiryTime: string;
	cancelledAt: string | null;
	completedAt: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface ICreateReservationResult extends IReservation {
	payment: {
		id: string;
		amount: number;
		status: PaymentStatus;
		gatewayPageURL: string;
	};
}
