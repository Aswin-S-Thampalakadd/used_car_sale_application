import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { carsAPI, subscriptionsAPI } from "../../api/api";
import SubscriptionModal from "../../components/SubscriptionModal/SubscriptionModal";
import ImageUploader from "../../components/ImageUploader/ImageUploader";
import "./AddCar.css";

const FUEL_TYPES = ["petrol", "diesel", "electric", "hybrid", "cng", "lpg"];
const TRANSMISSIONS = ["manual", "automatic", "amt", "cvt", "dct"];
const CONDITIONS = ["excellent", "good", "fair"];
const STATUSES = ["draft", "active", "inactive"];

const EMPTY_FORM = {
  make: "", model: "", variant: "", year: "",
  registrationYear: "", fuelType: "petrol",
  transmission: "manual", kilometersDriven: "",
  price: "", color: "", condition: "good",
  description: "", registrationNumber: "",
  isNegotiable: true, status: "draft",
};

const AddCar = () => {
  const { isAuthenticated, isDealer } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEditing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);   // [{ id, imageUrl, publicId, isPrimary, uploading? }]
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Subscription modal state
  const [showSubModal, setShowSubModal] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("free");

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!isDealer) { navigate("/"); return; }

    // Fetch current subscription plan
    const fetchPlan = async () => {
      try {
        const res = await subscriptionsAPI.getMyPlan();
        if (res.ok) {
          const data = await res.json();
          setCurrentPlan(data.subscription?.planType || "free");
        }
      } catch {
        // Silently default to free
      }
    };
    fetchPlan();
  }, [isAuthenticated, isDealer, navigate]);

  // Load existing car when editing
  useEffect(() => {
    if (!isEditing) return;
    const load = async () => {
      setFetchLoading(true);
      try {
        const res = await carsAPI.getById(id);
        if (!res.ok) throw new Error("Not found");
        const car = await res.json();
        setForm({
          make: car.make || "", model: car.model || "",
          variant: car.variant || "", year: car.year || "",
          registrationYear: car.registrationYear || "",
          fuelType: car.fuelType || "petrol",
          transmission: car.transmission || "manual",
          kilometersDriven: car.kilometersDriven || "",
          price: car.price || "", color: car.color || "",
          condition: car.condition || "good",
          description: car.description || "",
          registrationNumber: car.registrationNumber || "",
          isNegotiable: car.isNegotiable ?? true,
          status: car.status || "draft",
        });
        if (car.carImages?.length) {
          setImages(
            car.carImages.map((img) => ({
              id: String(img.id),
              imageUrl: img.imageUrl,
              publicId: img.publicId || null,
              isPrimary: img.isPrimary,
            }))
          );
        }
      } catch {
        setError("Failed to load car details.");
      } finally {
        setFetchLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  const set = (k) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [k]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      ...form,
      year: Number(form.year),
      registrationYear: form.registrationYear ? Number(form.registrationYear) : undefined,
      kilometersDriven: Number(form.kilometersDriven),
      price: String(form.price),
    };

    setLoading(true);
    try {
      let carId;

      if (isEditing) {
        const res = await carsAPI.update(id, payload);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to update car");
        carId = id;
        setSuccess("Car updated successfully!");
      } else {
        const res = await carsAPI.create(payload);
        const data = await res.json();
        if (!res.ok) {
          // Check if the dealer has hit their subscription limit
          if (res.status === 403 && data.message === "CAR_LIMIT_REACHED") {
            setCurrentPlan(data.planType || "free");
            setShowSubModal(true);
            return;
          }
          throw new Error(data.message || "Failed to add car");
        }
        carId = data.car.id;
        setSuccess("Car added successfully!");
      }

      // Upload images — only fully-uploaded ones (no uploading:true placeholders)
      const readyImages = images.filter((img) => img.imageUrl && !img.uploading);
      if (readyImages.length > 0 && carId) {
        await carsAPI.addImages(
          carId,
          readyImages.map((img, idx) => ({
            imageUrl: img.imageUrl,
            publicId: img.publicId || null,
            sortOrder: idx,
            isPrimary: img.isPrimary,
          }))
        );
      }

      setTimeout(() => navigate("/dashboard"), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="addcar-loading">
        <div className="dash-spinner" />
        <p>Loading car details…</p>
      </div>
    );
  }

  const handleSubscriptionSuccess = (subscription, planType) => {
    setShowSubModal(false);
    setSuccess(
      `Successfully upgraded to ${planType.charAt(0).toUpperCase() + planType.slice(1)} plan! You can now add more cars.`
    );
    setCurrentPlan(planType);
  };

  return (
    <div className="addcar-page">
      {showSubModal && (
        <SubscriptionModal
          currentPlan={currentPlan}
          onClose={() => setShowSubModal(false)}
          onSuccess={handleSubscriptionSuccess}
        />
      )}
      <div className="addcar-container">
        <div className="addcar-header">
          <button className="addcar-back" onClick={() => navigate("/dashboard")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to Dashboard
          </button>
          <h1 className="addcar-title">{isEditing ? "Edit Car Listing" : "Add New Car"}</h1>
        </div>

        {error && <div className="addcar-error" role="alert">{error}</div>}
        {success && <div className="addcar-success" role="status">{success}</div>}

        <form className="addcar-form" onSubmit={handleSubmit} noValidate>
          <section className="addcar-section">
            <h2 className="addcar-section-title">Basic Information</h2>
            <div className="addcar-grid">
              <div className="addcar-field">
                <label htmlFor="make">Make *</label>
                <input id="make" type="text" value={form.make} onChange={set("make")} placeholder="Toyota" required />
              </div>
              <div className="addcar-field">
                <label htmlFor="model">Model *</label>
                <input id="model" type="text" value={form.model} onChange={set("model")} placeholder="Fortuner" required />
              </div>
              <div className="addcar-field">
                <label htmlFor="variant">Variant</label>
                <input id="variant" type="text" value={form.variant} onChange={set("variant")} placeholder="2.8 4x2 AT" />
              </div>
              <div className="addcar-field">
                <label htmlFor="color">Color</label>
                <input id="color" type="text" value={form.color} onChange={set("color")} placeholder="White" />
              </div>
              <div className="addcar-field">
                <label htmlFor="year">Year *</label>
                <input id="year" type="number" value={form.year} onChange={set("year")} placeholder="2021" min="1990" max="2030" required />
              </div>
              <div className="addcar-field">
                <label htmlFor="registrationYear">Registration Year</label>
                <input id="registrationYear" type="number" value={form.registrationYear} onChange={set("registrationYear")} placeholder="2021" min="1990" max="2030" />
              </div>
              <div className="addcar-field">
                <label htmlFor="registrationNumber">Registration Number</label>
                <input id="registrationNumber" type="text" value={form.registrationNumber} onChange={set("registrationNumber")} placeholder="KL07AB1234" />
              </div>
            </div>
          </section>

          <section className="addcar-section">
            <h2 className="addcar-section-title">Technical Details</h2>
            <div className="addcar-grid">
              <div className="addcar-field">
                <label htmlFor="fuelType">Fuel Type *</label>
                <select id="fuelType" value={form.fuelType} onChange={set("fuelType")}>
                  {FUEL_TYPES.map((f) => (
                    <option key={f} value={f} style={{ textTransform: "capitalize" }}>{f}</option>
                  ))}
                </select>
              </div>
              <div className="addcar-field">
                <label htmlFor="transmission">Transmission *</label>
                <select id="transmission" value={form.transmission} onChange={set("transmission")}>
                  {TRANSMISSIONS.map((t) => (
                    <option key={t} value={t} style={{ textTransform: "capitalize" }}>{t.toUpperCase()}</option>
                  ))}
                </select>
              </div>
              <div className="addcar-field">
                <label htmlFor="condition">Condition</label>
                <select id="condition" value={form.condition} onChange={set("condition")}>
                  {CONDITIONS.map((c) => (
                    <option key={c} value={c} style={{ textTransform: "capitalize" }}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="addcar-field">
                <label htmlFor="kilometersDriven">Kilometers Driven *</label>
                <input id="kilometersDriven" type="number" value={form.kilometersDriven} onChange={set("kilometersDriven")} placeholder="42000" min="0" required />
              </div>
            </div>
          </section>

          <section className="addcar-section">
            <h2 className="addcar-section-title">Pricing &amp; Status</h2>
            <div className="addcar-grid">
              <div className="addcar-field">
                <label htmlFor="price">Price (₹) *</label>
                <input id="price" type="number" value={form.price} onChange={set("price")} placeholder="1500000" min="0" required />
              </div>
              <div className="addcar-field">
                <label htmlFor="status">Listing Status</label>
                <select id="status" value={form.status} onChange={set("status")}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="addcar-field addcar-field-checkbox">
                <label className="addcar-checkbox-label">
                  <input type="checkbox" checked={form.isNegotiable} onChange={set("isNegotiable")} />
                  <span>Price is negotiable</span>
                </label>
              </div>
            </div>
          </section>

          <section className="addcar-section">
            <h2 className="addcar-section-title">Description</h2>
            <textarea
              className="addcar-textarea"
              value={form.description}
              onChange={set("description")}
              placeholder="Describe the car's condition, history, and any special features…"
              rows={5}
            />
          </section>

          <section className="addcar-section">
            <h2 className="addcar-section-title">Images</h2>
            <p className="addcar-hint">
              Upload photos of the car. The first image marked as "Primary" will be used as the main listing photo.
            </p>
            <ImageUploader images={images} onChange={setImages} maxImages={10} />
          </section>

          <div className="addcar-footer">
            <button type="button" className="addcar-cancel" onClick={() => navigate("/dashboard")}>
              Cancel
            </button>
            <button type="submit" className="addcar-submit" disabled={loading}>
              {loading ? "Saving…" : isEditing ? "Save Changes" : "Add Car Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCar;
