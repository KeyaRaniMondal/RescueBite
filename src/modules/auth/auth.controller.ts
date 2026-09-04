import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { AuthValidation } from "./auth.validation";

const register = async (req: Request, res: Response) => {
	const parsed = AuthValidation.RegistrationZodSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(400).json({
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid input",
			errors: parsed.error.flatten(),
		});
	}

	try {
		const user = await AuthService.register(parsed.data);

		return res.status(201).json({
			success: true,
			message: "User registered successfully",
			data: user,
		});
	} catch (error) {
		const status = error instanceof Error && error.message.includes("already exists") ? 409 : 500;

		return res.status(status).json({
			success: false,
			message: error instanceof Error ? error.message : "Internal server error",
		});
	}
};

const login = async (req: Request, res: Response) => {
	const parsed = AuthValidation.LoginZodSchema.safeParse(req.body);

	if (!parsed.success) {
		return res.status(400).json({
			success: false,
			message: parsed.error.issues[0]?.message ?? "Invalid input",
			errors: parsed.error.flatten(),
		});
	}

	try {
		const user = await AuthService.login(parsed.data);

		return res.status(200).json({
			success: true,
			message: "Login successful",
			data: user,
		});
	} catch (error) {
		const status =
			error instanceof Error && error.message === "Invalid email or password" ? 401 : 500;

		return res.status(status).json({
			success: false,
			message: error instanceof Error ? error.message : "Internal server error",
		});
	}
};

export const AuthController = {
	register,
	login,
};