import Razorpay from "razorpay";
import crypto from "crypto";
import {
  confirmSubscription,
  createPendingOrder,
  createSubscription,
  getActiveSubscriptionByUserId,
  getAllSubscriptionsByUserId,
} from "./subscriptions.repository.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export const PLAN_CONFIGS = {
  free: { carLimit: 5, price: 0, durationDays: null },
  elite: { carLimit: 20, price: 999, durationDays: 30 },
  pro: { carLimit: 100, price: 2999, durationDays: 30 },
};

export const createFreeSubscriptionService = async (userId) => {
  const config = PLAN_CONFIGS.free;

  return await createSubscription({
    userId,
    planType: "free",
    carLimit: config.carLimit,
    price: String(config.price),
    status: "active",
    paymentStatus: "completed",
    startDate: new Date(),
    endDate: null,
  });
};

export const getUserSubscriptionService = async (userId) => {
  const subscription = await getActiveSubscriptionByUserId(userId);

  if (!subscription) {
    return {
      planType: "free",
      carLimit: PLAN_CONFIGS.free.carLimit,
      price: PLAN_CONFIGS.free.price,
      status: "active",
      startDate: null,
      endDate: null,
    };
  }

  return subscription;
};

export const getUserSubscriptionHistoryService = async (userId) => {
  return await getAllSubscriptionsByUserId(userId);
};

export const createSubscriptionOrderService = async (userId, planType) => {
  if (!["elite", "pro"].includes(planType)) {
    throw new Error(
      "Invalid plan type. Only 'elite' or 'pro' can be purchased.",
    );
  }

  const config = PLAN_CONFIGS[planType];

  const razorpayOrder = await razorpay.orders.create({
    amount: config.price * 100,
    currency: "INR",
    receipt: `sub_${userId}_${Date.now()}`,
    notes: {
      userId: String(userId),
      planType,
    },
  });

  const endDate = new Date();
  endDate.setDate(endDate.getDate() + config.durationDays);

  const subscription = await createPendingOrder(
    userId,
    planType,
    config.carLimit,
    config.price,
    razorpayOrder.id,
    endDate,
  );

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    subscription,
  };
};

export const verifyPaymentService = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
) => {
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("INVALID_SIGNATURE");
  }

  const subscription = await confirmSubscription(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
  );

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  return subscription;
};

export const checkCarLimitService = async (userId, currentCarCount) => {
  const subscription = await getUserSubscriptionService(userId);

  return {
    hasReachedLimit: currentCarCount >= subscription.carLimit,
    currentCount: currentCarCount,
    limit: subscription.carLimit,
    planType: subscription.planType,
  };
};
