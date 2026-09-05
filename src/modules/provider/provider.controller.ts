import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { AppError } from "../../utils/AppError";
import { sendResponse } from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";
import { ProviderValidation } from "./provider.validation";
import type { ICreateProviderPayload } from "./provider.interface";

const createProviderProfile = catchAsync(
	async (req: Request, res: Response) => {
		const parsed = ProviderValidation.CreateProviderZodSchema.safeParse(
			req.body,
		);

		if (!parsed.success) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				parsed.error.issues[0]?.message ?? "Invalid input",
			);
		}

		const userId = req.user?.userId;

		if (!userId) {
			throw new Error("Authentication required");
		}

		const provider = await ProviderService.createProfile(
			userId,
			parsed.data as ICreateProviderPayload,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Provider profile created successfully",
			data: provider,
		});
	},
);

export const ProviderController = {
	createProviderProfile,
};