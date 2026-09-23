import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { relations } from "drizzle-orm";

export const dealerProfiles = pgTable("dealers", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .unique()
    .references(() => users.id),

  dealershipName: varchar("dealership_name", { length: 200 }).notNull(),

  description: text("description"),

  logo: varchar("logo", { length: 500 }),

  address: text("address"),

  city: varchar("city", { length: 100 }),

  state: varchar("state", { length: 100 }),

  country: varchar("country", { length: 100 }),

  pincode: varchar("pincode", { length: 20 }),

  latitude: varchar("latitude", { length: 30 }),

  longitude: varchar("longitude", { length: 30 }),

  gstNumber: varchar("gst_number", { length: 50 }),

  isVerified: boolean("is_verified").notNull().default(false),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const dealerProfilesRelations = relations(
  dealerProfiles,
  ({ one, many }) => ({
    user: one(users, {
      fields: [dealerProfiles.userId],
      references: [users.id],
    }),
  })
);
