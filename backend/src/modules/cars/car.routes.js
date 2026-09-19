import { Router } from "express";
import { getAllCars } from "./cars.controller.js";

const router = Router();

router.get("/", getAllCars);

export default router;
