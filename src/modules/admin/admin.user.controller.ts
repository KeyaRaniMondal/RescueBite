import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminUserService } from "./admin.user.service";
import { AdminUserValidation } from "./admin.user.validation";
import type {
	IAdminUserListQuery,
	IUpdateUserRolePayload,
} from "./admin.user.interface";

const getUsers = catchAsync(async (req: Request, res: Response) => {
	const parsed = AdminUserValidation.UserListQuerySchema.safeParse(req.query);

	if (!parsed.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			parsed.error.issues[0]?.message ?? "Invalid query parameters",
		);
	}

	const { page, limit } = parsed.data;
	const query: IAdminUserListQuery = {
		page: page ?? 1,
		limit: limit ?? 10,
		searchTerm: parsed.data.searchTerm,
		role: parsed.data.role,
		status: parsed.data.status,
	};

	const result = await AdminUserService.getUsers(query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Users retrieved successfully",
		data: result.users,
		meta: result.meta,
	});
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
	const userId = String(req.params.id);
	const payload = req.body as IUpdateUserRolePayload;

	const updated = await AdminUserService.updateUserRole(userId, payload);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User role updated successfully",
		data: updated,
	});
});

export const AdminUserController = {
	getUsers,
	updateUserRole,
};
