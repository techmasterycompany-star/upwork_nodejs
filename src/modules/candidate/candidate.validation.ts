import { z } from "zod";

export const updateCandidateProfileSchema = z.object({
  body: z.object({
    headline: z.string().optional().nullable(),
    bio: z
      .string()
      .max(2000, "Bio cannot exceed 2000 characters")
      .optional()
      .nullable(),
    location: z.string().optional().nullable(),
    portfolio_url: z.string().url("Must be a valid URL").optional().nullable(),
    experience_level: z
      .enum(["entry", "junior", "mid", "senior", "lead"])
      .optional(),
  }),
});

export const updateSkillsSchema = z.object({
  body: z.object({
    skills: z
      .array(
        z.object({
          name: z.string().min(1, "Skill name is required"),
        }),
      )
      .min(1, "At least one skill required"),
  }),
});

export type UpdateCandidateProfileBody = z.infer<
  typeof updateCandidateProfileSchema
>["body"];
export type UpdateSkillsBody = z.infer<typeof updateSkillsSchema>["body"];
