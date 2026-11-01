import React from "react";
import { Link } from "react-router-dom";
import "./StaticPage.css";

export const POSTS = [
  {
    slug: "10-things-check-before-buying-used-car-kerala",
    tag: "Buying Guide",
    title: "10 Things to Check Before Buying a Used Car in Kerala",
    excerpt: "From RC book verification to engine inspection — a complete pre-purchase checklist every buyer needs.",
    date: "Oct 5, 2024",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=800&auto=format&fit=crop",
    content: [
      { heading: "1. Verify the RC Book", body: "The Registration Certificate (RC) is the most important document. Confirm the vehicle chassis number, engine number, and owner name match exactly. Check whether any hypothecation (loan) is noted — if yes, get a No Objection Certificate (NOC) from the bank before purchase." },
      { heading: "2. Check Insurance Status", body: "A valid insurance policy protects you from day one. Ask for the original insurance certificate and verify its expiry date. Check if it is a comprehensive policy or third-party only — comprehensive coverage is preferable for used cars." },
      { heading: "3. Inspect the Engine Bay", body: "Look for oil leaks, rust, or signs of a replaced engine. Check all fluid levels — engine oil, coolant, brake fluid, and power steering fluid. A clean engine bay is a good sign; an excessively cleaned one may hide leaks." },
      { heading: "4. Test Drive on Multiple Road Types", body: "Drive the car on city roads, highways, and bumpy surfaces if possible. Listen for unusual sounds — rattles, squeaks, or vibrations. Test the brakes hard at low speed in a safe area. Check the gearbox feels smooth across all gears." },
      { heading: "5. Check the Body for Accident History", body: "Run your hand along panel gaps — uneven spacing indicates accident repair. Look for mismatched paint under direct sunlight. Check door hinges and the boot lid for alignment issues. A magnet can reveal hidden filler behind repainted panels." },
      { heading: "6. Verify the Odometer Reading", body: "Low mileage sounds great but can be tampered with. Cross-check the reading against service records. A well-maintained 80,000 km car is often better than a tampered 30,000 km one with no service history." },
      { heading: "7. Inspect Tyres and Brakes", body: "All four tyres should have even tread depth. Uneven wear suggests alignment or suspension issues. Ask when the brake pads were last replaced. Check the spare tyre condition and ensure the jack and toolkit are present." },
      { heading: "8. Test All Electrical Systems", body: "Test every electric feature — AC, all windows, central locking, infotainment system, all lights, parking sensors, and reverse camera if present. Electrical repairs can be expensive, so anything not working is a strong negotiation point." },
      { heading: "9. Get a Pre-Purchase Inspection", body: "For any significant purchase, pay a qualified mechanic to inspect the car independently. This is money well spent — they can spot issues you might miss and give you written documentation of the vehicle's true condition." },
      { heading: "10. Verify No Pending Challans or Finance", body: "Check the vehicle number on Parivahan.gov.in for any pending traffic challans. Use the RTO portal to confirm the car has no active loans. A clear NOC from the bank and a clean challan record are mandatory before ownership transfer." },
    ],
  },
  {
    slug: "how-to-price-your-used-car-right",
    tag: "Selling Tips",
    title: "How to Price Your Used Car Right and Sell Fast",
    excerpt: "Overpricing kills deals. Underpricing loses money. Here is the data-driven approach to finding the sweet spot.",
    date: "Sep 20, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?q=80&w=800&auto=format&fit=crop",
    content: [
      { heading: "Start With Market Research", body: "Search VandiMart, OLX, and CarDekho for the same make, model, year, variant, and fuel type in your city. Note the asking prices — not the selling prices. Asking prices are typically 5 to 10% higher than what buyers actually pay." },
      { heading: "Factor in Mileage", body: "Every 10,000 km above average affects depreciation. The average Indian car is driven 12,000 to 15,000 km per year. A 5-year-old car with 100,000 km has covered more than average and should be priced lower than a similar car with 60,000 km." },
      { heading: "Condition Matters More Than Age", body: "A well-maintained 6-year-old car in excellent condition can command more than a neglected 4-year-old car. Buyers pay for assurance. Full service history, original paint, working accessories — these justify a premium." },
      { heading: "Price for Negotiation", body: "Build 5 to 8% negotiation room into your asking price. If your target price is Rs 5.5 lakh, list at Rs 5.85 to 5.9 lakh. Buyers feel they have won something when they negotiate you down, and you still get what you wanted." },
      { heading: "Respond Quickly to Enquiries", body: "The faster you respond, the more serious you appear. Buyers contact multiple sellers simultaneously. If you take 48 hours to reply, they have often already committed elsewhere. Aim to respond within 2 to 4 hours during the day." },
    ],
  },
  {
    slug: "electric-cars-kerala-used-market-2024",
    tag: "Market Trends",
    title: "Electric Cars in Kerala: What the Used Market Looks Like in 2024",
    excerpt: "EV adoption is rising fast. We analysed 500+ listings to show you what is available and at what price.",
    date: "Sep 10, 2024",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?q=80&w=800&auto=format&fit=crop",
    content: [
      { heading: "Kerala's EV Market Is Maturing", body: "Kerala has one of India's highest EV adoption rates, driven by government incentives, high fuel prices, and progressive infrastructure. This means the used EV market is more developed here than in most other states." },
      { heading: "Most Popular Models in the Used Market", body: "The Tata Nexon EV dominates used EV listings, around 45% of all EVs listed in Kerala. The MG ZS EV and Tata Tigor EV follow. International models like the Hyundai Kona Electric appear in the premium segment." },
      { heading: "What to Check When Buying a Used EV", body: "Battery health is the most critical factor. Ask for the State of Health (SoH) report from a service centre — anything above 80% is considered good. Check the number of full charge cycles and whether the car was primarily charged at home or fast-charged frequently." },
      { heading: "Pricing Trends", body: "Used Nexon EVs (2021 to 2023) are currently listed between Rs 12 to 18 lakh depending on variant and condition. Battery warranties typically cover 8 years or 1.6 lakh km — check how much of this remains." },
      { heading: "Charging Infrastructure in Kerala", body: "Kerala's charging network has grown significantly. Most major cities now have public fast chargers, and home charging is straightforward if you have dedicated parking. Check KSEB's portal for charger locations near your home and workplace before buying." },
    ],
  },
  {
    slug: "petrol-vs-diesel-vs-cng-kerala",
    tag: "Buying Guide",
    title: "Petrol vs Diesel vs CNG: Which Fuel Type is Right for You?",
    excerpt: "Running costs, resale value, and availability — a practical comparison for Kerala roads.",
    date: "Aug 28, 2024",
    readTime: "5 min read",
    image: "https://images.unsplash.com/photo-1621993202268-50d5f9a01b13?q=80&w=800&auto=format&fit=crop",
    content: [
      { heading: "Petrol: Best for City Driving", body: "Petrol engines are smoother, quieter, and have lower maintenance costs. They are ideal if you drive under 1,200 km per month primarily in the city. Resale value is strong for petrol hatchbacks and small sedans in Kerala." },
      { heading: "Diesel: Best for High Mileage", body: "Diesel makes financial sense if you drive 1,500+ km per month or do frequent highway trips. Fuel cost per km is lower. However, diesel service costs are higher, and BS6 diesel engines have complex DPF systems that can be expensive to repair." },
      { heading: "CNG: Lowest Running Cost", body: "CNG offers the lowest per-km running cost. Factory-fitted CNG is preferable to retrofitted kits. The downside is boot space reduction and fewer CNG stations in Kerala compared to North India." },
      { heading: "Kerala Specifics", body: "Kerala's terrain — frequent hills, coastal humidity — slightly favours petrol and diesel. Diesel SUVs perform well on hilly routes to Munnar and Wayanad. For Kochi city commuters, petrol or hybrid is perfectly adequate." },
    ],
  },
  {
    slug: "used-car-loans-kerala-banks-nbfc",
    tag: "Finance",
    title: "Used Car Loans in Kerala: Banks, NBFCs and What to Watch Out For",
    excerpt: "Interest rates, processing fees, and hidden clauses — everything you need to know before signing.",
    date: "Aug 15, 2024",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=800&auto=format&fit=crop",
    content: [
      { heading: "Banks vs NBFCs", body: "Banks (SBI, HDFC, ICICI) typically offer lower interest rates (10 to 14% p.a.) but have stricter eligibility. NBFCs (Mahindra Finance, Shriram Transport) approve faster with more flexible criteria but charge 14 to 22% p.a." },
      { heading: "Loan-to-Value (LTV) Ratio", body: "Most lenders finance 70 to 85% of the car's value. For a Rs 6 lakh used car, expect to pay Rs 90,000 to 1.8 lakh upfront plus processing fees. Higher LTV loans exist but come with higher interest rates." },
      { heading: "Watch Out for Processing Fees", body: "Processing fees range from 0.5% to 2% of the loan amount. Some lenders bundle insurance premiums into the loan. Always ask for a complete fee schedule before signing any documents." },
      { heading: "Prepayment and Foreclosure Charges", body: "Many NBFCs charge 2 to 5% of outstanding principal as foreclosure penalty. Banks under RBI guidelines generally cannot charge prepayment penalties on floating rate loans. Negotiate this clause before signing." },
      { heading: "Car Age Restrictions", body: "Most banks will not finance cars older than 10 years at the time of loan maturity. If buying a 7-year-old car and wanting a 5-year loan, the car will be 12 years old at maturity — most banks will decline this." },
    ],
  },
  {
    slug: "car-photos-maximum-enquiries",
    tag: "Selling Tips",
    title: "How to Take Great Photos of Your Car for Maximum Enquiries",
    excerpt: "Listings with 8+ quality photos get 3x more enquiries. Here is our simple photography guide.",
    date: "Aug 2, 2024",
    readTime: "4 min read",
    image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop",
    content: [
      { heading: "Timing and Location", body: "Shoot during the golden hour — one hour after sunrise or before sunset. Overcast days also work well as they provide even diffused light. Avoid midday sun which creates unflattering reflections. Choose a clean uncluttered background." },
      { heading: "Required Exterior Shots", body: "You need: front 3/4 view (most important), rear 3/4 view, both sides, close-up of any damage, wheel and tyre tread, and headlight or taillight close-ups. Never skip the front three-quarter shot — it is what buyers see first." },
      { heading: "Interior Shots", body: "Dashboard and instrument cluster (with engine running to show no warning lights), front seats, rear seats with legroom shown, boot open, infotainment screen showing the interface, and odometer reading." },
      { heading: "Engine Bay", body: "Include at least one clean engine bay shot — this alone reassures many buyers. Wipe down the plastic covers before shooting. Show the VIN plate if visible for extra trust." },
      { heading: "Phone Tips", body: "Use portrait or landscape mode — never zoomed in. Enable HDR mode for better dynamic range. Clean your camera lens before shooting. Take multiple shots of each angle and keep the sharpest one. Never use flash." },
    ],
  },
];

export default function Blog() {
  return (
    <>
      <div className="sp-hero">
        <span className="sp-hero-eyebrow">VandiMart Blog</span>
        <h1 className="sp-hero-title">Tips, Trends &amp; Insights</h1>
        <p className="sp-hero-sub">
          Expert guides for buying and selling used cars in Kerala — written by people who know the market inside out.
        </p>
      </div>

      <div className="sp-body sp-body--wide">
        <div className="sp-blog-grid">
          {POSTS.map((p) => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="sp-blog-card sp-blog-card--link">
              <div className="sp-blog-img-wrap">
                <img src={p.image} alt={p.title} loading="lazy" />
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
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
