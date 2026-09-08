import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { PaymentService } from "./payment.service";
import type { IPaymentCallbackPayload } from "./payment.interface";

const success = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.handleSuccessCallback(
		req.body as IPaymentCallbackPayload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment confirmed successfully",
		data: result,
	});
});

const fail = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.handleFailCallback(
		req.body as IPaymentCallbackPayload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment recorded as failed",
		data: result,
	});
});

const cancel = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.handleCancelCallback(
		req.body as IPaymentCallbackPayload,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Payment recorded as cancelled",
		data: result,
	});
});

const ipn = catchAsync(async (req: Request, res: Response) => {
	const result = await PaymentService.handleIpnCallback(
		req.body as IPaymentCallbackPayload,
	);

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
