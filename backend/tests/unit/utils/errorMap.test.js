import { ERROR_MAP } from "../../../src/utils/errorMap.js";

describe("ERROR_MAP", () => {
  const allCodes = [
    ["EMAIL_ALREADY_EXISTS", 409, "Email already exists"],
    ["PHONE_ALREADY_EXISTS", 409, "Phone number already exists"],
    ["INVALID_CREDENTIALS", 401, "Invalid email or password"],
    ["ACCOUNT_INACTIVE", 403, "Account is inactive"],
    ["REFRESH_TOKEN_REQUIRED", 401, "Invalid or expired refresh token"],
    ["INVALID_REFRESH_TOKEN", 401, "Invalid or expired refresh token"],
    ["USER_NOT_FOUND", 404, "User not found"],
    ["CAR_NOT_FOUND", 404, "Car not found"],
    ["CAR_LIMIT_REACHED", 403, "CAR_LIMIT_REACHED"],
    ["CAR_NOT_AVAILABLE", 400, "Car is not available for enquiry"],
    ["INVALID_STATUS", 400, "Invalid status value"],
    ["DEALER_NOT_FOUND", 404, "Dealer not found"],
    ["PROFILE_NOT_FOUND", 404, "Dealer profile not found"],
    ["DEALER_PROFILE_NOT_FOUND", 404, "Dealer profile not found"],
    ["ENQUIRY_NOT_FOUND", 404, "Enquiry not found"],
    ["NOT_IN_FAVOURITES", 404, "Car not in favourites"],
    ["INVALID_RATING", 400, "Rating must be between 1 and 5"],
    ["ALREADY_REVIEWED", 409, "You have already submitted a review"],
    ["REVIEW_NOT_FOUND", 404, "Review not found"],
    ["REPLY_EMPTY", 400, "Reply text cannot be empty"],
    ["IMAGE_NOT_FOUND", 404, "Image not found"],
    ["INVALID_SIGNATURE", 400, "Payment verification failed. Invalid signature."],
    ["SUBSCRIPTION_NOT_FOUND", 404, "Subscription not found"],
    ["NOT_FOUND", 404, "Not found"],
    ["INVALID_EMAIL", 400, "Invalid email address."],
    ["ALREADY_SUBSCRIBED", 409, "This email is already subscribed."],
    ["ALREADY_PENDING", 409, "Please check your inbox — a confirmation email was already sent."],
  ];

  test.each(allCodes)("%s → %i", (code, status, message) => {
    expect(ERROR_MAP[code]).toBeDefined();
    expect(ERROR_MAP[code].statusCode).toBe(status);
    expect(ERROR_MAP[code].message).toBe(message);
  });
});
