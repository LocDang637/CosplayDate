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
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Collapse
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  Search,
  FilterList,
  Message,
  Visibility,
  Phone,
  Email,
  Done,
  Close,
  ExpandMore,
  ExpandLess,
  Warning
} from '@mui/icons-material';
import { format, parseISO, differenceInDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { bookingAPI } from '../../services/bookingAPI';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CosplayerBookingOrders = () => {
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
  const [statusDialog, setStatusDialog] = useState({
    open: false,
    booking: null,
    newStatus: '',
    showConfirm: false,
    cancellationReason: ''
  });

  // Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Add these state variables to CosplayerBookingOrders component
  const [editDialog, setEditDialog] = useState({
    open: false,
    booking: null,
    formData: {
      bookingDate: null,
      startTime: null,
      endTime: null,
      location: '',
      specialNotes: ''
    }
  });

  // Add this function to handle opening edit dialog
  const handleEditBooking = (booking) => {
    setEditDialog({
      open: true,
      booking,
      formData: {
        bookingDate: parseISO(booking.bookingDate),
        startTime: booking.startTime,
        endTime: booking.endTime,
        location: booking.location || '',
        specialNotes: booking.notes || ''
      }
    });
  };

  // Add this function to handle updating booking
  const handleUpdateBooking = async () => {
    if (!editDialog.booking) return;

    try {
      const updateData = {
        bookingDate: format(editDialog.formData.bookingDate, 'yyyy-MM-dd'),
        startTime: editDialog.formData.startTime,
        endTime: editDialog.formData.endTime,
        location: editDialog.formData.location,
        specialNotes: editDialog.formData.specialNotes
      };

      const result = await bookingAPI.updateBooking(editDialog.booking.id, updateData);

      if (result.success) {
        await loadBookings();
        setEditDialog({ open: false, booking: null, formData: {} });
        // Optional: Show success message
      } else {
        console.error('Failed to update booking:', result.message);
        // Optional: Show error message
      }
    } catch (err) {
      console.error('Error updating booking:', err);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page]); // Only reload when page changes, not filters

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        pageSize: 20, // Get more results for client-side filtering
      };

      const result = await bookingAPI.getBookings(params);

      if (result.success && result.data) {
        setBookings(result.data.bookings || []);

        // Parse stats from the response
        setStats({
          total: result.data.stats?.totalBookings || result.data.totalCount || 0,
          pending: result.data.stats?.pendingBookings || 0,
          confirmed: result.data.stats?.confirmedBookings || 0,
          completed: result.data.stats?.completedBookings || 0,
          cancelled: result.data.stats?.cancelledBookings || 0,
          totalRevenue: result.data.stats?.totalRevenue || 0,
          pendingPayments: result.data.stats?.pendingPayments || 0
        });

        // Parse pagination data
        setTotalPages(result.data.totalPages || 1);
        setTotalCount(result.data.totalCount || 0);
        setPage(result.data.currentPage || 1);
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

  const handleStatusUpdate = async () => {
    if (!statusDialog.booking || !statusDialog.newStatus) return;

    try {
      let result;
      const bookingId = statusDialog.booking.id;

      // Call appropriate API based on new status
      switch (statusDialog.newStatus) {
        case 'Confirmed':
          result = await bookingAPI.confirmBooking(bookingId);
          break;
        case 'Cancelled':
          // You might want to add a reason field in the dialog for cancellations
          result = await bookingAPI.cancelBooking(bookingId, statusDialog.cancellationReason || '');
          break;
        case 'Completed':
          result = await bookingAPI.completeBooking(bookingId);
          break;
        default:
          // Fallback to generic update if needed
          result = await bookingAPI.updateBooking(bookingId, { status: statusDialog.newStatus });
      }

      if (result.success) {
        await loadBookings();
        setStatusDialog({ open: false, booking: null, newStatus: '', showConfirm: false });
        // Optionally show success message
      } else {
        console.error('Failed to update status:', result.message);
        // Optionally show error message
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleStatusConfirm = () => {
    if (!statusDialog.booking || !statusDialog.newStatus) return;
    setStatusDialog({ ...statusDialog, showConfirm: true });
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedBooking(null);
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

  const getPaymentStatusColor = (status) => {
    return status === 'Paid' ? 'success' : 'error';
  };

  const canUpdateStatus = (booking) => {
    const bookingDate = parseISO(booking.bookingDate);
    const daysUntilBooking = differenceInDays(bookingDate, new Date());

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
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = (
        booking.bookingCode?.toLowerCase().includes(query) ||
        booking.customer?.name?.toLowerCase().includes(query) ||
        booking.customer?.email?.toLowerCase().includes(query) ||
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
  }).sort((a, b) => {
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

  // Redesigned BookingCard Component
  const BookingCard = ({ booking }) => {
    const [expanded, setExpanded] = useState(false);
    const bookingDate = parseISO(booking.bookingDate);
    const createdDate = parseISO(booking.createdAt);
    const daysUntilBooking = differenceInDays(bookingDate, new Date());

    const handleToggle = () => {
      setExpanded(!expanded);
    };

    const handleStatusButtonClick = (e, newStatus) => {
      e.stopPropagation();
      setStatusDialog({
        open: true,
        booking,
        newStatus,
        showConfirm: false,
        cancellationReason: ''
      });
    };

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
          {/* Summary View - Always visible */}
          <Box onClick={handleToggle}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                {/* Line 1: Customer Name • Service Type */}
                <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {booking.customer?.name} • {booking.serviceType}
                </Typography>

                {/* Line 2: Date | Time • Location */}
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {format(bookingDate, 'dd/MM/yyyy', { locale: vi })} | {booking.startTime} - {booking.endTime} • {booking.location}
                </Typography>

                {/* Line 3: Note (if any) */}
                {booking.notes && (
                  <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mb: 0.5 }}>
                    "{booking.notes}"
                  </Typography>
                )}

                {/* Line 4: Status • Payment Status • Total Price */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Chip
                    label={booking.status}
                    size="small"
                    color={getStatusColor(booking.status)}
                  />
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Chip
                    label={booking.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    size="small"
                    color={getPaymentStatusColor(booking.paymentStatus)}
                  />
                  <Typography variant="body2" color="text.secondary">•</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {booking.totalPrice?.toLocaleString('vi-VN')} VND
                  </Typography>
                </Box>
              </Box>

              {/* Expand/Collapse Icon */}
              <IconButton size="small" sx={{ ml: 1 }}>
                {expanded ? <ExpandLess /> : <ExpandMore />}
              </IconButton>
            </Box>
          </Box>

          {/* Expanded Details */}
          <Collapse in={expanded}>
            <Divider sx={{ my: 2 }} />

            {/* Customer Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Thông tin khách hàng
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar src={booking.customer?.avatarUrl} sx={{ width: 32, height: 32 }}>
                      {booking.customer?.name?.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{booking.customer?.name}</Typography>
                      {booking.customer?.isVerified && (
                        <Tooltip title="Verified Customer">
                          <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                        </Tooltip>
                      )}
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Email sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2">{booking.customer?.email}</Typography>
                  </Box>
                </Grid>
                {booking.customer?.phone && (
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone sx={{ fontSize: 18, color: 'text.secondary' }} />
                      <Typography variant="body2">{booking.customer?.phone}</Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Booking Details */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Chi tiết đặt lịch
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Mã đặt lịch</Typography>
                  <Typography variant="body2">{booking.bookingCode}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Thời lượng</Typography>
                  <Typography variant="body2">{formatDuration(booking.duration)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="caption" color="text.secondary">Ngày tạo</Typography>
                  <Typography variant="body2">
                    {format(createdDate, 'dd/MM/yyyy HH:mm')}
                  </Typography>
                </Grid>
                {booking.paymentMethod && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" color="text.secondary">Phương thức thanh toán</Typography>
                    <Typography variant="body2">{booking.paymentMethod}</Typography>
                  </Grid>
                )}
                {daysUntilBooking > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">Thời gian còn lại</Typography>
                    <Typography variant="body2" color="primary">
                      Còn {daysUntilBooking} ngày
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Action Buttons */}
            {canUpdateStatus(booking) && (
              <Box sx={{ mt: 2 }}>
                {booking.status === 'Pending' && (
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Button
                        size="small"
                        variant="outlined"
                        fullWidth
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditBooking(booking);
                        }}
                        sx={{
                          borderColor: '#e91e63',
                          color: '#e91e63',
                          borderRadius: '8px',
                          '&:hover': {
                            borderColor: '#d81b60',
                            backgroundColor: 'rgba(233, 30, 99, 0.08)'
                          }
                        }}
                      >
                        Chỉnh sửa
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="contained"
                        size="small"
                        fullWidth
                        startIcon={<CheckCircle />}
                        onClick={(e) => handleStatusButtonClick(e, 'Confirmed')}
                        sx={{
                          borderRadius: '8px',
                          backgroundColor: '#e91e63',
                          '&:hover': {
                            backgroundColor: '#d81b60'
                          }
                        }}
                      >
                        Xác nhận
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        variant="outlined"
                        size="small"
                        fullWidth
                        color="error"
                        startIcon={<Close />}
                        onClick={(e) => handleStatusButtonClick(e, 'Cancelled')}
                        sx={{ borderRadius: '8px' }}
                      >
                        Từ chối
                      </Button>
                    </Grid>
                  </Grid>
                )}
                {booking.status === 'Confirmed' && daysUntilBooking <= 0 && (
                  <Button
                    variant="contained"
                    size="small"
                    fullWidth
                    color="success"
                    startIcon={<Done />}
                    onClick={(e) => handleStatusButtonClick(e, 'Completed')}
                    sx={{ borderRadius: '8px' }}
                  >
                    Hoàn thành
                  </Button>
                )}
              </Box>
            )}
          </Collapse>
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
                label="Thanh toán"
              >
                <MenuItem value="">Tất cả</MenuItem>
                <MenuItem value="Paid">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Đã thanh toán" color="success" />
                  </Box>
                </MenuItem>
                <MenuItem value="Unpaid">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip size="small" label="Chưa thanh toán" color="error" />
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
                label={`Trạng thái: ${filterStatus}`}
                onDelete={() => setFilterStatus('')}
                color={getStatusColor(filterStatus)}
              />
            )}
            {filterPaymentStatus && (
              <Chip
                size="small"
                label={`Thanh toán: ${filterPaymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}`}
                onDelete={() => setFilterPaymentStatus('')}
                color={getPaymentStatusColor(filterPaymentStatus)}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            {bookings.length === 0 ? 'Không có đặt lịch nào' : 'Không tìm thấy kết quả phù hợp'}
          </Typography>
          {bookings.length > 0 && (
            <Button
              variant="text"
              onClick={() => {
                setSearchQuery('');
                setFilterStatus('');
                setFilterPaymentStatus('');
              }}
              sx={{ mt: 2 }}
            >
              Xóa bộ lọc
            </Button>
          )}
        </Box>
      ) : (
        <>
          {/* Results count */}
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Hiển thị {filteredBookings.length} trong số {bookings.length} kết quả
            </Typography>
          </Box>

          {filteredBookings.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}

          {/* Pagination - Note: This would need server-side implementation for true pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </>
      )}

      {/* More menu - keeping for potential future use */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
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

      {/* Replace the existing Status Update Dialog with this: */}

      {/* Status Update Dialog */}
      <Dialog
        open={statusDialog.open && !statusDialog.showConfirm}
        onClose={() => setStatusDialog({ open: false, booking: null, newStatus: '', showConfirm: false })}
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
          <Typography variant="body2" sx={{ mb: 2 }}>
            Khách hàng: <strong>{statusDialog.booking?.customer?.name}</strong>
          </Typography>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Trạng thái mới</InputLabel>
            <Select
              value={statusDialog.newStatus}
              onChange={(e) => setStatusDialog({ ...statusDialog, newStatus: e.target.value })}
              label="Trạng thái mới"
            >
              {statusDialog.booking && getAvailableStatuses(statusDialog.booking).map((status) => (
                <MenuItem key={status} value={status}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {status === 'Confirmed' && <CheckCircle color="info" fontSize="small" />}
                    {status === 'Cancelled' && <Cancel color="error" fontSize="small" />}
                    {status === 'Completed' && <Done color="success" fontSize="small" />}
                    {status === 'Confirmed' && 'Xác nhận'}
                    {status === 'Cancelled' && 'Hủy bỏ'}
                    {status === 'Completed' && 'Hoàn thành'}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Add cancellation reason field when cancelling */}
          {statusDialog.newStatus === 'Cancelled' && (
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Lý do hủy (tùy chọn)"
              value={statusDialog.cancellationReason || ''}
              onChange={(e) => setStatusDialog({ ...statusDialog, cancellationReason: e.target.value })}
              placeholder="Nhập lý do hủy đặt lịch..."
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialog({ open: false, booking: null, newStatus: '', showConfirm: false })}>
            Hủy
          </Button>
          <Button
            onClick={handleStatusConfirm}
            variant="contained"
            disabled={!statusDialog.newStatus}
            color={
              statusDialog.newStatus === 'Cancelled' ? 'error' :
                statusDialog.newStatus === 'Completed' ? 'success' :
                  'primary'
            }
          >
            Tiếp tục
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog
        open={statusDialog.showConfirm}
        onClose={() => setStatusDialog({ ...statusDialog, showConfirm: false })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Warning color="warning" />
            Xác nhận thay đổi trạng thái
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Lưu ý: Hành động này không thể hoàn tác!
          </Alert>

          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn chuyển trạng thái đặt lịch <strong>{statusDialog.booking?.bookingCode}</strong> sang:
          </Typography>

          <Paper sx={{ p: 2, bgcolor: 'grey.50', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Typography variant="body2" color="text.secondary">Từ:</Typography>
              <Chip
                label={statusDialog.booking?.status}
                size="small"
                color={getStatusColor(statusDialog.booking?.status)}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">Sang:</Typography>
              <Chip
                label={statusDialog.newStatus}
                size="small"
                color={getStatusColor(statusDialog.newStatus)}
              />
            </Box>
          </Paper>

          {statusDialog.newStatus === 'Cancelled' && statusDialog.cancellationReason && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Lý do hủy:
              </Typography>
              <Typography variant="body2">
                {statusDialog.cancellationReason}
              </Typography>
            </Box>
          )}

          {statusDialog.newStatus === 'Confirmed' && (
            <Alert severity="info">
              Khách hàng sẽ nhận được thông báo xác nhận đặt lịch.
            </Alert>
          )}

          {statusDialog.newStatus === 'Cancelled' && (
            <Alert severity="error">
              Đặt lịch sẽ bị hủy và không thể khôi phục. Khách hàng sẽ được thông báo về việc hủy này.
            </Alert>
          )}

          {statusDialog.newStatus === 'Completed' && (
            <Alert severity="success">
              Đặt lịch sẽ được đánh dấu hoàn thành. Hãy đảm bảo dịch vụ đã được thực hiện.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setStatusDialog({ ...statusDialog, showConfirm: false })}
            color="inherit"
          >
            Quay lại
          </Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            color={
              statusDialog.newStatus === 'Cancelled' ? 'error' :
                statusDialog.newStatus === 'Completed' ? 'success' :
                  'primary'
            }
            startIcon={
              statusDialog.newStatus === 'Confirmed' ? <CheckCircle /> :
                statusDialog.newStatus === 'Cancelled' ? <Cancel /> :
                  statusDialog.newStatus === 'Completed' ? <Done /> :
                    null
            }
          >
            Xác nhận {
              statusDialog.newStatus === 'Confirmed' ? 'xác nhận' :
                statusDialog.newStatus === 'Cancelled' ? 'hủy' :
                  statusDialog.newStatus === 'Completed' ? 'hoàn thành' :
                    'thay đổi'
            }
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={editDialog.open}
        onClose={() => setEditDialog({ open: false, booking: null, formData: {} })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{
          borderBottom: '1px solid #f0f0f0',
          pb: 2
        }}>
          Chỉnh sửa đặt lịch
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <Grid container spacing={2}>
                {/* Date and Time Row */}
                <Grid item xs={4}>
                  <DatePicker
                    label="Ngày đặt"
                    value={editDialog.formData.bookingDate}
                    onChange={(newValue) => {
                      setEditDialog({
                        ...editDialog,
                        formData: { ...editDialog.formData, bookingDate: newValue }
                      });
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        size: 'small',
                        error: !editDialog.formData.bookingDate,
                        helperText: !editDialog.formData.bookingDate ? 'Vui lòng chọn ngày' : ''
                      }
                    }}
                    minDate={new Date()}
                  />
                </Grid>

                {/* Start Time */}
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Giờ bắt đầu"
                    type="time"
                    value={editDialog.formData.startTime || ''}
                    onChange={(e) => {
                      setEditDialog({
                        ...editDialog,
                        formData: { ...editDialog.formData, startTime: e.target.value }
                      });
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    error={!editDialog.formData.startTime}
                    helperText={!editDialog.formData.startTime ? 'Bắt buộc' : ''}
                  />
                </Grid>

                {/* End Time */}
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Giờ kết thúc"
                    type="time"
                    value={editDialog.formData.endTime || ''}
                    onChange={(e) => {
                      setEditDialog({
                        ...editDialog,
                        formData: { ...editDialog.formData, endTime: e.target.value }
                      });
                    }}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    error={!editDialog.formData.endTime}
                    helperText={!editDialog.formData.endTime ? 'Bắt buộc' : ''}
                  />
                </Grid>

                {/* Location - Force new row */}
                <Grid item xs={12} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Địa điểm"
                    value={editDialog.formData.location}
                    onChange={(e) => {
                      setEditDialog({
                        ...editDialog,
                        formData: { ...editDialog.formData, location: e.target.value }
                      });
                    }}
                    placeholder="Nhập địa điểm..."
                    error={!editDialog.formData.location}
                    helperText={!editDialog.formData.location ? 'Vui lòng nhập địa điểm' : ''}
                  />
                </Grid>

                {/* Special Notes - Force new row */}
                <Grid item xs={12} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Ghi chú đặc biệt"
                    value={editDialog.formData.specialNotes}
                    onChange={(e) => {
                      setEditDialog({
                        ...editDialog,
                        formData: { ...editDialog.formData, specialNotes: e.target.value }
                      });
                    }}
                    multiline
                    rows={3}
                    placeholder="Nhập yêu cầu đặc biệt (không bắt buộc)..."
                  />
                </Grid>
              </Grid>
            </LocalizationProvider>
          </Box>
        </DialogContent>
        <DialogActions sx={{
          borderTop: '1px solid #f0f0f0',
          p: 2
        }}>
          <Button
            onClick={() => setEditDialog({ open: false, booking: null, formData: {} })}
            sx={{ color: '#666' }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleUpdateBooking}
            variant="contained"
            disabled={
              !editDialog.formData.bookingDate ||
              !editDialog.formData.startTime ||
              !editDialog.formData.endTime ||
              !editDialog.formData.location
            }
            sx={{
              backgroundColor: '#e91e63',
              '&:hover': {
                backgroundColor: '#d81b60'
              }
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CosplayerBookingOrders;