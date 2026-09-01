import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { upload } from "../../middlewares/upload.middleware.js";
import {
  applyJobSchema,
  applicationIdSchema,
  jobApplicationsParamsSchema,
  updateApplicationStatusSchema,
  generateCoverLetterSchema,
} from "./application.validation.js";
import {
  applyToJob,
  getMyApplications,
  getApplicationsForJob,
  getApplicationById,
  updateApplicationStatus,
  cancelApplication,
  generateCoverLetter,
} from "./application.controller.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/:jobId",
  authorize("candidate"),
  upload.single("resume"),
  validate(applyJobSchema),
  applyToJob,
);

router.get("/my", authorize("candidate"), getMyApplications);

router.post(
  "/cover-letter/:jobId",
  authorize("candidate"),
  validate(generateCoverLetterSchema),
  generateCoverLetter,
);

router.delete(
  "/:id",
  authorize("candidate"),
  validate(applicationIdSchema),
  cancelApplication,
);

router.get(
  "/job/:jobId",
  authorize("employer"),
  validate(jobApplicationsParamsSchema),
  getApplicationsForJob,
);

router.patch(
  "/:id/status",
  authorize("employer"),
  validate(updateApplicationStatusSchema),
  updateApplicationStatus,
);

router.get("/:id", validate(applicationIdSchema), getApplicationById);

export default router;
