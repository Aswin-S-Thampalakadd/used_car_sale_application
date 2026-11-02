import { AppError } from "../../utils/AppError.js";
import {
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
} from "./admin.service.js";

export const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, "Email and password are required");
  }
  const result = await adminLoginService({ email, password });
  return res.json(result);
};

export const getDashboardStats = async (_req, res) => {
  const stats = await getDashboardStatsService();
  return res.json({ success: true, stats });
};

export const getAllDealers = async (req, res) => {
  const result = await getAllDealersService(req.query);
  return res.json({ success: true, ...result });
};

export const verifyDealer = async (req, res) => {
  const dealerProfileId = Number(req.params.id);
  if (isNaN(dealerProfileId)) {
    throw new AppError(400, "Invalid dealer profile ID");
  }
  const { isVerified } = req.body;
  if (typeof isVerified !== "boolean") {
    throw new AppError(400, "isVerified must be a boolean");
  }
  const result = await verifyDealerService(dealerProfileId, isVerified);
  return res.json({ success: true, dealer: result });
};

export const getAllCustomers = async (req, res) => {
  const result = await getAllCustomersService(req.query);
  return res.json({ success: true, ...result });
};

export const activateUser = async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    throw new AppError(400, "Invalid user ID");
  }
  const result = await toggleUserActiveService(userId, true);
  return res.json({ success: true, user: result });
};

export const deactivateUser = async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    throw new AppError(400, "Invalid user ID");
  }
  const result = await toggleUserActiveService(userId, false);
  return res.json({ success: true, user: result });
};

export const deleteUser = async (req, res) => {
  const userId = Number(req.params.userId);
  if (isNaN(userId)) {
    throw new AppError(400, "Invalid user ID");
  }
  const result = await deleteUserService(userId);
  return res.json({ success: true, deleted: result });
};

export const getAllCars = async (req, res) => {
  const result = await getAllCarsAdminService(req.query);
  return res.json({ success: true, ...result });
};

export const updateCarStatus = async (req, res) => {
  const carId = Number(req.params.carId);
  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }
  const { status } = req.body;
  const validStatuses = ["draft", "active", "sold", "reserved", "inactive"];
  if (!validStatuses.includes(status)) {
    throw new AppError(400, "Invalid status value");
  }
  const result = await updateCarStatusService(carId, status);
  return res.json({ success: true, car: result });
};

export const toggleCarFeatured = async (req, res) => {
  const carId = Number(req.params.carId);
  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }
  const { isFeatured } = req.body;
  if (typeof isFeatured !== "boolean") {
    throw new AppError(400, "isFeatured must be a boolean");
  }
  const result = await toggleCarFeaturedService(carId, isFeatured);
  return res.json({ success: true, car: result });
};

export const deleteCar = async (req, res) => {
  const carId = Number(req.params.carId);
  if (isNaN(carId)) {
    throw new AppError(400, "Invalid car ID");
  }
  const result = await deleteCarService(carId);
  return res.json({ success: true, deleted: result });
};

export const getAllEnquiries = async (req, res) => {
  const result = await getAllEnquiriesService(req.query);
  return res.json({ success: true, ...result });
};

export const getAllReviews = async (req, res) => {
  const result = await getAllReviewsService(req.query);
  return res.json({ success: true, ...result });
};

export const deleteReview = async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  if (isNaN(reviewId)) {
    throw new AppError(400, "Invalid review ID");
  }
  const result = await deleteReviewService(reviewId);
  return res.json({ success: true, deleted: result });
};

export const approveReview = async (req, res) => {
  const reviewId = Number(req.params.reviewId);
  if (isNaN(reviewId)) {
    throw new AppError(400, "Invalid review ID");
  }

  const { isApproved } = req.body;
  if (typeof isApproved !== "boolean") {
    throw new AppError(400, "isApproved must be a boolean");
  }

  const result = await approveReviewService(reviewId, isApproved);
  return res.json({ success: true, review: result });
};

export const getAllSubscriptions = async (req, res) => {
  const result = await getAllSubscriptionsService(req.query);
  return res.json({ success: true, ...result });
};
