import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const checkoutSchema = z.object({
  body: z.object({
    planId: objectIdSchema("planId"),
    billingCycle: z.enum(["monthly", "yearly"]),
  }),
});
