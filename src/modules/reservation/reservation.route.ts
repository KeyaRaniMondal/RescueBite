import { Router } from "express";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { Role } from "../../generated/prisma/enums";
import { ReservationController } from "./reservation.controller";

const router = Router();

router.post(
	"/",
	authenticate,
	authorizeRoles(Role.RECEIVER),
	ReservationController.reserveFood,
);

router.get(
	"/my",
	authenticate,
	authorizeRoles(Role.RECEIVER),
	ReservationController.getMyReservations,
);

router.get(
	"/:id",
	authenticate,
	authorizeRoles(Role.RECEIVER),
	ReservationController.getReservation,
);

router.patch(
	"/:id/cancel",
	authenticate,
	authorizeRoles(Role.RECEIVER),
	ReservationController.cancelReservation,
);

export const ReservationRoutes = router;
