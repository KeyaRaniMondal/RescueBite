import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { DashboardService } from "./admin.dashboard.service";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
	const stats = await DashboardService.getDashboardStats();

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Dashboard statistics retrieved successfully",
		data: stats,
	});
});

export const DashboardController = {
	getDashboardStats,
};