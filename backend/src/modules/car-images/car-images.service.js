import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { and, eq } from "drizzle-orm";
import {
  addCarImagesDB,
  deleteCarImageDB,
  getCarImagesDB,
  setPrimaryImageDB,
} from "./car-images.repository.js";

export const addCarImagesService = async (carId, dealerUserId, images) => {
  // Verify the car belongs to this dealer
  const car = await db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.dealerId, dealerUserId)),
    columns: { id: true },
  });
  if (!car) throw new Error("CAR_NOT_FOUND");

  // images: [{ imageUrl, sortOrder?, isPrimary? }]
  const toInsert = images.map((img, idx) => ({
    imageUrl: img.imageUrl,
    sortOrder: img.sortOrder ?? idx,
    isPrimary: img.isPrimary ?? false,
  }));

  const added = await addCarImagesDB(carId, toInsert);
  return { message: "Images added successfully", images: added };
};

export const deleteCarImageService = async (imageId, dealerUserId) => {
  const deleted = await deleteCarImageDB(imageId, dealerUserId);
  if (!deleted) throw new Error("IMAGE_NOT_FOUND");
  return { message: "Image deleted successfully" };
};

export const setPrimaryImageService = async (imageId, carId, dealerUserId) => {
  const image = await setPrimaryImageDB(imageId, carId, dealerUserId);
  if (!image) throw new Error("IMAGE_NOT_FOUND");
  return { message: "Primary image updated", image };
};

export const getCarImagesService = async (carId) => {
  return await getCarImagesDB(carId);
};
