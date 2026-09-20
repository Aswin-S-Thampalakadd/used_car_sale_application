import redisClient from "../../redis/index.js";
import {
  getAllCarsDB,
  getAvailableCarBrandsDB,
  getCarByIdDB,
  getRecentlyAddedCarsDB,
} from "./cars.repository.js";

export const getAllCarsService = async (page, limit, filters) => {
  const cacheKey = `cars:${JSON.stringify({
    page,
    limit,
    filters,
  })}`;

  const cachedCars = await redisClient.get(cacheKey);

  if (cachedCars) {
    return JSON.parse(cachedCars);
  }

  const cars = await getAllCarsDB(page, limit, filters);

  await redisClient.set(cacheKey, JSON.stringify(cars), {
    EX: 60,
  });

  return cars;
};

export const fetchCarById = async (carId) => {
  let car = await getCarByIdDB(carId);
  return car;
};

export const getAvailableCarBrandsService = async () => {
  const cacheKey = "cars:brands";

  const cachedBrands = await redisClient.get(cacheKey);

  if (cachedBrands) {
    return JSON.parse(cachedBrands);
  }

  const brands = await getAvailableCarBrandsDB();

  await redisClient.set(cacheKey, JSON.stringify(brands), {
    EX: 3600,
  });

  return brands;
};

export const getRecentlyAddedCarsService = async (limit) => {
  const cacheKey = `cars:recent:limit:${limit}`;

  const cachedCars = await redisClient.get(cacheKey);

  if (cachedCars) {
    return JSON.parse(cachedCars);
  }

  const cars = await getRecentlyAddedCarsDB(limit);

  await redisClient.set(cacheKey, JSON.stringify(cars), {
    EX: 60,
  });

  return cars;
};
