import { AppError } from "../../utils/AppError.js";
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
  const { email, name } = req.body;
  if (!email) {
    throw new AppError(400, "Email is required.");
  }
  const result = await subscribeService({ email, name });
  return res.json({ success: true, ...result });
};

// These two handlers respond with browser redirects, so they keep their
// own try/catch — the centralized JSON error handler is not appropriate here.
export const confirm = async (req, res) => {
  try {
    const { token } = req.params;
    const sub = await confirmService(token);
    if (!sub) {
      return res.redirect(`${APP_URL}/newsletter/confirmed?status=invalid`);
    }
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=ok`);
  } catch (err) {
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=error`);
  }
};

export const unsubscribe = async (req, res) => {
  try {
    const { token } = req.params;
    await unsubscribeService(token);
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=unsubscribed`);
  } catch (err) {
    return res.redirect(`${APP_URL}/newsletter/confirmed?status=error`);
  }
};

export const adminConfirm = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, "Invalid ID");
  }
  const sub = await adminConfirmService(id);
  return res.json({ success: true, subscriber: sub });
};

export const deleteSubscriber = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, "Invalid ID");
  }
  await deleteSubscriberService(id);
  return res.json({ success: true });
};

export const getSubscribers = async (req, res) => {
  const subscribers = await getSubscribersService(req.query);
  return res.json({ success: true, subscribers });
};
