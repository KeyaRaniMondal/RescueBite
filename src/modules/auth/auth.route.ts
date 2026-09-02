import { Router } from "express";
import { AuthController } from "./auth.controller";
import { UserValidation } from "./authValidation";

const router = Router();

router.post(
	"/register",
	validateRequest(UserValidation.PatientRegistrationZodSchema),
	AuthController.registerReceiver,
);


export const AuthRoutes = router;
