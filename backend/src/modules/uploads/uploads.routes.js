import { Router } from "express";
import { upload } from "../../config/cloudinary.js";
import { deleteImage, uploadImage } from "./uploads.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorizeDealer } from "../../middlewares/authorize.middleware.js";

const router = Router();

// Only authenticated dealers can upload car images
router.post(
  "/image",
  authenticate,
  authorizeDealer,
  upload.single("image"),   // field name must be "image"
  uploadImage
);

router.delete(
  "/image",
  authenticate,
  authorizeDealer,
  deleteImage
);

export default router;
