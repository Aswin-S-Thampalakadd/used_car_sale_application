import { and, asc, desc, eq, gte, ilike, lte } from "drizzle-orm";
import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";

export const getAllCarsDB = async (page, limit, filters) => {
  const offset = (page - 1) * limit;

  const conditions = [];

  if (filters.make) {
    conditions.push(ilike(cars.make, `%${filters.make}%`));
  }

  if (filters.model) {
    conditions.push(ilike(cars.model, `%${filters.model}%`));
  }

  if (filters.variant) {
    conditions.push(ilike(cars.variant, `%${filters.variant}%`));
  }

  if (filters.year !== undefined) {
    conditions.push(eq(cars.year, filters.year));
  }

  if (filters.minYear !== undefined) {
    conditions.push(gte(cars.year, filters.minYear));
  }

  if (filters.maxYear !== undefined) {
    conditions.push(lte(cars.year, filters.maxYear));
  }

  if (filters.registrationYear !== undefined) {
    conditions.push(eq(cars.registrationYear, filters.registrationYear));
  }

  if (filters.minRegistrationYear !== undefined) {
    conditions.push(gte(cars.registrationYear, filters.minRegistrationYear));
  }

  if (filters.maxRegistrationYear !== undefined) {
    conditions.push(lte(cars.registrationYear, filters.maxRegistrationYear));
  }

  if (filters.fuelType) {
    conditions.push(eq(cars.fuelType, filters.fuelType));
  }

  if (filters.transmission) {
    conditions.push(eq(cars.transmission, filters.transmission));
  }

  if (filters.minKm !== undefined) {
    conditions.push(gte(cars.kilometersDriven, filters.minKm));
  }

  if (filters.maxKm !== undefined) {
    conditions.push(lte(cars.kilometersDriven, filters.maxKm));
  }

  if (filters.minPrice !== undefined) {
    conditions.push(gte(cars.price, String(filters.minPrice)));
  }

  if (filters.maxPrice !== undefined) {
    conditions.push(lte(cars.price, String(filters.maxPrice)));
  }

  if (filters.color) {
    conditions.push(ilike(cars.color, `%${filters.color}%`));
  }

  if (filters.condition) {
    conditions.push(eq(cars.condition, filters.condition));
  }

  if (filters.status) {
    conditions.push(eq(cars.status, filters.status));
  }

  if (filters.isNegotiable !== undefined) {
    conditions.push(eq(cars.isNegotiable, filters.isNegotiable));
  }

  if (filters.isFeatured !== undefined) {
    conditions.push(eq(cars.isFeatured, filters.isFeatured));
  }

  if (filters.dealerId !== undefined) {
    conditions.push(eq(cars.dealerId, filters.dealerId));
  }

  let orderBy;

  const sortBy = filters.sortBy || "createdAt";
  const sortOrder = filters.sortOrder || "desc";

  const sortColumnMap = {
    price: cars.price,
    year: cars.year,
    kilometersDriven: cars.kilometersDriven,
    createdAt: cars.createdAt,
    updatedAt: cars.updatedAt,
    viewsCount: cars.viewsCount,
  };

  const sortColumn = sortColumnMap[sortBy] || cars.createdAt;

  orderBy = sortOrder === "asc" ? asc(sortColumn) : desc(sortColumn);

  let query = db.query.cars.findMany({
    with: {
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
    },
    limit,
    offset,
    orderBy,
    where: conditions.length ? and(...conditions) : undefined,
  });

  const result = await query;

  return result;
};

export const getCarByIdDB = async (id) => {
  const result = await db.query.cars.findFirst({
    where: eq(cars.id, id),
    with: {
      dealer: true,
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
    },
  });

  return result || null;
};

export const getAvailableCarBrandsDB = async () => {
  const result = await db
    .selectDistinct({
      brand: cars.make,
    })
    .from(cars)
    .orderBy(asc(cars.make));

  return result.map((item) => item.brand);
};

