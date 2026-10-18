const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/v1";

const getAccessToken = () => localStorage.getItem("accessToken");
const getRefreshToken = () => localStorage.getItem("refreshToken");

const setTokens = (accessToken, refreshToken) => {
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
};

const clearTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

async function apiFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = { "Content-Type": "application/json", ...options.headers };

  const accessToken = getAccessToken();
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let response = await fetch(url, { ...options, headers });

  // Auto-refresh on 401
  if (response.status === 401 && getRefreshToken()) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        headers["Authorization"] = `Bearer ${token}`;
        return fetch(url, { ...options, headers });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: getRefreshToken() }),
      });

      if (!refreshResponse.ok) throw new Error("Refresh failed");

      const data = await refreshResponse.json();
      setTokens(data.accessToken, null);
      processQueue(null, data.accessToken);
      isRefreshing = false;

      headers["Authorization"] = `Bearer ${data.accessToken}`;
      response = await fetch(url, { ...options, headers });
    } catch (err) {
      processQueue(err, null);
      isRefreshing = false;
      clearTokens();
      window.dispatchEvent(new Event("auth:logout"));
      throw err;
    }
  }

  return response;
}

// ── Auth ────────────────────────────────────────────────────────────────────
export const authAPI = {
  customerSignup: (data) =>
    apiFetch("/auth/customer/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  customerLogin: (data) =>
    apiFetch("/auth/customer/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  dealerSignup: (data) =>
    apiFetch("/auth/dealer/signup", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  dealerLogin: (data) =>
    apiFetch("/auth/dealer/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: (refreshToken) =>
    apiFetch("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
};

// ── Cars ────────────────────────────────────────────────────────────────────
export const carsAPI = {
  getAll: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/cars${qs ? `?${qs}` : ""}`);
  },

  getById: (id) => apiFetch(`/cars/${id}`),

  getFeatured: (limit = 10) => apiFetch(`/cars/featured?limit=${limit}`),

  getRecent: (limit = 10) => apiFetch(`/cars/recent?limit=${limit}`),

  search: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/cars/search?${qs}`);
  },

  create: (data) =>
    apiFetch("/cars", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/cars/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id) => apiFetch(`/cars/${id}`, { method: "DELETE" }),

  updateStatus: (id, status) =>
    apiFetch(`/cars/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  addImages: (carId, images) =>
    apiFetch(`/cars/${carId}/images`, {
      method: "POST",
      body: JSON.stringify({ images }),
    }),

  deleteImage: (carId, imageId) =>
    apiFetch(`/cars/${carId}/images/${imageId}`, { method: "DELETE" }),
};

// ── Enquiries ───────────────────────────────────────────────────────────────
export const enquiriesAPI = {
  create: (data) =>
    apiFetch("/enquiries", { method: "POST", body: JSON.stringify(data) }),

  getMine: () => apiFetch("/enquiries/me"),

  updateStatus: (id, status) =>
    apiFetch(`/enquiries/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  delete: (id) => apiFetch(`/enquiries/${id}`, { method: "DELETE" }),
};

// ── Favourites ──────────────────────────────────────────────────────────────
export const favouritesAPI = {
  getMine: () => apiFetch("/favourites"),

  add: (carId) => apiFetch(`/favourites/${carId}`, { method: "POST" }),

  remove: (carId) => apiFetch(`/favourites/${carId}`, { method: "DELETE" }),

  check: (carId) => apiFetch(`/favourites/${carId}/check`),
};

// ── Reviews ─────────────────────────────────────────────────────────────────
export const reviewsAPI = {
  // ── Car reviews (public + customer) ─────────────────────────────────────
  getByCar: (carId) => apiFetch(`/reviews/car/${carId}`),

  create: (data) =>
    apiFetch("/reviews", { method: "POST", body: JSON.stringify(data) }),

  update: (id, data) =>
    apiFetch(`/reviews/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id) => apiFetch(`/reviews/${id}`, { method: "DELETE" }),

  // ── App reviews (platform reviews shown in Testimonials) ─────────────────
  getTopAppReviews: () => apiFetch("/reviews/app/top"),

  getAllAppReviews: () => apiFetch("/reviews/app"),

  createAppReview: (data) =>
    apiFetch("/reviews/app", { method: "POST", body: JSON.stringify(data) }),

  // ── Dealer dashboard review management ───────────────────────────────────
  getDealerReviews: () => apiFetch("/reviews/dealer/mine"),

  replyToReview: (id, replyText) =>
    apiFetch(`/reviews/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ replyText }),
    }),

  dealerDeleteReview: (id) =>
    apiFetch(`/reviews/${id}/dealer`, { method: "DELETE" }),
};

// ── Dealers ─────────────────────────────────────────────────────────────────
export const dealersAPI = {
  getPublicProfile: (id) => apiFetch(`/dealers/${id}`),

  getMyProfile: () => apiFetch("/dealers/me/profile"),

  updateMyProfile: (data) =>
    apiFetch("/dealers/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  getMyCars: (status) =>
    apiFetch(`/dealers/me/cars${status ? `?status=${status}` : ""}`),
};

// ── Users ────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getMyProfile: () => apiFetch("/users/me"),

  updateMyProfile: (data) =>
    apiFetch("/users/me", { method: "PUT", body: JSON.stringify(data) }),
};

// ── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptionsAPI = {
  // Public: get all available plans
  getPlans: () => apiFetch("/subscriptions/plans"),

  // Dealer's current active plan
  getMyPlan: () => apiFetch("/subscriptions/my-plan"),

  // Subscription history
  getHistory: () => apiFetch("/subscriptions/history"),

  // Check if dealer has hit their car limit
  checkLimit: (currentCarCount) =>
    apiFetch(`/subscriptions/check-limit?currentCarCount=${currentCarCount}`),

  // Create a Razorpay order for a plan upgrade
  createOrder: (planType) =>
    apiFetch("/subscriptions/create-order", {
      method: "POST",
      body: JSON.stringify({ planType }),
    }),

  // Verify payment after Razorpay checkout completes
  verifyPayment: (razorpay_order_id, razorpay_payment_id, razorpay_signature) =>
    apiFetch("/subscriptions/verify-payment", {
      method: "POST",
      body: JSON.stringify({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }),
    }),
};

