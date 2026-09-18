import { bigint, pgTable, timestamp, primaryKey } from "drizzle-orm/pg-core";

import { users } from "./users.js";
import { cars } from "./cars.js";

export const favourites = pgTable(
  "favourites",
  {
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
      }),

    carId: bigint("car_id", { mode: "number" })
      .notNull()
      .references(() => cars.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    primaryKey({
      columns: [table.userId, table.carId],
    }),
  ]
);
