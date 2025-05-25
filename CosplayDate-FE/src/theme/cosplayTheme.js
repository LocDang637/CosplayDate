import { createTheme } from '@mui/material/styles';

export const cosplayTheme = createTheme({
  palette: {
    primary: {
      main: '#E91E63',
      light: '#F8BBD9',
      dark: '#AD1457',
    },
    secondary: {
      main: '#9C27B0',
      light: '#E1BEE7',
      dark: '#7B1FA2',
    },
    background: {
      default: '#FFE8F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2D2D2D',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h4: { 
      fontWeight: 700, 
      letterSpacing: '0.5px' 
    },
    body1: { 
      fontWeight: 400 
    },
    body2: { 
      fontWeight: 500 
    },
  },
  components: {
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: '#FAFAFA',
            transition: 'all 0.2s ease-in-out',
            '&:hover': { 
              backgroundColor: '#F5F5F5' 
            },
            '&.Mui-focused': {
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 0 2px rgba(233, 30, 99, 0.1)',
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '16px',
          padding: '12px 32px',
          boxShadow: 'none',
          '&:hover': { 
            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)' 
          },
        },
      },
    },
  },
});