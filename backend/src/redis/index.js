import { createClient } from "redis";
import logger from "../config/logger.js";

const env = process.env.NODE_ENV || "development";
const redisUrl = process.env.REDIS_URL;

const createStub = () => ({
  get: async () => null,
  set: async () => "OK",
  del: async () => 0,
  exists: async () => 0,
  expire: async () => 0,
  keys: async () => [],
  isReady: false,
  isOpen: false,
  _isStub: true,
});

let redisClient;

if (!redisUrl) {
  logger.warn("Redis disabled — REDIS_URL not set, using in-process no-op stub", { env });
  redisClient = createStub();
} else {
  redisClient = createClient({ url: redisUrl });

  redisClient.on("error", (err) => {
    logger.error("Redis client error", { message: err.message });
  });

  redisClient.on("connect", () => {
    logger.info("Redis connected", { env });
  });

  await redisClient.connect();
}

export default redisClient;
