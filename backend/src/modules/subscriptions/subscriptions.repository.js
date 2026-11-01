import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { subscriptions } from "../../db/schemas/subscriptions.js";

export const getActiveSubscriptionByUserId = async (userId) => {
  const result = await db
    .select()
    .from(subscriptions)
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")),
    )
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  return result[0] || null;
};

export const getAllSubscriptionsByUserId = async (userId) => {
  return await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt));
};

export const createSubscription = async (data) => {
  const result = await db.insert(subscriptions).values(data).returning();
  return result[0];
};

export const upgradeSubscription = async (
  userId,
  planType,
  carLimit,
  price,
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  endDate,
) => {
  await db
    .update(subscriptions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")),
    );

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

export const createPendingOrder = async (
  userId,
  planType,
  carLimit,
  price,
  razorpayOrderId,
  endDate,
) => {
  await db
    .update(subscriptions)
    .set({ status: "expired", updatedAt: new Date() })
    .where(
      and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")),
    );

  const result = await db
    .insert(subscriptions)
    .values({
      userId,
      planType,
      carLimit,
      price: String(price),
      status: "active",
      paymentStatus: "pending",
      razorpayOrderId,
      startDate: new Date(),
      endDate,
    })
    .returning();

  return result[0];
};

export const confirmSubscription = async (
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
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
