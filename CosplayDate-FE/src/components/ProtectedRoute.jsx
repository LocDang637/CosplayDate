import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  // FIXED: Also check localStorage as fallback
  const storedUser = localStorage.getItem('user');
  const isAuthenticated = user || storedUser;
  
  // console.log('🛡️ ProtectedRoute Check:', {
  //   contextUser: !!user,
  //   storedUser: !!storedUser,
  //   isAuthenticated: !!isAuthenticated
  // });

  if (!isAuthenticated) {
    // console.log('❌ ProtectedRoute: No authentication found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  // console.log('✅ ProtectedRoute: Authentication confirmed, allowing access');
  return children;
};

export default ProtectedRoute;
