import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { FoodListingService } from "./foodListing.service";
import { FoodListingValidation } from "./foodListing.validation";
import { FoodCategory, FoodStatus } from "../../generated/prisma/enums";
import type {
	ICreateFoodListingPayload,
	IUpdateFoodListingPayload,
} from "./foodListing.interface";

const getUserId = (req: Request): string => {
	const userId = req.user?.userId;

	if (!userId) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Authentication required");
	}

	return userId;
};

const getListingId = (req: Request): string => {
	const id = req.params.id;

	if (typeof id !== "string") {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid food listing id");
	}

	return id;
};

const createFoodListing = catchAsync(async (req: Request, res: Response) => {
	const parsed = FoodListingValidation.CreateFoodListingZodSchema.safeParse(
		req.body,
	);

	if (!parsed.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			parsed.error.issues[0]?.message ?? "Invalid input",
		);
	}

	const listing = await FoodListingService.createListing(
		getUserId(req),
		parsed.data as ICreateFoodListingPayload,
	);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Food listing created successfully",
		data: listing,
	});
});

const getFoodListing = catchAsync(async (req: Request, res: Response) => {
	const listing = await FoodListingService.getListingById(getListingId(req));

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Food listing retrieved successfully",
		data: listing,
	});
});

const getMyFoodListings = catchAsync(async (req: Request, res: Response) => {
	const listings = await FoodListingService.getProviderListings(getUserId(req));

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Food listings retrieved successfully",
		data: listings,
	});
});

const getAllFoodListings = catchAsync(async (req: Request, res: Response) => {
	const { search, status, category } = req.query;

	const normalizedSearch =
		typeof search === "string" && search.trim()
			? search.trim()
			: undefined;

	const normalizedStatus =
		typeof status === "string" && status.trim()
			? (status.trim().toUpperCase() as FoodStatus)
			: undefined;

	if (
		normalizedStatus !== undefined &&
		!Object.values(FoodStatus).includes(normalizedStatus)
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"A valid food status filter is required",
		);
	}

	const normalizedCategory =
		typeof category === "string" && category.trim()
			? (category.trim().toUpperCase() as FoodCategory)
			: undefined;

	if (
		normalizedCategory !== undefined &&
		!Object.values(FoodCategory).includes(normalizedCategory)
	) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"A valid food category filter is required",
		);
	}

	const listings = await FoodListingService.listListings({
		status: normalizedStatus,
		category: normalizedCategory,
		search: normalizedSearch,
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Food listings retrieved successfully",
		data: listings,
	});
});

const updateFoodListing = catchAsync(async (req: Request, res: Response) => {
	const parsed = FoodListingValidation.UpdateFoodListingZodSchema.safeParse(
		req.body,
	);

	if (!parsed.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			parsed.error.issues[0]?.message ?? "Invalid input",
		);
	}

	const listing = await FoodListingService.updateListing(
		getUserId(req),
		getListingId(req),
		parsed.data as IUpdateFoodListingPayload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Food listing updated successfully",
		data: listing,
	});
});

const updateFoodListingStatus = catchAsync(
	async (req: Request, res: Response) => {
		const parsed =
			FoodListingValidation.UpdateFoodListingStatusZodSchema.safeParse(
				req.body,
			);

		if (!parsed.success) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				parsed.error.issues[0]?.message ?? "Invalid input",
			);
		}

		const listing = await FoodListingService.transitionListingStatus(
			getUserId(req),
			getListingId(req),
			parsed.data.status as import("../../generated/prisma/enums").FoodStatus,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Food listing status updated successfully",
			data: listing,
		});
	},
);

const deleteFoodListing = catchAsync(async (req: Request, res: Response) => {
	await FoodListingService.deleteListing(getUserId(req), getListingId(req));

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Food listing deleted successfully",
		data: null,
	});
});

export const FoodListingController = {
	createFoodListing,
	getFoodListing,
	getMyFoodListings,
	getAllFoodListings,
	updateFoodListing,
	updateFoodListingStatus,
	deleteFoodListing,
};