// Updated CustomerProfilePage.jsx with API integration
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  CircularProgress,
  Alert,
  Button,
  Snackbar,
} from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { cosplayTheme } from "../theme/cosplayTheme";
import {
  userAPI,
  enhancedWalletAPI,
  customerMediaAPI,
} from "../services/api";

// Import components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CustomerProfileHeader from '../components/profile/CustomerProfileHeader';
import ProfileTabs from '../components/profile/ProfileTabs';
import CustomerProfileOverview from '../components/profile/CustomerProfileOverview';
import CustomerWallet from '../components/profile/CustomerWallet';
import ProfileGallery from '../components/profile/ProfileGallery';
import ProfileEditModal from '../components/profile/ProfileEditModal';
import CustomerBookingOrders from '../components/profile/CustomerBookingOrders';

const CustomerProfilePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [user, setUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const isOwnProfile = !userId || (user?.id && parseInt(userId) === parseInt(user.id));
  console.log('userId:', userId, 'isOwnProfile:', isOwnProfile);

  // Load current user
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("📱 Loaded user from localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error("❌ Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    } else {
      console.log("⚠️ No user found in localStorage");
    }
  }, []);

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
        case 'gallery':
          setActiveTab('gallery');
          break;
        case 'favorites':
          setActiveTab('favorites');
          break;
        default:
          setActiveTab('overview');
      }
    }
  }, [location.search]);

  // Load profile data using API
  useEffect(() => {
    const loadProfile = async () => {
      // ✅ FIX: Don't load profile until we have current user data (for own profile)
      if (isOwnProfile && !user) {
        console.log("⏳ Waiting for current user data...");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        console.log("🔄 Loading profile...", {
          isOwnProfile,
          userId,
          currentUser: user?.id,
        });

        let result;
        if (isOwnProfile) {
          // Get current user's profile
          console.log("📱 Fetching own profile");
          result = await userAPI.getCurrentProfile();
        } else {
          // Get specific user's profile
          console.log("👤 Fetching user profile for ID:", userId);
          result = await userAPI.getUserProfile(userId);
        }

        console.log("📊 Profile API result:", result);

        if (result.success) {
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


          // Update local storage if it's own profile
          if (isOwnProfile && profileData) {
            const currentUser = JSON.parse(
              localStorage.getItem("user") || "{}"
            );
            const updatedUser = { ...currentUser, ...profileData };
            localStorage.setItem("user", JSON.stringify(updatedUser));
            setUser(updatedUser);
          }
        } else {
          setError(result.message || "Failed to load profile");
        }
      } catch (err) {
        console.error("❌ Profile loading error:", err);
        setError("Unable to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // ✅ FIX: Only load profile when we have necessary data
    if (!isOwnProfile || user) {
      loadProfile();
    }
  }, [userId, user?.id, isOwnProfile]);

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

  const handleProfileUpdated = (updatedProfile) => {
    setProfileUser(prev => ({ ...prev, ...updatedProfile }));

    // Update user state and localStorage if it's own profile
    if (isOwnProfile) {
      const updatedUser = { ...user, ...updatedProfile };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    showSnackbar('Profile updated successfully!', 'success');
  };

  const handleEditAvatar = async () => {
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

            // ✅ FIX: Update profileUser state with both avatar and avatarUrl fields
            setProfileUser(prev => ({
              ...prev,
              avatar: newAvatarUrl,      // ← Add this for CustomerProfileHeader compatibility
              avatarUrl: newAvatarUrl    // ← Keep this for API compatibility
            }));

            // ✅ FIX: If it's own profile, also update the user state
            if (isOwnProfile) {
              const updatedUser = {
                ...user,
                avatar: newAvatarUrl,      // ← Add this for header compatibility
                avatarUrl: newAvatarUrl    // ← Keep this for API compatibility
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

  const mockCustomerPhotos = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    url: `/src/assets/cosplayer${(index % 8) + 1}.png`,
    title: `Event Photo ${index + 1}`,
    description: `Amazing cosplay event experience #${index + 1}`,
    category: ["event", "photoshoot", "convention", "meetup"][index % 4],
    likes: Math.floor(Math.random() * 100) + 20,
    tags: ["cosplay", "event", "memories", "community"],
  }));

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

  const customerTabs = [
    {
      id: "overview",
      label: "Overview",
      icon: "Info",
      show: true,
    },
    {
      id: "wallet",
      label: "Wallet",
      icon: "AccountBalanceWallet",
      show: isOwnProfile,
    },
    {
      id: "bookings",
      label: "Bookings",
      icon: "Event",
      count: customerTabCounts.bookings,
      show: isOwnProfile,
    },
    {
      id: "gallery",
      label: "Gallery",
      icon: "PhotoLibrary",
      count: customerTabCounts.photos,
      show: true,
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: "Favorite",
      count: customerTabCounts.favorites,
      show: isOwnProfile,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
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
      case "wallet":
        return (
          <CustomerWallet
            balance={profileUser?.walletBalance}
            loyaltyPoints={profileUser?.loyaltyPoints}
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
      case 'gallery':
        return (
          <ProfileGallery
            photos={mockCustomerPhotos}
            isOwnProfile={isOwnProfile}
            onAddPhoto={handleAddPhoto}
            loading={false}
            // Pass API functions for real gallery data
            onLoadGallery={(category) =>
              customerMediaAPI.getCustomerGallery(profileUser?.id, category)
            }
            onDeletePhoto={(photoId) =>
              customerMediaAPI.deleteProfilePhoto(photoId)
            }
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
            isOwnProfile={isOwnProfile}
            onEditProfile={handleEditProfile}
            onEditAvatar={handleEditAvatar}
            onFollowToggle={handleFollowToggle}
            isFollowing={isFollowing}
            walletBalance={profileUser?.walletBalance}
            membershipTier={profileUser?.membershipTier}
          />

          <ProfileTabs
            activeTab={activeTab}
            onTabChange={handleTabChange}
            isOwnProfile={isOwnProfile}
            counts={customerTabCounts}
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
