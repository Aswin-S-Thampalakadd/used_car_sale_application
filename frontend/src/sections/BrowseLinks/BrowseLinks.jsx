import React, { useState, useMemo } from "react";
import "./BrowseLinks.css";

const cities = [
  { name: "Kochi",       state: "Kerala" },
  { name: "Thrissur",    state: "Kerala" },
  { name: "Kozhikode",   state: "Kerala" },
  { name: "Thiruvananthapuram", state: "Kerala" },
  { name: "Kollam",      state: "Kerala" },
  { name: "Kannur",      state: "Kerala" },
  { name: "Bengaluru",   state: "Karnataka" },
  { name: "Mumbai",      state: "Maharashtra" },
  { name: "Delhi",       state: "Delhi" },
  { name: "Chennai",     state: "Tamil Nadu" },
  { name: "Hyderabad",   state: "Telangana" },
  { name: "Pune",        state: "Maharashtra" },
  { name: "Ahmedabad",   state: "Gujarat" },
  { name: "Jaipur",      state: "Rajasthan" },
  { name: "Surat",       state: "Gujarat" },
  { name: "Lucknow",     state: "Uttar Pradesh" },
];

const brands = [
  { name: "Maruti Suzuki", slug: "Maruti Suzuki", logo: "MSZ" },
  { name: "Hyundai",       slug: "Hyundai",       logo: "HYU" },
  { name: "Tata",          slug: "Tata",          logo: "TAT" },
  { name: "Honda",         slug: "Honda",         logo: "HON" },
  { name: "Toyota",        slug: "Toyota",        logo: "TOY" },
  { name: "Kia",           slug: "Kia",           logo: "KIA" },
  { name: "Mahindra",      slug: "Mahindra",      logo: "MHD" },
  { name: "Ford",          slug: "Ford",          logo: "FRD" },
  { name: "Volkswagen",    slug: "Volkswagen",    logo: "VW"  },
  { name: "Renault",       slug: "Renault",       logo: "RNT" },
  { name: "Skoda",         slug: "Skoda",         logo: "SKD" },
  { name: "MG",            slug: "MG",            logo: "MG"  },
  { name: "BMW",           slug: "BMW",           logo: "BMW" },
  { name: "Mercedes-Benz", slug: "Mercedes-Benz", logo: "MBZ" },
  { name: "Audi",          slug: "Audi",          logo: "AUD" },
  { name: "Jeep",          slug: "Jeep",          logo: "JEP" },
];

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
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
      item.name.toLowerCase().includes(q) ||
      (item.state && item.state.toLowerCase().includes(q))
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
              Jump straight to the listings that matter — filter by location or manufacturer.
            </p>
          </div>

          <div className="browse-search">
            <span className="browse-search-icon"><SearchIcon /></span>
            <input
              type="text"
              className="browse-search-input"
              placeholder={activeTab === "cities" ? "Search city or state..." : "Search brand..."}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={activeTab === "cities" ? "Search cities" : "Search brands"}
            />
          </div>
        </div>

        <div className="browse-tabs" role="tablist" aria-label="Browse category">
          <button
            role="tab"
            aria-selected={activeTab === "cities"}
            className={`browse-tab ${activeTab === "cities" ? "active" : ""}`}
            onClick={() => handleTabChange("cities")}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              <p>No results for "{query}"</p>
              <button onClick={() => setQuery("")} className="browse-empty-reset">Clear</button>
            </div>
          ) : activeTab === "cities" ? (
            <ul className="browse-city-grid">
              {filteredItems.map((city) => (
                <li key={`${city.name}-${city.state}`}>
                  <a
                    href={`/used-cars?search=${encodeURIComponent(city.name)}`}
                    className="browse-city-item"
                    title={`Used cars in ${city.name}`}
                  >
                    <span className="browse-city-pin" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                    </span>
                    <span className="browse-city-info">
                      <span className="browse-city-name">{city.name}</span>
                      <span className="browse-city-state">{city.state}</span>
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: "var(--color-gray-400)", flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <ul className="browse-brand-grid">
              {filteredItems.map((brand) => (
                <li key={brand.slug}>
                  <a
                    href={`/used-cars?make=${encodeURIComponent(brand.slug)}`}
                    className="browse-brand-item"
                    title={`Used ${brand.name} cars`}
                  >
                    <span className="browse-brand-logo" aria-hidden="true">{brand.logo}</span>
                    <span className="browse-brand-info">
                      <span className="browse-brand-name">{brand.name}</span>
                    </span>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, color: "var(--color-gray-400)", marginLeft: "auto", flexShrink: 0 }}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default BrowseLinks;
