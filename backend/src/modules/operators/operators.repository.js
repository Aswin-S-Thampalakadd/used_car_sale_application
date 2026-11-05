import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { operatorProfiles } from "../../db/schemas/operators.js";

export const createOperatorProfileDB = async ({ userId, dealerId }) => {
  const result = await db
    .insert(operatorProfiles)
    .values({ userId, dealerId })
    .returning();
  return result[0];
};

export const getOperatorProfileByUserIdDB = async (userId) => {
  return await db.query.operatorProfiles.findFirst({
    where: eq(operatorProfiles.userId, userId),
    with: {
      dealer: { columns: { id: true, dealershipName: true, isVerified: true, city: true } },
    },
  });
};

export const getOperatorsByDealerDB = async (dealerProfileId, { page = 1, limit = 20, search = "" } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [eq(operatorProfiles.dealerId, dealerProfileId)];

  if (search) {
    conditions.push(or(
      ilike(users.name, `%${search}%`),
      ilike(users.email, `%${search}%`),
    ));
  }

  const [rows, totalRes] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      operatorProfileId: operatorProfiles.id,
    })
      .from(operatorProfiles)
      .innerJoin(users, eq(users.id, operatorProfiles.userId))
      .where(and(...conditions))
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: count() })
      .from(operatorProfiles)
      .innerJoin(users, eq(users.id, operatorProfiles.userId))
      .where(and(...conditions)),
  ]);

  return { operators: rows, total: Number(totalRes[0]?.total ?? 0) };
};

export const deleteOperatorProfileDB = async (operatorProfileId, dealerProfileId) => {
  const result = await db
    .delete(operatorProfiles)
    .where(and(
      eq(operatorProfiles.id, operatorProfileId),
      eq(operatorProfiles.dealerId, dealerProfileId),
    ))
    .returning({ id: operatorProfiles.id, userId: operatorProfiles.userId });
  return result[0] || null;
};

export const getOperatorProfileByIdDB = async (operatorProfileId) => {
  return await db.query.operatorProfiles.findFirst({
    where: eq(operatorProfiles.id, operatorProfileId),
    with: {
      dealer: { columns: { id: true, dealershipName: true, userId: true } },
    },
  });
};

export const getAllOperatorsAdminDB = async ({ page = 1, limit = 20, search = "", dealerProfileId } = {}) => {
  const offset = (page - 1) * limit;
  const conditions = [];

  if (dealerProfileId) conditions.push(eq(operatorProfiles.dealerId, dealerProfileId));
  if (search) {
    conditions.push(or(
      ilike(users.name, `%${search}%`),
      ilike(users.email, `%${search}%`),
    ));
  }

  const whereClause = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRes] = await Promise.all([
    db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      mustChangePassword: users.mustChangePassword,
      createdAt: users.createdAt,
      lastLoginAt: users.lastLoginAt,
      operatorProfileId: operatorProfiles.id,
      dealerId: operatorProfiles.dealerId,
      dealershipName: dealerProfiles.dealershipName,
    })
      .from(operatorProfiles)
      .innerJoin(users, eq(users.id, operatorProfiles.userId))
      .innerJoin(dealerProfiles, eq(dealerProfiles.id, operatorProfiles.dealerId))
      .where(whereClause)
      .orderBy(desc(users.createdAt))
      .limit(limit)
      .offset(offset),

    db.select({ total: count() })
      .from(operatorProfiles)
      .innerJoin(users, eq(users.id, operatorProfiles.userId))
      .innerJoin(dealerProfiles, eq(dealerProfiles.id, operatorProfiles.dealerId))
      .where(whereClause),
  ]);

  return { operators: rows, total: Number(totalRes[0]?.total ?? 0) };
};
