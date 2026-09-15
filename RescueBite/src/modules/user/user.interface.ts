import type { Role, UserStatus } from "../../generated/prisma/enums";

export interface IUserProfile {
	id: string;
	name: string;
	email: string;
	role: Role;
	status: UserStatus;
	emailVerified: boolean;
	needPasswordChange: boolean;
	imageUrl: string;
	imagePublicId: string;
	createdAt: string;
	updatedAt: string;
	customer?: {
		id: string;
		contactNumber: string | null;
	} | null;
	provider?: {
		id: string;
		businessName: string;
		businessType: string;
		address: string;
		city: string;
		phone: string;
		isVerified: boolean;
	} | null;
}

export interface IUpdateUserProfilePayload {
	name?: string;
	imageUrl?: string;
	imagePublicId?: string;
	contactNumber?: string;
}
