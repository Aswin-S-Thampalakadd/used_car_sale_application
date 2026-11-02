import { AppError } from "../../utils/AppError.js";
import {
  createEnquiryService,
  deleteEnquiryService,
  getMyEnquiriesService,
  updateEnquiryStatusService,
} from "./enquiries.service.js";

export const createEnquiry = async (req, res) => {
  const customerId = req.user.userId;
  const { carId, message } = req.body;

  if (!carId) {
    throw new AppError(400, "carId is required");
  }

  const result = await createEnquiryService(customerId, {
    carId: Number(carId),
    message,
  });

  return res.status(201).json(result);
};

export const getMyEnquiries = async (req, res) => {
  const { userId, userTypeId } = req.user;
  const enquiries = await getMyEnquiriesService(userId, userTypeId);
  return res.json({ enquiries });
};

export const updateEnquiryStatus = async (req, res) => {
  const dealerId = req.user.userId;
  const enquiryId = Number(req.params.id);
  const { status } = req.body;

  if (!enquiryId || isNaN(enquiryId)) {
    throw new AppError(400, "Invalid enquiry ID");
  }
  if (!status) {
    throw new AppError(400, "status is required");
  }

  const result = await updateEnquiryStatusService(enquiryId, dealerId, status);
  return res.json(result);
};

export const deleteEnquiry = async (req, res) => {
  const customerId = req.user.userId;
  const enquiryId = Number(req.params.id);

  if (!enquiryId || isNaN(enquiryId)) {
    throw new AppError(400, "Invalid enquiry ID");
  }

  const result = await deleteEnquiryService(enquiryId, customerId);
  return res.json(result);
};
