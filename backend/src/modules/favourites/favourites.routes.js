import { Router } from "express";
import {
  addFavourite,
  checkFavourite,
  getMyFavourites,
  removeFavourite,
} from "./favourites.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

// All favourite actions require auth (any user type)
router.get("/", authenticate, getMyFavourites);
router.post("/:carId", authenticate, addFavourite);
router.delete("/:carId", authenticate, removeFavourite);
router.get("/:carId/check", authenticate, checkFavourite);

export default router;
