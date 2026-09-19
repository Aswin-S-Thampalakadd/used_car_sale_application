import { jest } from "@jest/globals";

jest.unstable_mockModule(
  "../../../src/modules/cars/cars.repository.js",
  () => ({
    getAllCarsDB: jest.fn(),
  })
);

const { getAllCarsDB } = await import(
  "../../../src/modules/cars/cars.repository.js"
);

const { getAllCarsService } = await import(
  "../../../src/modules/cars/car.service.js"
);

describe("getAllCarsService", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return cars from repository", async () => {
    const cars = [
      {
        id: 5,
        make: "Maruti Suzuki",
        model: "Baleno",
        price: "685000.00",
      },
    ];

    getAllCarsDB.mockResolvedValue(cars);

    const result = await getAllCarsService(1, 10);

    expect(result).toEqual(cars);

    expect(getAllCarsDB).toHaveBeenCalledWith(1, 10);
  });
});
