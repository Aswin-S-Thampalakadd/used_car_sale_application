import { and, desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { enquiries } from "../../db/schemas/enquiries.js";
import { users } from "../../db/schemas/users.js";
import { cars } from "../../db/schemas/cars.js";

export const createEnquiryDB = async ({
  carId,
  customerId,
  dealerId,
  message,
}) => {
  const result = await db
    .insert(enquiries)
    .values({ carId, customerId, dealerId, message })
    .returning();
  return result[0];
};

export const getEnquiriesByCustomerDB = async (customerId) => {
  return await db.query.enquiries.findMany({
    where: eq(enquiries.customerId, customerId),
    with: {
      car: {
        with: { carImages: true },
      },
    },
    orderBy: desc(enquiries.createdAt),
  });
};

export const getEnquiriesByDealerDB = async (dealerId) => {
  return await db.query.enquiries.findMany({
    where: eq(enquiries.dealerId, dealerId),
    with: {
      car: {
        with: { carImages: true },
      },
      customer: {
        columns: { id: true, name: true, email: true, phone: true },
      },
    },
    orderBy: desc(enquiries.createdAt),
  });
};

export const getEnquiryByIdDB = async (enquiryId) => {
  return await db.query.enquiries.findFirst({
    where: eq(enquiries.id, enquiryId),
    with: {
      car: { with: { carImages: true } },
      customer: {
        columns: { id: true, name: true, email: true, phone: true },
      },
    },
  });
};

export const updateEnquiryStatusDB = async (enquiryId, dealerId, status) => {
  const result = await db
    .update(enquiries)
    .set({ status, updatedAt: new Date() })
    .where(
      and(eq(enquiries.id, enquiryId), eq(enquiries.dealerId, dealerId))
    )
    .returning();
  return result[0] || null;
};

export const deleteEnquiryDB = async (enquiryId, customerId) => {
  const result = await db
    .delete(enquiries)
    .where(
      and(eq(enquiries.id, enquiryId), eq(enquiries.customerId, customerId))
    )
    .returning({ id: enquiries.id });
  return result[0] || null;
};
