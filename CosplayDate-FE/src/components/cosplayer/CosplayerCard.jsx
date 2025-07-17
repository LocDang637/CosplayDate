import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Rating,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Message,
  LocationOn,
  PersonAdd,
  PersonRemove,
  AttachMoney
} from '@mui/icons-material';
import { userAPI } from '../../services/api';
import { reviewAPI } from '../../services/reviewAPI';

const CosplayerCard = ({
  cosplayer,
  onBooking,
  onMessage,
  onFollow,
  isFollowing = false,
  currentUser = null
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [followState, setFollowState] = useState(Boolean(isFollowing));
  const [followLoading, setFollowLoading] = useState(false);
  const [averageRating, setAverageRating] = useState(null);
  const [ratingLoading, setRatingLoading] = useState(false);

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

  const user = getCurrentUser();

  // Debug log
  // console.log('CosplayerCard - Current user:', user);

  // Check if current user is a customer (not a cosplayer)
  const isCustomer = user && user.userType === 'Customer';

  // Initialize follow state with prop value
  useEffect(() => {
    const newFollowState = Boolean(isFollowing);
    // console.log(`CosplayerCard ${cosplayer.id} - isFollowing prop changed:`, isFollowing, '-> state:', newFollowState);
    setFollowState(newFollowState);
  }, [isFollowing, cosplayer.id]);

  // Fetch average rating on component mount
  useEffect(() => {
    const fetchAverageRating = async () => {
      if (cosplayer.id) {
        setRatingLoading(true);
        try {
          const result = await reviewAPI.getCosplayerAverageRating(cosplayer.id);
          if (result.success && result.data && result.data.isSuccess && result.data.data !== null) {
            setAverageRating(Number(result.data.data));
          }
        } catch (error) {
          console.error('Error fetching average rating:', error);
        } finally {
          setRatingLoading(false);
        }
      }
    };

    fetchAverageRating();
  }, [cosplayer.id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const handleViewProfile = () => {
    // Use userId instead of cosplayer.id to ensure correct user profile lookup
    const targetUserId = cosplayer.userId || cosplayer.id;
    console.log('🔍 CosplayerCard - Navigating to profile with userId:', targetUserId, 'from cosplayer:', {
      cosplayerId: cosplayer.id,
      userId: cosplayer.userId,
      displayName: cosplayer.displayName
    });
    navigate(`/profile/${targetUserId}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation();

    // console.log('Booking clicked - User:', user, 'Is Customer:', isCustomer);

    if (!user) {
      // Navigate to login page with redirect message
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để đặt lịch với cosplayer',
          redirectUrl: `/profile/${cosplayer.id}`
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
  };

  const handleFollowClick = async (e) => {
    e.stopPropagation();

    if (!user) {
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để theo dõi cosplayer',
          redirectUrl: `/profile/${cosplayer.id}`
        }
      });
      return;
    }

    if (!isCustomer) {
      setPopupMessage('Chỉ khách hàng mới có thể theo dõi cosplayer');
      setShowPopup(true);
      return;
    }

    setFollowLoading(true);

    try {
      let result;
      if (followState) {
        // Unfollow
        result = await userAPI.unfollowUser(cosplayer.userId);
        if (result.success) {
          setFollowState(false);
          // Call parent callback if provided
          if (onFollow) {
            onFollow(cosplayer.id, false);
          }
        } else {
          setPopupMessage(result.message || 'Không thể bỏ theo dõi cosplayer');
          setShowPopup(true);
        }
      } else {
        // Follow
        result = await userAPI.followUser(cosplayer.userId);
        if (result.success) {
          setFollowState(true);
          // Call parent callback if provided
          if (onFollow) {
            onFollow(cosplayer.id, true);
          }
        } else {
          setPopupMessage(result.message || 'Không thể theo dõi cosplayer');
          setShowPopup(true);
        }
      }
    } catch (error) {
      console.error('Follow/unfollow error:', error);
      setPopupMessage('Có lỗi xảy ra. Vui lòng thử lại sau.');
      setShowPopup(true);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      <Card
        onClick={handleViewProfile}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
          },
          width: 280,
          maxWidth: '100%',
          height: 'fit-content',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Image Section */}
        <Box sx={{ position: 'relative', height: 240 }}>
          {cosplayer.featuredPhotoUrl || cosplayer.avatarUrl ? (
            <CardMedia
              component="img"
              height="240"
              image={cosplayer.featuredPhotoUrl || cosplayer.avatarUrl}
              alt={cosplayer.displayName}
              sx={{
                objectFit: 'cover',
              }}
            />
          ) : (
            <Box
              sx={{
                height: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  backgroundColor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {cosplayer.displayName?.[0] || '?'}
              </Avatar>
            </Box>
          )}

          {/* Follow Button */}
          <IconButton
            onClick={handleFollowClick}
            disabled={followLoading}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: followState ? '#E91E63' : 'text.secondary',
              width: 36,
              height: 36,
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255,255,255,0.7)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            {followState ? <PersonRemove /> : <PersonAdd />}
          </IconButton>
        </Box>

        {/* Content Section */}
        <CardContent sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Name and Category */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 0.5,
              fontSize: '18px',
              textAlign: 'center',
              lineHeight: 1.3,
              color: 'text.primary'
            }}
          >
            {cosplayer.displayName}
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: 'primary.main',
              textAlign: 'center',
              mb: 1.5,
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            {cosplayer.category}
          </Typography>

          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Rating
              value={averageRating !== null && typeof averageRating === 'number' ? averageRating : (cosplayer.rating || 0)}
              size="small"
              readOnly
              precision={0.1}
              sx={{ mr: 0.5 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
              {ratingLoading ? 'Đang tải...' : `${averageRating !== null && typeof averageRating === 'number' ? averageRating.toFixed(1) : (cosplayer.rating || 0).toFixed(1)} (${cosplayer.totalReviews || 0} đánh giá)`}
            </Typography>
          </Box>

          {/* Price */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
            <AttachMoney sx={{ fontSize: 18, color: 'primary.main', mr: 0.5 }} />
            <Typography
              variant="body1"
              sx={{
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '16px',
              }}
            >
              {formatPrice(cosplayer.pricePerHour)}
            </Typography>
          </Box>

          {/* Tags */}
          {cosplayer.tags && cosplayer.tags.length > 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 1.5,
              flexWrap: 'wrap',
              gap: 0.5,
              minHeight: 24
            }}>
              {cosplayer.tags.slice(0, 3).map((tag, index) => (
                <Chip
                  key={index}
                  label={tag}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(156, 39, 176, 0.1)',
                    color: 'secondary.main',
                    fontSize: '11px',
                    height: '22px',
                    fontWeight: 500
                  }}
                />
              ))}
            </Box>
          )}

          {/* Specialties */}
          {cosplayer.specialties && cosplayer.specialties.length > 0 && (
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 0.5
            }}>
              {cosplayer.specialties.slice(0, 2).map((specialty, index) => (
                <Chip
                  key={index}
                  label={specialty}
                  size="small"
                  sx={{
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    color: 'primary.main',
                    fontSize: '11px',
                    height: '22px',
                  }}
                />
              ))}
              {cosplayer.specialties.length > 2 && (
                <Typography variant="caption" sx={{ color: 'text.secondary', alignSelf: 'center' }}>
                  +{cosplayer.specialties.length - 2}
                </Typography>
              )}
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Tooltip
              title={
                !user
                  ? "Vui lòng đăng nhập để đặt lịch"
                  : !isCustomer
                    ? "Chỉ khách hàng mới có thể đặt lịch"
                    : ""
              }
              disableHoverListener={isCustomer && user !== null}
            >
              <span style={{ flex: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleBookingClick}
                  disabled={!isCustomer}
                  sx={{
                    width: '100%',
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    color: 'white',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '8px',
                    fontSize: '13px',
                    py: 0.75,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                    },
                    '&.Mui-disabled': {
                      background: 'rgba(0, 0, 0, 0.12)',
                      color: 'rgba(0, 0, 0, 0.26)'
                    }
                  }}
                >
                  Đặt lịch
                </Button>
              </span>
            </Tooltip>
          </Box>
        </CardContent>
      </Card>

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
    </>
  );
};

export default CosplayerCard;
