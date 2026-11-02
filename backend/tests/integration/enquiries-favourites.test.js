import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/enquiries/enquiries.service.js", () => ({
  createEnquiryService: jest.fn(),
  getMyEnquiriesService: jest.fn(),
  updateEnquiryStatusService: jest.fn(),
  deleteEnquiryService: jest.fn(),
}));

jest.unstable_mockModule("../../src/modules/favourites/favourites.service.js", () => ({
  addFavouriteService: jest.fn(),
  removeFavouriteService: jest.fn(),
  getMyFavouritesService: jest.fn(),
  checkFavouriteService: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const enquiriesService = await import("../../src/modules/enquiries/enquiries.service.js");
const favouritesService = await import("../../src/modules/favourites/favourites.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();
const SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
const customerToken = jwt.sign({ userId: 3, userTypeId: 2 }, SECRET, { expiresIn: "1h" });
const dealerToken = jwt.sign({ userId: 10, userTypeId: 3 }, SECRET, { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/enquiries — customer only", () => {
  it("401 without token", async () => {
    expect((await request(app).post("/api/v1/enquiries")).status).toBe(401);
  });

  it("403 for dealer", async () => {
    expect((await request(app).post("/api/v1/enquiries").set("Authorization", `Bearer ${dealerToken}`).send({ carId: 5 })).status).toBe(403);
  });

  it("400 when carId missing", async () => {
    const res = await request(app).post("/api/v1/enquiries").set("Authorization", `Bearer ${customerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it("201 on success", async () => {
    enquiriesService.createEnquiryService.mockResolvedValue({ message: "Enquiry sent successfully", enquiry: { id: 1 } });
    const res = await request(app).post("/api/v1/enquiries").set("Authorization", `Bearer ${customerToken}`).send({ carId: 5, message: "hi" });
    expect(res.status).toBe(201);
  });

  it("404 when CAR_NOT_FOUND", async () => {
    enquiriesService.createEnquiryService.mockRejectedValue(new Error("CAR_NOT_FOUND"));
    const res = await request(app).post("/api/v1/enquiries").set("Authorization", `Bearer ${customerToken}`).send({ carId: 99 });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/enquiries/me — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/enquiries/me")).status).toBe(401);
  });

  it("200 returns enquiries", async () => {
    enquiriesService.getMyEnquiriesService.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get("/api/v1/enquiries/me").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.enquiries).toHaveLength(1);
  });
});

describe("PATCH /api/v1/enquiries/:id/status — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).patch("/api/v1/enquiries/1/status")).status).toBe(401);
  });

  it("403 for customer", async () => {
    expect((await request(app).patch("/api/v1/enquiries/1/status").set("Authorization", `Bearer ${customerToken}`).send({ status: "contacted" })).status).toBe(403);
  });

  it("400 when status missing", async () => {
    const res = await request(app).patch("/api/v1/enquiries/1/status").set("Authorization", `Bearer ${dealerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    enquiriesService.updateEnquiryStatusService.mockResolvedValue({ message: "Enquiry status updated", enquiry: { id: 1, status: "contacted" } });
    const res = await request(app).patch("/api/v1/enquiries/1/status").set("Authorization", `Bearer ${dealerToken}`).send({ status: "contacted" });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/v1/enquiries/:id — customer only", () => {
  it("401 without token", async () => {
    expect((await request(app).delete("/api/v1/enquiries/1")).status).toBe(401);
  });

  it("200 on success", async () => {
    enquiriesService.deleteEnquiryService.mockResolvedValue({ message: "Enquiry deleted successfully" });
    const res = await request(app).delete("/api/v1/enquiries/1").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/v1/favourites — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/favourites")).status).toBe(401);
  });

  it("200 returns cars", async () => {
    favouritesService.getMyFavouritesService.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get("/api/v1/favourites").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.cars).toHaveLength(1);
  });
});

describe("POST /api/v1/favourites/:carId — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).post("/api/v1/favourites/5")).status).toBe(401);
  });

  it("201 on success", async () => {
    favouritesService.addFavouriteService.mockResolvedValue({ message: "Added to favourites", favourite: { userId: 3, carId: 5 } });
    const res = await request(app).post("/api/v1/favourites/5").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(201);
  });

  it("404 when CAR_NOT_FOUND", async () => {
    favouritesService.addFavouriteService.mockRejectedValue(new Error("CAR_NOT_FOUND"));
    const res = await request(app).post("/api/v1/favourites/99").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/favourites/:carId — authenticated", () => {
  it("200 on success", async () => {
    favouritesService.removeFavouriteService.mockResolvedValue({ message: "Removed from favourites" });
    const res = await request(app).delete("/api/v1/favourites/5").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
  });

  it("404 when NOT_IN_FAVOURITES", async () => {
    favouritesService.removeFavouriteService.mockRejectedValue(new Error("NOT_IN_FAVOURITES"));
    const res = await request(app).delete("/api/v1/favourites/5").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/favourites/:carId/check — authenticated", () => {
  it("200 with isFavourite boolean", async () => {
    favouritesService.checkFavouriteService.mockResolvedValue({ isFavourite: true });
    const res = await request(app).get("/api/v1/favourites/5/check").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.isFavourite).toBe(true);
  });
});
