import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";

export const getAllCarsDB = async (page, limit) => {
  const offset = (page - 1) * limit;

  const result = await db.query.cars.findMany({
    with: {
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
    },
    limit,
    offset,
    orderBy: (cars, { desc }) => [desc(cars.createdAt)],
  });

  return result;
};

export const getCarByIdDB = async (id) => {
  const result = await db.query.cars.findFirst({
    where: eq(cars.id, id),
    with: {
      dealer: true,
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
    },
  });

  return result || null;
};
