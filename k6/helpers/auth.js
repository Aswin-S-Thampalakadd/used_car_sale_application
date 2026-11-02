import http from "k6/http";
import { BASE_URL } from "../config.js";

const TOKEN_CACHE = {};

function login(email, password, path) {
  const cacheKey = `${path}::${email}`;
  if (TOKEN_CACHE[cacheKey]) {
    return TOKEN_CACHE[cacheKey];
  }

  const res = http.post(
    `${BASE_URL}/api/v1/auth/${path}/login`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" } },
  );

  if (res.status !== 200) {
    console.error(`Login failed [${path}] ${email} — status ${res.status}: ${res.body}`);
    return null;
  }

  const body = res.json();
  TOKEN_CACHE[cacheKey] = body.accessToken;
  return body.accessToken;
}

export function customerToken(email, password) {
  return login(email, password, "customer");
}

export function dealerToken(email, password) {
  return login(email, password, "dealer");
}

export function adminToken(email, password) {
  const cacheKey = `admin::${email}`;
  if (TOKEN_CACHE[cacheKey]) {
    return TOKEN_CACHE[cacheKey];
  }

  const res = http.post(
    `${BASE_URL}/api/v1/admin/login`,
    JSON.stringify({ email, password }),
    { headers: { "Content-Type": "application/json" } },
  );

  if (res.status !== 200) {
    console.error(`Admin login failed — status ${res.status}: ${res.body}`);
    return null;
  }

  const body = res.json();
  TOKEN_CACHE[cacheKey] = body.accessToken;
  return body.accessToken;
}

export function authHeaders(token) {
  return {
    "Content-Type":  "application/json",
    "Authorization": `Bearer ${token}`,
  };
}

export function jsonHeaders() {
  return { "Content-Type": "application/json" };
}
