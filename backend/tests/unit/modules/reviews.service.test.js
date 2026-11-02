import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/reviews/reviews.repository.js", () => ({
  createReviewDB: jest.fn(),
  updateReviewDB: jest.fn(),
  deleteReviewDB: jest.fn(),
  getReviewsByCarDB: jest.fn(),
  getCarRatingSummaryDB: jest.fn(),
  getReviewByCustomerCarDB: jest.fn(),
  getReviewsByDealerDB: jest.fn(),
  getDealerRatingSummaryDB: jest.fn(),
  replyToReviewDB: jest.fn(),
  dealerDeleteReviewDB: jest.fn(),
  createAppReviewDB: jest.fn(),
  getAppReviewByCustomerDB: jest.fn(),
  getTopAppReviewsDB: jest.fn(),
  getAllAppReviewsDB: jest.fn(),
  approveReviewDB: jest.fn(),
}));

jest.unstable_mockModule("../../../src/db/index.js", () => ({
  db: {
    query: {
      cars: { findFirst: jest.fn() },
      dealerProfiles: { findFirst: jest.fn() },
    },
  },
}));

const reviewsRepo = await import("../../../src/modules/reviews/reviews.repository.js");
const { db } = await import("../../../src/db/index.js");
const {
  createReviewService,
  updateReviewService,
  deleteReviewService,
  getCarReviewsService,
  getDealerReviewsService,
  replyToReviewService,
  dealerDeleteReviewService,
  createAppReviewService,
  getTopAppReviewsService,
  getAllAppReviewsService,
} = await import("../../../src/modules/reviews/reviews.service.js");

beforeEach(() => jest.clearAllMocks());

const mockCar = { id: 5, dealerId: 20 };
const mockProfile = { id: 2 };
const mockReview = { id: 1, carId: 5, customerId: 3, rating: 4 };

describe("createReviewService", () => {
  it("throws INVALID_RATING when rating < 1", async () => {
    await expect(createReviewService(3, { carId: 5, rating: 0 })).rejects.toThrow("INVALID_RATING");
  });

  it("throws INVALID_RATING when rating > 5", async () => {
    await expect(createReviewService(3, { carId: 5, rating: 6 })).rejects.toThrow("INVALID_RATING");
  });

  it("throws CAR_NOT_FOUND", async () => {
    db.query.cars.findFirst.mockResolvedValue(null);
    await expect(createReviewService(3, { carId: 99, rating: 4 })).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("throws ALREADY_REVIEWED", async () => {
    db.query.cars.findFirst.mockResolvedValue(mockCar);
    reviewsRepo.getReviewByCustomerCarDB.mockResolvedValue(mockReview);
    await expect(createReviewService(3, { carId: 5, rating: 4 })).rejects.toThrow("ALREADY_REVIEWED");
  });

  it("creates review on success", async () => {
    db.query.cars.findFirst.mockResolvedValue(mockCar);
    reviewsRepo.getReviewByCustomerCarDB.mockResolvedValue(null);
    db.query.dealerProfiles.findFirst.mockResolvedValue(mockProfile);
    reviewsRepo.createReviewDB.mockResolvedValue(mockReview);
    const result = await createReviewService(3, { carId: 5, rating: 4 });
    expect(result.review).toEqual(mockReview);
    expect(result.message).toBe("Review submitted");
  });
});

describe("updateReviewService", () => {
  it("throws INVALID_RATING for out-of-range", async () => {
    await expect(updateReviewService(1, 3, { rating: 0 })).rejects.toThrow("INVALID_RATING");
  });

  it("throws REVIEW_NOT_FOUND when update returns null", async () => {
    reviewsRepo.updateReviewDB.mockResolvedValue(null);
    await expect(updateReviewService(1, 3, { rating: 3 })).rejects.toThrow("REVIEW_NOT_FOUND");
  });

  it("returns updated review", async () => {
    reviewsRepo.updateReviewDB.mockResolvedValue({ ...mockReview, rating: 3 });
    expect((await updateReviewService(1, 3, { rating: 3 })).review.rating).toBe(3);
  });
});

describe("deleteReviewService", () => {
  it("throws REVIEW_NOT_FOUND", async () => {
    reviewsRepo.deleteReviewDB.mockResolvedValue(null);
    await expect(deleteReviewService(1, 3)).rejects.toThrow("REVIEW_NOT_FOUND");
  });

  it("returns message on success", async () => {
    reviewsRepo.deleteReviewDB.mockResolvedValue({ id: 1 });
    expect((await deleteReviewService(1, 3)).message).toBe("Review deleted");
  });
});

describe("getCarReviewsService", () => {
  it("returns reviews and summary", async () => {
    reviewsRepo.getReviewsByCarDB.mockResolvedValue([mockReview]);
    reviewsRepo.getCarRatingSummaryDB.mockResolvedValue({ averageRating: 4.0, totalReviews: 1 });
    const result = await getCarReviewsService(5);
    expect(result.reviews).toHaveLength(1);
    expect(result.averageRating).toBe(4.0);
  });
});

describe("getDealerReviewsService", () => {
  it("throws DEALER_PROFILE_NOT_FOUND when profile missing", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(null);
    await expect(getDealerReviewsService(20)).rejects.toThrow("DEALER_PROFILE_NOT_FOUND");
  });

  it("returns reviews and summary", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(mockProfile);
    reviewsRepo.getReviewsByDealerDB.mockResolvedValue([mockReview]);
    reviewsRepo.getDealerRatingSummaryDB.mockResolvedValue({ averageRating: 4.5, totalReviews: 1 });
    const result = await getDealerReviewsService(20);
    expect(result.reviews).toHaveLength(1);
  });
});

