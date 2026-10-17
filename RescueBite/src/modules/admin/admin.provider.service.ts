import { prisma } from "../../lib/prisma";
import { Prisma } from "../../generated/prisma/client";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import type {
	IAdminProviderListItem,
	IAdminProviderListQuery,
	IAdminProviderListResult,
} from "./admin.provider.interface";

type ProviderWithUser = {
	id: string;
	userId: string;
	businessName: string;
	businessType: string;
	address: string;
	city: string;
	phone: string;
	isVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
	user: { name: string; email: string };
};

const toProviderListItem = (
	provider: ProviderWithUser,
): IAdminProviderListItem => ({
	id: provider.id,
	userId: provider.userId,
	businessName: provider.businessName,
	businessType: provider.businessType,
	address: provider.address,
	city: provider.city,
	phone: provider.phone,
	isVerified: provider.isVerified,
	userName: provider.user.name,
	userEmail: provider.user.email,
	createdAt: provider.createdAt.toISOString(),
	updatedAt: provider.updatedAt.toISOString(),
});

const PROVIDER_SELECT = {
	id: true,
	userId: true,
	businessName: true,
	businessType: true,
	address: true,
	city: true,
	phone: true,
	isVerified: true,
	createdAt: true,
	updatedAt: true,
	user: { select: { name: true, email: true } },
} as const;

const getProviders = async (
	query: IAdminProviderListQuery,
): Promise<IAdminProviderListResult> => {
	const { page, limit, searchTerm, verification } = query;
	const skip = (page - 1) * limit;

	const where: Prisma.ProviderWhereInput = {
		...(verification === "pending" ? { isVerified: false } : {}),
		...(verification === "verified" ? { isVerified: true } : {}),
		...(searchTerm
			? {
					OR: [
						{
							businessName: {
								contains: searchTerm,
								mode: Prisma.QueryMode.insensitive,
							},
						},
						{
							city: {
								contains: searchTerm,
								mode: Prisma.QueryMode.insensitive,
							},
						},
						{
							user: {
								is: {
									name: {
										contains: searchTerm,
										mode: Prisma.QueryMode.insensitive,
									},
								},
							},
						},
						{
							user: {
								is: {
									email: {
										contains: searchTerm,
										mode: Prisma.QueryMode.insensitive,
									},
								},
							},
						},
					],
				}
			: {}),
	};

	const [providers, total] = await prisma.$transaction([
		prisma.provider.findMany({
			where,
			select: PROVIDER_SELECT,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.provider.count({ where }),
	]);

	return {
		providers: providers.map(toProviderListItem),
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const updateVerification = async (
	providerId: string,
	isVerified: boolean,
): Promise<IAdminProviderListItem> => {
	const existing = await prisma.provider.findUnique({
		where: { id: providerId },
		select: PROVIDER_SELECT,
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "Provider profile not found");
	}

	const updated = await prisma.provider.update({
		where: { id: providerId },
		data: { isVerified },
		select: PROVIDER_SELECT,
	});

	return toProviderListItem(updated);
};

export const AdminProviderService = {
	getProviders,
	updateVerification,
};
