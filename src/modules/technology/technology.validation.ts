import { z } from "zod";
import mongoose from "mongoose";

const objectId = z.string().refine(
  (id) => mongoose.Types.ObjectId.isValid(id),
  "Invalid ID",
);

export const createTechnology = z.object({
  body: z.object({
    name: z.string().trim().min(1, "Technology name is required"),
  }),
});

export const updateTechnology = z.object({
  params: z.object({
    id: objectId,
  }),

  body: z.object({
    name: z.string().trim().min(1, "Technology name is required"),
  }),
});