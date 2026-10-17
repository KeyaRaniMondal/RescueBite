import { Router } from "express";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../../generated/prisma/enums";
import { AdminProviderController } from "./admin.provider.controller";
import { AdminProviderValidation } from "./admin.provider.validation";

const router = Router();

router.get(
	"/",
	authenticate,
	authorizeRoles(Role.ADMIN),
	AdminProviderController.getProviders,
);

router.patch(
	"/:id/verification",
	authenticate,
	authorizeRoles(Role.ADMIN),
	validateRequest(AdminProviderValidation.UpdateProviderVerificationSchema),
	AdminProviderController.updateProviderVerification,
);

export const AdminProviderRoutes = router;
