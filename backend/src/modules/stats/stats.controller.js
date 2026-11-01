import { avg, count, countDistinct, eq, gte, and } from "drizzle-orm";
import { db } from "../../db/index.js";
import { cars } from "../../db/schemas/cars.js";
import { dealerProfiles } from "../../db/schemas/dealers.js";
import { reviews } from "../../db/schemas/reviews.js";
import { users } from "../../db/schemas/users.js";

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
      db.select({ total: count() }).from(cars).where(eq(cars.status, "active")),

      db
        .select({ total: count() })
        .from(dealerProfiles)
        .where(eq(dealerProfiles.isVerified, true)),

      db
        .select({ total: countDistinct(dealerProfiles.city) })
        .from(dealerProfiles),

      db
        .select({ avg: avg(reviews.rating) })
        .from(reviews)
        .where(
          and(eq(reviews.reviewType, "app"), eq(reviews.isApproved, true)),
        ),

      db
        .select({ total: count() })
        .from(users)
        .where(eq(users.userTypeId, CUSTOMER_TYPE_ID)),

      db
        .select({ total: count() })
        .from(reviews)
        .where(
          and(eq(reviews.reviewType, "app"), eq(reviews.isApproved, true)),
        ),

      db
        .select({ total: count() })
        .from(reviews)
        .where(
          and(
            eq(reviews.reviewType, "app"),
            eq(reviews.isApproved, true),
            gte(reviews.rating, 4),
          ),
        ),
    ]);

    const totalAppReviews = Number(totalAppReviewsRes[0]?.total ?? 0);
    const positiveAppReviews = Number(positiveAppReviewsRes[0]?.total ?? 0);

    const recommendRate =
      totalAppReviews > 0
        ? Math.round((positiveAppReviews / totalAppReviews) * 100)
        : null;

    return res.json({
      success: true,
      stats: {
        totalCars: Number(carsRes[0]?.total ?? 0),
        totalDealers: Number(dealersRes[0]?.total ?? 0),
        totalCities: Number(citiesRes[0]?.total ?? 0),
        averageRating: ratingRes[0]?.avg
          ? Number(Number(ratingRes[0].avg).toFixed(1))
          : null,
        totalCustomers: Number(customersRes[0]?.total ?? 0),
        recommendRate,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to fetch stats" });
  }
};
