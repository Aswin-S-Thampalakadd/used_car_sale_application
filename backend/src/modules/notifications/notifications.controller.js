import {
  getMyNotificationsService,
  markAllReadService,
  markReadService,
  markUnreadService,
} from "./notifications.service.js";

/** GET /notifications/me */
export const getMyNotifications = async (req, res) => {
  try {
    const result = await getMyNotificationsService(req.user.userId);
    return res.json({ success: true, ...result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed to fetch notifications" });
  }
};

/** PATCH /notifications/:id/read */
export const markRead = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await markReadService(id, req.user.userId);
    return res.json({ success: true });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Not found" });
    return res.status(500).json({ message: "Failed" });
  }
};

/** PATCH /notifications/:id/unread */
export const markUnread = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    await markUnreadService(id, req.user.userId);
    return res.json({ success: true });
  } catch (err) {
    if (err.message === "NOT_FOUND") return res.status(404).json({ message: "Not found" });
    return res.status(500).json({ message: "Failed" });
  }
};

/** PATCH /notifications/read-all */
export const markAllRead = async (req, res) => {
  try {
    await markAllReadService(req.user.userId);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Failed" });
  }
};
