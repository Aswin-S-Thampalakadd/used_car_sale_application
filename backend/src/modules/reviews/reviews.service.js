import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { eq } from "drizzle-orm";
import {
  createReviewDB,
  deleteReviewDB,
  getCarRatingSummaryDB,
  getReviewByCustomerCarDB,
  getReviewsByCarDB,
  updateReviewDB,
} from "./reviews.repository.js";

export const createReviewService = async (
  customerId,
  { carId, rating, comment }
) => {
  if (rating < 1 || rating > 5) throw new Error("INVALID_RATING");

  const car = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    columns: { id: true },
  });
  if (!car) throw new Error("CAR_NOT_FOUND");

  const existing = await getReviewByCustomerCarDB(customerId, carId);
  if (existing) throw new Error("ALREADY_REVIEWED");

  const review = await createReviewDB({ carId, customerId, rating, comment });
  return { message: "Review submitted", review };
};

export const updateReviewService = async (
  reviewId,
  customerId,
  { rating, comment }
) => {
  if (rating !== undefined && (rating < 1 || rating > 5)) {
    throw new Error("INVALID_RATING");
  }

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
