import mongoose from "mongoose";
import { z } from "zod";

export const phoneRegex = /^(\+20|0)?1[0125][0-9]{8}$/;

export const objectIdSchema = (fieldName: string) =>
  z
    .string({ error: `${fieldName} is required` })
    .refine((id) => mongoose.Types.ObjectId.isValid(id), {
      message: `Invalid ${fieldName}`,
    });
