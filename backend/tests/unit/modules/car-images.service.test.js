import { jest } from "@jest/globals";

jest.unstable_mockModule("../../../src/modules/car-images/car-images.repository.js", () => ({
  addCarImagesDB: jest.fn(),
  deleteCarImageDB: jest.fn(),
  setPrimaryImageDB: jest.fn(),
  getCarImagesDB: jest.fn(),
}));

jest.unstable_mockModule("../../../src/db/index.js", () => ({
  db: { query: { cars: { findFirst: jest.fn() } } },
}));

const carImagesRepo = await import("../../../src/modules/car-images/car-images.repository.js");
const { db } = await import("../../../src/db/index.js");
const {
  addCarImagesService,
  deleteCarImageService,
  setPrimaryImageService,
  getCarImagesService,
} = await import("../../../src/modules/car-images/car-images.service.js");

beforeEach(() => jest.clearAllMocks());

const mockImage = { id: 1, carId: 5, imageUrl: "https://example.com/img.jpg", isPrimary: false };

describe("addCarImagesService", () => {
  it("throws CAR_NOT_FOUND when car not owned by dealer", async () => {
    db.query.cars.findFirst.mockResolvedValue(null);
    await expect(addCarImagesService(5, 10, [{ imageUrl: "http://x.com/a.jpg" }])).rejects.toThrow("CAR_NOT_FOUND");
  });

  it("adds images on success", async () => {
    db.query.cars.findFirst.mockResolvedValue({ id: 5 });
    carImagesRepo.addCarImagesDB.mockResolvedValue([mockImage]);
    const result = await addCarImagesService(5, 10, [{ imageUrl: "http://x.com/a.jpg" }]);
    expect(result.images).toHaveLength(1);
    expect(result.message).toBe("Images added successfully");
  });

  it("assigns sortOrder from index when not provided", async () => {
    db.query.cars.findFirst.mockResolvedValue({ id: 5 });
    carImagesRepo.addCarImagesDB.mockResolvedValue([mockImage, mockImage]);
    await addCarImagesService(5, 10, [{ imageUrl: "a.jpg" }, { imageUrl: "b.jpg" }]);
    const inserted = carImagesRepo.addCarImagesDB.mock.calls[0][1];
    expect(inserted[0].sortOrder).toBe(0);
    expect(inserted[1].sortOrder).toBe(1);
  });
});

describe("deleteCarImageService", () => {
  it("throws IMAGE_NOT_FOUND", async () => {
    carImagesRepo.deleteCarImageDB.mockResolvedValue(null);
    await expect(deleteCarImageService(99, 10)).rejects.toThrow("IMAGE_NOT_FOUND");
  });

  it("returns message on success", async () => {
    carImagesRepo.deleteCarImageDB.mockResolvedValue({ id: 1 });
    expect((await deleteCarImageService(1, 10)).message).toBe("Image deleted successfully");
  });
});

describe("setPrimaryImageService", () => {
  it("throws IMAGE_NOT_FOUND", async () => {
    carImagesRepo.setPrimaryImageDB.mockResolvedValue(null);
    await expect(setPrimaryImageService(99, 5, 10)).rejects.toThrow("IMAGE_NOT_FOUND");
  });

  it("returns image on success", async () => {
    carImagesRepo.setPrimaryImageDB.mockResolvedValue({ ...mockImage, isPrimary: true });
    const result = await setPrimaryImageService(1, 5, 10);
    expect(result.image.isPrimary).toBe(true);
    expect(result.message).toBe("Primary image updated");
  });
});

describe("getCarImagesService", () => {
  it("delegates to getCarImagesDB", async () => {
    carImagesRepo.getCarImagesDB.mockResolvedValue([mockImage]);
    const result = await getCarImagesService(5);
    expect(result).toHaveLength(1);
    expect(carImagesRepo.getCarImagesDB).toHaveBeenCalledWith(5);
  });
});
