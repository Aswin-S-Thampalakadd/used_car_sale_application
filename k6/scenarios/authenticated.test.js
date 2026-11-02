import { sleep, group } from "k6";
import { Counter } from "k6/metrics";
import { check } from "k6";
import { STAGES_LOAD, THRESHOLDS, CUSTOMER_CREDS, DEALER_CREDS } from "../config.js";
import { customerToken, dealerToken, authHeaders } from "../helpers/auth.js";
import { get, post, patch, del, assertOk, assertStatus } from "../helpers/http.js";

export const options = {
  stages: STAGES_LOAD,
  thresholds: {
    ...THRESHOLDS,
    "http_req_duration{group:::enquiries}":     ["p(95)<600"],
    "http_req_duration{group:::favourites}":    ["p(95)<500"],
    "http_req_duration{group:::reviews}":       ["p(95)<600"],
    "http_req_duration{group:::notifications}": ["p(95)<500"],
    "http_req_duration{group:::dealer_profile}":["p(95)<500"],
    http_req_failed: ["rate<0.01"],
  },
};

const enquiriesSent     = new Counter("enquiries_sent");
const favAdded          = new Counter("favourites_added");
const reviewsSubmitted  = new Counter("reviews_submitted");
const notifMarkedRead   = new Counter("notifications_marked_read");

let cToken, dToken;

export function setup() {
  cToken = customerToken(CUSTOMER_CREDS.email, CUSTOMER_CREDS.password);
  dToken = dealerToken(DEALER_CREDS.email,    DEALER_CREDS.password);
  return { cToken, dToken };
}

function pickActiveCar() {
  const res = get("/api/v1/cars?status=active&limit=20");
  if (res.status !== 200) return null;
  try {
    const body = res.json();
    const cars = Array.isArray(body) ? body : body.cars;
    if (!cars || cars.length === 0) return null;
    return cars[Math.floor(Math.random() * cars.length)];
  } catch {
    return null;
  }
}

export default function (data) {
  const cHeaders = authHeaders(data.cToken);
  const dHeaders = authHeaders(data.dToken);

  // ── Customer journey ───────────────────────────────────────────────────────
  group("favourites", () => {
    if (!data.cToken) return;

    const listRes = get("/api/v1/favourites", cHeaders);
    assertOk(listRes, "GET /favourites");

    const car = pickActiveCar();
    if (car) {
      const addRes = post(`/api/v1/favourites/${car.id}`, {}, cHeaders);
      check(addRes, { "add favourite — 2xx": (r) => r.status === 201 || r.status === 200 });
      if (addRes.status === 201) favAdded.add(1);

      sleep(0.2);

      const checkRes = get(`/api/v1/favourites/${car.id}/check`, cHeaders);
      check(checkRes, {
        "favourite check — 200":         (r) => r.status === 200,
        "favourite check — isFavourite": (r) => {
          try { return typeof r.json().isFavourite === "boolean"; } catch { return false; }
        },
      });

      sleep(0.2);

      const removeRes = del(`/api/v1/favourites/${car.id}`, cHeaders);
      check(removeRes, { "remove favourite — 200": (r) => r.status === 200 });
    }

    sleep(0.5);
  });

  group("enquiries", () => {
    if (!data.cToken) return;

    const meRes = get("/api/v1/enquiries/me", cHeaders);
    assertOk(meRes, "GET /enquiries/me");

    const car = pickActiveCar();
    if (car) {
      const createRes = post(
        "/api/v1/enquiries",
        { carId: car.id, message: `Load test enquiry from VU ${__VU}` },
        cHeaders,
      );
      check(createRes, { "create enquiry — 201": (r) => r.status === 201 });
      if (createRes.status === 201) enquiriesSent.add(1);
    }

    sleep(0.5);
  });

  group("reviews", () => {
    if (!data.cToken) return;

    get("/api/v1/reviews/app/top");
    get("/api/v1/reviews/app");

    const car = pickActiveCar();
    if (car) {
      const carReviews = get(`/api/v1/reviews/car/${car.id}`);
      assertOk(carReviews, `GET /reviews/car/${car.id}`);
    }

    const appReview = post(
      "/api/v1/reviews/app",
      { rating: Math.floor(Math.random() * 3) + 3, comment: `Load test review from VU ${__VU}` },
      cHeaders,
    );
    if (appReview.status === 201) reviewsSubmitted.add(1);

    sleep(0.5);
  });

  group("notifications", () => {
    if (!data.cToken) return;

    const listRes = get("/api/v1/notifications/me", cHeaders);
    assertOk(listRes, "GET /notifications/me");

    sleep(0.2);

    const patchAllRes = patch("/api/v1/notifications/read-all", {}, cHeaders);
    check(patchAllRes, { "mark all read — 200": (r) => r.status === 200 });
    if (patchAllRes.status === 200) notifMarkedRead.add(1);

    sleep(0.5);
  });

  // ── Dealer journey ─────────────────────────────────────────────────────────
  group("dealer_profile", () => {
    if (!data.dToken) return;

    const profileRes = get("/api/v1/dealers/me/profile", dHeaders);
    assertOk(profileRes, "GET /dealers/me/profile");

    sleep(0.2);

    const carsRes = get("/api/v1/dealers/me/cars", dHeaders);
    assertOk(carsRes, "GET /dealers/me/cars");

    sleep(0.2);

    const planRes = get("/api/v1/subscriptions/my-plan", dHeaders);
    assertOk(planRes, "GET /subscriptions/my-plan");

    sleep(0.2);

    const histRes = get("/api/v1/subscriptions/history", dHeaders);
    assertOk(histRes, "GET /subscriptions/history");

    sleep(0.5);
  });

  group("dealer_notifications", () => {
    if (!data.dToken) return;

    const notifRes = get("/api/v1/notifications/me", dHeaders);
    assertOk(notifRes, "GET /notifications/me (dealer)");

    sleep(0.5);
  });

  // ── User profile ───────────────────────────────────────────────────────────
  group("user_profile", () => {
    if (!data.cToken) return;

    const meRes = get("/api/v1/users/me", cHeaders);
    assertOk(meRes, "GET /users/me");

    sleep(0.5);
  });

  sleep(1);
}
