import type { NextFunction, Request, Response } from "express";
import type { Role } from "../generated/prisma/enums";
import config from "../config";
import { jwtUtils } from "../utils/jwt";

export const authenticate = (
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	const token =
		req.cookies?.accessToken ||
		(req.headers.authorization?.startsWith("Bearer")
			? req.headers.authorization.split(" ")[1]
			: undefined);

	if (!token) {
		return res.status(401).json({
			success: false,
			message: "Authentication required. No token provided.",
		});
	}

	const verified = jwtUtils.verifyToken(token, config.jwt_access_secret);

	if (!verified.success || !verified.data) {
		return res.status(401).json({
			success: false,
			message: "Invalid or expired token",
		});
	}

	const data = verified.data as {
		userId: string;
		name: string;
		email: string;
		role: Role;
		iat?: number;
		exp?: number;
	};

	req.user = {
		userId: data.userId,
		name: data.name,
		email: data.email,
		role: data.role,
	};

	next();
};

export const authorizeRoles = (...roles: Role[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.user) {
			return res.status(401).json({
				success: false,
				message: "Authentication required",
			});
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				success: false,
				message: "Forbidden: You do not have permission to access this resource",
			});
		}

		next();
	};
};