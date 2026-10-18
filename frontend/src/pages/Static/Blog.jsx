import React from "react";
import "./StaticPage.css";

const POSTS = [
  {
    tag: "Buying Guide",
    title: "10 Things to Check Before Buying a Used Car in Kerala",
    excerpt: "From RC book verification to engine inspection — a complete pre-purchase checklist every buyer needs.",
    date: "Oct 5, 2024",
    readTime: "6 min read",
  },
  {
    tag: "Selling Tips",
    title: "How to Price Your Used Car Right and Sell Fast",
    excerpt: "Overpricing kills deals. Underpricing loses money. Here's the data-driven approach to finding the sweet spot.",
    date: "Sep 20, 2024",
    readTime: "5 min read",
  },
  {
    tag: "Market Trends",
    title: "Electric Cars in Kerala: What the Used Market Looks Like in 2024",
    excerpt: "EV adoption is rising fast. We analysed 500+ listings to show you what's available and at what price.",
    date: "Sep 10, 2024",
    readTime: "7 min read",
  },
  {
    tag: "Buying Guide",
    title: "Petrol vs Diesel vs CNG: Which Fuel Type is Right for You?",
    excerpt: "Running costs, resale value, and availability — a practical comparison for Kerala roads.",
    date: "Aug 28, 2024",
    readTime: "5 min read",
  },
  {
    tag: "Finance",
    title: "Used Car Loans in Kerala: Banks, NBFCs and What to Watch Out For",
    excerpt: "Interest rates, processing fees, and hidden clauses — everything you need to know before signing.",
    date: "Aug 15, 2024",
    readTime: "8 min read",
  },
  {
    tag: "Selling Tips",
    title: "How to Take Great Photos of Your Car for Maximum Enquiries",
    excerpt: "Listings with 8+ quality photos get 3× more enquiries. Here's our simple photography guide.",
    date: "Aug 2, 2024",
    readTime: "4 min read",
  },
];

export default function Blog() {
  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">VandiMart Blog</span>
        <h1 className="sp-hero-title">Tips, Trends & Insights</h1>
        <p className="sp-hero-sub">
          Expert guides for buying and selling used cars in Kerala — written by people who know the market inside out.
        </p>
      </div>

      <div className="sp-body sp-body--wide">
        <div className="sp-blog-grid">
          {POSTS.map((p) => (
            <div key={p.title} className="sp-blog-card">
              <div className="sp-blog-img-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="sp-blog-body">
                <span className="sp-blog-tag">{p.tag}</span>
                <div className="sp-blog-title">{p.title}</div>
                <div className="sp-blog-excerpt">{p.excerpt}</div>
                <div className="sp-blog-meta">
                  <span>{p.date}</span>
                  <span>·</span>
                  <span>{p.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
