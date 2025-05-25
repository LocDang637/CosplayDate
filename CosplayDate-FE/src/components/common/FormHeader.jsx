import React from 'react';
import { Box, Typography } from '@mui/material';
import { Favorite } from '@mui/icons-material';

const FormHeader = ({ title, subtitle }) => {
  return (
    <Box sx={{ textAlign: 'center', mb: 4 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Favorite sx={{ fontSize: 32, color: 'primary.main', mr: 1 }} />
        <Typography
          variant="h4"
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: { xs: '24px', sm: '28px', md: '32px' },
          }}
        >
          {title}
        </Typography>
      </Box>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          fontSize: { xs: '14px', sm: '16px' },
          lineHeight: 1.6,
          maxWidth: '400px',
          margin: '0 auto',
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default FormHeader;