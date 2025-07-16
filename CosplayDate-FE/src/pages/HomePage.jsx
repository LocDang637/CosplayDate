// src/pages/HomePage.jsx - Updated with API integration
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import CosplayerSearchFilters from '../components/cosplayer/CosplayerSearchFilters';
import CosplayerCarousel from '../components/cosplayer/CosplayerCarousel';
import CosplayerLeaderboard from '../components/common/CosplayerLeaderboard';
import CosplayNews from '../components/common/CosplayNews';
import UserComments from '../components/common/UserComments';
import Footer from '../components/layout/Footer';
import { cosplayerAPI } from '../services/cosplayerAPI';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [cosplayers, setCosplayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }

    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
      setShowWelcomeMessage(true);
    }
  }, [location.state]);

  useEffect(() => {
    loadFeaturedCosplayers();
  }, []);

  const loadFeaturedCosplayers = async () => {
    try {
      setLoading(true);

      const result = await cosplayerAPI.getCosplayers({
        page: 1,
        pageSize: 8,
        sortBy: 'rating',
        sortOrder: 'desc'
      });

      console.log('HomePage - API Result:', {
        success: result.success,
        dataType: typeof result.data,
        hasCosplayers: !!result.data?.cosplayers,
        cosplayersLength: result.data?.cosplayers?.length || 0,
        data: result.data
      });

      if (result.success && result.data && result.data.cosplayers) {
        // The API now returns structured data with cosplayers array
        const availableCosplayers = result.data.cosplayers.filter(cosplayer => cosplayer.isAvailable !== false);
        setCosplayers(availableCosplayers);
      } else {
        setCosplayers([]);
        console.warn('No cosplayers data received');
      }
    } catch (err) {
      console.error('Failed to load featured cosplayers:', err);
      setCosplayers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setWelcomeMessage('Đã đăng xuất thành công.');
    setShowWelcomeMessage(true);
  };

  const handleSearch = (filters) => {
    navigate('/cosplayers', {
      state: { filters }
    });
  };

  const handleFiltersChange = (filters) => {
    // Real-time filter change handling if needed
  };

  const handleSeeAll = () => {
    navigate("/cosplayers");
  };

  const handleCosplayersUpdate = (cosplayerId, isFollowing) => {
    setCosplayers(prevCosplayers => 
      prevCosplayers.map(cosplayer => 
        cosplayer.id === cosplayerId 
          ? { ...cosplayer, isFollowing }
          : cosplayer
      )
    );
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />

        <Snackbar
          open={showWelcomeMessage}
          autoHideDuration={6000}
          onClose={() => setShowWelcomeMessage(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setShowWelcomeMessage(false)}
            severity="success"
            sx={{ width: '100%', borderRadius: '12px' }}
          >
            {welcomeMessage}
          </Alert>
        </Snackbar>

        {/* Hero Section */}
        <Box
          sx={{
            background: `linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)`,
            py: { xs: 6, md: 8 },
            textAlign: 'center',
          }}
        >
          <Container maxWidth="lg">
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2,
              }}
            >
              Chào mừng đến với CosplayDate! 🎭
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: 'text.secondary',
                mb: 4,
                maxWidth: '600px',
                mx: 'auto',
                lineHeight: 1.6,
                fontSize: '1.8rem',
              }}
            >
              Kết nối với những Cosplayer tuyệt vời, tìm ra người phù hợp nhất và chia sẻ niềm đam mê cosplay của bạn!
            </Typography>

            {!user ? (
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  href="/signup"
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    px: 4,
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'none',
                  }}
                >
                  Tham gia cộng đồng
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="/login"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '16px',
                    fontWeight: 600,
                    borderRadius: '12px',
                    textTransform: 'none',
                  }}
                >
                  Đăng nhập
                </Button>
              </Box>
            ) : (
              <Box sx={{
                background: 'rgba(255,255,255,0.8)',
                borderRadius: '16px',
                p: 3,
                maxWidth: '400px',
                mx: 'auto'
              }}>
                <Avatar sx={{
                  width: 64,
                  height: 64,
                  backgroundColor: 'primary.main',
                  mx: 'auto',
                  mb: 2,
                  fontSize: '24px'
                }}>
                  {user?.firstName?.[0] || 'N'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Xin chào, {user?.displayName || user?.firstName || 'Người dùng'}! 👋
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bạn đã sẵn sàng để khám phá thế giới cosplay chưa?
                </Typography>
              </Box>
            )}
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <CosplayerSearchFilters
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
          />
        </Container>

        <Container maxWidth="lg" sx={{ py: 2 }}>
          <CosplayerCarousel
            title="Cosplayer nổi bật"
            cosplayers={cosplayers}
            onSeeAll={handleSeeAll}
            loading={loading}
            currentUser={user}
            onCosplayersUpdate={handleCosplayersUpdate}
          />
        </Container>

        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Box sx={{
            display: 'flex',
            gap: '10px',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'flex-start',
            alignItems: 'flex-start'
          }}>
            <CosplayerLeaderboard />
            <CosplayNews />
          </Box>
        </Container>

        <Container maxWidth="lg" sx={{ py: 2 }}>
          <UserComments />
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;