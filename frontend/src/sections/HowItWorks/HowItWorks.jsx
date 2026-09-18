import "./HowItWorks.css";

const steps = [
  {
    id: 1,
    title: "Search",
    text: "Filter by budget, brand, fuel type and kilometres driven. Every listing shows real photos and a verified price.",
    icon: (
      <>
        <circle cx="11" cy="11" r="7" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </>
    ),
  },
  {
    id: 2,
    title: "Inspect",
    text: "Read the 150-point inspection report, service history and accident record before you commit to anything.",
    icon: (
      <>
        <path d="M12 3l7 3v6c0 4.5-3 8.3-7 9-4-.7-7-4.5-7-9V6l7-3z" />
        <path d="M9 11l2 2 4-4" />
      </>
    ),
  },
  {
    id: 3,
    title: "Book",
    text: "Reserve the car online with a refundable deposit, then take a free test drive at a time that suits you.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </>
    ),
  },
  {
    id: 4,
    title: "Delivery",
    text: "We handle the RC transfer and insurance, then deliver to your door with a 7-day money-back guarantee.",
    icon: (
      <>
        <path d="M3 13l2-5a2 2 0 0 1 2-1h6a2 2 0 0 1 2 1l1 3h3a2 2 0 0 1 2 2v3h-3" />
        <path d="M3 13v4h2" />
        <circle cx="7.5" cy="17.5" r="2" />
        <circle cx="17.5" cy="17.5" r="2" />
      </>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section className="how-it-works" id="how-it-works">
      <div className="hiw-container">
        <span className="hiw-eyebrow">Simple &amp; Transparent</span>
        <h2 className="hiw-title">How It Works</h2>
        <p className="hiw-subtitle">
          Buying your first used car shouldn&apos;t feel risky. Four steps, zero
          guesswork.
        </p>

        <ol className="hiw-steps">
          {steps.map((step) => (
            <li className="hiw-step" key={step.id}>
              <div className="hiw-step-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {step.icon}
                </svg>
                <span className="hiw-step-number">{step.id}</span>
              </div>
              <h3 className="hiw-step-title">{step.title}</h3>
              <p className="hiw-step-text">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="hiw-cta">
          <a href="#listings" className="hiw-button">
            Browse Cars
          </a>
          <span className="hiw-cta-note">No hidden charges. Ever.</span>
        </div>
      </div>
    </section>
  );
}
