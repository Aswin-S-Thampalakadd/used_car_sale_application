import React from "react";
import "./StaticPage.css";

const SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
    content: `By accessing or using VandiMart ("the Platform"), you agree to be bound by these Terms of Service and all applicable laws. If you do not agree with any part of these terms, you must not use the Platform. These terms apply to all visitors, users, registered customers, and dealers.`,
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
    content: `You must be at least 18 years of age to register an account or use the Platform. By using VandiMart you represent that you meet this requirement. We reserve the right to suspend or terminate accounts found to be operated by minors.`,
  },
  {
    id: "accounts",
    title: "3. User Accounts",
    content: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately at vandimart.support@gmail.com of any unauthorised use of your account. VandiMart will not be liable for losses caused by unauthorised use of your account if you failed to report it promptly.`,
  },
  {
    id: "listings",
    title: "4. Listings and Content",
    content: `Dealers are solely responsible for the accuracy, completeness, and legality of their listings. By posting a listing you confirm that you have the right to sell the vehicle and that all information provided is truthful. VandiMart reserves the right to remove any listing that violates these terms, contains false information, or is otherwise objectionable.`,
  },
  {
    id: "transactions",
    title: "5. Transactions",
    content: `VandiMart is a marketplace platform and is not a party to any transaction between buyer and dealer. All sales, payments, and handovers are conducted directly between the parties. VandiMart is not responsible for the quality, safety, or legality of vehicles listed, nor for the truthfulness of listings, nor for the ability of sellers to sell or buyers to buy.`,
  },
  {
    id: "prohibited",
    title: "6. Prohibited Uses",
    content: `You may not use the Platform to: post false, misleading, or fraudulent listings; infringe intellectual property rights; harvest user data; transmit spam or unsolicited messages; attempt to gain unauthorised access to the Platform or other user accounts; use the Platform for any unlawful purpose.`,
  },
  {
    id: "intellectual",
    title: "7. Intellectual Property",
    content: `All content on VandiMart — including the logo, design, text, graphics, and software — is the property of VandiMart or its licensors and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written permission.`,
  },
  {
    id: "limitation",
    title: "8. Limitation of Liability",
    content: `To the fullest extent permitted by law, VandiMart shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform or any transaction facilitated through it, even if VandiMart has been advised of the possibility of such damages.`,
  },
  {
    id: "termination",
    title: "9. Termination",
    content: `We reserve the right to suspend or terminate your access to the Platform at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, VandiMart, or third parties.`,
  },
  {
    id: "changes",
    title: "10. Changes to Terms",
    content: `We may update these Terms of Service at any time. We will notify registered users of material changes via email. Continued use of the Platform after changes constitutes acceptance of the updated terms.`,
  },
  {
    id: "contact",
    title: "11. Contact",
    content: `If you have questions about these Terms, please email vandimart.support@gmail.com.`,
  },
];

export default function Terms() {
  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">Legal</span>
        <h1 className="sp-hero-title">Terms of Service</h1>
        <p className="sp-hero-sub">
          Please read these terms carefully before using VandiMart.
        </p>
      </div>

      <div className="sp-body">
        <p className="sp-last-updated">Last updated: October 1, 2024</p>

        {/* Table of contents */}
        <div className="sp-toc">
          <div className="sp-toc-title">Contents</div>
          <ul className="sp-toc-list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.title}</a>
              </li>
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
