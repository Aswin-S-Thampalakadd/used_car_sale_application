import { jest } from "@jest/globals";
import request from "supertest";

jest.unstable_mockModule("razorpay", () => ({
  default: jest.fn().mockImplementation(() => ({ orders: { create: jest.fn() } })),
}));

jest.unstable_mockModule("../../src/modules/auth/auth.service.js", () => ({
  customerSignupService: jest.fn(),
  customerLoginService: jest.fn(),
  dealerSignupService: jest.fn(),
  dealerLoginService: jest.fn(),
  customerGoogleSignInService: jest.fn(),
  dealerGoogleSignInService: jest.fn(),
  refreshAccessTokenService: jest.fn(),
  logoutService: jest.fn(),
  deactivateAccountService: jest.fn(),
  activateAccountService: jest.fn(),
  deleteAccountService: jest.fn(),
}));

jest.unstable_mockModule("../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

jest.unstable_mockModule("../../src/redis/index.js", () => ({
  default: { get: jest.fn().mockResolvedValue(null), set: jest.fn().mockResolvedValue("OK") },
}));

const authService = await import("../../src/modules/auth/auth.service.js");
const { buildApp } = await import("../integration/helpers/app.js");

const app = buildApp();

beforeEach(() => jest.clearAllMocks());

describe("POST /api/v1/auth/customer/signup", () => {
  it("201 on success", async () => {
    authService.customerSignupService.mockResolvedValue({
      message: "Customer account created successfully",
      user: { id: 1, name: "Alice" },
      accessToken: "at",
      refreshToken: "rt",
    });
    const res = await request(app).post("/api/v1/auth/customer/signup").send({ name: "Alice", email: "a@a.com", password: "pass" });
    expect(res.status).toBe(201);
    expect(res.body.accessToken).toBe("at");
  });

  it("400 when required fields missing", async () => {
    const res = await request(app).post("/api/v1/auth/customer/signup").send({ email: "a@a.com" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("409 when service throws EMAIL_ALREADY_EXISTS", async () => {
    authService.customerSignupService.mockRejectedValue(new Error("EMAIL_ALREADY_EXISTS"));
    const res = await request(app).post("/api/v1/auth/customer/signup").send({ name: "A", email: "a@a.com", password: "p" });
    expect(res.status).toBe(409);
    expect(res.body.message).toBe("Email already exists");
  });

  it("409 when service throws PHONE_ALREADY_EXISTS", async () => {
    authService.customerSignupService.mockRejectedValue(new Error("PHONE_ALREADY_EXISTS"));
    const res = await request(app).post("/api/v1/auth/customer/signup").send({ name: "A", email: "a@a.com", password: "p" });
    expect(res.status).toBe(409);
  });
});

describe("POST /api/v1/auth/customer/login", () => {
  it("200 on success", async () => {
    authService.customerLoginService.mockResolvedValue({ message: "Login successful", user: { id: 1 }, accessToken: "at", refreshToken: "rt" });
    const res = await request(app).post("/api/v1/auth/customer/login").send({ email: "a@a.com", password: "pass" });
    expect(res.status).toBe(200);
  });

  it("400 when fields missing", async () => {
    const res = await request(app).post("/api/v1/auth/customer/login").send({ email: "a@a.com" });
    expect(res.status).toBe(400);
  });

  it("401 on INVALID_CREDENTIALS", async () => {
    authService.customerLoginService.mockRejectedValue(new Error("INVALID_CREDENTIALS"));
    const res = await request(app).post("/api/v1/auth/customer/login").send({ email: "a@a.com", password: "wrong" });
    expect(res.status).toBe(401);
  });

  it("403 on ACCOUNT_INACTIVE", async () => {
    authService.customerLoginService.mockRejectedValue(new Error("ACCOUNT_INACTIVE"));
    const res = await request(app).post("/api/v1/auth/customer/login").send({ email: "a@a.com", password: "pass" });
    expect(res.status).toBe(403);
  });
});

describe("POST /api/v1/auth/dealer/signup", () => {
  it("201 on success", async () => {
    authService.dealerSignupService.mockResolvedValue({ message: "Dealer account created successfully", user: { id: 2 }, dealerProfile: {}, accessToken: "at", refreshToken: "rt" });
    const res = await request(app).post("/api/v1/auth/dealer/signup").send({ name: "D", email: "d@d.com", password: "pass", dealershipName: "Cars" });
    expect(res.status).toBe(201);
  });

  it("400 when required fields missing", async () => {
    const res = await request(app).post("/api/v1/auth/dealer/signup").send({ name: "D", email: "d@d.com" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/dealer/login", () => {
  it("200 on success", async () => {
    authService.dealerLoginService.mockResolvedValue({ message: "Dealer login successful", user: { id: 2 }, accessToken: "at", refreshToken: "rt" });
    const res = await request(app).post("/api/v1/auth/dealer/login").send({ email: "d@d.com", password: "pass" });
    expect(res.status).toBe(200);
  });
});

describe("POST /api/v1/auth/{customer,dealer}/google", () => {
  it("authenticates a customer with a Firebase ID token", async () => {
    authService.customerGoogleSignInService.mockResolvedValue({
      message: "Google sign-in successful",
      user: { id: 1 },
      accessToken: "at",
      refreshToken: "rt",
    });

    const res = await request(app)
      .post("/api/v1/auth/customer/google")
      .send({ idToken: "firebase-id-token" });

    expect(res.status).toBe(200);
    expect(authService.customerGoogleSignInService).toHaveBeenCalledWith({
      idToken: "firebase-id-token",
    });
  });

  it("passes the dealership name when authenticating a dealer", async () => {
    authService.dealerGoogleSignInService.mockResolvedValue({
      message: "Google sign-in successful",
      user: { id: 2 },
      accessToken: "at",
      refreshToken: "rt",
    });

    const res = await request(app)
      .post("/api/v1/auth/dealer/google")
      .send({ idToken: "firebase-id-token", dealershipName: "Example Motors" });

    expect(res.status).toBe(200);
    expect(authService.dealerGoogleSignInService).toHaveBeenCalledWith({
      idToken: "firebase-id-token",
      dealershipName: "Example Motors",
    });
  });

  it("requires a Firebase ID token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/customer/google")
      .send({});

    expect(res.status).toBe(400);
  });
});

describe("POST /api/v1/auth/refresh", () => {
  it("200 and returns new accessToken", async () => {
    authService.refreshAccessTokenService.mockResolvedValue({ accessToken: "new-at" });
    const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: "rt" });
    expect(res.status).toBe(200);
    expect(res.body.accessToken).toBe("new-at");
  });

  it("401 on INVALID_REFRESH_TOKEN", async () => {
    authService.refreshAccessTokenService.mockRejectedValue(new Error("INVALID_REFRESH_TOKEN"));
    const res = await request(app).post("/api/v1/auth/refresh").send({ refreshToken: "bad" });
    expect(res.status).toBe(401);
  });
});

describe("POST /api/v1/auth/logout", () => {
  it("200 on success", async () => {
    authService.logoutService.mockResolvedValue({ message: "Logout successful" });
    const res = await request(app).post("/api/v1/auth/logout").send({ refreshToken: "rt" });
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logout successful");
  });
});

describe("Protected auth routes — require valid JWT", () => {
  it("PATCH /account/deactivate → 401 without token", async () => {
    const res = await request(app).patch("/api/v1/auth/account/deactivate");
    expect(res.status).toBe(401);
  });

  it("PATCH /account/activate → 401 without token", async () => {
    const res = await request(app).patch("/api/v1/auth/account/activate");
    expect(res.status).toBe(401);
  });

  it("DELETE /account → 401 without token", async () => {
    const res = await request(app).delete("/api/v1/auth/account");
    expect(res.status).toBe(401);
  });
});
