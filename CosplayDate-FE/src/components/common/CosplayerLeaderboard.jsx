import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Paper,
  CircularProgress,
  Alert
} from '@mui/material';
import { cosplayerAPI } from '../../services/cosplayerAPI';

const CosplayerLeaderboard = ({ title = "Bảng xếp hạng Cosplayer" }) => {
  const [cosplayers, setCosplayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load cosplayers from API
  const loadCosplayers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await cosplayerAPI.getCosplayers({
        page: 1,
        pageSize: 5,
        sortBy: 'followersCount',
        sortOrder: 'desc'
      });
      
      if (response.success && response.data.cosplayers) {
        // Sort by followers count and add client-side ranking
        const sortedCosplayers = response.data.cosplayers
          .sort((a, b) => (b.followersCount || 0) - (a.followersCount || 0))
          .map((cosplayer, index) => ({
            ...cosplayer,
            rank: index + 1
          }));
        
        setCosplayers(sortedCosplayers);
      } else {
        setError(response.message || 'Failed to load cosplayers');
        setCosplayers([]);
      }
    } catch (err) {
      console.error('Error loading cosplayers:', err);
      setError('Failed to load cosplayers');
      setCosplayers([]);
    } finally {
      setLoading(false);
    }
  };

  // Load cosplayers on component mount
  useEffect(() => {
    loadCosplayers();
  }, []);

  return (
    <Paper
      sx={{
        borderRadius: '24px',
        p: 3,
        background: '#FFD8D8',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        height: 'fit-content',
        width: '588px',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: 'text.primary',
          mb: 3,
          fontSize: '20px',
          textAlign: 'center',
        }}
      >
        {title}
      </Typography>

      {/* Column Headers */}
      <Box 
        sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          px: 1.5,
          py: 1,
          mb: 2,
          borderBottom: '1px solid rgba(233, 30, 99, 0.2)'
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '12px',
            minWidth: '20px',
          }}
        >
          Hạng
        </Typography>
        
        <Box sx={{ width: 48 }} /> {/* Avatar space */}
        
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '12px',
            flex: 1,
          }}
        >
          Cosplayer
        </Typography>
        
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            color: 'text.secondary',
            fontSize: '12px',
          }}
        >
          Số người theo dõi
        </Typography>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#E91E63' }} />
        </Box>
      )}

      {/* Error State */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Empty State */}
      {!loading && !error && cosplayers.length === 0 && (
        <Alert severity="info">
          Không có dữ liệu cosplayer
        </Alert>
      )}

      {/* Leaderboard List */}
      {!loading && cosplayers.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {cosplayers.map((cosplayer) => (
            <Box
              key={cosplayer.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                p: 1.5,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&:hover': {
                  backgroundColor: 'rgba(233, 30, 99, 0.05)',
                  transform: 'translateX(4px)',
                },
                cursor: 'pointer',
              }}
            >
              {/* Rank */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  minWidth: '20px',
                  fontSize: '16px',
                }}
              >
                {cosplayer.rank}
              </Typography>

              {/* Avatar */}
              <Avatar
                src={cosplayer.avatarUrl}
                alt={cosplayer.displayName}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid rgba(233, 30, 99, 0.2)',
                }}
              >
                {cosplayer.displayName?.charAt(0)}
              </Avatar>

              {/* Info */}
              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '14px',
                    mb: 0.5,
                  }}
                >
                  {cosplayer.displayName}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Rating
                    value={cosplayer.rating || 0}
                    precision={0.1}
                    size="small"
                    readOnly
                    sx={{
                      '& .MuiRating-iconFilled': {
                        color: '#FFD700',
                      },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'primary.main',
                      fontWeight: 600,
                      fontSize: '12px',
                    }}
                  >
                    {cosplayer.totalReviews || 0}
                  </Typography>
                </Box>
              </Box>

              {/* Follower Count */}
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: '14px',
                }}
              >
                {cosplayer.followersCount || 0}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default CosplayerLeaderboard;