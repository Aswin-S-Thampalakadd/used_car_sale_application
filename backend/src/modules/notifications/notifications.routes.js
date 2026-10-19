import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  getMyNotifications,
  markAllRead,
  markRead,
  markUnread,
} from "./notifications.controller.js";

const router = Router();

// All notification routes require auth
router.use(authenticate);

router.get("/me",              getMyNotifications);
router.patch("/read-all",      markAllRead);
router.patch("/:id/read",      markRead);
router.patch("/:id/unread",    markUnread);

export default router;
