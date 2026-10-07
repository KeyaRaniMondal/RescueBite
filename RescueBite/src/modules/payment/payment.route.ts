import { Router } from "express";
import { Role } from "../../generated/prisma/enums";
import { authenticate, authorizeRoles } from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";

const router = Router();

router.get(
	"/my",
	authenticate,
	authorizeRoles(Role.RECEIVER),
	PaymentController.getMyPayments,
);

router
	.route("/success")
	.get(PaymentController.success)
	.post(PaymentController.success);
router.route("/fail").get(PaymentController.fail).post(PaymentController.fail);
router
	.route("/cancel")
	.get(PaymentController.cancel)
	.post(PaymentController.cancel);
router.route("/ipn").get(PaymentController.ipn).post(PaymentController.ipn);

export const PaymentRoutes = router;
