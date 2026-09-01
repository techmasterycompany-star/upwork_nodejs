import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const categoryIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});

export const createCategorySchema = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Category name is required"),
    description: z.string().trim().max(2000).optional(),
  }),
});

export const updateCategorySchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
  body: z
    .object({
      name: z.string().trim().min(1, "Category name is required").optional(),
      description: z.string().trim().max(2000).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>["body"];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>["body"];
