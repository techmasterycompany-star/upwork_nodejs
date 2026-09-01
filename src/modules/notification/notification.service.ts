import { Types } from "mongoose";
import Notification, {
  NotificationType,
} from "../../models/notification.model.js";
import AppError from "../../error/AppError.js";
import { sendPushNotification } from "../../utils/oneSignal.js";

interface NotifyInput {
  userId: Types.ObjectId | string;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
}

export const notify = async ({
  userId,
  type,
  title,
  content,
  data,
}: NotifyInput): Promise<void> => {
  await Notification.create({ user_id: userId, type, title, content, data });

  void sendPushNotification(userId.toString(), title, content);
};

export const getMyNotifications = async (userId: Types.ObjectId) => {
  return Notification.find({ user_id: userId }).sort({ createdAt: -1 });
};

export const markAsRead = async (id: string, userId: Types.ObjectId) => {
  const notification = await Notification.findOne({ _id: id, user_id: userId });
  if (!notification) throw new AppError("Notification not found", 404);

  if (!notification.is_read) {
    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();
  }

  return notification;
};

export const markAllAsRead = async (userId: Types.ObjectId) => {
  await Notification.updateMany(
    { user_id: userId, is_read: false },
    { $set: { is_read: true, read_at: new Date() } },
  );
};
