import {
  bigint,
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { relations } from "drizzle-orm";

export const planTypeEnum = pgEnum("plan_type", ["free", "elite", "pro"]);

export const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "expired",
  "cancelled",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
]);

export const subscriptions = pgTable("subscriptions", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  planType: planTypeEnum("plan_type").notNull().default("free"),

  // Car listing limits per plan
  carLimit: integer("car_limit").notNull().default(5),

  // Price in INR
  price: numeric("price", {
    precision: 10,
    scale: 2,
  }).notNull().default("0"),

  // Subscription validity
  startDate: timestamp("start_date").notNull().defaultNow(),

  endDate: timestamp("end_date"),

  status: subscriptionStatusEnum("status").notNull().default("active"),

  // Razorpay details
  razorpayOrderId: varchar("razorpay_order_id", { length: 100 }),

  razorpayPaymentId: varchar("razorpay_payment_id", { length: 100 }),

  razorpaySignature: varchar("razorpay_signature", { length: 255 }),

  paymentStatus: paymentStatusEnum("payment_status")
    .notNull()
    .default("completed"),

  // Auto-renewal flag
  isAutoRenewal: boolean("is_auto_renewal").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
  user: one(users, {
    fields: [subscriptions.userId],
    references: [users.id],
  }),
}));
