import {
  createReviewService,
  deleteReviewService,
  getCarReviewsService,
  updateReviewService,
} from "./reviews.service.js";

export const createReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { carId, rating, comment } = req.body;

    if (!carId || rating === undefined) {
      return res.status(400).json({ message: "carId and rating are required" });
    }

    const result = await createReviewService(customerId, {
      carId: Number(carId),
      rating: Number(rating),
      comment,
    });
    return res.status(201).json(result);
  } catch (error) {
    const map = {
      CAR_NOT_FOUND: [404, "Car not found"],
      INVALID_RATING: [400, "Rating must be between 1 and 5"],
      ALREADY_REVIEWED: [409, "You have already reviewed this car"],
    };
    const [status, message] = map[error.message] ?? [500, "Failed to submit review"];
    return res.status(status).json({ message });
  }
};

export const updateReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const reviewId = Number(req.params.id);
    const { rating, comment } = req.body;

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const result = await updateReviewService(reviewId, customerId, {
      rating: rating !== undefined ? Number(rating) : undefined,
      comment,
    });
    return res.json(result);
  } catch (error) {
    const map = {
      REVIEW_NOT_FOUND: [404, "Review not found"],
      INVALID_RATING: [400, "Rating must be between 1 and 5"],
    };
    const [status, message] = map[error.message] ?? [500, "Failed to update review"];
    return res.status(status).json({ message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const reviewId = Number(req.params.id);

    if (isNaN(reviewId)) {
      return res.status(400).json({ message: "Invalid review ID" });
    }

    const result = await deleteReviewService(reviewId, customerId);
    return res.json(result);
  } catch (error) {
    if (error.message === "REVIEW_NOT_FOUND") {
      return res.status(404).json({ message: "Review not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

export const getCarReviews = async (req, res) => {
  try {
    const carId = Number(req.params.carId);

    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const result = await getCarReviewsService(carId);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};
