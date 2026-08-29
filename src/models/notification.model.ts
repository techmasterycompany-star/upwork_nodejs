import { Schema, model, Types } from "mongoose";

export type NotificationType =
  | "job_approved"
  | "job_rejected"
  | "application_status_changed"
  | "payment_completed"
  | "payment_failed"
  | "application_submitted";

export interface INotification {
  user_id: Types.ObjectId;
  type: NotificationType;
  title: string;
  content: string;
  data?: Record<string, unknown>;
  is_read: boolean;
  read_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "job_approved",
        "job_rejected",
        "application_status_changed",
        "payment_completed",
        "payment_failed",
      ],
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    data: Schema.Types.Mixed,
    is_read: { type: Boolean, default: false },
    read_at: Date,
  },
  { timestamps: true, versionKey: false },
);

export default model<INotification>("Notification", NotificationSchema);