// ── Stats ─────────────────────────────────────────────────────────────────────
export const statsAPI = {
  /** GET /stats — live platform counts, public */
  getPlatformStats: () => apiFetch("/stats"),
};

// ── Uploads ──────────────────────────────────────────────────────────────────
export const uploadsAPI = {
  /**
   * Upload a single image file to Cloudinary via the backend.
   * @param {File} file - the File object from an <input type="file">
   * @returns fetch Response — body: { success, imageUrl, publicId }
   */
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append("image", file);

    const accessToken = getAccessToken();
    return fetch(`${BASE_URL}/uploads/image`, {
      method: "POST",
      headers: {
        // Do NOT set Content-Type — browser sets it with the multipart boundary
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      body: formData,
    });
  },

  /**
   * Delete an image from Cloudinary by its publicId.
   * @param {string} publicId - returned from uploadImage
   */
  deleteImage: (publicId) =>
    apiFetch("/uploads/image", {
      method: "DELETE",
      body: JSON.stringify({ publicId }),
    }),
};

export { setTokens, clearTokens, getAccessToken, getRefreshToken };

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminAPI = {
  // Auth
  login: (data) =>
    apiFetch("/admin/login", { method: "POST", body: JSON.stringify(data) }),

  // Dashboard
  getDashboardStats: () => apiFetch("/admin/dashboard/stats"),

  // Dealers
  getDealers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/dealers${qs ? `?${qs}` : ""}`);
  },
  verifyDealer: (dealerProfileId, isVerified) =>
    apiFetch(`/admin/dealers/${dealerProfileId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ isVerified }),
    }),
  activateDealer: (userId) =>
    apiFetch(`/admin/dealers/${userId}/activate`, { method: "PATCH" }),
  deactivateDealer: (userId) =>
    apiFetch(`/admin/dealers/${userId}/deactivate`, { method: "PATCH" }),
  deleteDealer: (userId) =>
    apiFetch(`/admin/dealers/${userId}`, { method: "DELETE" }),

  // Customers
  getCustomers: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/customers${qs ? `?${qs}` : ""}`);
  },
  activateCustomer: (userId) =>
    apiFetch(`/admin/customers/${userId}/activate`, { method: "PATCH" }),
  deactivateCustomer: (userId) =>
    apiFetch(`/admin/customers/${userId}/deactivate`, { method: "PATCH" }),
  deleteCustomer: (userId) =>
    apiFetch(`/admin/customers/${userId}`, { method: "DELETE" }),

  // Cars
  getCars: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/cars${qs ? `?${qs}` : ""}`);
  },
  updateCarStatus: (carId, status) =>
    apiFetch(`/admin/cars/${carId}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  toggleCarFeatured: (carId, isFeatured) =>
    apiFetch(`/admin/cars/${carId}/featured`, {
      method: "PATCH",
      body: JSON.stringify({ isFeatured }),
    }),
  deleteCar: (carId) =>
    apiFetch(`/admin/cars/${carId}`, { method: "DELETE" }),

  // Enquiries
  getEnquiries: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/enquiries${qs ? `?${qs}` : ""}`);
  },

  // Reviews
  getReviews: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/reviews${qs ? `?${qs}` : ""}`);
  },
  deleteReview: (reviewId) =>
    apiFetch(`/admin/reviews/${reviewId}`, { method: "DELETE" }),

  approveReview: (reviewId, isApproved) =>
    apiFetch(`/admin/reviews/${reviewId}/approve`, {
      method: "PATCH",
      body: JSON.stringify({ isApproved }),
    }),

  // Subscriptions
  getSubscriptions: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/admin/subscriptions${qs ? `?${qs}` : ""}`);
  },
};
