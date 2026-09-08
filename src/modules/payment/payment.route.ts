import { Router } from "express";
import { PaymentController } from "./payment.controller";

const router = Router();

router.post("/success", PaymentController.success);
router.post("/fail", PaymentController.fail);
router.post("/cancel", PaymentController.cancel);
router.post("/ipn", PaymentController.ipn);

export const PaymentRoutes = router;
