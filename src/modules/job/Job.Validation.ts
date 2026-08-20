import { z } from "zod";

export const createJobSchema = z.object({
  
  body: z.object({
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    responsibilities: z.string().trim().min(1, "Responsibilities is required"),
    requirements: z.string().trim().min(1, "Requirements is required"),
    category_id: z.string().min(1, "Category is required"),
    location: z.string().trim().optional(),
    work_type: z.enum(["remote", "onsite", "hybrid"]),
    salary_min: z.number().min(0).optional(),
    salary_max: z.number().min(0).optional(),
    experience_level: z
      .enum(["entry", "junior", "mid", "senior", "lead"])
      .optional(),
    application_deadline: z.coerce.date(),
  }),
});


export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Job ID is required"),
  }),
});

export const updateJobSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, "Title is required").optional(),

    description: z.string().trim().min(1, "Description is required").optional(),

    responsibilities: z
      .string()
      .trim()
      .min(1, "Responsibilities is required")
      .optional(),

    requirements: z
      .string()
      .trim()
      .min(1, "Requirements is required")
      .optional(),

    category_id: z.string().min(1, "Category is required").optional(),

    location: z.string().trim().min(1, "Location is required").optional(),

    work_type: z.enum(["remote", "onsite", "hybrid"]).optional(),

    salary_min: z.number().min(0).optional(),

    salary_max: z.number().min(0).optional(),

    experience_level: z
      .enum(["entry", "junior", "mid", "senior", "lead"])
      .optional(),

    application_deadline: z.coerce.date().optional(),
  }),
});
