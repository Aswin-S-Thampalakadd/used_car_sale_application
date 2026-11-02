import { jest } from "@jest/globals";
import { notFound, errorHandler } from "../../../src/middlewares/error.middleware.js";
import { AppError } from "../../../src/utils/AppError.js";

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockReq = (method = "GET", url = "/test") => ({ method, originalUrl: url });

describe("notFound", () => {
  it("calls next with a 404 AppError containing method and url", () => {
    const next = jest.fn();
    notFound(mockReq("GET", "/missing"), {}, next);
    const err = next.mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain("GET");
    expect(err.message).toContain("/missing");
  });
});

describe("errorHandler", () => {
  it("handles AppError with correct status and message", () => {
    const res = mockRes();
    errorHandler(new AppError(422, "Validation failed"), mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Validation failed" });
  });

  it("handles AppError with extra fields merged into response", () => {
    const res = mockRes();
    errorHandler(new AppError(403, "Limit hit", { planType: "free", limit: 5 }), mockReq(), res, jest.fn());
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Limit hit", planType: "free", limit: 5 });
  });

  it("handles known ERROR_MAP constant CAR_NOT_FOUND → 404", () => {
    const res = mockRes();
    errorHandler(new Error("CAR_NOT_FOUND"), mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json.mock.calls[0][0].message).toBe("Car not found");
  });

  it("passes extra props from service error through to response body", () => {
    const res = mockRes();
    const err = new Error("CAR_LIMIT_REACHED");
    err.planType = "elite";
    err.limit = 20;
    errorHandler(err, mockReq(), res, jest.fn());
    const body = res.json.mock.calls[0][0];
    expect(body.planType).toBe("elite");
    expect(body.limit).toBe(20);
  });

  it("handles TokenExpiredError → 401 Access token expired", () => {
    const res = mockRes();
    const err = Object.assign(new Error("jwt expired"), { name: "TokenExpiredError" });
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe("Access token expired");
  });

  it("handles JsonWebTokenError → 401 Invalid access token", () => {
    const res = mockRes();
    const err = Object.assign(new Error("invalid sig"), { name: "JsonWebTokenError" });
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json.mock.calls[0][0].message).toBe("Invalid access token");
  });

  it("handles MulterError LIMIT_FILE_SIZE → 400 File too large", () => {
    const res = mockRes();
    const err = Object.assign(new Error("too large"), { name: "MulterError", code: "LIMIT_FILE_SIZE" });
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe("File too large");
  });

  it("handles MulterError other code → 400 with err.message", () => {
    const res = mockRes();
    const err = Object.assign(new Error("Unexpected field"), { name: "MulterError", code: "LIMIT_UNEXPECTED_FILE" });
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe("Unexpected field");
  });

  it("handles entity.parse.failed → 400 Invalid JSON", () => {
    const res = mockRes();
    const err = Object.assign(new SyntaxError("bad json"), { type: "entity.parse.failed" });
    errorHandler(err, mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json.mock.calls[0][0].message).toBe("Invalid JSON in request body");
  });

  it("falls back to 500 Internal server error for unknown errors", () => {
    const res = mockRes();
    errorHandler(new Error("SOMETHING_RANDOM"), mockReq(), res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].message).toBe("Internal server error");
  });

  it("always sets success: false", () => {
    const res = mockRes();
    errorHandler(new Error("UNKNOWN"), mockReq(), res, jest.fn());
    expect(res.json.mock.calls[0][0].success).toBe(false);
  });
});
