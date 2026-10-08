import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { subscriptions } from "../../db/schemas/subscriptions.js";

/**
 * Get the active subscription for a user.
 * Returns null if no active subscription exists (treated as free plan).
 */
export const getActiveSubscriptionByUserId = async (userId) => {
  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result[0] || null;
};

/**
 * Get all subscriptions for a user (history).
 */
export const getAllSubscriptionsByUserId = async (userId) => {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
};

/**
 * Create a new subscription (typically free plan on dealer signup).
 */
export const createSubscription = async (data) => {
  const result = await db.insert(subscriptions).values(data).returning();
  return result[0];
};

/**
 * Update subscription after successful Razorpay payment verification.
 */
export const upgradeSubscription = async (
  userId,
  planType,
  carLimit,
  price,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  endDate
) => {
  // Expire all previous active subscriptions for this user
  await db
    .update(subscriptions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))
    );

  // Insert the new active subscription
  const result = await db
    .insert(subscriptions)
    .values({
      userId,
      planType,
      carLimit,
      price: String(price),
      status: "active",
      paymentStatus: "completed",
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      startDate: new Date(),
      endDate,
    })
    .returning();

  return result[0];
};

/**
 * Persist a pending order before payment (so we can verify later).
 */
export const createPendingOrder = async (
  userId,
  planType,
  carLimit,
  price,
  razorpayOrderId,
  endDate
) => {
  // Expire previous active subscriptions first
  await db
    .update(subscriptions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"))
    );

  const result = await db
    .insert(subscriptions)
    .values({
      userId,
      planType,
      carLimit,
      price: String(price),
      status: "active", // will be confirmed after payment
      paymentStatus: "pending",
      razorpayOrderId,
      startDate: new Date(),
      endDate,
    })
    .returning();

  return result[0];
};

/**
 * Confirm a pending subscription after successful payment verification.
 */
export const confirmSubscription = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature
) => {
  const result = await db
    .update(subscriptions)
    .set({
      paymentStatus: "completed",
      razorpayPaymentId,
      razorpaySignature,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.razorpayOrderId, razorpayOrderId))
    .returning();

  return result[0] || null;
};
