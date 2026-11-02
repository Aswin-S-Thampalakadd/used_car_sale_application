import { AppError } from "../utils/AppError.js";
import { ERROR_MAP } from "../utils/errorMap.js";
import logger from "../config/logger.js";

export const notFound = (req, _res, next) => {
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler = (err, req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let extra = {};

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    extra = { ...err.extra };
  } else if (ERROR_MAP[err.message]) {
    statusCode = ERROR_MAP[err.message].statusCode;
    message = ERROR_MAP[err.message].message;

    for (const key of Object.keys(err)) {
      extra[key] = err[key];
    }
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Access token expired";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid access token";
  } else if (err.name === "MulterError") {
    statusCode = 400;
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File too large"
        : err.message || "File upload error";
  } else if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  const isOperational =
    err instanceof AppError || Boolean(ERROR_MAP[err.message]);

  if (statusCode >= 500 && !isOperational) {
    logger.error("Unhandled error", {
      message: err.message,
      stack: err.stack,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId ?? null,
    });
  } else if (statusCode >= 400) {
    logger.warn("Client error", {
      message,
      statusCode,
      method: req.method,
      url: req.originalUrl,
      userId: req.user?.userId ?? null,
    });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...extra,
  });
};
