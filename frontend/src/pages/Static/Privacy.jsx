import React from "react";
import "./StaticPage.css";

const SECTIONS = [
  {
    id: "collect",
    title: "1. Information We Collect",
    content: `We collect information you provide directly: name, email address, phone number, and account credentials when you register. Dealers additionally provide business details and vehicle listing data. We also collect usage data automatically — pages visited, search queries, device type, IP address, and browser information — to improve the Platform.`,
  },
  {
    id: "use",
    title: "2. How We Use Your Information",
    content: `We use your information to: operate and improve the Platform; send you notifications about enquiries and listings; communicate about your account; personalise your experience; detect and prevent fraud; and comply with legal obligations. We do not sell your personal data to third parties.`,
  },
  {
    id: "sharing",
    title: "3. Information Sharing",
    content: `We share your information only with: dealers when you submit an enquiry (your contact details are shared so the dealer can follow up); service providers who help us operate the Platform (hosting, analytics, email delivery) under strict data processing agreements; and law enforcement when required by applicable law.`,
  },
  {
    id: "cookies",
    title: "4. Cookies",
    content: `We use cookies and similar tracking technologies to operate the Platform, remember your preferences, and analyse usage. You can control cookies through your browser settings. For full details, see our Cookie Policy.`,
  },
  {
    id: "storage",
    title: "5. Data Storage & Security",
    content: `Your data is stored on secure servers. We implement industry-standard technical and organisational measures to protect your personal data against unauthorised access, alteration, or destruction. No system is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    id: "retention",
    title: "6. Data Retention",
    content: `We retain your personal data for as long as your account is active or as needed to provide services. You may request deletion of your account and associated data by emailing vandimart.support@gmail.com. We may retain certain data for legal compliance purposes.`,
  },
  {
    id: "rights",
    title: "7. Your Rights",
    content: `You have the right to access, correct, or delete your personal data. You may also object to or restrict processing, and request data portability. To exercise these rights, contact us at vandimart.support@gmail.com. We will respond within 30 days.`,
  },
  {
    id: "children",
    title: "8. Children's Privacy",
    content: `VandiMart is not directed at children under 18. We do not knowingly collect personal information from anyone under 18. If you believe we have inadvertently collected such data, please contact us immediately.`,
  },
  {
    id: "changes",
    title: "9. Changes to This Policy",
    content: `We may update this Privacy Policy periodically. We will notify you of significant changes by email or by posting a notice on the Platform. Continued use after changes constitutes acceptance.`,
  },
  {
    id: "contact",
    title: "10. Contact Us",
    content: `For privacy-related enquiries, email vandimart.support@gmail.com.`,
  },
];

export default function Privacy() {
  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">Legal</span>
        <h1 className="sp-hero-title">Privacy Policy</h1>
        <p className="sp-hero-sub">
          How VandiMart collects, uses, and protects your personal data.
        </p>
      </div>

      <div className="sp-body">
        <p className="sp-last-updated">Last updated: October 1, 2024</p>

        <div className="sp-toc">
          <div className="sp-toc-title">Contents</div>
          <ul className="sp-toc-list">
            {SECTIONS.map((s) => (
              <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>
            ))}
          </ul>
        </div>

        {SECTIONS.map((s) => (
          <section key={s.id} id={s.id} className="sp-section">
            <h2 className="sp-section-title">{s.title}</h2>
            <p className="sp-text">{s.content}</p>
          </section>
        ))}
      </div>
    </>
  );
}
