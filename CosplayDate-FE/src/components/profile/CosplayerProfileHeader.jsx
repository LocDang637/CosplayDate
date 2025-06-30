// src/components/profile/CosplayerProfileHeader.jsx - Improved Version with Avatar Upload
import React, { useState } from 'react';
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
  Fade
} from '@mui/material';
import {
  Edit,
  Share,
  LocationOn,
  AttachMoney,
  Schedule,
  Star,
  Check,
  WorkspacePremium,
  Groups,
  PhotoLibrary,
  VideoLibrary,
  Favorite,
  CameraAlt,
  Verified,
  Event
} from '@mui/icons-material';
import EditCosplayerDialog from './EditCosplayerDialog';

const CosplayerProfileHeader = ({
  user,
  onEditAvatar,
  onProfileUpdate,
  isOwnProfile
}) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);

  if (!user) return null;

  // Create cosplayer alias for easier refactoring
  const cosplayer = user;

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
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
                  user.isAvailable && (
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
                  src={cosplayer.avatarUrl || cosplayer.avatar || cosplayer.featuredPhotoUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid white',
                    boxShadow: '0 8px 24px rgba(233, 30, 99, 0.2)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.05)',
                    },
                  }}
                  onClick={onEditAvatar}
                >
                  {cosplayer.displayName?.[0] || 'C'}
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
                    }}
                    onClick={onEditAvatar}
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

                {/* Followers */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Groups sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {cosplayer.followersCount} người theo dõi
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
              {isOwnProfile ? (
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={handleEditClick}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(233, 30, 99, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <Button
                  variant="contained"
                  startIcon={<Event />}
                  onClick={() => onBooking(user)}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    px: 3,
                    py: 1.5,
                    boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 20px rgba(233, 30, 99, 0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Đặt lịch ngay
                </Button>
              )}
              <Button
                variant="outlined"
                startIcon={<Share />}
                onClick={handleShare}
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'primary.main',
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                  },
                }}
              >
                Chia sẻ
              </Button>
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
                  icon={<PhotoLibrary sx={{ color: 'info.main' }} />}
                  value={cosplayer.stats.totalPhotos}
                  label="Ảnh"
                />
                <StatItem
                  icon={<VideoLibrary sx={{ color: 'success.main' }} />}
                  value={cosplayer.stats.totalVideos}
                  label="Video"
                />
                <StatItem
                  icon={<Favorite sx={{ color: 'error.main' }} />}
                  value={cosplayer.stats.totalLikes}
                  label="Lượt thích"
                />
                <StatItem
                  icon={<Star sx={{ color: 'warning.main' }} />}
                  value={`${cosplayer.stats.successRate || 0}%`}
                  label="Tỉ lệ thành công"
                />
              </Box>
            </>
          )}
        </Box>
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