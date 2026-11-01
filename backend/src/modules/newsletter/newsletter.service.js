import crypto from "crypto";
import { sendMail } from "../../config/mailer.js";
import {
  confirmSubscriber,
  createSubscriber,
  adminConfirmById,
  deleteSubscriberById,
  findByEmail,
  findByToken,
  getAllSubscribers,
  unsubscribeByToken,
} from "./newsletter.repository.js";

const APP_URL = process.env.APP_URL || "http://localhost:3000";
const API_URL = process.env.API_URL || "http://localhost:5000/api/v1";

const generateToken = () => crypto.randomBytes(32).toString("hex");

export const subscribeService = async ({ email, name }) => {
  if (!email || !email.includes("@")) throw new Error("INVALID_EMAIL");

  const existing = await findByEmail(email);

  if (existing) {
    if (existing.status === "active") throw new Error("ALREADY_SUBSCRIBED");
    if (existing.status === "pending") throw new Error("ALREADY_PENDING");
    if (existing.status === "unsubscribed") {
      // Re-subscribe: generate a fresh token, reset to pending
      const token = generateToken();
      await confirmSubscriber("__force__"); // no-op — we update directly below
      const { db } = await import("../../db/index.js");
      const { newsletterSubscribers } =
        await import("../../db/schemas/newsletter.js");
      const { eq } = await import("drizzle-orm");
      await db
        .update(newsletterSubscribers)
        .set({ status: "pending", token, confirmedAt: null })
        .where(eq(newsletterSubscribers.email, email.toLowerCase().trim()));
      await sendConfirmation(email, name || existing.name, token);
      return { message: "Check your inbox to confirm your subscription." };
    }
  }

  const token = generateToken();
  const sub = await createSubscriber({ email, name, token });
  await sendConfirmation(sub.email, sub.name, sub.token);
  return { message: "Check your inbox to confirm your subscription." };
};

const sendConfirmation = async (email, name, token) => {
  const confirmUrl = `${API_URL}/newsletter/confirm/${token}`;
  const displayName = name || "there";

  await sendMail({
    to: email,
    subject: "Confirm your VandiMart subscription",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <img src="${APP_URL}/logo.svg" alt="VandiMart" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#0f172a;font-size:22px;margin:0 0 12px;">Hi ${displayName} 👋</h2>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 24px;">
          Thanks for subscribing to <strong>VandiMart</strong>! Click the button below to confirm your email and start receiving the best used car deals in Kerala.
        </p>
        <a href="${confirmUrl}" style="display:inline-block;background:#1e40af;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;">
          Confirm Subscription
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
          If you didn't subscribe, you can safely ignore this email.<br/>
          This link expires in 48 hours.
        </p>
      </div>
    `,
  });
};

export const confirmService = async (token) => {
  const sub = await confirmSubscriber(token);
  if (!sub) return null; // expired or already confirmed

  await sendMail({
    to: sub.email,
    subject: "You're subscribed to VandiMart!",
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#fff;">
        <img src="${APP_URL}/logo.svg" alt="VandiMart" style="height:40px;margin-bottom:24px;" />
        <h2 style="color:#0f172a;font-size:22px;margin:0 0 12px;">You're confirmed! 🎉</h2>
        <p style="color:#4b5563;line-height:1.7;margin:0 0 24px;">
          Welcome to VandiMart updates. You'll receive the latest car deals, tips, and market insights right in your inbox.
        </p>
        <a href="${APP_URL}/used-cars" style="display:inline-block;background:#1e40af;color:#fff;padding:14px 28px;border-radius:10px;font-weight:700;text-decoration:none;font-size:15px;">
          Browse Cars Now
        </a>
        <p style="color:#94a3b8;font-size:12px;margin-top:32px;">
          <a href="${API_URL}/newsletter/unsubscribe/${sub.token}" style="color:#94a3b8;">Unsubscribe</a>
        </p>
      </div>
    `,
  });

  return sub;
};

export const unsubscribeService = async (token) => {
  return await unsubscribeByToken(token);
};

export const adminConfirmService = async (id) => {
  const subscriber = await adminConfirmById(id);
  if (!subscriber) throw new Error("NOT_FOUND");
  return subscriber;
};

export const deleteSubscriberService = async (id) => {
  const subscriber = await deleteSubscriberById(id);
  if (!subscriber) throw new Error("NOT_FOUND");
  return subscriber;
};

export const getSubscribersService = async (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, parseInt(query.limit) || 50);
  const status = query.status || undefined;
  return getAllSubscribers({ page, limit, status });
};
