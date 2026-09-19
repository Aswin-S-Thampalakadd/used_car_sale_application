import { bigint, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { carFeatureMappings } from "./car_feature_mappings.js";

export const carFeatures = pgTable("car_features", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  name: varchar("name", { length: 100 }).notNull().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carFeaturesRelations = relations(carFeatures, ({ many }) => ({
  carFeatureMappings: many(carFeatureMappings),
}));
