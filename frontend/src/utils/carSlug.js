/**
 * Generates an SEO-friendly URL slug for a car.
 *
 * Format: /{year}-{make}-{model}-{fuelType}-{id}
 * Example: /used-cars/2021-honda-city-petrol-8
 *
 * Rules:
 *  - All parts lowercased
 *  - Non-alphanumeric chars replaced with hyphens
 *  - Multiple/trailing hyphens collapsed
 *  - ID always appended so the backend can extract it reliably
 *
 * @param {object} car  - car object with at least { id, year, make, model, fuelType }
 * @returns {string}    - full path like "/used-cars/2021-honda-city-petrol-8"
 */
export function carSlug(car) {
  const slugify = (str) =>
    String(str ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const parts = [
    car.year,
    car.make,
    car.model,
    car.fuelType,
  ]
    .map(slugify)
    .filter(Boolean);

  // Always include the numeric ID as the last segment so the backend
  // can extract it with a simple `parseInt(slug.split("-").at(-1))`
  return `/used-cars/${parts.join("-")}-${car.id}`;
}
