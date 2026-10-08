import React, { useEffect, useState } from "react";
import { subscriptionsAPI } from "../../api/api";
import "./SubscriptionModal.css";

const PLAN_META = {
  free: {
    label: "Free",
    color: "#6b7280",
    accent: "#f3f4f6",
    badge: null,
    features: [
      "Up to 5 car listings",
      "Basic listing details",
      "Customer enquiries",
    ],
  },
  elite: {
    label: "Elite",
    color: "#2563eb",
    accent: "#eff6ff",
    badge: "Popular",
    features: [
      "Up to 20 car listings",
      "Priority listing placement",
      "Customer enquiries",
      "Analytics dashboard",
    ],
  },
  pro: {
    label: "Pro",
    color: "#7c3aed",
    accent: "#f5f3ff",
    badge: "Best Value",
    features: [
      "Up to 100 car listings",
      "Top listing placement",
      "Customer enquiries",
      "Advanced analytics",
      "Featured listings",
      "Dedicated support",
    ],
  },
};

// Load Razorpay checkout script once
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const SubscriptionModal = ({ onClose, onSuccess, currentPlan = "free" }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await subscriptionsAPI.getPlans();
        const data = await res.json();
        if (data.success) setPlans(data.plans);
      } catch {
        setError("Failed to load plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  const handleUpgrade = async (planType) => {
    if (planType === "free") return;
    setError("");
    setProcessingPlan(planType);

    try {
      // 1. Load Razorpay SDK
      const sdkLoaded = await loadRazorpay();
      if (!sdkLoaded) {
        setError("Failed to load payment gateway. Please check your connection.");
        return;
      }

      // 2. Create order on backend
      const orderRes = await subscriptionsAPI.createOrder(planType);
      const orderData = await orderRes.json();

      if (!orderRes.ok || !orderData.success) {
        throw new Error(orderData.message || "Failed to create order");
      }

      const { orderId, amount, currency } = orderData.order;

      // 3. Open Razorpay checkout
      await new Promise((resolve, reject) => {
        const options = {
          key: process.env.REACT_APP_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: "WheelzLoop",
          description: `${PLAN_META[planType].label} Plan — Monthly Subscription`,
          order_id: orderId,
          handler: async (response) => {
            try {
              // 4. Verify payment on backend
              const verifyRes = await subscriptionsAPI.verifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              const verifyData = await verifyRes.json();

              if (!verifyRes.ok || !verifyData.success) {
                reject(new Error(verifyData.message || "Payment verification failed"));
                return;
              }

              resolve(verifyData.subscription);
            } catch (err) {
              reject(err);
            }
          },
          prefill: {},
          theme: {
            color: PLAN_META[planType].color,
          },
          modal: {
            ondismiss: () => reject(new Error("PAYMENT_DISMISSED")),
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }).then((subscription) => {
        onSuccess(subscription, planType);
      });
    } catch (err) {
      if (err.message !== "PAYMENT_DISMISSED") {
        setError(err.message || "Payment failed. Please try again.");
      }
    } finally {
      setProcessingPlan(null);
    }
  };

  const formatPrice = (price) =>
    Number(price) === 0
      ? "Free"
      : new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(Number(price));

  return (
    <div
      className="sub-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sub-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="sub-modal">
        {/* Header */}
        <div className="sub-modal-header">
          <div className="sub-modal-header-text">
            <div className="sub-modal-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h2 id="sub-modal-title" className="sub-modal-title">
                Upgrade Your Plan
              </h2>
              <p className="sub-modal-subtitle">
                You've reached your <strong>5-car limit</strong> on the Free plan. Upgrade to list more cars.
              </p>
            </div>
          </div>
          <button
            className="sub-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="sub-error" role="alert">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Plans grid */}
        {loading ? (
          <div className="sub-loading">
            <div className="sub-spinner" />
            <span>Loading plans…</span>
          </div>
        ) : (
          <div className="sub-plans">
            {plans.map((plan) => {
              const meta = PLAN_META[plan.planType] || {};
              const isCurrent = plan.planType === currentPlan;
              const isFree = plan.planType === "free";
              const isProcessing = processingPlan === plan.planType;

              return (
                <div
                  key={plan.planType}
                  className={`sub-plan-card ${plan.planType === "elite" ? "sub-plan-card--featured" : ""} ${isCurrent ? "sub-plan-card--current" : ""}`}
                  style={{ "--plan-color": meta.color, "--plan-accent": meta.accent }}
                >
                  {meta.badge && (
                    <span className="sub-plan-badge">{meta.badge}</span>
                  )}
                  {isCurrent && (
                    <span className="sub-plan-current-badge">Current Plan</span>
                  )}

                  <div className="sub-plan-header">
                    <h3 className="sub-plan-name">{meta.label}</h3>
                    <div className="sub-plan-price">
                      <span className="sub-plan-price-amount">
                        {formatPrice(plan.price)}
                      </span>
                      {!isFree && (
                        <span className="sub-plan-price-period">/month</span>
                      )}
                    </div>
                    <p className="sub-plan-limit">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <path d="M3 9h18M9 21V9" />
                      </svg>
                      Up to <strong>{plan.carLimit}</strong> listings
                    </p>
                  </div>

                  <ul className="sub-plan-features">
                    {meta.features?.map((f) => (
                      <li key={f}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`sub-plan-btn ${isFree || isCurrent ? "sub-plan-btn--disabled" : "sub-plan-btn--active"}`}
                    onClick={() => handleUpgrade(plan.planType)}
                    disabled={isFree || isCurrent || !!processingPlan}
                    aria-busy={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <span className="sub-btn-spinner" />
                        Processing…
                      </>
                    ) : isCurrent ? (
                      "Current Plan"
                    ) : isFree ? (
                      "Default Plan"
                    ) : (
                      `Upgrade to ${meta.label}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <p className="sub-modal-footer">
          Secured by Razorpay · Payments are processed in INR · Cancel anytime
        </p>
      </div>
    </div>
  );
};

export default SubscriptionModal;
