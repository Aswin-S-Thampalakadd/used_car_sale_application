import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/cars/cars.repository.js", () => ({
  getAllCarsDB: jest.fn(),
  getCarByIdDB: jest.fn(),
  getAvailableCarBrandsDB: jest.fn(),
  getRecentlyAddedCarsDB: jest.fn(),
  createCar: jest.fn(),
  findDealerCarById: jest.fn(),
  updateCar: jest.fn(),
  deleteCar: jest.fn(),
  updateCarStatus: jest.fn(),
  getFeaturedCarsDB: jest.fn(),
  searchCarsDB: jest.fn(),
  getLocationRecommendedCarsDB: jest.fn(),
  countDealerCarsDB: jest.fn(),
  incrementViewsDB: jest.fn(),
}));

jest.unstable_mockModule("../../../src/modules/subscriptions/subscriptions.service.js", () => ({
  checkCarLimitService: jest.fn(),
  getUserSubscriptionService: jest.fn(),
  createFreeSubscriptionService: jest.fn(),
  PLAN_CONFIGS: { free: { carLimit: 5, price: 0 }, elite: { carLimit: 20, price: 999 }, pro: { carLimit: 100, price: 2999 } },
}));

jest.unstable_mockModule("../../../src/redis/index.js", () => ({
  default: { get: jest.fn(), set: jest.fn() },
}));

const carsRepo = await import("../../../src/modules/cars/cars.repository.js");
const subsService = await import("../../../src/modules/subscriptions/subscriptions.service.js");
const redisModule = await import("../../../src/redis/index.js");
const redis = redisModule.default;
const {
  getAllCarsService,
  fetchCarById,
  getAvailableCarBrandsService,
  getRecentlyAddedCarsService,
  addCarService,
  updateCarService,
  deleteCarService,
  updateCarStatusService,
  getFeaturedCarsService,
  searchCarsService,
  getLocationRecommendedCarsService,
} = await import("../../../src/modules/cars/car.service.js");

beforeEach(() => jest.clearAllMocks());

const mockCar = { id: 1, make: "Toyota", model: "Corolla", dealerId: 10, status: "active" };

describe("getAllCarsService", () => {
  it("returns cached result on Redis hit", async () => {
    redis.get.mockResolvedValue(JSON.stringify({ cars: [mockCar], total: 1 }));
    const result = await getAllCarsService(1, 10, {});
    expect(result.cars).toHaveLength(1);
    expect(carsRepo.getAllCarsDB).not.toHaveBeenCalled();
  });

  it("queries DB and caches on Redis miss", async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue("OK");
    carsRepo.getAllCarsDB.mockResolvedValue({ cars: [mockCar], total: 1 });
    const result = await getAllCarsService(1, 10, {});
    expect(carsRepo.getAllCarsDB).toHaveBeenCalledWith(1, 10, {});
    expect(redis.set).toHaveBeenCalled();
    expect(result.cars).toHaveLength(1);
  });
});

describe("fetchCarById", () => {
  it("returns null when car not found", async () => {
    carsRepo.getCarByIdDB.mockResolvedValue(null);
    expect(await fetchCarById(99)).toBeNull();
  });

  it("returns car and triggers view increment", async () => {
    carsRepo.getCarByIdDB.mockResolvedValue(mockCar);
    carsRepo.incrementViewsDB.mockResolvedValue();
    expect(await fetchCarById(1)).toEqual(mockCar);
  });
});

describe("getAvailableCarBrandsService", () => {
  it("returns cached brands", async () => {
    redis.get.mockResolvedValue(JSON.stringify(["Toyota", "Honda"]));
    const result = await getAvailableCarBrandsService();
    expect(result).toEqual(["Toyota", "Honda"]);
    expect(carsRepo.getAvailableCarBrandsDB).not.toHaveBeenCalled();
  });

  it("fetches and caches on miss", async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue("OK");
    carsRepo.getAvailableCarBrandsDB.mockResolvedValue(["Toyota"]);
    expect(await getAvailableCarBrandsService()).toEqual(["Toyota"]);
    expect(redis.set).toHaveBeenCalled();
  });
});

