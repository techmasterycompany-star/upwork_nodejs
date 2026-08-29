import { Request, Response } from "express";
import AppError from "../../error/AppError.js";
import * as notificationService from "./notification.service.js";

export const getMyNotifications = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);

  const notifications = await notificationService.getMyNotifications(userId);
  res.status(200).json({ success: true, data: notifications });
};

export const markAsRead = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);

  const notification = await notificationService.markAsRead(
    req.params.id as string,
    userId,
  );
  res.status(200).json({ success: true, data: notification });
};

export const markAllAsRead = async (req: Request, res: Response) => {
  const userId = req.user?._id;
  if (!userId) throw new AppError("User not authenticated", 401);

  await notificationService.markAllAsRead(userId);
  res
    .status(200)
    .json({ success: true, message: "All notifications marked as read" });
};
