import { jest } from "@jest/globals";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

jest.unstable_mockModule("../../../src/modules/auth/auth.repository.js", () => ({
  findUserByEmail: jest.fn(),
  findUserByPhone: jest.fn(),
  createUser: jest.fn(),
  createDealerProfile: jest.fn(),
  updateLastLogin: jest.fn(),
  createRefreshToken: jest.fn(),
  findRefreshToken: jest.fn(),
  revokeRefreshToken: jest.fn(),
  revokeAllUserRefreshTokens: jest.fn(),
  deactivateUser: jest.fn(),
  activateUser: jest.fn(),
  deleteUser: jest.fn(),
}));

const authRepo = await import("../../../src/modules/auth/auth.repository.js");
const {
  customerSignupService,
  customerLoginService,
  dealerSignupService,
  dealerLoginService,
  refreshAccessTokenService,
  logoutService,
  deactivateAccountService,
  activateAccountService,
  deleteAccountService,
} = await import("../../../src/modules/auth/auth.service.js");

beforeEach(() => {
  jest.clearAllMocks();
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.JWT_ACCESS_EXPIRES_IN = "15m";
  process.env.JWT_REFRESH_EXPIRES_IN = "30d";
});

const passwordHash = bcrypt.hashSync("password123", 12);
const mockUser = {
  id: 1,
  name: "Alice",
  email: "alice@example.com",
  phone: "9000000001",
  passwordHash,
  userTypeId: 2,
  isActive: true,
  profileImage: null,
  emailVerified: false,
  phoneVerified: false,
  createdAt: new Date(),
};

describe("customerSignupService", () => {
  it("throws EMAIL_ALREADY_EXISTS when email taken", async () => {
    authRepo.findUserByEmail.mockResolvedValue(mockUser);
    await expect(customerSignupService({ name: "A", email: "alice@example.com", password: "p" })).rejects.toThrow("EMAIL_ALREADY_EXISTS");
  });

  it("throws PHONE_ALREADY_EXISTS when phone taken", async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    authRepo.findUserByPhone.mockResolvedValue(mockUser);
    await expect(customerSignupService({ name: "A", email: "new@example.com", phone: "9000000001", password: "p" })).rejects.toThrow("PHONE_ALREADY_EXISTS");
  });

  it("creates user and returns tokens", async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    authRepo.findUserByPhone.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue(mockUser);
    authRepo.createRefreshToken.mockResolvedValue({ id: 1 });
    const result = await customerSignupService({ name: "Alice", email: "alice@example.com", password: "password123" });
    expect(result.accessToken).toBeDefined();
    expect(result.refreshToken).toBeDefined();
    expect(result.message).toBe("Customer account created successfully");
  });

  it("normalizes email to lowercase", async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    authRepo.findUserByPhone.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue(mockUser);
    authRepo.createRefreshToken.mockResolvedValue({ id: 1 });
    await customerSignupService({ name: "Alice", email: "ALICE@EXAMPLE.COM", password: "pass" });
    expect(authRepo.findUserByEmail).toHaveBeenCalledWith("alice@example.com");
  });
});

