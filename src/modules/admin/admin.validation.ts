import z from "zod";

export const jobIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, "Job ID is required"),
  }),
});
