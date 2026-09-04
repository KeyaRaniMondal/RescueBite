import { z } from "zod";

const RegistrationZodSchema = z.object({
	name: z
		.string("Name must be a string")
		.min(3, "Name must be at least 3 characters long")
		.max(50, "Name must be at most 50 characters long"),
	email: z.string().email("A valid email is required"),
	role: z.enum(["ADMIN", "PROVIDER", "RECEIVER"], {
		message: "Role must be ADMIN, PROVIDER, or RECEIVER",
	}),
	username: z
		.string()
		.min(3, "Username must be at least 3 characters long")
		.max(20, "Username must be at most 20 characters long")
		.optional(),
	password: z
		.string("Password must be a string")
		.min(8, "Password must be at least 8 characters long")
		.regex(/[a-z]/, "Password must contain at least 1 lowercase letter")
		.regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
		.regex(/[0-9]/, "Password must contain at least 1 number")
		.regex(
			/[^A-Za-z0-9]/,
			"Password must contain at least 1 special character",
		),
});

const LoginZodSchema = z.object({
	email: z.string("Email must be a string").email("A valid email is required"),
	password: z.string("Password must be a string").min(1, "Password is required"),
});

export const AuthValidation = {
	RegistrationZodSchema,
	LoginZodSchema,
};