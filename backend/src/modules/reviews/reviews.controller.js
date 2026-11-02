import { AppError } from "../../utils/AppError.js";
import {
  createReviewService,
  deleteReviewService,
  getCarReviewsService,
  updateReviewService,
  getDealerReviewsService,
  replyToReviewService,
  dealerDeleteReviewService,
  createAppReviewService,
  getTopAppReviewsService,
  getAllAppReviewsService,
} from "./reviews.service.js";

export const createReview = async (req, res) => {
  const customerId = req.user.userId;
  const { carId, rating, comment } = req.body;
  if (!carId || rating === undefined) {
    throw new AppError(400, "carId and rating are required");
  }

  const result = await createReviewService(customerId, {
    carId: Number(carId),
    rating: Number(rating),
    comment,
  });
  return res.status(201).json(result);
};

export const updateReview = async (req, res) => {
  const customerId = req.user.userId;
  const reviewId = Number(req.params.id);
  const { rating, comment } = req.body;
  const result = await updateReviewService(reviewId, customerId, {
    rating: rating !== undefined ? Number(rating) : undefined,
    comment,
  });
  return res.json(result);
};

export const deleteReview = async (req, res) => {
  const customerId = req.user.userId;
  const reviewId = Number(req.params.id);
  const result = await deleteReviewService(reviewId, customerId);
  return res.json(result);
};

export const getCarReviews = async (req, res) => {
  const carId = Number(req.params.carId);
  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }

  const result = await getCarReviewsService(carId);
  return res.json(result);
};

export const getDealerReviews = async (req, res) => {
  const userId = req.user.userId;
  const result = await getDealerReviewsService(userId);
  return res.json(result);
};

export const replyToReview = async (req, res) => {
  const userId = req.user.userId;
  const reviewId = Number(req.params.id);
  const { replyText } = req.body;
  if (!replyText?.trim()) {
    throw new AppError(400, "Reply text is required");
  }

  const result = await replyToReviewService(userId, reviewId, replyText);
  return res.json(result);
};

export const dealerDeleteReview = async (req, res) => {
  const userId = req.user.userId;
  const reviewId = Number(req.params.id);
  const result = await dealerDeleteReviewService(userId, reviewId);
  return res.json(result);
};

export const createAppReview = async (req, res) => {
  const customerId = req.user.userId;
  const { rating, comment } = req.body;
  if (rating === undefined) {
    throw new AppError(400, "rating is required");
  }

  const result = await createAppReviewService(customerId, {
    rating: Number(rating),
    comment,
  });
  return res.status(201).json(result);
};

export const getTopAppReviews = async (_req, res) => {
  const result = await getTopAppReviewsService();
  return res.json(result);
};

export const getAllAppReviews = async (_req, res) => {
  const result = await getAllAppReviewsService();
  return res.json(result);
};
