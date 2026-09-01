import express from "express";
import * as authController from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  refreshTokenSchema,
  registerSchema,
  loginSchema,
} from "./auth.validation.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/logout", authMiddleware, authController.logout);
router.post("/refresh", validate(refreshTokenSchema), authController.refreshToken);
router.get("/me", authMiddleware, authController.me);

export default router;