import { bigint, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { users } from "./users.js";
import { cars } from "./cars.js";

export const enquiryStatusEnum = pgEnum("enquiry_status", [
  "new",
  "contacted",
  "closed",
]);

export const enquiries = pgTable("enquiries", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  carId: bigint("car_id", { mode: "number" })
    .notNull()
    .references(() => cars.id),

  customerId: bigint("customer_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  dealerId: bigint("dealer_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  message: text("message"),

  status: enquiryStatusEnum("status").notNull().default("new"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const enquiriesRelations = relations(enquiries, ({ one }) => ({
  car: one(cars, {
    fields: [enquiries.carId],
    references: [cars.id],
  }),

  customer: one(users, {
    fields: [enquiries.customerId],
    references: [users.id],
    relationName: "enquiry_customer",
  }),

  dealer: one(users, {
    fields: [enquiries.dealerId],
    references: [users.id],
    relationName: "enquiry_dealer",
  }),
}));
