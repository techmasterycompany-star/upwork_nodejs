import z from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const jobIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});

export const rejectJobSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
  body: z.object({
    rejection_reason: z.string().trim().max(500),
  }),
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
    id: objectIdSchema("id"),
  }),
});

export type ListUsersQuery = z.infer<typeof listUsersSchema>["query"];
