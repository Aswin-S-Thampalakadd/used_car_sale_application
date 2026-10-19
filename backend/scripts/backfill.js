import { db } from "../src/db/index.js";
import { sql } from "drizzle-orm";

// Backfill dealer_id on car reviews that were saved before the fix
const result = await db.execute(sql`
  UPDATE reviews r
  SET dealer_id = dp.id
  FROM cars c
  JOIN dealer_profiles dp ON dp.user_id = c.dealer_id
  WHERE r.car_id = c.id
    AND r.review_type = 'dealer'
    AND r.dealer_id IS NULL
`);
console.log("Backfill done. Rows updated:", result.rowCount);

// Verify
const check = await db.execute(sql`
  SELECT id, car_id, dealer_id, is_approved FROM reviews WHERE review_type='dealer'
`);
console.table(check.rows);
process.exit(0);
