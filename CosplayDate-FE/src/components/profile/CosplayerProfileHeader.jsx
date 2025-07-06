// src/components/profile/CosplayerProfileHeader.jsx - Improved Version with Avatar Upload
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  Paper,
  Divider,
  Badge,
  Rating,
  Fade,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Edit,
  Share,
  LocationOn,
  AttachMoney,
  Schedule,
  Check,
  WorkspacePremium,
  Groups,
  PhotoLibrary,
  Favorite,
  CameraAlt,
  Verified,
  Event,
  Warning,
  PersonAdd, PersonRemove,
  MoreVert
} from '@mui/icons-material';
import EditCosplayerDialog from './EditCosplayerDialog';

const CosplayerProfileHeader = ({
  user,
  currentProfile,
  onEditAvatar,
  onProfileUpdate,
  isOwnProfile,
  deleteDialogOpen,
  onDeleteDialogClose,
  onConfirmDelete,
  onFollowToggle,
  isFollowing,
  onEditClick = () => { },
  currentUser = null, // Add currentUser prop
}) => {
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

  if (!user) return null;

  // Create cosplayer alias for easier refactoring
  const cosplayer = user;

  // Get current user with fallback logic similar to CosplayerCard
  const getCurrentUser = () => {
    if (currentUser) return currentUser;

    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        return null;
      }
    }
    return null;
  };

  const loggedInUser = getCurrentUser();

  // Debug log
  console.log('CosplayerProfileHeader - Current user:', loggedInUser);

  // Check if current user is a customer (not a cosplayer)
  const isCustomer = loggedInUser && loggedInUser.userType === 'Customer';

  const handleEditClick = () => {
    setEditDialogOpen(true);
  };

  const handleEditClose = () => {
    setEditDialogOpen(false);
  };

  const handleEditSuccess = (updatedData) => {
    onProfileUpdate?.(updatedData);
    setEditDialogOpen(false);
  };

  const handleDeleteCancel = () => {
    onDeleteDialogClose?.();
  };

  const handleDeleteConfirm = () => {
    onDeleteDialogClose?.();
    onConfirmDelete?.();
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.firstName} ${user.lastName} - Cosplayer CosplayDate`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
    handleMenuClose();
  };

  const handleBookingClick = () => {
    console.log('Booking clicked - User:', loggedInUser, 'Is Customer:', isCustomer);

    if (!loggedInUser) {
      // Navigate to login page with redirect message
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để đặt lịch với cosplayer',
          redirectUrl: `/cosplayer/${cosplayer.id}`
        }
      });
    } else if (isCustomer) {
      // Clear any existing booking state for a fresh start
      try {
        sessionStorage.removeItem(`booking_${cosplayer.id}`);
      } catch (e) {
        console.warn('Failed to clear booking state:', e);
      }
      navigate(`/booking/${cosplayer.id}`);
    } else {
      // Show popup for cosplayers trying to book
      setPopupMessage('Chỉ khách hàng mới có thể đặt lịch với cosplayer');
      setShowPopup(true);
    }
    handleMenuClose();
  };

  const handleFollowClick = () => {
    onFollowToggle();
    handleMenuClose();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
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
                  cosplayer.isVerified && (
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
                  src={cosplayer.avatar || cosplayer.avatarUrl}
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
                  {cosplayer.firstName?.[0]}{cosplayer.lastName?.[0]}
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
                  {cosplayer.displayName}
                </Typography>

                {cosplayer.isAvailable && (
                  <Chip
                    label="Sẵn sàng"
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

                {!cosplayer.isAvailable && (
                  <Chip
                    label="Chưa sẵn sàng"
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
                {(cosplayer.membershipTier || currentProfile?.membershipTier) && (
                  <Chip
                    label={
                      (cosplayer.membershipTier || currentProfile?.membershipTier) === 'Gold' ? 'Thành viên Vàng' :
                      (cosplayer.membershipTier || currentProfile?.membershipTier) === 'Silver' ? 'Thành viên Bạc' :
                      (cosplayer.membershipTier || currentProfile?.membershipTier) === 'Platinum' ? 'Thành viên Bạch kim' :
                      'Thành viên Đồng'
                    }
                    size="small"
                    icon={<WorkspacePremium sx={{ fontSize: 16 }} />}
                    sx={{
                      bgcolor: 
                        (cosplayer.membershipTier || currentProfile?.membershipTier) === 'Gold' ? '#FFD700' :
                        (cosplayer.membershipTier || currentProfile?.membershipTier) === 'Silver' ? '#C0C0C0' :
                        (cosplayer.membershipTier || currentProfile?.membershipTier) === 'Platinum' ? '#E5E4E2' :
                        '#CD7F32', // Bronze
                      color: 'white',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: 'white' }
                    }}
                  />
                )}
              </Box>

              {/* Category and Character Specialty */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'primary.main',
                    fontWeight: 600
                  }}
                >
                  {cosplayer.category}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  • {cosplayer.characterSpecialty || 'Nhân vật đa dạng'}
                </Typography>
              </Box>

              {/* Rating Section */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={cosplayer.rating || 0}
                    readOnly
                    precision={0.1}
                    size="medium"
                    sx={{ color: '#FFB400' }}
                  />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {cosplayer.rating ? cosplayer.rating.toFixed(1) : '0.0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ({cosplayer.totalReviews} đánh giá)
                  </Typography>
                </Box>
              </Box>

              {/* Info Grid */}
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                {/* Price */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AttachMoney sx={{ fontSize: 20, color: 'primary.main' }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {formatPrice(cosplayer.pricePerHour)}
                  </Typography>
                </Box>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {cosplayer.location}
                  </Typography>
                </Box>

                {/* Response Time */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Schedule sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Phản hồi: {cosplayer.responseTime}
                  </Typography>
                </Box>
              </Box>

              {/* Tags */}
              {cosplayer.tags && cosplayer.tags.length > 0 && (
                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  {cosplayer.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
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

          {/* Specialties Section */}
          {cosplayer.specialties && cosplayer.specialties.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Kỹ năng chuyên môn
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {cosplayer.specialties.map((specialty, index) => (
                    <Chip
                      key={index}
                      label={specialty}
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        fontWeight: 500,
                        fontSize: '14px',
                        py: 2.5,
                        borderRadius: '16px'
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </>
          )}

          {/* Stats Section */}
          {cosplayer.stats && (
            <>
              <Divider sx={{ my: 3 }} />
              <Box sx={{
                display: 'flex',
                gap: 2,
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                px: 2
              }}>
                <StatItem
                  icon={<WorkspacePremium sx={{ color: 'primary.main' }} />}
                  value={cosplayer.stats.completedBookings}
                  label="Đơn hoàn thành"
                />
                <StatItem
                  icon={<Groups sx={{ fontSize: 20, color: 'primary.main' }} />}
                  value={
                    ((cosplayer.stats?.totalFollowers ?? cosplayer.followersCount) || 0).toLocaleString()
                  }
                  label="Người theo dõi"
                />
                <StatItem
                  icon={<Favorite sx={{ color: 'error.main' }} />}
                  value={(cosplayer.stats.totalLikes || 0).toLocaleString()}
                  label="Lượt thích"
                />
                <StatItem
                  icon={<PhotoLibrary sx={{ fontSize: 20, color: 'primary.main' }} />}
                  value={(cosplayer.stats.totalPosts || 0).toLocaleString()}
                  label="Bài viết"
                />
              </Box>
            </>
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
          {isOwnProfile ? (
            <MenuItem onClick={() => { handleMenuClose(); handleEditClick(); }}>
              <ListItemIcon>
                <Edit fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Chỉnh sửa hồ sơ" />
            </MenuItem>
          ) : (
            <>
              <MenuItem onClick={handleFollowClick} disabled={!loggedInUser}>
                <ListItemIcon>
                  {isFollowing ? <PersonRemove fontSize="small" /> : <PersonAdd fontSize="small" />}
                </ListItemIcon>
                <ListItemText primary={isFollowing ? 'Bỏ theo dõi' : 'Theo dõi'} />
              </MenuItem>
              
              <MenuItem onClick={handleBookingClick}>
                <ListItemIcon>
                  <Event fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Đặt lịch ngay" />
              </MenuItem>
            </>
          )}
        </Menu>

        {/* Popup Dialog */}
        <Dialog
          open={showPopup}
          onClose={handleClosePopup}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: 2,
              minWidth: '300px'
            }
          }}
        >
          <DialogContent sx={{ textAlign: 'center' }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              {popupMessage}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button
              onClick={handleClosePopup}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                color: 'white',
                px: 4,
                py: 1,
                textTransform: 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                }
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>

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

      {/* Edit Dialog */}
      <EditCosplayerDialog
        open={editDialogOpen}
        onClose={handleEditClose}
        cosplayer={cosplayer}
        onUpdateSuccess={handleEditSuccess}
      />
    </>
  );
};

// Helper component for stats
const StatItem = ({ icon, value, label }) => (
  <Box sx={{ textAlign: 'center' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
      {icon}
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
      </Typography>
    </Box>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
  </Box>
);

export default CosplayerProfileHeader;