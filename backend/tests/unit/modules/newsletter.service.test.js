import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/newsletter/newsletter.repository.js", () => ({
  findByEmail: jest.fn(),
  findByToken: jest.fn(),
  createSubscriber: jest.fn(),
  confirmSubscriber: jest.fn(),
  unsubscribeByToken: jest.fn(),
  adminConfirmById: jest.fn(),
  deleteSubscriberById: jest.fn(),
  getAllSubscribers: jest.fn(),
}));

jest.unstable_mockModule("../../../src/config/mailer.js", () => ({
  sendMail: jest.fn(),
}));

const newsletterRepo = await import("../../../src/modules/newsletter/newsletter.repository.js");
const mailer = await import("../../../src/config/mailer.js");
const {
  subscribeService,
  confirmService,
  unsubscribeService,
  adminConfirmService,
  deleteSubscriberService,
  getSubscribersService,
} = await import("../../../src/modules/newsletter/newsletter.service.js");

beforeEach(() => jest.clearAllMocks());

const mockSub = { id: 1, email: "test@example.com", name: "Test", token: "abc123", status: "pending" };

describe("subscribeService", () => {
  it("throws INVALID_EMAIL for missing @", async () => {
    await expect(subscribeService({ email: "notanemail" })).rejects.toThrow("INVALID_EMAIL");
  });

  it("throws INVALID_EMAIL for empty email", async () => {
    await expect(subscribeService({ email: "" })).rejects.toThrow("INVALID_EMAIL");
  });

  it("throws ALREADY_SUBSCRIBED for active subscriber", async () => {
    newsletterRepo.findByEmail.mockResolvedValue({ ...mockSub, status: "active" });
    await expect(subscribeService({ email: "test@example.com" })).rejects.toThrow("ALREADY_SUBSCRIBED");
  });

  it("throws ALREADY_PENDING for pending subscriber", async () => {
    newsletterRepo.findByEmail.mockResolvedValue({ ...mockSub, status: "pending" });
    await expect(subscribeService({ email: "test@example.com" })).rejects.toThrow("ALREADY_PENDING");
  });

  it("creates subscriber and sends confirmation email for new email", async () => {
    newsletterRepo.findByEmail.mockResolvedValue(null);
    newsletterRepo.createSubscriber.mockResolvedValue(mockSub);
    mailer.sendMail.mockResolvedValue();
    const result = await subscribeService({ email: "new@example.com", name: "New" });
    expect(newsletterRepo.createSubscriber).toHaveBeenCalled();
    expect(mailer.sendMail).toHaveBeenCalled();
    expect(result.message).toMatch(/confirm/i);
  });
});

describe("confirmService", () => {
  it("returns null when token not found", async () => {
    newsletterRepo.confirmSubscriber.mockResolvedValue(null);
    mailer.sendMail.mockResolvedValue();
    expect(await confirmService("bad-token")).toBeNull();
  });

  it("sends welcome email and returns subscriber on success", async () => {
    newsletterRepo.confirmSubscriber.mockResolvedValue({ ...mockSub, status: "active" });
    mailer.sendMail.mockResolvedValue();
    const result = await confirmService("abc123");
    expect(mailer.sendMail).toHaveBeenCalled();
    expect(result.status).toBe("active");
  });
});

describe("unsubscribeService", () => {
  it("delegates to unsubscribeByToken", async () => {
    newsletterRepo.unsubscribeByToken.mockResolvedValue({ id: 1 });
    expect((await unsubscribeService("abc123")).id).toBe(1);
  });
});

describe("adminConfirmService", () => {
  it("throws NOT_FOUND when subscriber missing", async () => {
    newsletterRepo.adminConfirmById.mockResolvedValue(null);
    await expect(adminConfirmService(99)).rejects.toThrow("NOT_FOUND");
  });

  it("returns subscriber on success", async () => {
    newsletterRepo.adminConfirmById.mockResolvedValue(mockSub);
    expect((await adminConfirmService(1)).email).toBe("test@example.com");
  });
});

describe("deleteSubscriberService", () => {
  it("throws NOT_FOUND when subscriber missing", async () => {
    newsletterRepo.deleteSubscriberById.mockResolvedValue(null);
    await expect(deleteSubscriberService(99)).rejects.toThrow("NOT_FOUND");
  });

  it("returns deleted subscriber on success", async () => {
    newsletterRepo.deleteSubscriberById.mockResolvedValue({ id: 1 });
    expect((await deleteSubscriberService(1)).id).toBe(1);
  });
});

describe("getSubscribersService", () => {
  it("delegates with default pagination", async () => {
    newsletterRepo.getAllSubscribers.mockResolvedValue([mockSub]);
    const result = await getSubscribersService({});
    expect(result).toHaveLength(1);
    expect(newsletterRepo.getAllSubscribers).toHaveBeenCalledWith(expect.objectContaining({ page: 1, limit: 50 }));
  });

  it("clamps limit to 100", async () => {
    newsletterRepo.getAllSubscribers.mockResolvedValue([]);
    await getSubscribersService({ limit: "999" });
    expect(newsletterRepo.getAllSubscribers).toHaveBeenCalledWith(expect.objectContaining({ limit: 100 }));
  });
});
