import { sleep } from "k6";
import { STAGES_SMOKE, THRESHOLDS, CUSTOMER_CREDS, DEALER_CREDS, ADMIN_CREDS } from "../config.js";
import { customerToken, dealerToken, adminToken, authHeaders } from "../helpers/auth.js";
import { get, post, assertOk, assertPublicRead, assertStatus } from "../helpers/http.js";

export const options = {
  stages: STAGES_SMOKE,
  thresholds: {
    ...THRESHOLDS,
    http_req_failed:   ["rate<0.01"],
    http_req_duration: ["p(95)<2000"],
  },
};

let cToken, dToken, aToken;

export function setup() {
  cToken = customerToken(CUSTOMER_CREDS.email, CUSTOMER_CREDS.password);
  dToken = dealerToken(DEALER_CREDS.email,    DEALER_CREDS.password);
  aToken = adminToken(ADMIN_CREDS.email,      ADMIN_CREDS.password);
  return { cToken, dToken, aToken };
}

export default function (data) {
  const cHeaders = authHeaders(data.cToken);
  const dHeaders = authHeaders(data.dToken);
  const aHeaders = authHeaders(data.aToken);

  // ── Public endpoints ──────────────────────────────────────────────────────
  assertPublicRead(get("/api/v1/cars"),              "GET /cars");
  assertPublicRead(get("/api/v1/cars/featured"),     "GET /cars/featured");
  assertPublicRead(get("/api/v1/cars/brands"),       "GET /cars/brands");
  assertPublicRead(get("/api/v1/cars/recent"),       "GET /cars/recent");
  assertPublicRead(get("/api/v1/cars/search?search=toyota"), "GET /cars/search");
  assertPublicRead(get("/api/v1/stats"),             "GET /stats");
  assertPublicRead(get("/api/v1/reviews/app/top"),   "GET /reviews/app/top");
  assertPublicRead(get("/api/v1/reviews/app"),       "GET /reviews/app");
  assertPublicRead(get("/api/v1/subscriptions/plans"), "GET /subscriptions/plans");

  sleep(0.3);

  // ── Health check ──────────────────────────────────────────────────────────
  assertStatus(get("/health"), 200, "GET /health");

  sleep(0.3);

  // ── Authenticated — customer ───────────────────────────────────────────────
  if (data.cToken) {
    assertOk(get("/api/v1/users/me",           cHeaders), "GET /users/me");
    assertOk(get("/api/v1/favourites",         cHeaders), "GET /favourites");
    assertOk(get("/api/v1/enquiries/me",       cHeaders), "GET /enquiries/me");
    assertOk(get("/api/v1/notifications/me",   cHeaders), "GET /notifications/me");
  }

  sleep(0.3);

  // ── Authenticated — dealer ─────────────────────────────────────────────────
  if (data.dToken) {
    assertOk(get("/api/v1/dealers/me/profile", dHeaders), "GET /dealers/me/profile");
    assertOk(get("/api/v1/dealers/me/cars",    dHeaders), "GET /dealers/me/cars");
    assertOk(get("/api/v1/subscriptions/my-plan", dHeaders), "GET /subscriptions/my-plan");
  }

  sleep(0.3);

  // ── Authenticated — admin ──────────────────────────────────────────────────
  if (data.aToken) {
    assertOk(get("/api/v1/admin/dashboard/stats", aHeaders), "GET /admin/dashboard/stats");
    assertOk(get("/api/v1/admin/dealers",         aHeaders), "GET /admin/dealers");
    assertOk(get("/api/v1/admin/customers",       aHeaders), "GET /admin/customers");
  }

  sleep(1);
}
