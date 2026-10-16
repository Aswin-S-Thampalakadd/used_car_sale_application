import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
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

// Admin pages
import AdminLogin from "./pages/Admin/AdminLogin";
import AdminLayout from "./pages/Admin/AdminLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminDealers from "./pages/Admin/AdminDealers";
import AdminCustomers from "./pages/Admin/AdminCustomers";
import AdminCars from "./pages/Admin/AdminCars";
import AdminEnquiries from "./pages/Admin/AdminEnquiries";
import AdminReviews from "./pages/Admin/AdminReviews";
import AdminSubscriptions from "./pages/Admin/AdminSubscriptions";

/** Redirects to /admin/login if the user is not an authenticated admin */
function ProtectedAdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();

  // Wait for auth state to be read from storage before deciding.
  // Without this, a hard-refresh to /admin/cars would flash-redirect to
  // /admin/login even when the admin is already logged in.
  if (isInitializing) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        minHeight: "100vh", background: "#0f172a",
      }}>
        <div style={{
          width: 36, height: 36,
          border: "3px solid rgba(255,255,255,0.15)",
          borderTopColor: "#3b82f6",
          borderRadius: "50%",
          animation: "spin 0.75s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in → admin login page
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Logged in but not admin (dealer / customer) → home
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

/** Protects dealer-only routes */
function ProtectedDealerRoute({ children }) {
  const { isAuthenticated, isDealer, isInitializing } = useAuth();

  if (isInitializing) return null; // page already has its own loading state

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isDealer)        return <Navigate to="/" replace />;

  return children;
}

/** Protects routes that require any authenticated user */
function ProtectedUserRoute({ children }) {
  const { isAuthenticated, isInitializing } = useAuth();

  if (isInitializing) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
}

/** Redirects already-logged-in admins away from the login page */
function AdminLoginRoute() {
  const { isAuthenticated, isAdmin, isInitializing } = useAuth();
  if (isInitializing) return null;
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <AdminLogin />;
}

/** Public site routes — hide Header/Footer on admin routes */
function PublicLayout({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ── Public / dealer / customer routes ── */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <HomePage />
              </PublicLayout>
            }
          />
          <Route
            path="/used-cars"
            element={
              <PublicLayout>
                <ExploreCars />
              </PublicLayout>
            }
          />
          <Route
            path="/used-cars/:id"
            element={
              <PublicLayout>
                <CarDetails />
              </PublicLayout>
            }
          />
          <Route
            path="/login"
            element={
              <PublicLayout>
                <Login />
              </PublicLayout>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicLayout>
                <Signup />
              </PublicLayout>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PublicLayout>
                <ProtectedDealerRoute>
                  <DealerDashboard />
                </ProtectedDealerRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/dashboard/add-car"
            element={
              <PublicLayout>
                <ProtectedDealerRoute>
                  <AddCar />
                </ProtectedDealerRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/dashboard/edit-car/:id"
            element={
              <PublicLayout>
                <ProtectedDealerRoute>
                  <AddCar />
                </ProtectedDealerRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/favourites"
            element={
              <PublicLayout>
                <ProtectedUserRoute>
                  <Favourites />
                </ProtectedUserRoute>
              </PublicLayout>
            }
          />
          <Route
            path="/enquiries"
            element={
              <PublicLayout>
                <ProtectedUserRoute>
                  <Enquiries />
                </ProtectedUserRoute>
              </PublicLayout>
            }
          />

          {/* ── Admin routes — no Header/Footer ── */}
          <Route path="/admin/login" element={<AdminLoginRoute />} />

          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminLayout />
              </ProtectedAdminRoute>
            }
          >
            {/* Default redirect from /admin → /admin/dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard"     element={<AdminDashboard />} />
            <Route path="dealers"       element={<AdminDealers />} />
            <Route path="customers"     element={<AdminCustomers />} />
            <Route path="cars"          element={<AdminCars />} />
            <Route path="enquiries"     element={<AdminEnquiries />} />
            <Route path="reviews"       element={<AdminReviews />} />
            <Route path="subscriptions" element={<AdminSubscriptions />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
