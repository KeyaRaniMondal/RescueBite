import type { Request, Response } from "express";
import httpStatus from "http-status";
import config from "../../config";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type {
	IPaymentCallbackPayload,
	IPaymentCallbackResult,
} from "./payment.interface";
import { PaymentService } from "./payment.service";

const toCallbackPayload = (req: Request): IPaymentCallbackPayload => {
	return { ...req.query, ...req.body } as IPaymentCallbackPayload;
};

const frontendBaseUrl = (): string => {
	const raw =
		typeof config.frontend_url === "string" && config.frontend_url.trim()
			? config.frontend_url.trim()
			: "http://localhost:3000";
	return raw.replace(/\/+$/, "");
};

const toResultRedirect = (
	page: "success" | "fail" | "cancel",
	result: IPaymentCallbackResult,
): string => {
	const params = new URLSearchParams();
	if (result.payment.tranId) params.set("tran_id", result.payment.tranId);
	if (result.payment.status)
		params.set("status", String(result.payment.status));
	const query = params.toString();
	return `${frontendBaseUrl()}/payment/${page}${query ? `?${query}` : ""}`;
};

const toErrorRedirect = (
	page: "success" | "fail" | "cancel",
	error: unknown,
): string => {
	const params = new URLSearchParams();
	const message =
		error instanceof Error ? error.message : "Payment callback failed";
	params.set("error", message);
	return `${frontendBaseUrl()}/payment/${page}?${params.toString()}`;
};

const success = async (req: Request, res: Response): Promise<void> => {
	try {
		const result = await PaymentService.handleSuccessCallback(
			toCallbackPayload(req),
		);
		res.redirect(toResultRedirect("success", result));
	} catch (error) {
		res.redirect(toErrorRedirect("fail", error));
	}
};

const fail = async (req: Request, res: Response): Promise<void> => {
	try {
		const result = await PaymentService.handleFailCallback(
			toCallbackPayload(req),
		);
		res.redirect(toResultRedirect("fail", result));
	} catch (error) {
		res.redirect(toErrorRedirect("fail", error));
	}
};

const cancel = async (req: Request, res: Response): Promise<void> => {
	try {
		const result = await PaymentService.handleCancelCallback(
			toCallbackPayload(req),
		);
		res.redirect(toResultRedirect("cancel", result));
	} catch (error) {
		res.redirect(toErrorRedirect("cancel", error));
	}
};

const ipn = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.handleIpnCallback(toCallbackPayload(req));

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "IPN processed successfully",
		data: result,
	});
});

export const PaymentController = {
	success,
	fail,
	cancel,
	ipn,
};
