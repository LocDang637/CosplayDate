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

// Import the new components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import ProfileOverview from '../components/profile/ProfileOverview';
import ProfileGallery from '../components/profile/ProfileGallery';
import ProfileReviews from '../components/profile/ProfileReviews';

const ProfilePage = () => {
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

  // Mock data for demonstration
  const mockProfileUser = {
    id: userId ? parseInt(userId) : user?.id || 1,
    firstName: userId ? 'Other User' : user?.firstName || 'Mai',
    lastName: userId ? 'Profile' : user?.lastName || 'Nguyen',
    email: userId ? 'other@cosplaydate.com' : user?.email || 'mai@cosplaydate.com',
    avatar: '/src/assets/cosplayer1.png',
    isVerified: true,
    isOnline: true,
    location: 'Ho Chi Minh City, Vietnam',
    bio: 'Professional cosplayer specializing in anime and game characters. I love bringing fictional characters to life through detailed costumes and authentic portrayals. Available for events, photoshoots, and collaborations.',
    rating: 4.9,
    reviewCount: 127,
    followersCount: 2453,
    followingCount: 892,
    responseTime: '< 1 hour',
    startingPrice: '500,000đ/hour',
    successRate: '98%',
    specialties: ['Anime', 'Game', 'Original Characters', 'Historical'],
    services: ['Photoshoots', 'Events', 'Conventions', 'Private Sessions', 'Tutorials'],
  };

  const mockStats = {
    photos: 156,
    videos: 24,
    awards: 8,
    events: 45,
    favorites: 234,
    reviews: 127,
  };

  const mockSkills = [
    { name: 'Costume Design', level: 95, color: '#E91E63' },
    { name: 'Makeup Artistry', level: 88, color: '#9C27B0' },
    { name: 'Character Acting', level: 92, color: '#673AB7' },
    { name: 'Photography', level: 75, color: '#3F51B5' },
    { name: 'Prop Making', level: 82, color: '#2196F3' },
  ];

  const mockRecentActivity = [
    {
      icon: '📸',
      title: 'New photo uploaded',
      description: 'Added 5 new cosplay photos to gallery',
      time: '2 hours ago'
    },
    {
      icon: '⭐',
      title: 'Received 5-star review',
      description: 'Great feedback from recent photoshoot client',
      time: '1 day ago'
    },
    {
      icon: '🎭',
      title: 'Event completed',
      description: 'Successfully completed Anime Festival appearance',
      time: '3 days ago'
    },
    {
      icon: '🏆',
      title: 'Award received',
      description: 'Best Costume Design at Vietnam Comic Con',
      time: '1 week ago'
    },
  ];

  const mockPhotos = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    url: `/src/assets/cosplayer${(index % 8) + 1}.png`,
    title: `Cosplay Photo ${index + 1}`,
    description: `Amazing cosplay photoshoot #${index + 1}`,
    category: ['anime', 'game', 'original', 'event'][index % 4],
    likes: Math.floor(Math.random() * 500) + 50,
    tags: ['cosplay', 'anime', 'photoshoot', 'character'],
  }));

  const mockReviews = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    user: {
      name: `User ${index + 1}`,
      avatar: `/src/assets/cosplayer${(index % 8) + 1}.png`,
      verified: Math.random() > 0.5,
    },
    rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
    comment: `Amazing cosplayer! Very professional and talented. The attention to detail in the costume was incredible. Would definitely book again for future events. ${index % 3 === 0 ? 'The photoshoot exceeded all my expectations and the final results were stunning.' : ''}`,
    date: `${Math.floor(Math.random() * 30) + 1} days ago`,
    helpfulCount: Math.floor(Math.random() * 20),
    tags: ['Professional', 'Creative', 'Punctual', 'Talented'][Math.floor(Math.random() * 4)] ? ['Professional'] : [],
    response: index % 5 === 0 ? 'Thank you so much for the wonderful review! It was a pleasure working with you.' : null,
  }));

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        setProfileUser(mockProfileUser);
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

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ProfileOverview
            user={profileUser}
            stats={mockStats}
            recentActivity={mockRecentActivity}
            skills={mockSkills}
          />
        );
      case 'gallery':
        return (
          <ProfileGallery
            photos={mockPhotos}
            isOwnProfile={isOwnProfile}
            onAddPhoto={handleAddPhoto}
            loading={false}
          />
        );
      case 'videos':
        return (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(233, 30, 99, 0.1)',
          }}>
            <h3>Videos Section</h3>
            <p>Video content coming soon!</p>
          </Box>
        );
      case 'reviews':
        return (
          <ProfileReviews
            reviews={mockReviews}
            overallRating={profileUser?.rating}
            totalReviews={mockStats.reviews}
            isOwnProfile={isOwnProfile}
          />
        );
      case 'events':
        return (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(233, 30, 99, 0.1)',
          }}>
            <h3>Events Section</h3>
            <p>Events content coming soon!</p>
          </Box>
        );
      case 'achievements':
        return (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(233, 30, 99, 0.1)',
          }}>
            <h3>Achievements Section</h3>
            <p>Awards and achievements coming soon!</p>
          </Box>
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
            <h3>Favorites Section</h3>
            <p>Your favorite content will appear here!</p>
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
              <h3>Loading profile...</h3>
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
          {/* Profile Header */}
          <ProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onEditAvatar={handleEditAvatar}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
          />

          {/* Profile Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            counts={mockStats}
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

export default ProfilePage;