import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { carsAPI } from "../../api/api";
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
  const [imageUrls, setImageUrls] = useState([{ url: "", isPrimary: true }]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    if (!isDealer) { navigate("/"); return; }
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
          setImageUrls(
            car.carImages.map((img) => ({ url: img.imageUrl, isPrimary: img.isPrimary }))
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

  const setImageUrl = (idx, val) =>
    setImageUrls((prev) => prev.map((img, i) => (i === idx ? { ...img, url: val } : img)));

  const setPrimaryImage = (idx) =>
    setImageUrls((prev) =>
      prev.map((img, i) => ({ ...img, isPrimary: i === idx }))
    );

  const addImageRow = () =>
    setImageUrls((prev) => [...prev, { url: "", isPrimary: false }]);

  const removeImageRow = (idx) =>
    setImageUrls((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Ensure at least one is primary
      if (next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });

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
        if (!res.ok) throw new Error(data.message || "Failed to add car");
        carId = data.car.id;
        setSuccess("Car added successfully!");
      }

      // Upload images
      const validImages = imageUrls.filter((img) => img.url.trim());
      if (validImages.length > 0 && carId) {
        await carsAPI.addImages(
          carId,
          validImages.map((img, idx) => ({
            imageUrl: img.url.trim(),
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

  return (
    <div className="addcar-page">
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
            <p className="addcar-hint">Add image URLs. Mark one as the primary display image.</p>
            <div className="addcar-images">
              {imageUrls.map((img, idx) => (
                <div key={idx} className="addcar-image-row">
                  <input
                    type="url"
                    value={img.url}
                    onChange={(e) => setImageUrl(idx, e.target.value)}
                    placeholder="https://example.com/car-photo.jpg"
                    className="addcar-image-input"
                  />
                  <label className="addcar-primary-label" title="Set as primary image">
                    <input
                      type="radio"
                      name="primaryImage"
                      checked={img.isPrimary}
                      onChange={() => setPrimaryImage(idx)}
                    />
                    Primary
                  </label>
                  {imageUrls.length > 1 && (
                    <button
                      type="button"
                      className="addcar-remove-img"
                      onClick={() => removeImageRow(idx)}
                      aria-label="Remove image"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" className="addcar-add-img-btn" onClick={addImageRow}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add another image
            </button>
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
