import { bigint, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const newsletterSubscribers = pgTable("newsletter_subscribers", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 200 }),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  token: varchar("token", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  confirmedAt: timestamp("confirmed_at"),
});
