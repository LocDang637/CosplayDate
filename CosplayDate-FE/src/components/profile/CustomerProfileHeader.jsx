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
    </Paper>
  );
};

export default CustomerProfileHeader;