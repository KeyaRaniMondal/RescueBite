import { Router } from "express";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { DashboardController } from "./admin.dashboard.controller";

const router = Router();

router.get(
	"/dashboard",
	authenticate,
	authorizeRoles(Role.ADMIN),
	DashboardController.getDashboardStats,
);

export const AdminRoutes = router;