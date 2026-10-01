import { and, avg, count, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { reviews } from "../../db/schemas/reviews.js";

export const createReviewDB = async ({ carId, customerId, rating, comment }) => {
  const result = await db
    .insert(reviews)
    .values({ carId, customerId, rating, comment })
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
    where: eq(reviews.carId, carId),
    with: {
      customer: {
        columns: { id: true, name: true, profileImage: true },
      },
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
    .where(eq(reviews.carId, carId));

  return {
    averageRating: result[0]?.averageRating
      ? Number(Number(result[0].averageRating).toFixed(1))
      : null,
    totalReviews: Number(result[0]?.totalReviews ?? 0),
  };
};

export const getReviewByCustomerCarDB = async (customerId, carId) => {
  return await db.query.reviews.findFirst({
    where: and(eq(reviews.customerId, customerId), eq(reviews.carId, carId)),
  });
};
