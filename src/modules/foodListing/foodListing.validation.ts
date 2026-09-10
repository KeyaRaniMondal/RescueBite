import z from "zod";
import { FoodCategory, FoodStatus } from "../../generated/prisma/enums";

const foodCategoryValues = Object.values(FoodCategory) as [string, ...string[]];
const foodStatusValues = Object.values(FoodStatus) as [string, ...string[]];

const CreateFoodListingZodSchema = z
	.object({
		foodName: z
			.string("Food name must be a string")
			.min(2, "Food name must be at least 2 characters long")
			.max(100, "Food name must be at most 100 characters long"),
		description: z
			.string("Description must be a string")
			.min(5, "Description must be at least 5 characters long")
			.max(500, "Description must be at most 500 characters long"),
		category: z.enum(foodCategoryValues, {
			error: "A valid food category is required",
		}),
		quantity: z.coerce
			.number("Quantity must be a number")
			.int("Quantity must be a whole number")
			.positive("Quantity must be greater than zero"),
		unit: z.string("Unit must be a string").min(1, "Unit is required"),
		price: z.coerce
			.number("Price must be a number")
			.nonnegative("Price cannot be negative"),
		pickupLocation: z
			.string("Pickup location must be a string")
			.min(3, "Pickup location must be at least 3 characters long"),
		pickupStartTime: z.string("Pickup start time is required"),
		pickupEndTime: z.string("Pickup end time is required"),
		expiryTime: z.string("Expiry time is required"),
		images: z.array(z.string("Each image must be a string")).optional(),
		status: z.enum(foodStatusValues).optional(),
	})
	.refine(
		(data) =>
			!data.pickupStartTime ||
			!data.pickupEndTime ||
			new Date(data.pickupEndTime).getTime() >
				new Date(data.pickupStartTime).getTime(),
		{
			message: "Pickup end time must be after pickup start time",
			path: ["pickupEndTime"],
		},
	)
	.refine(
		(data) =>
			!data.pickupEndTime ||
			!data.expiryTime ||
			new Date(data.expiryTime).getTime() >=
				new Date(data.pickupEndTime).getTime(),
		{
			message: "Expiry time must be at or after pickup end time",
			path: ["expiryTime"],
		},
	);

const UpdateFoodListingZodSchema = z
	.object({
		foodName: z
			.string("Food name must be a string")
			.min(2, "Food name must be at least 2 characters long")
			.max(100, "Food name must be at most 100 characters long")
			.optional(),
		description: z
			.string("Description must be a string")
			.min(5, "Description must be at least 5 characters long")
			.max(500, "Description must be at most 500 characters long")
			.optional(),
		category: z
			.enum(foodCategoryValues, {
				error: "A valid food category is required",
			})
			.optional(),
		quantity: z.coerce
			.number("Quantity must be a number")
			.int("Quantity must be a whole number")
			.positive("Quantity must be greater than zero")
			.optional(),
		unit: z
			.string("Unit must be a string")
			.min(1, "Unit is required")
			.optional(),
		price: z.coerce
			.number("Price must be a number")
			.nonnegative("Price cannot be negative")
			.optional(),
		pickupLocation: z
			.string("Pickup location must be a string")
			.min(3, "Pickup location must be at least 3 characters long")
			.optional(),
		pickupStartTime: z.string("Pickup start time is required").optional(),
		pickupEndTime: z.string("Pickup end time is required").optional(),
		expiryTime: z.string("Expiry time is required").optional(),
		images: z.array(z.string("Each image must be a string")).optional(),
	})
	.refine(
		(data) => {
			if (!data.pickupStartTime || !data.pickupEndTime) {
				return true;
			}
			return (
				new Date(data.pickupEndTime).getTime() >
				new Date(data.pickupStartTime).getTime()
			);
		},
		{
			message: "Pickup end time must be after pickup start time",
			path: ["pickupEndTime"],
		},
	)
	.refine(
		(data) => {
			if (!data.pickupEndTime || !data.expiryTime) {
				return true;
			}
			return (
				new Date(data.expiryTime).getTime() >=
				new Date(data.pickupEndTime).getTime()
			);
		},
		{
			message: "Expiry time must be at or after pickup end time",
			path: ["expiryTime"],
		},
	);

const UpdateFoodListingStatusZodSchema = z.object({
	status: z.enum(foodStatusValues, {
		error: "A valid food status is required",
	}),
});

export const FoodListingValidation = {
	CreateFoodListingZodSchema,
	UpdateFoodListingZodSchema,
	UpdateFoodListingStatusZodSchema,
};
