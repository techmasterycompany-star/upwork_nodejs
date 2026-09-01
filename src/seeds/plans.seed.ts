import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Plan from "../models/plan.model.js";

await mongoose.connect(process.env.MONGO_URL!);

const plans = [
  {
    name: "Free",
    job_post_limit: 5,
    price_monthly: 0,
    price_yearly: 0,
    is_featured: false,
    has_direct_messaging: false,
    has_premium_reports: false,
    stripe_price_id_monthly: null,
    stripe_price_id_yearly: null,
  },
  {
    name: "Basic",
    job_post_limit: 15,
    price_monthly: 29,
    price_yearly: 290,
    is_featured: false,
    has_direct_messaging: true,
    has_premium_reports: false,
    stripe_price_id_monthly: "price_1U9kvO4lzeOivqMUkm9PLaW0",
    stripe_price_id_yearly: "price_1U9kxt4lzeOivqMUbFsi0sDA",
  },
  {
    name: "Premium",
    job_post_limit: null,
    price_monthly: 59,
    price_yearly: 590,
    is_featured: true,
    has_direct_messaging: true,
    has_premium_reports: true,
    stripe_price_id_monthly: "price_1U9kyc4lzeOivqMUdN74tVcd",
    stripe_price_id_yearly: "price_1U9kyq4lzeOivqMU5U6INxJh",
  },
];

for (const plan of plans) {
  const existingPlan = await Plan.findOne({ name: plan.name });
  if (existingPlan) {
    await Plan.findOneAndUpdate({ name: plan.name }, plan);
    console.log(`Plan "${plan.name}" updated successfully.`);
  } else {
    await Plan.create(plan);
    console.log(`Plan "${plan.name}" created successfully.`);
  }
}

console.log("Plan seeding completed.");
process.exit();
