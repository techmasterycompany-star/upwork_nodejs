import { Router } from "express";
import express from "express";
import { stripeWebhook } from "./webhook.controller.js";

const router = Router();

router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

export default router;
