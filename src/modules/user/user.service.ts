import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import type { IUpdateUserProfilePayload, IUserProfile } from "./user.interface";

const toUserProfile = (user: {
	id: string;
	name: string;
	email: string;
	role: string;
	status: string;
	emailVerified: boolean;
	needPasswordChange: boolean;
	imageUrl: string;
	imagePublicId: string;
	createdAt: Date;
	updatedAt: Date;
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
}): IUserProfile => ({
	id: user.id,
	name: user.name,
	email: user.email,
	role: user.role as IUserProfile["role"],
	status: user.status as IUserProfile["status"],
	emailVerified: user.emailVerified,
	needPasswordChange: user.needPasswordChange,
	imageUrl: user.imageUrl,
	imagePublicId: user.imagePublicId,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
	customer: user.customer
		? { id: user.customer.id, contactNumber: user.customer.contactNumber }
		: null,
	provider: user.provider
		? {
				id: user.provider.id,
				businessName: user.provider.businessName,
				businessType: user.provider.businessType,
				address: user.provider.address,
				city: user.provider.city,
				phone: user.provider.phone,
				isVerified: user.provider.isVerified,
			}
		: null,
});

const getMyProfile = async (userId: string): Promise<IUserProfile> => {
	const user = await prisma.user.findFirst({
		where: { id: userId, isDeleted: false },
		include: {
			customer: { select: { id: true, contactNumber: true } },
			provider: {
				select: {
					id: true,
					businessName: true,
					businessType: true,
					address: true,
					city: true,
					phone: true,
					isVerified: true,
				},
			},
		},
	});

	if (!user) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	return toUserProfile(user);
};

const updateMyProfile = async (
	userId: string,
	payload: IUpdateUserProfilePayload,
): Promise<IUserProfile> => {
	const existing = await prisma.user.findFirst({
		where: { id: userId, isDeleted: false },
		select: { id: true },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	const updateData = {
		...(payload.name ? { name: payload.name } : {}),
		...(payload.imageUrl !== undefined ? { imageUrl: payload.imageUrl } : {}),
		...(payload.imagePublicId !== undefined
			? { imagePublicId: payload.imagePublicId }
			: {}),
	};

	await prisma.$transaction([
		prisma.user.update({
			where: { id: userId },
			data: updateData,
		}),
		prisma.customer.updateMany({
			where: { userId },
			data: {
				...(payload.name ? { name: payload.name } : {}),
				...(payload.contactNumber !== undefined
					? { contactNumber: payload.contactNumber }
					: {}),
			},
		}),
	]);

	return getMyProfile(userId);
};

export const UserProfileService = {
	getMyProfile,
	updateMyProfile,
};
