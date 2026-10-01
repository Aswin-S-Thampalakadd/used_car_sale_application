import { Router } from "express";
import {
  createEnquiry,
  deleteEnquiry,
  getMyEnquiries,
  updateEnquiryStatus,
} from "./enquiries.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  authorizeCustomer,
  authorizeDealer,
} from "../../middlewares/authorize.middleware.js";

const router = Router();

// Customer: send an enquiry
router.post("/", authenticate, authorizeCustomer, createEnquiry);

// Both customer and dealer: view their own enquiries
router.get("/me", authenticate, getMyEnquiries);

// Dealer: update enquiry status (new → contacted → closed)
router.patch("/:id/status", authenticate, authorizeDealer, updateEnquiryStatus);

// Customer: delete their enquiry
router.delete("/:id", authenticate, authorizeCustomer, deleteEnquiry);

export default router;
