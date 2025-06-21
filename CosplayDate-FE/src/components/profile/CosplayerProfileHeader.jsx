// src/components/profile/CosplayerProfileHeader.jsx - Improved Version
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Stack,
  Paper,
  Divider,
  Badge,
  Rating
} from '@mui/material';
import {
  Edit,
  Share,
  Favorite,
  FavoriteBorder,
  LocationOn,
  AttachMoney,
  Schedule,
  Star,
  StarBorder,
  Check,
  PersonAdd,
  PersonRemove,
  Message,
  CalendarMonth,
  WorkspacePremium,
  Visibility,
  Groups,
  PhotoLibrary,
  VideoLibrary
} from '@mui/icons-material';
import EditCosplayerDialog from './EditCosplayerDialog';

const CosplayerProfileHeader = ({
  user,  // Changed from cosplayer to user to match the parent component
  isOwnProfile = false,
  onEditProfile,
  onFollow,
  onUnfollow,
  onFavorite,
  onMessage,
  onBooking,
  currentUser,
  onProfileUpdate
}) => {
  const [isFollowing, setIsFollowing] = useState(user?.isFollowing || false);
  const [isFavorite, setIsFavorite] = useState(user?.isFavorite || false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

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

  const handleFollowToggle = async () => {
    if (isFollowing) {
      await onUnfollow?.(cosplayer.userId);
      setIsFollowing(false);
    } else {
      await onFollow?.(cosplayer.userId);
      setIsFollowing(true);
    }
  };

  const handleFavoriteToggle = async () => {
    await onFavorite?.(cosplayer.id);
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const isCustomer = currentUser && currentUser.userRole === 'Customer';

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
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            {/* Avatar Section */}
            <Box sx={{ position: 'relative' }}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                badgeContent={
                  cosplayer.isAvailable && (
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        bgcolor: '#4CAF50',
                        border: '3px solid white',
                      }}
                    />
                  )
                }
              >
                <Avatar
                  src={cosplayer.avatarUrl || cosplayer.featuredPhotoUrl}
                  sx={{
                    width: 120,
                    height: 120,
                    fontSize: '3rem',
                    bgcolor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '4px solid white',
                  }}
                >
                  {cosplayer.displayName?.[0] || 'C'}
                </Avatar>
              </Badge>

              {/* Photo Icon */}
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'white',
                  boxShadow: 2,
                  '&:hover': { bgcolor: 'grey.100' }
                }}
              >
                <PhotoLibrary sx={{ fontSize: 20 }} />
              </IconButton>
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
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '12px',
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                    }
                  }}
                >
                  Chỉnh sửa hồ sơ
                </Button>
              ) : (
                <>
                  {isCustomer && (
                    <Button
                      variant="contained"
                      startIcon={<CalendarMonth />}
                      onClick={() => onBooking?.(cosplayer)}
                      sx={{
                        background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '12px',
                        py: 1.5,
                        '&:hover': {
                          background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                        }
                      }}
                    >
                      Đặt lịch ngay
                    </Button>
                  )}

                  <Stack direction="row" spacing={1}>
                    <Button
                      variant={isFollowing ? "outlined" : "contained"}
                      startIcon={isFollowing ? <PersonRemove /> : <PersonAdd />}
                      onClick={handleFollowToggle}
                      sx={{
                        flex: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        borderRadius: '12px',
                        py: 1,
                        ...(isFollowing ? {
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          '&:hover': {
                            borderColor: 'primary.dark',
                            bgcolor: 'rgba(233, 30, 99, 0.05)'
                          }
                        } : {
                          bgcolor: 'primary.main',
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        })
                      }}
                    >
                      {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                    </Button>

                    <IconButton
                      onClick={handleFavoriteToggle}
                      sx={{
                        border: '1px solid',
                        borderColor: isFavorite ? 'primary.main' : 'divider',
                        color: isFavorite ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          bgcolor: 'rgba(233, 30, 99, 0.05)',
                          borderColor: 'primary.main'
                        }
                      }}
                    >
                      {isFavorite ? <Favorite /> : <FavoriteBorder />}
                    </IconButton>

                    <IconButton
                      onClick={() => onMessage?.(cosplayer)}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.05)',
                          borderColor: 'text.secondary'
                        }
                      }}
                    >
                      <Message />
                    </IconButton>
                  </Stack>
                </>
              )}

              <Button
                variant="text"
                startIcon={<Share />}
                sx={{
                  textTransform: 'none',
                  color: 'text.secondary',
                  '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.05)' }
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