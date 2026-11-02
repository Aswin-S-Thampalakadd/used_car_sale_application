import { AppError } from "../../utils/AppError.js";
import {
  addFavouriteService,
  checkFavouriteService,
  getMyFavouritesService,
  removeFavouriteService,
} from "./favourites.service.js";

export const addFavourite = async (req, res) => {
  const userId = req.user.userId;
  const carId = Number(req.params.carId);

  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }

  const result = await addFavouriteService(userId, carId);
  return res.status(201).json(result);
};

export const removeFavourite = async (req, res) => {
  const userId = req.user.userId;
  const carId = Number(req.params.carId);

  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }

  const result = await removeFavouriteService(userId, carId);
  return res.json(result);
};

export const getMyFavourites = async (req, res) => {
  const userId = req.user.userId;
  const cars = await getMyFavouritesService(userId);
  return res.json({ cars });
};

export const checkFavourite = async (req, res) => {
  const userId = req.user.userId;
  const carId = Number(req.params.carId);

  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }

  const result = await checkFavouriteService(userId, carId);
  return res.json(result);
};
