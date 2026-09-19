const bcrypt = require("bcrypt");
const { eq } = require("drizzle-orm");

const {
  usersTypess,
  dummyUsers,
  dummyDealer,
  carFeatures: dummyCarFeatures,
  dummyCars,
} = require("../constants/constants");

const { db } = require("../db");

const { userTypes } = require("./schemas/users_types");
const { users } = require("./schemas/users");
const { dealerProfiles } = require("./schemas/dealers");
const { cars } = require("./schemas/cars");
const { carFeatures } = require("./schemas/car_features");
const { carImages } = require("./schemas/car_images");
const { carFeatureMappings } = require("./schemas/car_feature_mappings");

async function seedDatabase() {
  console.log("Seeding data...");

  // User types
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

  console.log("User types ready.");

  // Users
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
    }))
  );

  await db.insert(users).values(userValues).onConflictDoNothing({
    target: users.email,
  });

  console.log("Users seeded.");

  // Dealer user
  const dealerUser = await db
    .select()
    .from(users)
    .where(eq(users.email, dummyUsers.DEALER.email))
    .limit(1);

  if (!dealerUser.length) {
    throw new Error("Dealer user not found");
  }

  const dealerUserId = dealerUser[0].id;

  // Dealer profile
  await db
    .insert(dealerProfiles)
    .values({
      userId: dealerUserId,
      ...dummyDealer,
    })
    .onConflictDoNothing({
      target: dealerProfiles.userId,
    });

  console.log("Dealer profile ready.");

  // Features
  await db
    .insert(carFeatures)
    .values(
      dummyCarFeatures.map((name) => ({
        name,
      }))
    )
    .onConflictDoNothing({
      target: carFeatures.name,
    });

  const existingFeatures = await db.select().from(carFeatures);

  const featureMap = {};

  for (const feature of existingFeatures) {
    featureMap[feature.name] = feature.id;
  }

  console.log("Car features ready.");

  // Cars
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

  console.log("Cars seeded.");

  // Images
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
      }))
    );
  }

  console.log("Car images seeded.");

  // Feature mappings
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

  console.log("Car feature mappings seeded.");

  console.log("Seeding completed.");

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
