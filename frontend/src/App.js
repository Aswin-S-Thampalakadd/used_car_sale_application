import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

import HomePage from "./pages/HomePage";
import CarDetails from "./pages/CarDetails/CarDetails";
import ExploreCars from "./pages/ExploreCars/ExploreCars";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import DealerDashboard from "./pages/DealerDashboard/DealerDashboard";
import AddCar from "./pages/AddCar/AddCar";
import Favourites from "./pages/Favourites/Favourites";
import Enquiries from "./pages/Enquiries/Enquiries";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/used-cars" element={<ExploreCars />} />
          <Route path="/used-cars/:id" element={<CarDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<DealerDashboard />} />
          <Route path="/dashboard/add-car" element={<AddCar />} />
          <Route path="/dashboard/edit-car/:id" element={<AddCar />} />
          <Route path="/favourites" element={<Favourites />} />
          <Route path="/enquiries" element={<Enquiries />} />
        </Routes>
        <Footer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
