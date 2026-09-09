import { Router } from "express";
import { authenticate } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserProfileController } from "./user.controller";
import { UserValidation } from "./user.validation";

const router = Router();

router.get("/me", authenticate, UserProfileController.getMyProfile);

router.patch(
	"/me",
	authenticate,
	validateRequest(UserValidation.UpdateProfileZodSchema),
	UserProfileController.updateMyProfile,
);

export const UserProfileRoutes = router;
