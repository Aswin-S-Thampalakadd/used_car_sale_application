import {
  addFavouriteService,
  checkFavouriteService,
  getMyFavouritesService,
  removeFavouriteService,
} from "./favourites.service.js";

export const addFavourite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const carId = Number(req.params.carId);

    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const result = await addFavouriteService(userId, carId);
    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({ message: "Car not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to add favourite" });
  }
};

export const removeFavourite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const carId = Number(req.params.carId);

    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const result = await removeFavouriteService(userId, carId);
    return res.json(result);
  } catch (error) {
    if (error.message === "NOT_IN_FAVOURITES") {
      return res.status(404).json({ message: "Car not in favourites" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to remove favourite" });
  }
};

export const getMyFavourites = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cars = await getMyFavouritesService(userId);
    return res.json({ cars });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch favourites" });
  }
};

export const checkFavourite = async (req, res) => {
  try {
    const userId = req.user.userId;
    const carId = Number(req.params.carId);

    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const result = await checkFavouriteService(userId, carId);
    return res.json(result);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to check favourite" });
  }
};
