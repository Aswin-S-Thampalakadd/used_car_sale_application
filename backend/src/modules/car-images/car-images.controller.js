import { AppError } from "../../utils/AppError.js";
import {
  addCarImagesService,
  deleteCarImageService,
  getCarImagesService,
  setPrimaryImageService,
} from "./car-images.service.js";

export const addCarImages = async (req, res) => {
  const dealerUserId = req.user.userId;
  const carId = Number(req.params.carId);
  const { images } = req.body;

  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }
  if (!Array.isArray(images) || images.length === 0) {
    throw new AppError(400, "images array is required");
  }
  for (const img of images) {
    if (!img.imageUrl) {
      throw new AppError(400, "Each image must have an imageUrl");
    }
  }

  const result = await addCarImagesService(carId, dealerUserId, images);
  return res.status(201).json(result);
};

export const deleteCarImage = async (req, res) => {
  const dealerUserId = req.user.userId;
  const imageId = Number(req.params.imageId);

  if (isNaN(imageId)) {
    throw new AppError(400, "Invalid image ID");
  }

  const result = await deleteCarImageService(imageId, dealerUserId);
  return res.json(result);
};

export const setPrimaryImage = async (req, res) => {
  const dealerUserId = req.user.userId;
  const carId = Number(req.params.carId);
  const imageId = Number(req.params.imageId);

  if (isNaN(carId) || isNaN(imageId)) {
    throw new AppError(400, "Invalid IDs");
  }

  const result = await setPrimaryImageService(imageId, carId, dealerUserId);
  return res.json(result);
};

export const getCarImages = async (req, res) => {
  const carId = Number(req.params.carId);
  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }
  const images = await getCarImagesService(carId);
  return res.json({ images });
};
