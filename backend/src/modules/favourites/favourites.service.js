import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { eq } from "drizzle-orm";
import {
  addFavouriteDB,
  getFavouritesByUserDB,
  isFavouriteDB,
  removeFavouriteDB,
} from "./favourites.repository.js";

export const addFavouriteService = async (userId, carId) => {
  const car = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    columns: { id: true },
  });
  if (!car) throw new Error("CAR_NOT_FOUND");

  const favourite = await addFavouriteDB(userId, carId);
  if (!favourite) {
    return { message: "Car already in favourites" };
  }
  return { message: "Added to favourites", favourite };
};

export const removeFavouriteService = async (userId, carId) => {
  const removed = await removeFavouriteDB(userId, carId);
  if (!removed) throw new Error("NOT_IN_FAVOURITES");
  return { message: "Removed from favourites" };
};

export const getMyFavouritesService = async (userId) => {
  const items = await getFavouritesByUserDB(userId);
  return items.map((f) => f.car);
};

export const checkFavouriteService = async (userId, carId) => {
  const isFav = await isFavouriteDB(userId, carId);
  return { isFavourite: isFav };
};
