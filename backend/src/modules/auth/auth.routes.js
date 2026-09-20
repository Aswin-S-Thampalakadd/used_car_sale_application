import { Router } from "express";

import {
  customerSignup,
  customerLogin,
  refreshAccessToken,
  logout,
} from "./auth.controller.js";

const router = Router();

router.post("/customer/signup", customerSignup);
router.post("/customer/login", customerLogin);
router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

export default router;
