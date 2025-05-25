import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  Button,
  Alert,
  Snackbar,
  Avatar
} from '@mui/material';
import { 
  TrendingUp,
  People,
  Event,
  PhotoCamera
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import CosplayerSearchFilters from '../components/cosplayer/CosplayerSearchFilters';
import CosplayerCarousel from '../components/cosplayer/CosplayerCarousel';
import CosplayerLeaderboard from '../components/common/CosplayerLeaderboard';
import CosplayNews from '../components/common/CosplayNews';
import UserComments from '../components/common/UserComments';
import Footer from '../components/layout/Footer';

const HomePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState('');

  // Load user from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Check for welcome message from login
    if (location.state?.message) {
      setWelcomeMessage(location.state.message);
      setShowWelcomeMessage(true);
    }
  }, [location.state]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setWelcomeMessage('Đã đăng xuất thành công.');
    setShowWelcomeMessage(true);
  };

  // Mock data for cosplayers (8 cosplayers)
  const cosplayers = [
    {
      id: 1,
      name: 'Cosplay A',
      price: 400000,
      category: 'Anime',
      image: '/src/assets/cosplayer1.png',
      location: 'Hà Nội',
      rating: 4.9
    },
    {
      id: 2,
      name: 'Cosplay B',
      price: 450000,
      category: 'Game',
      image: '/src/assets/cosplayer2.png',
      location: 'TP.HCM',
      rating: 4.8
    },
    {
      id: 3,
      name: 'Cosplay C',
      price: 350000,
      category: 'Movie',
      image: '/src/assets/cosplayer3.png',
      location: 'Đà Nẵng',
      rating: 4.7
    },
    {
      id: 4,
      name: 'Cosplay D',
      price: 500000,
      category: 'Original',
      image: '/src/assets/cosplayer4.png',
      location: 'Cần Thơ',
      rating: 4.9
    },
    {
      id: 5,
      name: 'Cosplay E',
      price: 380000,
      category: 'Anime',
      image: '/src/assets/cosplayer5.png',
      location: 'Hải Phòng',
      rating: 4.6
    },
    {
      id: 6,
      name: 'Cosplay F',
      price: 420000,
      category: 'Game',
      image: '/src/assets/cosplayer6.png',
      location: 'Hà Nội',
      rating: 4.8
    },
    {
      id: 7,
      name: 'Cosplay G',
      price: 460000,
      category: 'Historical',
      image: '/src/assets/cosplayer7.png',
      location: 'TP.HCM',
      rating: 4.7
    },
    {
      id: 8,
      name: 'Cosplay H',
      price: 390000,
      category: 'Anime',
      image: '/src/assets/cosplayer8.png',
      location: 'Đà Nẵng',
      rating: 4.9
    }
  ];

  const stats = [
    { icon: <People />, label: 'Active Cosplayers', value: '10K+' },
    { icon: <Event />, label: 'Events This Month', value: '150+' },
    { icon: <PhotoCamera />, label: 'Photos Shared', value: '50K+' },
    { icon: <TrendingUp />, label: 'Connections Made', value: '2.5K+' }
  ];

  const handleSearch = (filters) => {
    console.log('Search with filters:', filters);
    // Handle search logic here
  };

  const handleFiltersChange = (filters) => {
    console.log('Filters changed:', filters);
    // Handle filter change logic here
  };

  const handleSeeAll = () => {
    console.log('See all cosplayers');
    navigate("/cosplayers");  // Assuming you have a route for cosplayers
    // Navigate to cosplayers page
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        {/* Header */}
        <Header user={user} onLogout={handleLogout} />

        {/* Welcome Message Snackbar */}
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
                  {user?.firstName?.[0] || 'U'}
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Hello, {user?.firstName || 'User'}! 👋
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Bạn đã sẵn sàng để khám phá thế giới cosplay chưa?
                </Typography>
              </Box>
            )}
          </Container>
        </Box>

        {/* Search Filters Section */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <CosplayerSearchFilters
            onSearch={handleSearch}
            onFiltersChange={handleFiltersChange}
          />
        </Container>

        {/* Featured Cosplayers Carousel */}
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <CosplayerCarousel
            title="Cosplayer nổi bật"
            cosplayers={cosplayers}
            onSeeAll={handleSeeAll}
          />
        </Container>

        {/* Leaderboard and News Section */}
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

       

        {/* User Comments Section */}
        <Container maxWidth="lg" sx={{ py: 2 }}>
          <UserComments />
        </Container>

        

        {/* Footer */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default HomePage;