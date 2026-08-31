import Groq from "groq-sdk";
import AppError from "../error/AppError.js";

const groqApiKey = process.env.GROQ_API_KEY;
if (!groqApiKey) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: GROQ_API_KEY is missing from the environment variables.",
  );
}

const groq = new Groq({ apiKey: groqApiKey });

export const generateText = async (
  systemPrompt: string,
  userPrompt: string,
): Promise<string> => {
  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1024,
    });
  } catch (error: any) {
    throw new AppError(`AI generation failed: ${error.message}`, 502);
  }

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new AppError("AI service returned an empty response", 502);

  return text.trim();
};

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export const generateChatReply = async (
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> => {
  let completion;
  try {
    completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [{ role: "system", content: systemPrompt }, ...messages],
      temperature: 0.7,
      max_tokens: 1024,
    });
  } catch (error: any) {
    throw new AppError(`AI chat generation failed: ${error.message}`, 502);
  }

  const text = completion.choices[0]?.message?.content;
  if (!text) throw new AppError("AI service returned an empty response", 502);

  return text.trim();
};
