import { Router } from "express";
import {
  createReview,
  updateReview,
  deleteReview,
  getCarReviews,
  // dealer dashboard
  getDealerReviews,
  replyToReview,
  dealerDeleteReview,
  // app reviews
  createAppReview,
  getTopAppReviews,
  getAllAppReviews,
} from "./reviews.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeCustomer, authorizeDealer } from "../../middlewares/authorize.middleware.js";

const router = Router();

/* ── Public ─────────────────────────────────────── */
router.get("/car/:carId",   getCarReviews);
router.get("/app/top",      getTopAppReviews);   // top 5 for Testimonials
router.get("/app",          getAllAppReviews);

/* ── Customer ───────────────────────────────────── */
router.post("/",            authenticate, authorizeCustomer, createReview);
router.put("/:id",          authenticate, authorizeCustomer, updateReview);
router.delete("/:id",       authenticate, authorizeCustomer, deleteReview);
router.post("/app",         authenticate, authorizeCustomer, createAppReview);

/* ── Dealer dashboard ───────────────────────────── */
router.get("/dealer/mine",       authenticate, authorizeDealer, getDealerReviews);
router.post("/:id/reply",        authenticate, authorizeDealer, replyToReview);
router.delete("/:id/dealer",     authenticate, authorizeDealer, dealerDeleteReview);

export default router;
