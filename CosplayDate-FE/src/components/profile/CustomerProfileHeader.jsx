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
  Card,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Edit,
  Settings,
  Share,
  MoreVert,
  LocationOn,
  Verified,
  Star,
  CameraAlt,
  AccountBalanceWallet,
  LocalOffer,
  Event,
  Favorite,
  TrendingUp,
  TheaterComedy,
  Warning,
} from '@mui/icons-material';


const CustomerProfileHeader = ({
  user,
  onEditProfile,
  onEditAvatar,
  deleteDialogOpen,
  onDeleteDialogClose,
  onConfirmDelete,
  walletBalance = 0,
  membershipTier = 'Bronze',
  isOwnProfile,
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarHovered, setAvatarHovered] = useState(false);

  if (!user) return null;
  const customer = user;

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
        borderRadius: '24px',
        p: 4,
        mb: 3,
        background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          pointerEvents: 'none',
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
                {user.firstName} {user.lastName}
              </Typography>

              {user.isOnline && (
                <Chip
                  label="Đang hoạt động"
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
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

            {/* Customer Stats Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Event sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.totalBookings || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  lượt đặt
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Favorite sx={{ color: '#FF6B6B', fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.favoriteCosplayers || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  yêu thích
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.reviewsGiven || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  đánh giá
                </Typography>
              </Box>
            </Box>

            {/* Location */}
            {user.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.location}
                </Typography>
              </Box>
            )}

            {/* Bio */}
            {user.bio && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                }}
              >
                {user.bio}
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

        {/* Customer Dashboard Cards */}
        <Grid container spacing={2}>
          {/* Wallet Balance Card */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(76, 175, 80, 0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <AccountBalanceWallet
                  sx={{
                    fontSize: 32,
                    color: '#4CAF50',
                    mb: 1
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  {formatCurrency(walletBalance)}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  Số dư ví
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Active Bookings */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(33, 150, 243, 0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <Event
                  sx={{
                    fontSize: 32,
                    color: '#2196F3',
                    mb: 1
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  {user.activeBookings || 2}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  Đặt chỗ đang hoạt động
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Loyalty Points */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
                border: '1px solid rgba(255, 193, 7, 0.2)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(255, 193, 7, 0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <LocalOffer
                  sx={{
                    fontSize: 32,
                    color: '#FFC107',
                    mb: 1
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  {user.loyaltyPoints || 1250}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  Điểm tích lũy
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Member Since */}
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(233, 30, 99, 0.05) 100%)',
                border: '1px solid rgba(233, 30, 99, 0.2)',
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', py: 2 }}>
                <TrendingUp
                  sx={{
                    fontSize: 32,
                    color: '#E91E63',
                    mb: 1
                  }}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                  {new Date().getFullYear()}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  Thành viên từ
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Customer Interests/Preferences */}
        {user.interests && user.interests.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle2" sx={{ width: '100%', mb: 1, fontWeight: 600 }}>
              Sở thích:
            </Typography>
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
          </Box>
        )}
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
          <>
            <MenuItem onClick={() => { handleMenuClose(); onEditProfile(); }}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Chỉnh sửa hồ sơ" />
            </MenuItem>
            
            <MenuItem onClick={handleBecomeCosplayer}>
              <ListItemIcon>
                <TheaterComedy fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Trở thành Cosplayer" />
            </MenuItem>
          </>
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
          Delete Avatar
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete your profile avatar? This action cannot be undone.
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
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default CustomerProfileHeader;