describe("customerLoginService", () => {
  it("throws INVALID_CREDENTIALS when user not found", async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    await expect(customerLoginService({ email: "x@x.com", password: "p" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("throws ACCOUNT_INACTIVE", async () => {
    authRepo.findUserByEmail.mockResolvedValue({ ...mockUser, isActive: false });
    await expect(customerLoginService({ email: "alice@example.com", password: "p" })).rejects.toThrow("ACCOUNT_INACTIVE");
  });

  it("throws INVALID_CREDENTIALS when userTypeId is not customer", async () => {
    authRepo.findUserByEmail.mockResolvedValue({ ...mockUser, userTypeId: 3 });
    await expect(customerLoginService({ email: "alice@example.com", password: "p" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("throws INVALID_CREDENTIALS on wrong password", async () => {
    authRepo.findUserByEmail.mockResolvedValue(mockUser);
    await expect(customerLoginService({ email: "alice@example.com", password: "wrongpass" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("returns tokens and strips passwordHash from user", async () => {
    authRepo.findUserByEmail.mockResolvedValue(mockUser);
    authRepo.updateLastLogin.mockResolvedValue();
    authRepo.createRefreshToken.mockResolvedValue({ id: 1 });
    const result = await customerLoginService({ email: "alice@example.com", password: "password123" });
    expect(result.accessToken).toBeDefined();
    expect(result.user.passwordHash).toBeUndefined();
  });
});

describe("dealerSignupService", () => {
  it("throws EMAIL_ALREADY_EXISTS", async () => {
    authRepo.findUserByEmail.mockResolvedValue(mockUser);
    await expect(dealerSignupService({ name: "D", email: "d@d.com", password: "p", dealershipName: "DS" })).rejects.toThrow("EMAIL_ALREADY_EXISTS");
  });

  it("creates dealer and profile on success", async () => {
    authRepo.findUserByEmail.mockResolvedValue(null);
    authRepo.findUserByPhone.mockResolvedValue(null);
    authRepo.createUser.mockResolvedValue({ ...mockUser, userTypeId: 3 });
    authRepo.createDealerProfile.mockResolvedValue({ id: 10, userId: 1 });
    authRepo.createRefreshToken.mockResolvedValue({ id: 1 });
    const result = await dealerSignupService({ name: "D", email: "dealer@example.com", password: "pass", dealershipName: "My Motors" });
    expect(result.dealerProfile).toBeDefined();
    expect(result.accessToken).toBeDefined();
  });
});

describe("dealerLoginService", () => {
  it("throws INVALID_CREDENTIALS for non-dealer userTypeId", async () => {
    authRepo.findUserByEmail.mockResolvedValue(mockUser);
    await expect(dealerLoginService({ email: "alice@example.com", password: "password123" })).rejects.toThrow("INVALID_CREDENTIALS");
  });

  it("returns tokens on success", async () => {
    authRepo.findUserByEmail.mockResolvedValue({ ...mockUser, userTypeId: 3 });
    authRepo.updateLastLogin.mockResolvedValue();
    authRepo.createRefreshToken.mockResolvedValue({ id: 1 });
    const result = await dealerLoginService({ email: "dealer@example.com", password: "password123" });
    expect(result.accessToken).toBeDefined();
    expect(result.user.passwordHash).toBeUndefined();
  });
});

describe("refreshAccessTokenService", () => {
  it("throws REFRESH_TOKEN_REQUIRED when no token", async () => {
    await expect(refreshAccessTokenService(undefined)).rejects.toThrow("REFRESH_TOKEN_REQUIRED");
  });

  it("throws INVALID_REFRESH_TOKEN for bad token", async () => {
    await expect(refreshAccessTokenService("not.a.jwt")).rejects.toThrow("INVALID_REFRESH_TOKEN");
  });

  it("throws INVALID_REFRESH_TOKEN when token not in DB", async () => {
    const token = jwt.sign({ userId: 1, userTypeId: 2 }, "test-refresh-secret", { expiresIn: "1d" });
    authRepo.findRefreshToken.mockResolvedValue(null);
    await expect(refreshAccessTokenService(token)).rejects.toThrow("INVALID_REFRESH_TOKEN");
  });

  it("returns new accessToken on success", async () => {
    const token = jwt.sign({ userId: 1, userTypeId: 2 }, "test-refresh-secret", { expiresIn: "1d" });
    authRepo.findRefreshToken.mockResolvedValue({ id: 5 });
    const result = await refreshAccessTokenService(token);
    expect(result.accessToken).toBeDefined();
  });
});

describe("logoutService", () => {
  it("throws REFRESH_TOKEN_REQUIRED when no token", async () => {
    await expect(logoutService(undefined)).rejects.toThrow("REFRESH_TOKEN_REQUIRED");
  });

  it("revokes token when found in DB", async () => {
    authRepo.findRefreshToken.mockResolvedValue({ id: 5 });
    authRepo.revokeRefreshToken.mockResolvedValue();
    const token = jwt.sign({ userId: 1 }, "test-refresh-secret");
    const result = await logoutService(token);
    expect(authRepo.revokeRefreshToken).toHaveBeenCalledWith(5);
    expect(result.message).toBe("Logout successful");
  });

  it("succeeds silently when token not in DB", async () => {
    authRepo.findRefreshToken.mockResolvedValue(null);
    const token = jwt.sign({ userId: 1 }, "test-refresh-secret");
    const result = await logoutService(token);
    expect(result.message).toBe("Logout successful");
    expect(authRepo.revokeRefreshToken).not.toHaveBeenCalled();
  });
});

describe("deactivateAccountService", () => {
  it("throws USER_NOT_FOUND", async () => {
    authRepo.deactivateUser.mockResolvedValue(null);
    await expect(deactivateAccountService(99)).rejects.toThrow("USER_NOT_FOUND");
  });

  it("revokes tokens and returns message", async () => {
    authRepo.deactivateUser.mockResolvedValue({ id: 1, isActive: false });
    authRepo.revokeAllUserRefreshTokens.mockResolvedValue();
    const result = await deactivateAccountService(1);
    expect(authRepo.revokeAllUserRefreshTokens).toHaveBeenCalledWith(1);
    expect(result.message).toBe("Account deactivated successfully");
  });
});

describe("activateAccountService", () => {
  it("throws USER_NOT_FOUND", async () => {
    authRepo.activateUser.mockResolvedValue(null);
    await expect(activateAccountService(99)).rejects.toThrow("USER_NOT_FOUND");
  });

  it("returns message on success", async () => {
    authRepo.activateUser.mockResolvedValue({ id: 1, isActive: true });
    expect((await activateAccountService(1)).message).toBe("Account activated successfully");
  });
});

describe("deleteAccountService", () => {
  it("throws USER_NOT_FOUND", async () => {
    authRepo.deleteUser.mockResolvedValue(null);
    await expect(deleteAccountService(99)).rejects.toThrow("USER_NOT_FOUND");
  });

  it("returns message on success", async () => {
    authRepo.deleteUser.mockResolvedValue({ id: 1 });
    expect((await deleteAccountService(1)).message).toBe("Account deleted successfully");
  });
});
