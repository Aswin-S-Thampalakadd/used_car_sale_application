import "./TrustStrip.css";

const InspectionIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M16 3l11 4v9c0 6.6-4.4 11.6-11 13.9C9.4 27.6 5 22.6 5 16V7l11-4z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <path
      d="M11 16.2l3.4 3.4L21.5 12"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const WarrantyIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <circle cx="16" cy="13" r="8" stroke="currentColor" strokeWidth="2" />
    <path
      d="M16 9.5l1.5 2.9 3.2.4-2.3 2.2.6 3.2-3-1.6-3 1.6.6-3.2L11.3 12.8l3.2-.4L16 9.5z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M11 20.5L9 29l7-3.2 7 3.2-2-8.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const TransferIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <rect
      x="3"
      y="6"
      width="26"
      height="20"
      rx="3"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path d="M3 12h26" stroke="currentColor" strokeWidth="2" />
    <path
      d="M8 18h7M8 22h4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M19 20h6m0 0l-2.4-2.4M25 20l-2.4 2.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ReturnIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path
      d="M27 16a11 11 0 1 1-3.6-8.1"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M27 4v6h-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 10.5V16l3.8 2.4"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const points = [
  {
    id: "inspection",
    title: "200-point inspection",
    detail:
      "Engine, chassis, electricals and paint checked by our own technicians.",
    icon: InspectionIcon,
  },
  {
    id: "warranty",
    title: "Warranty included",
    detail:
      "12 months on engine and gearbox, valid at any of our service partners.",
    icon: WarrantyIcon,
  },
  {
    id: "rc",
    title: "Free RC transfer",
    detail: "We handle the paperwork and insurance change at no extra cost.",
    icon: TransferIcon,
  },
  {
    id: "return",
    title: "7-day return",
    detail: "Drive it for a week. Not right? Return it and get a full refund.",
    icon: ReturnIcon,
  },
];

export default function TrustStrip({ items = points }) {
  return (
    <section className="trust" aria-labelledby="trust-heading">
      <div className="trust__inner">
        <h2 className="trust__heading" id="trust-heading">
          What you get with every car
        </h2>

        <ul className="trust__grid">
          {items.map((point) => {
            const Icon = point.icon;
            return (
              <li className="trust__item" key={point.id}>
                <span className="trust__icon">
                  <Icon />
                </span>
                <div className="trust__text">
                  <h3 className="trust__title">{point.title}</h3>
                  <p className="trust__detail">{point.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
