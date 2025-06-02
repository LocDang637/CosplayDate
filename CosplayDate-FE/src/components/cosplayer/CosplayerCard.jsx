// src/components/cosplayer/CosplayerCard.jsx - Updated with API integration
import React from 'react';
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
  Avatar
} from '@mui/material';
import { Message, LocationOn } from '@mui/icons-material';

const CosplayerCard = ({ cosplayer, onBooking, onMessage }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const handleViewProfile = () => {
    navigate(`/cosplayer/${cosplayer.id}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation();
    onBooking?.(cosplayer);
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    onMessage?.(cosplayer);
  };

  return (
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
        width: 240,
        flexShrink: 0,
        mx: 'auto',
      }}
    >
      {/* Profile Image */}
      <Box sx={{ position: 'relative' }}>
        {cosplayer.profilePicture ? (
          <CardMedia
            component="img"
            height="200"
            image={cosplayer.profilePicture}
            alt={cosplayer.stageName}
            sx={{
              objectFit: 'cover',
            }}
          />
        ) : (
          <Box
            sx={{
              height: 200,
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
              {cosplayer.stageName?.[0] || cosplayer.firstName?.[0] || '?'}
            </Avatar>
          </Box>
        )}

        {/* Online Status */}
        {cosplayer.isOnline && (
          <Chip
            label="Online"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: '#4CAF50',
              color: 'white',
              fontSize: '10px',
              height: '20px',
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ p: 2 }}>
        {/* Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: '16px',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          {cosplayer.stageName || `${cosplayer.firstName} ${cosplayer.lastName}`}
        </Typography>

        {/* Rating */}
        {cosplayer.averageRating && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Rating 
              value={cosplayer.averageRating} 
              size="small" 
              readOnly 
              precision={0.1}
            />
            <Typography variant="body2" sx={{ ml: 0.5, fontSize: '12px', color: 'text.secondary' }}>
              ({cosplayer.totalReviews || 0})
            </Typography>
          </Box>
        )}

        {/* Price */}
        {cosplayer.hourlyRate && (
          <Typography
            variant="body1"
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              textAlign: 'center',
              mb: 1,
              fontSize: '14px',
            }}
          >
            {formatPrice(cosplayer.hourlyRate)}
          </Typography>
        )}

        {/* Location */}
        {cosplayer.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LocationOn sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
              {cosplayer.location}
            </Typography>
          </Box>
        )}

        {/* Specialties */}
        {cosplayer.specialties && cosplayer.specialties.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
            {cosplayer.specialties.slice(0, 2).map((specialty, index) => (
              <Chip
                key={index}
                label={specialty}
                size="small"
                sx={{
                  backgroundColor: 'rgba(233, 30, 99, 0.1)',
                  color: 'primary.main',
                  fontSize: '10px',
                  height: '20px',
                }}
              />
            ))}
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* Message Button */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<Message />}
            onClick={handleMessageClick}
            sx={{
              flex: 1,
              borderColor: 'text.secondary',
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '12px',
              borderRadius: '8px',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          >
            Nhắn tin
          </Button>

          {/* Booking Button */}
          <Button
            variant="contained"
            size="small"
            onClick={handleBookingClick}
            sx={{
              flex: 1,
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              borderRadius: '8px',
              fontSize: '12px',
              '&:hover': {
                background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              },
            }}
          >
            Đặt lịch
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CosplayerCard;