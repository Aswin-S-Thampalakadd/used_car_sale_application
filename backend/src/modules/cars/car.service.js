import redisClient from "../../redis/index.js";
import { getAllCarsDB, getCarByIdDB } from "./cars.repository.js";

export const getAllCarsService = async (page, limit) => {
  const cacheKey = `cars:page:${page}:limit:${limit}`;
  const cachedCars = await redisClient.get(cacheKey);

  if (cachedCars) {
    return JSON.parse(cachedCars);
  }

  const cars = await getAllCarsDB(page, limit);

  await redisClient.set(cacheKey, JSON.stringify(cars), {
    EX: 60,
  });

  return cars;
};

export const fetchCarById = async (carId) => {
  let car = await getCarByIdDB(carId);
  return car;
};
