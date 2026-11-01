import React from "react";
import { Link, useParams } from "react-router-dom";
import { POSTS } from "./Blog";
import "./StaticPage.css";
import "./BlogPost.css";

export default function BlogPost() {
  const { slug } = useParams();
  const post = POSTS.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"50vh", gap:16, textAlign:"center", padding:40 }}>
        <h2 style={{ fontSize:24, color:"#0f172a" }}>Post not found</h2>
        <Link to="/blog" style={{ color:"#2563eb", fontWeight:600, textDecoration:"none" }}>← Back to Blog</Link>
      </div>
    );
  }

  return (
    <>
      <div className="bp-hero">
        <div className="bp-hero-img-wrap">
          <img src={post.image} alt={post.title} className="bp-hero-img" />
          <div className="bp-hero-overlay" />
        </div>
        <div className="bp-hero-content">
          <Link to="/blog" className="bp-back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Blog
          </Link>
          <span className="bp-tag">{post.tag}</span>
          <h1 className="bp-title">{post.title}</h1>
          <div className="bp-meta">
            <span>{post.date}</span>
            <span className="bp-meta-dot">·</span>
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>

      <div className="bp-body">
        <p className="bp-lead">{post.excerpt}</p>

        {post.content.map((section, i) => (
          <div key={i} className="bp-section">
            <h2 className="bp-section-heading">{section.heading}</h2>
            <p className="bp-section-body">{section.body}</p>
          </div>
        ))}

        <div className="bp-footer-cta">
          <p className="bp-footer-text">
            Ready to find your next car? Browse thousands of verified listings on VandiMart.
          </p>
          <div className="bp-footer-actions">
            <Link to="/used-cars" className="bp-btn bp-btn--primary">Browse Cars</Link>
            <Link to="/blog" className="bp-btn bp-btn--ghost">← More Articles</Link>
          </div>
        </div>
      </div>
    </>
  );
}
