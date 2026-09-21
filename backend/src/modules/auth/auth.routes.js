import { Router } from "express";

import { authenticate } from "../../middlewares/auth.middleware.js";
import {
  activateAccount,
  customerLogin,
  customerSignup,
  deactivateAccount,
  dealerLogin,
  dealerSignup,
  deleteAccount,
  logout,
  refreshAccessToken,
} from "./auth.controller.js";

const router = Router();

router.post("/customer/signup", customerSignup);
router.post("/customer/login", customerLogin);

router.post("/dealer/signup", dealerSignup);
router.post("/dealer/login", dealerLogin);

router.post("/refresh", refreshAccessToken);
router.post("/logout", logout);

router.patch("/account/deactivate", authenticate, deactivateAccount);
router.patch("/account/activate", authenticate, activateAccount);
router.delete("/account", authenticate, deleteAccount);

export default router;
