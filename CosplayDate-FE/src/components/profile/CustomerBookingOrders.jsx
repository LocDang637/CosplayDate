// src/components/profile/CustomerBookingOrders.jsx - WITH BOOKING PROGRESS
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
  IconButton,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Collapse,
  Rating,
  Paper
} from '@mui/material';
import {
  Search,
  CheckCircle,
  Cancel,
  ExpandMore,
  ExpandLess,
  AttachMoney,
  Schedule,
  LocationOn,
  Message,
  Star,
  FilterList
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { bookingAPI } from '../../services/bookingAPI';
import { useNavigate } from 'react-router-dom';

const CustomerBookingOrders = () => {
  const navigate = useNavigate();
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

  // Dialog
  const [cancelDialog, setCancelDialog] = useState({
    open: false,
    booking: null,
    reason: ''
  });

  useEffect(() => {
    loadBookings();
  }, [page]); // Only reload when page changes, not filters

  // Recalculate stats whenever bookings change
  useEffect(() => {
    if (bookings.length > 0) {
      const calculatedStats = calculateStatsFromBookings(bookings);
      console.log('Recalculating stats from bookings:', calculatedStats);
      setStats(calculatedStats);
    }
  }, [bookings]);

  // Calculate stats from bookings data
  const calculateStatsFromBookings = (bookingsData) => {
    if (!Array.isArray(bookingsData) || bookingsData.length === 0) {
      return {
        total: 0,
        pending: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0
      };
    }

    return {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'Pending').length,
      confirmed: bookingsData.filter(b => b.status === 'Confirmed').length,
      completed: bookingsData.filter(b => b.status === 'Completed').length,
      cancelled: bookingsData.filter(b => b.status === 'Cancelled').length
    };
  };

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        pageSize: 20, // Get more results for client-side filtering
      };

      console.log('Loading bookings with params:', params);
      const result = await bookingAPI.getBookings(params);
      console.log('Booking API result:', result);

      if (result.success && result.data) {
        // Handle different response structures
        let bookingsData = [];
        let statsData = {};
        let paginationData = {};

        // Check if result.data has bookings array directly
        if (Array.isArray(result.data)) {
          bookingsData = result.data;
        }
        // Check if result.data has nested bookings
        else if (result.data.bookings && Array.isArray(result.data.bookings)) {
          bookingsData = result.data.bookings;
          statsData = result.data.stats || {};
          paginationData = {
            totalPages: result.data.totalPages || 1,
            totalCount: result.data.totalCount || 0,
            currentPage: result.data.currentPage || page
          };
        }
        // Check if result.data has data property with bookings
        else if (result.data.data && Array.isArray(result.data.data)) {
          bookingsData = result.data.data;
        }
        // Check if result.data has data property with nested structure
        else if (result.data.data && result.data.data.bookings) {
          bookingsData = result.data.data.bookings;
          statsData = result.data.data.stats || {};
          paginationData = {
            totalPages: result.data.data.totalPages || 1,
            totalCount: result.data.data.totalCount || 0,
            currentPage: result.data.data.currentPage || page
          };
        }

        console.log('Processed bookings data:', bookingsData);
        console.log('Stats data from API:', statsData);
        console.log('Pagination data:', paginationData);

        // Set the data
        setBookings(bookingsData || []);

        // Calculate stats if not provided by API
        let calculatedStats = {};
        if (Object.keys(statsData).length === 0) {
          // Calculate from bookings data
          calculatedStats = calculateStatsFromBookings(bookingsData);
          console.log('Stats calculated from bookings:', calculatedStats);
        } else {
          // Use API stats with proper property names
          calculatedStats = {
            total: statsData.totalBookings || statsData.total || bookingsData.length || 0,
            pending: statsData.pendingBookings || statsData.pending || 0,
            confirmed: statsData.confirmedBookings || statsData.confirmed || 0,
            completed: statsData.completedBookings || statsData.completed || 0,
            cancelled: statsData.cancelledBookings || statsData.cancelled || 0
          };
          console.log('Stats used from API:', calculatedStats);
        }

        console.log('Final calculated stats:', calculatedStats);
        setStats(calculatedStats);

        // Set pagination
        setTotalPages(paginationData.totalPages || 1);
        setTotalCount(paginationData.totalCount || bookingsData.length || 0);

        console.log('Final bookings count:', bookingsData.length);
      } else {
        console.warn('API response structure unexpected:', result);
        setError(result.message || 'Không thể tải danh sách đặt lịch');
        // Set empty stats as fallback
        setStats(calculateStatsFromBookings([]));
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
      setError('Không thể tải danh sách đặt lịch. Vui lòng thử lại.');
      // Set empty stats as fallback
      setStats(calculateStatsFromBookings([]));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelDialog.booking) return;

    try {
      const result = await bookingAPI.cancelBooking(cancelDialog.booking.id, cancelDialog.reason);

      if (result.success) {
        // Reload bookings to get updated data and stats
        await loadBookings();
        setCancelDialog({ open: false, booking: null, reason: '' });
      } else {
        setError(result.message || 'Không thể hủy đặt lịch');
      }
    } catch (err) {
      console.error('Error cancelling booking:', err);
      setError('Không thể hủy đặt lịch');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'warning';
      case 'Confirmed': return 'info';
      case 'Completed': return 'success';
      case 'Cancelled': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      Pending: 'Chờ xác nhận',
      Confirmed: 'Đã xác nhận',
      Completed: 'Hoàn thành',
      Cancelled: 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'Held': return 'warning';
      case 'Completed': return 'success';
      case 'Refunded': return 'success';
      default: return 'default';
    }
  };

  const getPaymentStatusLabel = (status) => {
    switch (status) {
      case 'Held': return 'Đang tạm giữ';
      case 'Completed': return 'Đã thanh toán';
      case 'Refunded': return 'Đã hoàn tiền';
      default: return status;
    }
  };

  // Client-side filtering and sorting
  const filteredAndSortedBookings = bookings
    .filter(booking => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = (
          booking.bookingCode?.toLowerCase().includes(query) ||
          booking.cosplayer?.displayName?.toLowerCase().includes(query) ||
          booking.cosplayer?.name?.toLowerCase().includes(query) ||
          booking.serviceType?.toLowerCase().includes(query) ||
          booking.location?.toLowerCase().includes(query)
        );
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filterStatus && booking.status !== filterStatus) {
        return false;
      }

      // Payment status filter
      if (filterPaymentStatus && booking.paymentStatus !== filterPaymentStatus) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Sorting logic
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle date strings
      if (sortBy === 'bookingDate' || sortBy === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numeric values
      if (sortBy === 'totalPrice') {
        aValue = Number(aValue) || 0;
        bValue = Number(bValue) || 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const BookingCard = ({ booking }) => {
    const [expanded, setExpanded] = useState(false);

    // Parse booking date properly with error handling
    let bookingDate;
    try {
      bookingDate = parseISO(booking.bookingDate);
    } catch (e) {
      console.error('Error parsing booking date:', e);
      bookingDate = new Date();
    }

    const daysUntilBooking = differenceInDays(bookingDate, new Date());

    const handleToggle = () => {
      setExpanded(!expanded);
    };

    const canCancel = booking.status === 'Pending' ||
      (booking.status === 'Confirmed' && daysUntilBooking > 1);

    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: '12px',
          border: '1px solid rgba(233, 30, 99, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.1)',
          },
        }}
      >
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          {/* Summary View */}
          <Box onClick={handleToggle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                {/* Line 1: Cosplayer Name • Service Type */}
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {booking.cosplayer?.displayName || booking.cosplayer?.name || 'N/A'} • {booking.serviceType || 'N/A'}
                </Typography>

                {/* Line 2: Date | Time • Location */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {format(bookingDate, 'dd/MM/yyyy', { locale: vi })} |
                  {booking.startTime?.substring(0, 5) || 'N/A'} - {booking.endTime?.substring(0, 5) || 'N/A'} • {booking.location || 'N/A'}
                </Typography>

                {/* Line 3: Status • Payment • Price */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={getStatusLabel(booking.status)}
                    size="small"
                    color={getStatusColor(booking.status)}
                  />
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Chip
                    label={getPaymentStatusLabel(booking.paymentStatus)}
                    size="small"
                    color={getPaymentStatusColor(booking.paymentStatus)}
                  />
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: 'VND'
                    }).format(booking.totalPrice || 0)}
                  </Typography>
                </Box>
              </Box>

              {/* Expand/Collapse Icon */}
              <IconButton size="small" onClick={handleToggle}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />

            {/* Cosplayer Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Thông tin Cosplayer
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  cursor: 'pointer',
                  '&:hover': { opacity: 0.8 }
                }}
                onClick={() => navigate(`/profile/${booking.cosplayer?.id}`)}
              >
                <Avatar
                  src={booking.cosplayer?.avatarUrl || booking.cosplayer?.avatar}
                  sx={{ width: 48, height: 48 }}
                >
                  {(booking.cosplayer?.displayName || booking.cosplayer?.name || 'N')?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {booking.cosplayer?.displayName || booking.cosplayer?.name || 'N/A'}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating
                      value={booking.cosplayer?.rating || 0}
                      size="small"
                      readOnly
                    />
                    <Typography variant="body2" color="text.secondary">
                      ({booking.cosplayer?.totalReviews || booking.cosplayer?.reviewCount || 0} đánh giá)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            {/* Booking Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Chi tiết đặt lịch
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Mã đặt lịch</Typography>
                  <Typography variant="body2">{booking.bookingCode || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Thời lượng</Typography>
                  <Typography variant="body2">{booking.duration || 'N/A'} phút</Typography>
                </Grid>
                {(booking.specialNotes || booking.notes) && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Ghi chú</Typography>
                    <Typography variant="body2">{booking.specialNotes || booking.notes}</Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Payment Details */}
            {booking.payments && booking.payments.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Thanh toán
                </Typography>
                {booking.payments.map((payment, index) => (
                  <Box key={index} sx={{
                    p: 1.5,
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '8px',
                    mb: 1
                  }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Mã thanh toán</Typography>
                        <Typography variant="body2">{payment.paymentCode || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Phương thức</Typography>
                        <Typography variant="body2">{payment.paymentMethod || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Trạng thái</Typography>
                        <Typography variant="body2">{payment.status || 'N/A'}</Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">Số tiền</Typography>
                        <Typography variant="body2">
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(payment.amount || 0)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Box>
            )}

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {/* {booking.status === 'Completed' && !booking.review && (
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Star />}
                  onClick={() => navigate(`/review-booking/${booking.id}`)}
                >
                  Đánh giá
                </Button>
              )} */}

              {canCancel && (
                <Button
                  variant="outlined"
                  size="small"
                  color="error"
                  startIcon={<Cancel />}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCancelDialog({
                      open: true,
                      booking,
                      reason: ''
                    });
                  }}
                >
                  Hủy đặt lịch
                </Button>
              )}

              {/* View Progress Button - Show for active bookings */}
              {(booking.status === 'Pending' || booking.status === 'Confirmed') && (
                <Button
                  variant="outlined"
                  size="small"
                  color="primary"
                  startIcon={<Schedule />}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/booking/${booking.cosplayer?.id}?bookingId=${booking.id}`);
                  }}
                >
                  Xem tiến trình
                </Button>
              )}
            </Box>
          </Collapse>
        </CardContent>
      </Card>
    );
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {/* Stats Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              {stats.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tổng đặt lịch
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'warning.main' }}>
              {stats.pending || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Chờ xác nhận
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'info.main' }}>
              {stats.confirmed || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Đã xác nhận
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: '12px' }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'success.main' }}>
              {stats.completed || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hoàn thành
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '12px', border: '1px solid rgba(233, 30, 99, 0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <FilterList sx={{ color: 'text.secondary' }} />
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Bộ lọc
          </Typography>
          {(searchQuery || filterStatus || filterPaymentStatus) && (
            <Button
              size="small"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('');
                setFilterPaymentStatus('');
              }}
              sx={{ ml: 'auto' }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              placeholder="Tìm kiếm theo tên, email, mã đặt..."
              variant="outlined"
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ width: 320 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                sx={{ width: 150 }}
                label="Trạng thái"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Pending">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Chờ xác nhận" color="warning" />
                  </Box>
                </MenuItem>
                <MenuItem value="Confirmed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Đã xác nhận" color="info" />
                  </Box>
                </MenuItem>
                <MenuItem value="Completed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Hoàn thành" color="success" />
                  </Box>
                </MenuItem>
                <MenuItem value="Cancelled">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Đã hủy" color="error" />
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Thanh toán</InputLabel>
              <Select
                value={filterPaymentStatus}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
                sx={{ width: 150 }}
                label="Thanh toán"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Completed">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Đã thanh toán" color="success" />
                  </Box>
                </MenuItem>
                <MenuItem value="Held">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Đang tạm giữ" color="error" />
                  </Box>
                </MenuItem>
                <MenuItem value="Refunded">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Đã hoàn tiền" color="success" />
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Sắp xếp theo</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sắp xếp theo"
              >
                <MenuItem value="bookingDate">Ngày đặt</MenuItem>
                <MenuItem value="createdAt">Ngày tạo</MenuItem>
                <MenuItem value="totalPrice">Giá tiền</MenuItem>
                <MenuItem value="status">Trạng thái</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Thứ tự</InputLabel>
              <Select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                label="Thứ tự"
              >
                <MenuItem value="desc">Mới nhất</MenuItem>
                <MenuItem value="asc">Cũ nhất</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Active filters display */}
        {(searchQuery || filterStatus || filterPaymentStatus) && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              Đang lọc:
            </Typography>
            {searchQuery && (
              <Chip
                size="small"
                label={`Tìm kiếm: "${searchQuery}"`}
                onDelete={() => setSearchQuery('')}
              />
            )}
            {filterStatus && (
              <Chip
                size="small"
                label={`Trạng thái: ${getStatusLabel(filterStatus)}`}
                onDelete={() => setFilterStatus('')}
                color={getStatusColor(filterStatus)}
              />
            )}
            {filterPaymentStatus && (
              <Chip
                size="small"
                label={`Thanh toán: ${getPaymentStatusLabel(filterPaymentStatus)}`}
                onDelete={() => setFilterPaymentStatus('')}
                color={getPaymentStatusColor(filterPaymentStatus)}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Bookings List */}
      {filteredAndSortedBookings.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {searchQuery || filterStatus || filterPaymentStatus ? 'Không tìm thấy đặt lịch nào phù hợp' : 'Không có đặt lịch nào'}
          </Typography>
          {!searchQuery && !filterStatus && !filterPaymentStatus && bookings.length === 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Bạn chưa có đặt lịch nào. Hãy khám phá và đặt lịch với các cosplayer!
            </Typography>
          )}
        </Paper>
      ) : (
        <>
          {filteredAndSortedBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      {/* Cancel Dialog */}
      <Dialog
        open={cancelDialog.open}
        onClose={() => setCancelDialog({ open: false, booking: null, reason: '' })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận hủy đặt lịch</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn hủy đặt lịch này?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Lý do hủy"
            value={cancelDialog.reason}
            onChange={(e) => setCancelDialog({ ...cancelDialog, reason: e.target.value })}
            placeholder="Vui lòng cho chúng tôi biết lý do hủy..."
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setCancelDialog({ open: false, booking: null, reason: '' })}
          >
            Đóng
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelBooking}
            disabled={!cancelDialog.reason.trim()}
          >
            Xác nhận hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerBookingOrders;