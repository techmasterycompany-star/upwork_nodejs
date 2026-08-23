import { Schema, model } from "mongoose";

export type StripeEventStatus = "received" | "processed" | "failed";

export interface IStripeEvent {
  stripe_event_id: string;
  type: string;
  status: StripeEventStatus;
  createdAt?: Date;
  updatedAt?: Date;
}

const StripeEventSchema = new Schema<IStripeEvent>(
  {
    stripe_event_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["received", "processed", "failed"],
      default: "received",
    },
  },
  { timestamps: true, versionKey: false },
);

export default model<IStripeEvent>("StripeEvent", StripeEventSchema);