describe("replyToReviewService", () => {
  it("throws REPLY_EMPTY for blank reply", async () => {
    await expect(replyToReviewService(20, 1, "   ")).rejects.toThrow("REPLY_EMPTY");
  });

  it("throws DEALER_PROFILE_NOT_FOUND when profile missing", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(null);
    await expect(replyToReviewService(20, 1, "Good feedback")).rejects.toThrow("DEALER_PROFILE_NOT_FOUND");
  });

  it("throws REVIEW_NOT_FOUND when reply returns null", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(mockProfile);
    reviewsRepo.replyToReviewDB.mockResolvedValue(null);
    await expect(replyToReviewService(20, 1, "Thanks")).rejects.toThrow("REVIEW_NOT_FOUND");
  });

  it("returns reply on success", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(mockProfile);
    reviewsRepo.replyToReviewDB.mockResolvedValue({ ...mockReview, replyText: "Thanks" });
    const result = await replyToReviewService(20, 1, "Thanks");
    expect(result.review.replyText).toBe("Thanks");
  });
});

describe("dealerDeleteReviewService", () => {
  it("throws DEALER_PROFILE_NOT_FOUND", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(null);
    await expect(dealerDeleteReviewService(20, 1)).rejects.toThrow("DEALER_PROFILE_NOT_FOUND");
  });

  it("throws REVIEW_NOT_FOUND", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(mockProfile);
    reviewsRepo.dealerDeleteReviewDB.mockResolvedValue(null);
    await expect(dealerDeleteReviewService(20, 1)).rejects.toThrow("REVIEW_NOT_FOUND");
  });

  it("returns message on success", async () => {
    db.query.dealerProfiles.findFirst.mockResolvedValue(mockProfile);
    reviewsRepo.dealerDeleteReviewDB.mockResolvedValue({ id: 1 });
    expect((await dealerDeleteReviewService(20, 1)).message).toBe("Review deleted");
  });
});

describe("createAppReviewService", () => {
  it("throws INVALID_RATING", async () => {
    await expect(createAppReviewService(3, { rating: 6 })).rejects.toThrow("INVALID_RATING");
  });

  it("throws ALREADY_REVIEWED for duplicate app review", async () => {
    reviewsRepo.getAppReviewByCustomerDB.mockResolvedValue(mockReview);
    await expect(createAppReviewService(3, { rating: 5 })).rejects.toThrow("ALREADY_REVIEWED");
  });

  it("creates app review", async () => {
    reviewsRepo.getAppReviewByCustomerDB.mockResolvedValue(null);
    reviewsRepo.createAppReviewDB.mockResolvedValue({ id: 2, rating: 5 });
    expect((await createAppReviewService(3, { rating: 5 })).message).toBe("Thank you for your review!");
  });
});

describe("getTopAppReviewsService", () => {
  it("returns top reviews", async () => {
    reviewsRepo.getTopAppReviewsDB.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    expect((await getTopAppReviewsService()).reviews).toHaveLength(2);
  });
});

describe("getAllAppReviewsService", () => {
  it("returns all app reviews", async () => {
    reviewsRepo.getAllAppReviewsDB.mockResolvedValue([{ id: 1 }]);
    expect((await getAllAppReviewsService()).reviews).toHaveLength(1);
  });
});
