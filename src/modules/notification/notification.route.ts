import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { notificationIdSchema } from "./notification.validation.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "./notification.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/my", getMyNotifications);
router.patch("/read-all", markAllAsRead);
router.patch("/:id/read", validate(notificationIdSchema), markAsRead);

export default router;
