import { z } from "zod";

export const searchJobsSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    location: z.string().optional(),
    category_id: z.string().optional(),
    work_type: z.enum(["remote", "onsite", "hybrid"]).optional(),
    salary_min: z.coerce.number().min(0).optional(),
    salary_max: z.coerce.number().min(0).optional(),
    experience_level: z
      .enum(["entry", "junior", "mid", "senior", "lead"])
      .optional(),
    date_posted: z.coerce.number().min(1).optional(),
    sort_by: z.enum(["created_at", "salary"]).default("created_at"),
    order: z.enum(["asc", "desc"]).default("desc"),
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
  }),
});

export const saveSearchSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Search name is required"),
    filters: z
      .record(z.string(), z.any())
      .refine((val) => Object.keys(val).length > 0, {
        message: "Filters cannot be empty",
      }),
  }),
});

export type SearchJobsQuery = z.infer<typeof searchJobsSchema>["query"];
export type SaveSearchBody = z.infer<typeof saveSearchSchema>["body"];
