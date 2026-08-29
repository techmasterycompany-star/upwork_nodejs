import { z } from "zod";
import { objectIdSchema, phoneRegex } from "../../utils/validation.utils.js";

export const applyJobSchema = z.object({
  params: z.object({
    jobId: objectIdSchema("jobId"),
  }),
  body: z.object({
    resume_text: z
      .string()
      .trim()
      .min(1, "Resume text cannot be empty")
      .max(10000, "Resume text cannot exceed 10000 characters")
      .optional(),
    cover_letter: z
      .string()
      .trim()
      .max(3000, "Cover letter cannot exceed 3000 characters")
      .optional(),
    message: z
      .string()
      .trim()
      .max(1000, "Message cannot exceed 1000 characters")
      .optional(),
    contact_email: z
      .string({ error: "Contact email is required" })
      .trim()
      .toLowerCase()
      .email("Invalid email address"),
    contact_phone: z
      .string({ error: "Contact phone is required" })
      .regex(phoneRegex, "Invalid phone number"),
  }),
});

export const applicationIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});

export const jobApplicationsParamsSchema = z.object({
  params: z.object({
    jobId: objectIdSchema("jobId"),
  }),
});

export const updateApplicationStatusSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
  body: z
    .object({
      status: z.enum(["accepted", "rejected"], {
        error: "Status must be 'accepted' or 'rejected'",
      }),
      rejection_reason: z.string().trim().max(500).optional(),
    })
    .refine((data) => data.status !== "rejected" || !!data.rejection_reason, {
      message: "rejection_reason is required when rejecting an application",
      path: ["rejection_reason"],
    }),
});

export const generateCoverLetterSchema = z.object({
  params: z.object({
    jobId: objectIdSchema("jobId"),
  }),
  body: z.object({
    resume_text: z
      .string({ error: "Resume text is required" })
      .trim()
      .min(
        50,
        "Resume text must be at least 50 characters for a meaningful cover letter",
      )
      .max(10000, "Resume text cannot exceed 10000 characters"),
  }),
});

export type ApplyJobInput = z.infer<typeof applyJobSchema>["body"];
export type UpdateApplicationStatusInput = z.infer<
  typeof updateApplicationStatusSchema
>["body"];
