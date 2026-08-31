import z from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const commentBodySchema = z.object({
  body: z.object({
    content: z.string().trim().min(1).max(1000),
  }),
});

export const reportBodySchema = z.object({
  body: z.object({
    reason: z.string().trim().optional(),
  }),
});

export const jobIdParamSchema = z.object({
  params: z.object({
    jobId: objectIdSchema("jobId"),
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});
