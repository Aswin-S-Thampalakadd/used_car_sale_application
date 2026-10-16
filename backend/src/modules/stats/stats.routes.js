import { Router } from "express";
import { getPlatformStats } from "./stats.controller.js";

const router = Router();

router.get("/", getPlatformStats); // public — no auth needed

export default router;
