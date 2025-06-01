// Updated ProfilePage.jsx with API integration
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
import { userAPI } from '../services/api';

// Import components
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
  
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isOwnProfile = !userId || user?.id === parseInt(userId);

  // Load current user
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Load profile data using API
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        let result;
        if (isOwnProfile) {
          // Get current user's profile
          result = await userAPI.getCurrentProfile();
        } else {
          // Get specific user's profile
          result = await userAPI.getUserProfile(userId);
        }

        if (result.success) {
          setProfileUser(result.data);
          
          // Update local storage if it's own profile
          if (isOwnProfile && result.data) {
            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            const updatedUser = { ...currentUser, ...result.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } else {
          setError(result.message || 'Failed to load profile');
        }

      } catch (err) {
        console.error('Profile loading error:', err);
        setError('Unable to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user || !isOwnProfile) {
      loadProfile();
    }
  }, [userId, user?.id, isOwnProfile]);

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
    // Navigate to edit form or open modal
    showSnackbar('Profile editing feature coming soon!', 'info');
  };

  const handleEditAvatar = async () => {
    // Create file input for avatar upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        try {
          setLoading(true);
          const result = await userAPI.uploadAvatar(file);
          
          if (result.success) {
            setProfileUser(prev => ({ ...prev, avatarUrl: result.data.avatarUrl }));
            showSnackbar('Avatar updated successfully!', 'success');
          } else {
            showSnackbar(result.message || 'Failed to upload avatar', 'error');
          }
        } catch (error) {
          showSnackbar('Error uploading avatar', 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    showSnackbar(
      isFollowing ? 'Unfollowed successfully' : 'Followed successfully', 
      'success'
    );
  };

  const handleAddPhoto = () => {
    showSnackbar('Photo upload feature coming soon!', 'info');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Mock data for features not yet implemented
  const mockStats = {
    photos: 156,
    videos: 24,
    awards: 8,
    events: 45,
    favorites: 234,
    reviews: 127,
  };

  const mockPhotos = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    url: `/src/assets/cosplayer${(index % 8) + 1}.png`,
    title: `Cosplay Photo ${index + 1}`,
    description: `Amazing cosplay photoshoot #${index + 1}`,
    category: ['anime', 'game', 'original', 'event'][index % 4],
    likes: Math.floor(Math.random() * 500) + 50,
    tags: ['cosplay', 'anime', 'photography', 'character'],
  }));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ProfileOverview
            user={profileUser}
            stats={mockStats}
            recentActivity={[]}
            skills={[]}
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
      case 'reviews':
        return (
          <ProfileReviews
            reviews={[]}
            overallRating={profileUser?.rating}
            totalReviews={mockStats.reviews}
            isOwnProfile={isOwnProfile}
          />
        );
      default:
        return (
          <Box sx={{ 
            p: 4, 
            textAlign: 'center',
            backgroundColor: 'rgba(255,255,255,0.95)',
            borderRadius: '16px',
            border: '1px solid rgba(233, 30, 99, 0.1)',
          }}>
            <h3>Feature coming soon!</h3>
            <p>This section is under development.</p>
          </Box>
        );
    }
  };

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
          <ProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onEditAvatar={handleEditAvatar}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            counts={mockStats}
          />

          <Box sx={{ minHeight: '400px' }}>
            {renderTabContent()}
          </Box>
        </Container>

        <Footer />

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