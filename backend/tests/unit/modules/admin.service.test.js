import { jest } from "@jest/globals";
import bcrypt from "bcrypt";

jest.unstable_mockModule("../../../src/modules/auth/auth.repository.js", () => ({
  findUserByEmail: jest.fn(),
  createRefreshToken: jest.fn(),
}));

jest.unstable_mockModule("../../../src/modules/admin/admin.repository.js", () => ({
  getDashboardStats: jest.fn(),
  getAllDealers: jest.fn(),
  verifyDealer: jest.fn(),
  getAllCustomers: jest.fn(),
  setUserActive: jest.fn(),
  adminDeleteUser: jest.fn(),
  getAllCarsAdmin: jest.fn(),
  adminUpdateCarStatus: jest.fn(),
  adminToggleCarFeatured: jest.fn(),
  adminDeleteCar: jest.fn(),
  getAllEnquiriesAdmin: jest.fn(),
  getAllReviewsAdmin: jest.fn(),
  adminDeleteReview: jest.fn(),
  getAllSubscriptionsAdmin: jest.fn(),
}));

jest.unstable_mockModule("../../../src/modules/reviews/reviews.repository.js", () => ({
  approveReviewDB: jest.fn(),
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
}));

const authRepo = await import("../../../src/modules/auth/auth.repository.js");
const adminRepo = await import("../../../src/modules/admin/admin.repository.js");
const reviewsRepo = await import("../../../src/modules/reviews/reviews.repository.js");
const {
  adminLoginService,
  getDashboardStatsService,
  getAllDealersService,
  verifyDealerService,
  getAllCustomersService,
  toggleUserActiveService,
  deleteUserService,
  getAllCarsAdminService,
  updateCarStatusService,
  toggleCarFeaturedService,
  deleteCarService,
  getAllEnquiriesService,
  getAllReviewsService,
  deleteReviewService,
  approveReviewService,
  getAllSubscriptionsService,
} = await import("../../../src/modules/admin/admin.service.js");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
});

const adminUser = {
  id: 1,
  name: "Admin",
  email: "admin@example.com",
  userTypeId: 1,
  isActive: true,
  passwordHash: bcrypt.hashSync("adminpass", 10),
};

