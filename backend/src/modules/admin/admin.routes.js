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
import { getAllOperatorsAdmin } from "../operators/operators.controller.js";

const router = Router();

router.post("/login", adminLogin);

router.use(authenticate, authorizeAdmin);

router.get("/dashboard/stats", getDashboardStats);

router.get("/dealers", getAllDealers);
router.patch("/dealers/:id/verify", verifyDealer);
router.patch("/dealers/:userId/activate", activateUser);
router.patch("/dealers/:userId/deactivate", deactivateUser);
router.delete("/dealers/:userId", deleteUser);

router.get("/customers", getAllCustomers);
router.patch("/customers/:userId/activate", activateUser);
router.patch("/customers/:userId/deactivate", deactivateUser);
router.delete("/customers/:userId", deleteUser);

router.get("/operators", getAllOperatorsAdmin);
router.patch("/operators/:userId/activate", activateUser);
router.patch("/operators/:userId/deactivate", deactivateUser);
router.delete("/operators/:userId", deleteUser);

router.get("/cars", getAllCars);
router.patch("/cars/:carId/status", updateCarStatus);
router.patch("/cars/:carId/featured", toggleCarFeatured);
router.delete("/cars/:carId", deleteCar);

router.get("/enquiries", getAllEnquiries);

router.get("/reviews", getAllReviews);
router.patch("/reviews/:reviewId/approve", approveReview);
router.delete("/reviews/:reviewId", deleteReview);

router.get("/subscriptions", getAllSubscriptions);

export default router;
