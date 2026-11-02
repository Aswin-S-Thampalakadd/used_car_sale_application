import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/favourites/favourites.repository.js", () => ({
  addFavouriteDB: jest.fn(),
  removeFavouriteDB: jest.fn(),
  getFavouritesByUserDB: jest.fn(),
  isFavouriteDB: jest.fn(),
}));

jest.unstable_mockModule("../../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

const favsRepo = await import("../../../src/modules/favourites/favourites.repository.js");
const { db } = await import("../../../src/db/index.js");
const {
  addFavouriteService,
  removeFavouriteService,
  getMyFavouritesService,
  checkFavouriteService,
} = await import("../../../src/modules/favourites/favourites.service.js");

beforeEach(() => jest.clearAllMocks());

describe("addFavouriteService", () => {
  it("throws CAR_NOT_FOUND when car missing", async () => {
    db.query.cars.findFirst.mockResolvedValue(null);
    await expect(addFavouriteService(1, 99)).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("returns 'already in favourites' when DB returns null (on-conflict)", async () => {
    db.query.cars.findFirst.mockResolvedValue({ id: 5 });
    favsRepo.addFavouriteDB.mockResolvedValue(null);
    const result = await addFavouriteService(1, 5);
    expect(result.message).toBe("Car already in favourites");
  });

  it("returns favourite on success", async () => {
    db.query.cars.findFirst.mockResolvedValue({ id: 5 });
    favsRepo.addFavouriteDB.mockResolvedValue({ userId: 1, carId: 5 });
    const result = await addFavouriteService(1, 5);
    expect(result.message).toBe("Added to favourites");
    expect(result.favourite).toBeDefined();
  });
});

describe("removeFavouriteService", () => {
  it("throws NOT_IN_FAVOURITES when record not found", async () => {
    favsRepo.removeFavouriteDB.mockResolvedValue(null);
    await expect(removeFavouriteService(1, 5)).rejects.toThrow("NOT_IN_FAVOURITES");
  });

  it("returns message on success", async () => {
    favsRepo.removeFavouriteDB.mockResolvedValue({ carId: 5 });
    expect((await removeFavouriteService(1, 5)).message).toBe("Removed from favourites");
  });
});

describe("getMyFavouritesService", () => {
  it("returns flat list of car objects", async () => {
    favsRepo.getFavouritesByUserDB.mockResolvedValue([
      { car: { id: 1, make: "Toyota" } },
      { car: { id: 2, make: "Honda" } },
    ]);
    const result = await getMyFavouritesService(1);
    expect(result).toHaveLength(2);
    expect(result[0].make).toBe("Toyota");
  });
});

describe("checkFavouriteService", () => {
  it("returns isFavourite: true", async () => {
    favsRepo.isFavouriteDB.mockResolvedValue(true);
    expect((await checkFavouriteService(1, 5)).isFavourite).toBe(true);
  });

  it("returns isFavourite: false", async () => {
    favsRepo.isFavouriteDB.mockResolvedValue(false);
    expect((await checkFavouriteService(1, 5)).isFavourite).toBe(false);
  });
});
