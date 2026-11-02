import "../config/env.js";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import logger from "../config/logger.js";

import * as schema from "./schemas/index.js";

const { Pool } = pg;

const env = process.env.NODE_ENV || "development";
const isProduction = env === "production";

if (!process.env.DATABASE_URL) {
  throw new Error(
    `DATABASE_URL is not set for NODE_ENV="${env}". Check your .env.${env} file.`,
  );
}

const POOL_MAX = parseInt(process.env.DB_POOL_MAX || "20", 10);
const POOL_MIN = parseInt(process.env.DB_POOL_MIN || "2", 10);

const dbUrl = "postgres://postgres:444444@localhost:5432/wheelzloop";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: POOL_MAX,
  min: POOL_MIN,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10_000,
});

pool.on("connect", () => {
  logger.info("Database connected", { env });
});

pool.on("error", (err) => {
  logger.error("Unexpected DB pool error", { message: err.message });
});

export const db = drizzle(pool, { schema });
