import { Router } from "express";
import {
  addCar,
  getAllCars,
  getAvailableCarBrands,
  getCarById,
  getFeaturedCars,
  getLocationRecommendedCars,
  getRecentlyAddedCars,
  searchCars,
  updateCar,
  deleteCar,
  updateCarStatus,
} from "./cars.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeDealer } from "../../middlewares/authorize.middleware.js";

const router = Router();

router.get("/", getAllCars);
router.post("/", authenticate, authorizeDealer, addCar);
router.get("/featured", getFeaturedCars);
router.get("/brands", getAvailableCarBrands);
router.get("/recent", getRecentlyAddedCars);
router.get("/search", searchCars);
router.get("/location-recommendations", getLocationRecommendedCars);

router.get("/:id", getCarById);
router.put("/:id", authenticate, authorizeDealer, updateCar);
router.delete("/:id", authenticate, authorizeDealer, deleteCar);
router.patch("/:id/status", authenticate, authorizeDealer, updateCarStatus);

export default router;
