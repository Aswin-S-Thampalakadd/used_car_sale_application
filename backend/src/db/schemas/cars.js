import {
  bigint,
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "electric",
  "hybrid",
  "cng",
  "lpg",
]);

export const transmissionEnum = pgEnum("transmission", [
  "manual",
  "automatic",
  "amt",
  "cvt",
  "dct",
]);

export const carConditionEnum = pgEnum("car_condition", [
  "excellent",
  "good",
  "fair",
]);

export const carStatusEnum = pgEnum("car_status", [
  "draft",
  "active",
  "sold",
  "reserved",
  "inactive",
]);

export const cars = pgTable("cars", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  dealerId: bigint("dealer_id", { mode: "number" })
    .notNull()
    .references(() => users.id),

  make: varchar("make", { length: 100 }).notNull(),

  model: varchar("model", { length: 100 }).notNull(),

  variant: varchar("variant", { length: 150 }),

  year: integer("year").notNull(),

  registrationYear: integer("registration_year"),

  fuelType: fuelTypeEnum("fuel_type").notNull(),

  transmission: transmissionEnum("transmission").notNull(),

  kilometersDriven: integer("kilometers_driven").notNull(),

  price: numeric("price", {
    precision: 12,
    scale: 2,
  }).notNull(),

  color: varchar("color", { length: 50 }),

  condition: carConditionEnum("condition"),

  description: text("description"),

  registrationNumber: varchar("registration_number", {
    length: 30,
  }),

  isNegotiable: boolean("is_negotiable").notNull().default(true),

  status: carStatusEnum("status").notNull().default("draft"),

  isFeatured: boolean("is_featured").notNull().default(false),

  viewsCount: integer("views_count").notNull().default(0),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
