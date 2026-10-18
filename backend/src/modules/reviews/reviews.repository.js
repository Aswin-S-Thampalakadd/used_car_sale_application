import { and, avg, count, desc, eq, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reviews } from "../../db/schemas/reviews.js";

/* ─────────────────────────────────────────────────────────────
   CAR  REVIEWS  (reviewType = "dealer", carId set)
───────────────────────────────────────────────────────────── */

export const createReviewDB = async ({ carId, customerId, rating, comment }) => {
  const result = await db
    .insert(reviews)
    .values({ reviewType: "dealer", carId, customerId, rating, comment })
    .returning();
  return result[0];
};

export const updateReviewDB = async (reviewId, customerId, { rating, comment }) => {
  const result = await db
    .update(reviews)
    .set({ rating, comment, updatedAt: new Date() })
    .where(and(eq(reviews.id, reviewId), eq(reviews.customerId, customerId)))
    .returning();
  return result[0] || null;
};

export const deleteReviewDB = async (reviewId, customerId) => {
  const result = await db
    .delete(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.customerId, customerId)))
    .returning({ id: reviews.id });
  return result[0] || null;
};

export const getReviewsByCarDB = async (carId) => {
  return await db.query.reviews.findMany({
    where: and(eq(reviews.carId, carId), eq(reviews.reviewType, "dealer")),
    with: {
      customer: { columns: { id: true, name: true, profileImage: true } },
    },
    orderBy: desc(reviews.createdAt),
  });
};

export const getCarRatingSummaryDB = async (carId) => {
  const result = await db
    .select({
      averageRating: avg(reviews.rating),
      totalReviews: count(reviews.id),
    })
    .from(reviews)
    .where(and(eq(reviews.carId, carId), eq(reviews.reviewType, "dealer")));

  return {
    averageRating: result[0]?.averageRating
      ? Number(Number(result[0].averageRating).toFixed(1))
      : null,
    totalReviews: Number(result[0]?.totalReviews ?? 0),
  };
};

export const getReviewByCustomerCarDB = async (customerId, carId) => {
  return await db.query.reviews.findFirst({
    where: and(
      eq(reviews.customerId, customerId),
      eq(reviews.carId, carId),
      eq(reviews.reviewType, "dealer")
    ),
  });
};

/* ─────────────────────────────────────────────────────────────
   DEALER  REVIEWS  (reviewType = "dealer", looked up by dealerId)
   A dealer review is associated with a specific dealer's car but
   we query by dealerId so the dealer can see all reviews.
───────────────────────────────────────────────────────────── */

export const getReviewsByDealerDB = async (dealerId) => {
  // Fetch all dealer-type reviews whose cars belong to this dealer
  // We join via cars table — cars have dealerId
  return await db.query.reviews.findMany({
    where: and(
      eq(reviews.reviewType, "dealer"),
      eq(reviews.dealerId, dealerId)
    ),
    with: {
      customer: { columns: { id: true, name: true, profileImage: true } },
      car: { columns: { id: true, make: true, model: true, year: true } },
    },
    orderBy: desc(reviews.createdAt),
  });
};

export const getDealerRatingSummaryDB = async (dealerId) => {
  const result = await db
    .select({
      averageRating: avg(reviews.rating),
      totalReviews: count(reviews.id),
    })
    .from(reviews)
    .where(
      and(eq(reviews.reviewType, "dealer"), eq(reviews.dealerId, dealerId))
    );

  return {
    averageRating: result[0]?.averageRating
      ? Number(Number(result[0].averageRating).toFixed(1))
      : null,
    totalReviews: Number(result[0]?.totalReviews ?? 0),
  };
};

export const replyToReviewDB = async (reviewId, dealerId, replyText) => {
  const result = await db
    .update(reviews)
    .set({ replyText, replyAt: new Date(), updatedAt: new Date() })
    .where(
      and(eq(reviews.id, reviewId), eq(reviews.dealerId, dealerId))
    )
    .returning();
  return result[0] || null;
};

export const dealerDeleteReviewDB = async (reviewId, dealerId) => {
  const result = await db
    .delete(reviews)
    .where(and(eq(reviews.id, reviewId), eq(reviews.dealerId, dealerId)))
    .returning({ id: reviews.id });
  return result[0] || null;
};

/* ─────────────────────────────────────────────────────────────
   APP  REVIEWS  (reviewType = "app")
───────────────────────────────────────────────────────────── */

export const createAppReviewDB = async ({ customerId, rating, comment }) => {
  const result = await db
    .insert(reviews)
    .values({
      reviewType: "app",
      customerId,
      rating,
      comment,
      isApproved: false,   // must be approved by admin before appearing publicly
    })
    .returning();
  return result[0];
};

export const getAppReviewByCustomerDB = async (customerId) => {
  return await db.query.reviews.findFirst({
    where: and(
      eq(reviews.customerId, customerId),
      eq(reviews.reviewType, "app")
    ),
  });
};

export const getTopAppReviewsDB = async (limit = 5) => {
  return await db.query.reviews.findMany({
    where: and(
      eq(reviews.reviewType, "app"),
      isNull(reviews.carId),
      eq(reviews.isApproved, true),   // only admin-approved reviews shown publicly
    ),
    with: {
      customer: { columns: { id: true, name: true, profileImage: true } },
    },
    orderBy: [desc(reviews.rating), desc(reviews.createdAt)],
    limit,
  });
};

export const getAllAppReviewsDB = async () => {
  return await db.query.reviews.findMany({
    where: and(
      eq(reviews.reviewType, "app"),
      isNull(reviews.carId),
      eq(reviews.isApproved, true),   // only admin-approved reviews shown publicly
    ),
    with: {
      customer: { columns: { id: true, name: true, profileImage: true } },
    },
    orderBy: desc(reviews.createdAt),
  });
};

/** Admin only — approve or un-approve an app review */
export const approveReviewDB = async (reviewId, isApproved) => {
  const result = await db
    .update(reviews)
    .set({ isApproved, updatedAt: new Date() })
    .where(eq(reviews.id, reviewId))
    .returning({ id: reviews.id, isApproved: reviews.isApproved });
  return result[0] || null;
};
