import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { newsletterSubscribers } from "../../db/schemas/newsletter.js";

export const findByEmail = async (email) =>
  db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.email, email.toLowerCase().trim()),
  });

export const findByToken = async (token) =>
  db.query.newsletterSubscribers.findFirst({
    where: eq(newsletterSubscribers.token, token),
  });

export const createSubscriber = async ({ email, name, token }) => {
  const result = await db
    .insert(newsletterSubscribers)
    .values({
      email: email.toLowerCase().trim(),
      name: name?.trim() || null,
      token,
      status: "pending",
    })
    .returning();
  return result[0];
};

export const confirmSubscriber = async (token) => {
  const result = await db
    .update(newsletterSubscribers)
    .set({ status: "active", confirmedAt: new Date() })
    .where(
      and(
        eq(newsletterSubscribers.token, token),
        eq(newsletterSubscribers.status, "pending"),
      ),
    )
    .returning();
  return result[0] || null;
};

export const unsubscribeByToken = async (token) => {
  const result = await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed" })
    .where(eq(newsletterSubscribers.token, token))
    .returning({ id: newsletterSubscribers.id });
  return result[0] || null;
};

export const adminConfirmById = async (id) => {
  const result = await db
    .update(newsletterSubscribers)
    .set({ status: "active", confirmedAt: new Date() })
    .where(eq(newsletterSubscribers.id, id))
    .returning();
  return result[0] || null;
};

export const deleteSubscriberById = async (id) => {
  const result = await db
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.id, id))
    .returning({ id: newsletterSubscribers.id });
  return result[0] || null;
};

export const getAllSubscribers = async ({
  page = 1,
  limit = 50,
  status,
} = {}) => {
  const offset = (page - 1) * limit;
  const rows = await db.query.newsletterSubscribers.findMany({
    where: status ? eq(newsletterSubscribers.status, status) : undefined,
    orderBy: desc(newsletterSubscribers.createdAt),
    limit,
    offset,
  });
  return rows;
};
