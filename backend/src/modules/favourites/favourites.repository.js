import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { favourites } from "../../db/schemas/favourites.js";

export const addFavouriteDB = async (userId, carId) => {
  const result = await db
    .insert(favourites)
    .values({ userId, carId })
    .onConflictDoNothing()
    .returning();
  return result[0] || null;
};

export const removeFavouriteDB = async (userId, carId) => {
  const result = await db
    .delete(favourites)
    .where(and(eq(favourites.userId, userId), eq(favourites.carId, carId)))
    .returning({ carId: favourites.carId });
  return result[0] || null;
};

export const getFavouritesByUserDB = async (userId) => {
  return await db.query.favourites.findMany({
    where: eq(favourites.userId, userId),
    with: {
      car: {
        with: {
          carImages: true,
          carFeatureMappings: { with: { feature: true } },
        },
      },
    },
    orderBy: desc(favourites.createdAt),
  });
};

export const isFavouriteDB = async (userId, carId) => {
  const result = await db.query.favourites.findFirst({
    where: and(eq(favourites.userId, userId), eq(favourites.carId, carId)),
  });
  return !!result;
};
