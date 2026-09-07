import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { ReservationService } from "./reservation.service";
import { ReservationValidation } from "./reservation.validation";
import type { ICreateReservationPayload } from "./reservation.interface";

const getUserId = (req: Request): string => {
	const userId = req.user?.userId;

	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Authentication required");
	}

	return userId;
};

const getReservationId = (req: Request): string => {
	const id = req.params.id;

	if (typeof id !== "string") {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid reservation id");
	}

	return id;
};

const reserveFood = catchAsync(async (req: Request, res: Response) => {
	const parsed = ReservationValidation.CreateReservationZodSchema.safeParse(
		req.body,
	);

	if (!parsed.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			parsed.error.issues[0]?.message ?? "Invalid input",
		);
	}

	const reservation = await ReservationService.reserveFood(
		getUserId(req),
		parsed.data as ICreateReservationPayload,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Food reserved successfully",
		data: reservation,
	});
});

const cancelReservation = catchAsync(async (req: Request, res: Response) => {
	const reservation = await ReservationService.cancelReservation(
		getUserId(req),
		getReservationId(req),
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Reservation cancelled successfully",
		data: reservation,
	});
});

const getReservation = catchAsync(async (req: Request, res: Response) => {
	const reservation = await ReservationService.getReservationById(
		getUserId(req),
		getReservationId(req),
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Reservation retrieved successfully",
		data: reservation,
	});
});

const getMyReservations = catchAsync(async (req: Request, res: Response) => {
	const reservations = await ReservationService.getMyReservations(
		getUserId(req),
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Reservations retrieved successfully",
		data: reservations,
	});
});

export const ReservationController = {
	reserveFood,
	cancelReservation,
	getReservation,
	getMyReservations,
};
