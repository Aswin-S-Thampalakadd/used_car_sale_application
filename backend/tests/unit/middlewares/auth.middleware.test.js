import { jest } from "@jest/globals";
import jwt from "jsonwebtoken";
import { authenticate } from "../../../src/middlewares/auth.middleware.js";
import { AppError } from "../../../src/utils/AppError.js";

beforeEach(() => {
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
});

const mockReq = (authHeader) => ({ headers: { authorization: authHeader } });

describe("authenticate", () => {
  it("calls next(AppError 401) when no authorization header", () => {
    const next = jest.fn();
    authenticate(mockReq(undefined), {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Authorization token is required");
  });

  it("calls next(AppError 401) for non-Bearer scheme", () => {
    const next = jest.fn();
    authenticate(mockReq("Basic abc123"), {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Invalid authorization format");
  });

  it("calls next(AppError 401) for Bearer with missing token", () => {
    const next = jest.fn();
    authenticate(mockReq("Bearer "), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(401);
  });

  it("calls next(AppError 401) for an expired token", () => {
    const next = jest.fn();
    const token = jwt.sign({ userId: 1, userTypeId: 2 }, "test-access-secret", { expiresIn: -1 });
    authenticate(mockReq(`Bearer ${token}`), {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Access token expired");
  });

  it("calls next(AppError 401) for a token signed with wrong secret", () => {
    const next = jest.fn();
    const token = jwt.sign({ userId: 1 }, "wrong-secret");
    authenticate(mockReq(`Bearer ${token}`), {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe("Invalid access token");
  });

  it("attaches decoded payload to req.user and calls next() with no args", () => {
    const next = jest.fn();
    const token = jwt.sign({ userId: 7, userTypeId: 3 }, "test-access-secret", { expiresIn: "15m" });
    const req = mockReq(`Bearer ${token}`);
    authenticate(req, {}, next);
    expect(next).toHaveBeenCalledWith();
    expect(req.user.userId).toBe(7);
    expect(req.user.userTypeId).toBe(3);
  });
});
