// src/components/booking/BookingDetailsDialog.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Grid,
  Chip,
  Divider,
  IconButton
} from '@mui/material';
import {
  Close,
  Person,
  CalendarToday,
  AccessTime,
  LocationOn,
  AttachMoney,
  Notes
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BookingDetailsDialog = ({ open, onClose, booking, isCosplayer }) => {
  if (!booking) return null;

  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
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

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Chi tiết đặt lịch #{booking.id}</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Status */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="text.secondary">
                Trạng thái
              </Typography>
              <Chip 
                label={booking.status}
                color={getStatusColor(booking.status)}
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          {/* Customer/Cosplayer Info */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Person sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                {isCosplayer ? 'Khách hàng' : 'Cosplayer'}
              </Typography>
            </Box>
            <Typography variant="body1">
              {isCosplayer ? booking.customerName : booking.cosplayerName}
            </Typography>
          </Grid>

          {/* Service Type */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Loại dịch vụ
            </Typography>
            <Typography variant="body1">
              {booking.serviceType}
            </Typography>
          </Grid>

          {/* Date & Time */}
          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CalendarToday sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Ngày
              </Typography>
            </Box>
            <Typography variant="body1">
              {formatDate(booking.bookingDate)}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AccessTime sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Thời gian
              </Typography>
            </Box>
            <Typography variant="body1">
              {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
            </Typography>
          </Grid>

          {/* Location */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <LocationOn sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Địa điểm
              </Typography>
            </Box>
            <Typography variant="body1">
              {booking.location || 'Chưa xác định'}
            </Typography>
          </Grid>

          {/* Total Price */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <AttachMoney sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="subtitle2" color="text.secondary">
                Tổng tiền
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {formatPrice(booking.totalPrice)}
            </Typography>
          </Grid>

          {/* Special Notes */}
          {booking.specialNotes && (
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Notes sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Typography variant="subtitle2" color="text.secondary">
                  Ghi chú
                </Typography>
              </Box>
              <Typography variant="body1">
                {booking.specialNotes}
              </Typography>
            </Grid>
          )}

          {/* Cancellation Reason */}
          {booking.cancellationReason && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Lý do hủy
              </Typography>
              <Typography variant="body1" color="error">
                {booking.cancellationReason}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingDetailsDialog;