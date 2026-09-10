import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import {
	handleUploadSingle,
	handleUploadMultiple,
	wrapMulter,
} from "../../middlewares/upload";
import type { NextFunction, Request, RequestHandler, Response } from "express";
import { FileUploadController } from "./fileUpload.controller";

const router = Router();

const wrapController =
	(handler: RequestHandler): RequestHandler =>
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			await handler(req, res, next);
		} catch (error) {
			next(error);
		}
	};

router.post(
	"/single",
	authenticate,
	wrapMulter(handleUploadSingle),
	wrapController(FileUploadController.uploadSingle),
);
router.post(
	"/multiple",
	authenticate,
	wrapMulter(handleUploadMultiple),
	wrapController(FileUploadController.uploadMultiple),
);
router.delete(
	"/*publicId",
	authenticate,
	wrapController(FileUploadController.deleteImage),
);

export const FileUploadRoutes = router;
