import { AppError } from "../../utils/AppError.js";
import {
  addCarService,
  deleteCarService,
  fetchCarById,
  getAllCarsService,
  getAvailableCarBrandsService,
  getFeaturedCarsService,
  getLocationRecommendedCarsService,
  getRecentlyAddedCarsService,
  searchCarsService,
  updateCarService,
  updateCarStatusService,
} from "./car.service.js";

export const getAllCars = async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);

  const filters = {
    make: req.query.make,
    model: req.query.model,
    variant: req.query.variant,
    year: req.query.year ? Number(req.query.year) : undefined,
    minYear: req.query.minYear ? Number(req.query.minYear) : undefined,
    maxYear: req.query.maxYear ? Number(req.query.maxYear) : undefined,
    registrationYear: req.query.registrationYear
      ? Number(req.query.registrationYear)
      : undefined,
    minRegistrationYear: req.query.minRegistrationYear
      ? Number(req.query.minRegistrationYear)
      : undefined,
    maxRegistrationYear: req.query.maxRegistrationYear
      ? Number(req.query.maxRegistrationYear)
      : undefined,
    fuelType: req.query.fuelType,
    transmission: req.query.transmission,
    minKm: req.query.minKm ? Number(req.query.minKm) : undefined,
    maxKm: req.query.maxKm ? Number(req.query.maxKm) : undefined,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    color: req.query.color,
    condition: req.query.condition,
    status: req.query.status,
    isNegotiable:
      req.query.isNegotiable !== undefined
        ? req.query.isNegotiable === "true"
        : undefined,
    isFeatured:
      req.query.isFeatured !== undefined
        ? req.query.isFeatured === "true"
        : undefined,
    dealerId: req.query.dealerId ? Number(req.query.dealerId) : undefined,
    featureIds: req.query.featureIds
      ? req.query.featureIds.split(",").map(Number).filter(Boolean)
      : undefined,
    sortBy: req.query.sortBy,
    sortOrder: req.query.sortOrder,
  };

  const result = await getAllCarsService(page, limit, filters);

  res.json(result);
};

export const getCarById = async (req, res) => {
  const { id } = req.params;

  const segments = id.split("-");
  const carId = parseInt(segments[segments.length - 1], 10);

  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }

  const data = await fetchCarById(carId);

  if (!data) {
    throw new AppError(404, "Car not found");
  }

  return res.status(200).json(data);
};

export const getAvailableCarBrands = async (_req, res) => {
  const brands = await getAvailableCarBrandsService();

  res.json({ brands });
};

export const getRecentlyAddedCars = async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

  const cars = await getRecentlyAddedCarsService(limit);

  res.json({ cars });
};

export const addCar = async (req, res) => {
  const dealerId = req.user.userId;

  const {
    make,
    model,
    variant,
    year,
    registrationYear,
    fuelType,
    transmission,
    kilometersDriven,
    price,
    color,
    condition,
    description,
    registrationNumber,
    isNegotiable,
    status,
  } = req.body;

  if (
    !make ||
    !model ||
    !year ||
    !fuelType ||
    !transmission ||
    kilometersDriven === undefined ||
    !price
  ) {
    throw new AppError(
      400,
      "Make, model, year, fuel type, transmission, kilometers driven and price are required",
    );
  }

  const result = await addCarService(dealerId, {
    make,
    model,
    variant,
    year,
    registrationYear,
    fuelType,
    transmission,
    kilometersDriven,
    price,
    color,
    condition,
    description,
    registrationNumber,
    isNegotiable,
    status,
  });

  return res.status(201).json(result);
};

export const updateCar = async (req, res) => {
  const dealerId = req.user.userId;
  const carId = Number(req.params.id);

  if (!carId) {
    throw new AppError(400, "Invalid car ID");
  }

  const result = await updateCarService(carId, dealerId, req.body);

  return res.json(result);
};

export const deleteCar = async (req, res) => {
  const dealerId = req.user.userId;
  const carId = Number(req.params.id);

  if (!carId) {
    throw new AppError(400, "Invalid car ID");
  }

  const result = await deleteCarService(carId, dealerId);

  return res.json(result);
};

export const updateCarStatus = async (req, res) => {
  const dealerId = req.user.userId;
  const carId = Number(req.params.id);
  const { status } = req.body;

  if (!carId) {
    throw new AppError(400, "Invalid car ID");
  }

  if (!status) {
    throw new AppError(400, "Status is required");
  }

  const result = await updateCarStatusService(carId, dealerId, status);

  return res.json(result);
};

export const getFeaturedCars = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const cars = await getFeaturedCarsService(limit);

  res.status(200).json({
    success: true,
    count: cars.length,
    cars,
  });
};

export const searchCars = async (req, res) => {
  const {
    search,
    make,
    model,
    fuelType,
    transmission,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    minKilometers,
    maxKilometers,
  } = req.query;

  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  const cars = await searchCarsService({
    search,
    make,
    model,
    fuelType,
    transmission,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    minYear: minYear ? Number(minYear) : undefined,
    maxYear: maxYear ? Number(maxYear) : undefined,
    minKilometers: minKilometers ? Number(minKilometers) : undefined,
    maxKilometers: maxKilometers ? Number(maxKilometers) : undefined,
    page,
    limit,
  });

  res.status(200).json({
    success: true,
    page,
    limit,
    count: cars.length,
    cars,
  });
};

export const getLocationRecommendedCars = async (req, res) => {
  const { city, state } = req.query;
  const limit = Math.min(Number(req.query.limit) || 10, 50);

  if (!city && !state) {
    throw new AppError(400, "City or state is required");
  }

  const cars = await getLocationRecommendedCarsService({
    city,
    state,
    limit,
  });

  res.status(200).json({
    success: true,
    count: cars.length,
    cars,
  });
};
