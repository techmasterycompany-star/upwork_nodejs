import { Request, Response, NextFunction } from "express";
import { stripe } from "../../utils/stripe.js";
import AppError from "../../error/AppError.js";
import StripeEvent from "../../models/stripe-event.model.js";
import {
  processInvoicePaid,
  processInvoicePaymentFailed,
  processSubscriptionUpdated,
  processSubscriptionDeleted,
  processSubscriptionCreated,
} from "./webhook.service.js";
import Stripe from "stripe";

export const stripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    res.status(500).json({
      success: false,
      message: "Webhook secret configuration is missing on server",
    });
    return;
  }

  if (!signature) {
    res
      .status(400)
      .json({ success: false, message: "Missing Stripe-Signature header" });
    return;
  }

  const rawBody = req.body;
  let event: Stripe.Event | null = null;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature as string,
      webhookSecret,
    );

    try {
      await StripeEvent.create({
        stripe_event_id: event.id,
        type: event.type,
        status: "received",
      });
    } catch (dbError: any) {
      if (dbError?.code === 11000) {
        res.status(200).json({
          received: true,
          eventId: event.id,
          eventType: event.type,
          duplicate: true,
        });
        return;
      }
      res
        .status(500)
        .json({ success: false, message: "Failed to persist webhook event" });
      return;
    }

    if (event.type === "invoice.paid") {
      await processInvoicePaid(event);
    } else if (event.type === "invoice.payment_failed") {
      await processInvoicePaymentFailed(event);
    } else if (event.type === "customer.subscription.created") {
      await processSubscriptionCreated(event);
    } else if (event.type === "customer.subscription.updated") {
      await processSubscriptionUpdated(event);
    } else if (event.type === "customer.subscription.deleted") {
      await processSubscriptionDeleted(event);
    }

    await StripeEvent.updateOne(
      { stripe_event_id: event.id },
      { $set: { status: "processed" } },
    );

    res.status(200).json({
      received: true,
      eventId: event.id,
      eventType: event.type,
    });
  } catch (error: any) {
    if (event && event.id) {
      try {
        await StripeEvent.updateOne(
          { stripe_event_id: event.id },
          { $set: { status: "failed" } },
        );
      } catch (dbUpdateError) {
        console.error("Failed to mark event status as failed:", dbUpdateError);
      }

      res.status(500).json({
        success: false,
        message: `Webhook processing failed: ${error.message}`,
      });
      return;
    }

    res.status(400).json({
      success: false,
      message: `Webhook signature verification failed: ${error.message}`,
    });
  }
};
