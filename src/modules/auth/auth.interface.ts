
export interface IRegisterPayload {
	name: string;
	email: string;
	username?: string;
	password: string;
}

export interface IRegisteredUser {
	id: string;
	email: string;
	username: string | null;
	name: string | null;
	createdAt: string;
}
