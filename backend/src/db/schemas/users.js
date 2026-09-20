import {
  bigint,
  boolean,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { userTypes } from "./users_types.js";
import { relations } from "drizzle-orm";
import { refreshTokens } from "./refresh_tokens.js";

export const users = pgTable("users", {
  id: bigint("id", { mode: "number" }).generatedAlwaysAsIdentity().primaryKey(),

  name: varchar("name", { length: 100 }).notNull(),

  email: varchar("email", { length: 256 }).notNull().unique(),

  phone: varchar("phone", { length: 20 }).unique(),

  passwordHash: varchar("password_hash", { length: 255 }),

  profileImage: varchar("profile_image", { length: 500 }),

  userTypeId: bigint("user_type_id", { mode: "number" })
    .notNull()
    .references(() => userTypes.id),

  isActive: boolean("is_active").notNull().default(true),

  emailVerified: boolean("email_verified").notNull().default(false),

  phoneVerified: boolean("phone_verified").notNull().default(false),

  fcmToken: varchar("fcm_token", { length: 500 }),

  lastLoginAt: timestamp("last_login_at"),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  refreshTokens: many(refreshTokens),
}));
