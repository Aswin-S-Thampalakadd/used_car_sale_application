/**
 * POST /api/v1/uploads/image
 * Upload a single car image to Cloudinary.
 * Multer (via CloudinaryStorage) handles the actual upload before this runs.
 */
export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // multer-storage-cloudinary attaches these to req.file
    const { path: imageUrl, filename: publicId } = req.file;

    return res.status(201).json({
      success: true,
      imageUrl,   // full Cloudinary HTTPS URL — ready to save to DB
      publicId,   // e.g. "wheelzloop/cars/abc123" — useful if you need to delete later
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

/**
 * DELETE /api/v1/uploads/image
 * Delete an image from Cloudinary by publicId.
 * Body: { publicId }
 */
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: "publicId is required" });
    }

    const { cloudinary } = await import("../../config/cloudinary.js");
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      return res.status(500).json({ message: "Failed to delete image from Cloudinary" });
    }

    return res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return res.status(500).json({ message: "Failed to delete image" });
  }
};
