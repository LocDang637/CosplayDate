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
  InputAdornment
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
  ArrowForward,
  AttachMoney,
  LocationOn
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

  const handleConfirm = () => {
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
    
    // Pass the data in the format expected by the parent
    const bookingData = {
      date,
      startTime: format(startTime, 'HH:mm'),
      endTime: format(endTime, 'HH:mm'),
      location: location.trim(),
      note: note.trim(),
      totalPrice
    };
    
    onConfirm(date, [bookingData], note);
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

        {/* Summary */}
        {date && startTime && endTime && location && (
          <Card sx={{ 
            mb: 3, 
            borderRadius: '12px',
            backgroundColor: 'rgba(233, 30, 99, 0.05)',
            border: '1px solid rgba(233, 30, 99, 0.2)'
          }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Tóm tắt đặt lịch:
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Ngày đã chọn:
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
                    {format(startTime, 'HH:mm')} - {format(endTime, 'HH:mm')}
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
                
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">
                      Tổng cộng:
                    </Typography>
                    {loading ? (
                      <CircularProgress size={24} />
                    ) : (
                      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {formatPrice(totalPrice)}
                      </Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
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
          onClick={handleConfirm}
          endIcon={<ArrowForward />}
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
          Tiếp tục
        </Button>
      </Box>
    </Box>
  );
};

export default BookingSchedule;