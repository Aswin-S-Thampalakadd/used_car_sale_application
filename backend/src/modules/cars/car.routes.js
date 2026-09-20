import { Router } from "express";
import { getAllCars, getCarById } from "./cars.controller.js";

const router = Router();

router.get("/", getAllCars);
router.get("/:id", getCarById);

export default router;
