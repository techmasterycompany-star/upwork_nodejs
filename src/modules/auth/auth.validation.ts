import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

const employerProfileBody = z
  .object({
    company_name: z
      .string({ error: "Company name is required" })
      .trim()
      .min(1, "Company name is required"),
    description: z
      .string()
      .trim()
      .max(2000, "Description cannot exceed 2000 characters")
      .optional(),
    industry: z.string().trim().optional(),
    website: z.string().trim().optional(),
  })
  .strict();

const candidateSkillBody = z
  .object({
    skill_id: objectIdSchema("skill_id"),
  })
  .strict();

const candidateProfileBody = z
  .object({
    headline: z.string().trim().optional(),
    bio: z
      .string()
      .trim()
      .max(2000, "Bio cannot exceed 2000 characters")
      .optional(),
    location: z.string().trim().optional(),
    portfolio_url: z.string().trim().optional(),
    skills: z.array(candidateSkillBody).optional().default([]),
    experience_level: z
      .enum(["entry", "junior", "mid", "senior", "lead"])
      .default("entry"),
  })
  .strict();

const employerBody = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters"),
    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
    password: z
      .string({ error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    role: z.literal("employer"),
    employerProfile: employerProfileBody,
  })
  .strict();

const candidateBody = z
  .object({
    name: z
      .string({ error: "Name is required" })
      .trim()
      .min(3, "Name must be at least 3 characters"),
    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
    password: z
      .string({ error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
    role: z.literal("candidate"),
    candidateProfile: candidateProfileBody,
  })
  .strict();

export const registerSchema = z.object({
  body: z.discriminatedUnion("role", [employerBody, candidateBody]),
});

export const loginSchema = z.object({
  body: z.object({
    email: z
      .string({ error: "Email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
    password: z
      .string({ error: "Password is required" })
      .min(6, "Password must be at least 6 characters"),
  }),
});

export const refreshTokenSchema = z.object({
  cookies: z.object({
    refreshToken: z
      .string({ error: "Refresh token is required" })
      .min(10, "Invalid refresh token")
      .max(100, "Invalid refresh token"),
  }),
});

export type RegisterInput = z.infer<typeof registerSchema>["body"];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>["cookies"];
