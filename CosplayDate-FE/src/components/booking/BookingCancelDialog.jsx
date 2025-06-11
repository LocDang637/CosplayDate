// src/components/booking/BookingCancelDialog.jsx
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import { bookingAPI } from '../../services/bookingAPI';

const BookingCancelDialog = ({ open, onClose, booking, onCancelled }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCancel = async () => {
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do hủy');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const result = await bookingAPI.cancelBooking(booking.id, reason);
      
      if (result.success) {
        onCancelled();
        onClose();
        setReason('');
      } else {
        setError(result.message || 'Không thể hủy đặt lịch');
      }
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setReason('');
      setError('');
    }
  };

  if (!booking) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Hủy đặt lịch
      </DialogTitle>
      
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Bạn có chắc chắn muốn hủy đặt lịch này? Sau khi hủy, bạn sẽ được hoàn lại tiền vào ví.
        </Alert>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          Vui lòng cho biết lý do hủy:
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Nhập lý do hủy đặt lịch..."
          disabled={loading}
          error={!!error && !reason.trim()}
          helperText={!reason.trim() && error ? 'Lý do hủy là bắt buộc' : ''}
        />
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Đóng
        </Button>
        <Button 
          onClick={handleCancel} 
          color="error"
          variant="contained"
          disabled={loading || !reason.trim()}
        >
          {loading ? <CircularProgress size={24} /> : 'Xác nhận hủy'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BookingCancelDialog;