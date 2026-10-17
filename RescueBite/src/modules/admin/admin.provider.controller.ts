import type { Request, Response } from "express";
import httpStatus from "http-status";
import { AppError } from "../../utils/AppError";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AdminProviderService } from "./admin.provider.service";
import { AdminProviderValidation } from "./admin.provider.validation";
import type {
	IAdminProviderListQuery,
	IProviderVerificationFilter,
} from "./admin.provider.interface";

const getProviders = catchAsync(async (req: Request, res: Response) => {
	const parsed = AdminProviderValidation.ProviderListQuerySchema.safeParse(
		req.query,
	);

	if (!parsed.success) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			parsed.error.issues[0]?.message ?? "Invalid query parameters",
		);
	}

	const { page, limit, searchTerm, verification } = parsed.data;
	const query: IAdminProviderListQuery = {
		page: page ?? 1,
		limit: limit ?? 10,
		searchTerm,
		verification: verification as IProviderVerificationFilter | undefined,
	};

	const result = await AdminProviderService.getProviders(query);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Providers retrieved successfully",
		data: result.providers,
		meta: result.meta,
	});
});

const updateProviderVerification = catchAsync(
	async (req: Request, res: Response) => {
		const providerId = String(req.params.id);
		const payload = req.body as { isVerified: boolean };

		const updated = await AdminProviderService.updateVerification(
			providerId,
			payload.isVerified,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: payload.isVerified
				? "Provider verified successfully"
				: "Provider verification removed successfully",
			data: updated,
		});
	},
);

export const AdminProviderController = {
	getProviders,
	updateProviderVerification,
};
