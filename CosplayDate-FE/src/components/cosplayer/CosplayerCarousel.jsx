import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button
} from '@mui/material';
import { ArrowForward, ArrowBack } from '@mui/icons-material';
import CosplayerCard from './CosplayerCard';

const CosplayerCarousel = ({ title = "Cosplayer nổi bật", cosplayers = [], onSeeAll }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselRef = useRef(null);

  const handleNext = () => {
    const maxIndex = Math.max(0, cosplayers.length - 4); // Show 4 cards at a time
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(nextIndex);
    
    if (carouselRef.current) {
      const cardWidth = 260; // 240px card + 20px gap
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
      const cardWidth = 260; // 240px card + 20px gap
      carouselRef.current.scrollTo({
        left: prevIndex * cardWidth,
        behavior: 'smooth'
      });
    }
  };

  const handleBooking = (cosplayer) => {
    console.log('Booking cosplayer:', cosplayer);
    // Handle booking logic here
  };

  const handleMessage = (cosplayer) => {
    console.log('Message cosplayer:', cosplayer);
    // Handle message logic here
  };

  const canScrollNext = currentIndex < Math.max(0, cosplayers.length - 4);
  const canScrollPrev = currentIndex > 0;

  return (
    <Box sx={{ mb: 6 }}>
      {/* Header */}
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
            onClick={onSeeAll}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              fontWeight: 500,
              '&:hover': {
                color: 'primary.main',
              },
            }}
          >
            See all
          </Button>
          
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
                '&:disabled': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
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
                '&:disabled': {
                  backgroundColor: 'rgba(0,0,0,0.05)',
                },
              }}
            >
              <ArrowForward />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Carousel */}
      <Box
        ref={carouselRef}
        sx={{
          display: 'flex',
          gap: 2.5,
          overflowX: 'hidden',
          scrollBehavior: 'smooth',
          paddingRight: '20px', // Add padding to prevent cutoff
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
        }}
      >
        {cosplayers.map((cosplayer, index) => (
          <CosplayerCard
            key={cosplayer.id}
            cosplayer={cosplayer}
            onBooking={handleBooking}
            onMessage={handleMessage}
          />
        ))}
      </Box>
    </Box>
  );
};

export default CosplayerCarousel;