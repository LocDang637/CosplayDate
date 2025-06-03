// src/routes/AppRoutes.jsx - Updated with cosplayer routes
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

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Cosplayer public routes */}
      <Route path="/cosplayers" element={<Cosplayers />} />
      <Route path="/cosplayer/:id" element={<CosplayerDetailsPage />} />
      <Route path="/cosplayer-policy" element={<CosplayerPolicyPage />} />
      
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
      
      {/* Future routes */}
      {/* 
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} />
      <Route path="/booking/:cosplayerId" element={<BookingPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/messages/:cosplayerId" element={<ChatPage />} />
      */}
      
    </Routes>
  );
}

export default AppRoutes;