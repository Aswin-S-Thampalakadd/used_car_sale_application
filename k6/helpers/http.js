import http   from "k6/http";
import { check } from "k6";
import { BASE_URL } from "../config.js";

export function get(path, headers = {}, tags = {}) {
  return http.get(`${BASE_URL}${path}`, { headers, tags });
}

export function post(path, body, headers = {}, tags = {}) {
  return http.post(
    `${BASE_URL}${path}`,
    JSON.stringify(body),
    { headers: { "Content-Type": "application/json", ...headers }, tags },
  );
}

export function put(path, body, headers = {}, tags = {}) {
  return http.put(
    `${BASE_URL}${path}`,
    JSON.stringify(body),
    { headers: { "Content-Type": "application/json", ...headers }, tags },
  );
}

export function patch(path, body, headers = {}, tags = {}) {
  return http.patch(
    `${BASE_URL}${path}`,
    JSON.stringify(body),
    { headers: { "Content-Type": "application/json", ...headers }, tags },
  );
}

export function del(path, headers = {}, tags = {}) {
  return http.del(`${BASE_URL}${path}`, null, { headers, tags });
}

export function assertStatus(res, expectedStatus, label) {
  check(res, {
    [`${label} — status ${expectedStatus}`]: (r) => r.status === expectedStatus,
  });
}

export function assertOk(res, label) {
  check(res, {
    [`${label} — status 2xx`]:        (r) => r.status >= 200 && r.status < 300,
    [`${label} — response is JSON`]:   (r) => {
      try { r.json(); return true; } catch { return false; }
    },
    [`${label} — duration < 1000ms`]: (r) => r.timings.duration < 1000,
  });
}

export function assertPublicRead(res, label) {
  check(res, {
    [`${label} — status 200`]:         (r) => r.status === 200,
    [`${label} — has body`]:           (r) => r.body && r.body.length > 0,
    [`${label} — duration < 500ms`]:   (r) => r.timings.duration < 500,
  });
}
