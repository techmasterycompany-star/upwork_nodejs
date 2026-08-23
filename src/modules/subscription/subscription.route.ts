import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { checkoutSchema } from "./subscription.validation.js";
import {
  checkout,
  getPlans,
  getCurrentSubscription,
  cancelActiveSubscription,
  getPayments,
} from "./subscription.controller.js";

const router = Router();

router.get("/plans", getPlans);

router.get(
  "/current",
  authMiddleware,
  authorize("employer"),
  getCurrentSubscription,
);

router.post(
  "/checkout",
  authMiddleware,
  authorize("employer"),
  validate(checkoutSchema),
  checkout,
);

router.post(
  "/cancel",
  authMiddleware,
  authorize("employer"),
  cancelActiveSubscription,
);

router.get("/payments", authMiddleware, authorize("employer"), getPayments);

export default router;
