import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip
} from '@mui/material';
import { Message } from '@mui/icons-material';

const CosplayerCard = ({ cosplayer, onBooking, onMessage }) => {
  const navigate = useNavigate();

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const handleViewProfile = () => {
    navigate(`/cosplayer/${cosplayer.id}`);
  };

  const handleBookingClick = (e) => {
    e.stopPropagation(); // Prevent card click when booking button is clicked
    onBooking?.(cosplayer);
  };

  const handleMessageClick = (e) => {
    e.stopPropagation(); // Prevent card click when message button is clicked
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
      {/* Image */}
      <CardMedia
        component="img"
        height="200"
        image={cosplayer.image}
        alt={cosplayer.name}
        sx={{
          marginTop: '10px',
          objectFit: 'cover',
          width: '200px',
          height: '200px',
          mx: 'auto',
          display: 'block',
        }}
      />
      
      <CardContent sx={{ p: 2 }}>
        {/* Name */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 1,
            fontSize: '16px',
            textAlign: 'center',
          }}
        >
          {cosplayer.name}
        </Typography>

        {/* Price */}
        <Typography
          variant="body1"
          sx={{
            color: 'text.primary',
            fontWeight: 600,
            textAlign: 'center',
            mb: 2,
            fontSize: '14px',
          }}
        >
          {formatPrice(cosplayer.price)}
        </Typography>

        {/* Category Chip */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Chip
            label={cosplayer.category}
            sx={{
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              color: 'primary.main',
              fontWeight: 500,
              fontSize: '12px',
              height: 24,
            }}
          />
        </Box>

        {/* Message Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Message />}
            onClick={handleMessageClick}
            sx={{
              borderColor: 'text.secondary',
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '12px',
              borderRadius: '8px',
              px: 2,
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          >
            Xinh đẹp
          </Button>
        </Box>

        {/* Booking Button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleBookingClick}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: '12px',
            fontSize: '14px',
            py: 1,
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
            },
          }}
        >
          Đặt lịch
        </Button>
      </CardContent>
    </Card>
  );
};

export default CosplayerCard;