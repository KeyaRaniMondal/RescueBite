import { Router } from "express";
import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";

import { AuthController } from "./auth.controller";
import { AuthValidation } from "./auth.validation";

const router = Router();

const validateRequest: (schema: ZodSchema) => RequestHandler =
	(schema) => (req, res, next) => {
		const parsed = schema.safeParse(req.body);

		if (!parsed.success) {
			return res.status(400).json({
				success: false,
				message: parsed.error.issues[0]?.message ?? "Invalid input",
				errors: parsed.error.flatten(),
			});
		}

		req.body = parsed.data;
		return next();
	};

router.post(
	"/register",
	validateRequest(AuthValidation.RegistrationZodSchema),
	AuthController.register,
);

export const AuthRoutes = router;
