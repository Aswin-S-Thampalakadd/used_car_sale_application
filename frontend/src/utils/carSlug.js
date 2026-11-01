export function carSlug(car) {
  const slugify = (str) =>
    String(str ?? "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const parts = [car.year, car.make, car.model, car.fuelType]
    .map(slugify)
    .filter(Boolean);

  return `/used-cars/${parts.join("-")}-${car.id}`;
}
