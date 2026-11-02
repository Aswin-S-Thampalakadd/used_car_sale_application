import logger from "../config/logger.js";

const SKIP_PATHS = new Set(["/health"]);

export const httpLogger = (req, res, next) => {
  if (SKIP_PATHS.has(req.path)) {
    return next();
  }

  const startAt = process.hrtime.bigint();

  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - startAt) / 1e6;
    const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel]("http", {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      userId: req.user?.userId ?? null,
    });
  });

  next();
};
