import { z } from "zod";
import { Role, UserStatus } from "../../generated/prisma/enums";

const userListQuerySchema = z.object({
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
	role: z.nativeEnum(Role).optional(),
	status: z.nativeEnum(UserStatus).optional(),
});

const updateUserRoleSchema = z.object({
	role: z.nativeEnum(Role, {
		message: "Role must be one of: ADMIN, PROVIDER, RECEIVER",
	}),
});

export const AdminUserValidation = {
	UserListQuerySchema: userListQuerySchema,
	UpdateUserRoleSchema: updateUserRoleSchema,
};