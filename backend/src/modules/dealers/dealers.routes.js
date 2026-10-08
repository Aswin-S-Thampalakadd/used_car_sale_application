import { Router } from "express";
import {
  getMyDealerCars,
  getMyDealerProfile,
  getPublicDealerProfile,
  updateDealerProfile,
} from "./dealers.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeDealer } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Dealer-only: own profile and listings (must come BEFORE /:id)
router.get("/me/profile", authenticate, authorizeDealer, getMyDealerProfile);
router.put("/me/profile", authenticate, authorizeDealer, updateDealerProfile);
router.get("/me/cars", authenticate, authorizeDealer, getMyDealerCars);

// Public: view any dealer's profile (comes AFTER /me/* routes)
router.get("/:id", getPublicDealerProfile);

export default router;
