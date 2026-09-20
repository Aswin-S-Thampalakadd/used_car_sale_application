import { and, eq, gt, isNull } from "drizzle-orm";

import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";
import { refreshTokens } from "../../db/schemas/refresh_tokens.js";

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
