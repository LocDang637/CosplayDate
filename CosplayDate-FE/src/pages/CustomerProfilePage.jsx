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
    firstName: userId ? 'Khách hàng khác' : user?.firstName || 'Mai',
    lastName: userId ? 'Hồ sơ' : user?.lastName || 'Nguyen',
    email: userId ? 'customer@cosplaydate.com' : user?.email || 'mai@cosplaydate.com',
    avatar: '/src/assets/cosplayer1.png',
    isVerified: true,
    isOnline: true,
    location: 'Thành phố Hồ Chí Minh, Việt Nam',
    bio: 'Người đam mê cosplay và tổ chức sự kiện. Tôi yêu thích khám phá những cosplayer mới và biến những ý tưởng sáng tạo thành hiện thực. Luôn hào hứng hợp tác trong những trải nghiệm cosplay độc đáo và hỗ trợ cộng đồng.',
    totalBookings: 23,
    favoriteCosplayers: 12,
    reviewsGiven: 18,
    avgResponseTime: '< 30 phút',
    completionRate: '98%',
    memberSince: 'Tháng 1 năm 2023',
    avgRatingGiven: '4.7',
    interests: ['Anime', 'Gaming', 'Nhiếp ảnh', 'Sự kiện', 'Hội nghị', 'Nhân vật gốc'],
    membershipTier: 'Vàng',
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
    { name: 'Cosplay Anime', bookings: 12, color: '#E91E63' },
    { name: 'Nhân vật Game', bookings: 7, color: '#9C27B0' },
    { name: 'Chụp ảnh', bookings: 3, color: '#673AB7' },
    { name: 'Sự kiện', bookings: 1, color: '#3F51B5' },
  ];

  const mockRecentActivity = [
    {
      icon: '📸',
      title: 'Hoàn thành phiên chụp ảnh',
      description: 'Đánh giá 5 sao cho buổi chụp với Cosplay A',
      time: '2 giờ trước'
    },
    {
      icon: '💰',
      title: 'Nạp tiền vào ví',
      description: 'Đã thêm 1.000.000đ vào ví',
      time: '1 ngày trước'
    },
    {
      icon: '📅',
      title: 'Xác nhận đặt lịch mới',
      description: 'Tham gia hội nghị với Cosplay D',
      time: '2 ngày trước'
    },
    {
      icon: '⭐',
      title: 'Để lại đánh giá chi tiết',
      description: 'Đánh giá trải nghiệm với Cosplay C',
      time: '3 ngày trước'
    },
    {
      icon: '🎯',
      title: 'Đạt hạng Vàng',
      description: 'Mở khóa các quyền lợi thành viên Vàng',
      time: '1 tuần trước'
    },
  ];

  const mockCustomerPhotos = Array.from({ length: 16 }, (_, index) => ({
    id: index + 1,
    url: `/src/assets/cosplayer${(index % 8) + 1}.png`,
    title: `Ảnh sự kiện ${index + 1}`,
    description: `Trải nghiệm sự kiện cosplay tuyệt vời #${index + 1}`,
    category: ['sự kiện', 'chụp ảnh', 'hội nghị', 'gặp mặt'][index % 4],
    likes: Math.floor(Math.random() * 100) + 20,
    tags: ['cosplay', 'sự kiện', 'kỷ niệm', 'cộng đồng'],
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
        setError('Không thể tải hồ sơ. Vui lòng thử lại.');
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
    showSnackbar('Tính năng chỉnh sửa hồ sơ sẽ sớm ra mắt!', 'info');
  };

  const handleEditAvatar = () => {
    console.log('Edit avatar clicked');
    showSnackbar('Tính năng tải lên ảnh đại diện sẽ sớm ra mắt!', 'info');
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    showSnackbar(
      isFollowing ? 'Hủy theo dõi thành công' : 'Theo dõi thành công', 
      'success'
    );
  };

  const handleAddPhoto = () => {
    console.log('Add photo clicked');
    showSnackbar('Tính năng tải lên ảnh sẽ sớm ra mắt!', 'info');
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
      label: 'Tổng quan',
      icon: 'Info',
      show: true
    },
    {
      id: 'wallet',
      label: 'Ví điện tử',
      icon: 'AccountBalanceWallet',
      show: isOwnProfile // Only show for own profile
    },
    {
      id: 'bookings',
      label: 'Đặt lịch',
      icon: 'Event',
      count: customerTabCounts.bookings,
      show: isOwnProfile // Only show for own profile
    },
    {
      id: 'gallery',
      label: 'Thư viện ảnh',
      icon: 'PhotoLibrary',
      count: customerTabCounts.photos,
      show: true
    },
    {
      id: 'favorites',
      label: 'Yêu thích',
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
            <h3>Cosplayer yêu thích</h3>
            <p>Các cosplayer yêu thích của bạn sẽ hiển thị ở đây!</p>
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
              <h3>Đang tải hồ sơ khách hàng...</h3>
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