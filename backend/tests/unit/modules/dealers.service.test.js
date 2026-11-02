import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/dealers/dealers.repository.js", () => ({
  getDealerProfileByUserIdDB: jest.fn(),
  getDealerProfileByIdDB: jest.fn(),
  updateDealerProfileDB: jest.fn(),
  getDealerCarsDB: jest.fn(),
}));

const dealersRepo = await import("../../../src/modules/dealers/dealers.repository.js");
const {
  getMyDealerProfileService,
  getPublicDealerProfileService,
  updateDealerProfileService,
  getMyDealerCarsService,
} = await import("../../../src/modules/dealers/dealers.service.js");

beforeEach(() => jest.clearAllMocks());

const mockProfile = { id: 1, userId: 10, dealershipName: "Best Cars", city: "Kochi" };

describe("getMyDealerProfileService", () => {
  it("throws PROFILE_NOT_FOUND when no profile", async () => {
    dealersRepo.getDealerProfileByUserIdDB.mockResolvedValue(null);
    await expect(getMyDealerProfileService(10)).rejects.toThrow("PROFILE_NOT_FOUND");
  });

  it("returns profile on success", async () => {
    dealersRepo.getDealerProfileByUserIdDB.mockResolvedValue(mockProfile);
    expect(await getMyDealerProfileService(10)).toEqual(mockProfile);
  });
});

describe("getPublicDealerProfileService", () => {
  it("throws PROFILE_NOT_FOUND when not found", async () => {
    dealersRepo.getDealerProfileByIdDB.mockResolvedValue(null);
    await expect(getPublicDealerProfileService(99)).rejects.toThrow("PROFILE_NOT_FOUND");
  });

  it("returns profile when found", async () => {
    dealersRepo.getDealerProfileByIdDB.mockResolvedValue(mockProfile);
    const result = await getPublicDealerProfileService(1);
    expect(result.dealershipName).toBe("Best Cars");
  });
});

describe("updateDealerProfileService", () => {
  it("throws PROFILE_NOT_FOUND when update returns null", async () => {
    dealersRepo.updateDealerProfileDB.mockResolvedValue(null);
    await expect(updateDealerProfileService(10, { city: "Trivandrum" })).rejects.toThrow("PROFILE_NOT_FOUND");
  });

  it("only updates allowed fields and ignores unknown keys", async () => {
    dealersRepo.updateDealerProfileDB.mockResolvedValue(mockProfile);
    await updateDealerProfileService(10, { city: "Trivandrum", hackerField: "x" });
    const calledWith = dealersRepo.updateDealerProfileDB.mock.calls[0][1];
    expect(calledWith).not.toHaveProperty("hackerField");
    expect(calledWith).toHaveProperty("city", "Trivandrum");
  });

  it("returns message and profile on success", async () => {
    dealersRepo.updateDealerProfileDB.mockResolvedValue(mockProfile);
    const result = await updateDealerProfileService(10, { city: "Kochi" });
    expect(result.message).toBe("Profile updated successfully");
    expect(result.profile).toEqual(mockProfile);
  });
});

describe("getMyDealerCarsService", () => {
  it("passes null status when none given", async () => {
    dealersRepo.getDealerCarsDB.mockResolvedValue([]);
    await getMyDealerCarsService(10, undefined);
    expect(dealersRepo.getDealerCarsDB).toHaveBeenCalledWith(10, null);
  });

  it("passes status filter through", async () => {
    dealersRepo.getDealerCarsDB.mockResolvedValue([]);
    await getMyDealerCarsService(10, "active");
    expect(dealersRepo.getDealerCarsDB).toHaveBeenCalledWith(10, "active");
  });
});
