import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Grid,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Alert,
  Pagination,
  IconButton,
  Tooltip,
  Stack
} from '@mui/material';
import {
  Verified,
  FiberManualRecord,
  LocationOn,
  Person
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { followAPI } from '../../services/api';

const CosplayerFollowers = ({ cosplayerId, isOwnProfile }) => {
  const navigate = useNavigate();
  
  // State management
  const [followers, setFollowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Load followers data
  const loadFollowers = useCallback(async (page = 1) => {
    if (!cosplayerId) return;

    try {
      setLoading(true);
      setError(null);

      // console.log('🔍 Loading followers for cosplayer:', cosplayerId, 'page:', page);

      const result = await followAPI.getFollowers(cosplayerId, page, pageSize);

      // console.log('📊 Followers API result:', result);

      if (result.success && result.data) {
        const { followers: followersData, totalCount: total, totalPages: pages, currentPage: current } = result.data;
        
        setFollowers(followersData || []);
        setTotalCount(total || 0);
        setTotalPages(pages || 1);
        setCurrentPage(current || 1);
        
        // console.log('✅ Followers loaded successfully:', {
          count: followersData?.length || 0,
          totalCount: total,
          totalPages: pages
        });
      } else {
        // console.log('❌ Followers loading failed:', result.message);
        setError(result.message || 'Failed to load followers');
        setFollowers([]);
      }
    } catch (err) {
      console.error('💥 Followers loading error:', err);
      setError('Unable to load followers. Please try again.');
      setFollowers([]);
    } finally {
      setLoading(false);
    }
  }, [cosplayerId, pageSize]);

  // Load followers on component mount and when cosplayerId changes
  useEffect(() => {
    loadFollowers(1);
  }, [loadFollowers]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    loadFollowers(newPage);
  };

  // Handle follower card click
  const handleFollowerClick = (follower) => {
    if (follower.userType === 'Cosplayer') {
      navigate(`/profile/${follower.id}`);
    } else if (follower.userType === 'Customer') {
      navigate(`/customer-profile/${follower.id}`);
    }
  };

  // Format follow date
  const formatFollowDate = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Format last login
  const formatLastLogin = (dateString) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Vừa truy cập';
      if (diffInHours < 24) return `${diffInHours} giờ trước`;
      
      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 7) return `${diffInDays} ngày trước`;
      
      return date.toLocaleDateString('vi-VN');
    } catch {
      return '';
    }
  };

  // Loading state
  if (loading && currentPage === 1) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <Stack alignItems="center" spacing={2}>
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" color="text.secondary">
            Đang tải danh sách người theo dõi...
          </Typography>
        </Stack>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ borderRadius: '12px' }}
          action={
            <IconButton
              color="inherit"
              size="small"
              onClick={() => loadFollowers(currentPage)}
            >
              Thử lại
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  // Empty state
  if (!followers.length) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 3
      }}>
        <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {isOwnProfile ? 'Chưa có người theo dõi' : 'Chưa có người theo dõi'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isOwnProfile 
            ? 'Hãy chia sẻ hồ sơ của bạn để có thêm người theo dõi!' 
            : 'Cosplayer này chưa có người theo dõi nào.'
          }
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
          Người theo dõi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {totalCount} người đang theo dõi {isOwnProfile ? 'bạn' : 'cosplayer này'}
        </Typography>
      </Box>

      {/* Followers Grid */}
      <Grid container spacing={3}>
        {followers.map((follower) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={follower.id}>
            <Card
              sx={{
                borderRadius: '16px',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                height: '100%',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 25px rgba(233, 30, 99, 0.15)',
                },
              }}
              onClick={() => handleFollowerClick(follower)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                {/* Avatar with online status */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={follower.avatarUrl}
                    alt={follower.name}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '3px solid',
                      borderColor: follower.isOnline ? 'success.main' : 'grey.300',
                      fontSize: '2rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
                      color: 'white'
                    }}
                  >
                    {follower.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  
                  {/* Online indicator */}
                  {follower.isOnline && (
                    <FiberManualRecord
                      sx={{
                        position: 'absolute',
                        bottom: 5,
                        right: 5,
                        color: 'success.main',
                        fontSize: 16,
                        backgroundColor: 'white',
                        borderRadius: '50%'
                      }}
                    />
                  )}
                </Box>

                {/* Name with verification */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '1.1rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '150px'
                    }}
                  >
                    {follower.name}
                  </Typography>
                  {follower.isVerified && (
                    <Tooltip title="Tài khoản đã xác thực">
                      <Verified
                        sx={{
                          ml: 0.5,
                          fontSize: 18,
                          color: 'primary.main'
                        }}
                      />
                    </Tooltip>
                  )}
                </Box>

                {/* User type */}
                <Chip
                  label={follower.userType === 'Customer' ? 'Khách hàng' : 'Cosplayer'}
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: follower.userType === 'Customer' ? 'info.light' : 'primary.light',
                    color: follower.userType === 'Customer' ? 'info.dark' : 'primary.dark',
                    fontWeight: 500
                  }}
                />

                {/* Location */}
                {follower.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {follower.location}
                    </Typography>
                  </Box>
                )}

                {/* Follow date */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Theo dõi từ: {formatFollowDate(follower.followDate)}
                </Typography>

                {/* Last login */}
                <Typography variant="caption" color="text.secondary">
                  {follower.isOnline ? 'Đang trực tuyến' : formatLastLogin(follower.lastLoginAt)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '12px',
                fontWeight: 500,
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                color: 'white',
              },
            }}
            disabled={loading}
          />
        </Box>
      )}

      {/* Loading overlay for pagination */}
      {loading && currentPage > 1 && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
        </Box>
      )}
    </Box>
  );
};

export default CosplayerFollowers;
