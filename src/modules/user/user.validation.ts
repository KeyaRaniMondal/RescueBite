import { z } from "zod";

const UpdateProfileZodSchema = z
	.object({
		name: z
			.string("Name must be a string")
			.min(3, "Name must be at least 3 characters long")
			.max(10, "Name must be at most 10 characters long")
			.optional(),
		imageUrl: z
			.union([
				z.literal(""),
				z
					.string("imageUrl must be a string")
					.url("imageUrl must be a valid URL")
					.max(500, "imageUrl is too long"),
			])
			.optional(),
		imagePublicId: z
			.string("imagePublicId must be a string")
			.max(500, "imagePublicId is too long")
			.optional(),
		contactNumber: z
			.string("contactNumber must be a string")
			.max(30, "contactNumber is too long")
			.optional(),
	})
	.refine((data) => Object.keys(data).length > 0, {
		message: "At least one field is required",
	});

export const UserValidation = {
	UpdateProfileZodSchema,
};
