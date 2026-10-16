import {
  and,
  count,
  desc,
  eq,
  ilike,
  or,
  sql,
} from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { userTypes } from "../../db/schemas/users_types.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { cars } from "../../db/schemas/cars.js";
import { carImages } from "../../db/schemas/car_images.js";
import { enquiries } from "../../db/schemas/enquiries.js";
import { reviews } from "../../db/schemas/reviews.js";
import { subscriptions } from "../../db/schemas/subscriptions.js";

// ─── DASHBOARD STATS ────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const CUSTOMER_TYPE_ID = 2;
  const DEALER_TYPE_ID = 3;

  const [
    totalUsersRes,
    totalCustomersRes,
    totalDealersRes,
    verifiedDealersRes,
    pendingDealersRes,
    totalCarsRes,
    activeCarsRes,
    soldCarsRes,
    totalEnquiriesRes,
    newEnquiriesRes,
    totalReviewsRes,
    activeSubscriptionsRes,
  ] = await Promise.all([
    db.select({ total: count() }).from(users),
    db.select({ total: count() }).from(users).where(eq(users.userTypeId, CUSTOMER_TYPE_ID)),
    db.select({ total: count() }).from(users).where(eq(users.userTypeId, DEALER_TYPE_ID)),
    db.select({ total: count() }).from(dealerProfiles).where(eq(dealerProfiles.isVerified, true)),
    db.select({ total: count() }).from(dealerProfiles).where(eq(dealerProfiles.isVerified, false)),
    db.select({ total: count() }).from(cars),
    db.select({ total: count() }).from(cars).where(eq(cars.status, "active")),
    db.select({ total: count() }).from(cars).where(eq(cars.status, "sold")),
    db.select({ total: count() }).from(enquiries),
    db.select({ total: count() }).from(enquiries).where(eq(enquiries.status, "new")),
    db.select({ total: count() }).from(reviews),
    db
      .select({ total: count() })
      .from(subscriptions)
      .where(eq(subscriptions.status, "active")),
  ]);

  return {
    totalUsers: Number(totalUsersRes[0]?.total ?? 0),
    totalCustomers: Number(totalCustomersRes[0]?.total ?? 0),
    totalDealers: Number(totalDealersRes[0]?.total ?? 0),
    verifiedDealers: Number(verifiedDealersRes[0]?.total ?? 0),
    pendingDealers: Number(pendingDealersRes[0]?.total ?? 0),
    totalCars: Number(totalCarsRes[0]?.total ?? 0),
    activeCars: Number(activeCarsRes[0]?.total ?? 0),
    soldCars: Number(soldCarsRes[0]?.total ?? 0),
    totalEnquiries: Number(totalEnquiriesRes[0]?.total ?? 0),
    newEnquiries: Number(newEnquiriesRes[0]?.total ?? 0),
    totalReviews: Number(totalReviewsRes[0]?.total ?? 0),
    activeSubscriptions: Number(activeSubscriptionsRes[0]?.total ?? 0),
  };
};

// ─── DEALERS ────────────────────────────────────────────────────────────────

export const getAllDealers = async ({ page = 1, limit = 20, search = "", isVerified }) => {
  const offset = (page - 1) * limit;

  const conditions = [eq(users.userTypeId, 3)]; // DEALER

  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(dealerProfiles.dealershipName, `%${search}%`),
        ilike(dealerProfiles.city, `%${search}%`)
      )
    );
  }

  if (isVerified !== undefined) {
    conditions.push(eq(dealerProfiles.isVerified, isVerified));
  }

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        dealerProfileId: dealerProfiles.id,
        dealershipName: dealerProfiles.dealershipName,
        city: dealerProfiles.city,
        state: dealerProfiles.state,
        isVerified: dealerProfiles.isVerified,
        logo: dealerProfiles.logo,
        gstNumber: dealerProfiles.gstNumber,
      })
      .from(users)
      .leftJoin(dealerProfiles, eq(dealerProfiles.userId, users.id))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(users)
      .leftJoin(dealerProfiles, eq(dealerProfiles.userId, users.id))
      .where(and(...conditions)),
  ]);

  return { dealers: rows, total: Number(totalRes[0]?.total ?? 0) };
};

export const verifyDealer = async (dealerProfileId, isVerified) => {
  const result = await db
    .update(dealerProfiles)
    .set({ isVerified, updatedAt: new Date() })
    .where(eq(dealerProfiles.id, dealerProfileId))
    .returning();
  return result[0] || null;
};

// ─── CUSTOMERS ──────────────────────────────────────────────────────────────

export const getAllCustomers = async ({ page = 1, limit = 20, search = "" }) => {
  const offset = (page - 1) * limit;

  const conditions = [eq(users.userTypeId, 2)]; // CUSTOMER

  if (search) {
    conditions.push(
      or(
        ilike(users.name, `%${search}%`),
        ilike(users.email, `%${search}%`),
        ilike(users.phone, `%${search}%`)
      )
    );
  }

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
        lastLoginAt: users.lastLoginAt,
        profileImage: users.profileImage,
      })
      .from(users)
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(users).where(and(...conditions)),
  ]);

  return { customers: rows, total: Number(totalRes[0]?.total ?? 0) };
};

// ─── SHARED USER OPS ────────────────────────────────────────────────────────

export const setUserActive = async (userId, isActive) => {
  const result = await db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(users.id, userId))
    .returning({ id: users.id, name: users.name, email: users.email, isActive: users.isActive });
  return result[0] || null;
};

export const adminDeleteUser = async (userId) => {
  const result = await db
    .delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id, email: users.email });
  return result[0] || null;
};

// ─── CARS ────────────────────────────────────────────────────────────────────

