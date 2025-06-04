// src/pages/CosplayerProfilePage.jsx - FIXED PROFILE LOADING LOGIC
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
  
  // State management
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

  // ✅ FIXED: Improved user ID comparison logic
  const isOwnProfile = !userId || (user && (
    parseInt(userId) === parseInt(user.id || user.userId)
  ));

  // Initialize user data and handle route corrections
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        
        console.log('👤 User loaded:', {
          id: parsedUser.id || parsedUser.userId,
          userType: parsedUser.userType,
          urlUserId: userId,
          isOwnProfile: !userId || (parseInt(userId) === parseInt(parsedUser.id || parsedUser.userId))
        });
        
        // ✅ FIXED: Auto-redirect logic for proper profile URLs
        if (!userId && parsedUser.userType === 'Cosplayer' && (parsedUser.id || parsedUser.userId)) {
          const userIdValue = parsedUser.id || parsedUser.userId;
          console.log('🔄 Redirecting to profile with user ID:', userIdValue);
          navigate(`/profile/${userIdValue}`, { replace: true });
          return;
        }
        
        // ✅ FIXED: Check if URL userId doesn't match actual user ID for own profile
        if (userId && parsedUser.userType === 'Cosplayer' && 
            parseInt(userId) === parseInt(parsedUser.id || parsedUser.userId)) {
          // This is correct - user is viewing their own profile with correct user ID
          console.log('✅ Correct URL: User viewing own profile with matching user ID');
        } else if (userId && parsedUser.userType === 'Cosplayer' && 
                   parseInt(userId) !== parseInt(parsedUser.id || parsedUser.userId)) {
          // URL has wrong ID for own profile - redirect to correct user ID
          const correctUserId = parsedUser.id || parsedUser.userId;
          console.log('🔄 Wrong URL for own profile, redirecting from', userId, 'to', correctUserId);
          navigate(`/profile/${correctUserId}`, { replace: true });
          return;
        }
        
        // ✅ FIXED: If customer tries to access cosplayer profile route, redirect properly
        if (userId && parsedUser.userType === 'Customer' && 
            parseInt(userId) === parseInt(parsedUser.id || parsedUser.userId)) {
          console.log('🔄 Customer on cosplayer route, redirecting to customer profile');
          navigate(`/customer-profile/${userId}`, { replace: true });
          return;
        }
        
      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('user');
        navigate('/login');
        return;
      }
    }

    // Handle success messages from navigation state
    if (location.state?.message) {
      showSnackbar(location.state.message, 'success');
    }
  }, [location.state, userId, navigate]);

  // ✅ FIXED: Main profile loading effect with better logic
  useEffect(() => {
    const loadProfile = async () => {
      // Don't proceed if we don't have user data yet for own profile
      if (isOwnProfile && !user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setShowBecomeCosplayer(false);

        const targetUserId = userId || user?.id || user?.userId;
        if (!targetUserId) {
          console.error('❌ No target user ID found');
          setError('User ID not found');
          setLoading(false);
          return;
        }

        console.log('🔍 Loading profile for:', {
          targetUserId,
          isOwnProfile,
          userType: user?.userType
        });

        // ✅ FIXED: Better error handling and profile detection
        try {
          const result = await cosplayerAPI.getCosplayerDetails(targetUserId);
          
          console.log('📊 API Result:', {
            success: result.success,
            hasData: !!result.data,
            error: result.message,
            errorStatus: result.errors?.status
          });
          
          if (result.success && result.data) {
            // Profile exists and loaded successfully
            setProfileUser(result.data);
            
            // Update local storage for own profile
            if (isOwnProfile) {
              const updatedUser = { ...user, ...result.data };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }
            
            console.log('✅ Profile loaded successfully');
          } else {
            // Profile not found or error occurred
            console.log('❌ Profile loading failed:', result.message);
            
            // ✅ FIXED: Better handling of different error scenarios
            if (isOwnProfile) {
              // This is the user's own profile
              if (user?.userType === 'Cosplayer') {
                // User is marked as cosplayer but no profile found
                // This could mean they need to complete their cosplayer setup
                console.log('🎭 User marked as cosplayer but profile not found, checking if they need to complete setup');
                setShowBecomeCosplayer(true);
              } else {
                // User is not a cosplayer, redirect to customer profile
                console.log('👤 User is not a cosplayer, redirecting to customer profile');
                navigate(`/customer-profile/${targetUserId}`, { replace: true });
                return;
              }
            } else {
              // Viewing someone else's profile that doesn't exist
              console.log('❌ Other user profile not found');
              setError(result.message || 'Cosplayer profile not found');
            }
          }
        } catch (apiError) {
          console.error('🚨 API Error:', apiError);
          
          // Handle API errors gracefully
          if (isOwnProfile) {
            if (user?.userType === 'Cosplayer') {
              console.log('🔧 API error for cosplayer, might need to complete setup');
              setShowBecomeCosplayer(true);
            } else {
              console.log('👤 API error for customer, redirecting to customer profile');
              navigate(`/customer-profile/${targetUserId}`, { replace: true });
              return;
            }
          } else {
            setError('Unable to load profile. Please try again.');
          }
        }

      } catch (err) {
        console.error('💥 Profile loading error:', err);
        
        if (isOwnProfile && user?.userType === 'Cosplayer') {
          setShowBecomeCosplayer(true);
        } else {
          setError('Unable to load profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    // Only load if we have user data or it's not own profile
    if (user || !isOwnProfile) {
      loadProfile();
    }
  }, [userId, user, isOwnProfile, navigate]);

  // Load media when profile user changes or tab changes
  useEffect(() => {
    if (profileUser?.id) {
      loadMedia();
    }
  }, [profileUser?.id, activeTab]);

  // Media loading function
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
      console.error('📷 Media loading error:', err);
      // Don't show errors for media loading failures
    } finally {
      setMediaLoading(false);
    }
  };

  // Event handlers
  const handleLogout = () => {
    console.log('👋 Logging out user');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const handleTabChange = (event, newValue) => {
    console.log('📑 Tab changed to:', newValue);
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
    console.log('🎭 Successfully became cosplayer:', cosplayerData);
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

  // Tab configuration
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

  // Tab content renderer
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

  // ✅ FIXED: Better condition for showing become cosplayer form
  if (showBecomeCosplayer && isOwnProfile && user?.userType === 'Cosplayer') {
    console.log('🎭 Rendering become cosplayer form');
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

  // Loading state
  if (loading) {
    console.log('⏳ Rendering loading state');
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

  // Error state
  if (error) {
    console.log('❌ Rendering error state:', error);
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
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button
                variant="contained"
                onClick={() => navigate('/cosplayers')}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  mr: 2
                }}
              >
                Xem tất cả Cosplayer
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Về trang chủ
              </Button>
            </Box>
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  // Main profile view
  console.log('✅ Rendering main profile view');
  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />
        
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Profile Header */}
          <CosplayerProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
          />

          {/* Navigation Tabs */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            customTabs={cosplayerTabs}
          />

          {/* Tab Content */}
          <Box sx={{ minHeight: '400px' }}>
            {renderTabContent()}
          </Box>
        </Container>

        {/* Floating Add Button for Media Tabs */}
        {isOwnProfile && (activeTab === 'gallery' || activeTab === 'videos') && (
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              },
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

        {/* Media Upload Dialog */}
        <MediaUploadDialog
          open={uploadDialog.open}
          onClose={() => setUploadDialog({ ...uploadDialog, open: false })}
          type={uploadDialog.type}
          onUploadSuccess={handleUploadSuccess}
        />

        {/* Success/Error Snackbar */}
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