import {
  bigint,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { users } from "./users.js";
import { cars } from "./cars.js";
import { dealerProfiles } from "./dealers.js";

export const reviewTypeEnum = pgEnum("review_type", ["app", "dealer"]);

export const reviews = pgTable(
  "reviews",
  {
    id: bigint("id", { mode: "number" })
      .generatedAlwaysAsIdentity()
      .primaryKey(),

    // review_type = "app"    → review about the platform (carId = null, dealerId = null)
    // review_type = "dealer" → review about a specific dealer (dealerId required)
    reviewType: reviewTypeEnum("review_type").notNull().default("dealer"),

    // For car-level dealer reviews (existing behaviour, kept for backward compat)
    carId: bigint("car_id", { mode: "number" }).references(() => cars.id, {
      onDelete: "cascade",
    }),

    // Dealer being reviewed (filled for reviewType = "dealer")
    dealerId: bigint("dealer_id", { mode: "number" }).references(
      () => dealerProfiles.id,
      { onDelete: "cascade" }
    ),

    customerId: bigint("customer_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // 1–5 star rating
    rating: integer("rating").notNull(),

    comment: text("comment"),

    // Dealer reply
    replyText: text("reply_text"),
    replyAt: timestamp("reply_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // one car-review per customer per car (existing constraint)
    unique("uq_reviews_car_customer").on(table.carId, table.customerId),
  ]
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  car: one(cars, {
    fields: [reviews.carId],
    references: [cars.id],
  }),
  dealer: one(dealerProfiles, {
    fields: [reviews.dealerId],
    references: [dealerProfiles.id],
  }),
  customer: one(users, {
    fields: [reviews.customerId],
    references: [users.id],
  }),
}));
