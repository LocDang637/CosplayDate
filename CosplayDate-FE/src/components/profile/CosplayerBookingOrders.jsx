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
  Collapse,
  Rating
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
  Warning,
  Star,
  StarBorder,
  Edit,
  Delete
} from '@mui/icons-material';
import { format, parseISO, differenceInDays, isValid, isBefore, addDays } from 'date-fns';
import { vi } from 'date-fns/locale';
import { bookingAPI } from '../../services/bookingAPI';
import { reviewAPI } from '../../services/reviewAPI';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

const CosplayerBookingOrders = ({ isOwnProfile }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [stats, setStats] = useState({});
  const [bookingReviews, setBookingReviews] = useState({}); // Store reviews by booking ID

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

  // Owner response dialog state
  const [ownerResponseDialog, setOwnerResponseDialog] = useState({
    open: false,
    reviewId: null,
    bookingId: null,
    response: '',
    loading: false,
    mode: 'create', // 'create', 'edit'
    existingResponse: null
  });

  // Error handling states for edit dialog
  const [editErrors, setEditErrors] = useState({
    dateError: '',
    startTimeError: '',
    endTimeError: '',
    locationError: '',
    generalError: ''
  });

  if (!isOwnProfile) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Bạn không có quyền xem thông tin này
        </Typography>
      </Box>
    );
  }

  // Add this function to handle opening edit dialog
  const handleEditBooking = (booking) => {
    // Use the helper function for safe date parsing
    const bookingDate = safeParseDate(booking.bookingDate);

    setEditDialog({
      open: true,
      booking,
      formData: {
        bookingDate: bookingDate,
        startTime: booking.startTime || '', // Should be in "HH:mm" format
        endTime: booking.endTime || '', // Should be in "HH:mm" format
        location: booking.location || '',
        specialNotes: booking.specialNotes || booking.notes || ''
      }
    });
  };

  // Add this function to handle updating booking
  const handleUpdateBooking = async () => {
    if (!editDialog.booking) return;

    // Clear previous errors
    clearEditErrors();

    // Validate all fields
    let hasErrors = false;

    if (!validateEditDate(editDialog.formData.bookingDate)) {
      hasErrors = true;
    }

    if (!validateEditTime(editDialog.formData.startTime, true)) {
      hasErrors = true;
    }

    if (!validateEditTime(editDialog.formData.endTime, false)) {
      hasErrors = true;
    }

    if (!validateEditLocation(editDialog.formData.location)) {
      hasErrors = true;
    }

    // Additional business hours validation
    if (editDialog.formData.startTime && editDialog.formData.endTime) {
      const startHour = parseInt(editDialog.formData.startTime.split(':')[0]);
      const endHour = parseInt(editDialog.formData.endTime.split(':')[0]);
      
      if (startHour < 8 || endHour > 22) {
        setEditErrors(prev => ({ ...prev, generalError: 'Thời gian hoạt động từ 8:00 đến 22:00' }));
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    try {
      // Validate date before formatting
      if (!editDialog.formData.bookingDate || !isValid(editDialog.formData.bookingDate)) {
        setEditErrors(prev => ({ ...prev, generalError: 'Ngày không hợp lệ' }));
        return;
      }

      // Format the data according to API requirements
      const updateData = {
        bookingDate: format(editDialog.formData.bookingDate, 'yyyy-MM-dd'), // "2025-06-25" format
        startTime: editDialog.formData.startTime, // Should already be in "HH:mm" format
        endTime: editDialog.formData.endTime, // Should already be in "HH:mm" format
        location: editDialog.formData.location.trim(),
        specialNotes: editDialog.formData.specialNotes.trim() || ''
      };

      console.log('Updating booking with data:', updateData);

      const result = await bookingAPI.updateBooking(editDialog.booking.id, updateData);

      if (result.success) {
        await loadBookings();
        setEditDialog({ open: false, booking: null, formData: {} });
        clearEditErrors();
        // Optional: Show success message
        console.log('Booking updated successfully');
      } else {
        console.error('Failed to update booking:', result.message);
        setEditErrors(prev => ({ ...prev, generalError: result.message || 'Failed to update booking' }));
      }
    } catch (err) {
      console.error('Error updating booking:', err);
      setEditErrors(prev => ({ ...prev, generalError: 'An error occurred while updating the booking' }));
    }
  };

  // Add validation functions for edit dialog
  const validateEditDate = (date) => {
    if (!date || !isValid(date)) {
      setEditErrors(prev => ({ ...prev, dateError: 'Vui lòng chọn ngày hợp lệ' }));
      return false;
    }
    
    if (isBefore(date, new Date())) {
      setEditErrors(prev => ({ ...prev, dateError: 'Ngày đặt không thể trong quá khứ' }));
      return false;
    }
    
    const maxDate = addDays(new Date(), 30);
    if (date > maxDate) {
      setEditErrors(prev => ({ ...prev, dateError: 'Chỉ có thể đặt lịch trong vòng 30 ngày' }));
      return false;
    }
    
    setEditErrors(prev => ({ ...prev, dateError: '' }));
    return true;
  };

  const validateEditTime = (time, isStartTime) => {
    if (!time) {
      const errorField = isStartTime ? 'startTimeError' : 'endTimeError';
      const errorMessage = isStartTime ? 'Vui lòng chọn giờ bắt đầu' : 'Vui lòng chọn giờ kết thúc';
      setEditErrors(prev => ({ ...prev, [errorField]: errorMessage }));
      return false;
    }

    const hour = parseInt(time.split(':')[0]);
    if (hour < 8 || hour > 22) {
      const errorField = isStartTime ? 'startTimeError' : 'endTimeError';
      setEditErrors(prev => ({ ...prev, [errorField]: 'Thời gian hoạt động từ 8:00 đến 22:00' }));
      return false;
    }

    // If both times are set, validate that end time is after start time
    if (!isStartTime && editDialog.formData.startTime) {
      const startTime = editDialog.formData.startTime;
      if (time <= startTime) {
        setEditErrors(prev => ({ ...prev, endTimeError: 'Giờ kết thúc phải sau giờ bắt đầu' }));
        return false;
      }
    }

    const errorField = isStartTime ? 'startTimeError' : 'endTimeError';
    setEditErrors(prev => ({ ...prev, [errorField]: '' }));
    return true;
  };

  const validateEditLocation = (location) => {
    if (!location || location.trim().length < 3) {
      setEditErrors(prev => ({ ...prev, locationError: 'Địa điểm phải có ít nhất 3 ký tự' }));
      return false;
    }
    
    setEditErrors(prev => ({ ...prev, locationError: '' }));
    return true;
  };

  const clearEditErrors = () => {
    setEditErrors({
      dateError: '',
      startTimeError: '',
      endTimeError: '',
      locationError: '',
      generalError: ''
    });
  };

  // Handler functions for owner response
  const handleOpenResponseDialog = (review, bookingId, mode = 'create') => {
    const existingResponse = review?.ownerResponse;
    setOwnerResponseDialog({
      open: true,
      reviewId: review?.id,
      bookingId: bookingId,
      response: existingResponse || '',
      loading: false,
      mode: mode,
      existingResponse: existingResponse
    });
  };

  const handleCloseResponseDialog = () => {
    setOwnerResponseDialog({
      open: false,
      reviewId: null,
      bookingId: null,
      response: '',
      loading: false,
      mode: 'create',
      existingResponse: null
    });
  };

  const handleResponseChange = (e) => {
    setOwnerResponseDialog(prev => ({
      ...prev,
      response: e.target.value
    }));
  };

  const handleSubmitResponse = async () => {
    if (!ownerResponseDialog.response.trim()) {
      return;
    }

    setOwnerResponseDialog(prev => ({ ...prev, loading: true }));

    try {
      let result;
      
      if (ownerResponseDialog.mode === 'edit') {
        // Update existing response
        result = await reviewAPI.updateOwnerResponse(
          ownerResponseDialog.reviewId,
          ownerResponseDialog.response.trim()
        );
      } else {
        // Create new response
        result = await reviewAPI.addOwnerResponse(
          ownerResponseDialog.reviewId,
          ownerResponseDialog.response.trim()
        );
      }

      if (result.success) {
        // Update the local booking reviews state
        setBookingReviews(prev => ({
          ...prev,
          [ownerResponseDialog.bookingId]: {
            ...prev[ownerResponseDialog.bookingId],
            ownerResponse: ownerResponseDialog.response.trim()
          }
        }));

        // Close the dialog
        handleCloseResponseDialog();
        
        // Show success message (optional)
        console.log(`Owner response ${ownerResponseDialog.mode === 'edit' ? 'updated' : 'added'} successfully`);
      } else {
        console.error(`Failed to ${ownerResponseDialog.mode} owner response:`, result.error);
        // You can add error handling here (e.g., show toast notification)
      }
    } catch (error) {
      console.error(`Error ${ownerResponseDialog.mode === 'edit' ? 'updating' : 'adding'} owner response:`, error);
      // You can add error handling here
    } finally {
      setOwnerResponseDialog(prev => ({ ...prev, loading: false }));
    }
  };

  const handleDeleteResponse = async (reviewId, bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phản hồi này không?')) {
      return;
    }

    try {
      const result = await reviewAPI.deleteOwnerResponse(reviewId);

      if (result.success) {
        // Update the local booking reviews state
        setBookingReviews(prev => ({
          ...prev,
          [bookingId]: {
            ...prev[bookingId],
            ownerResponse: null
          }
        }));

        console.log('Owner response deleted successfully');
      } else {
        console.error('Failed to delete owner response:', result.error);
        // You can add error handling here
      }
    } catch (error) {
      console.error('Error deleting owner response:', error);
      // You can add error handling here
    }
  };

  // Handler functions for edit dialog
  const handleEditDateChange = (newDate) => {
    setEditDialog({
      ...editDialog,
      formData: { ...editDialog.formData, bookingDate: newDate }
    });
    
    if (newDate) {
      validateEditDate(newDate);
    }
  };

  const handleEditStartTimeChange = (e) => {
    const newStartTime = e.target.value;
    setEditDialog({
      ...editDialog,
      formData: { ...editDialog.formData, startTime: newStartTime }
    });
    
    if (newStartTime) {
      validateEditTime(newStartTime, true);
      
      // Re-validate end time if it's already set
      if (editDialog.formData.endTime) {
        validateEditTime(editDialog.formData.endTime, false);
      }
    }
  };

  const handleEditEndTimeChange = (e) => {
    const newEndTime = e.target.value;
    setEditDialog({
      ...editDialog,
      formData: { ...editDialog.formData, endTime: newEndTime }
    });
    
    if (newEndTime) {
      validateEditTime(newEndTime, false);
    }
  };

  const handleEditLocationChange = (e) => {
    const newLocation = e.target.value;
    setEditDialog({
      ...editDialog,
      formData: { ...editDialog.formData, location: newLocation }
    });
    
    if (newLocation) {
      validateEditLocation(newLocation);
    }
  };

  useEffect(() => {
    loadBookings();
  }, [page]); // Only reload when page changes, not filters

  const loadBookingReviews = async (bookingIds) => {
    try {
      console.log('Loading reviews for booking IDs:', bookingIds);
      
      const reviewPromises = bookingIds.map(async (bookingId) => {
        const result = await reviewAPI.getReviewByBookingId(bookingId);
        console.log(`Review result for booking ${bookingId}:`, result);
        return {
          bookingId,
          review: result.success ? result.data : null
        };
      });

      const reviewResults = await Promise.all(reviewPromises);
      const reviewsMap = {};
      
      reviewResults.forEach(({ bookingId, review }) => {
        reviewsMap[bookingId] = review;
      });

      console.log('Final reviewsMap:', reviewsMap);
      // Merge with existing reviews instead of replacing
      setBookingReviews(prev => ({
        ...prev,
        ...reviewsMap
      }));
    } catch (error) {
      console.error('Error loading booking reviews:', error);
    }
  };

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
        const bookingsData = result.data.bookings || [];
        setBookings(bookingsData);

        // Load reviews for completed bookings
        const completedBookingIds = bookingsData
          .filter(booking => booking.status === 'Completed')
          .map(booking => booking.id);
        
        if (completedBookingIds.length > 0) {
          await loadBookingReviews(completedBookingIds);
        }

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

      console.log(`Updating status for booking ${bookingId} to ${statusDialog.newStatus}`);

      // Call appropriate API based on new status
      switch (statusDialog.newStatus) {
        case 'Confirmed':
          result = await bookingAPI.confirmBooking(bookingId);
          break;
        case 'Cancelled':
          // Pass the cancellation reason properly
          result = await bookingAPI.cancelBooking(bookingId, statusDialog.cancellationReason || '');
          break;
        case 'Completed':
          result = await bookingAPI.completeBooking(bookingId);
          break;
        default:
          console.error('Unknown status:', statusDialog.newStatus);
          return;
      }

      if (result.success) {
        await loadBookings();
        
        // If the booking was completed, reload reviews for this booking
        if (statusDialog.newStatus === 'Completed') {
          await loadBookingReviews([bookingId]);
        }
        
        setStatusDialog({ open: false, booking: null, newStatus: '', showConfirm: false, cancellationReason: '' });
        // Optionally show success message
        console.log(`Booking status updated to ${statusDialog.newStatus} successfully`);
      } else {
        console.error('Failed to update status:', result.message);
        setError(result.message || 'Failed to update booking status');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('An error occurred while updating the booking status');
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

  const canUpdateStatus = (booking) => {
    const bookingDate = safeParseDate(booking.bookingDate);
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
      // Allow completion for confirmed bookings
      statuses.push('Completed');
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
    // First check if booking object is valid
    if (!booking || !booking.id) {
      console.warn('Invalid booking object:', booking);
      return false;
    }

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

  // Helper function to safely parse dates
  const safeParseDate = (dateString, fallback = new Date()) => {
    if (!dateString) return fallback;
    try {
      const parsed = parseISO(dateString);
      return isValid(parsed) ? parsed : fallback;
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return fallback;
    }
  };

  // Redesigned BookingCard Component
  const BookingCard = ({ booking }) => {
    const [expanded, setExpanded] = useState(false);
    
    // Use the helper function for safe date parsing
    const bookingDate = safeParseDate(booking.bookingDate);
    const createdDate = safeParseDate(booking.createdAt);
    const daysUntilBooking = booking.bookingDate ? differenceInDays(bookingDate, new Date()) : 0;

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

                {/* Line 4: Status • Payment Status • Total Price • Review Status */}
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
                    {booking.totalPrice?.toLocaleString('vi-VN')} VND
                  </Typography>
                  
                  {/* Show review status for completed bookings */}
                  {booking.status === 'Completed' && (
                    <>
                      <Typography variant="body2" color="text.secondary">•</Typography>
                      {/* Debug: Log the review data in compact view */}
                      {console.log(`Compact view - Review data for booking ${booking.id}:`, bookingReviews[booking.id])}
                      {bookingReviews[booking.id] ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 16, color: '#ffc107' }} />
                          <Typography variant="body2" color="text.secondary">
                            {bookingReviews[booking.id].rating}/5
                          </Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <StarBorder sx={{ fontSize: 16, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            Chưa đánh giá
                          </Typography>
                        </Box>
                      )}
                    </>
                  )}
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

            {/* Review Section - Only show for completed bookings */}
            {booking.status === 'Completed' && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Đánh giá của khách hàng
                </Typography>
                {/* Debug: Log the review data */}
                {console.log(`Review data for booking ${booking.id}:`, bookingReviews[booking.id])}
                {bookingReviews[booking.id] ? (
                  <Paper sx={{ p: 2, bgcolor: 'grey.50', borderRadius: '8px' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Avatar 
                        src={bookingReviews[booking.id].customerAvatarUrl} 
                        sx={{ width: 40, height: 40 }}
                      >
                        {bookingReviews[booking.id].customerName?.charAt(0)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {bookingReviews[booking.id].customerName}
                          </Typography>
                          {bookingReviews[booking.id].isVerified && (
                            <Tooltip title="Verified Customer">
                              <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                            </Tooltip>
                          )}
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Rating 
                            value={bookingReviews[booking.id].rating} 
                            readOnly 
                            size="small"
                            sx={{ color: '#ffc107' }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {bookingReviews[booking.id].rating}/5
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            • {bookingReviews[booking.id].createdAt ? 
                                format(safeParseDate(bookingReviews[booking.id].createdAt), 'dd/MM/yyyy HH:mm') : 
                                'N/A'
                              }
                          </Typography>
                        </Box>
                        
                        {bookingReviews[booking.id].comment && (
                          <Typography variant="body2" sx={{ mb: 1, fontStyle: 'italic' }}>
                            "{bookingReviews[booking.id].comment}"
                          </Typography>
                        )}
                        
                        {bookingReviews[booking.id].tags && bookingReviews[booking.id].tags.length > 0 && (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                            {bookingReviews[booking.id].tags.map((tag, index) => (
                              <Chip 
                                key={index} 
                                label={tag} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.75rem', height: '24px' }}
                              />
                            ))}
                          </Box>
                        )}
                        
                        {bookingReviews[booking.id].ownerResponse ? (
                          <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(233, 30, 99, 0.05)', borderRadius: '4px' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                Phản hồi từ Cosplayer:
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <Tooltip title="Chỉnh sửa phản hồi">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenResponseDialog(bookingReviews[booking.id], booking.id, 'edit');
                                    }}
                                    sx={{ 
                                      p: 0.5, 
                                      color: '#e91e63',
                                      '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.08)' }
                                    }}
                                  >
                                    <Edit sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Xóa phản hồi">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDeleteResponse(bookingReviews[booking.id].id, booking.id);
                                    }}
                                    sx={{ 
                                      p: 0.5, 
                                      color: '#f44336',
                                      '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' }
                                    }}
                                  >
                                    <Delete sx={{ fontSize: 14 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>
                            </Box>
                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                              {bookingReviews[booking.id].ownerResponse}
                            </Typography>
                          </Box>
                        ) : (
                          <Box sx={{ mt: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenResponseDialog(bookingReviews[booking.id], booking.id);
                              }}
                              sx={{
                                borderColor: '#e91e63',
                                color: '#e91e63',
                                borderRadius: '6px',
                                fontSize: '0.75rem',
                                padding: '2px 8px',
                                minWidth: 'auto',
                                '&:hover': {
                                  borderColor: '#d81b60',
                                  backgroundColor: 'rgba(233, 30, 99, 0.08)'
                                }
                              }}
                            >
                              Phản hồi
                            </Button>
                          </Box>
                        )}
                        
                        {bookingReviews[booking.id].helpfulCount > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {bookingReviews[booking.id].helpfulCount} người thấy hữu ích
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  </Paper>
                ) : (
                  <Box sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: '8px',
                    textAlign: 'center',
                    border: '1px dashed #ccc'
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Chưa có đánh giá từ khách hàng
                    </Typography>
                  </Box>
                )}
              </Box>
            )}

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
              sx={{ width: 320 }}
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
                sx={{ width: 150 }}
                onChange={(e) => setFilterPaymentStatus(e.target.value)}
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
                    <Chip size="small" label="Đang tạm giữ" color="warning" />
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
            {/* Show validation errors if they exist */}
            {(editErrors.dateError || editErrors.startTimeError || editErrors.endTimeError || editErrors.locationError || editErrors.generalError) && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: '8px' }}
                onClose={clearEditErrors}
              >
                <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                  Vui lòng kiểm tra lại thông tin:
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                  {editErrors.dateError && <li>{editErrors.dateError}</li>}
                  {editErrors.startTimeError && <li>{editErrors.startTimeError}</li>}
                  {editErrors.endTimeError && <li>{editErrors.endTimeError}</li>}
                  {editErrors.locationError && <li>{editErrors.locationError}</li>}
                  {editErrors.generalError && <li>{editErrors.generalError}</li>}
                </Box>
              </Alert>
            )}

            <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
              <Grid container spacing={2}>
                {/* Date and Time Row */}
                <Grid item xs={4}>
                  <DatePicker
                    label="Ngày đặt"
                    value={editDialog.formData.bookingDate}
                    onChange={handleEditDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: 'outlined',
                        size: 'small',
                        error: !!editErrors.dateError,
                        helperText: editErrors.dateError || '',
                        FormHelperTextProps: {
                          sx: { ml: 0 }
                        }
                      }
                    }}
                    minDate={new Date()}
                    maxDate={addDays(new Date(), 30)}
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
                    onChange={handleEditStartTimeChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    error={!!editErrors.startTimeError}
                    helperText={editErrors.startTimeError || ''}
                    FormHelperTextProps={{
                      sx: { ml: 0 }
                    }}
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
                    onChange={handleEditEndTimeChange}
                    InputLabelProps={{ shrink: true }}
                    inputProps={{ step: 300 }}
                    error={!!editErrors.endTimeError}
                    helperText={editErrors.endTimeError || ''}
                    FormHelperTextProps={{
                      sx: { ml: 0 }
                    }}
                  />
                </Grid>

                {/* Location - Force new row */}
                <Grid item xs={12} sx={{ width: '100%' }}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Địa điểm"
                    value={editDialog.formData.location}
                    onChange={handleEditLocationChange}
                    placeholder="Nhập địa điểm..."
                    error={!!editErrors.locationError}
                    helperText={editErrors.locationError || ''}
                    FormHelperTextProps={{
                      sx: { ml: 0 }
                    }}
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
            onClick={() => {
              setEditDialog({ open: false, booking: null, formData: {} });
              clearEditErrors();
            }}
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
              !editDialog.formData.location ||
              !!editErrors.dateError ||
              !!editErrors.startTimeError ||
              !!editErrors.endTimeError ||
              !!editErrors.locationError ||
              !!editErrors.generalError
            }
            sx={{
              backgroundColor: '#e91e63',
              '&:hover': {
                backgroundColor: '#d81b60'
              },
              '&:disabled': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
                color: 'rgba(0, 0, 0, 0.26)'
              }
            }}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>

      {/* Owner Response Dialog */}
      <Dialog
        open={ownerResponseDialog.open}
        onClose={handleCloseResponseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {ownerResponseDialog.mode === 'edit' ? 'Chỉnh sửa phản hồi' : 'Phản hồi đánh giá'}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Đặt lịch: <strong>{ownerResponseDialog.bookingId}</strong>
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Đánh giá ID: <strong>{ownerResponseDialog.reviewId}</strong>
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Nội dung phản hồi"
            value={ownerResponseDialog.response}
            onChange={handleResponseChange}
            placeholder="Nhập nội dung phản hồi cho đánh giá này..."
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResponseDialog}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!ownerResponseDialog.response.trim() || ownerResponseDialog.loading}
            onClick={(e) => {
              e.stopPropagation();
              handleSubmitResponse();
            }}
          >
            {ownerResponseDialog.loading ? (
              <CircularProgress size={20} />
            ) : (
              ownerResponseDialog.mode === 'edit' ? 'Cập nhật' : 'Gửi phản hồi'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CosplayerBookingOrders;