import bcrypt from "bcryptjs";

import { connectDatabase, db } from "../../../prisma/db.ts";
import type {
	ILoginPayload,
	ILoginUser,
	IRegisterPayload,
	IRegisteredUser,
} from "./auth.interface";

const register = async (payload: IRegisterPayload): Promise<IRegisteredUser> => {
	const { name, email, username, password, role } = payload;

	const normalizedEmail = email.trim().toLowerCase();

	await connectDatabase();

	const existingUser = await db.orm.public.User.where((u) =>
		u.email.eq(normalizedEmail),
	).first();

	if (existingUser) {
		throw new Error("A user with this email already exists");
	}

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = await db.orm.public.User
		.select("id", "email", "username", "name", "role", "createdAt")
		.create({
			name,
			username: username ?? null,
			email: normalizedEmail,
			password: hashedPassword,
			role,
		});

	return {
		id: String(user.id),
		email: user.email,
		username: user.username ?? null,
		name: user.name ?? null,
		role: user.role,
		createdAt: user.createdAt,
	};
};

const login = async (payload: ILoginPayload): Promise<ILoginUser> => {
	const { email, password } = payload;

	const normalizedEmail = email.trim().toLowerCase();

	await connectDatabase();

	const existingUser = await db.orm.public.User
		.select("id", "email", "username", "name", "role", "password")
		.where((u) => u.email.eq(normalizedEmail))
		.first();

	if (!existingUser) {
		throw new Error("Invalid email or password");
	}

	const isPasswordValid = await bcrypt.compare(password, existingUser.password);

	if (!isPasswordValid) {
		throw new Error("Invalid email or password");
	}

	return {
		id: String(existingUser.id),
		email: existingUser.email,
		username: existingUser.username ?? null,
		name: existingUser.name ?? null,
		role: existingUser.role,
	};
};

export const AuthService = {
	register,
	login,
};