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
    firstName: userId ? 'Người dùng khác' : user?.firstName || 'Mai',
    lastName: userId ? 'Hồ sơ' : user?.lastName || 'Nguyen',
    email: userId ? 'other@cosplaydate.com' : user?.email || 'mai@cosplaydate.com',
    avatar: '/src/assets/cosplayer1.png',
    isVerified: true,
    isOnline: true,
    location: 'Thành phố Hồ Chí Minh, Việt Nam',
    bio: 'Cosplayer chuyên nghiệp chuyên về các nhân vật anime và game. Tôi yêu thích việc tái hiện các nhân vật hư cấu thông qua những bộ trang phục chi tiết và diễn xuất chân thực. Có thể tham gia sự kiện, chụp ảnh và hợp tác.',
    rating: 4.9,
    reviewCount: 127,
    followersCount: 2453,
    followingCount: 892,
    responseTime: '< 1 giờ',
    startingPrice: '500.000đ/giờ',
    successRate: '98%',
    specialties: ['Anime', 'Game', 'Nhân vật gốc', 'Lịch sử'],
    services: ['Chụp ảnh', 'Sự kiện', 'Hội nghị', 'Phiên riêng tư', 'Hướng dẫn'],
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
    { name: 'Thiết kế trang phục', level: 95, color: '#E91E63' },
    { name: 'Nghệ thuật trang điểm', level: 88, color: '#9C27B0' },
    { name: 'Diễn xuất nhân vật', level: 92, color: '#673AB7' },
    { name: 'Chụp ảnh', level: 75, color: '#3F51B5' },
    { name: 'Làm đạo cụ', level: 82, color: '#2196F3' },
  ];

  const mockRecentActivity = [
    {
      icon: '📸',
      title: 'Đã tải ảnh mới',
      description: 'Đã thêm 5 ảnh cosplay mới vào thư viện',
      time: '2 giờ trước'
    },
    {
      icon: '⭐',
      title: 'Nhận được đánh giá 5 sao',
      description: 'Phản hồi tuyệt vời từ khách hàng chụp ảnh gần đây',
      time: '1 ngày trước'
    },
    {
      icon: '🎭',
      title: 'Hoàn thành sự kiện',
      description: 'Đã hoàn thành thành công việc tham gia Lễ hội Anime',
      time: '3 ngày trước'
    },
    {
      icon: '🏆',
      title: 'Nhận giải thưởng',
      description: 'Thiết kế trang phục xuất sắc nhất tại Vietnam Comic Con',
      time: '1 tuần trước'
    },
  ];

  const mockPhotos = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    url: `/src/assets/cosplayer${(index % 8) + 1}.png`,
    title: `Ảnh Cosplay ${index + 1}`,
    description: `Buổi chụp ảnh cosplay tuyệt vời #${index + 1}`,
    category: ['anime', 'game', 'gốc', 'sự kiện'][index % 4],
    likes: Math.floor(Math.random() * 500) + 50,
    tags: ['cosplay', 'anime', 'chụp ảnh', 'nhân vật'],
  }));

  const mockReviews = Array.from({ length: 15 }, (_, index) => ({
    id: index + 1,
    user: {
      name: `Người dùng ${index + 1}`,
      avatar: `/src/assets/cosplayer${(index % 8) + 1}.png`,
      verified: Math.random() > 0.5,
    },
    rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
    comment: `Cosplayer tuyệt vời! Rất chuyên nghiệp và tài năng. Sự chú ý đến từng chi tiết trong trang phục thật đáng kinh ngạc. Chắc chắn sẽ đặt lại cho các sự kiện trong tương lai. ${index % 3 === 0 ? 'Buổi chụp ảnh vượt quá mọi mong đợi của tôi và kết quả cuối cùng thật tuyệt đẹp.' : ''}`,
    date: `${Math.floor(Math.random() * 30) + 1} ngày trước`,
    helpfulCount: Math.floor(Math.random() * 20),
    tags: ['Chuyên nghiệp', 'Sáng tạo', 'Đúng giờ', 'Tài năng'][Math.floor(Math.random() * 4)] ? ['Chuyên nghiệp'] : [],
    response: index % 5 === 0 ? 'Cảm ơn bạn rất nhiều vì đánh giá tuyệt vời! Thật vui khi được làm việc cùng bạn.' : null,
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
    showSnackbar('Tính năng chỉnh sửa hồ sơ sắp ra mắt!', 'info');
  };

  const handleEditAvatar = () => {
    console.log('Edit avatar clicked');
    showSnackbar('Tính năng tải lên ảnh đại diện sắp ra mắt!', 'info');
  };

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
    showSnackbar(
      isFollowing ? 'Đã bỏ theo dõi thành công' : 'Đã theo dõi thành công', 
      'success'
    );
  };

  const handleAddPhoto = () => {
    console.log('Add photo clicked');
    showSnackbar('Tính năng tải lên ảnh sắp ra mắt!', 'info');
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
            <h3>Phần Video</h3>
            <p>Nội dung video sắp ra mắt!</p>
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
            <h3>Phần Sự kiện</h3>
            <p>Nội dung sự kiện sắp ra mắt!</p>
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
            <h3>Phần Thành tích</h3>
            <p>Giải thưởng và thành tích sắp ra mắt!</p>
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
            <h3>Phần Yêu thích</h3>
            <p>Nội dung yêu thích của bạn sẽ xuất hiện ở đây!</p>
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
              <h3>Đang tải hồ sơ...</h3>
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