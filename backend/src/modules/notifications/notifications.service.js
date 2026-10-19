import {
  createNotificationDB,
  getNotificationsDB,
  getUnreadCountDB,
  markAllReadDB,
  markReadDB,
  markUnreadDB,
} from "./notifications.repository.js";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { dealerProfiles } from "../../db/schemas/dealers.js";

/** Resolve dealer's user_id from their dealerProfile id (for cross-service use) */
const getDealerUserIdByProfileId = async (dealerProfileId) => {
  const profile = await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.id, dealerProfileId),
    columns: { userId: true },
  });
  return profile?.userId ?? null;
};

/**
 * Notify a dealer about a new enquiry.
 * @param {number} dealerUserId  - the dealer's users.id
 * @param {object} enquiry       - { id, carId, customer: { name } }
 * @param {object} car           - { make, model, year }
 */
export const notifyNewEnquiry = async (dealerUserId, enquiry, car) => {
  if (!dealerUserId) return;
  const customerName = enquiry.customer?.name || "A customer";
  await createNotificationDB({
    userId: dealerUserId,
    type:   "enquiry",
    title:  "New Enquiry Received",
    body:   `${customerName} is interested in your ${car.year} ${car.make} ${car.model}.`,
    link:   "/dashboard",
  });
};

/**
 * Notify a dealer about a new car review.
 * @param {number} dealerUserId  - the dealer's users.id
 * @param {object} review        - { rating, customer: { name } }
 * @param {object} car           - { make, model, year }
 */
export const notifyNewReview = async (dealerUserId, review, car) => {
  if (!dealerUserId) return;
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  await createNotificationDB({
    userId: dealerUserId,
    type:   "review",
    title:  "New Review",
    body:   `${review.customer?.name || "A customer"} rated your ${car.year} ${car.make} ${car.model} ${stars}`,
    link:   "/dashboard",
  });
};

/**
 * Notify a dealer about a view milestone (every 10 views).
 * @param {number} dealerUserId  - the dealer's users.id
 * @param {object} car           - { id, make, model, year, viewsCount }
 */
export const notifyViewMilestone = async (dealerUserId, car) => {
  if (!dealerUserId) return;
  await createNotificationDB({
    userId: dealerUserId,
    type:   "view",
    title:  "Listing Getting Attention!",
    body:   `Your ${car.year} ${car.make} ${car.model} has reached ${car.viewsCount} views.`,
    link:   "/dashboard",
  });
};

// ── CRUD for the dealer dashboard ──────────────────────────

export const getMyNotificationsService = async (userId) => {
  const [items, unreadCount] = await Promise.all([
    getNotificationsDB(userId),
    getUnreadCountDB(userId),
  ]);
  return { notifications: items, unreadCount };
};

export const markReadService = async (notificationId, userId) => {
  const result = await markReadDB(notificationId, userId);
  if (!result) throw new Error("NOT_FOUND");
  return result;
};

export const markUnreadService = async (notificationId, userId) => {
  const result = await markUnreadDB(notificationId, userId);
  if (!result) throw new Error("NOT_FOUND");
  return result;
};

export const markAllReadService = async (userId) => {
  await markAllReadDB(userId);
};
