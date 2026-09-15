import { prisma } from "../../lib/prisma";
import {
	Prisma,
	ReservationStatus,
	FoodStatus,
	PaymentStatus,
} from "../../generated/prisma/client";
import type {
	ICreateReservationPayload,
	ICreateReservationResult,
	IReservation,
} from "./reservation.interface";
import { PaymentService } from "../payment/payment.service";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const getCustomerForUser = async (userId: string): Promise<string> => {
	const customer = await prisma.customer.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!customer) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Customer profile not found. Please register as a receiver first",
		);
	}

	return customer.id;
};

const getCustomerRecordForUser = async (userId: string) => {
	const customer = await prisma.customer.findUnique({
		where: { userId },
		select: { id: true, name: true, email: true, contactNumber: true },
	});

	if (!customer) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Customer profile not found. Please register as a receiver first",
		);
	}

	return customer;
};

const RESERVATION_SELECT = {
	id: true,
	listingId: true,
	customerId: true,
	quantity: true,
	status: true,
	cancelledAt: true,
	completedAt: true,
	createdAt: true,
	updatedAt: true,
	listing: {
		select: {
			foodName: true,
			category: true,
			pickupLocation: true,
			pickupStartTime: true,
			pickupEndTime: true,
			expiryTime: true,
			quantity: true,
		},
	},
} as const;

type ReservationRow = {
	id: string;
	listingId: string;
	customerId: string;
	quantity: number;
	status: ReservationStatus;
	cancelledAt: Date | null;
	completedAt: Date | null;
	createdAt: Date;
	updatedAt: Date;
	listing: {
		foodName: string;
		category: string;
		pickupLocation: string;
		pickupStartTime: Date;
		pickupEndTime: Date;
		expiryTime: Date;
		quantity: number;
	};
};

const toReservation = (reservation: ReservationRow): IReservation => {
	return {
		id: reservation.id,
		listingId: reservation.listingId,
		customerId: reservation.customerId,
		quantity: reservation.quantity,
		status: reservation.status,
		foodName: reservation.listing.foodName,
		category: reservation.listing.category,
		pickupLocation: reservation.listing.pickupLocation,
		pickupStartTime: reservation.listing.pickupStartTime.toISOString(),
		pickupEndTime: reservation.listing.pickupEndTime.toISOString(),
		expiryTime: reservation.listing.expiryTime.toISOString(),
		cancelledAt: reservation.cancelledAt?.toISOString() ?? null,
		completedAt: reservation.completedAt?.toISOString() ?? null,
		createdAt: reservation.createdAt.toISOString(),
		updatedAt: reservation.updatedAt.toISOString(),
	};
};

import { deallocateListing } from "../foodListing/foodListing.deallocation";

