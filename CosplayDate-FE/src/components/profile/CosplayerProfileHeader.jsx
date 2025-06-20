// src/components/profile/CosplayerProfileHeader.jsx - FIXED VERSION
import React, { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Button,
  Chip,
  Rating,
  IconButton,
  Grid,
  Divider
} from '@mui/material';
import {
  Edit,
  CameraAlt,
  Message,
  Favorite,
  FavoriteBorder,
  Share,
  AttachMoney,
  LocationOn,
  Star,
  People,
  Event,
  Verified
} from '@mui/icons-material';

const CosplayerProfileHeader = ({ user, isOwnProfile, onFollowToggle, isFollowing = false }) => {
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const handleEditAvatar = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file) {
        console.log('Avatar upload:', file);
      }
    };
    input.click();
  };

  const handleMessage = () => {
    console.log('Send message to cosplayer');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user?.displayName} - CosplayDate`,
        url: window.location.href
      });
    }
  };

  const handleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  // ✅ FIXED: Safe tags processing function
  const getTags = () => {
    if (!user?.tags) return [];
    
    // If tags is already an array, return it
    if (Array.isArray(user.tags)) {
      return user.tags.filter(tag => tag && typeof tag === 'string' && tag.trim());
    }
    
    // If tags is a string, split it
    if (typeof user.tags === 'string') {
      return user.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }
    
    // For any other data type, return empty array
    console.warn('⚠️ Invalid tags format:', typeof user.tags, user.tags);
    return [];
  };

  // ✅ FIXED: Safe specialties processing function
  const getSpecialties = () => {
    if (!user?.specialties) return [];
    
    // If specialties is already an array, return it
    if (Array.isArray(user.specialties)) {
      return user.specialties.filter(specialty => specialty && typeof specialty === 'string' && specialty.trim());
    }
    
    // If specialties is a string, split it
    if (typeof user.specialties === 'string') {
      return user.specialties.split(',')
        .map(specialty => specialty.trim())
        .filter(specialty => specialty.length > 0);
    }
    
    // For any other data type, return empty array
    console.warn('⚠️ Invalid specialties format:', typeof user.specialties, user.specialties);
    return [];
  };

  // ✅ FIXED: Safe name display function
  const getDisplayName = () => {
    return user?.displayName || user?.stageName || user?.firstName || 'Cosplayer';
  };

  // ✅ FIXED: Safe category display function
  const getCategoryText = () => {
    const category = user?.category || '';
    const specialty = user?.characterSpecialty || '';
    
    if (category && specialty) {
      return `${category} • ${specialty}`;
    } else if (category) {
      return category;
    } else if (specialty) {
      return specialty;
    }
    return 'Cosplayer';
  };

  const tags = getTags();
  const specialties = getSpecialties();

  return (
    <>
      <Paper
        sx={{
          borderRadius: '24px',
          overflow: 'hidden',
          mb: 3,
          background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
        }}
      >
        <Box sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid>
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user?.avatarUrl || user?.profilePicture}
                  sx={{
                    width: 120,
                    height: 120,
                    border: '4px solid white',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  }}
                >
                  {getDisplayName()[0]?.toUpperCase()}
                </Avatar>
                {isOwnProfile && (
                  <IconButton
                    onClick={handleEditAvatar}
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: 'white',
                      width: 32,
                      height: 32,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  >
                    <CameraAlt sx={{ fontSize: 16 }} />
                  </IconButton>
                )}
              </Box>
            </Grid>

            <Grid>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                        fontSize: { xs: '1.5rem', md: '2rem' },
                      }}
                    >
                      {getDisplayName()}
                    </Typography>
                    {user?.isVerified && (
                      <Verified sx={{ color: 'primary.main', fontSize: 24 }} />
                    )}
                    <Chip
                      label={user?.isAvailable ? 'Sẵn sàng' : 'Bận'}
                      size="small"
                      sx={{
                        backgroundColor: user?.isAvailable ? '#4CAF50' : '#FF9800',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>

                  <Typography
                    variant="body1"
                    sx={{
                      color: 'text.secondary',
                      mb: 2,
                      fontSize: '16px',
                    }}
                  >
                    {getCategoryText()}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2, flexWrap: 'wrap' }}>
                    {user?.rating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={user.rating} size="small" readOnly precision={0.1} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.rating}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          ({user.totalReviews || 0} đánh giá)
                        </Typography>
                      </Box>
                    )}

                    {user?.followersCount !== undefined && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <People sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {user.followersCount} người theo dõi
                        </Typography>
                      </Box>
                    )}

                    {user?.responseTime && (
                      <Chip
                        label={`Phản hồi: ${user.responseTime}`}
                        size="small"
                        variant="outlined"
                        sx={{ borderColor: 'primary.main', color: 'primary.main' }}
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    {user?.pricePerHour && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <AttachMoney sx={{ color: 'success.main', fontSize: 20 }} />
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 700,
                            color: 'success.main',
                            fontSize: '18px',
                          }}
                        >
                          {formatPrice(user.pricePerHour)}
                        </Typography>
                      </Box>
                    )}

                    {user?.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {user.location}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* ✅ FIXED: Safe tags rendering */}
                  {tags.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {tags.slice(0, 4).map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          sx={{
                            backgroundColor: 'rgba(233, 30, 99, 0.1)',
                            color: 'primary.main',
                            fontSize: '12px',
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, alignItems: 'flex-end' }}>
                  {isOwnProfile ? (
                    <Button
                      variant="contained"
                      startIcon={<Edit />}
                      onClick={() => setEditModalOpen(true)}
                      sx={{
                        background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                        borderRadius: '12px',
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                      }}
                    >
                      Chỉnh sửa hồ sơ
                    </Button>
                  ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        onClick={handleFavorite}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: isFavorite ? '#E91E63' : 'text.secondary',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                        }}
                      >
                        {isFavorite ? <Favorite /> : <FavoriteBorder />}
                      </IconButton>

                      <IconButton
                        onClick={handleShare}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          color: 'text.secondary',
                          '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                        }}
                      >
                        <Share />
                      </IconButton>

                      <Button
                        variant="outlined"
                        startIcon={<Message />}
                        onClick={handleMessage}
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.9)',
                          borderColor: 'primary.main',
                          color: 'primary.main',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          '&:hover': {
                            backgroundColor: 'rgba(233, 30, 99, 0.05)',
                          },
                        }}
                      >
                        Nhắn tin
                      </Button>

                      <Button
                        variant="contained"
                        onClick={onFollowToggle}
                        sx={{
                          background: isFollowing 
                            ? 'linear-gradient(45deg, #757575, #424242)'
                            : 'linear-gradient(45deg, #E91E63, #9C27B0)',
                          borderRadius: '12px',
                          textTransform: 'none',
                          fontWeight: 600,
                          minWidth: '120px',
                        }}
                      >
                        {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* ✅ FIXED: Safe specialties rendering */}
        {specialties.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: 'text.primary' }}>
                Kỹ năng chuyên môn
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {specialties.map((specialty, index) => (
                  <Chip
                    key={index}
                    label={specialty}
                    sx={{
                      backgroundColor: 'primary.main',
                      color: 'white',
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        {user?.stats && (
          <>
            <Divider />
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {user.stats.completedBookings || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Đơn hoàn thành
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {user.stats.totalPhotos || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Ảnh
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {user.stats.totalLikes || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Lượt thích
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, sm: 3 }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {Math.round(user.stats.successRate || 0)}%
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Tỉ lệ thành công
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </>
        )}
      </Paper>

      {/* Edit Modal will be handled by parent component */}
    </>
  );
};

export default CosplayerProfileHeader;