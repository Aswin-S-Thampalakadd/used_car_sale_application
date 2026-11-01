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

router.get("/:carId/images", getCarImages);

router.post("/:carId/images", authenticate, authorizeDealer, addCarImages);
router.delete(
  "/:carId/images/:imageId",
  authenticate,
  authorizeDealer,
  deleteCarImage,
);
router.patch(
  "/:carId/images/:imageId/primary",
  authenticate,
  authorizeDealer,
  setPrimaryImage,
);

export default router;
