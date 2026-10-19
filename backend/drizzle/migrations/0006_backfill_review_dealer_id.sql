-- Backfill dealer_id on car reviews that were saved before the fix.
-- Joins reviews → cars → dealer_profiles to find the correct dealer profile id.
UPDATE reviews r
SET dealer_id = dp.id
FROM cars c
JOIN dealer_profiles dp ON dp.user_id = c.dealer_id
WHERE r.car_id = c.id
  AND r.review_type = 'dealer'
  AND r.dealer_id IS NULL;
