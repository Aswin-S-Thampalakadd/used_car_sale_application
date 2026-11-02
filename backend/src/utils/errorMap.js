export const ERROR_MAP = {
  // ── Auth ──────────────────────────────────────────────
  EMAIL_ALREADY_EXISTS: { statusCode: 409, message: "Email already exists" },
  PHONE_ALREADY_EXISTS: {
    statusCode: 409,
    message: "Phone number already exists",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    message: "Invalid email or password",
  },
  INVALID_FIREBASE_TOKEN: {
    statusCode: 401,
    message: "Invalid Google sign-in. Please try again.",
  },
  ACCOUNT_TYPE_MISMATCH: {
    statusCode: 403,
    message: "This email is registered with a different account type.",
  },
  DEALERSHIP_NAME_REQUIRED: {
    statusCode: 400,
    message:
      "To create a dealer account with Google, sign up and enter your dealership name.",
  },
  ACCOUNT_INACTIVE: { statusCode: 403, message: "Account is inactive" },
  REFRESH_TOKEN_REQUIRED: {
    statusCode: 401,
    message: "Invalid or expired refresh token",
  },
  INVALID_REFRESH_TOKEN: {
    statusCode: 401,
    message: "Invalid or expired refresh token",
  },
  USER_NOT_FOUND: { statusCode: 404, message: "User not found" },

  // ── Cars ──────────────────────────────────────────────
  CAR_NOT_FOUND: { statusCode: 404, message: "Car not found" },
  CAR_LIMIT_REACHED: { statusCode: 403, message: "CAR_LIMIT_REACHED" },
  CAR_NOT_AVAILABLE: {
    statusCode: 400,
    message: "Car is not available for enquiry",
  },
  INVALID_STATUS: { statusCode: 400, message: "Invalid status value" },

  // ── Dealers ──────────────────────────────────────────
  DEALER_NOT_FOUND: { statusCode: 404, message: "Dealer not found" },
  PROFILE_NOT_FOUND: {
    statusCode: 404,
    message: "Dealer profile not found",
  },
  DEALER_PROFILE_NOT_FOUND: {
    statusCode: 404,
    message: "Dealer profile not found",
  },

  // ── Enquiries ────────────────────────────────────────
  ENQUIRY_NOT_FOUND: { statusCode: 404, message: "Enquiry not found" },

  // ── Favourites ───────────────────────────────────────
  NOT_IN_FAVOURITES: { statusCode: 404, message: "Car not in favourites" },

  // ── Reviews ───────────────────────────────────────────
  INVALID_RATING: {
    statusCode: 400,
    message: "Rating must be between 1 and 5",
  },
  ALREADY_REVIEWED: {
    statusCode: 409,
    message: "You have already submitted a review",
  },
  REVIEW_NOT_FOUND: { statusCode: 404, message: "Review not found" },
  REPLY_EMPTY: { statusCode: 400, message: "Reply text cannot be empty" },

  // ── Car Images ────────────────────────────────────────
  IMAGE_NOT_FOUND: { statusCode: 404, message: "Image not found" },

  // ── Subscriptions ────────────────────────────────────
  INVALID_SIGNATURE: {
    statusCode: 400,
    message: "Payment verification failed. Invalid signature.",
  },
  SUBSCRIPTION_NOT_FOUND: {
    statusCode: 404,
    message: "Subscription not found",
  },

  // ── Notifications ──────────────────────────────────────
  NOT_FOUND: { statusCode: 404, message: "Not found" },

  // ── Newsletter ────────────────────────────────────────
  INVALID_EMAIL: { statusCode: 400, message: "Invalid email address." },
  ALREADY_SUBSCRIBED: {
    statusCode: 409,
    message: "This email is already subscribed.",
  },
  ALREADY_PENDING: {
    statusCode: 409,
    message: "Please check your inbox — a confirmation email was already sent.",
  },
};
