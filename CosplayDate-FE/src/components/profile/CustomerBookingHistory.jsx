import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  IconButton,
  Divider,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  Event,
  LocationOn,
  AccessTime,
  Person,
  Star,
  Cancel,
  CheckCircle,
  Schedule,
  AttachMoney,
  Message,
  RateReview,
  Refresh,
  CalendarToday,
  PhotoCamera,
  FilterList,
  MoreVert
} from '@mui/icons-material';

const CustomerBookingHistory = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [detailDialog, setDetailDialog] = useState(false);

  const bookingsPerPage = 6;

  // Mock booking data
  const mockBookings = [
    {
      id: 'BK2024001',
      cosplayer: {
        id: 1,
        name: 'Cosplay A',
        avatar: '/src/assets/cosplayer1.png',
        rating: 4.9,
        specialty: 'Anime Cosplay'
      },
      service: 'Photoshoot Session',
      date: '2024-01-15',
      time: '14:00 - 16:00',
      duration: 2,
      location: 'Studio ABC, District 1, HCMC',
      price: 450000,
      status: 'completed',
      paymentStatus: 'paid',
      bookingDate: '2024-01-10T09:30:00',
      hasReview: true,
      myReview: {
        rating: 5,
        comment: 'Amazing photoshoot! Very professional and creative.',
        date: '2024-01-16'
      },
      notes: 'Anime character theme - Naruto cosplay requested'
    },
    {
      id: 'BK2024002',
      cosplayer: {
        id: 2,
        name: 'Cosplay B',
        avatar: '/src/assets/cosplayer2.png',
        rating: 4.8,
        specialty: 'Game Characters'
      },
      service: 'Event Appearance',
      date: '2024-01-20',
      time: '10:00 - 18:00',
      duration: 8,
      location: 'Saigon Exhibition Center',
      price: 1200000,
      status: 'confirmed',
      paymentStatus: 'paid',
      bookingDate: '2024-01-05T15:20:00',
      hasReview: false,
      notes: 'Gaming convention appearance - League of Legends character'
    },
    {
      id: 'BK2024003',
      cosplayer: {
        id: 3,
        name: 'Cosplay C',
        avatar: '/src/assets/cosplayer3.png',
        rating: 4.7,
        specialty: 'Movie Characters'
      },
      service: 'Private Session',
      date: '2024-01-12',
      time: '19:00 - 21:00',
      duration: 2,
      location: 'Coffee Shop XYZ, District 3',
      price: 380000,
      status: 'completed',
      paymentStatus: 'paid',
      bookingDate: '2024-01-08T11:00:00',
      hasReview: true,
      myReview: {
        rating: 4,
        comment: 'Good service, punctual and friendly.',
        date: '2024-01-13'
      },
      notes: 'Casual meetup - Marvel character theme'
    },
    {
      id: 'BK2024004',
      cosplayer: {
        id: 4,
        name: 'Cosplay D',
        avatar: '/src/assets/cosplayer4.png',
        rating: 4.9,
        specialty: 'Original Characters'
      },
      service: 'Convention Appearance',
      date: '2024-01-25',
      time: '09:00 - 17:00',
      duration: 8,
      location: 'Hanoi Convention Center',
      price: 1500000,
      status: 'upcoming',
      paymentStatus: 'paid',
      bookingDate: '2024-01-15T14:45:00',
      hasReview: false,
      notes: 'Anime convention - Original character design requested'
    },
    {
      id: 'BK2024005',
      cosplayer: {
        id: 5,
        name: 'Cosplay E',
        avatar: '/src/assets/cosplayer5.png',
        rating: 4.6,
        specialty: 'Historical Characters'
      },
      service: 'Photoshoot Session',
      date: '2024-01-08',
      time: '16:00 - 18:00',
      duration: 2,
      location: 'Outdoor Location - Nguyen Hue',
      price: 350000,
      status: 'cancelled',
      paymentStatus: 'refunded',
      bookingDate: '2024-01-03T10:15:00',
      hasReview: false,
      notes: 'Weather cancellation - Traditional Vietnamese costume',
      cancellationReason: 'Bad weather conditions'
    },
    {
      id: 'BK2024006',
      cosplayer: {
        id: 6,
        name: 'Cosplay F',
        avatar: '/src/assets/cosplayer6.png',
        rating: 4.8,
        specialty: 'Anime Characters'
      },
      service: 'Workshop Session',
      date: '2024-02-01',
      time: '14:00 - 17:00',
      duration: 3,
      location: 'Cosplay Studio, District 7',
      price: 600000,
      status: 'pending',
      paymentStatus: 'pending',
      bookingDate: '2024-01-18T16:30:00',
      hasReview: false,
      notes: 'Makeup and costume design workshop'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'confirmed': 
      case 'upcoming': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#757575';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle />;
      case 'confirmed':
      case 'upcoming': return <Schedule />;
      case 'pending': return <AccessTime />;
      case 'cancelled': return <Cancel />;
      default: return <Event />;
    }
  };

  const filterBookings = () => {
    let filtered = mockBookings;
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(booking => booking.status === filterStatus);
    }
    
    // Sort bookings
    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      switch (sortBy) {
        case 'date_desc':
          return dateB - dateA;
        case 'date_asc':
          return dateA - dateB;
        case 'price_desc':
          return b.price - a.price;
        case 'price_asc':
          return a.price - b.price;
        default:
          return dateB - dateA;
      }
    });
    
    return filtered;
  };

  const filteredBookings = filterBookings();
  const totalPages = Math.ceil(filteredBookings.length / bookingsPerPage);
  const startIndex = (currentPage - 1) * bookingsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, startIndex + bookingsPerPage);

  const handleReviewSubmit = () => {
    console.log('Review submitted:', {
      bookingId: selectedBooking.id,
      rating: reviewRating,
      comment: reviewComment
    });
    setReviewDialog(false);
    setSelectedBooking(null);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleCancelBooking = (booking) => {
    console.log('Cancel booking:', booking.id);
    // Handle cancellation logic
  };

  const handleRebookCosplayer = (cosplayer) => {
    console.log('Rebook cosplayer:', cosplayer.id);
    // Navigate to booking page
  };

  const canCancelBooking = (booking) => {
    const bookingDate = new Date(booking.date);
    const now = new Date();
    const timeDiff = bookingDate - now;
    const hoursDiff = timeDiff / (1000 * 60 * 60);
    
    return hoursDiff > 24 && (booking.status === 'confirmed' || booking.status === 'upcoming');
  };

  const BookingCard = ({ booking }) => (
    <Card
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              src={booking.cosplayer.avatar}
              sx={{
                width: 56,
                height: 56,
                border: '2px solid rgba(233, 30, 99, 0.1)',
              }}
            />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '18px' }}>
                {booking.cosplayer.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                {booking.cosplayer.specialty}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating value={booking.cosplayer.rating} size="small" readOnly />
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
                  ({booking.cosplayer.rating})
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              icon={getStatusIcon(booking.status)}
              label={booking.status}
              sx={{
                backgroundColor: getStatusColor(booking.status),
                color: 'white',
                fontWeight: 600,
                textTransform: 'capitalize',
              }}
            />
            <IconButton size="small">
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        {/* Booking Details */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
            {booking.service}
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">
                  {new Date(booking.date).toLocaleDateString('vi-VN')}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2">{booking.time}</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontSize: '12px' }}>
                  {booking.location}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {formatCurrency(booking.price)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Notes */}
        {booking.notes && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2, 
              borderRadius: '8px',
              '& .MuiAlert-message': { fontSize: '12px' }
            }}
          >
            {booking.notes}
          </Alert>
        )}

        {/* Cancellation Reason */}
        {booking.cancellationReason && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2, 
              borderRadius: '8px',
              '& .MuiAlert-message': { fontSize: '12px' }
            }}
          >
            Cancelled: {booking.cancellationReason}
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Person />}
            onClick={() => {
              setSelectedBooking(booking);
              setDetailDialog(true);
            }}
            sx={{
              borderColor: 'primary.main',
              color: 'primary.main',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Details
          </Button>

          {booking.status === 'completed' && !booking.hasReview && (
            <Button
              size="small"
              variant="contained"
              startIcon={<RateReview />}
              onClick={() => {
                setSelectedBooking(booking);
                setReviewDialog(true);
              }}
              sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Review
            </Button>
          )}

          {booking.hasReview && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Star />}
              sx={{
                borderColor: '#FFD700',
                color: '#FFD700',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Reviewed
            </Button>
          )}

          {canCancelBooking(booking) && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={() => handleCancelBooking(booking)}
              sx={{
                borderColor: 'error.main',
                color: 'error.main',
                borderRadius: '8px',
                textTransform: 'none',
              }}
            >
              Cancel
            </Button>
          )}

          <Button
            size="small"
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => handleRebookCosplayer(booking.cosplayer)}
            sx={{
              borderColor: 'success.main',
              color: 'success.main',
              borderRadius: '8px',
              textTransform: 'none',
            }}
          >
            Rebook
          </Button>
        </Box>

        {/* Progress Bar for Upcoming Bookings */}
        {booking.status === 'upcoming' && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, fontSize: '12px' }}>
              {Math.ceil((new Date(booking.date) - new Date()) / (1000 * 60 * 60 * 24))} days until booking
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.max(0, 100 - (new Date(booking.date) - new Date()) / (1000 * 60 * 60 * 24 * 30) * 100)}
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(233, 30, 99, 0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: 'primary.main',
                  borderRadius: 2,
                },
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header and Filters */}
      <Paper
        sx={{
          borderRadius: '16px',
          p: 3,
          mb: 3,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Booking History ({filteredBookings.length})
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Status Filter"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="confirmed">Confirmed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                sx={{ borderRadius: '12px' }}
              >
                <MenuItem value="date_desc">Date (Newest)</MenuItem>
                <MenuItem value="date_asc">Date (Oldest)</MenuItem>
                <MenuItem value="price_desc">Price (High to Low)</MenuItem>
                <MenuItem value="price_asc">Price (Low to High)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['upcoming', 'completed', 'pending', 'cancelled'].map((status) => {
                const count = mockBookings.filter(b => b.status === status).length;
                return (
                  <Chip
                    key={status}
                    label={`${status} (${count})`}
                    onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                    variant={filterStatus === status ? 'filled' : 'outlined'}
                    sx={{
                      textTransform: 'capitalize',
                      borderColor: getStatusColor(status),
                      color: filterStatus === status ? 'white' : getStatusColor(status),
                      backgroundColor: filterStatus === status ? getStatusColor(status) : 'transparent',
                      '&:hover': {
                        backgroundColor: filterStatus === status ? getStatusColor(status) : 'rgba(233, 30, 99, 0.05)',
                      },
                    }}
                  />
                );
              })}
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Booking Cards Grid */}
      {currentBookings.length > 0 ? (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {currentBookings.map((booking) => (
            <Grid item xs={12} md={6} key={booking.id}>
              <BookingCard booking={booking} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          sx={{
            borderRadius: '16px',
            p: 6,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(233, 30, 99, 0.1)',
            mb: 4,
          }}
        >
          <Event sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            No bookings found
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {filterStatus !== 'all' 
              ? `No bookings with status "${filterStatus}"`
              : 'You haven\'t made any bookings yet'
            }
          </Typography>
          {filterStatus !== 'all' && (
            <Button 
              variant="outlined" 
              onClick={() => setFilterStatus('all')}
              sx={{ borderRadius: '12px' }}
            >
              Clear Filter
            </Button>
          )}
        </Paper>
      )}

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

      {/* Review Dialog */}
      <Dialog
        open={reviewDialog}
        onClose={() => setReviewDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <Star sx={{ fontSize: 32, color: '#FFD700', mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Review Your Experience
          </Typography>
          {selectedBooking && (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {selectedBooking.cosplayer.name} - {selectedBooking.service}
            </Typography>
          )}
        </DialogTitle>
        
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
            How was your experience?
          </Typography>
          
          <Rating
            value={reviewRating}
            onChange={(e, newValue) => setReviewRating(newValue)}
            size="large"
            sx={{ mb: 3 }}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Share your experience"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Tell others about your experience with this cosplayer..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
          />
        </DialogContent>
        
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setReviewDialog(false)}
            sx={{ borderRadius: '12px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleReviewSubmit}
            disabled={!reviewComment.trim()}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              borderRadius: '12px',
              px: 3,
            }}
          >
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>

      {/* Booking Detail Dialog */}
      <Dialog
        open={detailDialog}
        onClose={() => setDetailDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        {selectedBooking && (
          <>
            <DialogTitle sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={selectedBooking.cosplayer.avatar}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Booking Details
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedBooking.id}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Cosplayer Information
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(233, 30, 99, 0.05)', borderRadius: '12px', mb: 2 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {selectedBooking.cosplayer.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {selectedBooking.cosplayer.specialty}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                      <Rating value={selectedBooking.cosplayer.rating} size="small" readOnly />
                      <Typography variant="body2">
                        ({selectedBooking.cosplayer.rating})
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Service Details
                  </Typography>
                  <Box sx={{ p: 2, backgroundColor: 'rgba(233, 30, 99, 0.05)', borderRadius: '12px' }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedBooking.service}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📅 {new Date(selectedBooking.date).toLocaleDateString('vi-VN')}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      ⏰ {selectedBooking.time} ({selectedBooking.duration}h)
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      📍 {selectedBooking.location}
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                      💰 {formatCurrency(selectedBooking.price)}
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Booking Status
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip
                      icon={getStatusIcon(selectedBooking.status)}
                      label={selectedBooking.status}
                      sx={{
                        backgroundColor: getStatusColor(selectedBooking.status),
                        color: 'white',
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        mb: 1
                      }}
                    />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Payment: {selectedBooking.paymentStatus}
                    </Typography>
                  </Box>

                  {selectedBooking.notes && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Special Notes
                      </Typography>
                      <Alert severity="info" sx={{ mb: 2, borderRadius: '8px' }}>
                        {selectedBooking.notes}
                      </Alert>
                    </>
                  )}

                  {selectedBooking.hasReview && selectedBooking.myReview && (
                    <>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                        Your Review
                      </Typography>
                      <Box sx={{ p: 2, backgroundColor: 'rgba(255, 193, 7, 0.1)', borderRadius: '12px' }}>
                        <Rating value={selectedBooking.myReview.rating} size="small" readOnly sx={{ mb: 1 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          "{selectedBooking.myReview.comment}"
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          Reviewed on {new Date(selectedBooking.myReview.date).toLocaleDateString('vi-VN')}
                        </Typography>
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            
            <DialogActions sx={{ p: 3, pt: 1 }}>
              <Button 
                onClick={() => setDetailDialog(false)}
                sx={{ borderRadius: '12px' }}
              >
                Close
              </Button>
              {selectedBooking.status === 'completed' && !selectedBooking.hasReview && (
                <Button
                  variant="contained"
                  startIcon={<RateReview />}
                  onClick={() => {
                    setDetailDialog(false);
                    setReviewDialog(true);
                  }}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    borderRadius: '12px',
                  }}
                >
                  Write Review
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CustomerBookingHistory;