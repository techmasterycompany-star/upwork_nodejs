import { Router } from "express";
import {
  authMiddleware,
  authorize,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  createNewSkill,
  deleteSkillById,
  readAllSkills,
  updateSkillById,
} from "./skill.controller.js";
import {
  createSkillSchema,
  skillIdSchema,
  updateSkillSchema,
} from "./skill.validation.js";

const skillRouter = Router();

skillRouter.get("/", authMiddleware, readAllSkills);

skillRouter.post(
  "/create",
  authMiddleware,
  authorize("admin"),
  validate(createSkillSchema),
  createNewSkill,
);

skillRouter.patch(
  "/update/:id",
  authMiddleware,
  authorize("admin"),
  validate(updateSkillSchema),
  updateSkillById,
);

skillRouter.delete(
  "/delete/:id",
  authMiddleware,
  authorize("admin"),
  validate(skillIdSchema),
  deleteSkillById,
);

export default skillRouter;