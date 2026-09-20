import {
  fetchCarById,
  getAllCarsService,
  getAvailableCarBrandsService,
  getRecentlyAddedCarsService,
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
