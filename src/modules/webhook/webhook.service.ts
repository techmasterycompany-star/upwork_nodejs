import User from "../../models/user.model.js";
import Plan from "../../models/plan.model.js";
import Subscription from "../../models/subscription.model.js";
import Payment from "../../models/payment.model.js";
import AppError from "../../error/AppError.js";
import { retrieveSubscription } from "../../utils/stripe.js";
import Stripe from "stripe";
import { notify } from "../notification/notification.service.js";
import {
  getOrCreateLocalSubscription,
  parseStripeDate,
  notifySubscriptionChange,
} from "./webhook.utils.js";

export const processInvoicePaid = async (
  event: Stripe.Event,
): Promise<void> => {
  const invoice = event.data.object as any;
  const stripeCustomer = invoice.customer as string;
  const stripeSubscription = (invoice.subscription ??
    invoice.parent?.subscription_details?.subscription) as string;
  const invoiceId = invoice.id;
  const amountPaid = invoice.amount_paid;
  const currency = invoice.currency;

  if (!stripeCustomer)
    throw new AppError("Stripe customer ID is missing from invoice", 400);

  const user = await User.findOne({ stripe_customer_id: stripeCustomer });
  if (!user)
    throw new AppError(
      `No local User matches Stripe Customer: ${stripeCustomer}`,
      404,
    );

  if (user.role !== "employer")
    throw new AppError(
      `User ${user.email} is not an employer but has Stripe customer ID`,
      400,
    );

  if (!stripeSubscription)
    throw new AppError("Stripe subscription ID is missing from invoice", 400);

  const stripeSub = (await retrieveSubscription(stripeSubscription)) as any;
  const { userId, planId, billingCycle } = stripeSub.metadata;

  if (!userId || !planId || !billingCycle)
    throw new AppError(
      `Subscription ${stripeSubscription} metadata is missing or incomplete: userId=${userId}, planId=${planId}, billingCycle=${billingCycle}`,
      400,
    );

  const plan = await Plan.findById(planId);
  if (!plan)
    throw new AppError(
      `Plan ${planId} specified in subscription metadata not found`,
      404,
    );

  const subscriptionExists = await Subscription.findOne({
    stripe_subscription_id: stripeSubscription,
  });
  const isNewPaidSub = !subscriptionExists;

  const subscription = await getOrCreateLocalSubscription(
    stripeSub,
    stripeSubscription,
    user._id.toString(),
  );

  const oldPlanId = subscription.plan_id;
  const oldBillingCycle = subscription.billing_cycle;
  const oldStatus = subscription.status;

  subscription.plan_id = plan._id as any;
  subscription.billing_cycle = billingCycle as "monthly" | "yearly";
  subscription.status = "active";
  subscription.stripe_subscription_id = stripeSubscription;
  subscription.current_period_start = parseStripeDate(
    stripeSub.current_period_start,
  );
  subscription.current_period_end = parseStripeDate(
    stripeSub.current_period_end,
    30 * 24 * 60 * 60 * 1000,
  );

  await subscription.save();

  await notifySubscriptionChange({
    userId: user._id,
    isNewPaidSub,
    oldPlanId,
    newPlanName: plan.name,
    billingCycle,
    oldBillingCycle,
  });

  let payment = await Payment.findOne({ gateway_transaction_id: invoiceId });
  if (payment) {
    if (payment.status !== "completed") {
      payment.status = "completed";
      payment.paid_at = new Date();
      await payment.save();
    }
  } else {
    try {
      await Payment.create({
        subscription_id: subscription._id,
        amount: amountPaid / 100,
        currency: currency.toUpperCase(),
        gateway: "stripe",
        gateway_transaction_id: invoiceId,
        status: "completed",
        paid_at: new Date(),
      });
    } catch (paymentDbError: any) {
      if (paymentDbError?.code !== 11000) throw paymentDbError;
    }
  }
};

