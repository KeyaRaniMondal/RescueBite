import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserProfileService } from "./user.service";

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId;

	if (!userId) {
		return sendResponse(res, {
			statusCode: httpStatus.UNAUTHORIZED,
			success: false,
			message: "Authentication required",
			data: null,
		});
	}

	const profile = await UserProfileService.getMyProfile(userId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile retrieved successfully",
		data: profile,
	});
});

const updateMyProfile = catchAsync(async (req: Request, res: Response) => {
	const userId = req.user?.userId;

	if (!userId) {
		return sendResponse(res, {
			statusCode: httpStatus.UNAUTHORIZED,
			success: false,
			message: "Authentication required",
			data: null,
		});
	}

	const profile = await UserProfileService.updateMyProfile(userId, req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile updated successfully",
		data: profile,
	});
});

export const UserProfileController = {
	getMyProfile,
	updateMyProfile,
};
