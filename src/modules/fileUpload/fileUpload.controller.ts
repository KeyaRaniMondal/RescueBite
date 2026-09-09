import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { FileUploadService } from "./fileUpload.service";

const uploadSingle = catchAsync(async (req: Request, res: Response) => {
	const file = req.file;

	if (!file) {
		return sendResponse(res, {
			statusCode: httpStatus.BAD_REQUEST,
			success: false,
			message: "No file was uploaded. Expected a file field named 'file'",
			data: null,
		});
	}

	const result = await FileUploadService.uploadImage(file);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Image uploaded successfully",
		data: result,
	});
});

const uploadMultiple = catchAsync(async (req: Request, res: Response) => {
	const files = req.files as Express.Multer.File[] | undefined;

	if (!files?.length) {
		return sendResponse(res, {
			statusCode: httpStatus.BAD_REQUEST,
			success: false,
			message:
				"No files were uploaded. Expected files under field 'files'",
			data: null,
		});
	}

	const results = await FileUploadService.uploadImages(files);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Images uploaded successfully",
		data: results,
	});
});

const deleteImage = catchAsync(async (req: Request, res: Response) => {
	const publicId = String(req.params.publicId ?? "").replace(/,/g, "/");

	if (!publicId) {
		return sendResponse(res, {
			statusCode: httpStatus.BAD_REQUEST,
			success: false,
			message: "public_id is required in the URL path",
			data: null,
		});
	}

	await FileUploadService.deleteImage(publicId);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Image deleted successfully",
		data: null,
	});
});

export const FileUploadController = {
	uploadSingle,
	uploadMultiple,
	deleteImage,
};