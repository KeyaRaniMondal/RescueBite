import { Role } from "../../generated/prisma/browser";


export interface ILoginUserPayload {
	email: string;
	password: string;
}

export interface IRegisterCustomerPayload {
	name: string;
	email: string;
	password: string;
	role?: Role;
	customer: {
		contactNumber?: string;
	};
}

export interface IRequestUser {
	userId: string;
	email: string;
	name: string;
	role: Role;
}

