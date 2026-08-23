import { Schema, model, Types } from "mongoose";

export type BillingCycle = "monthly" | "yearly";
export type SubscriptionStatus = "active" | "expired" | "canceled";

export interface ISubscription {
  employer_id: Types.ObjectId;
  plan_id: Types.ObjectId;
  billing_cycle: BillingCycle;
  status: SubscriptionStatus;
  current_period_start: Date;
  current_period_end: Date;
  stripe_subscription_id?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
  {
    employer_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    plan_id: {
      type: Schema.Types.ObjectId,
      ref: "Plan",
      required: true,
    },
    billing_cycle: {
      type: String,
      enum: ["monthly", "yearly"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "expired", "canceled"],
      default: "active",
    },
    current_period_start: { type: Date, required: true },
    current_period_end: { type: Date, required: true },
    stripe_subscription_id: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true, versionKey: false },
);

export default model<ISubscription>("Subscription", SubscriptionSchema);
