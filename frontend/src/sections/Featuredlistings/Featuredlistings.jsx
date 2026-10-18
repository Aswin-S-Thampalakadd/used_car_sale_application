import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carsAPI } from "../../api/api";
import { carSlug } from "../../utils/carSlug";
import "./Featuredlistings.css";

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  const lakh = num / 100000;
  if (num >= 100000) {
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} L`;
  }
  return `₹${num.toLocaleString("en-IN")}`;
};

const formatKm = (value) => {
  const km = Number(value);
  if (km >= 1000) return `${(km / 1000).toFixed(0)}k km`;
  return `${km} km`;
};

const ArrowIcon = ({ direction }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} aria-hidden="true">
    <path
      d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
      stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"
    />
  </svg>
);

const FuelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15M4 20h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M14 9h3a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7 7h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 18a8 8 0 1 1 16 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M12 18l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="12" cy="18" r="1.6" fill="currentColor" />
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M6 4v16M12 4v16M18 4v10M6 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <circle cx="6" cy="4" r="1.6" fill="currentColor" />
    <circle cx="12" cy="4" r="1.6" fill="currentColor" />
    <circle cx="18" cy="4" r="1.6" fill="currentColor" />
  </svg>
);

function ListingCard({ car, saved, onToggleSave }) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);
  const primaryImage =
    (car.carImages || []).find((i) => i.isPrimary) || (car.carImages || [])[0];

  return (
    <article className="listing">
      <div className="listing__media">
        {primaryImage && !imageFailed ? (
          <img
            src={primaryImage.imageUrl}
            alt={`${car.year} ${car.make} ${car.model}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="listing__no-image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
        <div className="listing__flags">
          {car.isFeatured && (
            <span className="listing__flag listing__flag--tag">Featured</span>
          )}
          {car.status === "sold" && (
            <span className="listing__flag listing__flag--sold">Sold</span>
          )}
        </div>
        <button
          type="button"
          className={saved ? "listing__save listing__save--on" : "listing__save"}
          onClick={(e) => { e.stopPropagation(); onToggleSave(car.id); }}
          aria-label={saved ? `Remove ${car.make} ${car.model} from saved` : `Save ${car.make} ${car.model}`}
          aria-pressed={saved}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>

      <div className="listing__body">
        <div className="listing__pricerow">
          <p className="listing__price">{formatPrice(car.price)}</p>
          {car.isNegotiable && (
            <span className="listing__neg">Negotiable</span>
          )}
        </div>

        <h3 className="listing__title">
          <span className="listing__year">{car.year}</span>{" "}
          {car.make} {car.model}
          {car.variant ? <span className="listing__variant"> {car.variant}</span> : null}
        </h3>

        <ul className="listing__specs">
          <li><GaugeIcon />{formatKm(car.kilometersDriven)}</li>
          <li><FuelIcon /><span style={{ textTransform: "capitalize" }}>{car.fuelType}</span></li>
          <li><GearIcon /><span style={{ textTransform: "capitalize" }}>{car.transmission}</span></li>
        </ul>

        <div className="listing__footer">
          <button
            type="button"
            className="listing__cta"
            onClick={() => navigate(carSlug(car))}
            disabled={car.status === "sold"}
          >
            {car.status === "sold" ? "Sold" : "View details"}
          </button>
        </div>
      </div>
    </article>
  );
}

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <article className="listing listing--skeleton">
      <div className="listing__media listing__skeleton-img" />
      <div className="listing__body">
        <div className="listing__skeleton-line w60" />
        <div className="listing__skeleton-line w80" />
        <div className="listing__skeleton-line w50" />
      </div>
    </article>
  );
}

export default function FeaturedListings() {
  const trackRef = useRef(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState([]);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [isFeaturedMode, setIsFeaturedMode] = useState(true);

  // Fetch: try featured first, fall back to latest 8 if empty
  useEffect(() => {
    carsAPI.getFeatured(8)
      .then((r) => r.json())
      .then((data) => {
        const featured = data.cars || (Array.isArray(data) ? data : []);
        if (featured.length > 0) {
          setItems(featured);
          setIsFeaturedMode(true);
          setLoading(false);
        } else {
          // No featured cars — show latest 8 active listings instead
          return carsAPI.getRecent(8)
            .then((r) => r.json())
            .then((d) => {
              setItems(d.cars || []);
              setIsFeaturedMode(false);
              setLoading(false);
            });
        }
      })
      .catch(() => setLoading(false));
  }, []);

  const updateEdges = () => {
    const el = trackRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  };

  useEffect(() => {
    updateEdges();
    window.addEventListener("resize", updateEdges);
    return () => window.removeEventListener("resize", updateEdges);
  }, [items]);

  const scrollByCard = (direction) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector(".listing");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  const toggleSave = (id) => {
    setSaved((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <section className="featured" aria-labelledby="featured-heading">
      <div className="featured__inner">
        <header className="featured__header">
          <div>
            <h2 className="featured__title" id="featured-heading">
              {isFeaturedMode ? "Featured cars this week" : "Latest listings"}
            </h2>
            <p className="featured__subtitle">
              {isFeaturedMode
                ? "Hand-picked listings with a full service history and a 200-point inspection report."
                : "The most recently added certified pre-owned cars from verified dealers."}
            </p>
          </div>

          <div className="featured__controls">
            <button
              type="button" className="featured__arrow"
              onClick={() => scrollByCard(-1)} disabled={atStart}
              aria-label="Show previous cars"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button" className="featured__arrow"
              onClick={() => scrollByCard(1)} disabled={atEnd}
              aria-label="Show next cars"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </header>

        <div className="featured__track" ref={trackRef} onScroll={updateEdges}>
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
            : items.length === 0
              ? <p className="featured__empty">No featured listings right now.</p>
              : items.map((car) => (
                  <ListingCard
                    key={car.id}
                    car={car}
                    saved={saved.includes(car.id)}
                    onToggleSave={toggleSave}
                  />
                ))}
        </div>

        <a className="featured__more" href={isFeaturedMode ? "/used-cars?isFeatured=true" : "/used-cars"}>
          {isFeaturedMode ? "Browse all featured cars →" : "Browse all cars →"}
        </a>
      </div>
    </section>
  );
}
