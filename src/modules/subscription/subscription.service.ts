import Plan from "../../models/plan.model.js";
import Subscription from "../../models/subscription.model.js";
import Payment from "../../models/payment.model.js";
import Job from "../../models/job.model.js";
import AppError from "../../error/AppError.js";
import {
  getOrCreateCustomer,
  createCheckoutSession,
  retrieveSubscription,
  stripe,
} from "../../utils/stripe.js";
import { getOrUpdateActiveSubscription } from "./subscription.utils.js";

export const initiateSubscriptionCheckout = async (
  userId: string,
  planId: string,
  billingCycle: "monthly" | "yearly",
): Promise<{ sessionId: string; checkoutUrl: string | null }> => {
  const plan = await Plan.findById(planId);
  if (!plan) throw new AppError("Plan not found", 404);

  const priceId =
    billingCycle === "monthly"
      ? plan.stripe_price_id_monthly
      : billingCycle === "yearly"
        ? plan.stripe_price_id_yearly
        : null;

  if (!priceId)
    throw new AppError(
      `Stripe Price ID for ${billingCycle} cycle is not configured for plan "${plan.name}"`,
      400,
    );

  const activePaidSub = await Subscription.findOne({
    employer_id: userId,
    status: "active",
    stripe_subscription_id: { $exists: true, $ne: null },
  });

  if (activePaidSub && activePaidSub.stripe_subscription_id) {
    if (
      activePaidSub.plan_id.toString() === planId &&
      activePaidSub.billing_cycle === billingCycle
    )
      throw new AppError(
        "You are already subscribed to this plan and billing cycle",
        400,
      );

    const stripeSub = await retrieveSubscription(
      activePaidSub.stripe_subscription_id,
    );
    const subscriptionItemId = stripeSub.items.data[0].id;

    try {
      await stripe.subscriptions.update(activePaidSub.stripe_subscription_id, {
        items: [
          {
            id: subscriptionItemId,
            price: priceId,
          },
        ],
        proration_behavior: "always_invoice",
      });

      return {
        sessionId: "immediate_upgrade",
        checkoutUrl: null,
      };
    } catch (stripeError: any) {
      throw new AppError(
        `Stripe plan update failed: ${stripeError.message}`,
        500,
      );
    }
  }

  const customerId = await getOrCreateCustomer(userId);

  const frontendUrl = process.env.FRONTEND_URL;
  if (!frontendUrl)
    throw new AppError(
      "FRONTEND_URL environment variable is missing on server",
      500,
    );

  const successUrl = `${frontendUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${frontendUrl}/subscription/cancel`;

  const session = await createCheckoutSession(
    customerId,
    priceId,
    successUrl,
    cancelUrl,
    {
      userId,
      planId,
      billingCycle,
    },
  );

  return {
    sessionId: session.id,
    checkoutUrl: session.url,
  };
};

export const listPlans = async (): Promise<any[]> => {
  return await Plan.find({});
};

export const getCurrentSubscriptionAndUsage = async (
  employerId: string,
): Promise<any> => {
  const subscription = await getOrUpdateActiveSubscription(employerId);
  const plan = subscription.plan_id as any;
  const isPaid = !!subscription.stripe_subscription_id;

  const jobsUsed = await Job.countDocuments({
    employer_id: employerId,
    createdAt: {
      $gte: subscription.current_period_start,
      $lte: subscription.current_period_end,
    },
  });

  const jobPostLimit = plan.job_post_limit;
  const remainingJobs =
    jobPostLimit === null ? null : Math.max(0, jobPostLimit - jobsUsed);

  return {
    subscriptionId: subscription._id,
    plan: {
      id: plan._id,
      name: plan.name,
      job_post_limit: plan.job_post_limit,
      price_monthly: plan.price_monthly,
      price_yearly: plan.price_yearly,
    },
    status: subscription.status,
    billing_cycle: subscription.billing_cycle,
    current_period_start: subscription.current_period_start,
    current_period_end: subscription.current_period_end,
    isPaid,
    stripe_subscription_id: subscription.stripe_subscription_id,
    jobPostingQuota: jobPostLimit,
    jobsUsed,
    remainingJobs,
  };
};

export const cancelSubscription = async (
  userId: string,
): Promise<{ success: boolean; message: string }> => {
  const subscription = await Subscription.findOne({
    employer_id: userId,
    status: "active",
    stripe_subscription_id: { $exists: true, $ne: null },
  });

  if (!subscription || !subscription.stripe_subscription_id) {
    throw new AppError(
      "No active paid Stripe subscription found to cancel",
      400,
    );
  }

  try {
    const stripeSub = await retrieveSubscription(
      subscription.stripe_subscription_id,
    );

    if (stripeSub.cancel_at_period_end) {
      return {
        success: true,
        message:
          "Subscription cancellation is already scheduled for the end of the period.",
      };
    }

    await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    return {
      success: true,
      message: "Subscription cancellation scheduled successfully.",
    };
  } catch (stripeError: any) {
    throw new AppError(
      `Failed to cancel Stripe subscription: ${stripeError.message}`,
      500,
    );
  }
};

export const getPaymentHistory = async (userId: string): Promise<any[]> => {
  const subs = await Subscription.find({ employer_id: userId });
  const subIds = subs.map((s) => s._id);

  const payments = await Payment.find({
    subscription_id: { $in: subIds },
  }).sort({ createdAt: -1 });

  return payments.map((p) => {
    const matchingSub = subs.find(
      (s) => s._id.toString() === p.subscription_id.toString(),
    );
    return {
      id: p._id,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      paid_at: p.paid_at,
      createdAt: p.createdAt,
      gateway_transaction_id: p.gateway_transaction_id,
      billingCycle: matchingSub?.billing_cycle || "monthly",
    };
  });
};
