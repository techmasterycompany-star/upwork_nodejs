import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createJobSchema,
  jobIdSchema,
  updateJobSchema,
} from "./Job.Validation.js";
import {
  createNewJob,
  readAllJobs,
  reademployeeJobs,
  updateJobs,
  deleteJob,
  closeJobs,
  readJob,
} from "./job.controller.js";

const jobRouter = Router();

jobRouter.get("/", authMiddleware, readAllJobs);

jobRouter.get(
  "/employeeJobs",
  authMiddleware,
  authorize("employer"),
  reademployeeJobs,
);
jobRouter.get(
  "/:id",
  authMiddleware,
  authorize("employer"),
  validate(jobIdSchema),
  readJob,
);

jobRouter.post(
  "/create",
  authMiddleware,
  authorize("employer"),
  validate(createJobSchema),
  createNewJob,
);

jobRouter.patch(
  "/update/:id",
  authMiddleware,
  authorize("employer"),
  validate(jobIdSchema),
  validate(updateJobSchema),
  updateJobs,
);
jobRouter.patch(
  "/close/:id",
  authMiddleware,
  authorize("employer"),
  validate(jobIdSchema),
  closeJobs,
);

jobRouter.delete(
  "/delete/:id",
  authMiddleware,
  authorize("employer"),
  deleteJob,
);

export default jobRouter;
