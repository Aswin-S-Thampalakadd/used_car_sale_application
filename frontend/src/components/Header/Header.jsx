import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.css";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isAuthenticated, isDealer, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/used-cars?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setSearchOpen(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="header-top">
        <button
          className="menu-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <Link to="/" className="logo">
          Wheelz<span className="logo-accent">Loop</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch} role="search">
          <input
            type="text"
            placeholder="Search by make, model or variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search cars"
          />
          <button className="search-btn" type="submit" aria-label="Search">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>

        <div className="header-actions">
          <button
            className="search-toggle"
            onClick={() => setSearchOpen(!searchOpen)}
            aria-label="Toggle search"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          {isAuthenticated ? (
            <>
              {isDealer ? (
                <Link to="/dashboard" className="action-item">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span className="action-label">Dashboard</span>
                </Link>
              ) : (
                <Link to="/favourites" className="action-item">
                  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                  </svg>
                  <span className="action-label">Saved</span>
                </Link>
              )}

              <Link to="/enquiries" className="action-item">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span className="action-label">Enquiries</span>
              </Link>

              <button className="action-item" onClick={handleLogout}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
                <span className="action-label">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="action-item">
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
                <span className="action-label">Login</span>
              </Link>
            </>
          )}
        </div>
      </div>

      {searchOpen && (
        <form className="mobile-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search for cars..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search cars"
            autoFocus
          />
          <button type="submit" className="search-btn" aria-label="Search">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </form>
      )}

      <nav className={`nav-menu ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
        <ul>
          <li><Link to="/" onClick={() => setMenuOpen(false)}>Home</Link></li>
          <li><Link to="/used-cars" onClick={() => setMenuOpen(false)}>Used Cars</Link></li>
          {isAuthenticated && !isDealer && (
            <li><Link to="/favourites" onClick={() => setMenuOpen(false)}>My Favourites</Link></li>
          )}
          {isAuthenticated && (
            <li><Link to="/enquiries" onClick={() => setMenuOpen(false)}>Enquiries</Link></li>
          )}
          {isDealer && (
            <li><Link to="/dashboard" onClick={() => setMenuOpen(false)} className="nav-offer">Dealer Dashboard</Link></li>
          )}
          {!isAuthenticated && (
            <>
              <li><Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link></li>
              <li><Link to="/signup" onClick={() => setMenuOpen(false)}>Sign Up</Link></li>
            </>
          )}
        </ul>
      </nav>

      {menuOpen && (
        <div className="nav-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true"></div>
      )}
    </header>
  );
}

export default Header;
