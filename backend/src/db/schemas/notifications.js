import {
  bigint,
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";

export const notificationTypeEnum = pgEnum("notification_type", [
  "enquiry",
  "review",
  "view",
  "call",
]);

export const notifications = pgTable("notifications", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  type: notificationTypeEnum("type").notNull(),

  title: text("title").notNull(),
  body: text("body").notNull(),

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
