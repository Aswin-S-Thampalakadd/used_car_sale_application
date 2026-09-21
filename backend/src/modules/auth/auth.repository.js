import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { refreshTokens } from "../../db/schemas/refresh_tokens.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";

export const findUserByEmail = async (email) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return result[0] || null;
};

export const findUserByPhone = async (phone) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.phone, phone))
    .limit(1);

  return result[0] || null;
};

export const createUser = async ({
  name,
  email,
  phone,
  passwordHash,
  userTypeId,
}) => {
  const result = await db
    .insert(users)
    .values({
      name,
      email,
      phone,
      passwordHash,
      userTypeId,
    })
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      profileImage: users.profileImage,
      userTypeId: users.userTypeId,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      phoneVerified: users.phoneVerified,
      createdAt: users.createdAt,
    });

  return result[0];
};

export const createDealerProfile = async ({
  userId,
  dealershipName,
  description,
  logo,
  address,
  city,
  state,
  country,
  pincode,
  latitude,
  longitude,
  gstNumber,
}) => {
  const result = await db
    .insert(dealerProfiles)
    .values({
      userId,
      dealershipName,
      description,
      logo,
      address,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      gstNumber,
    })
    .returning();

  return result[0];
};

export const updateLastLogin = async (userId) => {
  await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId));
};

export const createRefreshToken = async ({ userId, tokenHash, expiresAt }) => {
  const result = await db
    .insert(refreshTokens)
    .values({
      userId,
      tokenHash,
      expiresAt,
    })
    .returning({
      id: refreshTokens.id,
      userId: refreshTokens.userId,
      expiresAt: refreshTokens.expiresAt,
    });

  return result[0];
};

export const findRefreshToken = async (tokenHash) => {
  const result = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.tokenHash, tokenHash),
        isNull(refreshTokens.revokedAt),
        gt(refreshTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  return result[0] || null;
};

export const revokeRefreshToken = async (tokenId) => {
  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(refreshTokens.id, tokenId));
};

export const revokeAllUserRefreshTokens = async (userId) => {
  await db
    .update(refreshTokens)
    .set({
      revokedAt: new Date(),
    })
    .where(
      and(eq(refreshTokens.userId, userId), isNull(refreshTokens.revokedAt))
    );
};

export const deactivateUser = async (userId) => {
  const result = await db
    .update(users)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      updatedAt: users.updatedAt,
    });

  return result[0] || null;
};

export const activateUser = async (userId) => {
  const result = await db
    .update(users)
    .set({
      isActive: true,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isActive: users.isActive,
      updatedAt: users.updatedAt,
    });

  return result[0] || null;
};

export const deleteUser = async (userId) => {
  const result = await db.delete(users).where(eq(users.id, userId)).returning({
    id: users.id,
    email: users.email,
  });

  return result[0] || null;
};
