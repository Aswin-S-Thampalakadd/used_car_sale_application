import { useState } from "react";
import "./Browsebycategory.css";

const SuvIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 24h56M8 24v-7l5-9h30l10 9h3a4 4 0 0 1 4 4v3"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M18 8v9M32 8v9"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="18" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="46" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const SedanIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 24h56M7 24v-5l6-3 6-7h22l9 7 8 3v5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M31 9v7M19 16h30"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="19" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="45" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const HatchbackIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M6 24h52M9 24v-5l5-3 6-7h18l12 10 4 1v4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 9v7M20 16h20"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="20" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="44" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const PickupIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 24h56M7 24v-6l4-9h20l6 9h21v6"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M19 9v9M37 18h21"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="18" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="47" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const CoupeIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 24h56M6 24v-4l8-4 9-7h14l14 9 7 2v4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M30 9v7M23 16h24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="19" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="45" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const VanIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 24h56M8 24V11a3 3 0 0 1 3-3h30l14 11v5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M26 8v11M8 19h48"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="19" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="46" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const ElectricIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 25h44M7 25v-5l6-3 6-7h16l9 7 4 2"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="17" cy="25" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="39" cy="25" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <path
      d="M57 4l-7 11h6l-2 9 8-12h-6l1-8z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
    />
  </svg>
);

const ConvertibleIcon = () => (
  <svg
    viewBox="0 0 64 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
  >
    <path
      d="M4 24h56M6 24v-5l8-3h36l8 3v5"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 16l7-6h16l7 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="4 4"
    />
    <circle cx="19" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
    <circle cx="45" cy="24" r="4.5" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const categories = [
  { id: "suv", name: "SUV", count: 412, priceFrom: "$12,500", icon: SuvIcon },
  {
    id: "sedan",
    name: "Sedan",
    count: 638,
    priceFrom: "$6,900",
    icon: SedanIcon,
  },
  {
    id: "hatchback",
    name: "Hatchback",
    count: 295,
    priceFrom: "$4,750",
    icon: HatchbackIcon,
  },
  {
    id: "pickup",
    name: "Pickup",
    count: 187,
    priceFrom: "$15,200",
    icon: PickupIcon,
  },
  {
    id: "coupe",
    name: "Coupe",
    count: 96,
    priceFrom: "$11,300",
    icon: CoupeIcon,
  },
  {
    id: "van",
    name: "Van & MPV",
    count: 143,
    priceFrom: "$8,100",
    icon: VanIcon,
  },
  {
    id: "electric",
    name: "Electric",
    count: 208,
    priceFrom: "$17,900",
    icon: ElectricIcon,
    badge: "Growing fast",
  },
  {
    id: "convertible",
    name: "Convertible",
    count: 54,
    priceFrom: "$13,400",
    icon: ConvertibleIcon,
  },
];

export default function BrowseByCategory({ items = categories, onSelect }) {
  const [active, setActive] = useState(null);

  const handleSelect = (category) => {
    setActive(category.id);
    if (onSelect) onSelect(category);
  };

  return (
    <section className="categories" aria-labelledby="categories-heading">
      <div className="categories__inner">
        <header className="categories__header">
          <div>
            <h2 className="categories__title" id="categories-heading">
              Browse by category
            </h2>
            <p className="categories__subtitle">
              Every listing is inspected and history-checked before it goes
              live.
            </p>
          </div>
          <a className="categories__all" href="/inventory">
            See all 2,033 cars
          </a>
        </header>

        <ul className="categories__grid">
          {items.map((category) => {
            const Icon = category.icon;
            return (
              <li key={category.id}>
                <button
                  type="button"
                  className={
                    active === category.id
                      ? "category-card category-card--active"
                      : "category-card"
                  }
                  onClick={() => handleSelect(category)}
                  aria-pressed={active === category.id}
                >
                  {category.badge && (
                    <span className="category-card__badge">
                      {category.badge}
                    </span>
                  )}
                  <span className="category-card__icon">
                    <Icon />
                  </span>
                  <span className="category-card__name">{category.name}</span>
                  <span className="category-card__meta">
                    {category.count} cars · from {category.priceFrom}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
