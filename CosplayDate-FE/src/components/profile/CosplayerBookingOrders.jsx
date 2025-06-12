// src/components/profile/CosplayerBookingOrders.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Badge,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Rating
} from '@mui/material';
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  AttachMoney,
  Person,
  MoreVert,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  Schedule,
  Search,
  FilterList,
  Message,
  Visibility,
  Phone,
  Email,
  Notes,
  Payment,
  Star,
  Done,
  Close,
  Pending
} from '@mui/icons-material';
import { format, parseISO, differenceInHours, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { bookingAPI } from '../../services/bookingAPI';

const CosplayerBookingOrders = ({ isOwnProfile = true }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({});
  
  // Filters
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPaymentStatus, setFilterPaymentStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('bookingDate');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Dialogs
  const [statusDialog, setStatusDialog] = useState({ open: false, booking: null, newStatus: '' });
  const [detailDialog, setDetailDialog] = useState({ open: false, booking: null });
  
  // Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    loadBookings();
  }, [page, filterStatus, filterPaymentStatus, sortBy, sortOrder]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        pageSize: 10,
        status: filterStatus || undefined,
        paymentStatus: filterPaymentStatus || undefined,
        sortBy,
        sortOrder
      };
      
      const result = await bookingAPI.getBookings(params);
      
      if (result.success && result.data) {
        setBookings(result.data.bookings || []);
        setStats(result.data.stats || {});
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.totalCount || 0);
      } else {
        setError(result.message || 'Failed to load bookings');
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Unable to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning';
      case 'confirmed': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <HourglassEmpty />;
      case 'confirmed': return <CheckCircle />;
      case 'completed': return <Done />;
      case 'cancelled': return <Cancel />;
      default: return <Schedule />;
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'paid': return 'success';
      case 'pending': return 'warning';
      case 'failed': return 'error';
      case 'refunded': return 'default';
      default: return 'default';
    }
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleStatusUpdate = async () => {
    if (!statusDialog.booking || !statusDialog.newStatus) return;
    
    try {
      let result;
      switch (statusDialog.newStatus) {
        case 'Confirmed':
          result = await bookingAPI.confirmBooking(statusDialog.booking.id);
          break;
        case 'Completed':
          result = await bookingAPI.completeBooking(statusDialog.booking.id);
          break;
        case 'Cancelled':
          result = await bookingAPI.cancelBooking(statusDialog.booking.id, 'Cancelled by cosplayer');
          break;
        default:
          result = await bookingAPI.updateBooking(statusDialog.booking.id, { 
            status: statusDialog.newStatus 
          });
      }
      
      if (result.success) {
        loadBookings();
        setStatusDialog({ open: false, booking: null, newStatus: '' });
        handleMenuClose();
      } else {
        setError(result.message || 'Failed to update booking status');
      }
    } catch (err) {
      setError('Error updating booking status');
    }
  };

  const canUpdateStatus = (booking) => {
    const bookingDate = parseISO(booking.bookingDate);
    const now = new Date();
    const daysUntilBooking = differenceInDays(bookingDate, now);
    
    // Can't update completed or cancelled bookings
    if (booking.status === 'Completed' || booking.status === 'Cancelled') {
      return false;
    }
    
    // Can confirm pending bookings
    if (booking.status === 'Pending') {
      return true;
    }
    
    // Can complete confirmed bookings if the date has passed
    if (booking.status === 'Confirmed' && daysUntilBooking <= 0) {
      return true;
    }
    
    return false;
  };

  const getAvailableStatuses = (booking) => {
    const statuses = [];
    
    if (booking.status === 'Pending') {
      statuses.push('Confirmed', 'Cancelled');
    } else if (booking.status === 'Confirmed') {
      const bookingDate = parseISO(booking.bookingDate);
      const now = new Date();
      if (bookingDate <= now) {
        statuses.push('Completed');
      }
      statuses.push('Cancelled');
    }
    
    return statuses;
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0 && mins > 0) {
      return `${hours}h ${mins}m`;
    } else if (hours > 0) {
      return `${hours} giờ`;
    } else {
      return `${mins} phút`;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      booking.bookingCode?.toLowerCase().includes(query) ||
      booking.customer?.name?.toLowerCase().includes(query) ||
      booking.customer?.email?.toLowerCase().includes(query) ||
      booking.serviceType?.toLowerCase().includes(query) ||
      booking.location?.toLowerCase().includes(query)
    );
  });

  const BookingCard = ({ booking }) => {
    const bookingDate = parseISO(booking.bookingDate);
    const createdDate = parseISO(booking.createdAt);
    const daysUntilBooking = differenceInDays(bookingDate, new Date());
    
    return (
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={booking.customer?.avatarUrl}
                sx={{
                  width: 48,
                  height: 48,
                  border: '2px solid rgba(233, 30, 99, 0.1)',
                }}
              >
                {booking.customer?.name?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {booking.customer?.name}
                  </Typography>
                  {booking.customer?.isVerified && (
                    <Tooltip title="Verified Customer">
                      <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                    </Tooltip>
                  )}
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {booking.bookingCode} • {booking.customer?.email}
                </Typography>
              </Box>
            </Box>
            
            <IconButton onClick={(e) => handleMenuOpen(e, booking)}>
              <MoreVert />
            </IconButton>
          </Box>

          {/* Service Info */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}>
              {booking.serviceType}
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarToday sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {format(bookingDate, 'EEEE, dd MMMM yyyy', { locale: vi })}
                    {daysUntilBooking > 0 && (
                      <Typography component="span" variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                        (còn {daysUntilBooking} ngày)
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {booking.startTime} - {booking.endTime} ({formatDuration(booking.duration)})
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2">
                    {booking.location}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Special Notes */}
          {booking.specialNotes && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Notes sx={{ fontSize: 18, color: 'text.secondary', mt: 0.5 }} />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                    Ghi chú từ khách hàng:
                  </Typography>
                  <Typography variant="body2">
                    {booking.specialNotes}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Payments */}
          {booking.payments && booking.payments.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Lịch sử thanh toán:
              </Typography>
              <Box sx={{ mt: 1 }}>
                {booking.payments.map((payment) => (
                  <Box key={payment.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Payment sx={{ fontSize: 16, color: 'success.main' }} />
                    <Typography variant="caption">
                      {payment.paymentCode} - {payment.amount.toLocaleString('vi-VN')} VND via {payment.paymentMethod}
                      <Chip 
                        label={payment.status} 
                        size="small" 
                        color="success" 
                        sx={{ ml: 1, height: 16 }} 
                      />
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* Review */}
          {booking.review && (
            <Paper sx={{ p: 2, mb: 2, backgroundColor: 'warning.50', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Star sx={{ fontSize: 18, color: 'warning.main', mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Rating value={booking.review.rating} size="small" readOnly />
                    <Typography variant="caption" color="text.secondary">
                      {format(parseISO(booking.review.createdAt), 'dd/MM/yyyy')}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    "{booking.review.comment}"
                  </Typography>
                </Box>
              </Box>
            </Paper>
          )}

          {/* Status and Price */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                icon={getStatusIcon(booking.status)}
                label={booking.status}
                color={getStatusColor(booking.status)}
                size="small"
                sx={{ fontWeight: 600 }}
              />
              <Chip
                icon={<Payment />}
                label={booking.paymentStatus}
                color={getPaymentStatusColor(booking.paymentStatus)}
                size="small"
                variant="outlined"
              />
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {booking.totalPrice?.toLocaleString('vi-VN')} VND
            </Typography>
          </Box>

          {/* Timestamps */}
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Đặt lúc: {format(createdDate, 'dd/MM/yyyy HH:mm')}
              {booking.updatedAt !== booking.createdAt && (
                <> • Cập nhật: {format(parseISO(booking.updatedAt), 'dd/MM/yyyy HH:mm')}</>
              )}
            </Typography>
          </Box>

          {/* Action Buttons */}
          {canUpdateStatus(booking) && (
            <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
              {booking.status === 'Pending' && (
                <>
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={() => setStatusDialog({ 
                      open: true, 
                      booking, 
                      newStatus: 'Confirmed' 
                    })}
                    sx={{ borderRadius: '8px' }}
                  >
                    Xác nhận
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    color="error"
                    startIcon={<Close />}
                    onClick={() => setStatusDialog({ 
                      open: true, 
                      booking, 
                      newStatus: 'Cancelled' 
                    })}
                    sx={{ borderRadius: '8px' }}
                  >
                    Từ chối
                  </Button>
                </>
              )}
              {booking.status === 'Confirmed' && daysUntilBooking <= 0 && (
                <Button
                  variant="contained"
                  size="small"
                  fullWidth
                  color="success"
                  startIcon={<Done />}
                  onClick={() => setStatusDialog({ 
                    open: true, 
                    booking, 
                    newStatus: 'Completed' 
                  })}
                  sx={{ borderRadius: '8px' }}
                >
                  Hoàn thành
                </Button>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Stats Overview */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats.totalBookings || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng đặt lịch
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Badge badgeContent={stats.pendingBookings || 0} color="warning">
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {stats.confirmedBookings || 0}
              </Typography>
            </Badge>
            <Typography variant="body2" color="text.secondary">
              Đã xác nhận
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'success.main' }}>
              {stats.completedBookings || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hoàn thành
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
              {stats.totalRevenue?.toLocaleString('vi-VN') || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Doanh thu (VND)
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Tìm kiếm theo mã, tên khách hàng, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                label="Trạng thái"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Pending">Chờ xác nhận</MenuItem>
                <MenuItem value="Confirmed">Đã xác nhận</MenuItem>
                <MenuItem value="Completed">Hoàn thành</MenuItem>
                <MenuItem value="Cancelled">Đã hủy</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Thanh toán</InputLabel>
              <Select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                label="Thanh toán"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Paid">Đã thanh toán</MenuItem>
                <MenuItem value="Pending">Chờ thanh toán</MenuItem>
                <MenuItem value="Refunded">Đã hoàn tiền</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sắp xếp"
                sx={{ borderRadius: '8px' }}
              >
                <MenuItem value="bookingDate">Ngày đặt</MenuItem>
                <MenuItem value="createdAt">Ngày tạo</MenuItem>
                <MenuItem value="totalPrice">Giá tiền</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              sx={{ borderRadius: '8px' }}
            >
              {sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

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

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Hiển thị {filteredBookings.length} / {totalCount} đặt lịch
        </Typography>
        {(filterStatus || filterPaymentStatus || searchQuery) && (
          <Button
            size="small"
            onClick={() => {
              setFilterStatus('');
              setFilterPaymentStatus('');
              setSearchQuery('');
            }}
          >
            Xóa bộ lọc
          </Button>
        )}
      </Box>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', borderRadius: '16px' }}>
          <Schedule sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchQuery || filterStatus || filterPaymentStatus 
              ? 'Không tìm thấy đặt lịch phù hợp' 
              : 'Chưa có đặt lịch nào'}
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {filteredBookings.map((booking) => (
            <Grid item xs={12} key={booking.id}>
              <BookingCard booking={booking} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => {
          setDetailDialog({ open: true, booking: selectedBooking });
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 1 }} /> Xem chi tiết
        </MenuItem>
        
        {selectedBooking && canUpdateStatus(selectedBooking) && (
          <MenuItem onClick={() => {
            setStatusDialog({ 
              open: true, 
              booking: selectedBooking, 
              newStatus: '' 
            });
            handleMenuClose();
          }}>
            <CheckCircle sx={{ mr: 1 }} /> Cập nhật trạng thái
          </MenuItem>
        )}
        
        <MenuItem onClick={() => {
          console.log('Message customer', selectedBooking);
          handleMenuClose();
        }}>
          <Message sx={{ mr: 1 }} /> Nhắn tin
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={() => {
          console.log('View customer profile', selectedBooking);
          handleMenuClose();
        }}>
          <Person sx={{ mr: 1 }} /> Xem hồ sơ khách
        </MenuItem>
      </Menu>

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open}
        onClose={() => setStatusDialog({ open: false, booking: null, newStatus: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Cập nhật trạng thái đặt lịch
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Đặt lịch: <strong>{statusDialog.booking?.bookingCode}</strong>
          </Typography>
          <FormControl fullWidth>
            <InputLabel>Trạng thái mới</InputLabel>
            <Select
              value={statusDialog.newStatus}
              onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
              label="Trạng thái mới"
            >
              {statusDialog.booking && getAvailableStatuses(statusDialog.booking).map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, booking: null, newStatus: '' })}>
            Hủy
          </Button>
          <Button 
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!statusDialog.newStatus}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CosplayerBookingOrders;