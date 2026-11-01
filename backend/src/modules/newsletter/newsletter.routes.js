import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeAdmin } from "../../middlewares/authorize.middleware.js";
import {
  confirm,
  getSubscribers,
  subscribe,
  unsubscribe,
} from "./newsletter.controller.js";

const router = Router();

router.post("/subscribe", subscribe);
router.get("/confirm/:token", confirm);
router.get("/unsubscribe/:token", unsubscribe);
router.get("/subscribers", authenticate, authorizeAdmin, getSubscribers);

export default router;
