import { z } from "zod";

const providerListQuerySchema = z.object({
	page: z
		.preprocess(
			(value) => Number(value),
			z.number().int().positive().default(1),
		)
		.optional(),
	limit: z
		.preprocess(
			(value) => Number(value),
			z.number().int().positive().max(100).default(10),
		)
		.optional(),
	searchTerm: z.string().trim().max(100).optional(),
	verification: z.enum(["all", "pending", "verified"]).optional(),
});

const updateProviderVerificationSchema = z.object({
	isVerified: z.boolean({
		message: "isVerified must be a boolean",
	}),
});

export const AdminProviderValidation = {
	ProviderListQuerySchema: providerListQuerySchema,
	UpdateProviderVerificationSchema: updateProviderVerificationSchema,
};
