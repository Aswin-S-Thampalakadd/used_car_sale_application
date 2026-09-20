import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";

import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";
import CarDetails from "./pages/CarDetails/CarDetails";
import ExploreCars from "./pages/ExploreCars/ExploreCars";

function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/car" element={<CarDetails />} />
          <Route path="/used-cars" element={<ExploreCars />} />
        </Routes>
      </BrowserRouter>
      <Footer />
    </>
  );
}

export default App;
