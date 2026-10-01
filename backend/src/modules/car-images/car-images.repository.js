import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { carImages } from "../../db/schemas/car_images.js";
import { cars } from "../../db/schemas/cars.js";

export const addCarImagesDB = async (carId, imageList) => {
  // imageList: [{ imageUrl, sortOrder, isPrimary }]
  const result = await db
    .insert(carImages)
    .values(imageList.map((img) => ({ carId, ...img })))
    .returning();
  return result;
};

export const deleteCarImageDB = async (imageId, dealerUserId) => {
  // Verify the image belongs to one of this dealer's cars
  const image = await db.query.carImages.findFirst({
    where: eq(carImages.id, imageId),
    with: { car: { columns: { dealerId: true } } },
  });

  if (!image) return null;
  if (image.car.dealerId !== dealerUserId) return null;

  const result = await db
    .delete(carImages)
    .where(eq(carImages.id, imageId))
    .returning({ id: carImages.id });

  return result[0] || null;
};

export const setPrimaryImageDB = async (imageId, carId, dealerUserId) => {
  // Verify ownership
  const car = await db.query.cars.findFirst({
    where: and(eq(cars.id, carId), eq(cars.dealerId, dealerUserId)),
    columns: { id: true },
  });
  if (!car) return null;

  // Clear existing primary
  await db
    .update(carImages)
    .set({ isPrimary: false })
    .where(eq(carImages.carId, carId));

  // Set new primary
  const result = await db
    .update(carImages)
    .set({ isPrimary: true })
    .where(and(eq(carImages.id, imageId), eq(carImages.carId, carId)))
    .returning();

  return result[0] || null;
};

export const getCarImagesDB = async (carId) => {
  return await db.query.carImages.findMany({
    where: eq(carImages.carId, carId),
    orderBy: (img, { asc }) => asc(img.sortOrder),
  });
};
