import React, { useState } from 'react';
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
  Favorite,
  FavoriteBorder,
  Schedule,
  AttachMoney
} from '@mui/icons-material';

const CosplayerCard = ({
  cosplayer,
  onBooking,
  onMessage,
  onFavorite,
  isFavorite = false,
  currentUser = null
}) => {
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');

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
  console.log('CosplayerCard - Current user:', user);

  // Check if current user is a customer (not a cosplayer)
  const isCustomer = user && user.userType === 'Customer';

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const handleViewProfile = () => {
    navigate(`/cosplayer/${cosplayer.id}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation();

    console.log('Booking clicked - User:', user, 'Is Customer:', isCustomer);

    if (!user) {
      // Navigate to login page with redirect message
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để đặt lịch với cosplayer',
          redirectUrl: `/cosplayer/${cosplayer.id}`
        }
      });
    } else if (isCustomer) {
      navigate(`/booking/${cosplayer.id}`);
    } else {
      // Show popup for cosplayers trying to book
      setPopupMessage('Chỉ khách hàng mới có thể đặt lịch với cosplayer');
      setShowPopup(true);
    }
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để nhắn tin với cosplayer',
          redirectUrl: `/cosplayer/${cosplayer.id}`
        }
      });
    }
    // No reaction if user is logged in as per requirement
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để lưu cosplayer yêu thích',
          redirectUrl: `/cosplayer/${cosplayer.id}`
        }
      });
    }
    // No reaction if user is logged in as per requirement
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

          {/* Favorite Button */}
          <IconButton
            onClick={handleFavoriteClick}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: isFavorite ? '#E91E63' : 'text.secondary',
              width: 36,
              height: 36,
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
            }}
          >
            {isFavorite ? <Favorite /> : <FavoriteBorder />}
          </IconButton>

          {/* Availability Badge */}
          {cosplayer.isAvailable && (
            <Chip
              label="Sẵn sàng"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                left: 8,
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '12px',
                height: '24px',
                fontWeight: 600
              }}
            />
          )}
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
              value={cosplayer.rating || 0}
              size="small"
              readOnly
              precision={0.1}
              sx={{ mr: 0.5 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
              {cosplayer.rating ? cosplayer.rating.toFixed(1) : '0.0'} ({cosplayer.totalReviews || 0} đánh giá)
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

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.secondary' }}>
              {cosplayer.location}
            </Typography>
          </Box>

          {/* Response Time */}
          {cosplayer.responseTime && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1.5 }}>
              <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
              <Typography variant="body2" sx={{ fontSize: '13px', color: 'text.secondary' }}>
                Phản hồi: {cosplayer.responseTime}
              </Typography>
            </Box>
          )}

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
            <Button
              variant="outlined"
              size="small"
              startIcon={<Message sx={{ fontSize: 16 }} />}
              onClick={handleMessageClick}
              disabled
              sx={{
                flex: 1,
                borderColor: 'rgba(0, 0, 0, 0.23)',
                color: 'text.secondary',
                textTransform: 'none',
                fontSize: '13px',
                borderRadius: '8px',
                py: 0.75,
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
                '&.Mui-disabled': {
                  borderColor: 'rgba(0, 0, 0, 0.12)',
                  color: 'rgba(0, 0, 0, 0.26)'
                }
              }}
            >
              Nhắn tin
            </Button>

            <Tooltip
              title={!user ? "Vui lòng đăng nhập để đặt lịch" : !isCustomer ? "Chỉ khách hàng mới có thể đặt lịch" : ""}
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