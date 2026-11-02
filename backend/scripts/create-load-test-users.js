import "../src/config/env.js";
import bcrypt from "bcrypt";
import { db } from "../src/db/index.js";
import { users } from "../src/db/schemas/users.js";
import { dealerProfiles } from "../src/db/schemas/dealers.js";
import { eq } from "drizzle-orm";

const CUSTOMER_USER_TYPE_ID = 2;
const DEALER_USER_TYPE_ID   = 3;
const ADMIN_USER_TYPE_ID    = 1;

const loadTestUsers = [
  {
    name:         "Load Test Customer",
    email:        "loadtest.customer@example.com",
    password:     "LoadTest@123",
    userTypeId:   CUSTOMER_USER_TYPE_ID,
    dealerInfo:   null,
  },
  {
    name:         "Load Test Dealer",
    email:        "loadtest.dealer@example.com",
    password:     "LoadTest@123",
    userTypeId:   DEALER_USER_TYPE_ID,
    dealerInfo:   { dealershipName: "Load Test Motors", city: "Kochi", state: "Kerala" },
  },
  {
    name:         "Admin",
    email:        "admin@example.com",
    password:     "Admin@123",
    userTypeId:   ADMIN_USER_TYPE_ID,
    dealerInfo:   null,
  },
];

async function run() {
  console.log("Creating load test users...\n");

  for (const u of loadTestUsers) {
    const existing = await db.query.users.findFirst({ where: eq(users.email, u.email) });

    if (existing) {
      console.log(`✓  Already exists: ${u.email} (id=${existing.id})`);
      continue;
    }

    const passwordHash = await bcrypt.hash(u.password, 12);

    const [user] = await db.insert(users).values({
      name:         u.name,
      email:        u.email,
      phone:        null,
      passwordHash,
      userTypeId:   u.userTypeId,
      isActive:     true,
    }).returning();

    console.log(`✓  Created: ${u.email} (id=${user.id})`);

    if (u.dealerInfo) {
      await db.insert(dealerProfiles).values({
        userId:         user.id,
        dealershipName: u.dealerInfo.dealershipName,
        city:           u.dealerInfo.city,
        state:          u.dealerInfo.state,
        isVerified:     true,
      });
      console.log(`   └─ Dealer profile created`);
    }
  }

  console.log("\nDone. You can now run all k6 load test scenarios.");
  process.exit(0);
}

run().catch((err) => {
  console.error("Failed:", err.message);
  process.exit(1);
});
