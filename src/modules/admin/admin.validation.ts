import z from "zod";
import mongoose from "mongoose";

export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Job ID is required"),
  }),
});

const objectId = z
  .string()
  .refine((id) => mongoose.Types.ObjectId.isValid(id), {
    message: "Invalid user id",
  });

export const listUsersSchema = z.object({
  query: z.object({
    role: z.enum(["admin", "employer", "candidate"]).optional(),

    is_blocked: z
      .enum(["true", "false"])
      .optional()
      .transform((v) => (v === undefined ? undefined : v === "true")),

    search: z.string().trim().min(1).max(100).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
});

export const userIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];