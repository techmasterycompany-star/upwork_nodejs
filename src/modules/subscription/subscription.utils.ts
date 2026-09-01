import Plan from "../../models/plan.model.js";
import Subscription from "../../models/subscription.model.js";
import { rollPeriodForward } from "../../utils/billing.js";
import AppError from "../../error/AppError.js";

export const getOrUpdateActiveSubscription = async (
  employerId: string,
): Promise<any> => {
  let subscription = await Subscription.findOne({
    employer_id: employerId,
    status: "active",
    stripe_subscription_id: { $exists: true, $ne: null },
  }).populate("plan_id");

  if (!subscription) {
    subscription = await Subscription.findOne({
      employer_id: employerId,
      status: "active",
      stripe_subscription_id: { $exists: false },
    }).populate("plan_id");

    if (subscription) {
      const now = new Date();
      if (subscription.current_period_end < now) {
        const rolled = rollPeriodForward(
          subscription.current_period_start,
          subscription.current_period_end,
          subscription.billing_cycle,
        );
        subscription.current_period_start = rolled.current_period_start;
        subscription.current_period_end = rolled.current_period_end;
        await subscription.save();
      }
    }
  }

  if (!subscription) {
    subscription = await Subscription.findOne({
      employer_id: employerId,
      status: "canceled",
      stripe_subscription_id: { $exists: true, $ne: null },
      current_period_end: { $gt: new Date() },
    }).populate("plan_id");
  }

  if (!subscription) {
    const freePlanObj = await Plan.findOne({ name: /Free/i });
    if (!freePlanObj)
      throw new AppError("Default Free Plan not configured on server", 500);

    const now = new Date();
    const currentPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    let freeSub = await Subscription.findOne({
      employer_id: employerId,
      stripe_subscription_id: { $exists: false },
    });

    if (freeSub) {
      freeSub.status = "active";
      freeSub.plan_id = freePlanObj._id;
      freeSub.current_period_start = now;
      freeSub.current_period_end = currentPeriodEnd;
      await freeSub.save();
      subscription = await freeSub.populate("plan_id");
    } else {
      const createdSub = await Subscription.create({
        employer_id: employerId,
        plan_id: freePlanObj._id,
        billing_cycle: "monthly",
        status: "active",
        current_period_start: now,
        current_period_end: currentPeriodEnd,
      });
      subscription = await Subscription.findById(createdSub._id).populate(
        "plan_id",
      );
    }
  }

  return subscription;
};
