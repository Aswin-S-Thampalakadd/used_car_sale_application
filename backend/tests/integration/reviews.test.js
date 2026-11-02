import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/reviews/reviews.service.js", () => ({
  createReviewService: jest.fn(),
  updateReviewService: jest.fn(),
  deleteReviewService: jest.fn(),
  getCarReviewsService: jest.fn(),
  getDealerReviewsService: jest.fn(),
  replyToReviewService: jest.fn(),
  dealerDeleteReviewService: jest.fn(),
  createAppReviewService: jest.fn(),
  getTopAppReviewsService: jest.fn(),
  getAllAppReviewsService: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const reviewsService = await import("../../src/modules/reviews/reviews.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();
const SECRET = process.env.JWT_ACCESS_SECRET || "test-access-secret";
const customerToken = jwt.sign({ userId: 3, userTypeId: 2 }, SECRET, { expiresIn: "1h" });
const dealerToken = jwt.sign({ userId: 10, userTypeId: 3 }, SECRET, { expiresIn: "1h" });

beforeEach(() => jest.clearAllMocks());

const mockReview = { id: 1, carId: 5, customerId: 3, rating: 4 };

describe("GET /api/v1/reviews/car/:carId — public", () => {
  it("200 returns reviews and summary", async () => {
    reviewsService.getCarReviewsService.mockResolvedValue({ reviews: [mockReview], averageRating: 4.0, totalReviews: 1 });
    const res = await request(app).get("/api/v1/reviews/car/5");
    expect(res.status).toBe(200);
    expect(res.body.reviews).toHaveLength(1);
  });

  it("400 for non-numeric carId", async () => {
    const res = await request(app).get("/api/v1/reviews/car/abc");
    expect(res.status).toBe(400);
  });
});

describe("GET /api/v1/reviews/app/top — public", () => {
  it("200 returns top reviews", async () => {
    reviewsService.getTopAppReviewsService.mockResolvedValue({ reviews: [mockReview] });
    const res = await request(app).get("/api/v1/reviews/app/top");
    expect(res.status).toBe(200);
  });
});

describe("GET /api/v1/reviews/app — public", () => {
  it("200 returns all app reviews", async () => {
    reviewsService.getAllAppReviewsService.mockResolvedValue({ reviews: [] });
    const res = await request(app).get("/api/v1/reviews/app");
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/reviews — customer only", () => {
  it("401 without token", async () => {
    expect((await request(app).post("/api/v1/reviews")).status).toBe(401);
  });

  it("403 for dealer", async () => {
    expect((await request(app).post("/api/v1/reviews").set("Authorization", `Bearer ${dealerToken}`).send({ carId: 5, rating: 4 })).status).toBe(403);
  });

  it("400 when fields missing", async () => {
    const res = await request(app).post("/api/v1/reviews").set("Authorization", `Bearer ${customerToken}`).send({ rating: 4 });
    expect(res.status).toBe(400);
  });

  it("201 on success", async () => {
    reviewsService.createReviewService.mockResolvedValue({ message: "Review submitted", review: mockReview });
    const res = await request(app).post("/api/v1/reviews").set("Authorization", `Bearer ${customerToken}`).send({ carId: 5, rating: 4 });
    expect(res.status).toBe(201);
  });

  it("409 on ALREADY_REVIEWED", async () => {
    reviewsService.createReviewService.mockRejectedValue(new Error("ALREADY_REVIEWED"));
    const res = await request(app).post("/api/v1/reviews").set("Authorization", `Bearer ${customerToken}`).send({ carId: 5, rating: 4 });
    expect(res.status).toBe(409);
  });
});

describe("PUT /api/v1/reviews/:id — customer only", () => {
  it("401 without token", async () => {
    expect((await request(app).put("/api/v1/reviews/1")).status).toBe(401);
  });

  it("200 on success", async () => {
    reviewsService.updateReviewService.mockResolvedValue({ message: "Review updated", review: { ...mockReview, rating: 5 } });
    const res = await request(app).put("/api/v1/reviews/1").set("Authorization", `Bearer ${customerToken}`).send({ rating: 5 });
    expect(res.status).toBe(200);
  });

  it("404 on REVIEW_NOT_FOUND", async () => {
    reviewsService.updateReviewService.mockRejectedValue(new Error("REVIEW_NOT_FOUND"));
    const res = await request(app).put("/api/v1/reviews/99").set("Authorization", `Bearer ${customerToken}`).send({ rating: 3 });
    expect(res.status).toBe(404);
  });
});

describe("DELETE /api/v1/reviews/:id — customer only", () => {
  it("401 without token", async () => {
    expect((await request(app).delete("/api/v1/reviews/1")).status).toBe(401);
  });

  it("200 on success", async () => {
    reviewsService.deleteReviewService.mockResolvedValue({ message: "Review deleted" });
    const res = await request(app).delete("/api/v1/reviews/1").set("Authorization", `Bearer ${customerToken}`);
    expect(res.status).toBe(200);
  });
});

describe("GET /api/v1/reviews/dealer/mine — dealer only", () => {
  it("401 without token", async () => {
    expect((await request(app).get("/api/v1/reviews/dealer/mine")).status).toBe(401);
  });

  it("403 for customer", async () => {
    expect((await request(app).get("/api/v1/reviews/dealer/mine").set("Authorization", `Bearer ${customerToken}`)).status).toBe(403);
  });

  it("200 on success", async () => {
    reviewsService.getDealerReviewsService.mockResolvedValue({ reviews: [mockReview], averageRating: 4.0, totalReviews: 1 });
    const res = await request(app).get("/api/v1/reviews/dealer/mine").set("Authorization", `Bearer ${dealerToken}`);
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/reviews/:id/reply — dealer only", () => {
  it("400 when replyText missing", async () => {
    const res = await request(app).post("/api/v1/reviews/1/reply").set("Authorization", `Bearer ${dealerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it("200 on success", async () => {
    reviewsService.replyToReviewService.mockResolvedValue({ message: "Reply posted", review: { ...mockReview, replyText: "Thanks" } });
    const res = await request(app).post("/api/v1/reviews/1/reply").set("Authorization", `Bearer ${dealerToken}`).send({ replyText: "Thanks" });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/reviews/app — customer only", () => {
  it("400 when rating missing", async () => {
    const res = await request(app).post("/api/v1/reviews/app").set("Authorization", `Bearer ${customerToken}`).send({});
    expect(res.status).toBe(400);
  });

  it("201 on success", async () => {
    reviewsService.createAppReviewService.mockResolvedValue({ message: "Thank you for your review!", review: { id: 2, rating: 5 } });
    const res = await request(app).post("/api/v1/reviews/app").set("Authorization", `Bearer ${customerToken}`).send({ rating: 5 });
    expect(res.status).toBe(201);
  });
});
