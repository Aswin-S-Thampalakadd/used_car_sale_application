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

const pool = new Pool({
  connectionString: dbUrl,
  ssl: isProduction
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

export const db = drizzle(pool, {
  schema,
});
