import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeDealer, authorizeOperator } from "../../middlewares/authorize.middleware.js";
import {
  activateOperator,
  changeMyPassword,
  checkCarLimit,
  createOperator,
  deactivateOperator,
  deleteOperator,
  getMyOperatorProfile,
  getMyOperators,
  resetOperatorPassword,
} from "./operators.controller.js";

const router = Router();

router.use(authenticate);

router.get("/mine", authorizeDealer, getMyOperators);
router.post("/", authorizeDealer, createOperator);
router.patch("/:id/activate", authorizeDealer, activateOperator);
router.patch("/:id/deactivate", authorizeDealer, deactivateOperator);
router.delete("/:id", authorizeDealer, deleteOperator);
router.patch("/:id/reset-password", authorizeDealer, resetOperatorPassword);

router.get("/me/profile", authorizeOperator, getMyOperatorProfile);
router.patch("/me/change-password", authorizeOperator, changeMyPassword);
router.get("/me/car-limit", authorizeOperator, checkCarLimit);

export default router;
