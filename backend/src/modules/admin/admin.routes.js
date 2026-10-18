import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../../middlewares/authorize.middleware.js";
import {
  adminLogin,
  getDashboardStats,
  getAllDealers,
  verifyDealer,
  getAllCustomers,
  activateUser,
  deactivateUser,
  deleteUser,
  getAllCars,
  updateCarStatus,
  toggleCarFeatured,
  deleteCar,
  getAllEnquiries,
  getAllReviews,
  deleteReview,
  approveReview,
  getAllSubscriptions,
} from "./admin.controller.js";

const router = Router();

// ── Public: admin login ───────────────────────────────────────────────────────
router.post("/login", adminLogin);

// ── All routes below require auth + admin role ────────────────────────────────
router.use(authenticate, authorizeAdmin);

// Dashboard
router.get("/dashboard/stats", getDashboardStats);

// Dealers
router.get("/dealers", getAllDealers);
router.patch("/dealers/:id/verify", verifyDealer);
router.patch("/dealers/:userId/activate", activateUser);
router.patch("/dealers/:userId/deactivate", deactivateUser);
router.delete("/dealers/:userId", deleteUser);

// Customers
router.get("/customers", getAllCustomers);
router.patch("/customers/:userId/activate", activateUser);
router.patch("/customers/:userId/deactivate", deactivateUser);
router.delete("/customers/:userId", deleteUser);

// Cars
router.get("/cars", getAllCars);
router.patch("/cars/:carId/status", updateCarStatus);
router.patch("/cars/:carId/featured", toggleCarFeatured);
router.delete("/cars/:carId", deleteCar);

// Enquiries
router.get("/enquiries", getAllEnquiries);

// Reviews
router.get("/reviews", getAllReviews);
router.patch("/reviews/:reviewId/approve", approveReview);
router.delete("/reviews/:reviewId", deleteReview);

// Subscriptions
router.get("/subscriptions", getAllSubscriptions);

export default router;
