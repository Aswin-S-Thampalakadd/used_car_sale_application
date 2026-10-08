import Razorpay from "razorpay";
import crypto from "crypto";
import {
  confirmSubscription,
  createPendingOrder,
  createSubscription,
  getActiveSubscriptionByUserId,
  getAllSubscriptionsByUserId,
} from "./subscriptions.repository.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Plan configurations: car limits and prices (in INR)
export const PLAN_CONFIGS = {
  free: { carLimit: 5, price: 0, durationDays: null }, // unlimited for free
  elite: { carLimit: 20, price: 999, durationDays: 30 },
  pro: { carLimit: 100, price: 2999, durationDays: 30 },
};

/**
 * Create default free subscription on dealer signup.
 */
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
    endDate: null, // free plan never expires
  });
};

/**
 * Get the active subscription plan for a user.
 * Returns free plan config if no subscription exists.
 */
export const getUserSubscriptionService = async (userId) => {
  const subscription = await getActiveSubscriptionByUserId(userId);

  // Default to free if none exists
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

/**
 * Get all subscriptions (history) for a user.
 */
export const getUserSubscriptionHistoryService = async (userId) => {
  return await getAllSubscriptionsByUserId(userId);
};

/**
 * Create a Razorpay order for subscription upgrade.
 */
export const createSubscriptionOrderService = async (userId, planType) => {
  if (!["elite", "pro"].includes(planType)) {
    throw new Error("Invalid plan type. Only 'elite' or 'pro' can be purchased.");
  }

  const config = PLAN_CONFIGS[planType];

  // Create Razorpay order
  const razorpayOrder = await razorpay.orders.create({
    amount: config.price * 100, // convert to paise
    currency: "INR",
    receipt: `sub_${userId}_${Date.now()}`,
    notes: {
      userId: String(userId),
      planType,
    },
  });

  // Calculate end date (30 days from now)
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + config.durationDays);

  // Store pending order in DB
  const subscription = await createPendingOrder(
    userId,
    planType,
    config.carLimit,
    config.price,
    razorpayOrder.id,
    endDate
  );

  return {
    orderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    subscription,
  };
};

/**
 * Verify Razorpay payment signature and upgrade subscription.
 */
export const verifyPaymentService = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  // Verify signature
  const generatedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");

  if (generatedSignature !== razorpaySignature) {
    throw new Error("INVALID_SIGNATURE");
  }

  // Update subscription to confirmed
  const subscription = await confirmSubscription(
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature
  );

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  return subscription;
};

/**
 * Check if user has reached their car listing limit.
 */
export const checkCarLimitService = async (userId, currentCarCount) => {
  const subscription = await getUserSubscriptionService(userId);

  return {
    hasReachedLimit: currentCarCount >= subscription.carLimit,
    currentCount: currentCarCount,
    limit: subscription.carLimit,
    planType: subscription.planType,
  };
};
