import React from "react";
import Banner from "../components/Banner/Banner";
import BrowseByCategory from "../sections/Browsebycategory/Browsebycategory";
import FeaturedListings from "../sections/Featuredlistings/Featuredlistings";
import TrustStrip from "../sections/Truststrip/Truststrip";
import HowItWorks from "../sections/HowItWorks/HowItWorks";
import SellYourCar from "../sections/SellYourCar/SellYourCar";
import Testimonials from "../sections/Testimonials/Testimonials";
import BrowseLinks from "../sections/BrowseLinks/BrowseLinks";

function HomePage() {
  return (
    <div>
      <Banner />
      <BrowseByCategory />
      <FeaturedListings />
      <TrustStrip />
      <HowItWorks />
      <SellYourCar />
      <Testimonials />
      <BrowseLinks />
    </div>
  );
}

export default HomePage;
