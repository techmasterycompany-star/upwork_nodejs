import { Schema, model, Types } from "mongoose";

export type PaymentGateway = "paypal" | "stripe";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

export interface IPayment {
  subscription_id: Types.ObjectId;
  amount: number;
  currency: string;
  gateway: PaymentGateway;
  gateway_transaction_id: string;
  status: PaymentStatus;
  paid_at?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    subscription_id: {
      type: Schema.Types.ObjectId,
      ref: "Subscription",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: "USD" },
    gateway: {
      type: String,
      enum: ["paypal", "stripe"],
      required: true,
    },
    gateway_transaction_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paid_at: Date,
  },
  { timestamps: true, versionKey: false },
);

export default model<IPayment>("Payment", PaymentSchema);
