import User from "../../models/user.model.js";
import Subscription from "../../models/subscription.model.js";
import AppError from "../../error/AppError.js";
import Plan from "../../models/plan.model.js";
import { notify } from "../notification/notification.service.js";

export const parseStripeDate = (val: any, fallbackOffsetMs = 0): Date => {
  if (val === undefined || val === null)
    return new Date(Date.now() + fallbackOffsetMs);

  if (val instanceof Date)
    return isNaN(val.getTime()) ? new Date(Date.now() + fallbackOffsetMs) : val;

  const num = Number(val);
  if (!isNaN(num)) {
    if (num > 10000000000) return new Date(num);
    return new Date(num * 1000);
  }
  const date = new Date(val);
  return isNaN(date.getTime()) ? new Date(Date.now() + fallbackOffsetMs) : date;
};

export const getOrCreateLocalSubscription = async (
  stripeSub: any,
  stripeSubscriptionId: string,
  userIdFromInvoice?: string,
): Promise<any> => {
  let subscription = await Subscription.findOne({
    stripe_subscription_id: stripeSubscriptionId,
  });

  if (subscription) return subscription;

  let resolvedUserId = stripeSub.metadata?.userId || userIdFromInvoice;
  if (!resolvedUserId) {
    const stripeCustomerId = stripeSub.customer as string;
    const user = await User.findOne({ stripe_customer_id: stripeCustomerId });
    if (!user)
      throw new AppError(
        `No local User matches Stripe Customer: ${stripeCustomerId}`,
        404,
      );

    resolvedUserId = user._id.toString();
  }

  subscription = await Subscription.findOne({
    employer_id: resolvedUserId,
    $or: [
      { stripe_subscription_id: { $exists: false } },
      { stripe_subscription_id: null },
    ],
  });

  if (subscription) subscription.stripe_subscription_id = stripeSubscriptionId;
  else
    subscription = new Subscription({
      employer_id: resolvedUserId,
      stripe_subscription_id: stripeSubscriptionId,
    });

  return subscription;
};

export const getPlanRank = (name: string): number => {
  const n = name.toLowerCase();
  if (n.includes("premium")) return 2;
  if (n.includes("basic")) return 1;
  return 0;
};

export const notifySubscriptionChange = async ({
  userId,
  isNewPaidSub,
  oldPlanId,
  newPlanName,
  billingCycle,
  oldBillingCycle,
}: {
  userId: any;
  isNewPaidSub: boolean;
  oldPlanId?: any;
  newPlanName: string;
  billingCycle: string;
  oldBillingCycle?: string;
}): Promise<void> => {
  try {
    let notifyTitle = "";
    let notifyContent = "";

    if (isNewPaidSub) {
      notifyTitle = "Subscription Started";
      notifyContent = `Thank you for subscribing! Your "${newPlanName}" plan (${billingCycle}) is now active.`;
    } else {
      const oldPlan = oldPlanId ? await Plan.findById(oldPlanId) : null;
      const oldPlanName = oldPlan ? oldPlan.name : "Free";

      if (oldPlanName !== newPlanName) {
        const rankOld = getPlanRank(oldPlanName);
        const rankNew = getPlanRank(newPlanName);

        if (rankNew > rankOld) {
          notifyTitle = "Subscription Upgraded";
          notifyContent = `Your subscription has been successfully upgraded from "${oldPlanName}" to "${newPlanName}" (${billingCycle}).`;
        } else {
          notifyTitle = "Subscription Downgraded";
          notifyContent = `Your subscription has been downgraded from "${oldPlanName}" to "${newPlanName}" (${billingCycle}).`;
        }
      } else if (oldBillingCycle !== billingCycle) {
        notifyTitle = "Billing Cycle Updated";
        notifyContent = `Your subscription billing cycle has been changed to "${billingCycle}".`;
      } else {
        notifyTitle = "Subscription Renewed";
        notifyContent = `Your subscription to "${newPlanName}" has been successfully renewed.`;
      }
    }

    if (notifyTitle && notifyContent) {
      await notify({
        userId,
        type: "payment_completed",
        title: notifyTitle,
        content: notifyContent,
      });
    }
  } catch (notifyErr) {
    console.error(
      "Failed to send subscription change notification:",
      notifyErr,
    );
  }
};
