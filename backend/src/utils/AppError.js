export class AppError extends Error {
  constructor(statusCode, message, extra = {}) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode >= 500 ? "error" : "fail";
    this.isOperational = true;

    this.extra = extra;

    Error.captureStackTrace?.(this, this.constructor);
  }
}
