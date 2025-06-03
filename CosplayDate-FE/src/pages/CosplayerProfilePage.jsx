// src/pages/CosplayerProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Fab
} from '@mui/material';
import { Add } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import { cosplayerAPI, cosplayerMediaAPI } from '../services/cosplayerAPI';

import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CosplayerProfileHeader from '../components/profile/CosplayerProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import CosplayerProfileOverview from '../components/profile/CosplayerProfileOverview';
import CosplayerServices from '../components/cosplayer/CosplayerServices';
import ProfileGallery from '../components/profile/ProfileGallery';
import MediaUploadDialog from '../components/media/MediaUploadDialog';
import BecomeCosplayerForm from '../components/cosplayer/BecomeCosplayerForm';

const CosplayerProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState({ open: false, type: 'photo' });
  const [showBecomeCosplayer, setShowBecomeCosplayer] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isOwnProfile = !userId || (user?.id && parseInt(userId) === parseInt(user.id));

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
      showSnackbar(location.state.message, 'success');
    }
  }, [location.state]);

  useEffect(() => {
    const loadProfile = async () => {
      if (isOwnProfile && !user) return;

      try {
        setLoading(true);
        setError(null);

        const targetUserId = userId || user?.id;
        if (!targetUserId) {
          setError('User ID not found');
          return;
        }

        const result = await cosplayerAPI.getCosplayerDetails(targetUserId);
        
        if (result.success) {
          setProfileUser(result.data);
          
          if (isOwnProfile) {
            const updatedUser = { ...user, ...result.data };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } else {
          if (isOwnProfile && result.message?.includes('not found')) {
            setShowBecomeCosplayer(true);
          } else {
            setError(result.message || 'Failed to load profile');
          }
        }

      } catch (err) {
        console.error('Profile loading error:', err);
        setError('Unable to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (!isOwnProfile || user) {
      loadProfile();
    }
  }, [userId, user?.id, isOwnProfile]);

  useEffect(() => {
    if (profileUser?.id) {
      loadMedia();
    }
  }, [profileUser?.id, activeTab]);

  const loadMedia = async () => {
    if (!profileUser?.id || (activeTab !== 'gallery' && activeTab !== 'videos')) return;

    setMediaLoading(true);
    try {
      if (activeTab === 'gallery') {
        const photosResult = await cosplayerMediaAPI.getPhotos(profileUser.id);
        if (photosResult.success) {
          setPhotos(photosResult.data.photos || []);
        }
      } else if (activeTab === 'videos') {
        const videosResult = await cosplayerMediaAPI.getVideos(profileUser.id);
        if (videosResult.success) {
          setVideos(videosResult.data.videos || []);
        }
      }
    } catch (err) {
      console.error('Media loading error:', err);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUploadSuccess = (uploadedMedia) => {
    if (uploadDialog.type === 'photo') {
      setPhotos(prev => [uploadedMedia, ...prev]);
    } else {
      setVideos(prev => [uploadedMedia, ...prev]);
    }
    showSnackbar(`${uploadDialog.type === 'photo' ? 'Ảnh' : 'Video'} đã được tải lên thành công!`, 'success');
  };

  const handleBecomeCosplayerSuccess = (updatedUser, cosplayerData) => {
    setUser(updatedUser);
    setShowBecomeCosplayer(false);
    setProfileUser(cosplayerData);
    showSnackbar(cosplayerData.message || 'Chúc mừng! Bạn đã trở thành Cosplayer.', 'success');
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const cosplayerTabs = [
    {
      id: 'overview',
      label: 'Tổng quan',
      icon: 'Info',
      show: true
    },
    {
      id: 'services',
      label: 'Dịch vụ',
      icon: 'Work',
      show: true
    },
    {
      id: 'gallery',
      label: 'Thư viện ảnh',
      icon: 'PhotoLibrary',
      count: photos.length,
      show: true
    },
    {
      id: 'videos',
      label: 'Video',
      icon: 'VideoLibrary',
      count: videos.length,
      show: true
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <CosplayerProfileOverview
            user={profileUser}
            isOwnProfile={isOwnProfile}
          />
        );
      case 'services':
        return (
          <CosplayerServices
            cosplayerId={profileUser?.id}
            isOwnProfile={isOwnProfile}
          />
        );
      case 'gallery':
        return (
          <ProfileGallery
            photos={photos}
            isOwnProfile={isOwnProfile}
            onAddPhoto={() => setUploadDialog({ open: true, type: 'photo' })}
            loading={mediaLoading}
            type="cosplayer"
          />
        );
      case 'videos':
        return (
          <ProfileGallery
            photos={videos}
            isOwnProfile={isOwnProfile}
            onAddPhoto={() => setUploadDialog({ open: true, type: 'video' })}
            loading={mediaLoading}
            type="video"
            title="Video của tôi"
          />
        );
      default:
        return null;
    }
  };

  if (showBecomeCosplayer && isOwnProfile) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 4 }}>
            <BecomeCosplayerForm 
              user={user} 
              onSuccess={handleBecomeCosplayerSuccess}
            />
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  if (loading) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main' }} />
            <Box sx={{ mt: 2 }}>
              <h3>Đang tải hồ sơ cosplayer...</h3>
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
                  Thử lại
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
          <CosplayerProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            customTabs={cosplayerTabs}
          />

          <Box sx={{ minHeight: '400px' }}>
            {renderTabContent()}
          </Box>
        </Container>

        {isOwnProfile && (activeTab === 'gallery' || activeTab === 'videos') && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            }}
            onClick={() => setUploadDialog({ 
              open: true, 
              type: activeTab === 'gallery' ? 'photo' : 'video' 
            })}
          >
            <Add />
          </Fab>
        )}

        <Footer />

        <MediaUploadDialog
          open={uploadDialog.open}
          onClose={() => setUploadDialog({ ...uploadDialog, open: false })}
          type={uploadDialog.type}
          onUploadSuccess={handleUploadSuccess}
        />

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

export default CosplayerProfilePage;