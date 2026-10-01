import { Router } from "express";
import {
  createReview,
  deleteReview,
  getCarReviews,
  updateReview,
} from "./reviews.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeCustomer } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Public: get reviews for a car
router.get("/car/:carId", getCarReviews);

// Customer only: create / update / delete their own review
router.post("/", authenticate, authorizeCustomer, createReview);
router.put("/:id", authenticate, authorizeCustomer, updateReview);
router.delete("/:id", authenticate, authorizeCustomer, deleteReview);

export default router;
