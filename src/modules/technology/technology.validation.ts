import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const technologyIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});

export const createTechnology = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Technology name is required"),
  }),
});

export const updateTechnology = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
  body: z.object({
    name: z.string().trim().min(1, "Technology name is required"),
  }),
});
