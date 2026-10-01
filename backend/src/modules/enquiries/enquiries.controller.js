import {
  createEnquiryService,
  deleteEnquiryService,
  getMyEnquiriesService,
  updateEnquiryStatusService,
} from "./enquiries.service.js";

export const createEnquiry = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const { carId, message } = req.body;

    if (!carId) {
      return res.status(400).json({ message: "carId is required" });
    }

    const result = await createEnquiryService(customerId, {
      carId: Number(carId),
      message,
    });

    return res.status(201).json(result);
  } catch (error) {
    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({ message: "Car not found" });
    }
    if (error.message === "CAR_NOT_AVAILABLE") {
      return res
        .status(400)
        .json({ message: "Car is not available for enquiry" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to create enquiry" });
  }
};

export const getMyEnquiries = async (req, res) => {
  try {
    const { userId, userTypeId } = req.user;
    const enquiries = await getMyEnquiriesService(userId, userTypeId);
    return res.json({ enquiries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to fetch enquiries" });
  }
};

export const updateEnquiryStatus = async (req, res) => {
  try {
    const dealerId = req.user.userId;
    const enquiryId = Number(req.params.id);
    const { status } = req.body;

    if (!enquiryId || isNaN(enquiryId)) {
      return res.status(400).json({ message: "Invalid enquiry ID" });
    }
    if (!status) {
      return res.status(400).json({ message: "status is required" });
    }

    const result = await updateEnquiryStatusService(
      enquiryId,
      dealerId,
      status
    );
    return res.json(result);
  } catch (error) {
    if (error.message === "ENQUIRY_NOT_FOUND") {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    if (error.message === "INVALID_STATUS") {
      return res.status(400).json({ message: "Invalid status value" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to update enquiry" });
  }
};

export const deleteEnquiry = async (req, res) => {
  try {
    const customerId = req.user.userId;
    const enquiryId = Number(req.params.id);

    if (!enquiryId || isNaN(enquiryId)) {
      return res.status(400).json({ message: "Invalid enquiry ID" });
    }

    const result = await deleteEnquiryService(enquiryId, customerId);
    return res.json(result);
  } catch (error) {
    if (error.message === "ENQUIRY_NOT_FOUND") {
      return res.status(404).json({ message: "Enquiry not found" });
    }
    console.error(error);
    return res.status(500).json({ message: "Failed to delete enquiry" });
  }
};
