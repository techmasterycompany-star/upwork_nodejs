import { z } from "zod";

export const chatMessageSchema = z.object({
  body: z.object({
    messages: z
      .array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string().trim().min(1).max(2000),
        }),
      )
      .min(1, "At least one message is required")
      .max(20, "Conversation too long, please start a new one"),
  }),
});

export type ChatMessageInput = z.infer<typeof chatMessageSchema>["body"];
