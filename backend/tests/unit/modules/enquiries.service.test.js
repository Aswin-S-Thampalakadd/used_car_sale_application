import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/enquiries/enquiries.repository.js", () => ({
  createEnquiryDB: jest.fn(),
  getEnquiriesByCustomerDB: jest.fn(),
  getEnquiriesByDealerDB: jest.fn(),
  updateEnquiryStatusDB: jest.fn(),
  deleteEnquiryDB: jest.fn(),
}));

jest.unstable_mockModule("../../../src/modules/notifications/notifications.service.js", () => ({
  notifyNewEnquiry: jest.fn(),
  notifyNewReview: jest.fn(),
  notifyViewMilestone: jest.fn(),
  getMyNotificationsService: jest.fn(),
  markReadService: jest.fn(),
  markUnreadService: jest.fn(),
  markAllReadService: jest.fn(),
  getDealerUserIdByProfileId: jest.fn(),
}));

jest.unstable_mockModule("../../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

const enquiriesRepo = await import("../../../src/modules/enquiries/enquiries.repository.js");
const notifService = await import("../../../src/modules/notifications/notifications.service.js");
const { db } = await import("../../../src/db/index.js");
const {
  createEnquiryService,
  getMyEnquiriesService,
  updateEnquiryStatusService,
  deleteEnquiryService,
} = await import("../../../src/modules/enquiries/enquiries.service.js");

beforeEach(() => jest.clearAllMocks());

const mockCar = { id: 5, dealerId: 20, status: "active", make: "Toyota", model: "Corolla", year: 2021 };
const mockEnquiry = { id: 1, carId: 5, customerId: 3, dealerId: 20, message: "hi" };

describe("createEnquiryService", () => {
  it("throws CAR_NOT_FOUND when car missing", async () => {
    db.query.cars.findFirst.mockResolvedValue(null);
    await expect(createEnquiryService(3, { carId: 99 })).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("throws CAR_NOT_AVAILABLE when car not active", async () => {
    db.query.cars.findFirst.mockResolvedValue({ ...mockCar, status: "sold" });
    await expect(createEnquiryService(3, { carId: 5 })).rejects.toThrow("CAR_NOT_AVAILABLE");
  });

  it("creates enquiry on success and fires notification", async () => {
    db.query.cars.findFirst.mockResolvedValue(mockCar);
    enquiriesRepo.createEnquiryDB.mockResolvedValue(mockEnquiry);
    notifService.notifyNewEnquiry.mockResolvedValue();
    const result = await createEnquiryService(3, { carId: 5, message: "hi" });
    expect(result.enquiry).toEqual(mockEnquiry);
    expect(result.message).toBe("Enquiry sent successfully");
  });
});

describe("getMyEnquiriesService", () => {
  it("fetches by customer for customer typeId (2)", async () => {
    enquiriesRepo.getEnquiriesByCustomerDB.mockResolvedValue([mockEnquiry]);
    const result = await getMyEnquiriesService(3, 2);
    expect(enquiriesRepo.getEnquiriesByCustomerDB).toHaveBeenCalledWith(3);
    expect(result).toHaveLength(1);
  });

  it("fetches by dealer when typeId is undefined (usersTypess.DEALER.id is undefined)", async () => {
    enquiriesRepo.getEnquiriesByDealerDB.mockResolvedValue([]);
    await getMyEnquiriesService(3, undefined);
    expect(enquiriesRepo.getEnquiriesByDealerDB).toHaveBeenCalledWith(3);
  });
});

describe("updateEnquiryStatusService", () => {
  it("throws INVALID_STATUS for unknown status", async () => {
    await expect(updateEnquiryStatusService(1, 20, "unknown")).rejects.toThrow("INVALID_STATUS");
  });

  it("throws ENQUIRY_NOT_FOUND when update returns null", async () => {
    enquiriesRepo.updateEnquiryStatusDB.mockResolvedValue(null);
    await expect(updateEnquiryStatusService(1, 20, "contacted")).rejects.toThrow("ENQUIRY_NOT_FOUND");
  });

  it("returns updated enquiry", async () => {
    enquiriesRepo.updateEnquiryStatusDB.mockResolvedValue({ ...mockEnquiry, status: "contacted" });
    const result = await updateEnquiryStatusService(1, 20, "contacted");
    expect(result.enquiry.status).toBe("contacted");
  });
});

describe("deleteEnquiryService", () => {
  it("throws ENQUIRY_NOT_FOUND when delete returns null", async () => {
    enquiriesRepo.deleteEnquiryDB.mockResolvedValue(null);
    await expect(deleteEnquiryService(1, 3)).rejects.toThrow("ENQUIRY_NOT_FOUND");
  });

  it("returns message on success", async () => {
    enquiriesRepo.deleteEnquiryDB.mockResolvedValue({ id: 1 });
    expect((await deleteEnquiryService(1, 3)).message).toBe("Enquiry deleted successfully");
  });
});
