import User from "../../models/user.model.js";
import Subscription from "../../models/subscription.model.js";
import AppError from "../../error/AppError.js";

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
