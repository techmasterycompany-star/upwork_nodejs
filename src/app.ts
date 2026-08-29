import express from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./utils/errorHandler.js";

const app = express();

import webhookRouter from "./modules/webhook/webhook.route.js";
app.use("/api/webhooks", webhookRouter);

app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));
import notificationRouter from "./modules/notification/notification.route.js";
import applicationRouter from "./modules/application/application.route.js";
import healthRoutes from "./modules/health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import employerRouter from "./modules/employer/employer.route.js";
import jobRouter from "./modules/job/jobRouter.js";
import technologiesRouter from "./modules/technology/technology.router.js";
import adminrouter from "./modules/admin/admin.route.js";
import subscriptionRouter from "./modules/subscription/subscription.route.js";
import candidateRouter from './modules/candidate/candidate.route.js';
import searchRouter from "./modules/search/search.route.js";

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/technologies", technologiesRouter);
app.use("/api/admin", adminrouter);
app.use("/api/subscriptions", subscriptionRouter);
app.use("/api/application", applicationRouter);
app.use("/api/notifications", notificationRouter);
app.use('/api/candidate', candidateRouter);
app.use("/api/search", searchRouter);

app.use(errorHandler);
export default app;
