import { Router } from "express";
import {
  getAllCars,
  getAvailableCarBrands,
  getCarById,
  getRecentlyAddedCars,
} from "./cars.controller.js";

const router = Router();

router.get("/", getAllCars);
router.get("/brands", getAvailableCarBrands);
router.get("/recent", getRecentlyAddedCars);
router.get("/:id", getCarById);

export default router;
