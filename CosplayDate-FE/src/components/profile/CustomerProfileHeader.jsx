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
  LocationOn,
  Verified,
  CameraAlt,
  Event,
  PersonAdd,
  TheaterComedy,
  Warning,
  Schedule,
  Add,
} from '@mui/icons-material';


const CustomerProfileHeader = ({
  user,
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

  // Get membership tier from API data
  const membershipTier = customer.membershipTier || 'Bronze';

  // Get stats from API data
  const stats = customer.stats || {};

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
        if (responseText.trim().startsWith('!DOCTYPE') || responseText.trim().startsWith('<html')) {
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
      
      // If API is not available, use mock data for development
      if (error.message.includes('API endpoint') || error.message.includes('không tồn tại')) {
        console.log('Using mock data for interests');
        
        const mockAvailableInterests = [
          "Anime", "Manga", "Gaming", "Photography", "Cosplay Making", "Prop Making",
          "Sewing", "Makeup", "Wig Styling", "Convention", "Video Making", "Dancing",
          "Acting", "Singing", "Streaming", "Art", "Digital Art", "3D Printing",
          "Crafting", "Fashion", "Design", "Music", "Movies", "TV Shows", "Books",
          "Fantasy", "Sci-Fi", "Horror", "Romance", "Action", "Adventure", "Comedy",
          "Drama", "Historical", "Mecha", "Magical Girl", "Shounen", "Shoujo",
          "Seinen", "Josei", "Yaoi", "Yuri", "Isekai", "Slice of Life", "Sports",
          "Racing", "Fighting Games", "RPG", "MMORPG", "Strategy", "Simulation",
          "Puzzle", "Visual Novel", "Mobile Games", "Indie Games", "Retro Gaming"
        ];
        
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          availableInterests: mockAvailableInterests,
          selectedInterests: user.interests || [],
          error: 'Sử dụng dữ liệu mẫu (API chưa sẵn sàng)'
        }));
      } else {
        setInterestsDialog(prev => ({
          ...prev,
          loading: false,
          error: error.message || 'Có lỗi xảy ra khi tải danh sách sở thích. Vui lòng thử lại sau.'
        }));
      }
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
        // Update user data locally (you might want to trigger a parent component refresh)
        user.interests = interestsDialog.selectedInterests;
        handleCloseInterestsDialog();
        // Optional: Show success message or trigger parent refresh
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

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const getTierIcon = (tier) => {
    switch (tier) {
      case 'Bronze': return '🥉';
      case 'Silver': return '🥈';
      case 'Gold': return '🥇';
      case 'Platinum': return '💎';
      default: return '🥉';
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

  return (
    <Paper
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #FFE0EC 0%, #E8D5F2 100%)',
        borderRadius: '24px',
        p: 4,
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

          {/* Profile Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '24px', md: '32px' },
                }}
              >
                {customer.firstName} {customer.lastName}
              </Typography>

              {customer.isOnline && (
                <Chip
                  label="Đang online"
                  size="small"
                  icon={<Check sx={{ fontSize: 16 }} />}
                  sx={{
                    bgcolor: '#4CAF50',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                    padding: '16px 8px',
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
                    '&::before': {
                      content: '""',
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: '#757575',
                      marginRight: 0.5,
                      display: 'inline-block'
                    }
                  }}
                />
              )}

              {/* Membership Tier */}
              <Chip
                label={`${getTierIcon(membershipTier)} Thành viên ${getTierNameVN(membershipTier)}`}
                sx={{
                  backgroundColor: getTierColor(membershipTier),
                  color: 'white',
                  fontWeight: 600,
                  fontSize: '12px',
                }}
              />
            </Box>

            {/* Location */}
            {customer.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {customer.location}
                </Typography>
              </Box>
            )}

            {/* Bio */}
            {customer.bio && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                }}
              >
                {customer.bio}
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            <IconButton
              onClick={handleMenuOpen}
              sx={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
              }}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Customer Interests/Preferences */}
        <Box sx={{ mt: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Sở thích:
            </Typography>
            {(!user.interests || user.interests.length === 0) && isOwnProfile && (
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
                Thêm sở thích
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
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    color: 'primary.main',
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,1)',
                    },
                  }}
                />
              ))}
              {isOwnProfile && (
                <Chip
                  label="Chỉnh sửa"
                  onClick={handleOpenInterestsDialog}
                  sx={{
                    backgroundColor: 'primary.main',
                    color: 'white',
                    fontWeight: 500,
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                />
              )}
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chưa có sở thích nào được thêm
            </Typography>
          )}
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

        {/* Only show these options for own profile */}
        {isOwnProfile && (
          <MenuItem onClick={() => { handleMenuClose(); onEditProfile(); }}>
            <ListItemIcon>
              <Edit fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Chỉnh sửa hồ sơ" />
          </MenuItem>
        )}

        {isOwnProfile && (
          <MenuItem onClick={handleBecomeCosplayer}>
            <ListItemIcon>
              <TheaterComedy fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Trở thành Cosplayer" />
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 320
          }
        }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Warning color="error" />
          Xóa ảnh đại diện
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Bạn có chắc chắn muốn xóa ảnh đại diện của mình? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleDeleteCancel}
            variant="outlined"
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
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>

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
    </Paper>
  );
};

export default CustomerProfileHeader;