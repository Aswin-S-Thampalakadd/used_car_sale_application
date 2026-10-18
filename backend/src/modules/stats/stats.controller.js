import { avg, count, countDistinct, eq, gte, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { reviews } from "../../db/schemas/reviews.js";
import { users } from "../../db/schemas/users.js";

/**
 * GET /api/v1/stats
 * Returns live platform-wide counts:
 *   totalCars        – active car listings
 *   totalDealers     – verified dealers
 *   totalCities      – distinct cities where dealers are present
 *   averageRating    – average of all app-level reviews (1-5 stars)
 *   totalCustomers   – total registered customer accounts
 *   recommendRate    – % of app reviews with rating >= 4 ("would recommend")
 */
export const getPlatformStats = async (_req, res) => {
  const CUSTOMER_TYPE_ID = 2;

  try {
    const [
      carsRes,
      dealersRes,
      citiesRes,
      ratingRes,
      customersRes,
      totalAppReviewsRes,
      positiveAppReviewsRes,
    ] = await Promise.all([
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

      // avg star rating — approved app reviews only
      db.select({ avg: avg(reviews.rating) })
        .from(reviews)
        .where(and(
          eq(reviews.reviewType, "app"),
          eq(reviews.isApproved, true),
        )),

      // total registered customers
      db.select({ total: count() })
        .from(users)
        .where(eq(users.userTypeId, CUSTOMER_TYPE_ID)),

      // total approved app reviews (denominator for recommend rate)
      db.select({ total: count() })
        .from(reviews)
        .where(and(
          eq(reviews.reviewType, "app"),
          eq(reviews.isApproved, true),
        )),

      // approved app reviews with rating >= 4 (numerator for recommend rate)
      db.select({ total: count() })
        .from(reviews)
        .where(and(
          eq(reviews.reviewType, "app"),
          eq(reviews.isApproved, true),
          gte(reviews.rating, 4),
        )),
    ]);

    const totalAppReviews    = Number(totalAppReviewsRes[0]?.total    ?? 0);
    const positiveAppReviews = Number(positiveAppReviewsRes[0]?.total ?? 0);

    // Recommend rate as a whole-number percentage; null when no reviews yet
    const recommendRate = totalAppReviews > 0
      ? Math.round((positiveAppReviews / totalAppReviews) * 100)
      : null;

    return res.json({
      success: true,
      stats: {
        totalCars:      Number(carsRes[0]?.total      ?? 0),
        totalDealers:   Number(dealersRes[0]?.total   ?? 0),
        totalCities:    Number(citiesRes[0]?.total    ?? 0),
        averageRating:  ratingRes[0]?.avg
          ? Number(Number(ratingRes[0].avg).toFixed(1))
          : null,
        totalCustomers: Number(customersRes[0]?.total ?? 0),
        recommendRate,
      },
    });
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({ success: false, message: "Failed to fetch stats" });
  }
};
