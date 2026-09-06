import z from "zod";
import { BusinessType } from "../../generated/prisma/enums";

const businessTypeValues = Object.values(BusinessType) as [
	string,
	...string[],
];

const CreateProviderZodSchema = z.object({
	businessName: z
		.string("Business name must be a string")
		.min(2, "Business name must be at least 2 characters long")
		.max(100, "Business name must be at most 100 characters long"),
	businessType: z.enum(businessTypeValues, {
		error: "A valid business type is required",
	}),
	address: z
		.string("Address must be a string")
		.min(5, "Address must be at least 5 characters long"),
	city: z.string("City must be a string").min(2, "City is required"),
	phone: z
		.string("Phone must be a string")
		.regex(/^[0-9+\-\s()]{7,20}$/, "A valid phone number is required"),
});
export const ProviderValidation = {
	CreateProviderZodSchema,
};