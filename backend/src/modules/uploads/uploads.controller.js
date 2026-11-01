export const uploadImage = (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { path: imageUrl, filename: publicId } = req.file;

    return res.status(201).json({
      success: true,
      imageUrl,
      publicId,
    });
  } catch (error) {
    return res.status(500).json({ message: "Image upload failed" });
  }
};

export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body;
    if (!publicId) {
      return res.status(400).json({ message: "publicId is required" });
    }

    const { cloudinary } = await import("../../config/cloudinary.js");
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result !== "ok" && result.result !== "not found") {
      return res
        .status(500)
        .json({ message: "Failed to delete image from Cloudinary" });
    }

    return res.json({ success: true, message: "Image deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete image" });
  }
};
