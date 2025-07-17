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

const CustomerFollowing = ({ customerId, isOwnProfile }) => {
  const navigate = useNavigate();
  
  // State management
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  // Load following data
  const loadFollowing = useCallback(async (page = 1) => {
    if (!customerId) return;

    try {
      setLoading(true);
      setError(null);

      // console.log('🔍 Loading following for customer:', customerId, 'page:', page);

      const result = await followAPI.getFollowing(customerId, page, pageSize);

      // console.log('📊 Following API result:', result);

      if (result.success && result.data) {
        const { following: followingData, totalCount: total, totalPages: pages, currentPage: current } = result.data;
        
        setFollowing(followingData || []);
        setTotalCount(total || 0);
        setTotalPages(pages || 1);
        setCurrentPage(current || 1);
        
        // console.log('✅ Following loaded successfully:', {
        //   count: followingData?.length || 0,
        //   totalCount: total,
        //   totalPages: pages
        // });
      } else {
        // console.log('❌ Following loading failed:', result.message);
        setError(result.message || 'Failed to load following');
        setFollowing([]);
      }
    } catch (err) {
      console.error('💥 Following loading error:', err);
      setError('Unable to load following. Please try again.');
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  }, [customerId, pageSize]);

  // Load following on component mount and when customerId changes
  useEffect(() => {
    loadFollowing(1);
  }, [loadFollowing]);

  // Handle page change
  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
    loadFollowing(newPage);
  };

  // Handle cosplayer card click
  const handleCosplayerClick = (cosplayer) => {
    if (cosplayer.userType === 'Cosplayer') {
      navigate(`/profile/${cosplayer.id}`);
    } else if (cosplayer.userType === 'Customer') {
      navigate(`/customer-profile/${cosplayer.id}`);
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
            Đang tải danh sách đang theo dõi...
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
              onClick={() => loadFollowing(currentPage)}
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
  if (!following.length) {
    return (
      <Box sx={{ 
        textAlign: 'center', 
        py: 8,
        px: 3
      }}>
        <Person sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
        <Typography variant="h5" gutterBottom color="text.secondary">
          {isOwnProfile ? 'Chưa theo dõi ai' : 'Chưa theo dõi ai'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isOwnProfile 
            ? 'Hãy khám phá và theo dõi các cosplayer yêu thích!' 
            : 'Người dùng này chưa theo dõi ai.'
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
          Đang theo dõi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isOwnProfile ? 'Bạn đang theo dõi' : 'Đang theo dõi'} {totalCount} cosplayer
        </Typography>
      </Box>

      {/* Following Grid */}
      <Grid container spacing={3}>
        {following.map((cosplayer) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={cosplayer.id}>
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
              onClick={() => handleCosplayerClick(cosplayer)}
            >
              <CardContent sx={{ p: 3, textAlign: 'center' }}>
                {/* Avatar with online status */}
                <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
                  <Avatar
                    src={cosplayer.avatarUrl}
                    alt={cosplayer.name}
                    sx={{
                      width: 80,
                      height: 80,
                      border: '3px solid',
                      borderColor: cosplayer.isOnline ? 'success.main' : 'grey.300',
                      fontSize: '2rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
                      color: 'white'
                    }}
                  >
                    {cosplayer.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  
                  {/* Online indicator */}
                  {cosplayer.isOnline && (
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
                    {cosplayer.name}
                  </Typography>
                  {cosplayer.isVerified && (
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
                  label={cosplayer.userType === 'Customer' ? 'Khách hàng' : 'Cosplayer'}
                  size="small"
                  sx={{
                    mb: 2,
                    backgroundColor: cosplayer.userType === 'Customer' ? 'info.light' : 'primary.light',
                    color: cosplayer.userType === 'Customer' ? 'info.dark' : 'primary.dark',
                    fontWeight: 500
                  }}
                />

                {/* Location */}
                {cosplayer.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <LocationOn sx={{ fontSize: 16, color: 'text.secondary', mr: 0.5 }} />
                    <Typography variant="caption" color="text.secondary">
                      {cosplayer.location}
                    </Typography>
                  </Box>
                )}

                {/* Follow date */}
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                  Theo dõi từ: {formatFollowDate(cosplayer.followDate)}
                </Typography>

                {/* Last login */}
                <Typography variant="caption" color="text.secondary">
                  {cosplayer.isOnline ? 'Đang trực tuyến' : formatLastLogin(cosplayer.lastLoginAt)}
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

export default CustomerFollowing;