describe("adminLoginService", () => {
  it("throws INVALID_CREDENTIALS when user not found", async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    await expect(adminLoginService({ email: "x@x.com", password: "p" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("throws ACCOUNT_INACTIVE", async () => {
    authRepo.findUserByEmail.mockResolvedValue({ ...adminUser, isActive: false });
    await expect(adminLoginService({ email: "admin@example.com", password: "p" })).rejects.toThrow("ACCOUNT_INACTIVE");
  });

  it("throws INVALID_CREDENTIALS for non-admin userTypeId", async () => {
    authRepo.findUserByEmail.mockResolvedValue({ ...adminUser, userTypeId: 2 });
    await expect(adminLoginService({ email: "admin@example.com", password: "p" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("throws INVALID_CREDENTIALS on wrong password", async () => {
    authRepo.findUserByEmail.mockResolvedValue(adminUser);
    await expect(adminLoginService({ email: "admin@example.com", password: "wrong" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("returns tokens on success and strips passwordHash", async () => {
    authRepo.findUserByEmail.mockResolvedValue(adminUser);
    authRepo.createRefreshToken.mockResolvedValue({ id: 1 });
    const result = await adminLoginService({ email: "admin@example.com", password: "adminpass" });
    expect(result.accessToken).toBeDefined();
    expect(result.user.passwordHash).toBeUndefined();
  });
});

describe("getDashboardStatsService", () => {
  it("delegates to adminRepo", async () => {
    adminRepo.getDashboardStats.mockResolvedValue({ totalUsers: 10 });
    expect((await getDashboardStatsService()).totalUsers).toBe(10);
  });
});

describe("getAllDealersService", () => {
  it("passes parsed query to repo", async () => {
    adminRepo.getAllDealers.mockResolvedValue({ dealers: [], total: 0 });
    await getAllDealersService({ page: "2", limit: "10", search: "kochi" });
    expect(adminRepo.getAllDealers).toHaveBeenCalledWith(expect.objectContaining({ page: 2, limit: 10, search: "kochi" }));
  });
});

describe("verifyDealerService", () => {
  it("throws DEALER_NOT_FOUND when repo returns null", async () => {
    adminRepo.verifyDealer.mockResolvedValue(null);
    await expect(verifyDealerService(99, true)).rejects.toThrow("DEALER_NOT_FOUND");
  });

  it("returns dealer on success", async () => {
    adminRepo.verifyDealer.mockResolvedValue({ id: 1, isVerified: true });
    expect((await verifyDealerService(1, true)).isVerified).toBe(true);
  });
});

describe("toggleUserActiveService", () => {
  it("throws USER_NOT_FOUND", async () => {
    adminRepo.setUserActive.mockResolvedValue(null);
    await expect(toggleUserActiveService(99, true)).rejects.toThrow("USER_NOT_FOUND");
  });

  it("returns user on success", async () => {
    adminRepo.setUserActive.mockResolvedValue({ id: 1, isActive: true });
    expect((await toggleUserActiveService(1, true)).isActive).toBe(true);
  });
});

describe("deleteUserService", () => {
  it("throws USER_NOT_FOUND", async () => {
    adminRepo.adminDeleteUser.mockResolvedValue(null);
    await expect(deleteUserService(99)).rejects.toThrow("USER_NOT_FOUND");
  });

  it("returns deleted user", async () => {
    adminRepo.adminDeleteUser.mockResolvedValue({ id: 1 });
    expect((await deleteUserService(1)).id).toBe(1);
  });
});

describe("updateCarStatusService (admin)", () => {
  it("throws CAR_NOT_FOUND", async () => {
    adminRepo.adminUpdateCarStatus.mockResolvedValue(null);
    await expect(updateCarStatusService(99, "active")).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("returns car on success", async () => {
    adminRepo.adminUpdateCarStatus.mockResolvedValue({ id: 1, status: "active" });
    expect((await updateCarStatusService(1, "active")).status).toBe("active");
  });
});

describe("toggleCarFeaturedService", () => {
  it("throws CAR_NOT_FOUND", async () => {
    adminRepo.adminToggleCarFeatured.mockResolvedValue(null);
    await expect(toggleCarFeaturedService(99, true)).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("returns car on success", async () => {
    adminRepo.adminToggleCarFeatured.mockResolvedValue({ id: 1, isFeatured: true });
    expect((await toggleCarFeaturedService(1, true)).isFeatured).toBe(true);
  });
});

describe("deleteCarService (admin)", () => {
  it("throws CAR_NOT_FOUND", async () => {
    adminRepo.adminDeleteCar.mockResolvedValue(null);
    await expect(deleteCarService(99)).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("returns deleted car", async () => {
    adminRepo.adminDeleteCar.mockResolvedValue({ id: 1 });
    expect((await deleteCarService(1)).id).toBe(1);
  });
});

describe("deleteReviewService", () => {
  it("throws REVIEW_NOT_FOUND", async () => {
    adminRepo.adminDeleteReview.mockResolvedValue(null);
    await expect(deleteReviewService(99)).rejects.toThrow("REVIEW_NOT_FOUND");
  });

  it("returns deleted review", async () => {
    adminRepo.adminDeleteReview.mockResolvedValue({ id: 1 });
    expect((await deleteReviewService(1)).id).toBe(1);
  });
});

describe("approveReviewService", () => {
  it("throws REVIEW_NOT_FOUND", async () => {
    reviewsRepo.approveReviewDB.mockResolvedValue(null);
    await expect(approveReviewService(99, true)).rejects.toThrow("REVIEW_NOT_FOUND");
  });

  it("returns result on success", async () => {
    reviewsRepo.approveReviewDB.mockResolvedValue({ id: 1, isApproved: true });
    expect((await approveReviewService(1, true)).isApproved).toBe(true);
  });
});

describe("getAllCarsAdminService", () => {
  it("passes status filter to repo", async () => {
    adminRepo.getAllCarsAdmin.mockResolvedValue({ cars: [], total: 0 });
    await getAllCarsAdminService({ page: "1", status: "active" });
    expect(adminRepo.getAllCarsAdmin).toHaveBeenCalledWith(expect.objectContaining({ status: "active" }));
  });
});

describe("getAllCustomersService", () => {
  it("delegates with pagination", async () => {
    adminRepo.getAllCustomers.mockResolvedValue({ customers: [], total: 0 });
    await getAllCustomersService({ page: "1" });
    expect(adminRepo.getAllCustomers).toHaveBeenCalled();
  });
});

describe("getAllEnquiriesService", () => {
  it("delegates with pagination", async () => {
    adminRepo.getAllEnquiriesAdmin.mockResolvedValue({ enquiries: [], total: 0 });
    await getAllEnquiriesService({ page: "1" });
    expect(adminRepo.getAllEnquiriesAdmin).toHaveBeenCalled();
  });
});

describe("getAllReviewsService", () => {
  it("parses isApproved boolean from query string", async () => {
    adminRepo.getAllReviewsAdmin.mockResolvedValue({ reviews: [], total: 0 });
    await getAllReviewsService({ isApproved: "true" });
    expect(adminRepo.getAllReviewsAdmin).toHaveBeenCalledWith(expect.objectContaining({ isApproved: true }));
  });
});

describe("getAllSubscriptionsService", () => {
  it("passes planType filter to repo", async () => {
    adminRepo.getAllSubscriptionsAdmin.mockResolvedValue({ subscriptions: [], total: 0 });
    await getAllSubscriptionsService({ page: "1", planType: "elite" });
    expect(adminRepo.getAllSubscriptionsAdmin).toHaveBeenCalledWith(expect.objectContaining({ planType: "elite" }));
  });
});
