const bcrypt = require("bcrypt");

const { usersTypess, dummyUsers } = require("../constants/constants");

const { db } = require("../db");

const { userTypes } = require("./schemas/users_types");
const { users } = require("./schemas/users");

async function seedDatabase() {
  console.log("Seeding data...");

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
  console.log("Seeding completed.");

  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
