import { z } from "zod";

export const addToWishlistSchema = z.object({
  body: z.object({
    job_id: z.string().min(1, "Job ID is required"),
  }),
});

export const wishlistIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Wishlist ID is required"),
  }),
});

export type AddToWishlistBody = z.infer<typeof addToWishlistSchema>["body"];