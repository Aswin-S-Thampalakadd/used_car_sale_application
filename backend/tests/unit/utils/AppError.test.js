import { AppError } from "../../../src/utils/AppError.js";

describe("AppError", () => {
  it("sets statusCode, message and isOperational", () => {
    const err = new AppError(404, "Not found");
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Not found");
    expect(err.isOperational).toBe(true);
  });

  it("status is 'fail' for 4xx", () => {
    expect(new AppError(400, "bad").status).toBe("fail");
    expect(new AppError(422, "bad").status).toBe("fail");
    expect(new AppError(404, "bad").status).toBe("fail");
  });

  it("status is 'error' for 5xx", () => {
    expect(new AppError(500, "server error").status).toBe("error");
    expect(new AppError(503, "server error").status).toBe("error");
  });

  it("stores extra fields", () => {
    const err = new AppError(403, "limit", { planType: "free", limit: 5 });
    expect(err.extra).toEqual({ planType: "free", limit: 5 });
  });

  it("defaults extra to empty object", () => {
    expect(new AppError(400, "bad").extra).toEqual({});
  });

  it("is an instance of Error", () => {
    expect(new AppError(400, "bad")).toBeInstanceOf(Error);
  });

  it("has a stack trace", () => {
    expect(new AppError(400, "bad").stack).toBeDefined();
  });
});
