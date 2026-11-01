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

router.post("/", authenticate, authorizeCustomer, createEnquiry);

router.get("/me", authenticate, getMyEnquiries);

router.patch("/:id/status", authenticate, authorizeDealer, updateEnquiryStatus);

router.delete("/:id", authenticate, authorizeCustomer, deleteEnquiry);

export default router;
