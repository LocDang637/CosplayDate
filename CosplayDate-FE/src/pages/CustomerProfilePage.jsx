// Updated CustomerProfilePage.jsx with API integration
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
  Menu, MenuItem, ListItemIcon, ListItemText,
  Typography
} from "@mui/material";
import { CameraAlt, Delete } from '@mui/icons-material';
import { ThemeProvider } from "@mui/material/styles";
import { cosplayTheme } from "../theme/cosplayTheme";
import {
  userAPI,
  enhancedWalletAPI,

} from "../services/api";

// Import components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CustomerProfileHeader from '../components/profile/CustomerProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import WalletTab from '../components/profile/WalletTab';

import ProfileEditModal from '../components/profile/ProfileEditModal';
import CustomerBookingOrders from '../components/profile/CustomerBookingOrders';
import CustomerFollowing from '../components/profile/CustomerFollowing';

const CustomerProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [currentProfile, setCurrentProfile] = useState(null); // Add current profile state
  const [activeTab, setActiveTab] = useState('following'); // Default to 'following' for anonymous users
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false); // Changed to state instead of computed
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [userDataLoaded, setUserDataLoaded] = useState(false); // Add userDataLoaded state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // console.log('userId:', userId, 'isOwnProfile:', isOwnProfile);

  // ✅ FIXED: Stable user ID comparison logic
  const getCurrentUserId = useCallback(() => {
    if (!user) return null;
    return user.id || user.userId;
  }, [user?.id, user?.userId]);

  // ✅ FIXED: Initialize user data only once
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // console.log("📱 Loaded user from localStorage:", parsedUser);
        setUser(parsedUser);
        setUserDataLoaded(true);

        // console.log('👤 User loaded:', {
        //   id: parsedUser.id || parsedUser.userId,
        //   userType: parsedUser.userType,
        //   urlUserId: userId
        // });

        // Handle route corrections for own profile without userId
        if (!userId && parsedUser.userType === 'Customer' && (parsedUser.id || parsedUser.userId)) {
          const userIdValue = parsedUser.id || parsedUser.userId;
          // console.log('🔄 Redirecting to customer profile with user ID:', userIdValue);
          navigate(`/customer-profile/${userIdValue}`, { replace: true });
          return;
        }

        // Check for wrong URL corrections (cosplayer on customer route)
        if (userId && parsedUser.userType === 'Cosplayer' &&
          parseInt(userId) === parseInt(parsedUser.id || parsedUser.userId)) {
          // console.log('🔄 Cosplayer on customer route, redirecting to cosplayer profile');
          navigate(`/profile/${userId}`, { replace: true });
          return;
        }

      } catch (error) {
        console.error("❌ Error parsing stored user:", error);
        localStorage.removeItem("user");
        // Don't redirect to login for profile pages - allow anonymous viewing
        if (!userId) {
          navigate('/login');
          return;
        }
      }
    } else {
      // console.log("⚠️ No user found in localStorage - allowing anonymous viewing");
      setUserDataLoaded(true);
    }

    // Handle success messages from navigation state
    if (location.state?.message) {
      showSnackbar(location.state.message, 'success');
    }
  }, []);

  // Set default tab based on user ownership status
  useEffect(() => {
    if (isOwnProfile) {
      setActiveTab('wallet');
    } else {
      setActiveTab('following');
    }
  }, [isOwnProfile]);

  // Add this useEffect to handle URL query parameters:
  useEffect(() => {
    // Check for tab query parameter
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');

    if (tabParam) {
      // Map tab parameter to activeTab value
      switch (tabParam) {
        case 'bookings':
          setActiveTab('bookings');
          break;
        case 'wallet':
          setActiveTab('wallet');
          break;
        case 'following':
          setActiveTab('following');
          break;
        default:
          setActiveTab('wallet');
      }
    }
  }, [location.search]);

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
          fullData: userProfileResult.data,
        });

        if (userProfileResult.success && userProfileResult.data) {
          const { isOwnProfile: apiIsOwnProfile, userType } = userProfileResult.data;

          // Set isOwnProfile from API response
          setIsOwnProfile(apiIsOwnProfile);

          console.log('✅ States set from API:', {
            isOwnProfile: apiIsOwnProfile,
            userType: userType
          });

          // Handle non-customer users
          console.log('🔍 Checking user type:', userType, 'Expected: Customer');
          if (userType !== 'Customer') {
            if (apiIsOwnProfile) {
              // console.log('🎭 Own profile but not customer, redirecting to cosplayer profile');
              navigate(`/profile/${targetUserId}`, { replace: true });
              return;
            } else {
              // console.log('❌ Viewing non-customer profile');
              setError('This user is not a customer');
              setLoading(false);
              return;
            }
          }

          // Continue with customer profile loading
          await loadCustomerProfile(targetUserId, apiIsOwnProfile, userType);

        } else {
          // console.log('❌ User profile loading failed:', userProfileResult.message);
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

  // ✅ NEW: Separate function to load customer-specific data
  const loadCustomerProfile = async (targetUserId, apiIsOwnProfile, userType) => {
    try {
      // console.log('👤 Loading customer profile for:', {
      //   targetUserId,
      //   isOwnProfile: apiIsOwnProfile,
      //   userType
      // });

      // Load customer details and current profile data in parallel
      const promises = [
        userAPI.getUserProfile(targetUserId)
      ];

      // Only load current profile data for own profile to get private info
      if (apiIsOwnProfile) {
        promises.push(userAPI.getCurrentProfile());
      }

      const [result, currentProfileResult] = await Promise.all(promises);

      // console.log('📊 Customer API Result:', {
      //   success: result.success,
      //   hasData: !!result.data,
      //   error: result.message
      // });

      if (result.success && result.data) {
        // ✅ FIX: Ensure the profile data has both avatar fields
        const profileData = {
          ...result.data,
          id: result.data.id || result.data.userId,
          userId: result.data.userId || result.data.id,
          // Ensure both avatar fields are available
          avatar: result.data.avatar || result.data.avatarUrl,
          avatarUrl: result.data.avatarUrl || result.data.avatar
        };

        setProfileUser(profileData);

        // Set current profile data for private info (wallet, etc.)
        if (currentProfileResult?.success && currentProfileResult.data) {
          setCurrentProfile(currentProfileResult.data);
          // console.log('💼 Current profile loaded:', currentProfileResult.data);
        }

        // Update local storage if it's own profile
        if (apiIsOwnProfile && profileData) {
          const currentUser = JSON.parse(
            localStorage.getItem("user") || "{}"
          );
          const updatedUser = { ...currentUser, ...profileData };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }

        // console.log('✅ Customer profile loaded successfully');
      } else {
        // console.log('❌ Customer profile loading failed:', result.message);
        setError(result.message || "Failed to load customer profile");
      }
    } catch (err) {
      console.error("❌ Customer profile loading error:", err);
      setError("Unable to load customer profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleEditProfile = () => {
    setEditModalOpen(true);
  };

  const handleProfileUpdated = useCallback((updatedProfile) => {
    setProfileUser(prev => ({ ...prev, ...updatedProfile }));

    // Update user state and localStorage if it's own profile
    if (isOwnProfile) {
      const updatedUser = { ...user, ...updatedProfile };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    showSnackbar('Profile updated successfully!', 'success');
  }, [isOwnProfile, user]);

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

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Mock data for features not yet implemented
  const mockStats = {
    totalBookings: profileUser?.totalBookings || 23,
    totalSpent: profileUser?.totalSpent || 8500000,
    favoriteCosplayers: profileUser?.favoriteCosplayers || 12,
    reviewsGiven: profileUser?.reviewsGiven || 18,
    completedBookings: profileUser?.completedBookings || 21,
    cancelledBookings: profileUser?.cancelledBookings || 2,
    avgBookingValue: profileUser?.avgBookingValue || 369565,
  };

  const mockFavoriteCategories = [
    { name: "Anime Cosplay", bookings: 12, color: "#E91E63" },
    { name: "Game Characters", bookings: 7, color: "#9C27B0" },
    { name: "Photography", bookings: 3, color: "#673AB7" },
    { name: "Events", bookings: 1, color: "#3F51B5" },
  ];

  const mockRecentActivity = [
    {
      icon: "📸",
      title: "Completed photoshoot",
      description: "Rated 5 stars for session with Cosplay A",
      time: "2 hours ago",
    },
    {
      icon: "💰",
      title: "Added funds to wallet",
      description: "Added 1,000,000đ to wallet",
      time: "1 day ago",
    },
    {
      icon: "📅",
      title: "Confirmed new booking",
      description: "Convention participation with Cosplay D",
      time: "2 days ago",
    },
    {
      icon: "⭐",
      title: "Left detailed review",
      description: "Reviewed experience with Cosplay C",
      time: "3 days ago",
    },
    {
      icon: "🎯",
      title: "Achieved Gold status",
      description: "Unlocked Gold member benefits",
      time: "1 week ago",
    },
  ];

  const customerTabs = [
    {
      id: "wallet",
      label: "Ví",
      icon: "AccountBalanceWallet",
      show: isOwnProfile,
    },
    {
      id: "bookings",
      label: "Đặt lịch",
      icon: "Event",
      show: isOwnProfile,
    },
    {
      id: "following",
      label: "Đang theo dõi",
      icon: "PersonAdd",
      show: true,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "wallet":
        return (
          <WalletTab
            userType="Customer"
            balance={currentProfile?.walletBalance || profileUser?.walletBalance}
            loyaltyPoints={currentProfile?.loyaltyPoints || profileUser?.loyaltyPoints}
            // Pass API functions for real data loading
            onLoadWalletDetails={() => enhancedWalletAPI.getWalletDetails()}
            onLoadSpendingAnalytics={(timeRange) =>
              enhancedWalletAPI.getSpendingAnalytics(timeRange)
            }
            onLoadTransactionHistory={(params) =>
              enhancedWalletAPI.getTransactionHistory(params)
            }
          />
        );
      case 'bookings':
        return <CustomerBookingOrders />;
      case 'following':
        return (
          <CustomerFollowing
            customerId={profileUser?.id}
            isOwnProfile={isOwnProfile}
          />
        );
      case "favorites":
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
            {/* Future: Use favoritesAPI.getFavoriteCosplayers() */}
          </Box>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: "100vh", backgroundColor: "#FFE8F5" }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8, textAlign: "center" }}>
            <CircularProgress size={60} sx={{ color: "primary.main" }} />
            <Box sx={{ mt: 2 }}>
              <h3>Loading customer profile...</h3>
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
        <Box sx={{ minHeight: "100vh", backgroundColor: "#FFE8F5" }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Alert
              severity="error"
              sx={{ mb: 4, borderRadius: '12px' }}
              action={
                <Button
                  color="inherit"
                  onClick={() => window.location.reload()}
                >
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
      <Box sx={{ minHeight: "100vh", backgroundColor: "#FFE8F5" }}>
        <Header user={user} onLogout={handleLogout} />


        <Container maxWidth="lg" sx={{ py: 4 }}>
          <CustomerProfileHeader
            user={profileUser}
            stats={mockStats}
            recentActivity={mockRecentActivity}
            favoriteCategories={mockFavoriteCategories}
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onEditAvatar={handleAvatarClick}
            deleteDialogOpen={deleteDialogOpen}
            onDeleteDialogClose={() => setDeleteDialogOpen(false)}
            onConfirmDelete={handleConfirmDelete}
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

          {/* Show profile tabs and content - filter tabs based on isOwnProfile */}
          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            customTabs={customerTabs}
          />

          <Box sx={{ minHeight: "400px" }}>{renderTabContent()}</Box>
        </Container>

        <Footer />

        {/* Profile Edit Modal */}
        <ProfileEditModal
          open={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          user={profileUser}
          onProfileUpdated={handleProfileUpdated}
        />

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ borderRadius: "12px" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
};

export default CustomerProfilePage;
