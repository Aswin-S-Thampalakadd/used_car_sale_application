import { sleep, group } from "k6";
import { Counter, Rate, Trend } from "k6/metrics";
import { check } from "k6";
import {
  STAGES_STRESS,
  STAGES_SPIKE,
  STAGES_SOAK,
  THRESHOLDS_STRESS,
  CUSTOMER_CREDS,
  DEALER_CREDS,
} from "../config.js";
import { customerToken, dealerToken, authHeaders } from "../helpers/auth.js";
import { get, post, assertPublicRead, assertOk } from "../helpers/http.js";

const scenario = __ENV.SCENARIO || "stress";

function getOptions() {
  if (scenario === "spike") {
    return {
      stages: STAGES_SPIKE,
      thresholds: {
        ...THRESHOLDS_STRESS,
        http_req_duration: ["p(95)<3000"],
      },
    };
  }
  if (scenario === "soak") {
    return {
      stages: STAGES_SOAK,
      thresholds: {
        ...THRESHOLDS_STRESS,
        http_req_failed: ["rate<0.01"],
      },
    };
  }
  return {
    stages: STAGES_STRESS,
    thresholds: THRESHOLDS_STRESS,
  };
}

export const options = getOptions();

const errorRate       = new Rate("error_rate");
const degradedReqs    = new Counter("degraded_requests");
const p99             = new Trend("p99_response_ms");

let cToken, dToken;

export function setup() {
  cToken = customerToken(CUSTOMER_CREDS.email, CUSTOMER_CREDS.password);
  dToken = dealerToken(DEALER_CREDS.email,    DEALER_CREDS.password);
  return { cToken, dToken };
}

export default function (data) {
  const cHeaders = authHeaders(data.cToken);
  const dHeaders = authHeaders(data.dToken);

  // ── Highest-traffic endpoints under stress ────────────────────────────────
  group("high_traffic_reads", () => {
    const endpoints = [
      `/api/v1/cars?page=${Math.ceil(Math.random() * 5)}&limit=20`,
      "/api/v1/cars/featured?limit=10",
      "/api/v1/cars/brands",
      "/api/v1/cars/recent?limit=10",
      "/api/v1/stats",
      "/api/v1/reviews/app/top",
    ];

    const path = endpoints[Math.floor(Math.random() * endpoints.length)];
    const res  = get(path);

    const ok = check(res, {
      "stress read — 200":          (r) => r.status === 200,
      "stress read — duration <2s": (r) => r.timings.duration < 2000,
    });

    p99.add(res.timings.duration);
    errorRate.add(!ok);
    if (res.timings.duration > 1000) degradedReqs.add(1);

    sleep(0.1);
  });

  group("concurrent_searches", () => {
    const terms = ["toyota", "honda", "petrol", "automatic", "2022", "kochi"];
    const term  = terms[Math.floor(Math.random() * terms.length)];
    const res   = get(`/api/v1/cars/search?search=${term}&limit=10`);

    const ok = check(res, {
      "search under stress — 200":     (r) => r.status === 200,
      "search under stress — <3000ms": (r) => r.timings.duration < 3000,
    });

    errorRate.add(!ok);
    p99.add(res.timings.duration);
    sleep(0.2);
  });

  group("authenticated_read_storm", () => {
    if (!data.cToken) return;

    const authEndpoints = [
      { path: "/api/v1/users/me",             headers: cHeaders },
      { path: "/api/v1/favourites",           headers: cHeaders },
      { path: "/api/v1/enquiries/me",         headers: cHeaders },
      { path: "/api/v1/notifications/me",     headers: cHeaders },
      { path: "/api/v1/dealers/me/profile",   headers: dHeaders },
      { path: "/api/v1/dealers/me/cars",      headers: dHeaders },
      { path: "/api/v1/subscriptions/my-plan",headers: dHeaders },
    ];

    const ep  = authEndpoints[Math.floor(Math.random() * authEndpoints.length)];
    const res = get(ep.path, ep.headers);

    const ok = check(res, {
      "auth stress read — 2xx":     (r) => r.status >= 200 && r.status < 300,
      "auth stress read — <2000ms": (r) => r.timings.duration < 2000,
    });

    errorRate.add(!ok);
    p99.add(res.timings.duration);
    sleep(0.1);
  });

  group("newsletter_subscribe_burst", () => {
    const ts  = `${Date.now()}_${__VU}_${__ITER}`;
    const res = post(
      "/api/v1/newsletter/subscribe",
      { email: `loadtest_${ts}@example.com`, name: `LoadTest VU ${__VU}` },
    );

    check(res, {
      "newsletter sub — 2xx or 409": (r) => r.status === 200 || r.status === 409,
    });

    sleep(0.3);
  });

  group("health_under_stress", () => {
    const res = get("/health");
    const ok  = check(res, {
      "health — 200":        (r) => r.status === 200,
      "health — <200ms":     (r) => r.timings.duration < 200,
    });
    errorRate.add(!ok);
    sleep(0.1);
  });

  sleep(0.5);
}
