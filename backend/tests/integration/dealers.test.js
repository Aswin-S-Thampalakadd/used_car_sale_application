import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/dealers/dealers.service.js", () => ({
  getMyDealerProfileService: jest.fn(),
  getPublicDealerProfileService: jest.fn(),
  updateDealerProfileService: jest.fn(),
  getMyDealerCarsService: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const dealersService = await import("../../src/modules/dealers/dealers.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();

const dealerToken = jwt.sign({ userId: 10, userTypeId: 3 }, process.env.JWT_ACCESS_SECRET || "test-access-secret", { expiresIn: "1h" });
const customerToken = jwt.sign({ userId: 5, userTypeId: 2 }, process.env.JWT_ACCESS_SECRET || "test-access-secret", { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

const mockProfile = { id: 1, userId: 10, dealershipName: "Best Cars", city: "Kochi" };

describe("GET /api/v1/dealers/me/profile — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/dealers/me/profile")).status).toBe(401);
  });

  it("403 for customer", async () => {
    expect((await request(app).get("/api/v1/dealers/me/profile").set("Authorization", `Bearer ${customerToken}`)).status).toBe(403);
  });

  it("200 on success", async () => {
    dealersService.getMyDealerProfileService.mockResolvedValue(mockProfile);
    const res = await request(app).get("/api/v1/dealers/me/profile").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.dealershipName).toBe("Best Cars");
  });

  it("404 when PROFILE_NOT_FOUND", async () => {
    dealersService.getMyDealerProfileService.mockRejectedValue(new Error("PROFILE_NOT_FOUND"));
    const res = await request(app).get("/api/v1/dealers/me/profile").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/dealers/me/profile — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).put("/api/v1/dealers/me/profile")).status).toBe(401);
  });

  it("200 on success", async () => {
    dealersService.updateDealerProfileService.mockResolvedValue({ message: "Profile updated successfully", profile: mockProfile });
    const res = await request(app).put("/api/v1/dealers/me/profile").set("Authorization", `Bearer ${dealerToken}`).send({ city: "Trivandrum" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Profile updated successfully");
  });
});

describe("GET /api/v1/dealers/me/cars — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/dealers/me/cars")).status).toBe(401);
  });

  it("200 returns cars array", async () => {
    dealersService.getMyDealerCarsService.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get("/api/v1/dealers/me/cars").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.cars).toHaveLength(1);
  });
});

describe("GET /api/v1/dealers/:id — public", () => {
  it("200 for valid dealer id", async () => {
    dealersService.getPublicDealerProfileService.mockResolvedValue(mockProfile);
    const res = await request(app).get("/api/v1/dealers/1");
    expect(res.status).toBe(200);
  });

  it("400 for invalid (non-numeric) id segment", async () => {
    const res = await request(app).get("/api/v1/dealers/abc");
    expect(res.status).toBe(400);
  });

  it("404 when PROFILE_NOT_FOUND", async () => {
    dealersService.getPublicDealerProfileService.mockRejectedValue(new Error("PROFILE_NOT_FOUND"));
    const res = await request(app).get("/api/v1/dealers/99");
    expect(res.status).toBe(404);
  });
});