const reserveFood = async (
	userId: string,
	payload: ICreateReservationPayload,
): Promise<ICreateReservationResult> => {
	const customer = await getCustomerRecordForUser(userId);

	const reservation = await prisma.$transaction(async (tx) => {
		const listing = await tx.foodListing.findUnique({
			where: { id: payload.listingId },
			select: {
				id: true,
				quantity: true,
				status: true,
				expiryTime: true,
				price: true,
				foodName: true,
				category: true,
			},
		});

		if (!listing) {
			throw new AppError(httpStatus.NOT_FOUND, "Food listing not found");
		}

		if (
			listing.status !== FoodStatus.AVAILABLE &&
			listing.status !== FoodStatus.PARTIALLY_RESERVED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Food listing is not available for reservation",
			);
		}

		if (listing.expiryTime.getTime() <= Date.now()) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Food listing has already expired",
			);
		}

		const reservationSum = await tx.reservation.aggregate({
			where: {
				listingId: payload.listingId,
				status: ReservationStatus.RESERVED,
			},
			_sum: { quantity: true },
		});

		const alreadyReserved = reservationSum._sum.quantity ?? 0;
		const available = listing.quantity - alreadyReserved;

		if (payload.quantity > available) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				`Only ${available} unit(s) are available for reservation`,
			);
		}

		const created = await tx.reservation.create({
			data: {
				listingId: payload.listingId,
				customerId: customer.id,
				quantity: payload.quantity,
				status: ReservationStatus.RESERVED,
			},
			select: RESERVATION_SELECT,
		});

		const nowReserved = alreadyReserved + payload.quantity;
		const nextStatus =
			nowReserved >= listing.quantity
				? FoodStatus.FULLY_RESERVED
				: FoodStatus.PARTIALLY_RESERVED;

		if (listing.status !== nextStatus) {
			await tx.foodListing.update({
				where: { id: payload.listingId },
				data: { status: nextStatus },
			});
		}

		const payment = await PaymentService.createPendingPayment(tx, {
			reservationId: created.id,
			amount: listing.price * payload.quantity,
			customer: {
				name: customer.name,
				email: customer.email,
				phone: customer.contactNumber ?? "",
			},
			product: {
				name: listing.foodName,
				category: listing.category,
				quantity: payload.quantity,
			},
		});

		return { reservation: created, payment };
	});

	const gatewayPageURL = await PaymentService.initiateSslCommerzPayment(
		reservation.payment,
		{
			customer: {
				name: customer.name,
				email: customer.email,
				phone: customer.contactNumber ?? "",
			},
			product: {
				name: reservation.reservation.listing.foodName,
				category: reservation.reservation.listing.category,
				quantity: payload.quantity,
			},
		},
	);

	return {
		...toReservation(reservation.reservation),
		payment: {
			id: reservation.payment.id,
			tranId: reservation.payment.tranId,
			amount: reservation.payment.amount,
			status: reservation.payment.status,
			gatewayPageURL,
		},
	};
};

const cancelReservation = async (
	userId: string,
	reservationId: string,
): Promise<IReservation> => {
	const customerId = await getCustomerForUser(userId);

	const reservation = await prisma.$transaction(async (tx) => {
		const existing = await tx.reservation.findUnique({
			where: { id: reservationId },
			select: {
				...RESERVATION_SELECT,
				listing: {
					select: {
						foodName: true,
						category: true,
						pickupLocation: true,
						pickupStartTime: true,
						pickupEndTime: true,
						expiryTime: true,
						quantity: true,
						status: true,
					},
				},
			},
		});

		if (!existing) {
			throw new AppError(httpStatus.NOT_FOUND, "Reservation not found");
		}

		if (existing.customerId !== customerId) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden: You do not have permission to cancel this reservation",
			);
		}

		if (existing.status !== ReservationStatus.RESERVED) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Only eligible (active) reservations can be cancelled",
			);
		}

		if (
			existing.listing.status === FoodStatus.EXPIRED ||
			existing.listing.status === FoodStatus.CANCELLED
		) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Reservation can no longer be cancelled because the listing is no longer active",
			);
		}

		const updated = await tx.reservation.update({
			where: { id: reservationId },
			data: {
				status: ReservationStatus.CANCELLED,
				cancelledAt: new Date(),
			},
			select: RESERVATION_SELECT,
		});

		await deallocateListing(tx, existing.listingId);

		return updated;
	});

	return toReservation(reservation);
};

const getReservationById = async (
	userId: string,
	reservationId: string,
): Promise<IReservation> => {
	const customerId = await getCustomerForUser(userId);

	const reservation = await prisma.reservation.findUnique({
		where: { id: reservationId },
		select: RESERVATION_SELECT,
	});

	if (!reservation) {
		throw new AppError(httpStatus.NOT_FOUND, "Reservation not found");
	}

	if (reservation.customerId !== customerId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden: You do not have permission to view this reservation",
		);
	}

	return toReservation(reservation);
};

const getMyReservations = async (userId: string): Promise<IReservation[]> => {
	const customerId = await getCustomerForUser(userId);

	const reservations = await prisma.reservation.findMany({
		where: { customerId },
		select: RESERVATION_SELECT,
		orderBy: { createdAt: "desc" },
	});

	return reservations.map(toReservation);
};

export const ReservationService = {
	reserveFood,
	cancelReservation,
	getReservationById,
	getMyReservations,
};
