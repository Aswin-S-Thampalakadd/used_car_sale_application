import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../");

const env = process.env.NODE_ENV || "development";

config({ path: resolve(root, `.env.${env}`), override: false });

config({ path: resolve(root, ".env"), override: false });

const REQUIRED = {
  development: ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"],
  test: ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"],
  production: [
    "DATABASE_URL",
    "JWT_ACCESS_SECRET",
    "JWT_REFRESH_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ],
};

const required = REQUIRED[env] ?? REQUIRED.development;
const missing = required.filter((k) => !process.env[k]);

if (missing.length > 0) {
  console.error(
    `[env] Missing required environment variables for NODE_ENV="${env}": ${missing.join(", ")}`,
  );
  if (env === "production") {
    process.exit(1);
  }
}
