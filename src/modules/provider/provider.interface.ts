import { BusinessType } from "../../generated/prisma/enums";

export interface ICreateProviderPayload {
	businessName: string;
	businessType: BusinessType;
	address: string;
	city: string;
	phone: string;
}

export interface IProviderProfile {
	id: string;
	userId: string;
	businessName: string;
	businessType: BusinessType;
	address: string;
	city: string;
	phone: string;
	isVerified: boolean;
	createdAt: string;
}