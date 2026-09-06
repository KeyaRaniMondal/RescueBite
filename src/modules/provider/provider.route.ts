import { Router } from "express";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { ProviderController } from "./provider.controller";

const router = Router();

router.post(
	"/",
	authenticate,
	authorizeRoles(Role.PROVIDER),
	ProviderController.createProviderProfile,
);

export const ProviderRoutes = router;