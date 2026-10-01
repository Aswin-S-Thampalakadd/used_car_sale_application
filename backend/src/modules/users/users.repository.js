import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { users } from "../../db/schemas/users.js";

export const getUserByIdDB = async (userId) => {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      profileImage: users.profileImage,
      userTypeId: users.userTypeId,
      isActive: users.isActive,
      emailVerified: users.emailVerified,
      phoneVerified: users.phoneVerified,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result[0] || null;
};

export const updateUserDB = async (userId, { name, phone, profileImage }) => {
  const updateData = { updatedAt: new Date() };
  if (name !== undefined) updateData.name = name.trim();
  if (phone !== undefined) updateData.phone = phone;
  if (profileImage !== undefined) updateData.profileImage = profileImage;

  const result = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      profileImage: users.profileImage,
      updatedAt: users.updatedAt,
    });

  return result[0] || null;
};
