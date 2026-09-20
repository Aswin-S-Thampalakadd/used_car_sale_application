import React, { useState, useMemo } from "react";
import "./BrowseLinks.css";

const cities = [
  { name: "Austin", state: "TX", count: 1240 },
  { name: "Denver", state: "CO", count: 986 },
  { name: "San Jose", state: "CA", count: 1732 },
  { name: "Seattle", state: "WA", count: 1105 },
  { name: "Chicago", state: "IL", count: 1548 },
  { name: "Atlanta", state: "GA", count: 892 },
  { name: "Phoenix", state: "AZ", count: 763 },
  { name: "Dallas", state: "TX", count: 1421 },
  { name: "Miami", state: "FL", count: 988 },
  { name: "Boston", state: "MA", count: 654 },
  { name: "Portland", state: "OR", count: 542 },
  { name: "Nashville", state: "TN", count: 731 },
  { name: "Las Vegas", state: "NV", count: 612 },
  { name: "Houston", state: "TX", count: 1310 },
  { name: "San Diego", state: "CA", count: 1078 },
  { name: "Philadelphia", state: "PA", count: 723 },
];

const brands = [
  { name: "Toyota", slug: "toyota", count: 2380, logo: "TOY" },
  { name: "Honda", slug: "honda", count: 1985, logo: "HON" },
  { name: "Ford", slug: "ford", count: 1742, logo: "FRD" },
  { name: "Chevrolet", slug: "chevrolet", count: 1598, logo: "CHV" },
  { name: "BMW", slug: "bmw", count: 1120, logo: "BMW" },
  { name: "Mercedes-Benz", slug: "mercedes-benz", count: 987, logo: "MBZ" },
  { name: "Tesla", slug: "tesla", count: 654, logo: "TSL" },
  { name: "Nissan", slug: "nissan", count: 1245, logo: "NSN" },
  { name: "Hyundai", slug: "hyundai", count: 1103, logo: "HYU" },
  { name: "Kia", slug: "kia", count: 876, logo: "KIA" },
  { name: "Subaru", slug: "subaru", count: 743, logo: "SUB" },
  { name: "Audi", slug: "audi", count: 612, logo: "AUD" },
  { name: "Mazda", slug: "mazda", count: 588, logo: "MZD" },
  { name: "Lexus", slug: "lexus", count: 421, logo: "LEX" },
  { name: "Volkswagen", slug: "volkswagen", count: 702, logo: "VW" },
  { name: "Jeep", slug: "jeep", count: 534, logo: "JEP" },
];

const SearchIcon = () => (
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
);

const ArrowIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const BrowseLinks = () => {
  const [activeTab, setActiveTab] = useState("cities");
  const [query, setQuery] = useState("");

  const filteredItems = useMemo(() => {
    const list = activeTab === "cities" ? cities : brands;
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter((item) =>
      activeTab === "cities"
        ? item.name.toLowerCase().includes(q) ||
          item.state.toLowerCase().includes(q)
        : item.name.toLowerCase().includes(q)
    );
  }, [activeTab, query]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setQuery("");
  };

  return (
    <section className="browse-section" aria-labelledby="browse-heading">
      <div className="browse-container">
        <div className="browse-top">
          <div className="browse-heading-block">
            <span className="browse-eyebrow">Explore Inventory</span>
            <h2 id="browse-heading" className="browse-heading">
              Browse by City &amp; Brand
            </h2>
            <p className="browse-desc">
              Jump straight to the listings that matter — filter by location or
              manufacturer.
            </p>
          </div>

          <div className="browse-search">
            <span className="browse-search-icon">
              <SearchIcon />
            </span>
            <input
              type="text"
              className="browse-search-input"
              placeholder={
                activeTab === "cities"
                  ? "Search city or state..."
                  : "Search brand..."
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={
                activeTab === "cities" ? "Search cities" : "Search brands"
              }
            />
          </div>
        </div>

        <div
          className="browse-tabs"
          role="tablist"
          aria-label="Browse category"
        >
          <button
            role="tab"
            aria-selected={activeTab === "cities"}
            className={`browse-tab ${activeTab === "cities" ? "active" : ""}`}
            onClick={() => handleTabChange("cities")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            Cities
            <span className="browse-tab-count">{cities.length}</span>
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "brands"}
            className={`browse-tab ${activeTab === "brands" ? "active" : ""}`}
            onClick={() => handleTabChange("brands")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 17h14M5 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0zm14 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0z" />
              <path d="M3 17V9l2-5h14l2 5v8" />
              <path d="M7 9h10" />
            </svg>
            Brands
            <span className="browse-tab-count">{brands.length}</span>
          </button>
        </div>

        <div className="browse-content">
          {filteredItems.length === 0 ? (
            <div className="browse-empty">
              <p>No results found for "{query}"</p>
              <button
                onClick={() => setQuery("")}
                className="browse-empty-reset"
              >
                Clear search
              </button>
            </div>
          ) : activeTab === "cities" ? (
            <ul className="browse-city-grid">
              {filteredItems.map((city) => (
                <li key={`${city.name}-${city.state}`}>
                  <a
                    href={`/used-cars/${city.name
                      .toLowerCase()
                      .replace(/\s+/g, "-")}-${city.state.toLowerCase()}`}
                    className="browse-city-item"
                    title={`Used cars for sale in ${city.name}, ${city.state}`}
                  >
                    <span className="browse-city-pin" aria-hidden="true">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="browse-city-info">
                      <span className="browse-city-name">{city.name}</span>
                      <span className="browse-city-state">{city.state}</span>
                    </span>
                    <span className="browse-city-count">
                      {city.count.toLocaleString()}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="browse-brand-grid">
              {filteredItems.map((brand) => (
                <li key={brand.slug}>
                  <a
                    href={`/used-cars/brand/${brand.slug}`}
                    className="browse-brand-item"
                    title={`Used ${brand.name} cars for sale`}
                  >
                    <span className="browse-brand-logo" aria-hidden="true">
                      {brand.logo}
                    </span>
                    <span className="browse-brand-info">
                      <span className="browse-brand-name">{brand.name}</span>
                      <span className="browse-brand-count">
                        {brand.count.toLocaleString()} listings
                      </span>
                    </span>
                    <span className="browse-brand-arrow" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="browse-actions">
          <a
            href={
              activeTab === "cities" ? "/used-cars/cities" : "/used-cars/brands"
            }
            className="browse-action-primary"
          >
            View all {activeTab}
            <ArrowIcon />
          </a>
          <a href="/used-cars/all" className="browse-action-secondary">
            Browse full inventory
          </a>
        </div>
      </div>
    </section>
  );
};

export default BrowseLinks;
