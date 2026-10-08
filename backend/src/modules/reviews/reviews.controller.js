import {
  createReviewService,
  deleteReviewService,
  getCarReviewsService,
  updateReviewService,
  // dealer dashboard
  getDealerReviewsService,
  replyToReviewService,
  dealerDeleteReviewService,
  // app reviews
  createAppReviewService,
  getTopAppReviewsService,
  getAllAppReviewsService,
} from "./reviews.service.js";

/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const errMap = (error, extra = {}) => {
  const map = {
    CAR_NOT_FOUND:            [404, "Car not found"],
    INVALID_RATING:           [400, "Rating must be between 1 and 5"],
    ALREADY_REVIEWED:         [409, "You have already submitted a review"],
    REVIEW_NOT_FOUND:         [404, "Review not found"],
    REPLY_EMPTY:              [400, "Reply text cannot be empty"],
    DEALER_PROFILE_NOT_FOUND: [404, "Dealer profile not found"],
    ...extra,
  };
  return map[error.message] ?? [500, "Something went wrong"];
};

/* ─────────────────────────────────────────────────────────────
   CAR  REVIEWS  (customer ↔ car)
───────────────────────────────────────────────────────────── */

/** POST /reviews */
export const createReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { carId, rating, comment } = req.body;
    if (!carId || rating === undefined)
      return res.status(400).json({ message: "carId and rating are required" });

    const result = await createReviewService(customerId, {
      carId: Number(carId),
      rating: Number(rating),
      comment,
    });
    return res.status(201).json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/** PUT /reviews/:id */
export const updateReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const reviewId = Number(req.params.id);
    const { rating, comment } = req.body;
    const result = await updateReviewService(reviewId, customerId, {
      rating: rating !== undefined ? Number(rating) : undefined,
      comment,
    });
    return res.json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/** DELETE /reviews/:id  (customer deletes their own) */
export const deleteReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const reviewId = Number(req.params.id);
    const result = await deleteReviewService(reviewId, customerId);
    return res.json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/** GET /reviews/car/:carId  (public) */
export const getCarReviews = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    if (isNaN(carId))
      return res.status(400).json({ message: "Invalid car ID" });

    const result = await getCarReviewsService(carId);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

/* ─────────────────────────────────────────────────────────────
   DEALER  DASHBOARD  REVIEW  ENDPOINTS
───────────────────────────────────────────────────────────── */

/** GET /reviews/dealer/mine  — dealer sees all reviews about them */
export const getDealerReviews = async (req, res) => {
  try {
    const userId = req.user.userId;
    const result = await getDealerReviewsService(userId);
    return res.json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/** POST /reviews/:id/reply  — dealer replies to a review */
export const replyToReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviewId = Number(req.params.id);
    const { replyText } = req.body;
    if (!replyText?.trim())
      return res.status(400).json({ message: "Reply text is required" });

    const result = await replyToReviewService(userId, reviewId, replyText);
    return res.json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/** DELETE /reviews/:id/dealer  — dealer removes a review about them */
export const dealerDeleteReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviewId = Number(req.params.id);
    const result = await dealerDeleteReviewService(userId, reviewId);
    return res.json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/* ─────────────────────────────────────────────────────────────
   APP  REVIEWS  (customer reviews the platform)
───────────────────────────────────────────────────────────── */

/** POST /reviews/app  — customer submits an app review */
export const createAppReview = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { rating, comment } = req.body;
    if (rating === undefined)
      return res.status(400).json({ message: "rating is required" });

    const result = await createAppReviewService(customerId, {
      rating: Number(rating),
      comment,
    });
    return res.status(201).json(result);
  } catch (error) {
    const [status, message] = errMap(error);
    return res.status(status).json({ message });
  }
};

/** GET /reviews/app/top  — public, top 5 for Testimonials section */
export const getTopAppReviews = async (_req, res) => {
  try {
    const result = await getTopAppReviewsService();
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch app reviews" });
  }
};

/** GET /reviews/app  — public, all app reviews */
export const getAllAppReviews = async (_req, res) => {
  try {
    const result = await getAllAppReviewsService();
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch app reviews" });
  }
};
