import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

/* ── initials avatar ── */
const UserAvatar = ({ name }) => {
  const initials = name
    ? name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "U";
  return <span className="hdr-avatar">{initials}</span>;
};

function Header() {
  const { isAuthenticated, isDealer, isCustomer, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchOpen, setSearchOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [query, setQuery]               = useState("");
  const [scrolled, setScrolled]         = useState(false);

  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  /* ── shadow on scroll ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── close dropdown on outside click ── */
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  /* ── focus search input when opened ── */
  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 60);
  }, [searchOpen]);

  /* ── lock body scroll when mobile drawer is open ── */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  /* ── close mobile drawer on ESC ── */
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") { setMobileOpen(false); setSearchOpen(false); } };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const close = () => { setMobileOpen(false); setDropdownOpen(false); };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/used-cars?search=${encodeURIComponent(query.trim())}`);
    setQuery(""); setSearchOpen(false); setMobileOpen(false);
  };

  const handleLogout = async () => {
    close();
    await logout();
    navigate("/");
  };

  /* nav links shared between desktop + mobile */
  const NAV_LINKS = [
    { to: "/",          label: "Home",       exact: true },
    { to: "/used-cars", label: "Browse Cars" },
    ...(isAuthenticated && !isDealer && !isAdmin
      ? [{ to: "/favourites", label: "Saved Cars" }]
      : []),
    ...(isAuthenticated && !isAdmin
      ? [{ to: "/enquiries", label: "Enquiries" }]
      : []),
    ...(isDealer
      ? [{ to: "/dashboard", label: "Dashboard", highlight: true }]
      : []),
    ...(isAdmin
      ? [{ to: "/admin/dashboard", label: "Admin Panel", highlight: true }]
      : []),
  ];

  return (
    <>
      <header className={`hdr ${scrolled ? "hdr--scrolled" : ""}`}>
        <div className="hdr-inner">

          {/* ── Logo ── */}
          <Link to="/" className="hdr-logo" onClick={close}>
            <img src="/logo.svg" alt="VandiMart" className="hdr-logo-img" />
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hdr-nav" aria-label="Main navigation">
            {NAV_LINKS.map(({ to, label, exact, highlight }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `hdr-nav-link ${isActive ? "hdr-nav-link--active" : ""} ${highlight ? "hdr-nav-link--highlight" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* ── Desktop search bar ── */}
          <form className="hdr-search" onSubmit={handleSearch} role="search" aria-label="Search cars">
            <svg className="hdr-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              className="hdr-search-input"
              placeholder="Make, model or keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search cars"
            />
            {query && (
              <button type="button" className="hdr-search-clear" onClick={() => setQuery("")} aria-label="Clear">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </form>

          {/* ── Right-side actions ── */}
          <div className="hdr-actions">
            {/* Mobile search toggle */}
            <button
              className="hdr-icon-btn hdr-search-toggle"
              onClick={() => setSearchOpen((v) => !v)}
              aria-label="Toggle search"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>

            {isAuthenticated ? (
              <>
                {/* Saved / Dashboard shortcut */}
                {!isDealer && !isAdmin && (
                  <Link to="/favourites" className="hdr-icon-btn" aria-label="Saved cars">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </Link>
                )}

                {/* User avatar dropdown */}
                <div className="hdr-user" ref={dropdownRef}>
                  <button
                    className="hdr-user-btn"
                    onClick={() => setDropdownOpen((v) => !v)}
                    aria-expanded={dropdownOpen}
                    aria-haspopup="true"
                    aria-label="Account menu"
                  >
                    <UserAvatar name={user?.name} />
                    <span className="hdr-user-name">{user?.name?.split(" ")[0]}</span>
                    <svg
                      className={`hdr-chevron ${dropdownOpen ? "hdr-chevron--up" : ""}`}
                      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    >
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="hdr-dropdown" role="menu">
                      <div className="hdr-dropdown-header">
                        <UserAvatar name={user?.name} />
                        <div>
                          <p className="hdr-dropdown-name">{user?.name}</p>
                          <p className="hdr-dropdown-role">
                            {isAdmin ? "Administrator" : isDealer ? "Dealer Account" : "Customer Account"}
                          </p>
                        </div>
                      </div>

                      <div className="hdr-dropdown-divider" />

                      {isAdmin && (
                        <Link to="/admin/dashboard" className="hdr-dropdown-item hdr-dropdown-item--admin" onClick={() => setDropdownOpen(false)} role="menuitem">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                          </svg>
                          Admin Panel
                        </Link>
                      )}

                      {isDealer && (
                        <Link to="/dashboard" className="hdr-dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
                          </svg>
                          Dashboard
                        </Link>
                      )}

                      {!isAdmin && (
                        <Link to="/enquiries" className="hdr-dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                          </svg>
                          Enquiries
                        </Link>
                      )}

                      {!isDealer && !isAdmin && (
                        <Link to="/favourites" className="hdr-dropdown-item" onClick={() => setDropdownOpen(false)} role="menuitem">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                          </svg>
                          Saved Cars
                        </Link>
                      )}

                      <div className="hdr-dropdown-divider" />

                      <button className="hdr-dropdown-item hdr-dropdown-item--danger" onClick={handleLogout} role="menuitem">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                          <polyline points="16 17 21 12 16 7"/>
                          <line x1="21" y1="12" x2="9" y2="12"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="hdr-btn hdr-btn--ghost">Log in</Link>
                <Link to="/signup" className="hdr-btn hdr-btn--primary">Sign up</Link>
              </>
            )}

            {/* Hamburger — mobile only */}
            <button
              className={`hdr-hamburger ${mobileOpen ? "hdr-hamburger--open" : ""}`}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>

        {/* ── Mobile search bar (slides down) ── */}
        <div className={`hdr-mobile-search ${searchOpen ? "hdr-mobile-search--open" : ""}`}>
          <form onSubmit={handleSearch} role="search" className="hdr-mobile-search-form">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search make, model or keyword…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search cars"
            />
            {query && (
              <button type="button" onClick={() => setQuery("")} aria-label="Clear">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            )}
          </form>
        </div>
      </header>

      {/* ── Mobile drawer overlay ── */}
      {mobileOpen && (
        <div className="hdr-overlay" onClick={close} aria-hidden="true" />
      )}

      {/* ── Mobile drawer ── */}
      <aside className={`hdr-drawer ${mobileOpen ? "hdr-drawer--open" : ""}`} aria-label="Mobile menu">
        <div className="hdr-drawer-inner">
          {/* drawer header */}
          <div className="hdr-drawer-top">
            <Link to="/" className="hdr-logo" onClick={close}>
              <img src="/logo.svg" alt="VandiMart" className="hdr-logo-img" />
            </Link>
            <button className="hdr-drawer-close" onClick={close} aria-label="Close menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* user info in drawer */}
          {isAuthenticated && (
            <div className="hdr-drawer-user">
              <UserAvatar name={user?.name} />
              <div>
                <p className="hdr-drawer-user-name">{user?.name}</p>
                <p className="hdr-drawer-user-role">
                  {isAdmin ? "Administrator" : isDealer ? "Dealer Account" : "Customer Account"}
                </p>
              </div>
            </div>
          )}

          {/* nav links */}
          <nav className="hdr-drawer-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map(({ to, label, exact, highlight }) => (
              <NavLink
                key={to}
                to={to}
                end={exact}
                className={({ isActive }) =>
                  `hdr-drawer-link ${isActive ? "hdr-drawer-link--active" : ""} ${highlight ? "hdr-drawer-link--highlight" : ""}`
                }
                onClick={close}
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="hdr-drawer-divider" />

          {/* auth actions */}
          {isAuthenticated ? (
            <button className="hdr-drawer-logout" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          ) : (
            <div className="hdr-drawer-auth">
              <Link to="/login" className="hdr-btn hdr-btn--ghost hdr-btn--full" onClick={close}>Log in</Link>
              <Link to="/signup" className="hdr-btn hdr-btn--primary hdr-btn--full" onClick={close}>Sign up</Link>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default Header;
