import express from "express";
import * as adminController from "./adminController.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { listUsersSchema, userIdParamSchema } from "./admin.validation.js";
import { authMiddleware, authorize } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware, authorize("admin"));

router.get("/users", validate(listUsersSchema), adminController.listUsers);
router.patch(
  "/users/:id/suspend",
  validate(userIdParamSchema),
  adminController.suspendUser,
);
router.patch(
  "/users/:id/activate",
  validate(userIdParamSchema),
  adminController.activateUser,
);
router.delete(
  "/users/:id",
  validate(userIdParamSchema),
  adminController.deleteUser,
);

export default router;