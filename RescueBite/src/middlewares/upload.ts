import multer from "multer";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { FileUploadService } from "../modules/fileUpload/fileUpload.service";

const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/gif",
	"image/avif",
	"image/svg+xml",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.memoryStorage();

const fileFilter: multer.Options["fileFilter"] = (req, file, cb) => {
	if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
		cb(
			new AppError(
				httpStatus.BAD_REQUEST,
				"Only image files (JPEG, PNG, WEBP, GIF, AVIF, SVG) are allowed",
			),
		);
		return;
	}

	cb(null, true);
};

const upload = multer({
	storage,
	limits: {
		fileSize: MAX_FILE_SIZE,
		files: 5,
	},
	fileFilter,
});

export const handleUploadSingle = upload.single("file");
export const handleUploadMultiple = upload.array("files", 5);

export const mapMulterError = (error: unknown): Error => {
	if (error instanceof multer.MulterError) {
		const message =
			error.code === "LIMIT_FILE_SIZE"
				? "File exceeds the maximum allowed size of 5MB"
				: error.message;

		return new AppError(httpStatus.BAD_REQUEST, message);
	}

	return error instanceof Error ? error : new Error("File upload failed");
};

export const wrapMulter =
	(handler: RequestHandler): RequestHandler =>
	(req: Request, res: Response, next: NextFunction) => {
		handler(req, res, (error?: unknown) => {
			if (error) {
				next(mapMulterError(error));
				return;
			}
			next();
		});
	};

export const bindSingleUploadToBody = (): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction) => {
		if (!req.file) {
			next();
			return;
		}

		FileUploadService.uploadImage(req.file)
			.then((result) => {
				req.body = {
					...req.body,
					imageUrl: result.secureUrl,
					imagePublicId: result.publicId,
				};
				next();
			})
			.catch(next);
	};
};

export const bindMultipleUploadToBody = (): RequestHandler => {
	return (req: Request, res: Response, next: NextFunction) => {
		const files = req.files as Express.Multer.File[] | undefined;

		const parseExistingImages = (raw: unknown): string[] => {
			if (raw === undefined || raw === null) return [];
			if (Array.isArray(raw)) {
				const out: string[] = [];
				for (const item of raw) {
					if (typeof item !== "string") continue;
					const trimmed = item.trim();
					if (!trimmed) continue;
					if (trimmed.startsWith("[")) {
						try {
							const parsed: unknown = JSON.parse(trimmed);
							if (Array.isArray(parsed)) {
								for (const url of parsed) {
									if (typeof url === "string" && url.trim()) {
										out.push(url.trim());
									}
								}
								continue;
							}
						} catch {
							// fall through to treat as a single url
						}
					}
					out.push(trimmed);
				}
				return out;
			}
			if (typeof raw === "string") {
				const trimmed = raw.trim();
				if (!trimmed) return [];
				try {
					const parsed: unknown = JSON.parse(trimmed);
					if (Array.isArray(parsed)) {
						return parsed.filter(
							(url): url is string =>
								typeof url === "string" && url.trim().length > 0,
						);
					}
					if (typeof parsed === "string" && parsed.trim()) {
						return [parsed.trim()];
					}
				} catch {
					// plain URL string, not JSON
				}
				return [trimmed];
			}
			return [];
		};

		// Support both `images` and `images[]` field names from FormData.
		const existingImages = [
			...parseExistingImages(req.body?.images),
			...parseExistingImages(req.body?.["images[]"]),
		];

		if (!files?.length) {
			// Normalize so downstream zod validation always sees an array.
			if (existingImages.length > 0) {
				req.body = { ...req.body, images: existingImages };
			}
			next();
			return;
		}

		FileUploadService.uploadImages(files)
			.then((results) => {
				const uploaded = results.map((result) => result.secureUrl);
				req.body = {
					...req.body,
					images: [...existingImages, ...uploaded].slice(0, 5),
				};
				next();
			})
			.catch(next);
	};
};
