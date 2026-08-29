import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const createSkillSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Skill name is required"),
  }),
});

export const skillIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});

export const updateSkillSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "Skill name is required"),
  }),
});
