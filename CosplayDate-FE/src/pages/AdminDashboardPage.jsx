import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import AdminDashboard from '../components/admin/AdminDashboard';
import { userUtils } from '../services/api';

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = userUtils.getCurrentUser();
    
    // Check if user is admin
    if (!currentUser || currentUser.userType !== 'Admin') {
      navigate('/login');
      return;
    }
    
    setUser(currentUser);
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    userUtils.clearUserData();
    navigate('/login');
  };

  if (!user) {
    return null; // or loading spinner
  }

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Header user={user} onLogout={handleLogout} />
      <AdminDashboard />
      <Footer />
    </ThemeProvider>
  );
};

export default AdminDashboardPage;