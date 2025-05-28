import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Button,
  Chip,
  LinearProgress,
  Divider,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination,
  IconButton,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Search,
  FilterList,
  ThumbUp,
  ThumbDown,
  Reply,
  MoreVert,
  Flag,
  Star,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

const ProfileReviews = ({ 
  reviews = [], 
  overallRating = 4.8, 
  totalReviews = 127,
  isOwnProfile = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterRating, setFilterRating] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [helpfulReviews, setHelpfulReviews] = useState(new Set());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedReview, setSelectedReview] = useState(null);

  const reviewsPerPage = 10;

  // Calculate rating distribution
  const ratingDistribution = {
    5: Math.round(totalReviews * 0.65),
    4: Math.round(totalReviews * 0.20),
    3: Math.round(totalReviews * 0.10),
    2: Math.round(totalReviews * 0.03),
    1: Math.round(totalReviews * 0.02),
  };

  // Filter and sort reviews
  const filteredReviews = reviews.filter(review => {
    const matchesSearch = searchTerm === '' || 
      review.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.user.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    
    return matchesSearch && matchesRating;
  });

  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.date) - new Date(a.date);
      case 'oldest':
        return new Date(a.date) - new Date(b.date);
      case 'highest':
        return b.rating - a.rating;
      case 'lowest':
        return a.rating - b.rating;
      case 'helpful':
        return b.helpfulCount - a.helpfulCount;
      default:
        return 0;
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedReviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const currentReviews = sortedReviews.slice(startIndex, startIndex + reviewsPerPage);

  const handleHelpful = (reviewId) => {
    const newHelpfulReviews = new Set(helpfulReviews);
    if (newHelpfulReviews.has(reviewId)) {
      newHelpfulReviews.delete(reviewId);
    } else {
      newHelpfulReviews.add(reviewId);
    }
    setHelpfulReviews(newHelpfulReviews);
  };

  const handleMenuOpen = (event, review) => {
    setMenuAnchor(event.currentTarget);
    setSelectedReview(review);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedReview(null);
  };

  const RatingDistributionBar = ({ stars, count, total }) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, minWidth: 60 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {stars}
          </Typography>
          <Star sx={{ fontSize: 16, color: '#FFD700' }} />
        </Box>
        
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            flex: 1,
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(233, 30, 99, 0.1)',
            '& .MuiLinearProgress-bar': {
              backgroundColor: '#FFD700',
              borderRadius: 4,
            },
          }}
        />
        
        <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 40 }}>
          {count}
        </Typography>
      </Box>
    );
  };

  const ReviewCard = ({ review }) => {
    const isHelpful = helpfulReviews.has(review.id);
    
    return (
      <Card
        sx={{
          borderRadius: '16px',
          p: 3,
          mb: 2,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(233, 30, 99, 0.1)',
          },
        }}
      >
        {/* Review Header */}
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
          <Avatar
            src={review.user.avatar}
            sx={{
              width: 48,
              height: 48,
              border: '2px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            {review.user.name[0]}
          </Avatar>
          
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {review.user.name}
              </Typography>
              {review.user.verified && (
                <Chip
                  label="Verified"
                  size="small"
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontSize: '10px',
                    height: '16px',
                  }}
                />
              )}
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Rating value={review.rating} size="small" readOnly />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {review.date}
              </Typography>
            </Box>
          </Box>
          
          <IconButton 
            size="small"
            onClick={(e) => handleMenuOpen(e, review)}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Review Content */}
        <Typography 
          variant="body1" 
          sx={{ 
            color: 'text.primary',
            lineHeight: 1.6,
            mb: 2
          }}
        >
          {review.comment}
        </Typography>

        {/* Review Tags */}
        {review.tags && review.tags.length > 0 && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
            {review.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{
                  borderColor: 'primary.main',
                  color: 'primary.main',
                  fontSize: '11px',
                }}
              />
            ))}
          </Box>
        )}

        {/* Review Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            size="small"
            startIcon={isHelpful ? <ThumbUp /> : <ThumbUp />}
            onClick={() => handleHelpful(review.id)}
            sx={{
              color: isHelpful ? 'primary.main' : 'text.secondary',
              textTransform: 'none',
              fontSize: '12px',
              '&:hover': {
                backgroundColor: 'rgba(233, 30, 99, 0.05)',
              },
            }}
          >
            Helpful ({review.helpfulCount + (isHelpful ? 1 : 0)})
          </Button>
          
          <Button
            size="small"
            startIcon={<Reply />}
            sx={{
              color: 'text.secondary',
              textTransform: 'none',
              fontSize: '12px',
              '&:hover': {
                backgroundColor: 'rgba(233, 30, 99, 0.05)',
              },
            }}
          >
            Reply
          </Button>
        </Box>

        {/* Owner Response */}
        {review.response && (
          <Box sx={{ 
            mt: 2, 
            p: 2, 
            backgroundColor: 'rgba(233, 30, 99, 0.05)',
            borderRadius: '12px',
            borderLeft: '4px solid',
            borderColor: 'primary.main'
          }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
              Response from Owner
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
              {review.response}
            </Typography>
          </Box>
        )}
      </Card>
    );
  };

  return (
    <Box>
      {/* Reviews Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Overall Rating */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h2" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
              {overallRating}
            </Typography>
            <Rating value={overallRating} size="large" readOnly />
            <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
              Based on {totalReviews} reviews
            </Typography>
          </Paper>
        </Grid>

        {/* Rating Distribution */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Rating Distribution
            </Typography>
            
            {[5, 4, 3, 2, 1].map((stars) => (
              <RatingDistributionBar
                key={stars}
                stars={stars}
                count={ratingDistribution[stars]}
                total={totalReviews}
              />
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper
        sx={{
          borderRadius: '16px',
          p: 3,
          mb: 3,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Search reviews..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort by</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort by"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="highest">Highest Rating</MenuItem>
                <MenuItem value="lowest">Lowest Rating</MenuItem>
                <MenuItem value="helpful">Most Helpful</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Rating</InputLabel>
              <Select
                value={filterRating}
                onChange={(e) => setFilterRating(e.target.value)}
                label="Filter by Rating"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Ratings</MenuItem>
                <MenuItem value="5">5 Stars</MenuItem>
                <MenuItem value="4">4 Stars</MenuItem>
                <MenuItem value="3">3 Stars</MenuItem>
                <MenuItem value="2">2 Stars</MenuItem>
                <MenuItem value="1">1 Star</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Reviews List */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
          Reviews ({sortedReviews.length})
        </Typography>
        
        {currentReviews.length > 0 ? (
          currentReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))
        ) : (
          <Paper
            sx={{
              borderRadius: '16px',
              p: 6,
              textAlign: 'center',
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              No reviews found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {searchTerm || filterRating !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'No reviews have been submitted yet'
              }
            </Typography>
          </Paper>
        )}
      </Box>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
            size="large"
            sx={{
              '& .MuiPaginationItem-root': {
                borderRadius: '8px',
              },
            }}
          />
        </Box>
      )}

      {/* Review Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
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
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <Flag fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Report Review" />
        </MenuItem>
        {isOwnProfile && selectedReview && (
          <MenuItem onClick={handleMenuClose}>
            <ListItemIcon>
              <Reply fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Respond to Review" />
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default ProfileReviews;