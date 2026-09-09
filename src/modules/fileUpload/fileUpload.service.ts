import {
	cloudinaryUtils,
	ICloudinaryUploadResult,
} from "../../lib/cloudinary";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const UPLOAD_FOLDER = "rescue-bite";

const uploadImage = async (
	file: Express.Multer.File,
): Promise<ICloudinaryUploadResult> => {
	if (!file?.buffer) {
		throw new AppError(httpStatus.BAD_REQUEST, "No file was uploaded");
	}

	try {
		return await cloudinaryUtils.uploadBuffer(file.buffer, {
			folder: UPLOAD_FOLDER,
		});
	} catch (error) {
		const message =
			error instanceof Error
				? error.message
				: typeof error === "object" && error !== null && "message" in error
					? String((error as { message: unknown }).message)
					: "Unknown error";

		throw new AppError(httpStatus.BAD_GATEWAY, `Cloudinary upload failed: ${message}`);
	}
};

const uploadImages = async (
	files: Express.Multer.File[],
): Promise<ICloudinaryUploadResult[]> => {
	if (!files?.length) {
		throw new AppError(httpStatus.BAD_REQUEST, "No files were uploaded");
	}

	return Promise.all(files.map(uploadImage));
};

const deleteImage = async (publicId: string): Promise<void> => {
	if (!publicId) {
		throw new AppError(httpStatus.BAD_REQUEST, "public_id is required");
	}

	const deleted = await cloudinaryUtils.destroyByPublicId(publicId);

	if (!deleted) {
		throw new AppError(
			httpStatus.NOT_FOUND,
			`Image not found for public_id ${publicId}`,
		);
	}
};

export const FileUploadService = {
	uploadImage,
	uploadImages,
	deleteImage,
};