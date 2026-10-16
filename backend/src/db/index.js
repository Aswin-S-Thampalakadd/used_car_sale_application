import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import dotenv from "dotenv";

import * as schema from "./schemas/index.js";

dotenv.config();

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";

const dbUrl = isProduction
  ? process.env.DATABASE_URL_PROD
  : process.env.DATABASE_URL_DEV;

console.log("dbUrl-----------", dbUrl);

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

pool.on("connect", () => {
  console.log("Database connection established");
});

pool.on("error", (error) => {
  console.error("Unexpected database connection error:", error.message);
});

pool
  .query("SELECT 1")
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((error) => {
    console.error("Database connection failed:", error.message);
  });

export const db = drizzle(pool, {
  schema,
});
