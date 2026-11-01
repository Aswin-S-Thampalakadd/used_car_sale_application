import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";

import {
  usersTypess,
  dummyUsers,
  dummyDealer,
  carFeatures as dummyCarFeatures,
  dummyCars,
} from "../constants/constants.js";

import { db } from "./index.js";

import { userTypes } from "./schemas/users_types.js";
import { users } from "./schemas/users.js";
import { dealerProfiles } from "./schemas/dealers.js";
import { cars } from "./schemas/cars.js";
import { carFeatures } from "./schemas/car_features.js";
import { carImages } from "./schemas/car_images.js";
import { carFeatureMappings } from "./schemas/car_feature_mappings.js";

async function seedDatabase() {
  await db
    .insert(userTypes)
    .values(Object.values(usersTypess))
    .onConflictDoNothing({
      target: userTypes.name,
    });

  const existingUserTypes = await db.select().from(userTypes);
  const userTypeMap = {};

  for (const userType of existingUserTypes) {
    userTypeMap[userType.name] = userType.id;
  }

  const userValues = await Promise.all(
    Object.entries(dummyUsers).map(async ([userTypeName, user]) => ({
      name: user.name,
      email: user.email,
      phone: user.phone,
      passwordHash: await bcrypt.hash(user.password, 12),
      userTypeId: userTypeMap[userTypeName],
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
    })),
  );

  await db.insert(users).values(userValues).onConflictDoNothing({
    target: users.email,
  });

  const dealerUser = await db
    .select()
    .from(users)
    .where(eq(users.email, dummyUsers.DEALER.email))
    .limit(1);

  if (!dealerUser.length) {
    throw new Error("Dealer user not found");
  }

  const dealerUserId = dealerUser[0].id;

  await db
    .insert(dealerProfiles)
    .values({
      userId: dealerUserId,
      ...dummyDealer,
    })
    .onConflictDoNothing({
      target: dealerProfiles.userId,
    });

  await db
    .insert(carFeatures)
    .values(
      dummyCarFeatures.map((name) => ({
        name,
      })),
    )
    .onConflictDoNothing({
      target: carFeatures.name,
    });

  const existingFeatures = await db.select().from(carFeatures);
  const featureMap = {};

  for (const feature of existingFeatures) {
    featureMap[feature.name] = feature.id;
  }

  const insertedCars = [];

  for (const car of dummyCars) {
    const existingCar = await db
      .select()
      .from(cars)
      .where(eq(cars.registrationNumber, car.registrationNumber))
      .limit(1);

    if (existingCar.length) {
      insertedCars.push(existingCar[0]);
      continue;
    }

    const [insertedCar] = await db
      .insert(cars)
      .values({
        dealerId: dealerUserId,
        make: car.make,
        model: car.model,
        variant: car.variant,
        year: car.year,
        registrationYear: car.registrationYear,
        fuelType: car.fuelType,
        transmission: car.transmission,
        kilometersDriven: car.kilometersDriven,
        price: car.price,
        color: car.color,
        condition: car.condition,
        description: car.description,
        registrationNumber: car.registrationNumber,
        isNegotiable: car.isNegotiable,
        status: car.status,
        isFeatured: car.isFeatured,
        viewsCount: car.viewsCount,
      })
      .returning();

    insertedCars.push(insertedCar);
  }

  for (let i = 0; i < dummyCars.length; i++) {
    const car = dummyCars[i];
    const insertedCar = insertedCars[i];

    const existingImages = await db
      .select()
      .from(carImages)
      .where(eq(carImages.carId, insertedCar.id));

    if (existingImages.length) {
      continue;
    }

    await db.insert(carImages).values(
      car.images.map((imageUrl, index) => ({
        carId: insertedCar.id,
        imageUrl,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    );
  }

  for (let i = 0; i < dummyCars.length; i++) {
    const car = dummyCars[i];
    const insertedCar = insertedCars[i];

    const mappings = car.features
      .map((featureName) => featureMap[featureName])
      .filter(Boolean)
      .map((featureId) => ({
        carId: insertedCar.id,
        featureId,
      }));

    if (mappings.length) {
      await db
        .insert(carFeatureMappings)
        .values(mappings)
        .onConflictDoNothing();
    }
  }
  console.log("Seeding completed.");

  process.exit(0);
}

seedDatabase().catch((err) => {
  process.exit(1);
});
