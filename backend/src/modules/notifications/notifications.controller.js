import { AppError } from "../../utils/AppError.js";
import {
  getMyNotificationsService,
  markAllReadService,
  markReadService,
  markUnreadService,
} from "./notifications.service.js";

export const getMyNotifications = async (req, res) => {
  const result = await getMyNotificationsService(req.user.userId);
  return res.json({ success: true, ...result });
};

export const markRead = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, "Invalid ID");
  }
  await markReadService(id, req.user.userId);
  return res.json({ success: true });
};

export const markUnread = async (req, res) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    throw new AppError(400, "Invalid ID");
  }
  await markUnreadService(id, req.user.userId);
  return res.json({ success: true });
};

export const markAllRead = async (req, res) => {
  await markAllReadService(req.user.userId);
  return res.json({ success: true });
};
