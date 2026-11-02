import jwt from "jsonwebtoken";
import { AppError } from "../utils/AppError.js";

export const authenticate = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, "Authorization token is required");
    }

    const [type, token] = authHeader.split(" ");

    if (type !== "Bearer" || !token) {
      throw new AppError(401, "Invalid authorization format");
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }

    if (error.name === "TokenExpiredError") {
      return next(new AppError(401, "Access token expired"));
    }

    return next(new AppError(401, "Invalid access token"));
  }
};
