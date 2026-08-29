import { z } from "zod";
import { objectIdSchema } from "../../utils/validation.utils.js";

export const notificationIdSchema = z.object({
  params: z.object({
    id: objectIdSchema("id"),
  }),
});
