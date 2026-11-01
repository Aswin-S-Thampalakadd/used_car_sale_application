import {
  checkCarLimitService,
  createSubscriptionOrderService,
  getUserSubscriptionHistoryService,
  getUserSubscriptionService,
  PLAN_CONFIGS,
  verifyPaymentService,
} from "./subscriptions.service.js";

export const getMySubscription = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscription = await getUserSubscriptionService(userId);

    return res.status(200).json({
      success: true,
      subscription,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription",
    });
  }
};

export const getMySubscriptionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const subscriptions = await getUserSubscriptionHistoryService(userId);

    return res.status(200).json({
      success: true,
      subscriptions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch subscription history",
    });
  }
};

export const getAvailablePlans = async (req, res) => {
  try {
    const plans = Object.entries(PLAN_CONFIGS).map(([key, config]) => ({
      planType: key,
      carLimit: config.carLimit,
      price: config.price,
      durationDays: config.durationDays,
    }));

    return res.status(200).json({
      success: true,
      plans,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};

export const createSubscriptionOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { planType } = req.body;

    if (!planType || !["elite", "pro"].includes(planType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid plan type. Must be 'elite' or 'pro'.",
      });
    }

    const order = await createSubscriptionOrderService(userId, planType);

    return res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create order",
    });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details",
      });
    }

    const subscription = await verifyPaymentService(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    );

    return res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      subscription,
    });
  } catch (error) {
    if (error.message === "INVALID_SIGNATURE") {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    if (error.message === "SUBSCRIPTION_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
    });
  }
};

export const checkCarLimit = async (req, res) => {
  try {
    const userId = req.user.userId;
    const currentCarCount = Number(req.query.currentCarCount) || 0;

    const limitCheck = await checkCarLimitService(userId, currentCarCount);

    return res.status(200).json({
      success: true,
      ...limitCheck,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to check car limit",
    });
  }
};
