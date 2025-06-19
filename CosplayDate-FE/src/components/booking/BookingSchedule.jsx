// src/components/booking/BookingSchedule.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import {
  CalendarToday,
  AccessTime,
  Notes,
  ArrowBack,
  AttachMoney,
  LocationOn,
  CheckCircle
} from '@mui/icons-material';
import { format, addDays, isBefore, parse, isValid } from 'date-fns';
import { bookingAPI } from '../../services/bookingAPI';

const BookingSchedule = ({
  cosplayer,
  service,
  selectedDate,
  selectedTimeSlots,
  bookingNote,
  onConfirm,
  onBack
}) => {
  const [date, setDate] = useState(selectedDate || null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState(bookingNote || '');
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Calculate price when date, start time, or end time changes
  useEffect(() => {
    if (date && startTime && endTime && cosplayer?.id) {
      calculatePrice();
    }
  }, [date, startTime, endTime, cosplayer?.id]);

  const calculatePrice = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Format times as HH:mm
      const startTimeStr = format(startTime, 'HH:mm');
      const endTimeStr = format(endTime, 'HH:mm');
      
      const result = await bookingAPI.calculatePrice(
        cosplayer.id,
        startTimeStr,
        endTimeStr
      );
      
      if (result.success) {
        setTotalPrice(result.data);
      } else {
        setError('Không thể tính giá. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Failed to calculate price:', err);
      setError('Không thể tính giá. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    if (!date) {
      setError('Vui lòng chọn ngày');
      return;
    }
    if (!startTime || !endTime) {
      setError('Vui lòng chọn thời gian bắt đầu và kết thúc');
      return;
    }
    if (!location.trim()) {
      setError('Vui lòng nhập địa điểm');
      return;
    }
    
    // Validate end time is after start time
    if (isBefore(endTime, startTime)) {
      setError('Thời gian kết thúc phải sau thời gian bắt đầu');
      return;
    }
    
    setConfirmDialogOpen(true);
  };

  const handleCreateBooking = async () => {
    try {
      setCreating(true);
      setError('');
      
      // Create booking data matching the API structure
      const bookingData = {
        cosplayerId: parseInt(cosplayer.id),
        serviceType: service.name,
        bookingDate: format(date, 'yyyy-MM-dd'),
        startTime: format(startTime, 'HH:mm'),
        endTime: format(endTime, 'HH:mm'),
        location: location.trim(),
        specialNotes: note.trim() || ''
      };

      const result = await bookingAPI.createBooking(bookingData);
      
      if (result.success) {
        setConfirmDialogOpen(false);
        // Pass booking data to parent
        onConfirm(result.data, totalPrice);
      } else {
        setError(result.message || 'Không thể tạo đặt lịch. Vui lòng thử lại.');
      }
    } catch (err) {
      console.error('Booking creation failed:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setCreating(false);
    }
  };

  const isDateDisabled = (date) => {
    // Disable past dates
    return isBefore(date, new Date().setHours(0, 0, 0, 0));
  };

  const formatSelectedDate = () => {
    if (!date) return '';
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <Box>
      {/* Service Summary */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        boxShadow: 'none'
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {service?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {service?.description}
          </Typography>
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 2, borderRadius: '8px' }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        {/* Date Selection */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Chọn ngày:
        </Typography>
        
        <DatePicker
          value={date}
          onChange={setDate}
          shouldDisableDate={isDateDisabled}
          minDate={new Date()}
          maxDate={addDays(new Date(), 30)}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: { mb: 3 }
            }
          }}
        />

        {/* Time Selection */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Chọn thời gian:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Thời gian bắt đầu"
              value={startTime}
              onChange={setStartTime}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime />
                      </InputAdornment>
                    )
                  }
                }
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Thời gian kết thúc"
              value={endTime}
              onChange={setEndTime}
              minTime={startTime}
              slotProps={{
                textField: {
                  fullWidth: true,
                  InputProps: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTime />
                      </InputAdornment>
                    )
                  }
                }
              }}
            />
          </Grid>
        </Grid>

        {/* Location */}
        <Typography variant="h6" sx={{ mt: 3, mb: 2, fontWeight: 600 }}>
          Địa điểm:
        </Typography>
        
        <TextField
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Nhập địa điểm buổi hẹn..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            )
          }}
          sx={{ mb: 3 }}
        />

        {/* Note */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Ghi chú (tùy chọn):
        </Typography>
        
        <TextField
          fullWidth
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập yêu cầu đặc biệt hoặc thông tin thêm..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <Notes />
              </InputAdornment>
            )
          }}
          sx={{ mb: 3 }}
        />
      </LocalizationProvider>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onBack}
          startIcon={<ArrowBack />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5
          }}
        >
          Quay lại
        </Button>
        
        <Button
          variant="contained"
          size="large"
          onClick={handleOpenConfirmDialog}
          startIcon={<CheckCircle />}
          disabled={!date || !startTime || !endTime || !location || loading}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '16px',
            boxShadow: 'none',
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
            },
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
              color: 'rgba(0, 0, 0, 0.26)',
            }
          }}
        >
          Tạo đặt lịch
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !creating && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>
          Xác nhận đặt lịch
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tóm tắt đặt lịch:
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Cosplayer:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {cosplayer?.displayName}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Dịch vụ:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {service?.name}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Ngày:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatSelectedDate()}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Thời gian:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {startTime && format(startTime, 'HH:mm')} - {endTime && format(endTime, 'HH:mm')}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Địa điểm:
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {location}
              </Typography>
            </Grid>
            
            {note && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Ghi chú:
                </Typography>
                <Typography variant="body1">
                  {note}
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  Tổng cộng:
                </Typography>
                <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                  {formatPrice(totalPrice)}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            disabled={creating}
          >
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={handleCreateBooking}
            disabled={creating}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              minWidth: 120
            }}
          >
            {creating ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingSchedule;