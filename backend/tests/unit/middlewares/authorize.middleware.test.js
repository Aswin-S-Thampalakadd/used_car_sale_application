import { jest } from "@jest/globals";
import {
  authorizeAdmin,
  authorizeCustomer,
  authorizeCustomerOrDealer,
  authorizeDealer,
} from "../../../src/middlewares/authorize.middleware.js";
import { AppError } from "../../../src/utils/AppError.js";

const makeReq = (userTypeId) => ({ user: { userTypeId } });

describe("authorizeDealer", () => {
  it("calls next() for dealer (typeId 3)", () => {
    const next = jest.fn();
    authorizeDealer(makeReq(3), {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AppError 403) for customer", () => {
    const next = jest.fn();
    authorizeDealer(makeReq(2), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it("calls next(AppError 403) for admin", () => {
    const next = jest.fn();
    authorizeDealer(makeReq(1), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });
});

describe("authorizeCustomer", () => {
  it("calls next() for customer (typeId 2)", () => {
    const next = jest.fn();
    authorizeCustomer(makeReq(2), {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AppError 403) for dealer", () => {
    const next = jest.fn();
    authorizeCustomer(makeReq(3), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});

describe("authorizeCustomerOrDealer", () => {
  it("calls next() for customer", () => {
    const next = jest.fn();
    authorizeCustomerOrDealer(makeReq(2), {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next() for dealer", () => {
    const next = jest.fn();
    authorizeCustomerOrDealer(makeReq(3), {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AppError 403) for admin", () => {
    const next = jest.fn();
    authorizeCustomerOrDealer(makeReq(1), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });
});

describe("authorizeAdmin", () => {
  it("calls next() for admin (typeId 1)", () => {
    const next = jest.fn();
    authorizeAdmin(makeReq(1), {}, next);
    expect(next).toHaveBeenCalledWith();
  });

  it("calls next(AppError 403) for customer", () => {
    const next = jest.fn();
    authorizeAdmin(makeReq(2), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
    expect(next.mock.calls[0][0].statusCode).toBe(403);
  });

  it("calls next(AppError 403) for dealer", () => {
    const next = jest.fn();
    authorizeAdmin(makeReq(3), {}, next);
    expect(next.mock.calls[0][0]).toBeInstanceOf(AppError);
  });
});