describe("getRecentlyAddedCarsService", () => {
  it("returns cached cars", async () => {
    redis.get.mockResolvedValue(JSON.stringify([mockCar]));
    expect(await getRecentlyAddedCarsService(5)).toHaveLength(1);
  });

  it("fetches from DB on miss", async () => {
    redis.get.mockResolvedValue(null);
    redis.set.mockResolvedValue("OK");
    carsRepo.getRecentlyAddedCarsDB.mockResolvedValue([mockCar]);
    expect(await getRecentlyAddedCarsService(5)).toHaveLength(1);
  });
});

describe("addCarService", () => {
  const data = { make: "Toyota", model: "Corolla", year: 2021, fuelType: "petrol", transmission: "manual", kilometersDriven: 30000, price: 500000 };

  it("throws CAR_LIMIT_REACHED when limit hit", async () => {
    carsRepo.countDealerCarsDB.mockResolvedValue(5);
    subsService.checkCarLimitService.mockResolvedValue({ hasReachedLimit: true, planType: "free", limit: 5 });
    const err = await addCarService(10, data).catch((e) => e);
    expect(err.message).toBe("CAR_LIMIT_REACHED");
    expect(err.planType).toBe("free");
    expect(err.limit).toBe(5);
  });

  it("creates car when under limit", async () => {
    carsRepo.countDealerCarsDB.mockResolvedValue(2);
    subsService.checkCarLimitService.mockResolvedValue({ hasReachedLimit: false });
    carsRepo.createCar.mockResolvedValue(mockCar);
    const result = await addCarService(10, data);
    expect(result.car).toEqual(mockCar);
    expect(result.message).toBe("Car added successfully");
  });
});

describe("updateCarService", () => {
  it("throws CAR_NOT_FOUND when car not owned by dealer", async () => {
    carsRepo.findDealerCarById.mockResolvedValue(null);
    await expect(updateCarService(1, 10, {})).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("updates and returns car", async () => {
    carsRepo.findDealerCarById.mockResolvedValue(mockCar);
    carsRepo.updateCar.mockResolvedValue({ ...mockCar, make: "Honda" });
    const result = await updateCarService(1, 10, { make: "Honda" });
    expect(result.car.make).toBe("Honda");
    expect(result.message).toBe("Car updated successfully");
  });
});

describe("deleteCarService", () => {
  it("throws CAR_NOT_FOUND", async () => {
    carsRepo.findDealerCarById.mockResolvedValue(null);
    await expect(deleteCarService(1, 10)).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("returns message on success", async () => {
    carsRepo.findDealerCarById.mockResolvedValue(mockCar);
    carsRepo.deleteCar.mockResolvedValue({ id: 1 });
    expect((await deleteCarService(1, 10)).message).toBe("Car deleted successfully");
  });
});

describe("updateCarStatusService", () => {
  it("throws INVALID_STATUS for unknown status", async () => {
    await expect(updateCarStatusService(1, 10, "flying")).rejects.toThrow("INVALID_STATUS");
  });

  it("throws CAR_NOT_FOUND when car missing", async () => {
    carsRepo.findDealerCarById.mockResolvedValue(null);
    await expect(updateCarStatusService(1, 10, "active")).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("updates status and returns car", async () => {
    carsRepo.findDealerCarById.mockResolvedValue(mockCar);
    carsRepo.updateCarStatus.mockResolvedValue({ ...mockCar, status: "sold" });
    const result = await updateCarStatusService(1, 10, "sold");
    expect(result.car.status).toBe("sold");
  });
});

describe("getFeaturedCarsService", () => {
  it("returns featured cars", async () => {
    carsRepo.getFeaturedCarsDB.mockResolvedValue([mockCar]);
    expect(await getFeaturedCarsService(5)).toHaveLength(1);
  });
});

describe("searchCarsService", () => {
  it("delegates to searchCarsDB", async () => {
    carsRepo.searchCarsDB.mockResolvedValue([mockCar]);
    expect(await searchCarsService({ search: "Toyota" })).toHaveLength(1);
  });
});

describe("getLocationRecommendedCarsService", () => {
  it("delegates to getLocationRecommendedCarsDB", async () => {
    carsRepo.getLocationRecommendedCarsDB.mockResolvedValue([mockCar]);
    expect(await getLocationRecommendedCarsService({ city: "Kochi", limit: 5 })).toHaveLength(1);
  });
});
