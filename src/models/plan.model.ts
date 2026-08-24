import { Schema, model } from "mongoose";

export interface IPlan {
  name: string;
  job_post_limit: number | null;
  price_monthly: number;
  price_yearly: number;
  is_featured: boolean;
  has_direct_messaging: boolean;
  has_premium_reports: boolean;
  stripe_price_id_monthly?: string | null;
  stripe_price_id_yearly?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

const PlanSchema = new Schema<IPlan>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    job_post_limit: { type: Number, default: null },
    price_monthly: { type: Number, required: true, min: 0 },
    price_yearly: { type: Number, required: true, min: 0 },
    is_featured: { type: Boolean, default: false },
    has_direct_messaging: { type: Boolean, default: false },
    has_premium_reports: { type: Boolean, default: false },
    stripe_price_id_monthly: { type: String, default: null },
    stripe_price_id_yearly: { type: String, default: null },
  },
  { timestamps: true, versionKey: false },
);

export default model<IPlan>("Plan", PlanSchema);
