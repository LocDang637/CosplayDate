import React from 'react';
import { Box, ThemeProvider, useTheme, useMediaQuery } from '@mui/material';
import { cosplayTheme } from '../../theme/cosplayTheme';
import CharacterSidebar from './CharacterSidebar';

const PageLayout = ({ children, showSidebar = false }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: '#FFE8F5',
          display: 'flex',
          backgroundImage: `
            radial-gradient(circle at 20% 20%, rgba(233, 30, 99, 0.05) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, rgba(156, 39, 176, 0.05) 0%, transparent 50%)
          `,
        }}
      >
        {showSidebar && !isMobile && <CharacterSidebar />}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            p: { xs: 2, md: 4 },
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default PageLayout;