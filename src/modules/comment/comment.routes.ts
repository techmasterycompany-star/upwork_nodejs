import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  listCommentsByJob,
  createComment,
  updateComment,
  deleteComment,
  reportComment,
  adminListComments,
  adminHideComment,
  adminUnhideComment,
  adminRemoveComment,
} from "./comment.controller.js";

import {
  commentBodySchema,
  reportBodySchema,
  jobIdParamSchema,
  commentIdParamSchema,
} from "./comment.validate.js";

const router = Router();

// User routes
router.get("/admin", authMiddleware, authorize("admin"), adminListComments);

router.get(
  "/:jobId",
  authMiddleware,
  validate(jobIdParamSchema),
  listCommentsByJob,
);

router.post(
  "/:jobId",
  authMiddleware,
  validate(jobIdParamSchema),
  validate(commentBodySchema),
  createComment,
);

router.patch(
  "/:id",
  authMiddleware,
  validate(commentIdParamSchema),
  validate(commentBodySchema),
  updateComment,
);

router.delete(
  "/:id",
  authMiddleware,
  validate(commentIdParamSchema),
  deleteComment,
);

router.post(
  "/:id/report",
  authMiddleware,
  validate(commentIdParamSchema),
  validate(reportBodySchema),
  reportComment,
);

// Admin routes

router.patch(
  "/admin/:id/hide",
  authMiddleware,
  authorize("admin"),
  validate(commentIdParamSchema),
  adminHideComment,
);

router.patch(
  "/admin/:id/unhide",
  authMiddleware,
  authorize("admin"),
  validate(commentIdParamSchema),
  adminUnhideComment,
);

router.delete(
  "/admin/:id",
  authMiddleware,
  authorize("admin"),
  validate(commentIdParamSchema),
  adminRemoveComment,
);

export default router;
