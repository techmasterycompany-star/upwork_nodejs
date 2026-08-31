import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { chatMessageSchema } from "./chatbot.validation.js";
import { sendMessage } from "./chatbot.controller.js";

const router = Router();

router.post(
  "/message",
  authMiddleware,
  validate(chatMessageSchema),
  sendMessage,
);

export default router;
