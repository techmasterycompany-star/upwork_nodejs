import Stripe from "stripe";
import User from "../models/user.model.js";
import AppError from "../error/AppError.js";

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  throw new Error(
    "CRITICAL CONFIGURATION ERROR: STRIPE_SECRET_KEY is missing from the environment variables.",
  );
}

export const stripe = new Stripe(stripeKey);

export const getOrCreateCustomer = async (userId: string): Promise<string> => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);

  if (user.role !== "employer")
    throw new AppError("Only employers can have billing customers", 403);

  if (user.stripe_customer_id) return user.stripe_customer_id;

  try {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        userId: userId.toString(),
      },
    });

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId, stripe_customer_id: { $exists: false } },
      { stripe_customer_id: customer.id },
      { new: true },
    );

    if (!updatedUser) {
      await stripe.customers.del(customer.id);

      const recheckUser = await User.findById(userId);
      if (recheckUser?.stripe_customer_id)
        return recheckUser.stripe_customer_id;
      throw new Error(
        "Concurrency collision: Customer ID could not be retrieved",
      );
    }

    return customer.id;
  } catch (error: any) {
    throw new AppError(
      `Stripe Customer Creation failed: ${error.message}`,
      500,
    );
  }
};

export const createCheckoutSession = async (
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata: { userId: string; planId: string; billingCycle: string },
): Promise<Stripe.Checkout.Session> => {
  try {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        metadata,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return session;
  } catch (error: any) {
    throw new AppError(`Stripe Checkout Session failed: ${error.message}`, 500);
  }
};

export const retrieveSubscription = async (
  subscriptionId: string,
): Promise<Stripe.Subscription> => {
  try {
    return await stripe.subscriptions.retrieve(subscriptionId);
  } catch (error: any) {
    throw new AppError(
      `Failed to retrieve Stripe subscription: ${error.message}`,
      500,
    );
  }
};
