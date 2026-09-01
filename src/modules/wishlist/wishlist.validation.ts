import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const addToWishlistSchema = z.object({
  body: z.object({
    job_id: objectIdSchema("job_id"),
  }),
});

export const wishlistIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});

export type AddToWishlistBody = z.infer<typeof addToWishlistSchema>["body"];
