import { bigint, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const carFeatures = pgTable("car_features", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  name: varchar("name", { length: 100 }).notNull().unique(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