export const getRecentlyAddedCarsDB = async (limit) => {
  const result = await db.query.cars.findMany({
    with: {
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
    },
    where: eq(cars.status, "active"),
    orderBy: desc(cars.createdAt),
    limit,
  });

  return result;
};

export const createCar = async (data) => {
  const result = await db.insert(cars).values(data).returning();

  return result[0];
};

export const findCarById = async (carId) => {
  const result = await db
    .select()
    .from(cars)
    .where(eq(cars.id, carId))
    .limit(1);

  return result[0] || null;
};

export const findDealerCarById = async (carId, dealerId) => {
  const result = await db
    .select()
    .from(cars)
    .where(and(eq(cars.id, carId), eq(cars.dealerId, dealerId)))
    .limit(1);

  return result[0] || null;
};

export const updateCar = async (carId, dealerId, data) => {
  const result = await db
    .update(cars)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(and(eq(cars.id, carId), eq(cars.dealerId, dealerId)))
    .returning();

  return result[0] || null;
};

export const deleteCar = async (carId, dealerId) => {
  const result = await db
    .delete(cars)
    .where(and(eq(cars.id, carId), eq(cars.dealerId, dealerId)))
    .returning({
      id: cars.id,
    });

  return result[0] || null;
};

export const updateCarStatus = async (carId, dealerId, status) => {
  const result = await db
    .update(cars)
    .set({
      status,
      updatedAt: new Date(),
    })
    .where(and(eq(cars.id, carId), eq(cars.dealerId, dealerId)))
    .returning();

  return result[0] || null;
};

export const getFeaturedCarsDB = async (limit = 10) => {
  return await db.query.cars.findMany({
    where: (cars, { and, eq }) =>
      and(eq(cars.isFeatured, true), eq(cars.status, "active")),
    with: {
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
      dealer: true,
    },
    orderBy: [desc(cars.createdAt)],
    limit,
  });
};

export const searchCarsDB = async ({
  search,
  make,
  model,
  fuelType,
  transmission,
  minPrice,
  maxPrice,
  minYear,
  maxYear,
  minKilometers,
  maxKilometers,
  page,
  limit,
}) => {
  const filters = [eq(cars.status, "active")];

  if (search) {
    filters.push(
      or(
        ilike(cars.make, `%${search}%`),
        ilike(cars.model, `%${search}%`),
        ilike(cars.variant, `%${search}%`)
      )
    );
  }

  if (make) {
    filters.push(eq(cars.make, make));
  }

  if (model) {
    filters.push(eq(cars.model, model));
  }

  if (fuelType) {
    filters.push(eq(cars.fuelType, fuelType));
  }

  if (transmission) {
    filters.push(eq(cars.transmission, transmission));
  }

  if (minPrice) {
    filters.push(gte(cars.price, minPrice));
  }

  if (maxPrice) {
    filters.push(lte(cars.price, maxPrice));
  }

  if (minYear) {
    filters.push(gte(cars.year, minYear));
  }

  if (maxYear) {
    filters.push(lte(cars.year, maxYear));
  }

  if (minKilometers) {
    filters.push(gte(cars.kilometersDriven, minKilometers));
  }

  if (maxKilometers) {
    filters.push(lte(cars.kilometersDriven, maxKilometers));
  }

  return await db.query.cars.findMany({
    where: and(...filters),
    with: {
      carImages: true,
      carFeatureMappings: {
        with: {
          feature: true,
        },
      },
      dealer: true,
    },
    orderBy: [desc(cars.createdAt)],
    limit,
    offset: (page - 1) * limit,
  });
};

export const getLocationRecommendedCarsDB = async ({ city, state, limit }) => {
  const filters = [eq(cars.status, "active")];

  if (city) {
    filters.push(eq(dealerProfiles.city, city));
  }

  if (state) {
    filters.push(eq(dealerProfiles.state, state));
  }

  return await db
    .select()
    .from(cars)
    .innerJoin(dealerProfiles, eq(cars.dealerId, dealerProfiles.userId))
    .where(and(...filters))
    .orderBy(desc(cars.createdAt))
    .limit(limit);
};
