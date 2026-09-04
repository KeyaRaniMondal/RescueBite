import bcrypt from "bcryptjs";

import { connectDatabase, db } from "../../../prisma/db.ts";
import type { IRegisterPayload, IRegisteredUser } from "./auth.interface";

const register = async (payload: IRegisterPayload): Promise<IRegisteredUser> => {
	const { name, email, username, password } = payload;

	const normalizedEmail = email.trim().toLowerCase();

	await connectDatabase();

	const existingUser = await db.orm.public.User.where((u) =>
		u.email.eq(normalizedEmail),
	).first();

	if (existingUser) {
		throw new Error("A user with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 8);

	const user = await db.orm.public.User
		.select("id", "email", "username", "name", "createdAt")
		.create({
						name,					
			username: username ?? null,
			email: normalizedEmail,
			password: hashedPassword,
			role

		});

	return {
		id: String(user.id),
		email: user.email,
		username: user.username ?? null,
		name: user.name ?? null,
		createdAt: user.createdAt,
	};
};

export const AuthService = {
	register,
};