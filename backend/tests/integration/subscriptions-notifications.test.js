import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("../../src/modules/subscriptions/subscriptions.service.js", () => ({
  getAvailablePlans: jest.fn(),
  getUserSubscriptionService: jest.fn(),
  getUserSubscriptionHistoryService: jest.fn(),
  checkCarLimitService: jest.fn(),
  createSubscriptionOrderService: jest.fn(),
  verifyPaymentService: jest.fn(),
  PLAN_CONFIGS: { free: { carLimit: 5, price: 0 }, elite: { carLimit: 20, price: 999, durationDays: 30 }, pro: { carLimit: 100, price: 2999, durationDays: 30 } },
}));

jest.unstable_mockModule("../../src/modules/notifications/notifications.service.js", () => ({
  getMyNotificationsService: jest.fn(),
  markReadService: jest.fn(),
  markUnreadService: jest.fn(),
  markAllReadService: jest.fn(),
  notifyNewEnquiry: jest.fn(),
  notifyNewReview: jest.fn(),
  notifyViewMilestone: jest.fn(),
  getDealerUserIdByProfileId: jest.fn(),
}));

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const subsService = await import("../../src/modules/subscriptions/subscriptions.service.js");
const notifsService = await import("../../src/modules/notifications/notifications.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();
const SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
const dealerToken = jwt.sign({ userId: 10, userTypeId: 3 }, SECRET, { expiresIn: "1h" });
const customerToken = jwt.sign({ userId: 5, userTypeId: 2 }, SECRET, { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

describe("GET /api/v1/subscriptions/plans — public", () => {
  it("200 returns plans array", async () => {
    const res = await request(app).get("/api/v1/subscriptions/plans");
    expect(res.status).toBe(200);
    expect(res.body.plans).toBeDefined();
  });
});

describe("GET /api/v1/subscriptions/my-plan — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/subscriptions/my-plan")).status).toBe(401);
  });

  it("403 for customer", async () => {
    expect((await request(app).get("/api/v1/subscriptions/my-plan").set("Authorization", `Bearer ${customerToken}`)).status).toBe(403);
  });

  it("200 on success", async () => {
    subsService.getUserSubscriptionService.mockResolvedValue({ planType: "free", carLimit: 5, status: "active" });
    const res = await request(app).get("/api/v1/subscriptions/my-plan").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.subscription.planType).toBe("free");
  });
});

describe("GET /api/v1/subscriptions/history — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/subscriptions/history")).status).toBe(401);
  });

  it("200 on success", async () => {
    subsService.getUserSubscriptionHistoryService.mockResolvedValue([{ id: 1 }]);
    const res = await request(app).get("/api/v1/subscriptions/history").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.subscriptions).toHaveLength(1);
  });
});

describe("POST /api/v1/subscriptions/create-order — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).post("/api/v1/subscriptions/create-order")).status).toBe(401);
  });

  it("400 for invalid planType", async () => {
    const res = await request(app).post("/api/v1/subscriptions/create-order").set("Authorization", `Bearer ${dealerToken}`).send({ planType: "invalid" });
    expect(res.status).toBe(400);
  });

  it("201 on success", async () => {
    subsService.createSubscriptionOrderService.mockResolvedValue({ orderId: "order_123", amount: 99900, currency: "INR", subscription: { id: 1 } });
    const res = await request(app).post("/api/v1/subscriptions/create-order").set("Authorization", `Bearer ${dealerToken}`).send({ planType: "elite" });
    expect(res.status).toBe(201);
    expect(res.body.order.orderId).toBe("order_123");
  });
});

describe("POST /api/v1/subscriptions/verify-payment — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).post("/api/v1/subscriptions/verify-payment")).status).toBe(401);
  });

  it("400 when payment details missing", async () => {
    const res = await request(app).post("/api/v1/subscriptions/verify-payment").set("Authorization", `Bearer ${dealerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    subsService.verifyPaymentService.mockResolvedValue({ id: 1, planType: "elite", status: "active" });
    const res = await request(app).post("/api/v1/subscriptions/verify-payment").set("Authorization", `Bearer ${dealerToken}`).send({ razorpay_order_id: "o", razorpay_payment_id: "p", razorpay_signature: "s" });
    expect(res.status).toBe(200);
    expect(res.body.subscription.planType).toBe("elite");
  });
});

describe("GET /api/v1/notifications/me — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/notifications/me")).status).toBe(401);
  });

  it("200 returns notifications", async () => {
    notifsService.getMyNotificationsService.mockResolvedValue({ notifications: [{ id: 1 }], unreadCount: 1 });
    const res = await request(app).get("/api/v1/notifications/me").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.notifications).toHaveLength(1);
    expect(res.body.unreadCount).toBe(1);
  });
});

describe("PATCH /api/v1/notifications/:id/read — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).patch("/api/v1/notifications/1/read")).status).toBe(401);
  });

  it("200 on success", async () => {
    notifsService.markReadService.mockResolvedValue({ id: 1 });
    const res = await request(app).patch("/api/v1/notifications/1/read").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 on NOT_FOUND", async () => {
    notifsService.markReadService.mockRejectedValue(new Error("NOT_FOUND"));
    const res = await request(app).patch("/api/v1/notifications/99/read").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(404);
  });
});

describe("PATCH /api/v1/notifications/read-all — authenticated", () => {
  it("401 without token", async () => {
    expect((await request(app).patch("/api/v1/notifications/read-all")).status).toBe(401);
  });

  it("200 on success", async () => {
    notifsService.markAllReadService.mockResolvedValue();
    const res = await request(app).patch("/api/v1/notifications/read-all").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
