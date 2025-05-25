import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Paper,
  Chip
} from '@mui/material';
import { CalendarToday, LocationOn } from '@mui/icons-material';

const CosplayNews = ({ title = "Sự kiện sắp diễn ra" }) => {
  // Mock news/events data
  const newsData = [
    {
      id: 1,
      title: 'Cosplay Contest',
      date: '25/04/2025',
      location: 'TP. Hồ Chí Minh',
      image: '/src/assets/news1.png',
      type: 'contest'
    },
    {
      id: 2,
      title: 'Cosplay Festival',
      date: '10/05/2025',
      location: 'Hà Nội',
      image: '/src/assets/news2.png',
      type: 'festival'
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'contest':
        return { bg: 'rgba(156, 39, 176, 0.1)', color: '#9C27B0' };
      case 'festival':
        return { bg: 'rgba(233, 30, 99, 0.1)', color: '#E91E63' };
      default:
        return { bg: 'rgba(233, 30, 99, 0.1)', color: '#E91E63' };
    }
  };

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

      {/* News/Events List */}
      <Box sx={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 2,
      }}>
        {newsData.map((news) => {
          const typeStyle = getTypeColor(news.type);
          
          return (
            <Card
              key={news.id}
              sx={{
                width: '260px',
                height: '300px',
                borderRadius: '16px',
                overflow: 'hidden',
                background: 'white',
                border: '1px solid rgba(233, 30, 99, 0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#FFD8D8',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
                },
              }}
            >
              {/* Event Image */}
              <CardMedia
                component="img"
                height="140"
                image={news.image}
                alt={news.title}
                sx={{
                  objectFit: 'cover',
                  width: '250px',
                  height: '140px',
                  flexShrink: 0,
                  mx: 'auto',
                  display: 'block',
                  marginTop: '5px',
                }}
              />
              
              <CardContent sx={{ 
                p: 2, 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                {/* Event Type Chip */}
                <Box sx={{ mb: 1 }}>
                  <Chip
                    label={news.type === 'contest' ? 'Contest' : 'Festival'}
                    sx={{
                      backgroundColor: typeStyle.bg,
                      color: typeStyle.color,
                      fontWeight: 600,
                      fontSize: '11px',
                      height: '20px',
                    }}
                  />
                </Box>

                {/* Event Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: '16px',
                    mb: 1,
                    lineHeight: 1.3,
                    flex: 1,
                  }}
                >
                  {news.title}
                </Typography>

                {/* Event Details */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <CalendarToday 
                      sx={{ 
                        fontSize: 14, 
                        color: 'text.secondary' 
                      }} 
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '12px',
                      }}
                    >
                      {news.date}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LocationOn 
                      sx={{ 
                        fontSize: 14, 
                        color: 'text.secondary' 
                      }} 
                    />
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        fontSize: '12px',
                      }}
                    >
                      {news.location}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Paper>
  );
};

export default CosplayNews;