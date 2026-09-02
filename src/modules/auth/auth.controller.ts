import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { IRequestUser } from "./auth.interface";
import { AuthService } from "./auth.service";

const registerReceiver = catchAsync(async (req: Request, res: Response) => {
	// const payload = PatientValidation.PatientRegistrationZodSchema.safeParse(req.body);

	// if(!payload.success){
	// 	console.log(payload.error);
	// 	console.log(payload.error.issues);

	// 	throw new Error(payload.error.issues[0].message)
	// }

	// console.log(payload);

	const payload = req.body;

	await AuthService.registerReceiver(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Verification OTP sent",
		data: null,
	});
});

const verifyPatientEmail = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;

	const result = await AuthService.verifyReceiverEmail(payload);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});


export const AuthController = {
	registerPReceiver,
	verifyPatientEmail,
	
};
