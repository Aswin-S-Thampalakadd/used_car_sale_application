import bcrypt from "bcrypt";
import { db } from "../../db/index.js";
import { eq } from "drizzle-orm";
import { users } from "../../db/schemas/users.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { findUserByEmail } from "../auth/auth.repository.js";
import {
  createOperatorProfileDB,
  deleteOperatorProfileDB,
  getAllOperatorsAdminDB,
  getOperatorProfileByIdDB,
  getOperatorProfileByUserIdDB,
  getOperatorsByDealerDB,
} from "./operators.repository.js";
import { getUserSubscriptionService } from "../subscriptions/subscriptions.service.js";
import { countDealerCarsDB } from "../cars/cars.repository.js";

const OPERATOR_USER_TYPE_ID = 4;

const getDealerProfileByUserId = async (userId) => {
  return await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.userId, userId),
    columns: { id: true, dealershipName: true },
  });
};

export const createOperatorService = async (dealerUserId, { name, email, password }) => {
  const dealerProfile = await getDealerProfileByUserId(dealerUserId);
  if (!dealerProfile) throw new Error("PROFILE_NOT_FOUND");

  const existing = await findUserByEmail(email.trim().toLowerCase());
  if (existing) throw new Error("EMAIL_ALREADY_EXISTS");

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(users)
    .values({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      userTypeId: OPERATOR_USER_TYPE_ID,
      mustChangePassword: true,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      userTypeId: users.userTypeId,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
    });

  const profile = await createOperatorProfileDB({
    userId: user.id,
    dealerId: dealerProfile.id,
  });

  return { message: "Operator created successfully", user, profile };
};

export const getMyOperatorsService = async (dealerUserId, query = {}) => {
  const dealerProfile = await getDealerProfileByUserId(dealerUserId);
  if (!dealerProfile) throw new Error("PROFILE_NOT_FOUND");

  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, parseInt(query.limit) || 20);
  return getOperatorsByDealerDB(dealerProfile.id, { page, limit, search: query.search || "" });
};

export const deactivateOperatorService = async (operatorProfileId, dealerUserId) => {
  const dealerProfile = await getDealerProfileByUserId(dealerUserId);
  if (!dealerProfile) throw new Error("PROFILE_NOT_FOUND");

  const op = await getOperatorProfileByIdDB(operatorProfileId);
  if (!op || op.dealerId !== dealerProfile.id) throw new Error("OPERATOR_NOT_FOUND");

  const [updated] = await db
    .update(users)
    .set({ isActive: false, updatedAt: new Date() })
    .where(eq(users.id, op.userId))
    .returning({ id: users.id, isActive: users.isActive });

  if (!updated) throw new Error("OPERATOR_NOT_FOUND");
  return { message: "Operator deactivated", user: updated };
};

export const activateOperatorService = async (operatorProfileId, dealerUserId) => {
  const dealerProfile = await getDealerProfileByUserId(dealerUserId);
  if (!dealerProfile) throw new Error("PROFILE_NOT_FOUND");

  const op = await getOperatorProfileByIdDB(operatorProfileId);
  if (!op || op.dealerId !== dealerProfile.id) throw new Error("OPERATOR_NOT_FOUND");

  const [updated] = await db
    .update(users)
    .set({ isActive: true, updatedAt: new Date() })
    .where(eq(users.id, op.userId))
    .returning({ id: users.id, isActive: users.isActive });

  if (!updated) throw new Error("OPERATOR_NOT_FOUND");
  return { message: "Operator activated", user: updated };
};

export const deleteOperatorService = async (operatorProfileId, dealerUserId) => {
  const dealerProfile = await getDealerProfileByUserId(dealerUserId);
  if (!dealerProfile) throw new Error("PROFILE_NOT_FOUND");

  const deleted = await deleteOperatorProfileDB(operatorProfileId, dealerProfile.id);
  if (!deleted) throw new Error("OPERATOR_NOT_FOUND");

  await db.delete(users).where(eq(users.id, deleted.userId));
  return { message: "Operator deleted" };
};

export const resetOperatorPasswordService = async (operatorProfileId, dealerUserId, newPassword) => {
  const dealerProfile = await getDealerProfileByUserId(dealerUserId);
  if (!dealerProfile) throw new Error("PROFILE_NOT_FOUND");

  const op = await getOperatorProfileByIdDB(operatorProfileId);
  if (!op || op.dealerId !== dealerProfile.id) throw new Error("OPERATOR_NOT_FOUND");

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: true, updatedAt: new Date() })
    .where(eq(users.id, op.userId));

  return { message: "Password reset. Operator must change it on next login." };
};

export const getMyOperatorProfileService = async (userId) => {
  const profile = await getOperatorProfileByUserIdDB(userId);
  if (!profile) throw new Error("OPERATOR_NOT_FOUND");
  return profile;
};

export const changeOperatorPasswordService = async (userId, newPassword) => {
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(users.id, userId));
  return { message: "Password changed successfully" };
};

export const checkOperatorCarLimitService = async (operatorUserId) => {
  const profile = await getOperatorProfileByUserIdDB(operatorUserId);
  if (!profile) throw new Error("OPERATOR_NOT_FOUND");

  const dealerUser = await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.id, profile.dealerId),
    columns: { userId: true },
  });
  if (!dealerUser) throw new Error("DEALER_NOT_FOUND");

  const subscription = await getUserSubscriptionService(dealerUser.userId);
  const currentCount = await countDealerCarsDB(dealerUser.userId);

  return {
    hasReachedLimit: currentCount >= subscription.carLimit,
    currentCount,
    limit: subscription.carLimit,
    planType: subscription.planType,
    dealerId: profile.dealerId,
    dealerUserId: dealerUser.userId,
  };
};

export const getAllOperatorsAdminService = async (query = {}) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 20);
  const dealerProfileId = query.dealerProfileId ? Number(query.dealerProfileId) : undefined;
  return getAllOperatorsAdminDB({ page, limit, search: query.search || "", dealerProfileId });
};
