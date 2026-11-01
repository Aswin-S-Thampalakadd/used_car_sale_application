import {
  adminLoginService,
  getDashboardStatsService,
  getAllDealersService,
  verifyDealerService,
  getAllCustomersService,
  toggleUserActiveService,
  deleteUserService,
  getAllCarsAdminService,
  updateCarStatusService,
  toggleCarFeaturedService,
  deleteCarService,
  getAllEnquiriesService,
  getAllReviewsService,
  deleteReviewService,
  approveReviewService,
  getAllSubscriptionsService,
} from "./admin.service.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    const result = await adminLoginService({ email, password });
    return res.json(result);
  } catch (error) {
    if (error.message === "INVALID_CREDENTIALS") {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (error.message === "ACCOUNT_INACTIVE") {
      return res.status(403).json({ message: "Account is inactive" });
    }
    return res.status(500).json({ message: "Failed to login" });
  }
};

export const getDashboardStats = async (_req, res) => {
  try {
    const stats = await getDashboardStatsService();
    return res.json({ success: true, stats });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dashboard stats" });
  }
};

export const getAllDealers = async (req, res) => {
  try {
    const result = await getAllDealersService(req.query);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch dealers" });
  }
};

export const verifyDealer = async (req, res) => {
  try {
    const dealerProfileId = Number(req.params.id);
    if (isNaN(dealerProfileId)) {
      return res.status(400).json({ message: "Invalid dealer profile ID" });
    }
    const { isVerified } = req.body;
    if (typeof isVerified !== "boolean") {
      return res.status(400).json({ message: "isVerified must be a boolean" });
    }
    const result = await verifyDealerService(dealerProfileId, isVerified);
    return res.json({ success: true, dealer: result });
  } catch (error) {
    if (error.message === "DEALER_NOT_FOUND") {
      return res.status(404).json({ message: "Dealer not found" });
    }
    return res
      .status(500)
      .json({ message: "Failed to update dealer verification" });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const result = await getAllCustomersService(req.query);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch customers" });
  }
};

export const activateUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    const result = await toggleUserActiveService(userId, true);
    return res.json({ success: true, user: result });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to activate user" });
  }
};

export const deactivateUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    const result = await toggleUserActiveService(userId, false);
    return res.json({ success: true, user: result });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to deactivate user" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = Number(req.params.userId);
    if (isNaN(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    const result = await deleteUserService(userId);
    return res.json({ success: true, deleted: result });
  } catch (error) {
    if (error.message === "USER_NOT_FOUND") {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(500).json({ message: "Failed to delete user" });
  }
};

export const getAllCars = async (req, res) => {
  try {
    const result = await getAllCarsAdminService(req.query);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch cars" });
  }
};

export const updateCarStatus = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    if (isNaN(carId))
      return res.status(400).json({ message: "Invalid car ID" });
    const { status } = req.body;
    const validStatuses = ["draft", "active", "sold", "reserved", "inactive"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    const result = await updateCarStatusService(carId, status);
    return res.json({ success: true, car: result });
  } catch (error) {
    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({ message: "Car not found" });
    }
    return res.status(500).json({ message: "Failed to update car status" });
  }
};

export const toggleCarFeatured = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    if (isNaN(carId))
      return res.status(400).json({ message: "Invalid car ID" });
    const { isFeatured } = req.body;
    if (typeof isFeatured !== "boolean") {
      return res.status(400).json({ message: "isFeatured must be a boolean" });
    }
    const result = await toggleCarFeaturedService(carId, isFeatured);
    return res.json({ success: true, car: result });
  } catch (error) {
    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({ message: "Car not found" });
    }
    return res
      .status(500)
      .json({ message: "Failed to update car featured status" });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const carId = Number(req.params.carId);
    if (isNaN(carId))
      return res.status(400).json({ message: "Invalid car ID" });
    const result = await deleteCarService(carId);
    return res.json({ success: true, deleted: result });
  } catch (error) {
    if (error.message === "CAR_NOT_FOUND") {
      return res.status(404).json({ message: "Car not found" });
    }
    return res.status(500).json({ message: "Failed to delete car" });
  }
};

export const getAllEnquiries = async (req, res) => {
  try {
    const result = await getAllEnquiriesService(req.query);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch enquiries" });
  }
};

export const getAllReviews = async (req, res) => {
  try {
    const result = await getAllReviewsService(req.query);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch reviews" });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    if (isNaN(reviewId))
      return res.status(400).json({ message: "Invalid review ID" });
    const result = await deleteReviewService(reviewId);
    return res.json({ success: true, deleted: result });
  } catch (error) {
    if (error.message === "REVIEW_NOT_FOUND") {
      return res.status(404).json({ message: "Review not found" });
    }
    return res.status(500).json({ message: "Failed to delete review" });
  }
};

export const approveReview = async (req, res) => {
  try {
    const reviewId = Number(req.params.reviewId);
    if (isNaN(reviewId))
      return res.status(400).json({ message: "Invalid review ID" });

    const { isApproved } = req.body;
    if (typeof isApproved !== "boolean") {
      return res.status(400).json({ message: "isApproved must be a boolean" });
    }

    const result = await approveReviewService(reviewId, isApproved);
    return res.json({ success: true, review: result });
  } catch (error) {
    if (error.message === "REVIEW_NOT_FOUND") {
      return res.status(404).json({ message: "Review not found" });
    }
    return res
      .status(500)
      .json({ message: "Failed to update review approval" });
  }
};

export const getAllSubscriptions = async (req, res) => {
  try {
    const result = await getAllSubscriptionsService(req.query);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};