export const processInvoicePaymentFailed = async (
  event: Stripe.Event,
): Promise<void> => {
  const invoice = event.data.object as any;
  const stripeCustomer = invoice.customer as string;
  const stripeSubscription = (invoice.subscription ??
    invoice.parent?.subscription_details?.subscription) as string;
  const invoiceId = invoice.id;
  const amountDue = invoice.amount_due || invoice.amount_paid || 0;
  const currency = invoice.currency;

  if (!stripeCustomer)
    throw new AppError("Stripe customer ID is missing from invoice", 400);

  const user = await User.findOne({ stripe_customer_id: stripeCustomer });
  if (!user)
    throw new AppError(
      `No local User matches Stripe Customer: ${stripeCustomer}`,
      404,
    );

  if (user.role !== "employer")
    throw new AppError(
      `User ${user.email} is not an employer but has Stripe customer ID`,
      400,
    );

  if (!stripeSubscription)
    throw new AppError("Stripe subscription ID is missing from invoice", 400);

  const subscription = await Subscription.findOne({
    stripe_subscription_id: stripeSubscription,
  });
  if (!subscription)
    throw new AppError(
      `Subscription ${stripeSubscription} not found locally`,
      404,
    );

  const existingPayment = await Payment.findOne({
    gateway_transaction_id: invoiceId,
  });
  if (existingPayment) {
    if (existingPayment.status === "completed") return;
    existingPayment.status = "failed";
    await existingPayment.save();
  } else {
    try {
      await Payment.create({
        subscription_id: subscription._id,
        amount: amountDue / 100,
        currency: currency.toUpperCase(),
        gateway: "stripe",
        gateway_transaction_id: invoiceId,
        status: "failed",
      });
    } catch (paymentDbError: any) {
      if (paymentDbError?.code !== 11000) throw paymentDbError;
    }
  }

  try {
    await notify({
      userId: user._id,
      type: "payment_failed",
      title: "Subscription Payment Failed",
      content: `Your subscription payment of ${(amountDue / 100).toFixed(2)} ${currency.toUpperCase()} failed. Please update your billing information to avoid service interruption.`,
    });
  } catch (notifyErr) {
    console.error("Failed to send payment failure notification:", notifyErr);
  }
};

export const processSubscriptionCreated = async (
  event: Stripe.Event,
): Promise<void> => {
  const stripeSub = event.data.object as any;
  const stripeSubscriptionId = stripeSub.id;
  const stripeStatus = stripeSub.status;

  if (!stripeSubscriptionId)
    throw new AppError(
      "Stripe subscription ID is missing from event object",
      400,
    );

  const priceId = stripeSub.items?.data?.[0]?.price?.id;
  if (!priceId)
    throw new AppError("No price ID found in Stripe subscription items", 400);
  const plan = await Plan.findOne({
    $or: [
      { stripe_price_id_monthly: priceId },
      { stripe_price_id_yearly: priceId },
    ],
  });
  if (!plan)
    throw new AppError(
      `No local Plan maps to Stripe Price ID: ${priceId}`,
      404,
    );
  const billingCycle =
    plan.stripe_price_id_monthly === priceId ? "monthly" : "yearly";

  const subscription = await getOrCreateLocalSubscription(
    stripeSub,
    stripeSubscriptionId,
  );

  subscription.plan_id = plan._id as any;
  subscription.billing_cycle = billingCycle;

  if (subscription.status !== "active")
    subscription.status = stripeStatus === "active" ? "active" : "canceled";

  subscription.current_period_start = parseStripeDate(
    stripeSub.current_period_start,
  );
  subscription.current_period_end = parseStripeDate(
    stripeSub.current_period_end,
    30 * 24 * 60 * 60 * 1000,
  );

  await subscription.save();
};

