import { usersTypes } from "../constants/constants";
import { userTypes } from "./schemas/users_types";

async function seedDatabase() {
  console.log("Seeding datas...");

  // Insert user types
  const userTypeValues = Object.values(usersTypes);
  await db.insert(userTypes).values(userTypeValues);

  console.log("Seeding completed ....");
  process.exit(0);
}

seedDatabase().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
