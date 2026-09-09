import type { Role, UserStatus } from "../../generated/prisma/enums";

export interface IAdminUserListItem {
	id: string;
	name: string;
	email: string;
	role: Role;
	status: UserStatus;
	emailVerified: boolean;
	needPasswordChange: boolean;
	imageUrl: string;
	createdAt: string;
	updatedAt: string;
}

export interface IAdminUserListQuery {
	page: number;
	limit: number;
	searchTerm?: string;
	role?: Role;
	status?: UserStatus;
}

export interface IAdminUserListResult {
	users: IAdminUserListItem[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export interface IUpdateUserRolePayload {
	role: Role;
}