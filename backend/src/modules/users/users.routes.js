import { Router } from "express";
import { getMyProfile, updateMyProfile } from "./users.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/me", authenticate, getMyProfile);
router.put("/me", authenticate, updateMyProfile);

export default router;
