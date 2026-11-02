import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/admin/admin.service.js", () => ({
  adminLoginService: jest.fn(),
  getDashboardStatsService: jest.fn(),
  getAllDealersService: jest.fn(),
  verifyDealerService: jest.fn(),
  getAllCustomersService: jest.fn(),
  toggleUserActiveService: jest.fn(),
  deleteUserService: jest.fn(),
  getAllCarsAdminService: jest.fn(),
  updateCarStatusService: jest.fn(),
  toggleCarFeaturedService: jest.fn(),
  deleteCarService: jest.fn(),
  getAllEnquiriesService: jest.fn(),
  getAllReviewsService: jest.fn(),
  deleteReviewService: jest.fn(),
  approveReviewService: jest.fn(),
  getAllSubscriptionsService: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const adminService = await import("../../src/modules/admin/admin.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();
const SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
const adminToken = jwt.sign({ userId: 1, userTypeId: 1 }, SECRET, { expiresIn: "1h" });
const dealerToken = jwt.sign({ userId: 10, userTypeId: 3 }, SECRET, { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/admin/login", () => {
  it("200 on success", async () => {
    adminService.adminLoginService.mockResolvedValue({ message: "Admin login successful", user: { id: 1 }, accessToken: "at", refreshToken: "rt" });
    const res = await request(app).post("/api/v1/admin/login").send({ email: "admin@example.com", password: "adminpass" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("at");
  });

  it("400 when fields missing", async () => {
    const res = await request(app).post("/api/v1/admin/login").send({ email: "admin@example.com" });
    expect(res.status).toBe(400);
  });

  it("401 on INVALID_CREDENTIALS", async () => {
    adminService.adminLoginService.mockRejectedValue(new Error("INVALID_CREDENTIALS"));
    const res = await request(app).post("/api/v1/admin/login").send({ email: "admin@example.com", password: "wrong" });
    expect(res.status).toBe(401);
  });
});

describe("Admin protected routes — require admin JWT", () => {
  it("GET /dashboard/stats → 401 without token", async () => {
    expect((await request(app).get("/api/v1/admin/dashboard/stats")).status).toBe(401);
  });

  it("GET /dashboard/stats → 403 for dealer", async () => {
    expect((await request(app).get("/api/v1/admin/dashboard/stats").set("Authorization", `Bearer ${dealerToken}`)).status).toBe(403);
  });

  it("GET /dashboard/stats → 200 for admin", async () => {
    adminService.getDashboardStatsService.mockResolvedValue({ totalUsers: 10 });
    const res = await request(app).get("/api/v1/admin/dashboard/stats").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.stats.totalUsers).toBe(10);
  });
});

describe("GET /api/v1/admin/dealers — admin only", () => {
  it("200 returns dealers and total", async () => {
    adminService.getAllDealersService.mockResolvedValue({ dealers: [{ id: 1 }], total: 1 });
    const res = await request(app).get("/api/v1/admin/dealers").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.dealers).toHaveLength(1);
  });
});

describe("PATCH /api/v1/admin/dealers/:id/verify — admin only", () => {
  it("400 when isVerified is not boolean", async () => {
    const res = await request(app).patch("/api/v1/admin/dealers/1/verify").set("Authorization", `Bearer ${adminToken}`).send({ isVerified: "yes" });
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    adminService.verifyDealerService.mockResolvedValue({ id: 1, isVerified: true });
    const res = await request(app).patch("/api/v1/admin/dealers/1/verify").set("Authorization", `Bearer ${adminToken}`).send({ isVerified: true });
    expect(res.status).toBe(200);
    expect(res.body.dealer.isVerified).toBe(true);
  });
});

describe("GET /api/v1/admin/customers — admin only", () => {
  it("200 returns customers", async () => {
    adminService.getAllCustomersService.mockResolvedValue({ customers: [], total: 0 });
    const res = await request(app).get("/api/v1/admin/customers").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/v1/admin/cars/:carId/status — admin only", () => {
  it("400 for invalid status", async () => {
    const res = await request(app).patch("/api/v1/admin/cars/1/status").set("Authorization", `Bearer ${adminToken}`).send({ status: "flying" });
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    adminService.updateCarStatusService.mockResolvedValue({ id: 1, status: "active" });
    const res = await request(app).patch("/api/v1/admin/cars/1/status").set("Authorization", `Bearer ${adminToken}`).send({ status: "active" });
    expect(res.status).toBe(200);
  });
});

describe("PATCH /api/v1/admin/cars/:carId/featured — admin only", () => {
  it("400 when isFeatured is not boolean", async () => {
    const res = await request(app).patch("/api/v1/admin/cars/1/featured").set("Authorization", `Bearer ${adminToken}`).send({ isFeatured: "yes" });
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    adminService.toggleCarFeaturedService.mockResolvedValue({ id: 1, isFeatured: true });
    const res = await request(app).patch("/api/v1/admin/cars/1/featured").set("Authorization", `Bearer ${adminToken}`).send({ isFeatured: true });
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/v1/admin/cars/:carId — admin only", () => {
  it("200 on success", async () => {
    adminService.deleteCarService.mockResolvedValue({ id: 1 });
    const res = await request(app).delete("/api/v1/admin/cars/1").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.deleted.id).toBe(1);
  });
});

describe("PATCH /api/v1/admin/reviews/:reviewId/approve — admin only", () => {
  it("400 when isApproved is not boolean", async () => {
    const res = await request(app).patch("/api/v1/admin/reviews/1/approve").set("Authorization", `Bearer ${adminToken}`).send({ isApproved: "true" });
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    adminService.approveReviewService.mockResolvedValue({ id: 1, isApproved: true });
    const res = await request(app).patch("/api/v1/admin/reviews/1/approve").set("Authorization", `Bearer ${adminToken}`).send({ isApproved: true });
    expect(res.status).toBe(200);
    expect(res.body.review.isApproved).toBe(true);
  });
});

describe("GET /api/v1/admin/subscriptions — admin only", () => {
  it("200 returns subscriptions", async () => {
    adminService.getAllSubscriptionsService.mockResolvedValue({ subscriptions: [], total: 0 });
    const res = await request(app).get("/api/v1/admin/subscriptions").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
  });
});
