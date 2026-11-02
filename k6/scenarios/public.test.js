import { sleep, group } from "k6";
import { Counter, Trend } from "k6/metrics";
import { STAGES_LOAD, THRESHOLDS_STRICT } from "../config.js";
import { get, assertPublicRead, assertStatus } from "../helpers/http.js";

export const options = {
  stages: STAGES_LOAD,
  thresholds: {
    ...THRESHOLDS_STRICT,
    "http_req_duration{endpoint:cars_list}":     ["p(95)<400"],
    "http_req_duration{endpoint:cars_featured}": ["p(95)<400"],
    "http_req_duration{endpoint:cars_brands}":   ["p(95)<300"],
    "http_req_duration{endpoint:cars_recent}":   ["p(95)<400"],
    "http_req_duration{endpoint:cars_search}":   ["p(95)<600"],
    "http_req_duration{endpoint:stats}":         ["p(95)<800"],
    "http_req_duration{endpoint:reviews_top}":   ["p(95)<400"],
  },
};

const cacheHits  = new Counter("cache_hits");
const cacheMisses = new Counter("cache_misses");
const searchTime  = new Trend("search_duration_ms");

const SEARCH_TERMS = ["toyota", "honda", "maruti", "hyundai", "ford", "bmw", "audi"];
const FUEL_TYPES   = ["petrol", "diesel", "electric", "hybrid"];
const PRICE_RANGES = [
  { min: 100000,  max: 500000  },
  { min: 500000,  max: 1000000 },
  { min: 1000000, max: 3000000 },
];

export default function () {
  group("car listing and pagination", () => {
    const page  = Math.floor(Math.random() * 5) + 1;
    const limit = [10, 20, 50][Math.floor(Math.random() * 3)];
    const res = get(`/api/v1/cars?page=${page}&limit=${limit}`, {}, { endpoint: "cars_list" });
    assertPublicRead(res, "GET /cars (paginated)");

    if (res.headers["X-Cache"] === "HIT") {
      cacheHits.add(1);
    } else {
      cacheMisses.add(1);
    }

    sleep(0.2);
  });

  group("featured cars", () => {
    const res = get("/api/v1/cars/featured?limit=10", {}, { endpoint: "cars_featured" });
    assertPublicRead(res, "GET /cars/featured");
    sleep(0.2);
  });

  group("car brands (heavily cached)", () => {
    const res = get("/api/v1/cars/brands", {}, { endpoint: "cars_brands" });
    assertPublicRead(res, "GET /cars/brands");
    sleep(0.1);
  });

  group("recently added cars (cached 60s)", () => {
    const limit = [5, 10, 15][Math.floor(Math.random() * 3)];
    const res = get(`/api/v1/cars/recent?limit=${limit}`, {}, { endpoint: "cars_recent" });
    assertPublicRead(res, "GET /cars/recent");
    sleep(0.2);
  });

  group("full-text and filter search", () => {
    const term  = SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
    const fuel  = Math.random() > 0.5 ? `&fuelType=${FUEL_TYPES[Math.floor(Math.random() * FUEL_TYPES.length)]}` : "";
    const range = PRICE_RANGES[Math.floor(Math.random() * PRICE_RANGES.length)];
    const res = get(
      `/api/v1/cars/search?search=${term}&minPrice=${range.min}&maxPrice=${range.max}${fuel}`,
      {},
      { endpoint: "cars_search" },
    );
    assertPublicRead(res, "GET /cars/search");
    searchTime.add(res.timings.duration);
    sleep(0.3);
  });

  group("location-based recommendations", () => {
    const cities = ["Kochi", "Mumbai", "Delhi", "Bangalore", "Chennai"];
    const city   = cities[Math.floor(Math.random() * cities.length)];
    const res = get(`/api/v1/cars/location-recommendations?city=${city}&limit=8`, {}, { endpoint: "location_recs" });
    assertPublicRead(res, "GET /cars/location-recommendations");
    sleep(0.2);
  });

  group("platform stats", () => {
    const res = get("/api/v1/stats", {}, { endpoint: "stats" });
    assertPublicRead(res, "GET /stats");
    sleep(0.2);
  });

  group("app reviews", () => {
    const top = get("/api/v1/reviews/app/top", {}, { endpoint: "reviews_top" });
    assertPublicRead(top, "GET /reviews/app/top");

    const all = get("/api/v1/reviews/app", {}, { endpoint: "reviews_all" });
    assertPublicRead(all, "GET /reviews/app");
    sleep(0.2);
  });

  group("subscription plans (public)", () => {
    const res = get("/api/v1/subscriptions/plans", {}, { endpoint: "sub_plans" });
    assertPublicRead(res, "GET /subscriptions/plans");
    sleep(0.2);
  });

  sleep(1);
}
