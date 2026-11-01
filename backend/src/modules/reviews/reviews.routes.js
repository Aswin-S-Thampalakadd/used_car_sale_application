import { Router } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getCarReviews,
  getDealerReviews,
  replyToReview,
  dealerDeleteReview,
  createAppReview,
  getTopAppReviews,
  getAllAppReviews,
} from "./reviews.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  authorizeCustomer,
  authorizeDealer,
} from "../../middlewares/authorize.middleware.js";

const router = Router();

router.get("/car/:carId", getCarReviews);
router.get("/app/top", getTopAppReviews);
router.get("/app", getAllAppReviews);

router.post("/", authenticate, authorizeCustomer, createReview);
router.put("/:id", authenticate, authorizeCustomer, updateReview);
router.delete("/:id", authenticate, authorizeCustomer, deleteReview);
router.post("/app", authenticate, authorizeCustomer, createAppReview);

router.get("/dealer/mine", authenticate, authorizeDealer, getDealerReviews);
router.post("/:id/reply", authenticate, authorizeDealer, replyToReview);
router.delete("/:id/dealer", authenticate, authorizeDealer, dealerDeleteReview);

export default router;
