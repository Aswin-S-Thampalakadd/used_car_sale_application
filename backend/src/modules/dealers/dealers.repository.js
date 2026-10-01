import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { cars } from "../../db/schemas/cars.js";

export const getDealerProfileByUserIdDB = async (userId) => {
  return await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.userId, userId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          createdAt: true,
        },
      },
    },
  });
};

export const getDealerProfileByIdDB = async (dealerProfileId) => {
  return await db.query.dealerProfiles.findFirst({
    where: eq(dealerProfiles.id, dealerProfileId),
    with: {
      user: {
        columns: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          createdAt: true,
        },
      },
    },
  });
};

export const updateDealerProfileDB = async (userId, data) => {
  const result = await db
    .update(dealerProfiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(dealerProfiles.userId, userId))
    .returning();
  return result[0] || null;
};

export const getDealerCarsDB = async (dealerUserId, status) => {
  const conditions = [eq(cars.dealerId, dealerUserId)];

  return await db.query.cars.findMany({
    where: (c, { and, eq }) =>
      status
        ? and(eq(c.dealerId, dealerUserId), eq(c.status, status))
        : eq(c.dealerId, dealerUserId),
    with: {
      carImages: true,
      carFeatureMappings: { with: { feature: true } },
    },
    orderBy: (c, { desc }) => desc(c.createdAt),
  });
};
