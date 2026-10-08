import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { eq } from "drizzle-orm";
import {
  createReviewDB,
  deleteReviewDB,
  getCarRatingSummaryDB,
  getReviewByCustomerCarDB,
  getReviewsByCarDB,
  updateReviewDB,
  // dealer reviews
  getReviewsByDealerDB,
  getDealerRatingSummaryDB,
  replyToReviewDB,
  dealerDeleteReviewDB,
  // app reviews
  createAppReviewDB,
  getAppReviewByCustomerDB,
  getTopAppReviewsDB,
  getAllAppReviewsDB,
} from "./reviews.repository.js";

/* ─────────────────────────────────────────────────────────────
   CAR / DEALER  REVIEWS
───────────────────────────────────────────────────────────── */

export const createReviewService = async (
  customerId,
  { carId, rating, comment }
) => {
  if (rating < 1 || rating > 5) throw new Error("INVALID_RATING");

  // Find car and its dealer
  const car = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    columns: { id: true, dealerId: true },
  });
  if (!car) throw new Error("CAR_NOT_FOUND");

  const existing = await getReviewByCustomerCarDB(customerId, carId);
  if (existing) throw new Error("ALREADY_REVIEWED");

  // Get the dealer profile id from the dealer's userId
  const dealerProfile = await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.userId, car.dealerId),
    columns: { id: true },
  });

  const review = await createReviewDB({
    carId,
    dealerId: dealerProfile?.id || null,
    customerId,
    rating,
    comment,
  });
  return { message: "Review submitted", review };
};

export const updateReviewService = async (
  reviewId,
  customerId,
  { rating, comment }
) => {
  if (rating !== undefined && (rating < 1 || rating > 5))
    throw new Error("INVALID_RATING");

  const review = await updateReviewDB(reviewId, customerId, { rating, comment });
  if (!review) throw new Error("REVIEW_NOT_FOUND");

  return { message: "Review updated", review };
};

export const deleteReviewService = async (reviewId, customerId) => {
  const review = await deleteReviewDB(reviewId, customerId);
  if (!review) throw new Error("REVIEW_NOT_FOUND");
  return { message: "Review deleted" };
};

export const getCarReviewsService = async (carId) => {
  const [reviewsList, summary] = await Promise.all([
    getReviewsByCarDB(carId),
    getCarRatingSummaryDB(carId),
  ]);
  return { ...summary, reviews: reviewsList };
};

/* ─────────────────────────────────────────────────────────────
   DEALER  DASHBOARD  REVIEWS
───────────────────────────────────────────────────────────── */

/** Get dealer's profile id from their userId */
const getDealerProfileId = async (userId) => {
  const profile = await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.userId, userId),
    columns: { id: true },
  });
  if (!profile) throw new Error("DEALER_PROFILE_NOT_FOUND");
  return profile.id;
};

export const getDealerReviewsService = async (userId) => {
  const dealerId = await getDealerProfileId(userId);
  const [reviewsList, summary] = await Promise.all([
    getReviewsByDealerDB(dealerId),
    getDealerRatingSummaryDB(dealerId),
  ]);
  return { ...summary, reviews: reviewsList };
};

export const replyToReviewService = async (userId, reviewId, replyText) => {
  if (!replyText?.trim()) throw new Error("REPLY_EMPTY");
  const dealerId = await getDealerProfileId(userId);
  const review = await replyToReviewDB(reviewId, dealerId, replyText.trim());
  if (!review) throw new Error("REVIEW_NOT_FOUND");
  return { message: "Reply posted", review };
};

export const dealerDeleteReviewService = async (userId, reviewId) => {
  const dealerId = await getDealerProfileId(userId);
  const review = await dealerDeleteReviewDB(reviewId, dealerId);
  if (!review) throw new Error("REVIEW_NOT_FOUND");
  return { message: "Review deleted" };
};

/* ─────────────────────────────────────────────────────────────
   APP  REVIEWS
───────────────────────────────────────────────────────────── */

export const createAppReviewService = async (customerId, { rating, comment }) => {
  if (rating < 1 || rating > 5) throw new Error("INVALID_RATING");

  const existing = await getAppReviewByCustomerDB(customerId);
  if (existing) throw new Error("ALREADY_REVIEWED");

  const review = await createAppReviewDB({ customerId, rating, comment });
  return { message: "Thank you for your review!", review };
};

export const getTopAppReviewsService = async () => {
  const reviewsList = await getTopAppReviewsDB(5);
  return { reviews: reviewsList };
};

export const getAllAppReviewsService = async () => {
  const reviewsList = await getAllAppReviewsDB();
  return { reviews: reviewsList };
};
