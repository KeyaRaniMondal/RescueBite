import type { Role } from "@prisma/client"; // adjust to wherever your Role type actually lives

export interface IRegisterPayload {
	name: string;
	email: string;
	username?: string;
	password: string;
	role: Role;
}

export interface IRegisteredUser {
	id: string;
	email: string;
	username: string | null;
	name: string | null;
	role: Role;
	createdAt: string;
}

export interface ILoginPayload {
	email: string;
	password: string;
}

export interface ILoginUser {
	id: string;
	email: string;
	username: string | null;
	name: string | null;
	role: Role;
}