import { z } from "zod";

export const updateEmployerProfileSchema = z.object({
  body: z
    .object({
      companyName: z
        .string()
        .min(2, "Company name must be at least 2 characters")
        .optional(),
      description: z.string().optional(),
      industry: z.string().optional(),
      website: z.string().url("Must be a valid URL").optional().nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field is required to update",
    }),
});

export type UpdateEmployerProfileBody = z.infer<
  typeof updateEmployerProfileSchema
>["body"];
