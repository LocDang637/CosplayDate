// src/pages/BecomeCosplayerPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CircularProgress } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';

// Import components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import BecomeCosplayerForm from '../components/cosplayer/BecomeCosplayerForm';

const BecomeCosplayerPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        // Check if user is already a cosplayer
        if (parsedUser.userType === 'Cosplayer') {
          navigate(`/profile/${parsedUser.id}`, {
            state: { message: 'Bạn đã là Cosplayer rồi!' }
          });
          return;
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
    } else {
      navigate('/login');
      return;
    }
    setLoading(false);
  }, [navigate]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleSuccess = (updatedUser, cosplayerData) => {
    // Update user state
    setUser(updatedUser);
    
    // Navigate to profile with success message
    navigate(`/profile/${updatedUser.id}`, {
      state: {
        message: cosplayerData.message || 'Chúc mừng! Bạn đã trở thành Cosplayer.',
        upgraded: true
      }
    });
  };

  if (loading) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />
        
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <BecomeCosplayerForm 
            user={user} 
            onSuccess={handleSuccess}
          />
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default BecomeCosplayerPage;
