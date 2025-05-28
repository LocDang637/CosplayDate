import React, { useState } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Button,
  IconButton,
  Chip,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Fade,
  Badge
} from '@mui/material';
import {
  Edit,
  Settings,
  Share,
  MoreVert,
  LocationOn,
  Verified,
  Star,
  PhotoCamera,
  CameraAlt
} from '@mui/icons-material';

const ProfileHeader = ({ 
  user, 
  isOwnProfile = false, 
  onEditProfile, 
  onEditAvatar,
  onFollowToggle,
  isFollowing = false 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarHovered, setAvatarHovered] = useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${user.firstName} ${user.lastName} - CosplayDate`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast notification here
    }
    handleMenuClose();
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '24px',
        p: 4,
        mb: 3,
        background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 70% 20%, rgba(255,255,255,0.3) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
          {/* Avatar Section */}
          <Box 
            sx={{ position: 'relative' }}
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
          >
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              badgeContent={
                user.isVerified && (
                  <Verified 
                    sx={{ 
                      color: '#4CAF50', 
                      fontSize: 28,
                      backgroundColor: 'white',
                      borderRadius: '50%',
                      p: '2px'
                    }} 
                  />
                )
              }
            >
              <Avatar
                src={user.avatar}
                sx={{
                  width: 120,
                  height: 120,
                  border: '4px solid white',
                  boxShadow: '0 8px 24px rgba(233, 30, 99, 0.2)',
                  cursor: isOwnProfile ? 'pointer' : 'default',
                  transition: 'all 0.3s ease',
                  '&:hover': isOwnProfile ? {
                    transform: 'scale(1.05)',
                  } : {},
                }}
                onClick={isOwnProfile ? onEditAvatar : undefined}
              >
                {user.firstName?.[0]}{user.lastName?.[0]}
              </Avatar>
            </Badge>
            
            {/* Camera Overlay for Own Profile */}
            {isOwnProfile && (
              <Fade in={avatarHovered}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    borderRadius: '50%',
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={onEditAvatar}
                >
                  <CameraAlt sx={{ color: 'white', fontSize: 32 }} />
                </Box>
              </Fade>
            )}
          </Box>

          {/* Profile Info */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '24px', md: '32px' },
                }}
              >
                {user.firstName} {user.lastName}
              </Typography>
              
              {user.isOnline && (
                <Chip
                  label="Online"
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                />
              )}
            </Box>

            {/* Stats Row */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 2 }}>
              {user.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ color: '#FFD700', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {user.rating}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    ({user.reviewCount} reviews)
                  </Typography>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.followersCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  followers
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.followingCount || 0}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  following
                </Typography>
              </Box>
            </Box>

            {/* Location */}
            {user.location && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <LocationOn sx={{ color: 'text.secondary', fontSize: 18 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {user.location}
                </Typography>
              </Box>
            )}

            {/* Bio */}
            {user.bio && (
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  lineHeight: 1.6,
                  maxWidth: '500px',
                }}
              >
                {user.bio}
              </Typography>
            )}
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
            {isOwnProfile ? (
              <>
                <Button
                  variant="contained"
                  startIcon={<Edit />}
                  onClick={onEditProfile}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    color: 'white',
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                    },
                  }}
                >
                  Edit Profile
                </Button>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                  }}
                >
                  <MoreVert />
                </IconButton>
              </>
            ) : (
              <>
                <Button
                  variant={isFollowing ? "outlined" : "contained"}
                  onClick={onFollowToggle}
                  sx={{
                    background: isFollowing ? 'transparent' : 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    color: isFollowing ? 'primary.main' : 'white',
                    borderColor: isFollowing ? 'primary.main' : 'transparent',
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    minWidth: '100px',
                    '&:hover': {
                      background: isFollowing ? 'rgba(233, 30, 99, 0.05)' : 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                    },
                  }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </Button>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 3,
                    py: 1,
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': {
                      backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    },
                  }}
                >
                  Message
                </Button>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                  }}
                >
                  <MoreVert />
                </IconButton>
              </>
            )}
          </Box>
        </Box>

        {/* Specialties/Categories */}
        {user.specialties && user.specialties.length > 0 && (
          <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {user.specialties.map((specialty, index) => (
              <Chip
                key={index}
                label={specialty}
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  color: 'primary.main',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,1)',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: 160,
            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          }
        }}
      >
        <MenuItem onClick={handleShare}>
          <ListItemIcon>
            <Share fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Share Profile" />
        </MenuItem>
        {isOwnProfile && (
          <MenuItem onClick={() => { handleMenuClose(); /* Handle settings */ }}>
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </MenuItem>
        )}
      </Menu>
    </Paper>
  );
};

export default ProfileHeader;