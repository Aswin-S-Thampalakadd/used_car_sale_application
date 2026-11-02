export const BASE_URL = __ENV.BASE_URL || "http://localhost:5000";

export const THRESHOLDS = {
  http_req_failed:   ["rate<0.01"],
  http_req_duration: ["p(95)<500", "p(99)<1000"],
};

export const THRESHOLDS_STRICT = {
  http_req_failed:   ["rate<0.005"],
  http_req_duration: ["p(50)<100", "p(95)<300", "p(99)<500"],
};

export const THRESHOLDS_STRESS = {
  http_req_failed:   ["rate<0.05"],
  http_req_duration: ["p(95)<2000"],
};

export const STAGES_SMOKE = [
  { duration: "30s", target: 1 },
];

export const STAGES_LOAD = [
  { duration: "30s", target: 10  },
  { duration: "1m",  target: 50  },
  { duration: "2m",  target: 100 },
  { duration: "1m",  target: 50  },
  { duration: "30s", target: 0   },
];

export const STAGES_STRESS = [
  { duration: "30s", target: 50   },
  { duration: "1m",  target: 200  },
  { duration: "2m",  target: 500  },
  { duration: "1m",  target: 200  },
  { duration: "30s", target: 0    },
];

export const STAGES_SPIKE = [
  { duration: "10s", target: 0   },
  { duration: "10s", target: 500 },
  { duration: "1m",  target: 500 },
  { duration: "10s", target: 0   },
];

export const STAGES_SOAK = [
  { duration: "1m",  target: 50  },
  { duration: "10m", target: 50  },
  { duration: "1m",  target: 0   },
];

export const CUSTOMER_CREDS = {
  email:    __ENV.CUSTOMER_EMAIL    || "loadtest.customer@example.com",
  password: __ENV.CUSTOMER_PASSWORD || "LoadTest@123",
};

export const DEALER_CREDS = {
  email:    __ENV.DEALER_EMAIL    || "loadtest.dealer@example.com",
  password: __ENV.DEALER_PASSWORD || "LoadTest@123",
};

export const ADMIN_CREDS = {
  email:    __ENV.ADMIN_EMAIL    || "admin@example.com",
  password: __ENV.ADMIN_PASSWORD || "Admin@123",
};
