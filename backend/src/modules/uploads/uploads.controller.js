import { AppError } from "../../utils/AppError.js";

export const uploadImage = (req, res) => {
  if (!req.file) {
    throw new AppError(400, "No file uploaded");
  }

  const { path: imageUrl, filename: publicId } = req.file;

  return res.status(201).json({
    success: true,
    imageUrl,
    publicId,
  });
};

export const deleteImage = async (req, res) => {
  const { publicId } = req.body;
  if (!publicId) {
    throw new AppError(400, "publicId is required");
  }

  const { cloudinary } = await import("../../config/cloudinary.js");
  const result = await cloudinary.uploader.destroy(publicId);

  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError(500, "Failed to delete image from Cloudinary");
  }

  return res.json({ success: true, message: "Image deleted" });
};
