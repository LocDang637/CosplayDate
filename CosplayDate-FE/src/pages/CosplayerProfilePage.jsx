// src/pages/CosplayerProfilePage.jsx - UPDATED VERSION with API-based isOwnProfile
// Fixed export issue
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import CosplayerBookingOrders from '../components/profile/CosplayerBookingOrders';
import CosplayerFollowers from '../components/profile/CosplayerFollowers';
import WalletTab from '../components/profile/WalletTab';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Menu, MenuItem, ListItemIcon, ListItemText
} from '@mui/material';
import { CameraAlt, Delete } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import { cosplayerAPI, cosplayerMediaAPI } from '../services/cosplayerAPI';
import { userAPI, followAPI } from '../services/api';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CosplayerProfileHeader from '../components/profile/CosplayerProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import CosplayerProfileOverview from '../components/profile/CosplayerProfileOverview';
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
  const [currentProfile, setCurrentProfile] = useState(null); // Add current profile state
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
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!user) {
      // Redirect to login if not logged in
      navigate('/login');
      return;
    }

    if (!profileUser || followLoading) return;

    try {
      setFollowLoading(true);

      let result;
      if (isFollowing) {
        result = await followAPI.unfollowCosplayer(profileUser.id);
      } else {
        result = await followAPI.followCosplayer(profileUser.id);
      }

      if (result.success) {
        setIsFollowing(!isFollowing);

        // Update follower count using the totalFollowers from the API response
        if (result.data && result.data.totalFollowers !== undefined) {
          setProfileUser(prev => ({
            ...prev,
            followersCount: result.data.totalFollowers,
            // Also update stats if it exists
            stats: prev.stats ? {
              ...prev.stats,
              totalFollowers: result.data.totalFollowers
            } : undefined
          }));
        } else {
          // Fallback to manual increment/decrement if API doesn't return totalFollowers
          setProfileUser(prev => ({
            ...prev,
            followersCount: isFollowing
              ? Math.max(0, (prev.followersCount || 1) - 1)
              : (prev.followersCount || 0) + 1,
            stats: prev.stats ? {
              ...prev.stats,
              totalFollowers: isFollowing
                ? Math.max(0, (prev.stats.totalFollowers || 1) - 1)
                : (prev.stats.totalFollowers || 0) + 1
            } : undefined
          }));
        }

        showSnackbar(
          isFollowing ? 'Đã bỏ theo dõi cosplayer' : 'Đã theo dõi cosplayer',
          'success'
        );
      } else {
        showSnackbar(result.message || 'Có lỗi xảy ra', 'error');
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
      showSnackbar('Không thể thực hiện thao tác', 'error');
    } finally {
      setFollowLoading(false);
    }
  };

  // ✅ FIXED: Stable user ID comparison logic
  const getCurrentUserId = useCallback(() => {
    if (!user) return null;
    return user.id || user.userId;
  }, [user?.id, user?.userId]);

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
          urlUserId: userId
        });

        // Handle route corrections for own profile without userId
        if (!userId && parsedUser.userType === 'Cosplayer' && (parsedUser.id || parsedUser.userId)) {
          const userIdValue = parsedUser.id || parsedUser.userId;
          console.log('🔄 Redirecting to profile with user ID:', userIdValue);
          navigate(`/profile/${userIdValue}`, { replace: true });
          return;
        }

        // Check for wrong URL corrections (customer on cosplayer route)
        if (userId && parsedUser.userType === 'Customer' &&
          parseInt(userId) === parseInt(parsedUser.id || parsedUser.userId)) {
          console.log('🔄 Customer on cosplayer route, redirecting to customer profile');
          navigate(`/customer-profile/${userId}`, { replace: true });
          return;
        }

      } catch (error) {
        console.error('❌ Error parsing stored user:', error);
        localStorage.removeItem('user');
        // Don't redirect to login for profile pages - allow anonymous viewing
        if (!userId) {
          navigate('/login');
          return;
        }
      }
    } else {
      console.log('⚠️ No user found in localStorage - allowing anonymous viewing');
      setUserDataLoaded(true);
    }

    // Handle success messages from navigation state
    if (location.state?.message) {
      showSnackbar(location.state.message, 'success');
    }
  }, []);

  // Avatar menu handlers
  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAvatarUpload = async () => {
    handleMenuClose();

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
            const newAvatarUrl = result.data.avatarUrl;

            // Update profileUser state
            setProfileUser(prev => ({
              ...prev,
              avatar: newAvatarUrl,
              avatarUrl: newAvatarUrl
            }));

            // If it's own profile, also update the user state
            if (isOwnProfile) {
              const updatedUser = {
                ...user,
                avatar: newAvatarUrl,
                avatarUrl: newAvatarUrl
              };
              setUser(updatedUser);
              localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            showSnackbar('Avatar updated successfully!', 'success');
          } else {
            showSnackbar(result.message || 'Failed to upload avatar', 'error');
          }
        } catch (error) {
          console.error('Avatar upload error:', error);
          showSnackbar('Error uploading avatar', 'error');
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleAvatarDelete = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    try {
      setLoading(true);
      const result = await userAPI.deleteAvatar();

      if (result.success) {
        // Update profileUser state
        setProfileUser(prev => ({
          ...prev,
          avatar: null,
          avatarUrl: null
        }));

        // If it's own profile, also update the user state
        if (isOwnProfile) {
          const updatedUser = {
            ...user,
            avatar: null,
            avatarUrl: null
          };
          setUser(updatedUser);
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        showSnackbar('Avatar deleted successfully!', 'success');
      } else {
        showSnackbar(result.message || 'Failed to delete avatar', 'error');
      }
    } catch (error) {
      console.error('Avatar delete error:', error);
      showSnackbar('Error deleting avatar', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Load user profile first to get isOwnProfile value
  useEffect(() => {
    if (!userDataLoaded) {
      return;
    }

    const loadUserProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const targetUserId = userId || getCurrentUserId();
        if (!targetUserId) {
          console.error('❌ No target user ID found');
          setError('User ID not found');
          setLoading(false);
          return;
        }

        console.log('🔍 Loading user profile for:', targetUserId);

        // First get user profile to determine isOwnProfile
        const userProfileResult = await userAPI.getUserProfile(targetUserId);

        console.log('👤 User Profile API Result:', {
          success: userProfileResult.success,
          isOwnProfile: userProfileResult.data?.isOwnProfile,
          userType: userProfileResult.data?.userType,
          isFollowing: userProfileResult.data?.isFollowing // Log this
        });

        if (userProfileResult.success && userProfileResult.data) {
          const { isOwnProfile: apiIsOwnProfile, userType, isFollowing: apiIsFollowing } = userProfileResult.data;

          // Set isOwnProfile from API response
          setIsOwnProfile(apiIsOwnProfile);

          // Set isFollowing from API response (only for non-own profiles)
          if (!apiIsOwnProfile && user) {
            setIsFollowing(apiIsFollowing || false);
          }

          console.log('✅ States set from API:', {
            isOwnProfile: apiIsOwnProfile,
            isFollowing: apiIsFollowing
          });

          // Handle non-cosplayer users
          if (userType !== 'Cosplayer') {
            if (apiIsOwnProfile) {
              console.log('👤 Own profile but not cosplayer, redirecting to customer profile');
              navigate(`/customer-profile/${targetUserId}`, { replace: true });
              return;
            } else {
              console.log('❌ Viewing non-cosplayer profile');
              setError('This user is not a cosplayer');
              setLoading(false);
              return;
            }
          }

          // Continue with cosplayer profile loading
          await loadCosplayerProfile(targetUserId, apiIsOwnProfile, userType);

        } else {
          console.log('❌ User profile loading failed:', userProfileResult.message);
          setError(userProfileResult.message || 'User profile not found');
          setLoading(false);
        }

      } catch (err) {
        console.error('💥 User profile loading error:', err);
        setError('Unable to load profile. Please try again.');
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [userDataLoaded, userId, getCurrentUserId, navigate]);

  // ✅ NEW: Separate function to load cosplayer-specific data
  const loadCosplayerProfile = async (targetUserId, apiIsOwnProfile, userType) => {
    try {
      console.log('🎭 Loading cosplayer profile for:', {
        targetUserId,
        isOwnProfile: apiIsOwnProfile,
        userType
      });

      // Load cosplayer details and current profile data in parallel
      const promises = [
        cosplayerAPI.getCosplayerDetails(targetUserId)
      ];

      // Only load current profile data for own profile to get private info
      if (apiIsOwnProfile) {
        promises.push(userAPI.getCurrentProfile());
      }

      const [result, currentProfileResult] = await Promise.all(promises);

      console.log('📊 Cosplayer API Result:', {
        success: result.success,
        hasData: !!result.data,
        error: result.message,
        errorStatus: result.errors?.status
      });

      if (currentProfileResult) {
        console.log('📊 Current Profile API Result:', {
          success: currentProfileResult.success,
          hasData: !!currentProfileResult.data,
          membershipTier: currentProfileResult.data?.membershipTier,
          loyaltyPoints: currentProfileResult.data?.loyaltyPoints,
          walletBalance: currentProfileResult.data?.walletBalance
        });

        if (currentProfileResult.success && currentProfileResult.data) {
          setCurrentProfile(currentProfileResult.data);
        }
      }

      if (result.success && result.data) {
        // ✅ FIX: Ensure isVerified is included in the profile data
        // Get the user profile data first to get isVerified status
        const userProfileResult = await userAPI.getUserProfile(targetUserId);

        const profileData = {
          ...result.data,
          // Add isVerified from user profile API response
          isVerified: userProfileResult.data?.isVerified || false,
          // Add membership tier from current profile for own profile
          membershipTier: currentProfileResult?.data?.membershipTier || userProfileResult.data?.membershipTier || 'Bronze'
        };

        setProfileUser(profileData);

        // Update local storage for own profile
        if (apiIsOwnProfile) {
          const updatedUser = { ...user, ...profileData };
          localStorage.setItem('user', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }

        console.log('✅ Cosplayer profile loaded successfully with additional data:', {
          isVerified: profileData.isVerified,
          membershipTier: profileData.membershipTier
        });
      } else {
        // ✅ Cosplayer profile not found - handle different scenarios
        console.log('❌ Cosplayer profile loading failed:', result.message);

        if (apiIsOwnProfile) {
          if (userType === 'Cosplayer') {
            // User is marked as cosplayer but no cosplayer profile found
            console.log('🎭 User marked as cosplayer but profile not found, showing become cosplayer form');
            setShowBecomeCosplayer(true);
          }
        } else {
          // Viewing someone else's cosplayer profile that doesn't exist
          console.log('❌ Other user cosplayer profile not found');
          setError(result.message || 'Cosplayer profile not found');
        }
      }
    } catch (apiError) {
      console.error('🚨 Cosplayer API Error:', apiError);

      if (apiIsOwnProfile && userType === 'Cosplayer') {
        console.log('🔧 API error for cosplayer, showing become cosplayer form');
        setShowBecomeCosplayer(true);
      } else {
        setError('Unable to load cosplayer profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Load media when profile user changes or tab changes
  useEffect(() => {
    if (profileUser?.id && (activeTab === 'gallery' || activeTab === 'videos')) {
      loadMedia();
    }
  }, [profileUser?.id, activeTab]);

  // Media loading function
  const loadMedia = useCallback(async () => {
    if (!profileUser?.id || (activeTab !== 'gallery' && activeTab !== 'videos')) return;

    console.log('📷 Loading media for profile:', profileUser.id, 'activeTab:', activeTab);
    setMediaLoading(true);
    try {
      const [photosResult, videosResult] = await Promise.all([
        cosplayerMediaAPI.getPhotos(profileUser.id),
        cosplayerMediaAPI.getVideos(profileUser.id)
      ]);

      console.log('📊 Photos API result:', photosResult);
      console.log('📊 Videos API result:', videosResult);

      if (photosResult.success && photosResult.data) {
        // Map photoUrl to url for ProfileGallery
        const mappedPhotos = (photosResult.data.photos || []).map(photo => ({
          ...photo,
          url: photo.photoUrl || photo.url,
          likesCount: photo.likesCount || 0,
          category: photo.category || 'Other',
          isLiked: photo.isLiked || false,
          // Ensure these fields exist with proper defaults
          title: photo.title || '',
          description: photo.description || '',
          tags: Array.isArray(photo.tags) ? photo.tags : [],
          isPortfolio: Boolean(photo.isPortfolio),
          displayOrder: Number(photo.displayOrder) || 0
        }));
        console.log('📸 Mapped photos:', mappedPhotos);
        setPhotos(mappedPhotos);
      } else {
        console.log('❌ Photos loading failed:', photosResult);
        setPhotos([]);
      }

      if (videosResult.success && videosResult.data) {
        // Map videoUrl to url for ProfileGallery
        const mappedVideos = (videosResult.data.videos || []).map(video => ({
          ...video,
          url: video.videoUrl || video.url,
          photoUrl: video.thumbnailUrl || null, // Keep as null if no thumbnail
          category: video.category || 'Other',
          isVideo: true, // Flag to identify this as a video
          // Ensure these fields exist with proper defaults
          title: video.title || '',
          description: video.description || '',
          duration: Number(video.duration) || 0,
          viewCount: Number(video.viewCount) || 0,
          likesCount: Number(video.likesCount) || 0,
          displayOrder: Number(video.displayOrder) || 0,
          createdAt: video.createdAt
        }));
        console.log('🎥 Mapped videos:', mappedVideos);
        setVideos(mappedVideos);
      } else {
        console.log('❌ Videos loading failed:', videosResult);
        setVideos([]);
      }
    } catch (err) {
      console.error('📷 Media loading error:', err);
      setPhotos([]);
      setVideos([]);
    } finally {
      setMediaLoading(false);
    }
  }, [profileUser?.id, activeTab]);

  const handleMediaUpdate = useCallback(() => {
    // Reload media when ProfileGallery notifies of changes
    loadMedia();
  }, [loadMedia]);

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
    console.log('📤 Upload success - received media:', uploadedMedia);
    
    // Show success message immediately
    showSnackbar(`${uploadDialog.type === 'photo' ? 'Ảnh' : 'Video'} đã được tải lên thành công!`, 'success');
    
    // Reload media to get complete data structure from server
    // This ensures all fields (description, tags, etc.) are properly loaded
    loadMedia();
  }, [uploadDialog.type, loadMedia]);

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
      id: 'wallet',
      label: 'Ví',
      icon: 'AccountBalanceWallet',
      show: isOwnProfile
    },
    {
      id: 'bookings',
      label: 'Đặt lịch',
      icon: 'Event',
      show: isOwnProfile
    },
    {
      id: 'gallery',
      label: 'Thư viện',
      icon: 'PhotoLibrary',
      show: true
    },
    {
      id: 'followers',
      label: 'Người theo dõi',
      icon: 'People',
      show: isOwnProfile
    }
  ];

  // Tab content renderer
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <CosplayerProfileOverview
            user={profileUser}
            currentProfile={currentProfile}
            isOwnProfile={isOwnProfile}
          />
        );
      case 'bookings':
        return (
          <CosplayerBookingOrders
            isOwnProfile={isOwnProfile}
          />
        );
      case 'wallet':
        return (
          <WalletTab
            userType="Cosplayer"
            balance={currentProfile?.balance || 0}
            loyaltyPoints={currentProfile?.loyaltyPoints || 0}
            onBalanceUpdate={(newBalance) => {
              setCurrentProfile(prev => ({ ...prev, balance: newBalance }));
            }}
          />
        );
      case 'gallery':
        return (
          <ProfileGallery
            photos={photos}
            videos={videos}
            isOwnProfile={isOwnProfile}
            loading={mediaLoading}
            onMediaUpdate={handleMediaUpdate}
            onAddMedia={(mediaType) => setUploadDialog({ open: true, type: mediaType })}
          />
        );
      case 'followers':
        return (
          <CosplayerFollowers
            cosplayerId={profileUser?.id}
            isOwnProfile={isOwnProfile}
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
  console.log('✅ Rendering main profile view with data:', !!profileUser, 'isOwnProfile:', isOwnProfile);
  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />

        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* Profile Header */}
          <CosplayerProfileHeader
            user={profileUser}
            currentProfile={currentProfile}
            onEditAvatar={handleAvatarClick}
            onProfileUpdate={handleProfileUpdate}
            isOwnProfile={isOwnProfile}
            anchorEl={anchorEl}
            onMenuClose={handleMenuClose}
            onAvatarUpload={handleAvatarUpload}
            onAvatarDelete={handleAvatarDelete}
            deleteDialogOpen={deleteDialogOpen}
            onConfirmDelete={handleConfirmDelete}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
          />

          {/* Avatar Menu */}
          {isOwnProfile && (
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              MenuListProps={{
                'aria-labelledby': 'avatar-menu',
              }}
              // Click outside handling
              ClickAwayListenerProps={{
                onClickAway: handleMenuClose
              }}
              // Backdrop for better visibility
              slotProps={{
                backdrop: {
                  sx: {
                    backgroundColor: 'transparent',
                  }
                }
              }}
            >
              <MenuItem onClick={handleAvatarUpload}>
                <ListItemIcon>
                  <CameraAlt fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  {profileUser?.avatar || profileUser?.avatarUrl ? 'Change Avatar' : 'Upload Avatar'}
                </ListItemText>
              </MenuItem>
              {(profileUser?.avatar || profileUser?.avatarUrl) && (
                <MenuItem onClick={handleAvatarDelete}>
                  <ListItemIcon>
                    <Delete fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText>Delete Avatar</ListItemText>
                </MenuItem>
              )}
            </Menu>
          )}

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