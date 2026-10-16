import { avg, count, countDistinct, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { reviews } from "../../db/schemas/reviews.js";

/**
 * GET /api/v1/stats
 * Returns live platform-wide counts:
 *   totalCars      – active car listings
 *   totalDealers   – verified dealers
 *   totalCities    – distinct cities where dealers are present
 *   averageRating  – average of all app-level reviews (1-5 stars)
 */
export const getPlatformStats = async (_req, res) => {
  try {
    const [carsRes, dealersRes, citiesRes, ratingRes] = await Promise.all([
      // active listings only
      db.select({ total: count() })
        .from(cars)
        .where(eq(cars.status, "active")),

      // verified dealers only
      db.select({ total: count() })
        .from(dealerProfiles)
        .where(eq(dealerProfiles.isVerified, true)),

      // distinct non-null cities across all dealer profiles
      db.select({ total: countDistinct(dealerProfiles.city) })
        .from(dealerProfiles),

      // avg star rating from app reviews
      db.select({ avg: avg(reviews.rating) })
        .from(reviews)
        .where(eq(reviews.reviewType, "app")),
    ]);

    return res.json({
      success: true,
      stats: {
        totalCars:     Number(carsRes[0]?.total    ?? 0),
        totalDealers:  Number(dealersRes[0]?.total  ?? 0),
        totalCities:   Number(citiesRes[0]?.total   ?? 0),
        averageRating: ratingRes[0]?.avg
          ? Number(Number(ratingRes[0].avg).toFixed(1))
          : null,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
