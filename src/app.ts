import express from "express";
import cookieParser from "cookie-parser";

import errorHandler from "./utils/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

import healthRoutes from "./modules/health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";
import employerRouter from "./modules/employer/employer.route.js";
import jobRouter from "./modules/job/jobRouter.js";
import technologiesRouter from "./modules/technology/technology.router.js";

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/employer", employerRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/technologies", technologiesRouter);

app.use(errorHandler);
export default app;
