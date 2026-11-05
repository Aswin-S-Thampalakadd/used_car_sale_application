import { bigint, pgTable, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { dealerProfiles } from "./dealers.js";

export const operatorProfiles = pgTable("operator_profiles", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),

  dealerId: bigint("dealer_id", { mode: "number" })
    .notNull()
    .references(() => dealerProfiles.id, { onDelete: "cascade" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const operatorProfilesRelations = relations(operatorProfiles, ({ one }) => ({
  user: one(users, {
    fields: [operatorProfiles.userId],
    references: [users.id],
  }),
  dealer: one(dealerProfiles, {
    fields: [operatorProfiles.dealerId],
    references: [dealerProfiles.id],
  }),
}));
