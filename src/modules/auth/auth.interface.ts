import type { Role } from "../../../generated/prisma/browser";

export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IRegisterReceiverPayload {
	name: string;
	email: string;
	password: string;
	patient: {
		contactNumber?: string;
	};
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

export interface IVerifyEmailPayload {
	email: string;
	otp: string;
}
