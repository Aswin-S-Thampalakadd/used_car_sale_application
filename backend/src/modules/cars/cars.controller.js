import {
  addCarService,
  deleteCarService,
  fetchCarById,
  getAllCarsService,
  getAvailableCarBrandsService,
  getRecentlyAddedCarsService,
  updateCarService,
  updateCarStatusService,
} from "./car.service.js";

export const getAllCars = async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch cars",
    });
  }
};

export const getCarById = async (req, res) => {
  try {
    const { id } = req.params;
    const carId = parseInt(id);

    if (isNaN(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const data = await fetchCarById(carId);

    if (!data) {
      return res.status(404).json({ message: "Car not found" });
    }

    return res.status(200).json(data);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAvailableCarBrands = async (req, res) => {
  try {
    const brands = await getAvailableCarBrandsService();

    res.json({
      brands,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch car brands",
    });
  }
};

export const getRecentlyAddedCars = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);

    const cars = await getRecentlyAddedCarsService(limit);

    res.json({
      cars,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch recently added cars",
    });
  }
};

export const addCar = async (req, res) => {
  try {
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
      return res.status(400).json({
        message:
          "Make, model, year, fuel type, transmission, kilometers driven and price are required",
      });
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
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to add car",
    });
  }
};

export const updateCar = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const carId = Number(req.params.id);

    if (!carId) {
      return res.status(400).json({
        message: "Invalid car ID",
      });
    }

    const result = await updateCarService(carId, dealerId, req.body);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    return res.status(500).json({
      message: "Failed to update car",
    });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const carId = Number(req.params.id);

    if (!carId) {
      return res.status(400).json({
        message: "Invalid car ID",
      });
    }

    const result = await deleteCarService(carId, dealerId);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    return res.status(500).json({
      message: "Failed to delete car",
    });
  }
};

export const updateCarStatus = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const carId = Number(req.params.id);
    const { status } = req.body;

    if (!carId) {
      return res.status(400).json({
        message: "Invalid car ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Status is required",
      });
    }

    const result = await updateCarStatusService(carId, dealerId, status);

    return res.json(result);
  } catch (error) {
    console.error(error);

    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (error.message === "INVALID_STATUS") {
      return res.status(400).json({
        message: "Invalid car status",
      });
    }

    return res.status(500).json({
      message: "Failed to update car status",
    });
  }
};