export const getAllCarsAdmin = async ({ page = 1, limit = 20, search = "", status }) => {
  const offset = (page - 1) * limit;

  const conditions = [];

  if (search) {
    conditions.push(
      or(
        ilike(cars.make, `%${search}%`),
        ilike(cars.model, `%${search}%`),
        ilike(cars.registrationNumber, `%${search}%`),
        ilike(users.name, `%${search}%`)
      )
    );
  }

  if (status) {
    conditions.push(eq(cars.status, status));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: cars.id,
        make: cars.make,
        model: cars.model,
        variant: cars.variant,
        year: cars.year,
        price: cars.price,
        status: cars.status,
        isFeatured: cars.isFeatured,
        fuelType: cars.fuelType,
        transmission: cars.transmission,
        kilometersDriven: cars.kilometersDriven,
        condition: cars.condition,
        registrationNumber: cars.registrationNumber,
        viewsCount: cars.viewsCount,
        createdAt: cars.createdAt,
        dealerId: cars.dealerId,
        dealerName: users.name,
        dealerEmail: users.email,
        primaryImage: sql`(
          SELECT image_url FROM car_images
          WHERE car_id = ${cars.id} AND is_primary = true
          LIMIT 1
        )`,
      })
      .from(cars)
      .leftJoin(users, eq(users.id, cars.dealerId))
      .where(whereClause)
      .orderBy(desc(cars.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(cars)
      .leftJoin(users, eq(users.id, cars.dealerId))
      .where(whereClause),
  ]);

  return { cars: rows, total: Number(totalRes[0]?.total ?? 0) };
};

export const adminUpdateCarStatus = async (carId, status) => {
  const result = await db
    .update(cars)
    .set({ status, updatedAt: new Date() })
    .where(eq(cars.id, carId))
    .returning({ id: cars.id, status: cars.status });
  return result[0] || null;
};

export const adminToggleCarFeatured = async (carId, isFeatured) => {
  const result = await db
    .update(cars)
    .set({ isFeatured, updatedAt: new Date() })
    .where(eq(cars.id, carId))
    .returning({ id: cars.id, isFeatured: cars.isFeatured });
  return result[0] || null;
};

export const adminDeleteCar = async (carId) => {
  const result = await db
    .delete(cars)
    .where(eq(cars.id, carId))
    .returning({ id: cars.id });
  return result[0] || null;
};

// ─── ENQUIRIES ───────────────────────────────────────────────────────────────

export const getAllEnquiriesAdmin = async ({ page = 1, limit = 20, status }) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(enquiries.status, status));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const customerAlias = sql`customer_users`;
  const dealerAlias = sql`dealer_users`;

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: enquiries.id,
        message: enquiries.message,
        status: enquiries.status,
        createdAt: enquiries.createdAt,
        carId: enquiries.carId,
        carMake: cars.make,
        carModel: cars.model,
        carYear: cars.year,
        customerId: enquiries.customerId,
        dealerId: enquiries.dealerId,
      })
      .from(enquiries)
      .leftJoin(cars, eq(cars.id, enquiries.carId))
      .where(whereClause)
      .orderBy(desc(enquiries.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(enquiries).where(whereClause),
  ]);

  return { enquiries: rows, total: Number(totalRes[0]?.total ?? 0) };
};

// ─── REVIEWS ─────────────────────────────────────────────────────────────────

export const getAllReviewsAdmin = async ({ page = 1, limit = 20, reviewType }) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  if (reviewType) conditions.push(eq(reviews.reviewType, reviewType));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: reviews.id,
        reviewType: reviews.reviewType,
        rating: reviews.rating,
        comment: reviews.comment,
        replyText: reviews.replyText,
        createdAt: reviews.createdAt,
        customerId: reviews.customerId,
        customerName: users.name,
        customerEmail: users.email,
        carId: reviews.carId,
        carMake: cars.make,
        carModel: cars.model,
        dealerId: reviews.dealerId,
      })
      .from(reviews)
      .leftJoin(users, eq(users.id, reviews.customerId))
      .leftJoin(cars, eq(cars.id, reviews.carId))
      .where(whereClause)
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(reviews).where(whereClause),
  ]);

  return { reviews: rows, total: Number(totalRes[0]?.total ?? 0) };
};

export const adminDeleteReview = async (reviewId) => {
  const result = await db
    .delete(reviews)
    .where(eq(reviews.id, reviewId))
    .returning({ id: reviews.id });
  return result[0] || null;
};

// ─── SUBSCRIPTIONS ───────────────────────────────────────────────────────────

export const getAllSubscriptionsAdmin = async ({ page = 1, limit = 20, status, planType }) => {
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(subscriptions.status, status));
  if (planType) conditions.push(eq(subscriptions.planType, planType));
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rows, totalRes] = await Promise.all([
    db
      .select({
        id: subscriptions.id,
        planType: subscriptions.planType,
        status: subscriptions.status,
        price: subscriptions.price,
        carLimit: subscriptions.carLimit,
        startDate: subscriptions.startDate,
        endDate: subscriptions.endDate,
        paymentStatus: subscriptions.paymentStatus,
        razorpayOrderId: subscriptions.razorpayOrderId,
        razorpayPaymentId: subscriptions.razorpayPaymentId,
        createdAt: subscriptions.createdAt,
        userId: subscriptions.userId,
        userName: users.name,
        userEmail: users.email,
      })
      .from(subscriptions)
      .leftJoin(users, eq(users.id, subscriptions.userId))
      .where(whereClause)
      .orderBy(desc(subscriptions.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ total: count() }).from(subscriptions).where(whereClause),
  ]);

  return { subscriptions: rows, total: Number(totalRes[0]?.total ?? 0) };
};
