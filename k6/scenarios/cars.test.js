import { sleep, group } from "k6";
import { Counter, Trend } from "k6/metrics";
import { check } from "k6";
import { STAGES_LOAD, THRESHOLDS, DEALER_CREDS } from "../config.js";
import { dealerToken, authHeaders } from "../helpers/auth.js";
import { get, post, put, patch, del, assertOk, assertPublicRead, assertStatus } from "../helpers/http.js";

export const options = {
  stages: STAGES_LOAD,
  thresholds: {
    ...THRESHOLDS,
    "http_req_duration{endpoint:cars_list}":    ["p(95)<500"],
    "http_req_duration{endpoint:cars_get_one}": ["p(95)<400"],
    "http_req_duration{endpoint:cars_search}":  ["p(95)<700"],
    "http_req_duration{endpoint:cars_create}":  ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

const carsCreated  = new Counter("cars_created");
const carsUpdated  = new Counter("cars_updated");
const carsDeleted  = new Counter("cars_deleted");
const cacheHitRate = new Trend("cars_response_ms");

const MAKES  = ["Toyota", "Honda", "Maruti", "Hyundai", "Ford", "Tata", "Mahindra", "Kia"];
const MODELS = ["Corolla", "City", "Swift", "Creta", "EcoSport", "Nexon", "Scorpio", "Seltos"];
const FUELS  = ["petrol", "diesel", "electric", "hybrid"];
const TRANS  = ["manual", "automatic"];

function randomCar(vuId, iteration) {
  return {
    make:             MAKES[Math.floor(Math.random() * MAKES.length)],
    model:            MODELS[Math.floor(Math.random() * MODELS.length)],
    year:             2018 + Math.floor(Math.random() * 6),
    fuelType:         FUELS[Math.floor(Math.random() * FUELS.length)],
    transmission:     TRANS[Math.floor(Math.random() * TRANS.length)],
    kilometersDriven: Math.floor(Math.random() * 100000),
    price:            Math.floor(Math.random() * 2000000) + 200000,
    color:            "white",
    description:      `Load test car — VU ${vuId} iteration ${iteration}`,
    isNegotiable:     true,
    status:           "draft",
  };
}

let dToken;

export function setup() {
  dToken = dealerToken(DEALER_CREDS.email, DEALER_CREDS.password);
  return { dToken };
}

export default function (data) {
  const dHeaders = authHeaders(data.dToken);

  group("public car reads (high traffic)", () => {
    const listRes = get(
      `/api/v1/cars?page=1&limit=20&status=active`,
      {},
      { endpoint: "cars_list" },
    );
    assertPublicRead(listRes, "GET /cars");
    cacheHitRate.add(listRes.timings.duration);

    sleep(0.2);

    const featuredRes = get("/api/v1/cars/featured?limit=8", {}, { endpoint: "cars_featured" });
    assertPublicRead(featuredRes, "GET /cars/featured");

    sleep(0.1);

    const brandsRes = get("/api/v1/cars/brands", {}, { endpoint: "cars_brands" });
    assertPublicRead(brandsRes, "GET /cars/brands");

    sleep(0.1);

    const recentRes = get("/api/v1/cars/recent?limit=6", {}, { endpoint: "cars_recent" });
    assertPublicRead(recentRes, "GET /cars/recent");

    sleep(0.2);
  });

  group("search and filter", () => {
    const make  = MAKES[Math.floor(Math.random() * MAKES.length)];
    const fuel  = FUELS[Math.floor(Math.random() * FUELS.length)];

    const searchRes = get(
      `/api/v1/cars/search?search=${make}&fuelType=${fuel}&minPrice=200000&maxPrice=2000000&page=1&limit=10`,
      {},
      { endpoint: "cars_search" },
    );
    assertPublicRead(searchRes, "GET /cars/search");

    sleep(0.3);
  });

  group("individual car detail", () => {
    const listRes = get("/api/v1/cars?limit=5&status=active");
    if (listRes.status === 200) {
      try {
        const body = listRes.json();
        const cars = body.cars || body;
        if (Array.isArray(cars) && cars.length > 0) {
          const car  = cars[Math.floor(Math.random() * cars.length)];
          const slug = `${car.make}-${car.model}-${car.id}`.toLowerCase().replace(/\s+/g, "-");
          const res  = get(`/api/v1/cars/${slug}`, {}, { endpoint: "cars_get_one" });
          assertOk(res, `GET /cars/${slug}`);
        }
      } catch {}
    }
    sleep(0.2);
  });

  group("dealer car management", () => {
    if (!data.dToken) return;

    const createRes = post(
      "/api/v1/cars",
      randomCar(__VU, __ITER),
      dHeaders,
      { endpoint: "cars_create" },
    );

    check(createRes, {
      "car create — 201":    (r) => r.status === 201,
      "car create — has id": (r) => {
        try { return Number.isInteger(r.json().car?.id); } catch { return false; }
      },
    });

    if (createRes.status === 201) {
      carsCreated.add(1);
      const carId = createRes.json().car.id;

      sleep(0.3);

      const updateRes = put(
        `/api/v1/cars/${carId}`,
        { description: "Updated by load test", price: 750000 },
        dHeaders,
        { endpoint: "cars_update" },
      );
      check(updateRes, { "car update — 200": (r) => r.status === 200 });
      if (updateRes.status === 200) carsUpdated.add(1);

      sleep(0.2);

      const statusRes = patch(
        `/api/v1/cars/${carId}/status`,
        { status: "active" },
        dHeaders,
        { endpoint: "cars_status" },
      );
      check(statusRes, { "car status update — 200": (r) => r.status === 200 });

      sleep(0.2);

      const deleteRes = del(`/api/v1/cars/${carId}`, dHeaders, { endpoint: "cars_delete" });
      check(deleteRes, { "car delete — 200": (r) => r.status === 200 });
      if (deleteRes.status === 200) carsDeleted.add(1);
    }

    sleep(0.5);
  });

  sleep(1);
}
