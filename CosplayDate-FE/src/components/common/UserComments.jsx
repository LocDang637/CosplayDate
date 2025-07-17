import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Rating,
  Paper,
  Chip,
  Button,
  Pagination,
  CircularProgress
} from '@mui/material';
import { ThumbUp, Reply, MoreHoriz } from '@mui/icons-material';
import { reviewAPI } from '../../services/reviewAPI';

const UserComments = ({ title = "Đánh giá từ người dùng" }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const commentsPerPage = 6;

  // Load reviews from API
  const loadReviews = async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await reviewAPI.getAllReviews(page, commentsPerPage);
      
      if (response.success && response.data) {
        // Check if response.data is the ApiResponse structure
        const reviewsData = response.data.data || response.data;
        setReviews(Array.isArray(reviewsData) ? reviewsData : []);
      } else {
        setError(response.error || 'Failed to load reviews');
        setReviews([]);
      }
    } catch (err) {
      console.error('Error loading reviews:', err);
      setError('Failed to load reviews');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  // Load reviews on component mount and page change
  useEffect(() => {
    loadReviews(currentPage);
  }, [currentPage]);

  // Calculate pagination (since we don't have total count from API, we'll use a simple approach)
  const totalPages = reviews.length === commentsPerPage ? currentPage + 1 : currentPage;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLike = async (reviewId) => {
    try {
      // Toggle helpful vote
      const response = await reviewAPI.toggleHelpful(reviewId, true);
      if (response.success) {
        // Reload reviews to get updated helpful count
        loadReviews(currentPage);
      }
    } catch (error) {
      console.error('Error toggling helpful vote:', error);
    }
  };

  const handleReply = (reviewId) => {
    // console.log('Reply to review:', reviewId);
    // Handle reply logic here
  };

  const getRatingColor = (rating) => {
    if (rating >= 5) return '#4CAF50';
    if (rating >= 4) return '#FF9800';
    return '#F44336';
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 ngày trước';
    if (diffDays <= 7) return `${diffDays} ngày trước`;
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} tuần trước`;
    return `${Math.ceil(diffDays / 30)} tháng trước`;
  };

  return (
    <Paper
      sx={{
        borderRadius: '24px',
        p: 4,
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        mb: 4,
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            mb: 2,
            fontSize: { xs: '24px', md: '28px' },
          }}
        >
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            fontSize: '16px',
          }}
        >
          Xem những đánh giá chân thực từ cộng đồng CosplayDate
        </Typography>
      </Box>

      {/* Comments Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => loadReviews(currentPage)}
            color="primary"
          >
            Thử lại
          </Button>
        </Box>
      ) : reviews.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            Chưa có đánh giá nào
          </Typography>
        </Box>
      ) : (
        <Box sx={{ 
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3,
          mb: 4
        }}>
          {reviews.map((review) => (
            <Paper
              key={review.id}
              sx={{
                p: 3,
                borderRadius: '16px',
                background: 'white',
                border: '1px solid rgba(233, 30, 99, 0.08)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
                },
              }}
            >
              {/* User Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  src={review.customerAvatarUrl || ''}
                  alt={review.customerName || 'User'}
                  sx={{
                    width: 48,
                    height: 48,
                    mr: 2,
                    border: '2px solid rgba(233, 30, 99, 0.1)',
                  }}
                >
                  {!review.customerAvatarUrl && (review.customerName || 'U')[0]}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: '14px',
                      }}
                    >
                      {review.customerName || 'Anonymous'}
                    </Typography>
                    {review.isVerified && (
                      <Chip
                        label="✓"
                        size="small"
                        sx={{
                          backgroundColor: 'primary.main',
                          color: 'white',
                          fontSize: '10px',
                          height: '16px',
                          minWidth: '16px',
                          '& .MuiChip-label': { px: 0.5 }
                        }}
                      />
                    )}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '12px',
                    }}
                  >
                    {formatDate(review.createdAt)}
                  </Typography>
                </Box>
              </Box>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Rating
                  value={review.rating}
                  readOnly
                  size="small"
                  sx={{
                    '& .MuiRating-iconFilled': {
                      color: getRatingColor(review.rating),
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    ml: 1,
                    color: 'text.secondary',
                    fontSize: '12px',
                  }}
                >
                  {review.rating}/5
                </Typography>
              </Box>

              {/* Comment Text */}
              <Typography
                variant="body2"
                sx={{
                  color: 'text.primary',
                  fontSize: '14px',
                  lineHeight: 1.5,
                  mb: 3,
                }}
              >
                {review.comment}
              </Typography>

              {/* Service Type Tag */}
              {review.serviceType && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '12px',
                      mr: 1,
                    }}
                  >
                    Dịch vụ:
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {review.serviceType}
                  </Typography>
                </Box>
              )}

              {/* Cosplayer Info */}
              {(review.cosplayerName || review.cosplayerAvatarUrl) && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.secondary',
                      fontSize: '12px',
                      mr: 1,
                    }}
                  >
                    Cosplayer:
                  </Typography>
                  <Avatar
                    src={review.cosplayerAvatarUrl || ''}
                    alt={review.cosplayerName || 'Cosplayer'}
                    sx={{
                      width: 20,
                      height: 20,
                      mr: 1,
                      fontSize: '10px',
                    }}
                  >
                    {!review.cosplayerAvatarUrl && (review.cosplayerName || 'C')[0]}
                  </Avatar>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '12px',
                      fontWeight: 500,
                    }}
                  >
                    {review.cosplayerName || 'Anonymous'}
                  </Typography>
                </Box>
              )}

              {/* Actions */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  startIcon={<ThumbUp />}
                  onClick={() => handleLike(review.id)}
                  sx={{
                    color: review.isHelpfulByCurrentUser ? 'primary.main' : 'text.secondary',
                    textTransform: 'none',
                    fontSize: '12px',
                    '&:hover': {
                      backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    },
                  }}
                >
                  Hữu ích ({review.helpfulCount || 0})
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      {/* Pagination */}
      {!loading && !error && reviews.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};

export default UserComments;
