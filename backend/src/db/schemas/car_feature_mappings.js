import { bigint, pgTable, primaryKey } from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

import { cars } from "./cars.js";
import { carFeatures } from "./car_features.js";

export const carFeatureMappings = pgTable(
  "car_feature_mappings",
  {
    carId: bigint("car_id", { mode: "number" })
      .notNull()
      .references(() => cars.id, {
        onDelete: "cascade",
      }),

    featureId: bigint("feature_id", { mode: "number" })
      .notNull()
      .references(() => carFeatures.id, {
        onDelete: "cascade",
      }),
  },

  (table) => [
    primaryKey({
      columns: [table.carId, table.featureId],
    }),
  ]
);

export const carFeatureMappingsRelations = relations(
  carFeatureMappings,
  ({ one }) => ({
    car: one(cars, {
      fields: [carFeatureMappings.carId],
      references: [cars.id],
    }),

    feature: one(carFeatures, {
      fields: [carFeatureMappings.featureId],
      references: [carFeatures.id],
    }),
  })
);
