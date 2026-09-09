import { prisma } from "../../lib/prisma";
import { Role } from "../../generated/prisma/enums";
import { Prisma, type User } from "../../generated/prisma/client";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import type {
	IAdminUserListQuery,
	IAdminUserListResult,
	IAdminUserListItem,
	IUpdateUserRolePayload,
} from "./admin.user.interface";

const toUserListItem = (user: User): IAdminUserListItem => ({
	id: user.id,
	name: user.name,
	email: user.email,
	role: user.role,
	status: user.status,
	emailVerified: user.emailVerified,
	needPasswordChange: user.needPasswordChange,
	imageUrl: user.imageUrl,
	createdAt: user.createdAt.toISOString(),
	updatedAt: user.updatedAt.toISOString(),
});

const getUsers = async (
	query: IAdminUserListQuery,
): Promise<IAdminUserListResult> => {
	const { page, limit, searchTerm, role, status } = query;
	const skip = (page - 1) * limit;

	const where = {
		...(role ? { role } : {}),
		...(status ? { status } : {}),
		...(searchTerm
			? {
					OR: [
						{
							name: {
								contains: searchTerm,
								mode: Prisma.QueryMode.insensitive,
							},
						},
						{
							email: {
								contains: searchTerm,
								mode: Prisma.QueryMode.insensitive,
							},
						},
					],
				}
			: {}),
	};

	const [users, total] = await prisma.$transaction([
		prisma.user.findMany({
			where,
			skip,
			take: limit,
			orderBy: { createdAt: "desc" },
		}),
		prisma.user.count({ where }),
	]);

	return {
		users: users.map(toUserListItem),
		meta: {
			page,
			limit,
			total,
			totalPages: Math.ceil(total / limit),
		},
	};
};

const updateUserRole = async (
	userId: string,
	payload: IUpdateUserRolePayload,
): Promise<IAdminUserListItem> => {
	const existing = await prisma.user.findUnique({
		where: { id: userId },
	});

	if (!existing) {
		throw new AppError(httpStatus.NOT_FOUND, "User not found");
	}

	if (existing.role === Role.ADMIN && payload.role !== Role.ADMIN) {
		const adminCount = await prisma.user.count({
			where: { role: Role.ADMIN },
		});

		if (adminCount <= 1) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Cannot demote the last admin user",
			);
		}
	}

	const updated = await prisma.user.update({
		where: { id: userId },
		data: { role: payload.role },
	});

	return toUserListItem(updated);
};

export const AdminUserService = {
	getUsers,
	updateUserRole,
};
