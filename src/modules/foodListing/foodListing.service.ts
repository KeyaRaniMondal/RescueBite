import { prisma } from "../../lib/prisma";
import { Prisma, FoodCategory, FoodStatus } from "../../generated/prisma/client";
import {
	ICreateFoodListingPayload,
	IFoodListing,
	IUpdateFoodListingPayload,
} from "./foodListing.interface";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const ALLOWED_TRANSITIONS: Record<FoodStatus, FoodStatus[]> = {
	DRAFT: [FoodStatus.AVAILABLE],
	AVAILABLE: [
		FoodStatus.PARTIALLY_RESERVED,
		FoodStatus.FULLY_RESERVED,
		FoodStatus.CANCELLED,
		FoodStatus.EXPIRED,
	],
	PARTIALLY_RESERVED: [FoodStatus.FULLY_RESERVED, FoodStatus.EXPIRED],
	FULLY_RESERVED: [FoodStatus.EXPIRED],
	EXPIRED: [],
	CANCELLED: [],
};

const validateTransition = (from: FoodStatus, to: FoodStatus) => {
	if (from === to) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Food listing is already in ${from} status`,
		);
	}

	const allowed = ALLOWED_TRANSITIONS[from] ?? [];

	if (!allowed.includes(to)) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			`Invalid food listing status transition: ${from} -> ${to}`,
		);
	}
};

const LISTING_SELECT = {
	id: true,
	providerId: true,
	foodName: true,
	description: true,
	category: true,
	quantity: true,
	unit: true,
	price: true,
	pickupLocation: true,
	pickupStartTime: true,
	pickupEndTime: true,
	expiryTime: true,
	images: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} as const;

type FoodListingRow = {
	id: string;
	providerId: string;
	foodName: string;
	description: string;
	category: string;
	quantity: number;
	unit: string;
	price: number;
	pickupLocation: string;
	pickupStartTime: Date;
	pickupEndTime: Date;
	expiryTime: Date;
	images: string[];
	status: FoodStatus;
	createdAt: Date;
	updatedAt: Date;
};

const toFoodListing = (listing: FoodListingRow): IFoodListing => ({
	id: listing.id,
	providerId: listing.providerId,
	foodName: listing.foodName,
	description: listing.description,
	category: listing.category as IFoodListing["category"],
	quantity: listing.quantity,
	unit: listing.unit,
	price: listing.price,
	pickupLocation: listing.pickupLocation,
	pickupStartTime: listing.pickupStartTime.toISOString(),
	pickupEndTime: listing.pickupEndTime.toISOString(),
	expiryTime: listing.expiryTime.toISOString(),
	images: listing.images,
	status: listing.status,
	createdAt: listing.createdAt.toISOString(),
	updatedAt: listing.updatedAt.toISOString(),
});

const getProviderIdForUser = async (userId: string): Promise<string> => {
	const provider = await prisma.provider.findUnique({
		where: { userId },
		select: { id: true },
	});

	if (!provider) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			"Provider profile not found. Please create a provider profile first",
		);
	}

	return provider.id;
};

const createListing = async (
	userId: string,
	payload: ICreateFoodListingPayload,
): Promise<IFoodListing> => {
	const providerId = await getProviderIdForUser(userId);

	const listing = await prisma.foodListing.create({
		data: {
			providerId,
			foodName: payload.foodName,
			description: payload.description,
			category: payload.category,
			quantity: payload.quantity,
			unit: payload.unit,
			price: payload.price,
			pickupLocation: payload.pickupLocation,
			pickupStartTime: new Date(payload.pickupStartTime),
			pickupEndTime: new Date(payload.pickupEndTime),
			expiryTime: new Date(payload.expiryTime),
			images: payload.images ?? [],
			status: payload.status ?? FoodStatus.DRAFT,
		},
		select: LISTING_SELECT,
	});

	return toFoodListing(listing);
};

const getListingById = async (listingId: string): Promise<IFoodListing> => {
	const listing = await prisma.foodListing.findUnique({
		where: { id: listingId },
		select: LISTING_SELECT,
	});

	if (!listing) {
		throw new AppError(httpStatus.NOT_FOUND, "Food listing not found");
	}

	return toFoodListing(listing);
};

const listListings = async (options?: {
	providerId?: string;
	status?: FoodStatus;
	category?: FoodCategory;
	search?: string;
}): Promise<IFoodListing[]> => {
	const where: Prisma.FoodListingWhereInput = {
		...(options?.providerId ? { providerId: options.providerId } : {}),
		...(options?.status ? { status: options.status } : {}),
		...(options?.category ? { category: options.category } : {}),
		...(options?.search
			? {
					OR: [
						{ foodName: { contains: options.search, mode: "insensitive" } },
						{
							description: { contains: options.search, mode: "insensitive" },
						},
						{
							pickupLocation: { contains: options.search, mode: "insensitive" },
						},
					],
				}
			: {}),
	};

	const listings = await prisma.foodListing.findMany({
		where,
		select: LISTING_SELECT,
		orderBy: { createdAt: "desc" },
	});

	return listings.map(toFoodListing);
};

const getProviderListings = async (userId: string): Promise<IFoodListing[]> => {
	const providerId = await getProviderIdForUser(userId);

	const listings = await prisma.foodListing.findMany({
		where: { providerId },
		select: LISTING_SELECT,
		orderBy: { createdAt: "desc" },
	});

	return listings.map(toFoodListing);
};

const updateListing = async (
	userId: string,
	listingId: string,
	payload: IUpdateFoodListingPayload,
): Promise<IFoodListing> => {
	const providerId = await getProviderIdForUser(userId);

	const existing = await prisma.foodListing.findUnique({
		where: { id: listingId },
		select: { id: true, providerId: true, status: true },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Food listing not found");
	}

	if (existing.providerId !== providerId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden: You do not have permission to update this food listing",
		);
	}

	if (existing.status !== FoodStatus.DRAFT) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Only draft food listings can be updated",
		);
	}

	const updated = await prisma.foodListing.update({
		where: { id: listingId },
		data: {
			foodName: payload.foodName,
			description: payload.description,
			category: payload.category,
			quantity: payload.quantity,
			unit: payload.unit,
			price: payload.price,
			pickupLocation: payload.pickupLocation,
			pickupStartTime: payload.pickupStartTime
				? new Date(payload.pickupStartTime)
				: undefined,
			pickupEndTime: payload.pickupEndTime
				? new Date(payload.pickupEndTime)
				: undefined,
			expiryTime: payload.expiryTime
				? new Date(payload.expiryTime)
				: undefined,
			images: payload.images,
		},
		select: LISTING_SELECT,
	});

	return toFoodListing(updated);
};

const transitionListingStatus = async (
	userId: string,
	listingId: string,
	nextStatus: FoodStatus,
): Promise<IFoodListing> => {
	const providerId = await getProviderIdForUser(userId);

	const existing = await prisma.foodListing.findUnique({
		where: { id: listingId },
		select: { id: true, providerId: true, status: true },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Food listing not found");
	}

	if (existing.providerId !== providerId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden: You do not have permission to update this food listing",
		);
	}

	validateTransition(existing.status, nextStatus);

	const updated = await prisma.foodListing.update({
		where: { id: listingId },
		data: { status: nextStatus },
		select: LISTING_SELECT,
	});

	return toFoodListing(updated);
};

const deleteListing = async (
	userId: string,
	listingId: string,
): Promise<void> => {
	const providerId = await getProviderIdForUser(userId);

	const existing = await prisma.foodListing.findUnique({
		where: { id: listingId },
		select: { id: true, providerId: true },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Food listing not found");
	}

	if (existing.providerId !== providerId) {
		throw new AppError(
			httpStatus.FORBIDDEN,
			"Forbidden: You do not have permission to delete this food listing",
		);
	}

	await prisma.foodListing.delete({ where: { id: listingId } });
};

export const FoodListingService = {
	createListing,
	getListingById,
	listListings,
	getProviderListings,
	updateListing,
	transitionListingStatus,
	deleteListing,
	ALLOWED_TRANSITIONS,
};