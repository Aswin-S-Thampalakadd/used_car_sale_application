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

// Public: view any dealer's profile
router.get("/:id", getPublicDealerProfile);

// Dealer-only: own profile and listings
router.get("/me/profile", authenticate, authorizeDealer, getMyDealerProfile);
router.put("/me/profile", authenticate, authorizeDealer, updateDealerProfile);
router.get("/me/cars", authenticate, authorizeDealer, getMyDealerCars);

export default router;
