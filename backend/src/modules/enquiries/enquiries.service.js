import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { eq } from "drizzle-orm";
import {
  createEnquiryDB,
  deleteEnquiryDB,
  getEnquiriesByCustomerDB,
  getEnquiriesByDealerDB,
  updateEnquiryStatusDB,
} from "./enquiries.repository.js";
import { notifyNewEnquiry } from "../notifications/notifications.service.js";
import { usersTypess } from "../../constants/constants.js";

const VALID_STATUSES = ["new", "contacted", "closed"];

export const createEnquiryService = async (customerId, { carId, message }) => {
  const car = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    columns: {
      id: true,
      dealerId: true,
      status: true,
      make: true,
      model: true,
      year: true,
    },
  });

  if (!car) throw new Error("CAR_NOT_FOUND");
  if (car.status !== "active") throw new Error("CAR_NOT_AVAILABLE");

  const enquiry = await createEnquiryDB({
    carId,
    customerId,
    dealerId: car.dealerId,
    message: message || null,
  });

  notifyNewEnquiry(car.dealerId, { ...enquiry, customer: null }, car).catch(
    () => {},
  );

  return { message: "Enquiry sent successfully", enquiry };
};

export const getMyEnquiriesService = async (userId, userTypeId) => {
  if (userTypeId === usersTypess.DEALER.id) {
    return await getEnquiriesByDealerDB(userId);
  }
  return await getEnquiriesByCustomerDB(userId);
};

export const updateEnquiryStatusService = async (
  enquiryId,
  dealerId,
  status,
) => {
  if (!VALID_STATUSES.includes(status)) throw new Error("INVALID_STATUS");

  const enquiry = await updateEnquiryStatusDB(enquiryId, dealerId, status);
  if (!enquiry) throw new Error("ENQUIRY_NOT_FOUND");

  return { message: "Enquiry status updated", enquiry };
};

export const deleteEnquiryService = async (enquiryId, customerId) => {
  const enquiry = await deleteEnquiryDB(enquiryId, customerId);
  if (!enquiry) throw new Error("ENQUIRY_NOT_FOUND");

  return { message: "Enquiry deleted successfully" };
};
