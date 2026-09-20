import { fetchCarById, getAllCarsService } from "./car.service.js";

export const getAllCars = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const result = await getAllCarsService(page, limit);

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
