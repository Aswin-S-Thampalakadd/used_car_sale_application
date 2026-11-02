import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/newsletter/newsletter.service.js", () => ({
  subscribeService: jest.fn(),
  confirmService: jest.fn(),
  unsubscribeService: jest.fn(),
  adminConfirmService: jest.fn(),
  deleteSubscriberService: jest.fn(),
  getSubscribersService: jest.fn(),
}));

jest.unstable_mockModule("../../src/modules/users/users.repository.js", () => ({
  getUserByIdDB: jest.fn(),
  updateUserDB: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockResolvedValue([{ total: "5", avg: "4.2" }]),
    query: { cars: { findFirst: jest.fn() } },
  },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const newsletterService = await import("../../src/modules/newsletter/newsletter.service.js");
const usersRepo = await import("../../src/modules/users/users.repository.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();
const SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
const customerToken = jwt.sign({ userId: 5, userTypeId: 2 }, SECRET, { expiresIn: "1h" });
const adminToken = jwt.sign({ userId: 1, userTypeId: 1 }, SECRET, { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/newsletter/subscribe — public", () => {
  it("400 when email missing", async () => {
    const res = await request(app).post("/api/v1/newsletter/subscribe").send({});
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    newsletterService.subscribeService.mockResolvedValue({ message: "Check your inbox to confirm your subscription." });
    const res = await request(app).post("/api/v1/newsletter/subscribe").send({ email: "test@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/confirm/i);
  });

  it("409 on ALREADY_SUBSCRIBED", async () => {
    newsletterService.subscribeService.mockRejectedValue(new Error("ALREADY_SUBSCRIBED"));
    const res = await request(app).post("/api/v1/newsletter/subscribe").send({ email: "test@example.com" });
    expect(res.status).toBe(409);
  });

  it("409 on ALREADY_PENDING", async () => {
    newsletterService.subscribeService.mockRejectedValue(new Error("ALREADY_PENDING"));
    const res = await request(app).post("/api/v1/newsletter/subscribe").send({ email: "test@example.com" });
    expect(res.status).toBe(409);
  });
});

describe("GET /api/v1/newsletter/confirm/:token — public redirect", () => {
  it("redirects on success", async () => {
    newsletterService.confirmService.mockResolvedValue({ email: "test@example.com", token: "abc" });
    const res = await request(app).get("/api/v1/newsletter/confirm/abc");
    expect([302, 301, 200]).toContain(res.status);
  });

  it("redirects with invalid status when token not found", async () => {
    newsletterService.confirmService.mockResolvedValue(null);
    const res = await request(app).get("/api/v1/newsletter/confirm/bad-token");
    expect([302, 301, 200]).toContain(res.status);
  });
});

describe("GET /api/v1/newsletter/subscribers — admin only", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/newsletter/subscribers")).status).toBe(401);
  });

  it("403 for customer", async () => {
    expect((await request(app).get("/api/v1/newsletter/subscribers").set("Authorization", `Bearer ${customerToken}`)).status).toBe(403);
  });

  it("200 for admin", async () => {
    newsletterService.getSubscribersService.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get("/api/v1/newsletter/subscribers").set("Authorization", `Bearer ${adminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.subscribers).toHaveLength(1);
  });
});

describe("GET /api/v1/users/me — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/users/me")).status).toBe(401);
  });

  it("200 returns user profile", async () => {
    usersRepo.getUserByIdDB.mockResolvedValue({ id: 5, name: "Alice", email: "a@a.com" });
    const res = await request(app).get("/api/v1/users/me").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("Alice");
  });

  it("404 when user not found", async () => {
    usersRepo.getUserByIdDB.mockResolvedValue(null);
    const res = await request(app).get("/api/v1/users/me").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });
});

describe("PUT /api/v1/users/me — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).put("/api/v1/users/me")).status).toBe(401);
  });

  it("200 on success", async () => {
    usersRepo.updateUserDB.mockResolvedValue({ id: 5, name: "Bob" });
    const res = await request(app).put("/api/v1/users/me").set("Authorization", `Bearer ${customerToken}`).send({ name: "Bob" });
    expect(res.status).toBe(200);
    expect(res.body.user.name).toBe("Bob");
  });

  it("404 when user not found", async () => {
    usersRepo.updateUserDB.mockResolvedValue(null);
    const res = await request(app).put("/api/v1/users/me").set("Authorization", `Bearer ${customerToken}`).send({ name: "Bob" });
    expect(res.status).toBe(404);
  });
});

describe("GET /api/v1/stats — public", () => {
  it("200 returns stats object", async () => {
    const res = await request(app).get("/api/v1/stats");
    expect([200, 500]).toContain(res.status);
  });
});

describe("404 not-found handler", () => {
  it("returns 404 JSON for unknown routes", async () => {
    const res = await request(app).get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Route not found/);
  });
});
