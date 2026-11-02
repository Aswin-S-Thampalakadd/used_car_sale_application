import { jest } from "@jest/globals";
import crypto from "crypto";

jest.unstable_mockModule("../../../src/modules/subscriptions/subscriptions.repository.js", () => ({
  getActiveSubscriptionByUserId: jest.fn(),
  getAllSubscriptionsByUserId: jest.fn(),
  createSubscription: jest.fn(),
  createPendingOrder: jest.fn(),
  confirmSubscription: jest.fn(),
  upgradeSubscription: jest.fn(),
}));

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({
    orders: { create: jest.fn() },
  })),
}));

const subsRepo = await import("../../../src/modules/subscriptions/subscriptions.repository.js");
const {
  getUserSubscriptionService,
  getUserSubscriptionHistoryService,
  verifyPaymentService,
  checkCarLimitService,
  PLAN_CONFIGS,
} = await import("../../../src/modules/subscriptions/subscriptions.service.js");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.RAZORPAY_KEY_SECRET = "test-secret";
});

describe("PLAN_CONFIGS", () => {
  it("free plan carLimit is 5", () => expect(PLAN_CONFIGS.free.carLimit).toBe(5));
  it("elite plan carLimit is 20", () => expect(PLAN_CONFIGS.elite.carLimit).toBe(20));
  it("pro plan carLimit is 100", () => expect(PLAN_CONFIGS.pro.carLimit).toBe(100));
});

describe("getUserSubscriptionService", () => {
  it("returns free plan defaults when no active subscription", async () => {
    subsRepo.getActiveSubscriptionByUserId.mockResolvedValue(null);
    const result = await getUserSubscriptionService(1);
    expect(result.planType).toBe("free");
    expect(result.carLimit).toBe(5);
    expect(result.status).toBe("active");
  });

  it("returns active subscription when found", async () => {
    subsRepo.getActiveSubscriptionByUserId.mockResolvedValue({ planType: "elite", carLimit: 20, status: "active" });
    expect((await getUserSubscriptionService(1)).planType).toBe("elite");
  });
});

describe("getUserSubscriptionHistoryService", () => {
  it("delegates to repo", async () => {
    subsRepo.getAllSubscriptionsByUserId.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    expect(await getUserSubscriptionHistoryService(1)).toHaveLength(2);
  });
});

describe("verifyPaymentService", () => {
  it("throws INVALID_SIGNATURE for wrong signature", async () => {
    await expect(verifyPaymentService("order_123", "pay_456", "wrong_sig")).rejects.toThrow("INVALID_SIGNATURE");
  });

  it("throws SUBSCRIPTION_NOT_FOUND when order not in DB", async () => {
    const orderId = "order_abc";
    const paymentId = "pay_xyz";
    const sig = crypto.createHmac("sha256", "test-secret").update(`${orderId}|${paymentId}`).digest("hex");
    subsRepo.confirmSubscription.mockResolvedValue(null);
    await expect(verifyPaymentService(orderId, paymentId, sig)).rejects.toThrow("SUBSCRIPTION_NOT_FOUND");
  });

  it("returns subscription on success", async () => {
    const orderId = "order_abc";
    const paymentId = "pay_xyz";
    const sig = crypto.createHmac("sha256", "test-secret").update(`${orderId}|${paymentId}`).digest("hex");
    subsRepo.confirmSubscription.mockResolvedValue({ id: 1, planType: "elite", status: "active" });
    expect((await verifyPaymentService(orderId, paymentId, sig)).planType).toBe("elite");
  });
});

describe("checkCarLimitService", () => {
  it("hasReachedLimit is true at free plan limit (5)", async () => {
    subsRepo.getActiveSubscriptionByUserId.mockResolvedValue(null);
    const result = await checkCarLimitService(1, 5);
    expect(result.hasReachedLimit).toBe(true);
    expect(result.planType).toBe("free");
  });

  it("hasReachedLimit is false when under limit", async () => {
    subsRepo.getActiveSubscriptionByUserId.mockResolvedValue(null);
    const result = await checkCarLimitService(1, 3);
    expect(result.hasReachedLimit).toBe(false);
    expect(result.currentCount).toBe(3);
    expect(result.limit).toBe(5);
  });
});
