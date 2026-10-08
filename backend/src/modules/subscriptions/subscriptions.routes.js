import { Router } from "express";
import {
  checkCarLimit,
  createSubscriptionOrder,
  getAvailablePlans,
  getMySubscription,
  getMySubscriptionHistory,
  verifyPayment,
} from "./subscriptions.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeDealer } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Public route: get available plans
router.get("/plans", getAvailablePlans);

// Protected routes (dealer only)
router.get("/my-plan", authenticate, authorizeDealer, getMySubscription);
router.get("/history", authenticate, authorizeDealer, getMySubscriptionHistory);
router.get("/check-limit", authenticate, authorizeDealer, checkCarLimit);
router.post("/create-order", authenticate, authorizeDealer, createSubscriptionOrder);
router.post("/verify-payment", authenticate, authorizeDealer, verifyPayment);

export default router;
