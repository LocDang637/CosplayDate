import React from 'react';
import { Box, Typography } from '@mui/material';
import picture from '../../assets/SignupImg.png'; // Adjust the path as necessary
const CharacterSidebar = () => {
  return (
    <Box
      sx={{
        width: '530px',
        height: '100vh',
        backgroundImage: 'url("/src/assets/SignupImg.png")'
        ,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(45deg, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1))',
        },
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          left: '8%',
          color: 'white',
          zIndex: 2,
          textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: 700,
            fontSize: '18px',
            lineHeight: 1.4,
            maxWidth: '200px',
          }}
        >
          Chào mừng bạn đến với chúng mình!!!
        </Typography>
      </Box>
    </Box>
  );
};

export default CharacterSidebar;