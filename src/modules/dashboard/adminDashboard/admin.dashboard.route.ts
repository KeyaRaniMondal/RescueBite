import { Router } from "express";
import { authenticate, authorizeRoles } from "../../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { DashboardController } from "./admin.dashboard.controller";
import { AdminUserRoutes } from "../../admin/admin.user.route";

const router = Router();

router.get(
	"/dashboard",
	authenticate,
	authorizeRoles(Role.ADMIN),
	DashboardController.getDashboardStats,
);

router.use("/users", AdminUserRoutes);

export const AdminRoutes = router;
