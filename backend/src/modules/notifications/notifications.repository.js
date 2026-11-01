import { and, count, desc, eq, lt } from "drizzle-orm";
import { db } from "../../db/index.js";
import { notifications } from "../../db/schemas/notifications.js";

export const createNotificationDB = async ({
  userId,
  type,
  title,
  body,
  link,
}) => {
  const result = await db
    .insert(notifications)
    .values({ userId, type, title, body, link })
    .returning();
  return result[0];
};

export const getNotificationsDB = async (userId) => {
  return await db.query.notifications.findMany({
    where: eq(notifications.userId, userId),
    orderBy: desc(notifications.createdAt),
    limit: 30,
  });
};

export const getUnreadCountDB = async (userId) => {
  const result = await db
    .select({ total: count() })
    .from(notifications)
    .where(
      and(eq(notifications.userId, userId), eq(notifications.isRead, false)),
    );
  return Number(result[0]?.total ?? 0);
};

export const markReadDB = async (notificationId, userId) => {
  const result = await db
    .update(notifications)
    .set({ isRead: true })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning({ id: notifications.id });
  return result[0] || null;
};

export const markUnreadDB = async (notificationId, userId) => {
  const result = await db
    .update(notifications)
    .set({ isRead: false })
    .where(
      and(
        eq(notifications.id, notificationId),
        eq(notifications.userId, userId),
      ),
    )
    .returning({ id: notifications.id });
  return result[0] || null;
};

export const markAllReadDB = async (userId) => {
  await db
    .update(notifications)
    .set({ isRead: true })
    .where(eq(notifications.userId, userId));
};

export const deleteOldNotificationsDB = async (userId) => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  await db
    .delete(notifications)
    .where(
      and(
        eq(notifications.userId, userId),
        lt(notifications.createdAt, cutoff),
      ),
    );
};
