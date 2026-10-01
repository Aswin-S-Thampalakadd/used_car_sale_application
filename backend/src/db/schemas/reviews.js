import {
  bigint,
  integer,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { users } from "./users.js";
import { cars } from "./cars.js";

export const reviews = pgTable(
  "reviews",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),

    carId: bigint("car_id", { mode: "number" })
      .notNull()
      .references(() => cars.id, { onDelete: "cascade" }),

    customerId: bigint("customer_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // 1–5 star rating
    rating: integer("rating").notNull(),

    comment: text("comment"),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // one review per customer per car
    unique("uq_reviews_car_customer").on(table.carId, table.customerId),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),

  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
}));
