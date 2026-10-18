import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { favouritesAPI } from "../../api/api";
import { carSlug } from "../../utils/carSlug";
import "./Favourites.css";

const formatPrice = (v) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(v));

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

const Favourites = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
  }, [isAuthenticated, navigate]);

  const loadFavourites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await favouritesAPI.getMine();
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCars(data.cars || []);
    } catch {
      setError("Failed to load saved cars.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadFavourites(); }, [loadFavourites]);

  const handleRemove = async (carId) => {
    setRemovingId(carId);
    try {
      const res = await favouritesAPI.remove(carId);
      if (res.ok) setCars((prev) => prev.filter((c) => c.id !== carId));
      else setError("Failed to remove from favourites.");
    } catch {
      setError("Failed to remove from favourites.");
    } finally {
      setRemovingId(null);
    }
  };

  if (loading) {
    return (
      <div className="fav-loading">
        <div className="dash-spinner" />
        <p>Loading saved cars…</p>
      </div>
    );
  }

  return (
    <div className="fav-page">
      <div className="fav-container">
        <div className="fav-header">
          <h1 className="fav-title">Saved Cars</h1>
          <p className="fav-subtitle">{cars.length} car{cars.length !== 1 ? "s" : ""} saved</p>
        </div>

        {error && (
          <div className="fav-error" role="alert">
            {error}
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {cars.length === 0 ? (
          <div className="fav-empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3>No saved cars yet</h3>
            <p>Browse cars and tap the heart to save them here.</p>
            <Link to="/used-cars" className="fav-browse-btn">Browse Cars</Link>
          </div>
        ) : (
          <div className="fav-grid">
            {cars.map((car) => {
              const img =
                car.carImages?.find((i) => i.isPrimary) || car.carImages?.[0];
              return (
                <article key={car.id} className="fav-card">
                  <Link to={carSlug(car)} className="fav-card-image-link">
                    {img ? (
                      <img src={img.imageUrl} alt={`${car.make} ${car.model}`} loading="lazy" />
                    ) : (
                      <div className="fav-card-no-image">No image</div>
                    )}
                    {car.isFeatured && (
                      <span className="fav-card-badge">Featured</span>
                    )}
                  </Link>

                  <div className="fav-card-body">
                    <div className="fav-card-top">
                      <div>
                        <Link to={carSlug(car)} className="fav-card-title">
                          {car.year} {car.make} {car.model}
                        </Link>
                        <p className="fav-card-variant">{car.variant}</p>
                      </div>
                      <button
                        className="fav-remove-btn"
                        onClick={() => handleRemove(car.id)}
                        disabled={removingId === car.id}
                        aria-label="Remove from favourites"
                        title="Remove from saved"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                      </button>
                    </div>

                    <ul className="fav-card-specs">
                      <li>{formatKm(car.kilometersDriven)}</li>
                      <li style={{ textTransform: "capitalize" }}>{car.fuelType}</li>
                      <li style={{ textTransform: "capitalize" }}>{car.transmission}</li>
                    </ul>

                    <div className="fav-card-footer">
                      <span className="fav-card-price">{formatPrice(car.price)}</span>
                      {car.isNegotiable && (
                        <span className="fav-card-neg">Negotiable</span>
                      )}
                    </div>

                    <Link to={carSlug(car)} className="fav-view-btn">
                      View Details
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favourites;
