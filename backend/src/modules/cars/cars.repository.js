import { desc } from "drizzle-orm";
import { db } from "../../db/index.js";

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
