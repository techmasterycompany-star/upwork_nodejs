import { Router } from "express";
import {
  getProfile,
  updateProfile,
  updateSkills,
  uploadResume,
} from "./candidate.controller.js";
import { authMiddleware } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  updateCandidateProfileSchema,
  updateSkillsSchema,
} from "./candidate.validation.js";
import { upload } from "../../middlewares/upload.middleware.js";

const router = Router();

router.use(authMiddleware);

router.get("/profile", getProfile);
router.put("/profile", validate(updateCandidateProfileSchema), updateProfile);
router.put("/skills", validate(updateSkillsSchema), updateSkills);
router.post("/resume", upload.single("resume"), uploadResume);

export default router;
