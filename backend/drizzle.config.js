import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { resolve } from "path";

const env = process.env.NODE_ENV || "development";

config({ path: resolve(`.env.${env}`), override: false });
config({ path: resolve(".env"), override: false });

if (!process.env.DATABASE_URL) {
  throw new Error(
    `[drizzle] DATABASE_URL is not set for NODE_ENV="${env}". Check your .env.${env} file.`,
  );
}

export default defineConfig({
  schema: "./src/db/schemas",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
