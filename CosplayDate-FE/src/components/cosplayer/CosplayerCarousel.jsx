// src/components/cosplayer/CosplayerCarousel.jsx
import React, { useState, useRef, useEffect } from 'react';
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

const CosplayerCarousel = ({ 
  title = "Cosplayer nổi bật", 
  cosplayers = [], 
  onSeeAll, 
  loading = false,
  currentUser = null,  // Add currentUser prop
  onCosplayersUpdate = null  // Add callback for updating cosplayers
}) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [localCosplayers, setLocalCosplayers] = useState(cosplayers);
  const carouselRef = useRef(null);

  // Update local cosplayers when prop changes
  useEffect(() => {
    setLocalCosplayers(cosplayers);
  }, [cosplayers]);

  // Get current user from props or localStorage
  const user = currentUser || (() => {
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
  })();

  useEffect(() => {
    // console.log('CosplayerCarousel - Current user:', user);
  }, [user]);

  const handleNext = () => {
    const maxIndex = Math.max(0, localCosplayers.length - 4);
    const nextIndex = Math.min(currentIndex + 1, maxIndex);
    setCurrentIndex(nextIndex);
    
    if (carouselRef.current) {
      const cardWidth = 300; // Adjusted for card width + gap
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
      const cardWidth = 300; // Adjusted for card width + gap
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

  const handleFavorite = (cosplayerId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(cosplayerId)) {
      newFavorites.delete(cosplayerId);
    } else {
      newFavorites.add(cosplayerId);
    }
    setFavorites(newFavorites);
  };

  const handleFollow = (cosplayerId, isFollowing) => {
    // Update local cosplayers state
    setLocalCosplayers(prevCosplayers => 
      prevCosplayers.map(cosplayer => 
        cosplayer.id === cosplayerId 
          ? { ...cosplayer, isFollowing }
          : cosplayer
      )
    );

    // Call parent callback if provided
    if (onCosplayersUpdate) {
      onCosplayersUpdate(cosplayerId, isFollowing);
    }
  };

  const handleSeeAllClick = () => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      navigate('/cosplayers');
    }
  };

  const canScrollNext = currentIndex < Math.max(0, localCosplayers.length - 4);
  const canScrollPrev = currentIndex > 0;

  const CosplayerSkeleton = () => (
    <Box sx={{ width: 280, flexShrink: 0 }}>
      <Skeleton variant="rectangular" height={240} sx={{ borderRadius: '16px' }} />
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
          
          {!loading && localCosplayers.length > 4 && (
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
        ) : localCosplayers.length > 0 ? (
          localCosplayers.map((cosplayer) => (
            <CosplayerCard
              key={cosplayer.id}
              cosplayer={cosplayer}
              currentUser={user}  // Pass the current user properly
              isFollowing={cosplayer.isFollowing || false}  // Use isFollowing from cosplayer data
              isFavorite={favorites.has(cosplayer.id)}
              onBooking={handleBooking}
              onMessage={handleMessage}
              onFavorite={handleFavorite}
              onFollow={handleFollow}  // Add follow handler
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