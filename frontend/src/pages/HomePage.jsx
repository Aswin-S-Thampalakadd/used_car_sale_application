import React from "react";
import Header from "../components/Header/Header";
import Banner from "../components/Banner/Banner";
import BrowseByCategory from "../sections/Browsebycategory/Browsebycategory";
import FeaturedListings from "../sections/Featuredlistings/Featuredlistings";
import TrustStrip from "../sections/Truststrip/Truststrip";
import HowItWorks from "../sections/HowItWorks/HowItWorks";
import SellYourCar from "../sections/SellYourCar/SellYourCar";

function HomePage() {
  return (
    <div>
      <Header />
      <Banner />
      <BrowseByCategory />
      <FeaturedListings />
      <TrustStrip />
      <HowItWorks />
      <SellYourCar />
    </div>
  );
}

export default HomePage;
