import { Router } from "express";

import {
  approveJob,
  rejectJob,
  listUsers,
  suspendUser,
  activateUser,
  deleteUser,
} from "./admin.controller.js";

import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";

import { validate } from "../../middlewares/validate.middleware.js";

import {
  jobIdSchema,
  listUsersSchema,
  userIdParamSchema,
  rejectJobSchema,
} from "./admin.validation.js";

import { readAllAdminJobs } from "../job/job.controller.js";

const adminrouter = Router();

adminrouter.use(authMiddleware, authorize("admin"));

//Job Management

adminrouter.get("/reviewjobs", readAllAdminJobs);

adminrouter.post("/approve/:id", validate(jobIdSchema), approveJob);

adminrouter.post("/reject/:id", validate(rejectJobSchema), rejectJob);

// User Management

adminrouter.get("/users", validate(listUsersSchema), listUsers);

adminrouter.patch(
  "/users/:id/suspend",
  validate(userIdParamSchema),
  suspendUser,
);

adminrouter.patch(
  "/users/:id/activate",
  validate(userIdParamSchema),
  activateUser,
);

adminrouter.delete("/users/:id", validate(userIdParamSchema), deleteUser);

export default adminrouter;
