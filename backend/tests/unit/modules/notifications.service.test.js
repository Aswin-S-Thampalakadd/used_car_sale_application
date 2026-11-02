import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/notifications/notifications.repository.js", () => ({
  createNotificationDB: jest.fn(),
  getNotificationsDB: jest.fn(),
  getUnreadCountDB: jest.fn(),
  markReadDB: jest.fn(),
  markUnreadDB: jest.fn(),
  markAllReadDB: jest.fn(),
  deleteOldNotificationsDB: jest.fn(),
}));

jest.unstable_mockModule("../../../src/db/index.js", () => ({
  db: { query: { dealerProfiles: { findFirst: jest.fn() } } },
}));

const notifsRepo = await import("../../../src/modules/notifications/notifications.repository.js");
const {
  getMyNotificationsService,
  markReadService,
  markUnreadService,
  markAllReadService,
} = await import("../../../src/modules/notifications/notifications.service.js");

beforeEach(() => jest.clearAllMocks());

describe("getMyNotificationsService", () => {
  it("returns notifications and unreadCount", async () => {
    notifsRepo.getNotificationsDB.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    notifsRepo.getUnreadCountDB.mockResolvedValue(1);
    const result = await getMyNotificationsService(10);
    expect(result.notifications).toHaveLength(2);
    expect(result.unreadCount).toBe(1);
  });
});

describe("markReadService", () => {
  it("throws NOT_FOUND when notification missing", async () => {
    notifsRepo.markReadDB.mockResolvedValue(null);
    await expect(markReadService(99, 10)).rejects.toThrow("NOT_FOUND");
  });

  it("returns result on success", async () => {
    notifsRepo.markReadDB.mockResolvedValue({ id: 1 });
    expect((await markReadService(1, 10)).id).toBe(1);
  });
});

describe("markUnreadService", () => {
  it("throws NOT_FOUND when notification missing", async () => {
    notifsRepo.markUnreadDB.mockResolvedValue(null);
    await expect(markUnreadService(99, 10)).rejects.toThrow("NOT_FOUND");
  });

  it("returns result on success", async () => {
    notifsRepo.markUnreadDB.mockResolvedValue({ id: 1 });
    expect((await markUnreadService(1, 10)).id).toBe(1);
  });
});

describe("markAllReadService", () => {
  it("delegates to markAllReadDB", async () => {
    notifsRepo.markAllReadDB.mockResolvedValue();
    await markAllReadService(10);
    expect(notifsRepo.markAllReadDB).toHaveBeenCalledWith(10);
  });
});
