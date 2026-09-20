import React, { useState, useMemo, useEffect } from "react";
import "./ExploreCars.css";

const allCars = [
  {
    id: 6,
    dealerId: 3,
    make: "Kia",
    model: "Seltos",
    variant: "HTX 1.5",
    year: 2022,
    registrationYear: 2022,
    fuelType: "petrol",
    transmission: "automatic",
    kilometersDriven: 22000,
    price: "1540000.00",
    color: "Grey",
    condition: "excellent",
    description:
      "Low-mileage Kia Seltos with automatic transmission and premium features.",
    registrationNumber: "KL13KL2468",
    isNegotiable: true,
    status: "active",
    isFeatured: true,
    viewsCount: 185,
    createdAt: "2026-09-19T05:58:16.897Z",
    carImages: [
      {
        id: 13,
        imageUrl:
          "https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=800",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: 14,
        imageUrl:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        sortOrder: 1,
        isPrimary: false,
      },
    ],
    carFeatureMappings: [
      { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
      { featureId: 5, feature: { id: 5, name: "Airbags" } },
      { featureId: 6, feature: { id: 6, name: "ABS" } },
      { featureId: 7, feature: { id: 7, name: "Rear Parking Camera" } },
      { featureId: 10, feature: { id: 10, name: "Apple CarPlay" } },
      { featureId: 11, feature: { id: 11, name: "Android Auto" } },
      { featureId: 16, feature: { id: 16, name: "Push Button Start" } },
    ],
  },
  {
    id: 5,
    dealerId: 3,
    make: "Maruti Suzuki",
    model: "Baleno",
    variant: "Alpha",
    year: 2019,
    registrationYear: 2019,
    fuelType: "petrol",
    transmission: "manual",
    kilometersDriven: 46000,
    price: "685000.00",
    color: "Red",
    condition: "good",
    description:
      "Economical and well-maintained Maruti Suzuki Baleno suitable for city and highway driving.",
    registrationNumber: "KL12IJ7890",
    isNegotiable: true,
    status: "active",
    isFeatured: false,
    viewsCount: 54,
    createdAt: "2026-09-19T05:58:16.893Z",
    carImages: [
      {
        id: 11,
        imageUrl:
          "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?w=800",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: 12,
        imageUrl:
          "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
        sortOrder: 1,
        isPrimary: false,
      },
    ],
    carFeatureMappings: [
      { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
      { featureId: 5, feature: { id: 5, name: "Airbags" } },
      { featureId: 9, feature: { id: 9, name: "Bluetooth" } },
    ],
  },
  {
    id: 4,
    dealerId: 3,
    make: "Tata",
    model: "Nexon",
    variant: "XZ Plus",
    year: 2021,
    registrationYear: 2021,
    fuelType: "petrol",
    transmission: "manual",
    kilometersDriven: 31000,
    price: "875000.00",
    color: "Blue",
    condition: "good",
    description:
      "Well-maintained Tata Nexon with good mileage, spacious interiors and strong safety features.",
    registrationNumber: "KL10GH3456",
    isNegotiable: false,
    status: "active",
    isFeatured: false,
    viewsCount: 76,
    createdAt: "2026-09-19T05:58:16.891Z",
    carImages: [
      {
        id: 9,
        imageUrl:
          "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=800",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: 10,
        imageUrl:
          "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800",
        sortOrder: 1,
        isPrimary: false,
      },
    ],
    carFeatureMappings: [
      { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
      { featureId: 6, feature: { id: 6, name: "ABS" } },
      { featureId: 11, feature: { id: 11, name: "Android Auto" } },
    ],
  },
  {
    id: 3,
    dealerId: 3,
    make: "Honda",
    model: "City",
    variant: "VX CVT",
    year: 2020,
    registrationYear: 2020,
    fuelType: "petrol",
    transmission: "cvt",
    kilometersDriven: 35000,
    price: "1125000.00",
    color: "Silver",
    condition: "good",
    description:
      "Comfortable and reliable Honda City with smooth CVT transmission and excellent interiors.",
    registrationNumber: "KL05EF9012",
    isNegotiable: true,
    status: "active",
    isFeatured: false,
    viewsCount: 98,
    createdAt: "2026-09-19T05:58:16.889Z",
    carImages: [
      {
        id: 7,
        imageUrl:
          "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: 8,
        imageUrl:
          "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
        sortOrder: 1,
        isPrimary: false,
      },
    ],
    carFeatureMappings: [
      { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
      { featureId: 10, feature: { id: 10, name: "Apple CarPlay" } },
      { featureId: 12, feature: { id: 12, name: "Cruise Control" } },
    ],
  },
  {
    id: 2,
    dealerId: 3,
    make: "Hyundai",
    model: "Creta",
    variant: "SX 1.5 Diesel",
    year: 2022,
    registrationYear: 2022,
    fuelType: "diesel",
    transmission: "manual",
    kilometersDriven: 28000,
    price: "1625000.00",
    color: "Black",
    condition: "excellent",
    description:
      "Single-owner Hyundai Creta in excellent condition with low kilometers and complete service history.",
    registrationNumber: "KL01CD5678",
    isNegotiable: true,
    status: "active",
    isFeatured: true,
    viewsCount: 210,
    createdAt: "2026-09-19T05:58:16.886Z",
    carImages: [
      {
        id: 4,
        imageUrl:
          "https://images.unsplash.com/photo-1568844293986-8d0400bd4745?w=800",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: 5,
        imageUrl:
          "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: 6,
        imageUrl:
          "https://images.unsplash.com/photo-1550355291-bbee04a92027?w=800",
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    carFeatureMappings: [
      { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
      { featureId: 7, feature: { id: 7, name: "Rear Parking Camera" } },
      { featureId: 15, feature: { id: 15, name: "Keyless Entry" } },
    ],
  },
  {
    id: 1,
    dealerId: 3,
    make: "Toyota",
    model: "Fortuner",
    variant: "2.8 4x2 AT",
    year: 2021,
    registrationYear: 2021,
    fuelType: "diesel",
    transmission: "automatic",
    kilometersDriven: 42000,
    price: "3450000.00",
    color: "White",
    condition: "excellent",
    description:
      "Well-maintained Toyota Fortuner with automatic transmission and excellent service history.",
    registrationNumber: "KL07AB1234",
    isNegotiable: true,
    status: "active",
    isFeatured: true,
    viewsCount: 125,
    createdAt: "2026-09-19T05:58:16.883Z",
    carImages: [
      {
        id: 1,
        imageUrl:
          "https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800",
        sortOrder: 0,
        isPrimary: true,
      },
      {
        id: 2,
        imageUrl:
          "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=800",
        sortOrder: 1,
        isPrimary: false,
      },
      {
        id: 3,
        imageUrl:
          "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800",
        sortOrder: 2,
        isPrimary: false,
      },
    ],
    carFeatureMappings: [
      { featureId: 1, feature: { id: 1, name: "Air Conditioning" } },
      { featureId: 5, feature: { id: 5, name: "Airbags" } },
      { featureId: 14, feature: { id: 14, name: "Alloy Wheels" } },
      { featureId: 16, feature: { id: 16, name: "Push Button Start" } },
    ],
  },
];

const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return value;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatKm = (km) => `${Number(km).toLocaleString("en-IN")} km`;

const ITEMS_PER_PAGE = 6;

const ExploreCars = () => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedMakes, setSelectedMakes] = useState([]);
  const [selectedFuel, setSelectedFuel] = useState([]);
  const [selectedTransmission, setSelectedTransmission] = useState([]);
  const [selectedCondition, setSelectedCondition] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [maxKm, setMaxKm] = useState("");
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [featuredOnly, setFeaturedOnly] = useState(false);

  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);

  const makes = useMemo(
    () => [...new Set(allCars.map((c) => c.make))].sort(),
    []
  );
  const fuels = useMemo(
    () => [...new Set(allCars.map((c) => c.fuelType))].sort(),
    []
  );
  const transmissions = useMemo(
    () => [...new Set(allCars.map((c) => c.transmission))].sort(),
    []
  );
  const conditions = useMemo(
    () => [...new Set(allCars.map((c) => c.condition))].sort(),
    []
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    selectedMakes,
    selectedFuel,
    selectedTransmission,
    selectedCondition,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxKm,
    negotiableOnly,
    featuredOnly,
    sortBy,
  ]);

  const toggleInArray = (arr, setArr, value) => {
    setArr(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
    );
  };

  const filteredCars = useMemo(() => {
    const q = search.trim().toLowerCase();

    let list = allCars.filter((car) => {
      const matchSearch =
        !q ||
        `${car.make} ${car.model} ${car.variant}`.toLowerCase().includes(q) ||
        car.registrationNumber.toLowerCase().includes(q);

      const matchMake =
        selectedMakes.length === 0 || selectedMakes.includes(car.make);
      const matchFuel =
        selectedFuel.length === 0 || selectedFuel.includes(car.fuelType);
      const matchTrans =
        selectedTransmission.length === 0 ||
        selectedTransmission.includes(car.transmission);
      const matchCond =
        selectedCondition.length === 0 ||
        selectedCondition.includes(car.condition);

      const price = Number(car.price);
      const matchMinPrice = !minPrice || price >= Number(minPrice);
      const matchMaxPrice = !maxPrice || price <= Number(maxPrice);

      const matchMinYear = !minYear || car.year >= Number(minYear);
      const matchMaxYear = !maxYear || car.year <= Number(maxYear);

      const matchKm = !maxKm || car.kilometersDriven <= Number(maxKm);

      const matchNegotiable = !negotiableOnly || car.isNegotiable;
      const matchFeatured = !featuredOnly || car.isFeatured;

      return (
        matchSearch &&
        matchMake &&
        matchFuel &&
        matchTrans &&
        matchCond &&
        matchMinPrice &&
        matchMaxPrice &&
        matchMinYear &&
        matchMaxYear &&
        matchKm &&
        matchNegotiable &&
        matchFeatured
      );
    });

    list = [...list].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return Number(a.price) - Number(b.price);
        case "price-desc":
          return Number(b.price) - Number(a.price);
        case "year-desc":
          return b.year - a.year;
        case "year-asc":
          return a.year - b.year;
        case "km-asc":
          return a.kilometersDriven - b.kilometersDriven;
        case "km-desc":
          return b.kilometersDriven - a.kilometersDriven;
        case "popular":
          return b.viewsCount - a.viewsCount;
        case "newest":
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    return list;
  }, [
    search,
    selectedMakes,
    selectedFuel,
    selectedTransmission,
    selectedCondition,
    minPrice,
    maxPrice,
    minYear,
    maxYear,
    maxKm,
    negotiableOnly,
    featuredOnly,
    sortBy,
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCars.length / ITEMS_PER_PAGE)
  );
  const paginatedCars = filteredCars.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const clearAllFilters = () => {
    setSearch("");
    setSelectedMakes([]);
    setSelectedFuel([]);
    setSelectedTransmission([]);
    setSelectedCondition([]);
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setMaxKm("");
    setNegotiableOnly(false);
    setFeaturedOnly(false);
  };

  const activeFilterCount =
    selectedMakes.length +
    selectedFuel.length +
    selectedTransmission.length +
    selectedCondition.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0) +
    (minYear ? 1 : 0) +
    (maxYear ? 1 : 0) +
    (maxKm ? 1 : 0) +
    (negotiableOnly ? 1 : 0) +
    (featuredOnly ? 1 : 0);

  return (
    <div className="explore">
      <div className="explore-container">
        <header className="explore-header">
          <div className="explore-header-text">
            <h1 className="explore-title">Explore Used Cars</h1>
            <p className="explore-subtitle">
              {filteredCars.length} {filteredCars.length === 1 ? "car" : "cars"}{" "}
              found
            </p>
          </div>

          <div className="explore-header-controls">
            <div className="explore-search">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder="Search by make, model or reg. no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search cars"
              />
            </div>

            <div className="explore-sort">
              <label htmlFor="sortBy" className="explore-sort-label">
                Sort by
              </label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="newest">Newest First</option>
                <option value="popular">Most Viewed</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="year-desc">Year: Newest</option>
                <option value="year-asc">Year: Oldest</option>
                <option value="km-asc">KM: Low to High</option>
                <option value="km-desc">KM: High to Low</option>
              </select>
            </div>

            <button
              type="button"
              className="explore-filter-toggle"
              onClick={() => setFiltersOpen((v) => !v)}
              aria-expanded={filtersOpen}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              Filters
              {activeFilterCount > 0 && (
                <span className="explore-filter-count">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="explore-body">
          <aside className={`explore-filters ${filtersOpen ? "open" : ""}`}>
            <div className="explore-filters-header">
              <h2 className="explore-filters-title">Filters</h2>
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  className="explore-filters-clear"
                  onClick={clearAllFilters}
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                className="explore-filters-close"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Availability</h3>
              <label className="explore-checkbox">
                <input
                  type="checkbox"
                  checked={featuredOnly}
                  onChange={(e) => setFeaturedOnly(e.target.checked)}
                />
                <span>Featured only</span>
              </label>
              <label className="explore-checkbox">
                <input
                  type="checkbox"
                  checked={negotiableOnly}
                  onChange={(e) => setNegotiableOnly(e.target.checked)}
                />
                <span>Negotiable only</span>
              </label>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Make</h3>
              <div className="explore-filter-options">
                {makes.map((m) => (
                  <label key={m} className="explore-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedMakes.includes(m)}
                      onChange={() =>
                        toggleInArray(selectedMakes, setSelectedMakes, m)
                      }
                    />
                    <span>{m}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Price Range (₹)</h3>
              <div className="explore-range">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  aria-label="Minimum price"
                />
                <span className="explore-range-sep">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  aria-label="Maximum price"
                />
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Year</h3>
              <div className="explore-range">
                <input
                  type="number"
                  placeholder="From"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value)}
                  aria-label="Minimum year"
                />
                <span className="explore-range-sep">—</span>
                <input
                  type="number"
                  placeholder="To"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value)}
                  aria-label="Maximum year"
                />
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Max KM Driven</h3>
              <input
                type="number"
                className="explore-single-input"
                placeholder="e.g. 50000"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value)}
                aria-label="Maximum kilometers"
              />
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Fuel Type</h3>
              <div className="explore-chip-group">
                {fuels.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className={`explore-chip ${
                      selectedFuel.includes(f) ? "active" : ""
                    }`}
                    onClick={() =>
                      toggleInArray(selectedFuel, setSelectedFuel, f)
                    }
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Transmission</h3>
              <div className="explore-chip-group">
                {transmissions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`explore-chip ${
                      selectedTransmission.includes(t) ? "active" : ""
                    }`}
                    onClick={() =>
                      toggleInArray(
                        selectedTransmission,
                        setSelectedTransmission,
                        t
                      )
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="explore-filter-group">
              <h3 className="explore-filter-heading">Condition</h3>
              <div className="explore-chip-group">
                {conditions.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`explore-chip ${
                      selectedCondition.includes(c) ? "active" : ""
                    }`}
                    onClick={() =>
                      toggleInArray(selectedCondition, setSelectedCondition, c)
                    }
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              className="explore-filters-apply"
              onClick={() => setFiltersOpen(false)}
            >
              Show {filteredCars.length} results
            </button>
          </aside>

          {filtersOpen && (
            <div
              className="explore-filters-backdrop"
              onClick={() => setFiltersOpen(false)}
              aria-hidden="true"
            />
          )}

          <main className="explore-results">
            {paginatedCars.length === 0 ? (
              <div className="explore-empty">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No cars match your filters</h3>
                <p>Try adjusting your search or clearing some filters.</p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="explore-empty-btn"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="explore-grid">
                  {paginatedCars.map((car) => {
                    const primaryImage =
                      car.carImages.find((img) => img.isPrimary) ||
                      car.carImages[0];
                    return (
                      <article className="car-card" key={car.id}>
                        <a
                          href={`/used-cars/${car.id}`}
                          className="car-card-link"
                          aria-label={`View ${car.year} ${car.make} ${car.model}`}
                        >
                          <div className="car-card-image">
                            <img
                              src={primaryImage?.imageUrl}
                              alt={`${car.year} ${car.make} ${car.model} ${car.variant}`}
                              loading="lazy"
                            />
                            <div className="car-card-badges">
                              {car.isFeatured && (
                                <span className="car-card-badge car-card-badge-featured">
                                  <svg viewBox="0 0 24 24" fill="currentColor">
                                    <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
                                  </svg>
                                  Featured
                                </span>
                              )}
                              {car.isNegotiable && (
                                <span className="car-card-badge car-card-badge-negotiable">
                                  Negotiable
                                </span>
                              )}
                            </div>
                            <span className="car-card-images-count">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <rect
                                  x="3"
                                  y="3"
                                  width="18"
                                  height="18"
                                  rx="2"
                                  ry="2"
                                />
                                <circle cx="8.5" cy="8.5" r="1.5" />
                                <polyline points="21 15 16 10 5 21" />
                              </svg>
                              {car.carImages.length}
                            </span>
                          </div>

                          <div className="car-card-body">
                            <div className="car-card-title-block">
                              <h3 className="car-card-title">
                                {car.year} {car.make} {car.model}
                              </h3>
                              <p className="car-card-variant">{car.variant}</p>
                            </div>

                            <ul className="car-card-specs">
                              <li>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {formatKm(car.kilometersDriven)}
                              </li>
                              <li>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 3v18h18" />
                                  <path d="m7 14 4-4 4 4 5-6" />
                                </svg>
                                <span className="car-card-spec-cap">
                                  {car.fuelType}
                                </span>
                              </li>
                              <li>
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="3" />
                                  <path d="M12 1v6m0 10v6M4.22 4.22l4.24 4.24m7.08 7.08 4.24 4.24M1 12h6m10 0h6M4.22 19.78l4.24-4.24m7.08-7.08 4.24-4.24" />
                                </svg>
                                <span className="car-card-spec-cap">
                                  {car.transmission}
                                </span>
                              </li>
                            </ul>

                            <div className="car-card-footer">
                              <div className="car-card-price">
                                {formatPrice(car.price)}
                              </div>
                              <span className="car-card-cta">
                                View
                                <svg
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <polyline points="9 18 15 12 9 6" />
                                </svg>
                              </span>
                            </div>
                          </div>
                        </a>
                      </article>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <nav className="explore-pagination" aria-label="Pagination">
                    <button
                      type="button"
                      className="explore-page-btn"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      aria-label="Previous page"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>

                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        className={`explore-page-btn ${
                          page === i + 1 ? "active" : ""
                        }`}
                        onClick={() => setPage(i + 1)}
                        aria-current={page === i + 1 ? "page" : undefined}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      className="explore-page-btn"
                      onClick={() =>
                        setPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={page === totalPages}
                      aria-label="Next page"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </nav>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExploreCars;
