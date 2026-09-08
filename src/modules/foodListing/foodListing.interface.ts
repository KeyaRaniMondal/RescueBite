import { FoodCategory, FoodStatus } from "../../generated/prisma/enums";

export interface ICreateFoodListingPayload {
	foodName: string;
	description: string;
	category: FoodCategory;
	quantity: number;
	unit: string;
	price: number;
	pickupLocation: string;
	pickupStartTime: string;
	pickupEndTime: string;
	expiryTime: string;
	images: string[];
	status?: FoodStatus;
}

export interface IUpdateFoodListingPayload {
	foodName?: string;
	description?: string;
	category?: FoodCategory;
	quantity?: number;
	unit?: string;
	price?: number;
	pickupLocation?: string;
	pickupStartTime?: string;
	pickupEndTime?: string;
	expiryTime?: string;
	images?: string[];
}

export interface IFoodListing {
	id: string;
	providerId: string;
	foodName: string;
	description: string;
	category: FoodCategory;
	quantity: number;
	unit: string;
	price: number;
	pickupLocation: string;
	pickupStartTime: string;
	pickupEndTime: string;
	expiryTime: string;
	images: string[];
	status: FoodStatus;
	createdAt: string;
	updatedAt: string;
}
