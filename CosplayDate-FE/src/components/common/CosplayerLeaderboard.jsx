import React from 'react';
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Paper
} from '@mui/material';

const CosplayerLeaderboard = ({ title = "Bảng xếp hạng Cosplayer" }) => {
  // Mock leaderboard data
  const leaderboardData = [
    {
      id: 1,
      rank: 1,
      name: 'Cosplayer 1',
      avatar: '/src/assets/cosplayer1.png',
      rating: 4.5,
      reviews: 2,
      score: '8.9%'
    },
    {
      id: 2,
      rank: 1,
      name: 'Cosplayer 1',
      avatar: '/src/assets/cosplayer2.png',
      rating: 4.5,
      reviews: 2,
      score: '8.9%'
    },
    {
      id: 3,
      rank: 1,
      name: 'Cosplayer 1',
      avatar: '/src/assets/cosplayer3.png',
      rating: 4.5,
      reviews: 2,
      score: '8.9%'
    },
    {
      id: 4,
      rank: 1,
      name: 'Cosplayer 1',
      avatar: '/src/assets/cosplayer4.png',
      rating: 4.5,
      reviews: 2,
      score: '8.9%'
    },
    {
      id: 5,
      rank: 1,
      name: 'Cosplayer 1',
      avatar: '/src/assets/cosplayer5.png',
      rating: 4.5,
      reviews: 2,
      score: '8.9%'
    }
  ];

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

      {/* Leaderboard List */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {leaderboardData.map((cosplayer) => (
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
              src={cosplayer.avatar}
              alt={cosplayer.name}
              sx={{
                width: 48,
                height: 48,
                border: '2px solid rgba(233, 30, 99, 0.2)',
              }}
            />

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
                {cosplayer.name}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Rating
                  value={cosplayer.rating}
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
                  {cosplayer.reviews}
                </Typography>
              </Box>
            </Box>

            {/* Score */}
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: 'text.primary',
                fontSize: '14px',
              }}
            >
              {cosplayer.score}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default CosplayerLeaderboard;