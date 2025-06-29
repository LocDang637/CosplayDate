// src/components/cosplayer/CosplayerCarousel.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Skeleton
} from '@mui/material';
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import CosplayerCard from './CosplayerCard';

const CosplayerCarousel = ({ title = "Cosplayer nổi bật", cosplayers = [], onSeeAll, loading = false }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleNext = () => {
    const maxIndex = Math.max(0, cosplayers.length - 4);
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(nextIndex);
    
    if (carouselRef.current) {
      const cardWidth = 260;
      carouselRef.current.scrollTo({
        left: nextIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handlePrev = () => {
    const prevIndex = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prevIndex);
    
    if (carouselRef.current) {
      const cardWidth = 260;
      carouselRef.current.scrollTo({
        left: prevIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleBooking = (cosplayer) => {
    navigate(`/booking/${cosplayer.id}`);
  };

  const handleMessage = (cosplayer) => {
    navigate(`/messages/${cosplayer.id}`);
  };

  const handleSeeAllClick = () => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      navigate('/cosplayers');
    }
  };

  const canScrollNext = currentIndex < Math.max(0, cosplayers.length - 4);
  const canScrollPrev = currentIndex > 0;

  const CosplayerSkeleton = () => (
    <Box sx={{ width: 240, flexShrink: 0 }}>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: '16px' }} />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: '16px' }} />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ mb: 6 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '24px', md: '28px' },
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            onClick={handleSeeAllClick}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            Xem tất cả
          </Button>
          
          {!loading && cosplayers.length > 4 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handlePrev}
                disabled={!canScrollPrev}
                sx={{
                  backgroundColor: canScrollPrev ? 'white' : 'rgba(0,0,0,0.05)',
                  color: canScrollPrev ? 'primary.main' : 'text.disabled',
                  width: 40,
                  height: 40,
                  boxShadow: canScrollPrev ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    backgroundColor: canScrollPrev ? 'rgba(233, 30, 99, 0.05)' : 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                <ArrowBack />
              </IconButton>
              
              <IconButton
                onClick={handleNext}
                disabled={!canScrollNext}
                sx={{
                  backgroundColor: canScrollNext ? 'white' : 'rgba(0,0,0,0.05)',
                  color: canScrollNext ? 'primary.main' : 'text.disabled',
                  width: 40,
                  height: 40,
                  boxShadow: canScrollNext ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
                  '&:hover': {
                    backgroundColor: canScrollNext ? 'rgba(233, 30, 99, 0.05)' : 'rgba(0,0,0,0.05)',
                  },
                }}
              >
                <ArrowForward />
              </IconButton>
            </Box>
          )}
        </Box>
      </Box>

      <Box
        ref={carouselRef}
        sx={{
          display: 'flex',
          gap: 2.5,
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          paddingRight: '20px',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CosplayerSkeleton key={index} />
          ))
        ) : cosplayers.length > 0 ? (
          cosplayers.map((cosplayer) => (
            <CosplayerCard
              key={cosplayer.id}
              cosplayer={cosplayer}
              onBooking={handleBooking}
              onMessage={handleMessage}
            />
          ))
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            py: 4, 
            width: '100%',
            color: 'text.secondary' 
          }}>
            <Typography variant="h6">
              Chưa có cosplayer nào
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default CosplayerCarousel;