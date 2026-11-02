/**
 * Jest setup file — runs before every test suite.
 * Forces NODE_ENV=test and loads .env.test so all process.env reads
 * inside modules and mocks reflect the test configuration.
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../../");

// Set NODE_ENV before loading env files so any conditional env logic
// (db SSL, redis stub, etc.) branches correctly during tests.
process.env.NODE_ENV = "test";
process.env.LOG_LEVEL = "silent";

config({ path: resolve(root, ".env.test"), override: true });
config({ path: resolve(root, ".env"), override: false });
