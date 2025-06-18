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
  Rating,
  Collapse
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
  Pending,
  ExpandMore,
  ExpandLess
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
      const result = await bookingAPI.updateBookingStatus(
        statusDialog.booking.id, 
        statusDialog.newStatus
      );
      
      if (result.success) {
        await loadBookings();
        setStatusDialog({ open: false, booking: null, newStatus: '' });
      } else {
        console.error('Failed to update status:', result.message);
      }
    } catch (err) {
      console.error('Error updating status:', err);
    }
  };

  const handleMenuOpen = (event, booking) => {
    setAnchorEl(event.currentTarget);
    setSelectedBooking(booking);
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
      setStatusDialog({ open: true, booking, newStatus });
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
              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {booking.status === 'Pending' && (
                  <>
                    <Button
                      variant="contained"
                      size="small"
                      fullWidth
                      startIcon={<CheckCircle />}
                      onClick={(e) => handleStatusButtonClick(e, 'Confirmed')}
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
                      onClick={(e) => handleStatusButtonClick(e, 'Cancelled')}
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