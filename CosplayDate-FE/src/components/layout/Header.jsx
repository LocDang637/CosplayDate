// In src/components/layout/Header.jsx - Update profile navigation logic

import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemButton
} from '@mui/material';
import {
  AccountCircle,
  Login,
  PersonAdd,
  Settings,
  Logout,
  Favorite,
  Home,
  Person,
  Message,
  Notifications,
  Menu as MenuIcon,
  Close,
  Dashboard,
  Person as PersonIcon
} from '@mui/icons-material';

const Header = ({ user = null, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  const isAuthenticated = !!user;
  const currentPath = location.pathname;

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleProfileMenuClose();
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    onLogout?.();
    handleProfileMenuClose();
    navigate('/');
  };

  // ✅ FIX: Improved role-based profile navigation
  const getProfilePath = () => {
    if (!user) return '/login';
    
    // Handle both id and userId fields
    const userId = user.id || user.userId;
    if (!userId) {
      console.warn('No user ID found, redirecting to login');
      return '/login';
    }
    
    const userType = user.userType || user.role; // Support both possible field names
    
    console.log('🔍 Header Profile Navigation:', {
      userId: userId,
      userType: userType,
      user: user
    });
    
    switch (userType) {
      case 'Customer':
        return `/customer-profile/${userId}`;
      case 'Cosplayer':
        return `/profile/${userId}`;
      default:
        // Fallback based on user properties or default to customer
        console.warn('Unknown user type:', userType, 'Defaulting to customer profile');
        return `/customer-profile/${userId}`;
    }
  };

  const handleProfileNavigation = () => {
    const profilePath = getProfilePath();
    console.log('📱 Navigating to profile:', profilePath);
    handleNavigation(profilePath);
  };

  const navigationItems = [
    { label: 'Trang chủ', path: '/', icon: <Home /> },
    { label: 'Cosplayer', path: '/cosplayers', icon: <Person /> },
    { label: 'Dịch vụ', path: '/services', icon: <Favorite /> },
  ];

  // Updated auth menu items with role-based profile navigation
  const authMenuItems = isAuthenticated ? [
    { 
      label: 'Tài khoản', 
      action: handleProfileNavigation, 
      icon: user?.userType === 'Cosplayer' ? <PersonIcon /> : <AccountCircle />
    },
    { label: 'Tin nhắn', path: '/messages', icon: <Message /> },
    { label: 'Cài đặt', path: '/settings', icon: <Settings /> },
    { label: 'Đăng xuất', action: handleLogout, icon: <Logout /> },
  ] : [
    { label: 'Đăng nhập', path: '/login', icon: <Login /> },
    { label: 'Đăng ký', path: '/signup', icon: <PersonAdd /> },
  ];

  const NavButton = ({ item, isMobile = false }) => {
    const isActive = currentPath === item.path;
    
    if (isMobile) {
      return (
        <ListItem disablePadding>
          <ListItemButton
            onClick={() => item.action ? item.action() : handleNavigation(item.path)}
            sx={{
              py: 1.5,
              px: 2,
              backgroundColor: isActive ? 'rgba(233, 30, 99, 0.1)' : 'transparent',
              '&:hover': {
                backgroundColor: 'rgba(233, 30, 99, 0.05)',
              },
            }}
          >
            <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'text.secondary', minWidth: 40 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.label}
              sx={{ 
                color: isActive ? 'primary.main' : 'text.primary',
                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 600 : 400,
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      );
    }

    return (
      <Button
        onClick={() => item.action ? item.action() : handleNavigation(item.path)}
        sx={{
          color: isActive ? 'primary.main' : 'text.primary',
          fontWeight: isActive ? 600 : 500,
          mx: 1,
          px: 2,
          py: 1,
          borderRadius: '8px',
          textTransform: 'none',
          fontSize: '14px',
          position: 'relative',
          '&:hover': {
            backgroundColor: 'rgba(233, 30, 99, 0.05)',
          },
          '&::after': isActive ? {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '24px',
            height: '2px',
            backgroundColor: 'primary.main',
            borderRadius: '1px',
          } : {},
        }}
      >
        {item.label}
      </Button>
    );
  };

  const AuthButtons = () => {
    if (isAuthenticated) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Notifications */}
          <IconButton
            onClick={() => handleNavigation('/notifications')}
            sx={{ color: 'text.primary' }}
          >
            <Badge badgeContent={notificationCount} color="error">
              <Notifications />
            </Badge>
          </IconButton>

          {/* Messages */}
          <IconButton
            onClick={() => handleNavigation('/messages')}
            sx={{ color: 'text.primary' }}
          >
            <Message />
          </IconButton>

          {/* Profile Menu */}
          <IconButton
            onClick={handleProfileMenuOpen}
            sx={{ ml: 1 }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                backgroundColor: 'primary.main',
                fontSize: '14px',
                fontWeight: 600,
              }}
            >
              {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          onClick={() => handleNavigation('/login')}
          sx={{
            color: 'primary.main',
            borderColor: 'primary.main',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 0.75,
            borderRadius: '8px',
            '&:hover': {
              backgroundColor: 'rgba(233, 30, 99, 0.05)',
              borderColor: 'primary.dark',
            },
          }}
        >
          Đăng nhập
        </Button>
        <Button
          variant="contained"
          onClick={() => handleNavigation('/signup')}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            color: 'white',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
            py: 0.75,
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
            },
          }}
        >
          Đăng ký
        </Button>
      </Box>
    );
  };

  return (
    <>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          backgroundColor: '#FFE8F5',
          borderBottom: '1px solid rgba(233, 30, 99, 0.1)',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              component={Link}
              to="/"
              sx={{ 
                mr: 1,
                '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.05)' }
              }}
            >
              <Favorite sx={{ color: 'primary.main', fontSize: 28 }} />
            </IconButton>
            <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                fontFamily: 'Inter, sans-serif',
                fontWeight: 700,
                fontSize: '20px',
                color: 'text.primary',
                textDecoration: 'none',
                letterSpacing: '0.5px',
                '&:hover': {
                  color: 'primary.main',
                },
              }}
            >
              CosplayDate
            </Typography>
          </Box>

          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
              {navigationItems.map((item) => (
                <NavButton key={item.path} item={item} />
              ))}
            </Box>
          )}

          {/* Desktop Auth Section */}
          {!isMobile && <AuthButtons />}

          {/* Mobile Menu Button */}
          {isMobile && (
            <IconButton
              onClick={() => setMobileMenuOpen(true)}
              sx={{ color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 200,
              borderRadius: '12px',
              border: '1px solid rgba(233, 30, 99, 0.1)',
              boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
              // Force positioning to stay on right side
              right: 0,
              left: 'auto !important',
            }
          }
        }}
      >
        {isAuthenticated && (
          <>
            <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                {user?.email}
              </Typography>
              {user?.userType && (
                <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '11px', fontWeight: 500 }}>
                  {user.userType === 'Customer' ? '👤 Khách hàng' : '🎭 Cosplayer'}
                </Typography>
              )}
              {/* ✅ ADD: Debug info for development */}
              {process.env.NODE_ENV === 'development' && (
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '10px', mt: 0.5 }}>
                  ID: {user?.id || user?.userId || 'N/A'}
                </Typography>
              )}
            </Box>
            <Divider />
          </>
        )}
        
        {authMenuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => item.action ? item.action() : handleNavigation(item.path)}
            sx={{ py: 1, px: 2 }}
          >
            <ListItemIcon sx={{ minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </MenuItem>
        ))}
      </Menu>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#FFE8F5',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
            Menu
          </Typography>
          <IconButton onClick={() => setMobileMenuOpen(false)}>
            <Close />
          </IconButton>
        </Box>
        
        <Divider />
        
        <List>
          {navigationItems.map((item) => (
            <NavButton key={item.path} item={item} isMobile />
          ))}
        </List>
        
        <Divider sx={{ my: 1 }} />
        
        <List>
          {authMenuItems.map((item, index) => (
            <NavButton key={index} item={item} isMobile />
          ))}
        </List>

        {isAuthenticated && (
          <Box sx={{ p: 2, mt: 'auto' }}>
            <Box sx={{ 
              p: 2, 
              backgroundColor: 'rgba(233, 30, 99, 0.05)', 
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <Avatar sx={{ 
                width: 48, 
                height: 48, 
                backgroundColor: 'primary.main', 
                mx: 'auto', 
                mb: 1 
              }}>
                {user?.firstName?.[0] || 'U'}
              </Avatar>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                {user?.email}
              </Typography>
              {user?.userType && (
                <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '11px', fontWeight: 500, mt: 0.5 }}>
                  {user.userType === 'Customer' ? '👤 Khách hàng' : '🎭 Cosplayer'}
                </Typography>
              )}
            </Box>
          </Box>
        )}
      </Drawer>
    </>
  );
};

export default Header;