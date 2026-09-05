import { Router } from "express";
import { UserValidation } from "./auth.validation";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middlewares/validateRequest";

const router = Router();

router.post(
	"/register",
	validateRequest(UserValidation.CustomerRegistrationZodSchema),
	AuthController.registerCustomer,
);
router.post(
	"/verify-email",
	validateRequest(UserValidation.CustomerEmailVerifyZodSchema),
	AuthController.verifyCustomerEmail,
);
router.post(
	"/login",
	validateRequest(UserValidation.LoginZodSchema),
	AuthController.loginUser,
);
router.post(
	"/forgot-password",
	validateRequest(UserValidation.ForgotPasswordZodSchema),
	AuthController.forgotPassword,
);
router.post(
	"/reset-password",
	validateRequest(UserValidation.ResetPasswordZodSchema),
	AuthController.resetPassword,
);
router.post("/refresh-token", AuthController.refreshToken);
export const AuthRoutes = router;
