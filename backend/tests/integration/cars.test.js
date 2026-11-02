import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/cars/car.service.js", () => ({
  getAllCarsService: jest.fn(),
  fetchCarById: jest.fn(),
  getAvailableCarBrandsService: jest.fn(),
  getRecentlyAddedCarsService: jest.fn(),
  addCarService: jest.fn(),
  updateCarService: jest.fn(),
  deleteCarService: jest.fn(),
  updateCarStatusService: jest.fn(),
  getFeaturedCarsService: jest.fn(),
  searchCarsService: jest.fn(),
  getLocationRecommendedCarsService: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const carService = await import("../../src/modules/cars/car.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();

const dealerToken = jwt.sign({ userId: 10, userTypeId: 3 }, process.env.JWT_ACCESS_SECRET || "test-access-secret", { expiresIn: "1h" });
const customerToken = jwt.sign({ userId: 5, userTypeId: 2 }, process.env.JWT_ACCESS_SECRET || "test-access-secret", { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

const mockCar = { id: 1, make: "Toyota", model: "Corolla", status: "active", dealerId: 10 };

describe("GET /api/v1/cars", () => {
  it("200 with cars and total", async () => {
    carService.getAllCarsService.mockResolvedValue({ cars: [mockCar], total: 1 });
    const res = await request(app).get("/api/v1/cars");
    expect(res.status).toBe(200);
    expect(res.body.cars).toHaveLength(1);
  });
});

describe("GET /api/v1/cars/featured", () => {
  it("200 with featured cars", async () => {
    carService.getFeaturedCarsService.mockResolvedValue([mockCar]);
    const res = await request(app).get("/api/v1/cars/featured");
    expect(res.status).toBe(200);
    expect(res.body.cars).toHaveLength(1);
  });
});

describe("GET /api/v1/cars/brands", () => {
  it("200 with brands", async () => {
    carService.getAvailableCarBrandsService.mockResolvedValue(["Toyota", "Honda"]);
    const res = await request(app).get("/api/v1/cars/brands");
    expect(res.status).toBe(200);
    expect(res.body.brands).toContain("Toyota");
  });
});

describe("GET /api/v1/cars/recent", () => {
  it("200 with recent cars", async () => {
    carService.getRecentlyAddedCarsService.mockResolvedValue([mockCar]);
    const res = await request(app).get("/api/v1/cars/recent");
    expect(res.status).toBe(200);
    expect(res.body.cars).toHaveLength(1);
  });
});

describe("GET /api/v1/cars/search", () => {
  it("200 with search results", async () => {
    carService.searchCarsService.mockResolvedValue([mockCar]);
    const res = await request(app).get("/api/v1/cars/search?search=Toyota");
    expect(res.status).toBe(200);
    expect(res.body.cars).toHaveLength(1);
  });
});

describe("GET /api/v1/cars/location-recommendations", () => {
  it("200 with location-based results", async () => {
    carService.getLocationRecommendedCarsService.mockResolvedValue([mockCar]);
    const res = await request(app).get("/api/v1/cars/location-recommendations?city=Kochi");
    expect(res.status).toBe(200);
  });

  it("400 when city and state both missing", async () => {
    const res = await request(app).get("/api/v1/cars/location-recommendations");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/cars/:id", () => {
  it("200 when car found", async () => {
    carService.fetchCarById.mockResolvedValue(mockCar);
    const res = await request(app).get("/api/v1/cars/toyota-corolla-1");
    expect(res.status).toBe(200);
  });

  it("404 when car not found", async () => {
    carService.fetchCarById.mockResolvedValue(null);
    const res = await request(app).get("/api/v1/cars/toyota-1");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe("POST /api/v1/cars — dealer only", () => {
  it("401 without token", async () => {
    const res = await request(app).post("/api/v1/cars").send({});
    expect(res.status).toBe(401);
  });

  it("403 for customer token", async () => {
    const res = await request(app).post("/api/v1/cars").set("Authorization", `Bearer ${customerToken}`).send({});
    expect(res.status).toBe(403);
  });

  it("400 when required fields missing", async () => {
    const res = await request(app).post("/api/v1/cars").set("Authorization", `Bearer ${dealerToken}`).send({ make: "Toyota" });
    expect(res.status).toBe(400);
  });

  it("201 on success", async () => {
    carService.addCarService.mockResolvedValue({ message: "Car added successfully", car: mockCar });
    const res = await request(app).post("/api/v1/cars").set("Authorization", `Bearer ${dealerToken}`).send({ make: "Toyota", model: "Corolla", year: 2021, fuelType: "petrol", transmission: "manual", kilometersDriven: 30000, price: 500000 });
    expect(res.status).toBe(201);
    expect(res.body.car).toBeDefined();
  });
});

describe("PUT /api/v1/cars/:id — dealer only", () => {
  it("401 without token", async () => {
    const res = await request(app).put("/api/v1/cars/1");
    expect(res.status).toBe(401);
  });

  it("200 on success", async () => {
    carService.updateCarService.mockResolvedValue({ message: "Car updated successfully", car: mockCar });
    const res = await request(app).put("/api/v1/cars/1").set("Authorization", `Bearer ${dealerToken}`).send({ make: "Honda" });
    expect(res.status).toBe(200);
  });

  it("404 when CAR_NOT_FOUND", async () => {
    carService.updateCarService.mockRejectedValue(new Error("CAR_NOT_FOUND"));
    const res = await request(app).put("/api/v1/cars/99").set("Authorization", `Bearer ${dealerToken}`).send({});
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/cars/:id — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).delete("/api/v1/cars/1")).status).toBe(401);
  });

  it("200 on success", async () => {
    carService.deleteCarService.mockResolvedValue({ message: "Car deleted successfully" });
    const res = await request(app).delete("/api/v1/cars/1").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/v1/cars/:id/status — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).patch("/api/v1/cars/1/status")).status).toBe(401);
  });

  it("400 when status missing", async () => {
    const res = await request(app).patch("/api/v1/cars/1/status").set("Authorization", `Bearer ${dealerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    carService.updateCarStatusService.mockResolvedValue({ message: "Car status updated successfully", car: { ...mockCar, status: "sold" } });
    const res = await request(app).patch("/api/v1/cars/1/status").set("Authorization", `Bearer ${dealerToken}`).send({ status: "sold" });
    expect(res.status).toBe(200);
  });
});
