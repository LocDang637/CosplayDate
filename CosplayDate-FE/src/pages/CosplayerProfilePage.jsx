// src/pages/CosplayerProfilePage.jsx - FIXED VERSION
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CosplayerBookingOrders from '../components/profile/CosplayerBookingOrders';
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
  const [userDataLoaded, setUserDataLoaded] = useState(false);

  // ✅ FIXED: Stable user ID comparison logic
  const getCurrentUserId = useCallback(() => {
    if (!user) return null;
    return user.id || user.userId;
  }, [user?.id, user?.userId]); // Only depend on the actual ID values

  const handleEditProfile = useCallback(() => {
    console.log('📝 Edit profile clicked');
    navigate('/profile/edit');
  }, [navigate]);

  const handleFollow = useCallback(async (targetUserId) => {
    try {
      // Assuming you have a follow API endpoint
      const result = await userAPI.followUser(targetUserId);
      if (result.success) {
        showSnackbar('Đã theo dõi thành công!', 'success');
        // Update the profileUser state
        setProfileUser(prev => ({
          ...prev,
          isFollowing: true,
          followersCount: (prev.followersCount || 0) + 1
        }));
      }
    } catch (error) {
      console.error('Follow error:', error);
      showSnackbar('Không thể theo dõi. Vui lòng thử lại.', 'error');
    }
  }, []);

  const handleUnfollow = useCallback(async (targetUserId) => {
    try {
      // Assuming you have an unfollow API endpoint
      const result = await userAPI.unfollowUser(targetUserId);
      if (result.success) {
        showSnackbar('Đã bỏ theo dõi!', 'success');
        // Update the profileUser state
        setProfileUser(prev => ({
          ...prev,
          isFollowing: false,
          followersCount: Math.max((prev.followersCount || 0) - 1, 0)
        }));
      }
    } catch (error) {
      console.error('Unfollow error:', error);
      showSnackbar('Không thể bỏ theo dõi. Vui lòng thử lại.', 'error');
    }
  }, []);

  const handleFavorite = useCallback(async (cosplayerId) => {
    try {
      // Toggle favorite status
      const newFavoriteStatus = !profileUser?.isFavorite;

      // Call API to update favorite status
      // const result = await cosplayerAPI.toggleFavorite(cosplayerId);

      // Update local state
      setProfileUser(prev => ({
        ...prev,
        isFavorite: newFavoriteStatus
      }));

      showSnackbar(
        newFavoriteStatus ? 'Đã thêm vào yêu thích!' : 'Đã xóa khỏi yêu thích!',
        'success'
      );
    } catch (error) {
      console.error('Favorite toggle error:', error);
      showSnackbar('Không thể cập nhật. Vui lòng thử lại.', 'error');
    }
  }, [profileUser?.isFavorite]);

  const handleMessage = useCallback((targetUser) => {
    console.log('💬 Message clicked for:', targetUser);
    navigate(`/messages/${targetUser.userId || targetUser.id}`);
  }, [navigate]);

  const handleBooking = useCallback((targetCosplayer) => {
    console.log('📅 Booking clicked for:', targetCosplayer);
    navigate(`/booking/${targetCosplayer.id}`);
  }, [navigate]);

  const isOwnProfile = !userId || (user && (
    parseInt(userId) === parseInt(getCurrentUserId())
  ));

  const handleProfileUpdate = useCallback((updatedData) => {
    console.log('📝 Profile updated:', updatedData);

    // Update the profileUser state with the new data
    setProfileUser(prev => ({
      ...prev,
      ...updatedData
    }));

    // Update localStorage if it's own profile
    if (isOwnProfile) {
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const updatedUser = {
        ...currentUser,
        ...updatedData
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    }

    showSnackbar('Cập nhật hồ sơ thành công!', 'success');
  }, [isOwnProfile]);

  // ✅ FIXED: Initialize user data only once
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserDataLoaded(true);

        console.log('👤 User loaded:', {
          id: parsedUser.id || parsedUser.userId,
          userType: parsedUser.userType,
          urlUserId: userId,
          isOwnProfile: !userId || (parseInt(userId) === parseInt(parsedUser.id || parsedUser.userId))
        });

        // ✅ FIXED: Handle route corrections without infinite loops
        if (!userId && parsedUser.userType === 'Cosplayer' && (parsedUser.id || parsedUser.userId)) {
          const userIdValue = parsedUser.id || parsedUser.userId;
          console.log('🔄 Redirecting to profile with user ID:', userIdValue);
          navigate(`/profile/${userIdValue}`, { replace: true });
          return;
        }

        // Check for wrong URL corrections
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
    } else {
      setUserDataLoaded(true); // Still mark as loaded even if no user
    }

    // Handle success messages from navigation state
    if (location.state?.message) {
      showSnackbar(location.state.message, 'success');
    }
  }, []); // ✅ FIXED: Empty dependency array - only run once

  // ✅ FIXED: Profile loading effect with proper dependencies
  useEffect(() => {
    // Don't proceed until user data is loaded
    if (!userDataLoaded) {
      return;
    }

    // Don't proceed if we don't have user data for own profile
    if (isOwnProfile && !user) {
      setLoading(false);
      setError('User data not found');
      return;
    }

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        setShowBecomeCosplayer(false);

        const targetUserId = userId || getCurrentUserId();
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

        try {
          const result = await cosplayerAPI.getCosplayerDetails(targetUserId);

          console.log('📊 API Result:', {
            success: result.success,
            hasData: !!result.data,
            error: result.message,
            errorStatus: result.errors?.status
          });

          if (result.success && result.data) {
            // ✅ FIXED: Profile exists and loaded successfully
            setProfileUser(result.data);

            // Update local storage for own profile
            if (isOwnProfile) {
              const updatedUser = { ...user, ...result.data };
              localStorage.setItem('user', JSON.stringify(updatedUser));
              setUser(updatedUser);
            }

            console.log('✅ Profile loaded successfully');
          } else {
            // ✅ FIXED: Profile not found - handle different scenarios
            console.log('❌ Profile loading failed:', result.message);

            if (isOwnProfile) {
              if (user?.userType === 'Cosplayer') {
                // User is marked as cosplayer but no profile found
                console.log('🎭 User marked as cosplayer but profile not found, showing become cosplayer form');
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

          if (isOwnProfile) {
            if (user?.userType === 'Cosplayer') {
              console.log('🔧 API error for cosplayer, showing become cosplayer form');
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

    loadProfile();
  }, [userDataLoaded, userId, getCurrentUserId, isOwnProfile, user?.userType, navigate]); // ✅ FIXED: Proper dependencies

  // ✅ FIXED: Load media when profile user changes or tab changes
  useEffect(() => {
    if (profileUser?.id && (activeTab === 'gallery' || activeTab === 'videos')) {
      loadMedia();
    }
  }, [profileUser?.id, activeTab]); // ✅ FIXED: Only depend on what we actually need

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
    } finally {
      setMediaLoading(false);
    }
  };

  // Event handlers
  const handleLogout = useCallback(() => {
    console.log('👋 Logging out user');
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  }, [navigate]);

  const handleTabChange = useCallback((event, newValue) => {
    console.log('📑 Tab changed to:', newValue);
    setActiveTab(newValue);
  }, []);

  const handleUploadSuccess = useCallback((uploadedMedia) => {
    if (uploadDialog.type === 'photo') {
      setPhotos(prev => [uploadedMedia, ...prev]);
    } else {
      setVideos(prev => [uploadedMedia, ...prev]);
    }
    showSnackbar(`${uploadDialog.type === 'photo' ? 'Ảnh' : 'Video'} đã được tải lên thành công!`, 'success');
  }, [uploadDialog.type]);

  const handleBecomeCosplayerSuccess = useCallback((updatedUser, cosplayerData) => {
    console.log('🎭 Successfully became cosplayer:', cosplayerData);
    setUser(updatedUser);
    setShowBecomeCosplayer(false);
    setProfileUser(cosplayerData);
    showSnackbar(cosplayerData.message || 'Chúc mừng! Bạn đã trở thành Cosplayer.', 'success');
  }, []);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

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
      id: 'bookings',
      label: 'Đặt lịch',
      icon: 'Event',
      show: isOwnProfile // Only show for own profile
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
      case 'bookings':
        return (
          <CosplayerBookingOrders
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
  if (showBecomeCosplayer && isOwnProfile && user?.userType === 'Cosplayer' && !loading) {
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

  // ✅ FIXED: Only render main profile if we have profile data
  if (!profileUser) {
    console.log('⚠️ No profile data available, but not in error state');
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
            <Alert severity="warning" sx={{ mb: 4, borderRadius: '12px' }}>
              Không tìm thấy thông tin cosplayer
            </Alert>
            <Button
              onClick={() => navigate('/cosplayers')}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Xem tất cả Cosplayer
            </Button>
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  // Main profile view
  console.log('✅ Rendering main profile view with data:', !!profileUser);
  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Profile Header */}
          <CosplayerProfileHeader
            user={profileUser}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onFollow={handleFollow}
            onUnfollow={handleUnfollow}
            onFavorite={handleFavorite}
            onMessage={handleMessage}
            onBooking={handleBooking}
            currentUser={user}
            onProfileUpdate={handleProfileUpdate}  
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