import { Router } from "express";
import { approveJob, rejectJob } from "./admin.controller.js";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { readAllAdminJobs } from "../job/job.controller.js";
import { jobIdSchema } from "./admin.validation.js";

const adminrouter = Router();

adminrouter.get(
  "/reviewjobs",
  authMiddleware,
  authorize("admin"),
  readAllAdminJobs,
);

adminrouter.post(
  "/approve/:id",
  authMiddleware,
  authorize("admin"),
  validate(jobIdSchema),
  approveJob,
);
adminrouter.post(
  "/reject/:id",
  authMiddleware,
  authorize("admin"),
  validate(jobIdSchema),
  rejectJob,
);

export default adminrouter;
