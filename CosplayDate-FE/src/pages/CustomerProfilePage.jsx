import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
  Snackbar
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';

// Import components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CustomerProfileHeader from '../components/profile/CustomerProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import CustomerProfileOverview from '../components/profile/CustomerProfileOverview';
import CustomerWallet from '../components/profile/CustomerWallet';
import CustomerBookingHistory from '../components/profile/CustomerBookingHistory';
import ProfileGallery from '../components/profile/ProfileGallery';

const CustomerProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Check if viewing own profile
  const isOwnProfile = !userId || user?.id === parseInt(userId);

  // Load current user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mock customer profile data
  const mockCustomerProfile = {
    id: userId ? parseInt(userId) : user?.id || 1,
    firstName: userId ? 'Other Customer' : user?.firstName || 'Mai',
    lastName: userId ? 'Profile' : user?.lastName || 'Nguyen',
    email: userId ? 'customer@cosplaydate.com' : user?.email || 'mai@cosplaydate.com',
    avatar: '/src/assets/cosplayer1.png',
    isVerified: true,
    isOnline: true,
    location: 'Ho Chi Minh City, Vietnam',
    bio: 'Passionate cosplay enthusiast and event organizer. I love discovering new cosplayers and bringing creative visions to life. Always excited to collaborate on unique cosplay experiences and support the community.',
    totalBookings: 23,
    favoriteCosplayers: 12,
    reviewsGiven: 18,
    avgResponseTime: '< 30 minutes',
    completionRate: '98%',
    memberSince: 'January 2023',
    avgRatingGiven: '4.7',
    interests: ['Anime', 'Gaming', 'Photography', 'Events', 'Conventions', 'Original Characters'],
    membershipTier: 'Gold',
    loyaltyPoints: 3750,
    walletBalance: 2500000,
    activeBookings: 2,
  };

  const mockStats = {
    totalBookings: 23,
    totalSpent: 8500000,
    favoriteCosplayers: 12,
    reviewsGiven: 18,
    completedBookings: 21,
    cancelledBookings: 2,
    avgBookingValue: 369565,
  };

  const mockFavoriteCategories = [
    { name: 'Anime Cosplay', bookings: 12, color: '#E91E63' },
    { name: 'Game Characters', bookings: 7, color: '#9C27B0' },
    { name: 'Photoshoots', bookings: 3, color: '#673AB7' },
    { name: 'Events', bookings: 1, color: '#3F51B5' },
  ];

  const mockRecentActivity = [
    {
      icon: '📸',
      title: 'Completed photoshoot session',
      description: 'Rated 5 stars for Cosplay A session',
      time: '2 hours ago'
    },
    {
      icon: '💰',
      title: 'Wallet top-up',
      description: 'Added 1,000,000đ to wallet',
      time: '1 day ago'
    },
    {
      icon: '📅',
      title: 'New booking confirmed',
      description: 'Convention appearance with Cosplay D',
      time: '2 days ago'
    },
    {
      icon: '⭐',
      title: 'Left detailed review',
      description: 'Reviewed experience with Cosplay C',
      time: '3 days ago'
    },
    {
      icon: '🎯',
      title: 'Reached Gold tier',
      description: 'Unlocked Gold membership benefits',
      time: '1 week ago'
    },
  ];

  const mockCustomerPhotos = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    url: `/src/assets/cosplayer${(index % 8) + 1}.png`,
    title: `Event Photo ${index + 1}`,
    description: `Amazing cosplay event experience #${index + 1}`,
    category: ['event', 'photoshoot', 'convention', 'meetup'][index % 4],
    likes: Math.floor(Math.random() * 100) + 20,
    tags: ['cosplay', 'event', 'memories', 'community'],
  }));

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProfileUser(mockCustomerProfile);
        setIsFollowing(Math.random() > 0.5); // Random follow status

      } catch (err) {
        setError('Failed to load profile. Please try again.');
        console.error('Profile loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId, user]);

  // Event handlers
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    console.log('Edit profile clicked');
    showSnackbar('Edit profile functionality coming soon!', 'info');
  };

  const handleEditAvatar = () => {
    console.log('Edit avatar clicked');
    showSnackbar('Avatar upload functionality coming soon!', 'info');
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    showSnackbar(
      isFollowing ? 'Unfollowed successfully' : 'Following successfully', 
      'success'
    );
  };

  const handleAddPhoto = () => {
    console.log('Add photo clicked');
    showSnackbar('Photo upload functionality coming soon!', 'info');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Customer-specific tab counts
  const customerTabCounts = {
    photos: mockCustomerPhotos.length,
    videos: 0,
    reviews: mockStats.reviewsGiven,
    events: mockStats.totalBookings,
    achievements: 8,
    favorites: mockStats.favoriteCosplayers,
    bookings: mockStats.totalBookings,
    wallet: 1,
  };

  // Customer tabs configuration
  const customerTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: 'Info',
      show: true
    },
    {
      id: 'wallet',
      label: 'Wallet',
      icon: 'AccountBalanceWallet',
      show: isOwnProfile // Only show for own profile
    },
    {
      id: 'bookings',
      label: 'Bookings',
      icon: 'Event',
      count: customerTabCounts.bookings,
      show: isOwnProfile // Only show for own profile
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: 'PhotoLibrary',
      count: customerTabCounts.photos,
      show: true
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: 'Favorite',
      count: customerTabCounts.favorites,
      show: isOwnProfile // Only show for own profile
    }
  ];

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <CustomerProfileOverview
            user={profileUser}
            stats={mockStats}
            recentActivity={mockRecentActivity}
            favoriteCategories={mockFavoriteCategories}
            walletBalance={profileUser?.walletBalance}
            loyaltyPoints={profileUser?.loyaltyPoints}
            membershipTier={profileUser?.membershipTier}
          />
        );
      case 'wallet':
        return (
          <CustomerWallet
            balance={profileUser?.walletBalance}
            loyaltyPoints={profileUser?.loyaltyPoints}
          />
        );
      case 'bookings':
        return <CustomerBookingHistory />;
      case 'gallery':
        return (
          <ProfileGallery
            photos={mockCustomerPhotos}
            isOwnProfile={isOwnProfile}
            onAddPhoto={handleAddPhoto}
            loading={false}
          />
        );
      case 'favorites':
        return (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(233, 30, 99, 0.1)',
          }}>
            <h3>Favorite Cosplayers</h3>
            <p>Your favorite cosplayers will appear here!</p>
          </Box>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (loading) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            <Box sx={{ mt: 2 }}>
              <h3>Loading customer profile...</h3>
            </Box>
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Alert 
              severity="error" 
              sx={{ mb: 4, borderRadius: '12px' }}
              action={
                <Button color="inherit" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
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
          {/* Customer Profile Header */}
          <CustomerProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onEditAvatar={handleEditAvatar}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
            walletBalance={profileUser?.walletBalance}
            membershipTier={profileUser?.membershipTier}
          />

          {/* Customer Profile Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            counts={customerTabCounts}
            customTabs={customerTabs}
          />

          {/* Tab Content */}
          <Box sx={{ minHeight: '400px' }}>
            {renderTabContent()}
          </Box>
        </Container>

        <Footer />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            sx={{ borderRadius: '12px' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CustomerProfilePage;