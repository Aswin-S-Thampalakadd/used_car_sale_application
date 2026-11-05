import { AppError } from "../utils/AppError.js";

const CUSTOMER_USER_TYPE_ID = 2;
const DEALER_USER_TYPE_ID   = 3;
const ADMIN_USER_TYPE_ID    = 1;
const OPERATOR_USER_TYPE_ID = 4;

export const authorizeDealer = (req, _res, next) => {
  if (req.user?.userTypeId !== DEALER_USER_TYPE_ID) {
    return next(new AppError(403, "Access denied. Dealers only."));
  }
  next();
};

export const authorizeCustomer = (req, _res, next) => {
  if (req.user?.userTypeId !== CUSTOMER_USER_TYPE_ID) {
    return next(new AppError(403, "Access denied. Customers only."));
  }
  next();
};

export const authorizeCustomerOrDealer = (req, _res, next) => {
  const id = req.user?.userTypeId;
  if (id !== CUSTOMER_USER_TYPE_ID && id !== DEALER_USER_TYPE_ID) {
    return next(new AppError(403, "Access denied."));
  }
  next();
};

export const authorizeAdmin = (req, _res, next) => {
  if (req.user?.userTypeId !== ADMIN_USER_TYPE_ID) {
    return next(new AppError(403, "Access denied. Admins only."));
  }
  next();
};

export const authorizeOperator = (req, _res, next) => {
  if (req.user?.userTypeId !== OPERATOR_USER_TYPE_ID) {
    return next(new AppError(403, "Access denied. Operators only."));
  }
  next();
};

export const authorizeDealerOrOperator = (req, _res, next) => {
  const id = req.user?.userTypeId;
  if (id !== DEALER_USER_TYPE_ID && id !== OPERATOR_USER_TYPE_ID) {
    return next(new AppError(403, "Access denied."));
  }
  next();
};
