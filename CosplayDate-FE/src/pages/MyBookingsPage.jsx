// src/pages/MyBookingsPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Schedule,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  MoreVert,
  Message,
  Report,
  PhotoCamera,
  Visibility
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import PageLayout from '../components/layout/PageLayout';
import BookingDetailsDialog from '../components/booking/BookingDetailsDialog';
import BookingCancelDialog from '../components/booking/BookingCancelDialog';
import { bookingAPI } from '../services/bookingAPI';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const MyBookingsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuBooking, setMenuBooking] = useState(null);

  // Get current user
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isCosplayer = user.userType === 'Cosplayer';

  useEffect(() => {
    loadBookings();
  }, [activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      let result;
      switch (activeTab) {
        case 0: // All
          result = await bookingAPI.getBookings();
          break;
        case 1: // Upcoming
          result = await bookingAPI.getUpcomingBookings();
          break;
        case 2: // History
          result = await bookingAPI.getBookingHistory();
          break;
        default:
          result = await bookingAPI.getBookings();
      }
      
      if (result.success) {
        setBookings(Array.isArray(result.data) ? result.data : []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setError('Không thể tải danh sách đặt lịch');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setMenuBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuBooking(null);
  };

  const handleViewDetails = async (booking) => {
    const targetBooking = booking || menuBooking;
    try {
      const result = await bookingAPI.getBookingById(targetBooking.id);
      if (result.success) {
        setSelectedBooking(result.data);
        setDetailsDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to load booking details:', err);
    }
    handleMenuClose();
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking || menuBooking);
    setCancelDialogOpen(true);
    handleMenuClose();
  };

  const handleConfirmBooking = async (booking) => {
    try {
      const result = await bookingAPI.confirmBooking(booking.id);
      if (result.success) {
        loadBookings();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to confirm booking:', err);
      setError('Không thể xác nhận đặt lịch');
    }
  };

  const handleCompleteBooking = async (booking) => {
    try {
      const result = await bookingAPI.completeBooking(booking.id);
      if (result.success) {
        loadBookings();
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Failed to complete booking:', err);
      setError('Không thể hoàn tất đặt lịch');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'dd/MM/yyyy', { locale: vi });
  };

  const getStatusChip = (status) => {
    const statusConfig = {
      Pending: { label: 'Chờ xác nhận', color: 'warning', icon: <HourglassEmpty /> },
      Confirmed: { label: 'Đã xác nhận', color: 'info', icon: <CheckCircle /> },
      Completed: { label: 'Hoàn tất', color: 'success', icon: <CheckCircle /> },
      Cancelled: { label: 'Đã hủy', color: 'error', icon: <Cancel /> }
    };
    
    const config = statusConfig[status] || statusConfig.Pending;
    
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
      />
    );
  };

  const renderBookingCard = (booking) => {
    const isCustomer = !isCosplayer;
    const canCancel = booking.status === 'Pending' && isCustomer;
    const canConfirm = booking.status === 'Pending' && isCosplayer;
    const canComplete = booking.status === 'Confirmed' && isCosplayer;

    return (
      <Grid item xs={12} md={6} key={booking.id}>
        <Card sx={{ 
          borderRadius: '16px',
          border: '1px solid rgba(233, 30, 99, 0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
            transform: 'translateY(-2px)'
          }
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                #{booking.id}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getStatusChip(booking.status)}
                <IconButton 
                  size="small"
                  onClick={(e) => handleMenuOpen(e, booking)}
                >
                  <MoreVert />
                </IconButton>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <Avatar
                src={isCustomer ? booking.cosplayer?.avatar : booking.customer?.avatar}
                sx={{ width: 48, height: 48 }}
              >
                {(isCustomer ? booking.cosplayerName : booking.customerName)?.[0]}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {isCustomer ? booking.cosplayerName : booking.customerName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {booking.serviceType}
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Grid container spacing={1}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Ngày hẹn
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {formatDate(booking.bookingDate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Tổng tiền
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {formatPrice(booking.totalPrice)}
                </Typography>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleViewDetails(booking)}
                startIcon={<Visibility />}
              >
                Chi tiết
              </Button>
              
              {canConfirm && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleConfirmBooking(booking)}
                  startIcon={<CheckCircle />}
                  color="success"
                >
                  Xác nhận
                </Button>
              )}
              
              {canComplete && (
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleCompleteBooking(booking)}
                  startIcon={<PhotoCamera />}
                  color="primary"
                >
                  Hoàn tất
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <PageLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              mb: 4,
              textAlign: 'center',
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {isCosplayer ? 'Lịch hẹn của tôi' : 'Đặt lịch của tôi'}
          </Typography>

          {/* Tabs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Tất cả" />
              <Tab label="Sắp tới" />
              <Tab label="Lịch sử" />
            </Tabs>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '12px' }}
              onClose={() => setError('')}
            >
              {error}
            </Alert>
          )}

          {/* Bookings List */}
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : bookings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Schedule sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Chưa có đặt lịch nào
              </Typography>
              {!isCosplayer && (
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => navigate('/cosplayers')}
                >
                  Khám phá Cosplayer
                </Button>
              )}
            </Box>
          ) : (
            <Grid container spacing={3}>
              {bookings.map(renderBookingCard)}
            </Grid>
          )}

          {/* Action Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleViewDetails()}>
              <Visibility sx={{ mr: 1 }} /> Xem chi tiết
            </MenuItem>
            
            {menuBooking?.status === 'Pending' && !isCosplayer && (
              <MenuItem onClick={() => handleCancelBooking()}>
                <Cancel sx={{ mr: 1 }} /> Hủy đặt lịch
              </MenuItem>
            )}
            
            {(menuBooking?.status === 'Confirmed' || menuBooking?.status === 'Completed') && (
              <MenuItem onClick={() => navigate(`/messages/${menuBooking.id}`)}>
                <Message sx={{ mr: 1 }} /> Nhắn tin
              </MenuItem>
            )}
          </Menu>

          {/* Dialogs */}
          {selectedBooking && (
            <>
              <BookingDetailsDialog
                open={detailsDialogOpen}
                onClose={() => setDetailsDialogOpen(false)}
                booking={selectedBooking}
                isCosplayer={isCosplayer}
              />
              
              <BookingCancelDialog
                open={cancelDialogOpen}
                onClose={() => setCancelDialogOpen(false)}
                booking={selectedBooking}
                onCancelled={loadBookings}
              />
            </>
          )}
        </Container>
      </PageLayout>
    </ThemeProvider>
  );
};

export default MyBookingsPage;