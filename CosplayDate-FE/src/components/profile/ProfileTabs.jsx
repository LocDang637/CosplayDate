import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Badge,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  GridView,
  PhotoLibrary,
  Star,
  Event,
  Favorite,
  Info,
  VideoLibrary,
  EmojiEvents,
  AccountBalanceWallet
} from '@mui/icons-material';

const ProfileTabs = ({ 
  activeTab, 
  onTabChange, 
  customTabs = null // Allow custom tab configuration
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Default tabs for cosplayer profiles
  const defaultTabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Info />,
      show: true
    },
    {
      id: 'gallery',
      label: 'Gallery',
      icon: <PhotoLibrary />,
      show: true
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: <VideoLibrary />,
      show: true
    },
    {
      id: 'reviews',
      label: 'Reviews',
      icon: <Star />,
      show: true
    },
    {
      id: 'events',
      label: 'Events',
      icon: <Event />,
      show: true
    },
    {
      id: 'achievements',
      label: 'Awards',
      icon: <EmojiEvents />,
      show: true
    },
    {
      id: 'favorites',
      label: 'Favorites',
      icon: <Favorite />,
    }
  ];

  // Use custom tabs if provided, otherwise use default tabs
  const tabs = customTabs || defaultTabs;
  const visibleTabs = tabs.filter(tab => tab.show);

  const getIcon = (iconName) => {
    const iconMap = {
      'Info': <Info />,
      'PhotoLibrary': <PhotoLibrary />,
      'VideoLibrary': <VideoLibrary />,
      'Star': <Star />,
      'Event': <Event />,
      'Favorite': <Favorite />,
      'EmojiEvents': <EmojiEvents />,
      'AccountBalanceWallet': <AccountBalanceWallet />,
      'GridView': <GridView />
    };
    return iconMap[iconName] || <Info />;
  };

  const TabIcon = ({ tab }) => {
    const icon = typeof tab.icon === 'string' ? getIcon(tab.icon) : tab.icon;
    
    if (tab.count !== undefined && tab.count > 0) {
      return (
        <Badge 
          badgeContent={tab.count > 99 ? '99+' : tab.count} 
          color="primary"
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '10px',
              height: '16px',
              minWidth: '16px',
              borderRadius: '8px',
            }
          }}
        >
          {icon}
        </Badge>
      );
    }
    return icon;
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '16px',
        mb: 3,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
      }}
    >
      <Tabs
        value={activeTab}
        onChange={onTabChange}
        variant={isMobile ? "scrollable" : "fullWidth"}
        scrollButtons={isMobile ? "auto" : false}
        allowScrollButtonsMobile
        sx={{
          '& .MuiTabs-root': {
            minHeight: '64px',
          },
          '& .MuiTab-root': {
            minHeight: '64px',
            py: 2,
            px: { xs: 2, md: 3 },
            textTransform: 'none',
            fontWeight: 600,
            fontSize: { xs: '12px', md: '14px' },
            color: 'text.secondary',
            transition: 'all 0.3s ease',
            borderRadius: '12px 12px 0 0',
            minWidth: { xs: 'auto', md: '120px' },
            '&:hover': {
              color: 'primary.main',
              backgroundColor: 'rgba(233, 30, 99, 0.05)',
            },
            '&.Mui-selected': {
              color: 'primary.main',
              backgroundColor: 'rgba(233, 30, 99, 0.1)',
              fontWeight: 700,
            },
            '& .MuiTab-iconWrapper': {
              marginBottom: { xs: '4px', md: '8px' },
              fontSize: { xs: '18px', md: '20px' },
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: 'primary.main',
            height: '3px',
            borderRadius: '2px',
          },
          '& .MuiTabs-scrollButtons': {
            color: 'primary.main',
            '&.Mui-disabled': {
              opacity: 0.3,
            },
          },
        }}
      >
        {visibleTabs.map((tab) => (
          <Tab
            key={tab.id}
            value={tab.id}
            label={isMobile ? '' : tab.label}
            icon={<TabIcon tab={tab} />}
            iconPosition="top"
            aria-label={tab.label}
          />
        ))}
      </Tabs>
    </Paper>
  );
};

export default ProfileTabs;