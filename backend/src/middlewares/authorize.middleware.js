const CUSTOMER_USER_TYPE_ID = 2;
const DEALER_USER_TYPE_ID = 3;
const ADMIN_USER_TYPE_ID = 1;

export const authorizeDealer = (req, res, next) => {
  if (req.user?.userTypeId !== DEALER_USER_TYPE_ID) {
    return res.status(403).json({ message: "Access denied. Dealers only." });
  }
  next();
};

export const authorizeCustomer = (req, res, next) => {
  if (req.user?.userTypeId !== CUSTOMER_USER_TYPE_ID) {
    return res.status(403).json({ message: "Access denied. Customers only." });
  }
  next();
};

export const authorizeCustomerOrDealer = (req, res, next) => {
  const id = req.user?.userTypeId;
  if (id !== CUSTOMER_USER_TYPE_ID && id !== DEALER_USER_TYPE_ID) {
    return res.status(403).json({ message: "Access denied." });
  }
  next();
};

export const authorizeAdmin = (req, res, next) => {
  if (req.user?.userTypeId !== ADMIN_USER_TYPE_ID) {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};
