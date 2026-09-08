import { v2 as cloudinary } from "cloudinary";
import config from "../config";

cloudinary.config({
	cloud_name: config.cloudinary_cloud_name,
	api_key: config.cloudinary_api_key,
	api_secret: config.cloudinary_api_secret,
});

export interface ICloudinaryUploadResult {
	url: string;
	secureUrl: string;
	publicId: string;
}

const uploadBuffer = (
	buffer: Buffer,
	options: {
		folder?: string;
		publicId?: string;
		resourceType?: "image" | "raw" | "video";
	},
): Promise<ICloudinaryUploadResult> =>
	new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: options.folder,
				public_id: options.publicId,
				resource_type: options.resourceType ?? "image",
			},
			(error, result) => {
				if (error || !result) {
					reject(
						error instanceof Error
							? error
							: new Error(
									JSON.stringify(error ?? { http_code: 522, message: "Cloudinary upload failed" }),
								),
					);
					return;
				}

				resolve({
					url: result.url,
					secureUrl: result.secure_url,
					publicId: result.public_id,
				});
			},
		);

		uploadStream.end(buffer);
	});

const destroyByPublicId = (publicId: string): Promise<boolean> =>
	new Promise((resolve, reject) => {
		cloudinary.uploader.destroy(publicId, (error, result) => {
			if (error) {
				reject(error);
				return;
			}

			resolve(result.result === "ok");
		});
	});

export const cloudinaryUtils = {
	uploadBuffer,
	destroyByPublicId,
};