import winston from "winston";

const { combine, timestamp, errors, json, colorize, printf } = winston.format;

const env = process.env.NODE_ENV || "development";
const isTest = env === "test";
const level = process.env.LOG_LEVEL || (env === "production" ? "info" : "debug");

const devFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp, stack, ...meta }) => {
    const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} [${level}] ${stack || message}${metaStr}`;
  }),
);

const prodFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json(),
);

const transports = [new winston.transports.Console()];

if (env === "production") {
  transports.push(
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 20 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
    }),
  );
}

const logger = winston.createLogger({
  level: isTest ? "error" : level,
  format: env === "production" ? prodFormat : devFormat,
  transports,
  silent: isTest || level === "silent",
  exitOnError: false,
});

export default logger;
