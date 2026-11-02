const ONE_HOUR = 3600;
const ONE_MIN = 60;
const FIVE_MINS = 300;

const CACHE_RULES = [
  { pattern: /^\/api\/v1\/cars\/brands$/, maxAge: ONE_HOUR, swr: ONE_HOUR },
  { pattern: /^\/api\/v1\/cars\/featured/, maxAge: FIVE_MINS, swr: FIVE_MINS },
  { pattern: /^\/api\/v1\/cars\/recent/, maxAge: ONE_MIN, swr: ONE_MIN },
  { pattern: /^\/api\/v1\/cars\/search/, maxAge: ONE_MIN, swr: ONE_MIN },
  {
    pattern: /^\/api\/v1\/cars\/location-recommendations/,
    maxAge: ONE_MIN,
    swr: ONE_MIN,
  },
  { pattern: /^\/api\/v1\/cars(\?|$)/, maxAge: ONE_MIN, swr: ONE_MIN },
  { pattern: /^\/api\/v1\/cars\/[^/]+$/, maxAge: ONE_MIN, swr: ONE_MIN },
  { pattern: /^\/api\/v1\/stats$/, maxAge: FIVE_MINS, swr: FIVE_MINS },
  { pattern: /^\/api\/v1\/reviews\/app/, maxAge: FIVE_MINS, swr: FIVE_MINS },
  { pattern: /^\/api\/v1\/reviews\/car\//, maxAge: ONE_MIN, swr: ONE_MIN },
  { pattern: /^\/api\/v1\/dealers\/\d+$/, maxAge: FIVE_MINS, swr: FIVE_MINS },
  {
    pattern: /^\/api\/v1\/subscriptions\/plans$/,
    maxAge: ONE_HOUR,
    swr: ONE_HOUR,
  },
];

export const publicCacheHeaders = (req, res, next) => {
  if (req.method !== "GET") return next();

  for (const rule of CACHE_RULES) {
    if (rule.pattern.test(req.path)) {
      res.set(
        "Cache-Control",
        `public, max-age=${rule.maxAge}, stale-while-revalidate=${rule.swr}`,
      );
      return next();
    }
  }

  next();
};

export const noCacheHeaders = (_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
};
