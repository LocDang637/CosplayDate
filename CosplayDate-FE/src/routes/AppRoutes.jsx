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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/cosplayers" element={<Cosplayers />} />
      <Route path="/cosplayer/:id" element={<CosplayerDetailsPage />} />
      
      {/* Profile routes - both own profile and viewing others */}
      <Route path="/profile" element={<ProfilePage />} /> {/* Own profile */}
      <Route path="/profile/:userId" element={<ProfilePage />} /> {/* Other user's profile */}
      
      {/* Protected routes if you want to add any */}
      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            {/* Create ProfileEditPage component later */}
            <div>Profile Edit Page - Coming Soon!</div>
          </ProtectedRoute>
        }
      />
      
      {/* Optional future routes
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms-of-service" element={<TermsOfServicePage />} /> */}
      
    </Routes>
  );
}

export default AppRoutes;