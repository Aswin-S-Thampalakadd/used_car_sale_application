import { Link } from "react-router-dom";
import "./Browsebycategory.css";

const CATEGORIES = [
  {
    id:    "suv",
    name:  "SUV",
    meta:  "Spacious & powerful",
    emoji: "🚙",
    href:  "/used-cars?search=suv",
    bg:    "#eff6ff",
    color: "#1d4ed8",
  },
  {
    id:    "sedan",
    name:  "Sedan",
    meta:  "Comfort & style",
    emoji: "🚗",
    href:  "/used-cars?search=sedan",
    bg:    "#f5f3ff",
    color: "#6d28d9",
  },
  {
    id:    "hatchback",
    name:  "Hatchback",
    meta:  "City-friendly",
    emoji: "🚘",
    href:  "/used-cars?search=hatchback",
    bg:    "#ecfeff",
    color: "#0e7490",
  },
  {
    id:    "muv",
    name:  "MUV / MPV",
    meta:  "Family & cargo",
    emoji: "🚐",
    href:  "/used-cars?search=innova",
    bg:    "#f0fdf4",
    color: "#15803d",
  },
  {
    id:    "electric",
    name:  "Electric",
    meta:  "Zero emissions",
    emoji: "⚡",
    href:  "/used-cars?fuelType=electric",
    bg:    "#dcfce7",
    color: "#166534",
    badge: "EV",
  },
  {
    id:    "diesel",
    name:  "Diesel",
    meta:  "Long-range mileage",
    emoji: "⛽",
    href:  "/used-cars?fuelType=diesel",
    bg:    "#fff7ed",
    color: "#c2410c",
  },
  {
    id:    "luxury",
    name:  "Luxury",
    meta:  "Premium experience",
    emoji: "👑",
    href:  "/used-cars?search=luxury",
    bg:    "#fff1f2",
    color: "#be123c",
  },
  {
    id:    "budget",
    name:  "Under ₹3 Lakh",
    meta:  "Best value deals",
    emoji: "💰",
    href:  "/used-cars?maxPrice=300000",
    bg:    "#fefce8",
    color: "#a16207",
    badge: "Deal",
  },
];

export default function BrowseByCategory() {
  return (
    <section className="categories" aria-labelledby="categories-heading">
      <div className="categories__inner">

        <header className="categories__header">
          <div>
            <h2 className="categories__title" id="categories-heading">
              Browse by category
            </h2>
            <p className="categories__subtitle">
              Find your perfect car — from budget picks to premium rides.
            </p>
          </div>
          <Link to="/used-cars" className="categories__all">
            View all cars →
          </Link>
        </header>

        <ul className="categories__grid">
          {CATEGORIES.map(({ id, name, meta, emoji, href, bg, color, badge }) => (
            <li key={id}>
              <Link
                to={href}
                className="category-card"
                style={{ "--card-bg": bg, "--card-color": color }}
                aria-label={`Browse ${name} cars`}
              >
                {badge && (
                  <span className="category-card__badge">{badge}</span>
                )}

                {/* Tinted icon block */}
                <span className="category-card__icon" role="img" aria-hidden="true">
                  {emoji}
                </span>

                {/* Text */}
                <span>
                  <span className="category-card__name">{name}</span>
                  <span className="category-card__meta">{meta}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>

      </div>
    </section>
  );
}
