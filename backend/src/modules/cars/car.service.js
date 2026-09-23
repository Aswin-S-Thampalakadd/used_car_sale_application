import redisClient from "../../redis/index.js";
import {
  createCar,
  deleteCar,
  findDealerCarById,
  getAllCarsDB,
  getAvailableCarBrandsDB,
  getCarByIdDB,
  getFeaturedCarsDB,
  getLocationRecommendedCarsDB,
  getRecentlyAddedCarsDB,
  searchCarsDB,
  updateCar,
  updateCarStatus,
} from "./cars.repository.js";

const validStatuses = ["draft", "active", "sold", "reserved", "inactive"];

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

export const addCarService = async (dealerId, data) => {
  const car = await createCar({
    dealerId,
    make: data.make.trim(),
    model: data.model.trim(),
    variant: data.variant || null,
    year: data.year,
    registrationYear: data.registrationYear || null,
    fuelType: data.fuelType,
    transmission: data.transmission,
    kilometersDriven: data.kilometersDriven,
    price: data.price,
    color: data.color || null,
    condition: data.condition || null,
    description: data.description || null,
    registrationNumber: data.registrationNumber || null,
    isNegotiable: data.isNegotiable !== undefined ? data.isNegotiable : true,
    status: data.status || "draft",
    isFeatured: false,
  });

  return {
    message: "Car added successfully",
    car,
  };
};

export const updateCarService = async (carId, dealerId, data) => {
  const existingCar = await findDealerCarById(carId, dealerId);

  if (!existingCar) {
    throw new Error("CAR_NOT_FOUND");
  }

  const car = await updateCar(carId, dealerId, {
    make: data.make?.trim(),
    model: data.model?.trim(),
    variant: data.variant,
    year: data.year,
    registrationYear: data.registrationYear,
    fuelType: data.fuelType,
    transmission: data.transmission,
    kilometersDriven: data.kilometersDriven,
    price: data.price,
    color: data.color,
    condition: data.condition,
    description: data.description,
    registrationNumber: data.registrationNumber,
    isNegotiable: data.isNegotiable,
  });

  return {
    message: "Car updated successfully",
    car,
  };
};

export const deleteCarService = async (carId, dealerId) => {
  const existingCar = await findDealerCarById(carId, dealerId);

  if (!existingCar) {
    throw new Error("CAR_NOT_FOUND");
  }

  await deleteCar(carId, dealerId);

  return {
    message: "Car deleted successfully",
  };
};

export const updateCarStatusService = async (carId, dealerId, status) => {
  if (!validStatuses.includes(status)) {
    throw new Error("INVALID_STATUS");
  }

  const existingCar = await findDealerCarById(carId, dealerId);

  if (!existingCar) {
    throw new Error("CAR_NOT_FOUND");
  }

  const car = await updateCarStatus(carId, dealerId, status);

  return {
    message: "Car status updated successfully",
    car,
  };
};

export const getFeaturedCarsService = async (limit) => {
  const cars = await getFeaturedCarsDB(limit);

  return cars;
};

export const searchCarsService = async (filters) => {
  return await searchCarsDB(filters);
};

export const getLocationRecommendedCarsService = async ({
  city,
  state,
  limit,
}) => {
  return await getLocationRecommendedCarsDB({
    city,
    state,
    limit,
  });
};
