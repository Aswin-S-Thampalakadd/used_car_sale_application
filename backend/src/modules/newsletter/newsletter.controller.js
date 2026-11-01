import {
  adminConfirmService,
  confirmService,
  deleteSubscriberService,
  getSubscribersService,
  subscribeService,
  unsubscribeService,
} from "./newsletter.service.js";

const APP_URL = process.env.APP_URL || "http://localhost:3000";

export const subscribe = async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    const result = await subscribeService({ email, name });
    return res.json({ success: true, ...result });
  } catch (err) {
    if (err.message === "INVALID_EMAIL")
      return res.status(400).json({ message: "Invalid email address." });
    if (err.message === "ALREADY_SUBSCRIBED")
      return res
        .status(409)
        .json({ message: "This email is already subscribed." });
    if (err.message === "ALREADY_PENDING")
      return res.status(409).json({
        message:
          "Please check your inbox — a confirmation email was already sent.",
      });
    console.error(err);
    return res
      .status(500)
      .json({ message: "Failed to subscribe. Please try again." });
  }
};

export const confirm = async (req, res) => {
  try {
    const { token } = req.params;
    const sub = await confirmService(token);
    if (!sub) {
      return res.redirect(`${APP_URL}/newsletter/confirmed?status=invalid`);
    }
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=ok`);
  } catch (err) {
    console.error(err);
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=error`);
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;
    await unsubscribeService(token);
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=unsubscribed`);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to unsubscribe." });
  }
};

export const adminConfirm = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const sub = await adminConfirmService(id);
    return res.json({ success: true, subscriber: sub });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Subscriber not found" });
    console.error(err);
    return res.status(500).json({ message: "Failed to confirm subscriber" });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await deleteSubscriberService(id);
    return res.json({ success: true });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Subscriber not found" });
    console.error(err);
    return res.status(500).json({ message: "Failed to delete subscriber" });
  }
};

export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await getSubscribersService(req.query);
    return res.json({ success: true, subscribers });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch subscribers." });
  }
};
