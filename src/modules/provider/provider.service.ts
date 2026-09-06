import { prisma } from "../../lib/prisma";
import {
	ICreateProviderPayload,
	IProviderProfile,
} from "./provider.interface";

const toProviderProfile = (provider: {
	id: string;
	userId: string;
	businessName: string;
	businessType: string;
	address: string;
	city: string;
	phone: string;
	isVerified: boolean;
	createdAt: Date;
}): IProviderProfile => ({
	id: provider.id,
	userId: provider.userId,
	businessName: provider.businessName,
	businessType: provider.businessType as IProviderProfile["businessType"],
	address: provider.address,
	city: provider.city,
	phone: provider.phone,
	isVerified: provider.isVerified,
	createdAt: provider.createdAt.toISOString(),
});

const createProfile = async (
	userId: string,
	payload: ICreateProviderPayload,
): Promise<IProviderProfile> => {
	const existingProfile = await prisma.provider.findUnique({
		where: { userId },
		select: {
			id: true,
			userId: true,
			businessName: true,
			businessType: true,
			address: true,
			city: true,
			phone: true,
			isVerified: true,
			createdAt: true,
		},
	});

	if (existingProfile) {
		throw new Error("A provider profile already exists for this user");
	}

	const provider = await prisma.provider.create({
		data: {
			userId,
			businessName: payload.businessName,
			businessType: payload.businessType,
			address: payload.address,
			city: payload.city,
			phone: payload.phone,
		},
		select: {
			id: true,
			userId: true,
			businessName: true,
			businessType: true,
			address: true,
			city: true,
			phone: true,
			isVerified: true,
			createdAt: true,
		},
	});

	return toProviderProfile(provider);
};

export const ProviderService = {
	createProfile,
};