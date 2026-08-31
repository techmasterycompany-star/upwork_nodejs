import { Request, Response } from "express";
import * as chatbotService from "./chatbot.service.js";

export const sendMessage = async (req: Request, res: Response) => {
  const { messages } = req.body;

  const reply = await chatbotService.chat(messages);

  res.status(200).json({
    success: true,
    data: { reply },
  });
};
