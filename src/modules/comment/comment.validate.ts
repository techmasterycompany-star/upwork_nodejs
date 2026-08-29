import z from "zod";
import mongoose from "mongoose";

const objectId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid id",
  });

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
    jobId: objectId,
  }),
});

export const commentIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});