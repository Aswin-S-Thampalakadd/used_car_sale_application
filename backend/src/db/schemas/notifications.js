import { bigint, boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";

export const notificationTypeEnum = pgEnum("notification_type", [
  "enquiry",   // new customer enquiry
  "review",    // new car review
  "view",      // car view milestone (every 10 views)
  "call",      // dealer phone call (tracked via CarDetails click)
]);

export const notifications = pgTable("notifications", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  // dealer who receives this notification
  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  type: notificationTypeEnum("type").notNull(),

  title: text("title").notNull(),
  body:  text("body").notNull(),

  // optional link — e.g. /dashboard/edit-car/8
  link: text("link"),

  isRead: boolean("is_read").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));
