import { useEffect, useRef, useState } from "react";
import "./Featuredlistings.css";

const listings = [
  {
    id: "c1",
    title: "Hyundai Creta SX (O) Turbo",
    year: 2022,
    price: 1685000,
    km: 24100,
    fuel: "Petrol",
    transmission: "Automatic",
    owner: "1st owner",
    location: "Kakkanad, Kochi",
    image: "/images/cars/creta.jpg",
    verified: true,
    tag: "Low mileage",
  },
  {
    id: "c2",
    title: "Maruti Suzuki Baleno Zeta",
    year: 2021,
    price: 742000,
    km: 38600,
    fuel: "Petrol",
    transmission: "Manual",
    owner: "1st owner",
    location: "Aluva",
    image: "/images/cars/baleno.jpg",
    verified: true,
  },
  {
    id: "c3",
    title: "Tata Nexon EV Max XZ+",
    year: 2023,
    price: 1425000,
    km: 12800,
    fuel: "Electric",
    transmission: "Automatic",
    owner: "1st owner",
    location: "Thrissur",
    image: "/images/cars/nexon-ev.jpg",
    verified: true,
    tag: "Featured",
  },
  {
    id: "c4",
    title: "Toyota Innova Crysta GX",
    year: 2020,
    price: 1890000,
    km: 71400,
    fuel: "Diesel",
    transmission: "Manual",
    owner: "2nd owner",
    location: "Kottayam",
    image: "/images/cars/innova.jpg",
    verified: false,
  },
  {
    id: "c5",
    title: "Honda City VX CVT",
    year: 2022,
    price: 1235000,
    km: 29900,
    fuel: "Petrol",
    transmission: "Automatic",
    owner: "1st owner",
    location: "Edappally, Kochi",
    image: "/images/cars/city.jpg",
    verified: true,
  },
  {
    id: "c6",
    title: "Mahindra Thar LX 4x4",
    year: 2021,
    price: 1540000,
    km: 34200,
    fuel: "Diesel",
    transmission: "Manual",
    owner: "1st owner",
    location: "Kollam",
    image: "/images/cars/thar.jpg",
    verified: true,
    sold: true,
  },
];

const formatPrice = (value) => {
  if (value >= 100000) {
    const lakh = value / 100000;
    return `₹${lakh % 1 === 0 ? lakh : lakh.toFixed(2)} L`;
  }
  return `₹${value.toLocaleString("en-IN")}`;
};

const formatKm = (value) => `${(value / 1000).toFixed(0)}k km`;

const ArrowIcon = ({ direction }) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d={direction === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VerifiedIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 3l2.4 1.8 3-.2.9 2.9 2.4 1.8-1.2 2.7 1.2 2.7-2.4 1.8-.9 2.9-3-.2L12 21l-2.4-1.8-3 .2-.9-2.9L3.3 14.7 4.5 12 3.3 9.3l2.4-1.8.9-2.9 3 .2L12 3z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M8.8 12.2l2.2 2.2 4.2-4.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = ({ filled }) => (
  <svg
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    aria-hidden="true"
  >
    <path
      d="M12 20s-7.2-4.6-9-9A5 5 0 0 1 12 6.6 5 5 0 0 1 21 11c-1.8 4.4-9 9-9 9z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
  </svg>
);

const FuelIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 20V5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v15M4 20h12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M14 9h3a2 2 0 0 1 2 2v5a1.5 1.5 0 0 0 3 0V9l-3-3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 7h5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const GaugeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M4 18a8 8 0 1 1 16 0"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <path
      d="M12 18l4.5-5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="12" cy="18" r="1.6" fill="currentColor" />
  </svg>
);

const GearIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 4v16M12 4v16M18 4v10M6 10h12"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="6" cy="4" r="1.6" fill="currentColor" />
    <circle cx="12" cy="4" r="1.6" fill="currentColor" />
    <circle cx="18" cy="4" r="1.6" fill="currentColor" />
  </svg>
);

const PinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.8" />
  </svg>
);

function ListingCard({ car, saved, onToggleSave, onView }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className={car.sold ? "listing listing--sold" : "listing"}>
      <div className="listing__media">
        {!imageFailed && (
          <img
            src={car.image}
            alt={`${car.year} ${car.title}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        )}
        <div className="listing__flags">
          {car.tag && (
            <span className="listing__flag listing__flag--tag">{car.tag}</span>
          )}
          {car.sold && (
            <span className="listing__flag listing__flag--sold">Sold</span>
          )}
        </div>
        <button
          type="button"
          className={
            saved ? "listing__save listing__save--on" : "listing__save"
          }
          onClick={() => onToggleSave(car.id)}
          aria-label={
            saved ? `Remove ${car.title} from saved cars` : `Save ${car.title}`
          }
          aria-pressed={saved}
        >
          <HeartIcon filled={saved} />
        </button>
      </div>

      <div className="listing__body">
        <div className="listing__pricerow">
          <p className="listing__price">{formatPrice(car.price)}</p>
          {car.verified && (
            <span className="listing__verified">
              <VerifiedIcon />
              Verified
            </span>
          )}
        </div>

        <h3 className="listing__title">
          <span className="listing__year">{car.year}</span> {car.title}
        </h3>

        <ul className="listing__specs">
          <li>
            <GaugeIcon />
            {formatKm(car.km)}
          </li>
          <li>
            <FuelIcon />
            {car.fuel}
          </li>
          <li>
            <GearIcon />
            {car.transmission}
          </li>
        </ul>

        <div className="listing__footer">
          <span className="listing__location">
            <PinIcon />
            {car.location} · {car.owner}
          </span>
          <button
            type="button"
            className="listing__cta"
            onClick={() => onView(car)}
            disabled={car.sold}
          >
            {car.sold ? "Sold out" : "View details"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function FeaturedListings({
  items = listings,
  onView = () => {},
}) {
  const trackRef = useRef(null);
  const [saved, setSaved] = useState([]);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

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
              Featured cars this week
            </h2>
            <p className="featured__subtitle">
              Hand-picked listings with a full service history and a 200-point
              inspection report.
            </p>
          </div>

          <div className="featured__controls">
            <button
              type="button"
              className="featured__arrow"
              onClick={() => scrollByCard(-1)}
              disabled={atStart}
              aria-label="Show previous cars"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className="featured__arrow"
              onClick={() => scrollByCard(1)}
              disabled={atEnd}
              aria-label="Show next cars"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </header>

        <div className="featured__track" ref={trackRef} onScroll={updateEdges}>
          {items.map((car) => (
            <ListingCard
              key={car.id}
              car={car}
              saved={saved.includes(car.id)}
              onToggleSave={toggleSave}
              onView={onView}
            />
          ))}
        </div>

        <a className="featured__more" href="/inventory">
          Browse all cars
        </a>
      </div>
    </section>
  );
}
