import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import ProfilePage from "../pages/ProfilePage";
import ProtectedRoute from "../components/ProtectedRoute";
import Cosplayers from "../pages/CosplayersPage";
import CosplayerDetailsPage from "../pages/CosplayerDetailsPage";
import CustomerProfilePage from "../pages/CustomerProfilePage";
import CosplayerPolicyPage from "../pages/CosplayerPolicyPage";
import CosplayerProfilePage from "../pages/CosplayerProfilePage";
import PaymentSuccessPage from "../pages/PaymentSuccessPage";
import PaymentFailedPage from "../pages/PaymentFailedPage";
import BecomeCosplayerPage from "../pages/BecomeCosplayerPage";
import BookingPage from "../pages/BookingPage";
import MyBookingsPage from "../pages/MyBookingsPage";
import PaymentRedirectHandler from "../components/wallet/PaymentRedirectHandler";
import AdminProtectedRoute from "../components/AdminProtectedRoute";
import AdminDashboardPage from "../pages/AdminDashboardPage";
function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Payment routes */}
      <Route path="/payment/success" element={<PaymentSuccessPage />} />
      <Route path="/payment/cancel" element={<PaymentFailedPage />} />

      <Route path="/payment/*" element={<PaymentRedirectHandler />} />


      {/* Cosplayer public routes */}
      <Route path="/cosplayers" element={<Cosplayers />} />
      <Route path="/cosplayer/:id" element={<CosplayerDetailsPage />} />
      <Route path="/cosplayer-policy" element={<CosplayerPolicyPage />} />


      {/* Become Cosplayer route */}
      <Route
        path="/become-cosplayer"
        element={
          <ProtectedRoute>
            <BecomeCosplayerPage />
          </ProtectedRoute>
        }
      />

      {/* Profile routes */}
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile/:userId"
        element={
          <ProtectedRoute>
            <CosplayerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-profile"
        element={
          <ProtectedRoute>
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer-profile/:userId"
        element={
          <ProtectedRoute>
            <CustomerProfilePage />
          </ProtectedRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <div>Profile Edit Page - Coming Soon!</div>
          </ProtectedRoute>
        }
      />

      {/* Booking routes */}
      <Route
        path="/booking/:cosplayerId"
        element={
          <ProtectedRoute>
            <BookingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bookings"
        element={
          <ProtectedRoute>
            <MyBookingsPage />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <AdminProtectedRoute>
            <AdminDashboardPage />
          </AdminProtectedRoute>
        }
      />
    </Routes>
  );
}

export default AppRoutes;