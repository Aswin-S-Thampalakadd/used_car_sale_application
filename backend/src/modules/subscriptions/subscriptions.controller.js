import { AppError } from "../../utils/AppError.js";
import {
  checkCarLimitService,
  createSubscriptionOrderService,
  getUserSubscriptionHistoryService,
  getUserSubscriptionService,
  PLAN_CONFIGS,
  verifyPaymentService,
} from "./subscriptions.service.js";

export const getMySubscription = async (req, res) => {
  const userId = req.user.userId;
  const subscription = await getUserSubscriptionService(userId);

  return res.status(200).json({
    success: true,
    subscription,
  });
};

export const getMySubscriptionHistory = async (req, res) => {
  const userId = req.user.userId;
  const subscriptions = await getUserSubscriptionHistoryService(userId);

  return res.status(200).json({
    success: true,
    subscriptions,
  });
};

export const getAvailablePlans = async (_req, res) => {
  const plans = Object.entries(PLAN_CONFIGS).map(([key, config]) => ({
    planType: key,
    carLimit: config.carLimit,
    price: config.price,
    durationDays: config.durationDays,
  }));

  return res.status(200).json({
    success: true,
    plans,
  });
};

export const createSubscriptionOrder = async (req, res) => {
  const userId = req.user.userId;
  const { planType } = req.body;

  if (!planType || !["elite", "pro"].includes(planType)) {
    throw new AppError(400, "Invalid plan type. Must be 'elite' or 'pro'.");
  }

  const order = await createSubscriptionOrderService(userId, planType);

  return res.status(201).json({
    success: true,
    order,
  });
};

export const verifyPayment = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    throw new AppError(400, "Missing payment details");
  }

  const subscription = await verifyPaymentService(
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  );

  return res.status(200).json({
    success: true,
    message: "Payment verified successfully",
    subscription,
  });
};

export const checkCarLimit = async (req, res) => {
  const userId = req.user.userId;
  const currentCarCount = Number(req.query.currentCarCount) || 0;

  const limitCheck = await checkCarLimitService(userId, currentCarCount);

  return res.status(200).json({
    success: true,
    ...limitCheck,
  });
};
