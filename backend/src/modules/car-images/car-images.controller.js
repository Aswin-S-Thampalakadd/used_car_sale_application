import {
  addCarImagesService,
  deleteCarImageService,
  getCarImagesService,
  setPrimaryImageService,
} from "./car-images.service.js";

export const addCarImages = async (req, res) => {
  try {
    const dealerUserId = req.user.userId;
    const carId = Number(req.params.carId);
    const { images } = req.body;

    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }
    if (!Array.isArray(images) || images.length === 0) {
      return res
        .status(400)
        .json({ message: "images array is required" });
    }
    for (const img of images) {
      if (!img.imageUrl) {
        return res
          .status(400)
          .json({ message: "Each image must have an imageUrl" });
      }
    }

    const result = await addCarImagesService(carId, dealerUserId, images);
    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({ message: "Car not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to add images" });
  }
};

export const deleteCarImage = async (req, res) => {
  try {
    const dealerUserId = req.user.userId;
    const imageId = Number(req.params.imageId);

    if (isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid image ID" });
    }

    const result = await deleteCarImageService(imageId, dealerUserId);
    return res.json(result);
  } catch (error) {
    if (error.message === "IMAGE_NOT_FOUND") {
      return res.status(404).json({ message: "Image not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to delete image" });
  }
};

export const setPrimaryImage = async (req, res) => {
  try {
    const dealerUserId = req.user.userId;
    const carId = Number(req.params.carId);
    const imageId = Number(req.params.imageId);

    if (isNaN(carId) || isNaN(imageId)) {
      return res.status(400).json({ message: "Invalid IDs" });
    }

    const result = await setPrimaryImageService(imageId, carId, dealerUserId);
    return res.json(result);
  } catch (error) {
    if (error.message === "IMAGE_NOT_FOUND") {
      return res.status(404).json({ message: "Image not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to set primary image" });
  }
};

export const getCarImages = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }
    const images = await getCarImagesService(carId);
    return res.json({ images });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch images" });
  }
};
