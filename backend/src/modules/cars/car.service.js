import { getAllCarsDB } from "./cars.repository.js";

export const getAllCarsService = (page, limit) => {
  return getAllCarsDB(page, limit);
};
