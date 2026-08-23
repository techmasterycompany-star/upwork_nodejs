import { Request, Response, NextFunction } from "express";
import * as subscriptionService from "./subscription.service.js";

export const getPlans = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const plans = await subscriptionService.listPlans();
  res.status(200).json({
    success: true,
    data: plans,
  });
};

export const checkout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user!.id;

  const { planId, billingCycle } = req.body;

  const result = await subscriptionService.initiateSubscriptionCheckout(
    userId,
    planId,
    billingCycle,
  );

  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getCurrentSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user!.id;

  const result =
    await subscriptionService.getCurrentSubscriptionAndUsage(userId);
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const cancelActiveSubscription = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user!.id;

  const result = await subscriptionService.cancelSubscription(userId);
  res.status(200).json({
    success: true,
    data: result,
  });
};

export const getPayments = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const userId = req.user!.id;

  const payments = await subscriptionService.getPaymentHistory(userId);
  res.status(200).json({
    success: true,
    data: payments,
  });
};
