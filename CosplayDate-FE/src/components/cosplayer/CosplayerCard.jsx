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
  Avatar,
  IconButton
} from '@mui/material';
import { Message, LocationOn, Favorite, FavoriteBorder } from '@mui/icons-material';

const CosplayerCard = ({ cosplayer, onBooking, onMessage, onFavorite, isFavorite = false }) => {
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

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onFavorite?.(cosplayer.id);
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
      <Box sx={{ position: 'relative' }}>
        {cosplayer.featuredPhotoUrl || cosplayer.avatarUrl ? (
          <CardMedia
            component="img"
            height="200"
            image={cosplayer.featuredPhotoUrl || cosplayer.avatarUrl}
            alt={cosplayer.displayName}
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
              {cosplayer.displayName?.[0] || '?'}
            </Avatar>
          </Box>
        )}

        <IconButton
          onClick={handleFavoriteClick}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255,255,255,0.9)',
            color: isFavorite ? '#E91E63' : 'text.secondary',
            width: 32,
            height: 32,
            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
          }}
        >
          {isFavorite ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
        </IconButton>

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
              fontSize: '10px',
              height: '20px',
            }}
          />
        )}
      </Box>
      
      <CardContent sx={{ p: 2 }}>
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
          {cosplayer.displayName}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            textAlign: 'center',
            mb: 1,
            fontSize: '12px',
          }}
        >
          {cosplayer.category}
        </Typography>

        {cosplayer.rating && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
            <Rating value={cosplayer.rating} size="small" readOnly precision={0.1} />
            <Typography variant="body2" sx={{ ml: 0.5, fontSize: '12px', color: 'text.secondary' }}>
              ({cosplayer.totalReviews || 0})
            </Typography>
          </Box>
        )}

        {cosplayer.pricePerHour && (
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
            {formatPrice(cosplayer.pricePerHour)}
          </Typography>
        )}

        {cosplayer.location && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <LocationOn sx={{ fontSize: 14, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
              {cosplayer.location}
            </Typography>
          </Box>
        )}

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

        <Box sx={{ display: 'flex', gap: 1 }}>
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