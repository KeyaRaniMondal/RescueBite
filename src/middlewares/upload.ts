import multer from "multer";
import { AppError } from "../utils/AppError";
import httpStatus from "http-status";

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