import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { findUserByEmail } from "../auth/auth.repository.js";
import { createRefreshToken } from "../auth/auth.repository.js";
import {
  getDashboardStats,
  getAllDealers,
  verifyDealer,
  getAllCustomers,
  setUserActive,
  adminDeleteUser,
  getAllCarsAdmin,
  adminUpdateCarStatus,
  adminToggleCarFeatured,
  adminDeleteCar,
  getAllEnquiriesAdmin,
  getAllReviewsAdmin,
  adminDeleteReview,
  getAllSubscriptionsAdmin,
} from "./admin.repository.js";

import { approveReviewDB } from "../reviews/reviews.repository.js";

const ADMIN_USER_TYPE_ID = 1;

// ─── AUTH ────────────────────────────────────────────────────────────────────

export const adminLoginService = async ({ email, password }) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) throw new Error("INVALID_CREDENTIALS");
  if (!user.isActive) throw new Error("ACCOUNT_INACTIVE");
  if (user.userTypeId !== ADMIN_USER_TYPE_ID) throw new Error("INVALID_CREDENTIALS");
  if (!user.passwordHash) throw new Error("INVALID_CREDENTIALS");

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) throw new Error("INVALID_CREDENTIALS");

  const accessToken = jwt.sign(
    { userId: user.id, userTypeId: user.userTypeId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m" }
  );

  const refreshToken = jwt.sign(
    { userId: user.id, userTypeId: user.userTypeId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" }
  );

  const tokenHash = crypto.createHash("sha256").update(refreshToken).digest("hex");
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await createRefreshToken({ userId: user.id, tokenHash, expiresAt });

  const { passwordHash, ...safeUser } = user;

  return { message: "Admin login successful", user: safeUser, accessToken, refreshToken };
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export const getDashboardStatsService = async () => {
  return getDashboardStats();
};

// ─── DEALERS ─────────────────────────────────────────────────────────────────

export const getAllDealersService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const search = query.search || "";
  const isVerified =
    query.isVerified === "true" ? true : query.isVerified === "false" ? false : undefined;

  return getAllDealers({ page, limit, search, isVerified });
};

export const verifyDealerService = async (dealerProfileId, isVerified) => {
  const result = await verifyDealer(dealerProfileId, isVerified);
  if (!result) throw new Error("DEALER_NOT_FOUND");
  return result;
};

// ─── CUSTOMERS ───────────────────────────────────────────────────────────────

export const getAllCustomersService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const search = query.search || "";

  return getAllCustomers({ page, limit, search });
};

// ─── SHARED USER OPS ─────────────────────────────────────────────────────────

export const toggleUserActiveService = async (userId, isActive) => {
  const result = await setUserActive(userId, isActive);
  if (!result) throw new Error("USER_NOT_FOUND");
  return result;
};

export const deleteUserService = async (userId) => {
  const result = await adminDeleteUser(userId);
  if (!result) throw new Error("USER_NOT_FOUND");
  return result;
};

// ─── CARS ─────────────────────────────────────────────────────────────────────

export const getAllCarsAdminService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const search = query.search || "";
  const status = query.status || "";

  return getAllCarsAdmin({ page, limit, search, status: status || undefined });
};

export const updateCarStatusService = async (carId, status) => {
  const result = await adminUpdateCarStatus(carId, status);
  if (!result) throw new Error("CAR_NOT_FOUND");
  return result;
};

export const toggleCarFeaturedService = async (carId, isFeatured) => {
  const result = await adminToggleCarFeatured(carId, isFeatured);
  if (!result) throw new Error("CAR_NOT_FOUND");
  return result;
};

export const deleteCarService = async (carId) => {
  const result = await adminDeleteCar(carId);
  if (!result) throw new Error("CAR_NOT_FOUND");
  return result;
};

// ─── ENQUIRIES ────────────────────────────────────────────────────────────────

export const getAllEnquiriesService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const status = query.status || "";

  return getAllEnquiriesAdmin({ page, limit, status: status || undefined });
};

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export const getAllReviewsService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const reviewType = query.reviewType || "";
  const isApproved =
    query.isApproved === "true"  ? true  :
    query.isApproved === "false" ? false : undefined;

  return getAllReviewsAdmin({ page, limit, reviewType: reviewType || undefined, isApproved });
};

export const deleteReviewService = async (reviewId) => {
  const result = await adminDeleteReview(reviewId);
  if (!result) throw new Error("REVIEW_NOT_FOUND");
  return result;
};

export const approveReviewService = async (reviewId, isApproved) => {
  const result = await approveReviewDB(reviewId, isApproved);
  if (!result) throw new Error("REVIEW_NOT_FOUND");
  return result;
};

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────

export const getAllSubscriptionsService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const status = query.status || "";
  const planType = query.planType || "";

  return getAllSubscriptionsAdmin({
    page,
    limit,
    status: status || undefined,
    planType: planType || undefined,
  });
};