export const processSubscriptionUpdated = async (
  event: Stripe.Event,
): Promise<void> => {
  const stripeSub = event.data.object as any;
  const stripeSubscriptionId = stripeSub.id;
  const stripeStatus = stripeSub.status;

  if (!stripeSubscriptionId)
    throw new AppError(
      "Stripe subscription ID is missing from event object",
      400,
    );

  const subscription = await Subscription.findOne({
    stripe_subscription_id: stripeSubscriptionId,
  });
  if (!subscription)
    throw new AppError(
      `Subscription ${stripeSubscriptionId} not found locally`,
      404,
    );

  const priceId = stripeSub.items?.data?.[0]?.price?.id;
  if (!priceId)
    throw new AppError("No price ID found in Stripe subscription items", 400);

  const plan = await Plan.findOne({
    $or: [
      { stripe_price_id_monthly: priceId },
      { stripe_price_id_yearly: priceId },
    ],
  });

  if (!plan)
    throw new AppError(
      `No local Plan maps to Stripe Price ID: ${priceId}`,
      404,
    );

  const billingCycle =
    plan.stripe_price_id_monthly === priceId ? "monthly" : "yearly";

  let localStatus: "active" | "expired" | "canceled" = "active";
  if (stripeStatus === "canceled") localStatus = "canceled";
  else if (stripeStatus === "incomplete_expired") localStatus = "expired";

  const oldPlanId = subscription.plan_id;
  const oldBillingCycle = subscription.billing_cycle;
  const oldStatus = subscription.status;

  subscription.plan_id = plan._id as any;
  subscription.billing_cycle = billingCycle;
  subscription.status = localStatus;
  subscription.current_period_start = parseStripeDate(
    stripeSub.current_period_start,
  );
  subscription.current_period_end = parseStripeDate(
    stripeSub.current_period_end,
    30 * 24 * 60 * 60 * 1000,
  );

  await subscription.save();

  try {
    let notifyTitle = "";
    let notifyContent = "";
    let notifyType: "subscription_updated" | "payment_completed" =
      "subscription_updated";

    const previousAttrs = event.data.previous_attributes as any;

    if (
      stripeSub.cancel_at_period_end &&
      previousAttrs &&
      previousAttrs.cancel_at_period_end === false
    ) {
      notifyTitle = "Subscription Cancellation Scheduled";
      notifyContent = `Your subscription cancellation has been scheduled. You will continue to have access to "${plan.name}" features until ${new Date(stripeSub.current_period_end * 1000).toLocaleDateString()}.`;
    } else if (
      !stripeSub.cancel_at_period_end &&
      previousAttrs &&
      previousAttrs.cancel_at_period_end === true
    ) {
      notifyTitle = "Subscription Reactivated";
      notifyContent = `Your subscription to "${plan.name}" has been successfully reactivated.`;
    } else if (
      localStatus !== oldStatus &&
      (localStatus === "canceled" || localStatus === "expired")
    ) {
      notifyTitle = `Subscription ${localStatus === "canceled" ? "Canceled" : "Expired"}`;
      notifyContent = `Your subscription to "${plan.name}" has ${localStatus === "canceled" ? "canceled" : "expired"}. Your account has been reverted to the Free plan.`;
    } else if (oldPlanId && oldPlanId.toString() !== plan._id.toString()) {
      await notifySubscriptionChange({
        userId: subscription.employer_id,
        isNewPaidSub: false,
        oldPlanId,
        newPlanName: plan.name,
        billingCycle,
        oldBillingCycle,
      });
    } else if (oldBillingCycle !== billingCycle) {
      await notifySubscriptionChange({
        userId: subscription.employer_id,
        isNewPaidSub: false,
        oldPlanId,
        newPlanName: plan.name,
        billingCycle,
        oldBillingCycle,
      });
    }

    if (notifyTitle && notifyContent) {
      await notify({
        userId: subscription.employer_id,
        type: notifyType,
        title: notifyTitle,
        content: notifyContent,
      });
    }
  } catch (notifyErr) {
    console.error(
      "Failed to send subscription update notification:",
      notifyErr,
    );
  }

  if (localStatus === "canceled" || localStatus === "expired") {
    const activeFree = await Subscription.findOne({
      employer_id: subscription.employer_id,
      status: "active",
      stripe_subscription_id: { $exists: false },
    });
    if (!activeFree) {
      const freePlanObj = await Plan.findOne({ name: /Free/i });
      if (freePlanObj) {
        const now = new Date();
        const currentPeriodEnd = new Date(
          now.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
        await Subscription.create({
          employer_id: subscription.employer_id,
          plan_id: freePlanObj._id,
          billing_cycle: "monthly",
          status: "active",
          current_period_start: now,
          current_period_end: currentPeriodEnd,
        });
      }
    }
  }
};

export const processSubscriptionDeleted = async (
  event: Stripe.Event,
): Promise<void> => {
  const stripeSub = event.data.object as any;
  const stripeSubscriptionId = stripeSub.id;

  if (!stripeSubscriptionId)
    throw new AppError(
      "Stripe subscription ID is missing from event object",
      400,
    );

  const subscription = await Subscription.findOne({
    stripe_subscription_id: stripeSubscriptionId,
  });
  if (!subscription)
    throw new AppError(
      `Subscription ${stripeSubscriptionId} not found locally`,
      404,
    );

  subscription.status = "canceled";
  await subscription.save();

  try {
    const plan = await Plan.findById(subscription.plan_id);
    const planName = plan ? plan.name : "Paid";
    await notify({
      userId: subscription.employer_id,
      type: "subscription_updated",
      title: "Subscription Canceled",
      content: `Your subscription to "${planName}" has ended. Your account has been reverted to the Free plan.`,
    });
  } catch (notifyErr) {
    console.error(
      "Failed to send subscription deleted notification:",
      notifyErr,
    );
  }

  const activeFree = await Subscription.findOne({
    employer_id: subscription.employer_id,
    status: "active",
    stripe_subscription_id: { $exists: false },
  });
  if (!activeFree) {
    const freePlanObj = await Plan.findOne({ name: /Free/i });
    if (freePlanObj) {
      const now = new Date();
      const currentPeriodEnd = new Date(
        now.getTime() + 30 * 24 * 60 * 60 * 1000,
      );
      await Subscription.create({
        employer_id: subscription.employer_id,
        plan_id: freePlanObj._id,
        billing_cycle: "monthly",
        status: "active",
        current_period_start: now,
        current_period_end: currentPeriodEnd,
      });
    }
  }
};
