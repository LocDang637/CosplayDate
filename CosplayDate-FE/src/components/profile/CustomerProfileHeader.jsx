import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  TextField,
  Autocomplete,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Edit,
  Check,
  Share,
  MoreVert,
  Verified,
  CameraAlt,
  TheaterComedy,
  Warning,
  Schedule,
  Event,
  Star,
  TrendingUp,
  LocalOffer,
  Person,
  PersonAdd,
  Visibility,
  AccountBalanceWallet,
  CheckCircle,
  EmojiEvents,
  CalendarMonth,
  Add,
  LocationOn,
  WorkspacePremium,
  Groups,
  Favorite,
  PhotoLibrary,
} from '@mui/icons-material';

// StatItem component for consistent stat display
const StatItem = ({ icon, value, label }) => (
  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 80 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', textAlign: 'center' }}>
      {label}
    </Typography>
  </Box>
);

const CustomerProfileHeader = ({
  user,
  stats: propStats,
  recentActivity,
  favoriteCategories,
  onEditProfile,
  onEditAvatar,
  deleteDialogOpen,
  onDeleteDialogClose,
  onConfirmDelete,
  isOwnProfile,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarHovered, setAvatarHovered] = useState(false);

  // Interests dialog state
  const [interestsDialog, setInterestsDialog] = useState({
    open: false,
    loading: false,
    availableInterests: [],
    selectedInterests: [],
    error: ''
  });

  if (!user) return null;

  // Extract user data from API response
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

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteCancel = () => {
    onDeleteDialogClose?.();
  };

  const handleDeleteConfirm = () => {
    onDeleteDialogClose?.();
    onConfirmDelete?.();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.firstName} ${user.lastName} - Khách hàng CosplayDate`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    handleMenuClose();
  };

  const handleBecomeCosplayer = () => {
    navigate('/become-cosplayer');
    handleMenuClose();
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

  // Vietnamese tier names
  const getTierNameVN = (tier) => {
    switch (tier) {
      case 'Bronze': return 'Đồng';
      case 'Silver': return 'Bạc';
      case 'Gold': return 'Vàng';
      case 'Platinum': return 'Bạch kim';
      default: return 'Đồng';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

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

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (response.status === 404) {
          throw new Error('API endpoint không tồn tại trên server.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('API Response:', result);

      if (result.isSuccess) {
        // Use interests from API response, fallback to user.interests, fallback to empty array
        const currentInterests = result.data?.interests || customer.interests || [];
        
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          availableInterests: result.data?.availableInterests || [],
          selectedInterests: currentInterests,
          error: ''
        }));
      } else {
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          availableInterests: [],
          selectedInterests: customer.interests || [],
          error: result.message || 'Không thể tải danh sách sở thích'
        }));
      }
    } catch (error) {
      console.error('Error fetching interests:', error);
      
      // Fallback: Use predefined interests list if API is not available
      const fallbackInterests = [
        'Anime', 'Manga', 'Gaming', 'Cosplay', 'Photography', 'Art',
        'Music', 'Dance', 'Fashion', 'Movies', 'Technology', 'Travel',
        'Food', 'Sports', 'Reading', 'Writing', 'Drawing', 'Singing'
      ];
      
      setInterestsDialog(prev => ({
        ...prev,
        loading: false,
        availableInterests: fallbackInterests,
        selectedInterests: customer.interests || [],
        error: `Không thể kết nối đến server. Đang sử dụng danh sách sở thích mặc định.`
      }));
    }
  };

  const handleSaveInterests = async () => {
    if (interestsDialog.selectedInterests.length > 10) {
      setInterestsDialog(prev => ({
        ...prev,
        error: 'Bạn chỉ có thể chọn tối đa 10 sở thích.'
      }));
      return;
    }

    setInterestsDialog(prev => ({ ...prev, loading: true, error: '' }));

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://localhost:7241/api';
      const apiUrl = `${apiBaseUrl}/users/interests`;

      console.log('Making PUT request to:', apiUrl);

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ interests: interestsDialog.selectedInterests }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        }
        if (response.status === 404) {
          throw new Error('API endpoint không tồn tại trên server.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save response:', result);

      if (result.isSuccess) {
        // Update the customer interests locally
        customer.interests = interestsDialog.selectedInterests;
        
        setInterestsDialog(prev => ({ ...prev, open: false, loading: false }));
        
        // You could also trigger a success notification here if needed
        console.log('Interests saved successfully');
      } else {
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          error: result.message || 'Không thể lưu sở thích. Vui lòng thử lại.'
        }));
      }
    } catch (error) {
      console.error('Error saving interests:', error);
      setInterestsDialog(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Có lỗi xảy ra khi lưu sở thích. Vui lòng thử lại sau.'
      }));
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #FFE0EC 0%, #E8D5F2 100%)',
        borderRadius: '24px',
        p: 4,
        mb: 3,
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -100,
          right: -100,
          width: 300,
          height: 300,
          borderRadius: '50%',
          background: 'rgba(233, 30, 99, 0.1)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -50,
          left: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(156, 39, 176, 0.1)',
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Top Section with Avatar and Basic Info */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          {/* Avatar Section */}
          <Box
            sx={{ position: 'relative' }}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                customer.isVerified && (
                  <Verified
                    sx={{
                      color: '#4CAF50',
                      fontSize: 28,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      p: '2px'
                    }}
                  />
                )
              }
            >
              <Avatar
                src={customer.avatar || customer.avatarUrl}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                  cursor: isOwnProfile ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  '&:hover': isOwnProfile ? {
                    transform: 'scale(1.05)',
                  } : {},
                }}
                onClick={isOwnProfile ? onEditAvatar : undefined}
              >
                {customer.firstName?.[0]}{customer.lastName?.[0]}
              </Avatar>
            </Badge>

            {/* Camera Overlay for Own Profile */}
            {isOwnProfile && (
              <Fade in={avatarHovered}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    pointerEvents: 'none',
                  }}
                >
                  <CameraAlt sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </Fade>
            )}
          </Box>

          {/* Main Info Section */}
          <Box sx={{ flex: 1, minWidth: 300 }}>
            {/* Name and Status */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  letterSpacing: '-0.5px'
                }}
              >
                {customer.firstName} {customer.lastName}
              </Typography>

              {/* Online Status */}
              {customer.isOnline && (
                <Chip
                  label="Đang online"
                  size="small"
                  icon={<Check sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#4CAF50',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              )}

              {!customer.isOnline && (
                <Chip
                  label="Đang offline"
                  size="small"
                  icon={<Schedule sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#757575',
                    color: 'white',
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: 'white' }
                  }}
                />
              )}

              {/* Membership Tier */}
              <Chip
                label={`Thành viên ${getTierNameVN(membershipTier)}`}
                size="small"
                icon={<WorkspacePremium sx={{ fontSize: 16 }} />}
                sx={{
                  bgcolor: getTierColor(membershipTier),
                  color: 'white',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: 'white' }
                }}
              />
            </Box>

            {/* Bio */}
            {customer.bio && (
              <Box sx={{ mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontStyle: 'italic',
                    lineHeight: 1.6
                  }}
                >
                  {customer.bio}
                </Typography>
              </Box>
            )}

            {/* Info Grid */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexDirection: 'column' }}>
              {/* Location */}
              {customer.location && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {customer.location}
                  </Typography>
                </Box>
              )}

              {/* Member Since */}
              {memberSince && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <CalendarMonth sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Thành viên từ {new Date(memberSince).toLocaleDateString('vi-VN')}
                  </Typography>
                </Box>
              )}

              {/* Loyalty Points */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmojiEvents sx={{ fontSize: 20, color: '#FFB400' }} />
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#FFB400' }}>
                  {loyaltyPoints.toLocaleString()} điểm
                </Typography>
              </Box>
            </Box>

            {/* Interests */}
            {customer.interests && customer.interests.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Sở thích:
                  </Typography>
                  {isOwnProfile && (
                    <IconButton 
                      size="small" 
                      onClick={handleOpenInterestsDialog}
                      sx={{ 
                        p: 0.5,
                        '&:hover': { bgcolor: 'rgba(233, 30, 99, 0.1)' }
                      }}
                    >
                      <Edit sx={{ fontSize: 16, color: 'primary.main' }} />
                    </IconButton>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {customer.interests.map((interest, index) => (
                    <Chip
                      key={index}
                      label={interest}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(233, 30, 99, 0.1)',
                        color: 'primary.main',
                        fontWeight: 500,
                        borderRadius: '12px'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 200 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                alignSelf: 'flex-end',
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 160,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
      >
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Chia sẻ hồ sơ" />
        </MenuItem>
        
        {isOwnProfile && [
          <MenuItem key="edit" onClick={() => { handleMenuClose(); onEditProfile?.(); }}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Chỉnh sửa hồ sơ" />
          </MenuItem>,
          <MenuItem key="become-cosplayer" onClick={handleBecomeCosplayer}>
            <ListItemIcon>
              <TheaterComedy fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Trở thành Cosplayer" />
          </MenuItem>
        ]}
      </Menu>

      {/* Interests Dialog */}
      <Dialog 
        open={interestsDialog.open} 
        onClose={() => setInterestsDialog(prev => ({ ...prev, open: false }))}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          background: 'linear-gradient(135deg, #FFE0EC 0%, #E8D5F2 100%)',
          color: 'primary.main',
          fontWeight: 700
        }}>
          Chỉnh sửa sở thích
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {interestsDialog.error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {interestsDialog.error}
            </Alert>
          )}
          
          <Autocomplete
            multiple
            options={interestsDialog.availableInterests}
            value={interestsDialog.selectedInterests}
            onChange={(event, newValue) => {
              setInterestsDialog(prev => ({
                ...prev,
                selectedInterests: newValue
              }));
            }}
            disabled={interestsDialog.loading}
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={option}
                  {...getTagProps({ index })}
                  key={option}
                  sx={{ 
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(233, 30, 99, 0.1)'
                    }
                  }}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Chọn sở thích"
                placeholder="Tìm kiếm và chọn sở thích..."
                variant="outlined"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {interestsDialog.loading ? <CircularProgress color="inherit" size={20} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            )}
            sx={{ mt: 1 }}
          />
          
          <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
            Chọn tối đa 10 sở thích để giúp chúng tôi gợi ý các cosplayer phù hợp với bạn.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setInterestsDialog(prev => ({ ...prev, open: false }))}
            sx={{ borderRadius: '12px' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleSaveInterests}
            variant="contained"
            disabled={interestsDialog.loading}
            sx={{ 
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #E91E63 0%, #9C27B0 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #C2185B 0%, #7B1FA2 100%)',
              }
            }}
          >
            {interestsDialog.loading ? <CircularProgress size={20} color="inherit" /> : 'Lưu'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ 
          color: 'error.main',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}>
          <Warning />
          Xác nhận xóa tài khoản
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bạn có chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleDeleteCancel}
            sx={{ borderRadius: '12px' }}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            sx={{ borderRadius: '12px' }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CustomerProfileHeader;
