import { sleep, group } from "k6";
import { Counter } from "k6/metrics";
import { check } from "k6";
import { THRESHOLDS, STAGES_LOAD } from "../config.js";
import { post, get, assertOk, assertStatus } from "../helpers/http.js";

export const options = {
  stages: STAGES_LOAD,
  thresholds: {
    ...THRESHOLDS,
    "http_req_duration{endpoint:customer_login}": ["p(95)<600"],
    "http_req_duration{endpoint:dealer_login}":   ["p(95)<600"],
    "http_req_duration{endpoint:token_refresh}":  ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

const loginSuccess  = new Counter("auth_login_success");
const loginFailure  = new Counter("auth_login_failure");
const signupSuccess = new Counter("auth_signup_success");

let vu_id;

export default function () {
  vu_id = __VU;
  const ts = Date.now();

  group("customer login flow", () => {
    const loginRes = post(
      "/api/v1/auth/customer/login",
      { email: "loadtest.customer@example.com", password: "LoadTest@123" },
      {},
      { endpoint: "customer_login" },
    );

    const ok = check(loginRes, {
      "customer login — 200":        (r) => r.status === 200,
      "customer login — accessToken": (r) => {
        try { return Boolean(r.json().accessToken); } catch { return false; }
      },
    });

    if (ok) {
      loginSuccess.add(1);
      const token = loginRes.json().accessToken;

      sleep(0.2);

      const profileRes = get(
        "/api/v1/users/me",
        { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        { endpoint: "user_profile" },
      );
      assertOk(profileRes, "GET /users/me after login");
    } else {
      loginFailure.add(1);
    }

    sleep(0.5);
  });

  group("dealer login flow", () => {
    const loginRes = post(
      "/api/v1/auth/dealer/login",
      { email: "loadtest.dealer@example.com", password: "LoadTest@123" },
      {},
      { endpoint: "dealer_login" },
    );

    check(loginRes, {
      "dealer login — 200":         (r) => r.status === 200,
      "dealer login — accessToken": (r) => {
        try { return Boolean(r.json().accessToken); } catch { return false; }
      },
    });

    sleep(0.5);
  });

  group("token refresh", () => {
    const loginRes = post(
      "/api/v1/auth/customer/login",
      { email: "loadtest.customer@example.com", password: "LoadTest@123" },
    );

    if (loginRes.status === 200) {
      const refreshToken = loginRes.json().refreshToken;
      sleep(0.1);

      const refreshRes = post(
        "/api/v1/auth/refresh",
        { refreshToken },
        {},
        { endpoint: "token_refresh" },
      );

      check(refreshRes, {
        "refresh — 200":        (r) => r.status === 200,
        "refresh — accessToken": (r) => {
          try { return Boolean(r.json().accessToken); } catch { return false; }
        },
      });

      sleep(0.2);

      const logoutRes = post(
        "/api/v1/auth/logout",
        { refreshToken },
        {},
        { endpoint: "logout" },
      );
      assertOk(logoutRes, "POST /auth/logout");
    }

    sleep(0.5);
  });

  group("400 validation paths", () => {
    const noEmail = post("/api/v1/auth/customer/login", { password: "pass" });
    assertStatus(noEmail, 400, "login missing email — 400");

    const noPass = post("/api/v1/auth/customer/login", { email: "x@x.com" });
    assertStatus(noPass, 400, "login missing password — 400");

    const badCreds = post(
      "/api/v1/auth/customer/login",
      { email: `nonexistent_${ts}@x.com`, password: "wrongpass" },
    );
    assertStatus(badCreds, 401, "login bad creds — 401");

    sleep(0.5);
  });

  sleep(1);
}
