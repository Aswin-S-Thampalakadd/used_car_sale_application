import { Router } from "express";
import {
  addCarImages,
  deleteCarImage,
  getCarImages,
  setPrimaryImage,
} from "./car-images.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeDealer } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Public: list images for a car
router.get("/:carId/images", getCarImages);

// Dealer only: manage images
router.post("/:carId/images", authenticate, authorizeDealer, addCarImages);
router.delete(
  "/:carId/images/:imageId",
  authenticate,
  authorizeDealer,
  deleteCarImage
);
router.patch(
  "/:carId/images/:imageId/primary",
  authenticate,
  authorizeDealer,
  setPrimaryImage
);

export default router;
