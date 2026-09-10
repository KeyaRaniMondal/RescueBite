import { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();

router.route("/success").get(PaymentController.success).post(PaymentController.success);
router.route("/fail").get(PaymentController.fail).post(PaymentController.fail);
router.route("/cancel").get(PaymentController.cancel).post(PaymentController.cancel);
router.route("/ipn").get(PaymentController.ipn).post(PaymentController.ipn);

export const PaymentRoutes = router;
