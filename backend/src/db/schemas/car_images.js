import {
  bigint,
  boolean,
  integer,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { cars } from "./cars.js";

export const carImages = pgTable("car_images", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  carId: bigint("car_id", { mode: "number" })
    .notNull()
    .references(() => cars.id, {
      onDelete: "cascade",
    }),

  imageUrl: varchar("image_url", { length: 1000 }).notNull(),

  sortOrder: integer("sort_order").notNull().default(0),

  isPrimary: boolean("is_primary").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
