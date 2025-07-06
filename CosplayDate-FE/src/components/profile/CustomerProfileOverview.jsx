import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Event,
  Star,
  TrendingUp,
  LocalOffer,
  Person,
  PersonAdd,
  Visibility,
  AccountBalanceWallet,
  Schedule,
  CheckCircle,
  EmojiEvents,
  CalendarMonth,
  Add,
} from '@mui/icons-material';

const CustomerProfileOverview = ({ 
  user, 
  stats: propStats, // Keep prop stats as propStats to avoid conflict
  recentActivity, 
  favoriteCategories,
  isOwnProfile, // Add isOwnProfile prop
  onEditProfile // Add onEditProfile prop to trigger ProfileEditModal
}) => {
  // Interests dialog state
  const [interestsDialog, setInterestsDialog] = useState({
    open: false,
    loading: false,
    availableInterests: [],
    selectedInterests: [],
    error: ''
  });

  if (!user) return null;

  // Extract data from API response
  const customer = user;

  // Get wallet balance from API data
  const walletBalance = customer.walletBalance || 0;

  // Get loyalty points from API data  
  const loyaltyPoints = customer.loyaltyPoints || 0;

  // Get membership tier from API data
  const membershipTier = customer.membershipTier || 'Bronze';

  // Get stats from API data (prioritize API stats over prop stats)
  const stats = customer.stats || propStats || {};

  // Get member since date from API data
  const memberSince = stats.memberSince || customer.createdAt;
  const StatCard = ({ icon, label, value, color = 'primary', trend, trendValue }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${color === 'primary' ? '#E91E63, #9C27B0' : color === 'success' ? '#4CAF50, #2196F3' : '#FF9800, #F44336'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
          {label}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <TrendingUp sx={{ fontSize: 14, color: trend === 'up' ? '#4CAF50' : '#F44336' }} />
            <Typography variant="caption" sx={{ color: trend === 'up' ? '#4CAF50' : '#F44336' }}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const CategoryBar = ({ category, bookings, total, color = '#E91E63' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {category}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {bookings} bookings
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(bookings / total) * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const membershipProgress = {
    Bronze: { current: loyaltyPoints, next: 2500, nextTier: 'Silver' },
    Silver: { current: loyaltyPoints, next: 5000, nextTier: 'Gold' },
    Gold: { current: loyaltyPoints, next: 10000, nextTier: 'Platinum' },
    Platinum: { current: loyaltyPoints, next: loyaltyPoints, nextTier: 'Platinum Max' }
  };

  const currentProgress = membershipProgress[membershipTier];

  // Interests dialog handlers
  const handleOpenInterestsDialog = async () => {
    setInterestsDialog(prev => ({ ...prev, open: true, loading: true, error: '' }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Attempting to fetch interests from API');
      
      // Use the configured API base URL from environment variables
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7241/api';
      const apiUrl = `${apiBaseUrl}/users/interests`;
      
      console.log('Making request to:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (response.status === 404) {
          throw new Error('API endpoint chưa được triển khai. Sử dụng dữ liệu mẫu.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse JSON response - handle HTML responses gracefully
      let result;
      try {
        const responseText = await response.text();
        console.log('Response text preview:', responseText.substring(0, 200));
        console.log('Full response text:', responseText);
        
        // Check if response is HTML (likely an error page)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          throw new Error('API endpoint không tồn tại hoặc server trả về trang lỗi');
        }
        
        // Check if response is empty
        if (!responseText.trim()) {
          throw new Error('Server trả về phản hồi trống');
        }
        
        result = JSON.parse(responseText);
        console.log('Parsed result:', result);
      } catch (parseError) {
        console.error('Parse error details:', parseError);
        console.error('Response text that failed to parse:', responseText);
        
        if (parseError.message.includes('API endpoint') || parseError.message.includes('Server trả về')) {
          throw parseError;
        }
        
        // More specific error messages
        if (parseError instanceof SyntaxError) {
          throw new Error(`Lỗi định dạng JSON từ server: ${parseError.message}`);
        }
        
        throw new Error('Phản hồi từ server không đúng định dạng JSON');
      }

      if (result.isSuccess) {
        // Use interests from API response, fallback to user.interests, fallback to empty array
        const currentInterests = result.data.interests || user.interests || [];
        
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          availableInterests: result.data.availableInterests || [],
          selectedInterests: currentInterests,
          error: ''
        }));
      } else {
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Không thể tải danh sách sở thích'
        }));
      }
    } catch (error) {
      console.error('Error loading interests:', error);
      
      // If API is not available, use fallback
      setInterestsDialog(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Có lỗi xảy ra khi tải danh sách sở thích. Vui lòng thử lại sau.'
      }));
    }
  };

  const handleCloseInterestsDialog = () => {
    setInterestsDialog({
      open: false,
      loading: false,
      availableInterests: [],
      selectedInterests: [],
      error: ''
    });
  };

  const handleInterestsChange = (event, newValue) => {
    setInterestsDialog(prev => ({
      ...prev,
      selectedInterests: newValue
    }));
  };

  const handleSaveInterests = async () => {
    setInterestsDialog(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      // Use the configured API base URL from environment variables
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7241/api';
      const apiUrl = `${apiBaseUrl}/users/interests`;
      
      console.log('Making PUT request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interests: interestsDialog.selectedInterests
        }),
      });

      // Check if response is ok
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (response.status === 404) {
          throw new Error('API endpoint chưa được triển khai. Sử dụng lưu trữ cục bộ.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Try to parse JSON response - handle HTML responses gracefully
      let result;
      try {
        const responseText = await response.text();
        console.log('Save response text:', responseText);
        
        // Check if response is HTML (likely an error page)
        if (responseText.trim().startsWith('<!DOCTYPE') || responseText.trim().startsWith('<html')) {
          throw new Error('API endpoint không tồn tại hoặc server trả về trang lỗi');
        }
        
        // Check if response is empty
        if (!responseText.trim()) {
          throw new Error('Server trả về phản hồi trống');
        }
        
        result = JSON.parse(responseText);
        console.log('Save parsed result:', result);
      } catch (parseError) {
        console.error('Save parse error details:', parseError);
        console.error('Save response text that failed to parse:', responseText);
        
        if (parseError.message.includes('API endpoint') || parseError.message.includes('Server trả về')) {
          throw parseError;
        }
        
        // More specific error messages
        if (parseError instanceof SyntaxError) {
          throw new Error(`Lỗi định dạng JSON từ server: ${parseError.message}`);
        }
        
        throw new Error('Phản hồi từ server không đúng định dạng JSON');
      }

      if (result.isSuccess) {
        // Update user data locally
        user.interests = interestsDialog.selectedInterests;
        handleCloseInterestsDialog();
      } else {
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Không thể lưu sở thích'
        }));
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      
      // If API is not available, save locally for development
      if (error.message.includes('API endpoint') || error.message.includes('không tồn tại')) {
        console.log('API not available, saving interests locally');
        
        // Update user data locally
        user.interests = interestsDialog.selectedInterests;
        handleCloseInterestsDialog();
        
        // Show a warning that it's only saved locally
        alert('Sở thích đã được lưu tạm thời (API chưa sẵn sàng)');
      } else {
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Có lỗi xảy ra khi lưu sở thích. Vui lòng thử lại sau.'
        }));
      }
    }
  };

  return (
    <Box>
      <Grid container spacing={3}>
        {/* About Section */}
        <Grid item xs={12} md={8}>
          {/* Customer Bio */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Về {customer.firstName}
            </Typography>
            {customer.bio && (
              <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
                {customer.bio}
              </Typography>
            )}

            {/* User Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin cá nhân
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {customer.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Đến từ: {customer.location}
                    </Typography>
                  </Box>
                )}
                {memberSince && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Thành viên từ: {new Date(memberSince).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Customer Interests/Preferences */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  Sở thích:
                </Typography>
                {isOwnProfile && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Add />}
                    onClick={handleOpenInterestsDialog}
                    sx={{
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      fontSize: '12px',
                      py: 0.5,
                      px: 1.5,
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'rgba(233, 30, 99, 0.08)'
                      }
                    }}
                  >
                    {(!user.interests || user.interests.length === 0) ? 'Thêm sở thích' : 'Chỉnh sửa'}
                  </Button>
                )}
              </Box>

              {user.interests && user.interests.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {user.interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      sx={{
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        color: 'primary.main',
                        fontWeight: 500,
                        '&:hover': {
                          backgroundColor: 'rgba(233, 30, 99, 0.2)',
                        },
                      }}
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Chưa có sở thích nào được thêm
                </Typography>
              )}
            </Box>
          </Paper>

          {/* Interests Dialog */}
          <Dialog
            open={interestsDialog.open}
            onClose={handleCloseInterestsDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
              sx: {
                borderRadius: '16px',
                p: 1
              }
            }}
          >
            <DialogTitle sx={{ pb: 2, fontWeight: 600 }}>
              Cập nhật sở thích
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Chọn những sở thích phù hợp với bạn
              </Typography>
            </DialogTitle>

            <DialogContent>
              {interestsDialog.error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {interestsDialog.error}
                </Alert>
              )}

              {interestsDialog.loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <Autocomplete
                  multiple
                  options={interestsDialog.availableInterests}
                  value={interestsDialog.selectedInterests}
                  onChange={handleInterestsChange}
                  filterSelectedOptions
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Tìm kiếm và chọn sở thích..."
                      variant="outlined"
                      fullWidth
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={index}
                        sx={{
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '& .MuiChip-deleteIcon': {
                            color: 'primary.main'
                          }
                        }}
                      />
                    ))
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              )}

              {interestsDialog.selectedInterests.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Đã chọn {interestsDialog.selectedInterests.length} sở thích:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {interestsDialog.selectedInterests.map((interest, index) => (
                      <Chip
                        key={index}
                        label={interest}
                        size="small"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontWeight: 500
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
              <Button
                onClick={handleCloseInterestsDialog}
                variant="outlined"
                disabled={interestsDialog.loading}
                sx={{
                  borderColor: '#ccc',
                  color: '#666',
                  '&:hover': {
                    borderColor: '#999',
                    backgroundColor: '#f5f5f5'
                  }
                }}
              >
                Hủy
              </Button>
              <Button
                onClick={handleSaveInterests}
                variant="contained"
                disabled={interestsDialog.loading}
                startIcon={interestsDialog.loading ? <CircularProgress size={16} /> : null}
                sx={{
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark'
                  }
                }}
              >
                {interestsDialog.loading ? 'Đang lưu...' : 'Lưu thay đổi'}
              </Button>
            </DialogActions>
          </Dialog>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Membership Status */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Trạng thái thành viên
            </Typography>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${getTierColor(membershipTier)}, ${getTierColor(membershipTier)}AA)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <EmojiEvents sx={{ color: 'white', fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: getTierColor(membershipTier) }}>
                Thành viên {membershipTier}
              </Typography>
            </Box>

            {membershipTier !== 'Platinum' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Progress to {currentProgress.nextTier}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentProgress.current}/{currentProgress.next}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(currentProgress.current / currentProgress.next) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getTierColor(membershipTier),
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '12px' }}>
                  {currentProgress.next - currentProgress.current} points to next tier
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerProfileOverview;