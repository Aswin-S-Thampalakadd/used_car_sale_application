import { bigint, timestamp, varchar } from "drizzle-orm/pg-core";

import { pgTable } from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { relations } from "drizzle-orm";

export const refreshTokens = pgTable("refresh_tokens", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  userId: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),

  tokenHash: varchar("token_hash", {
    length: 255,
  })
    .notNull()
    .unique(),

  expiresAt: timestamp("expires_at").notNull(),

  revokedAt: timestamp("revoked_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const refreshTokensRelations = relations(refreshTokens, ({ one }) => ({
  user: one(users, {
    fields: [refreshTokens.userId],
    references: [users.id],
  }),
}));
