import { Router } from "express";
import {
  addCar,
  getAllCars,
  getAvailableCarBrands,
  getCarById,
  getRecentlyAddedCars,
} from "./cars.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { deleteCar, updateCar, updateCarStatus } from "./cars.repository.js";

const router = Router();

router.get("/", getAllCars);
router.get("/brands", getAvailableCarBrands);
router.get("/recent", getRecentlyAddedCars);
router.get("/:id", getCarById);

router.post("/", authenticate, addCar);

router.put("/:id", authenticate, updateCar);

router.delete("/:id", authenticate, deleteCar);

router.patch("/:id/status", authenticate, updateCarStatus);

export default router;
