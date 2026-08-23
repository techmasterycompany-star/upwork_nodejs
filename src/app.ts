import express from "express";
import cookieParser from "cookie-parser";
import adminRoutes from "./modules/admin/adminRoutes.js";
import errorHandler from "./utils/errorHandler.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

import healthRoutes from "./modules/health/health.route.js";
import authRoutes from "./modules/auth/auth.route.js";

app.use("/api/health", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);
export default app;
