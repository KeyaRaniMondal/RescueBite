import { Router } from "express";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { Role } from "../../generated/prisma/enums";
import { AdminUserController } from "./admin.user.controller";
import { AdminUserValidation } from "./admin.user.validation";

const router = Router();

router.get(
	"/",
	authenticate,
	authorizeRoles(Role.ADMIN),
	AdminUserController.getUsers,
);

router.patch(
	"/:id/role",
	authenticate,
	authorizeRoles(Role.ADMIN),
	validateRequest(AdminUserValidation.UpdateUserRoleSchema),
	AdminUserController.updateUserRole,
);

export const AdminUserRoutes = router;