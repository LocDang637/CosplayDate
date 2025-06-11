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
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi } from 'date-fns/locale';
import {
  CalendarToday,
  AccessTime,
  Notes,
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';
import { bookingAPI } from '../../services/bookingAPI';
import { format, addDays, isBefore, isToday } from 'date-fns';

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
  const [timeSlots, setTimeSlots] = useState(selectedTimeSlots || []);
  const [note, setNote] = useState(bookingNote || '');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Generate time slots for the day
  const generateTimeSlots = () => {
    const slots = [];
    const startHour = 8; // 8 AM
    const endHour = 22; // 10 PM
    const slotDuration = service?.duration || 60; // minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotDuration) {
        if (hour * 60 + minute + slotDuration <= endHour * 60) {
          const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = Math.floor((hour * 60 + minute + slotDuration) / 60);
          const endMinute = (hour * 60 + minute + slotDuration) % 60;
          const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
          
          slots.push({
            id: `${hour}-${minute}`,
            startTime,
            endTime,
            display: `${startTime} - ${endTime}`,
            available: true
          });
        }
      }
    }
    return slots;
  };

  // Load available slots when date changes
  useEffect(() => {
    if (date) {
      loadAvailableSlots();
    }
  }, [date]);

  const loadAvailableSlots = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get available slots from API
      const result = await bookingAPI.getAvailableSlots(
        cosplayer.id, 
        format(date, 'yyyy-MM-dd')
      );
      
      if (result.success) {
        setAvailableSlots(result.data);
      } else {
        // Fallback to generated slots
        const generatedSlots = generateTimeSlots();
        setAvailableSlots(generatedSlots);
      }
    } catch (err) {
      console.error('Failed to load available slots:', err);
      // Fallback to generated slots
      const generatedSlots = generateTimeSlots();
      setAvailableSlots(generatedSlots);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeSlotToggle = (event, newTimeSlots) => {
    setTimeSlots(newTimeSlots || []);
  };

  const handleConfirm = () => {
    if (!date) {
      setError('Vui lòng chọn ngày');
      return;
    }
    if (timeSlots.length === 0) {
      setError('Vui lòng chọn ít nhất một khung giờ');
      return;
    }
    onConfirm(date, timeSlots, note);
  };

  const isDateDisabled = (date) => {
    // Disable past dates
    return isBefore(date, new Date().setHours(0, 0, 0, 0));
  };

  const formatSelectedDate = () => {
    if (!date) return '';
    return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  const calculateTotalDuration = () => {
    return timeSlots.length * (service?.duration || 60);
  };

  const calculateTotalPrice = () => {
    return timeSlots.length * (service?.price || 0);
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip 
              icon={<AccessTime />}
              label={`${service?.duration || 60} phút/slot`}
              variant="outlined"
              size="small"
            />
            <Chip 
              icon={<AttachMoney />}
              label={formatPrice(service?.price || 0)}
              variant="outlined"
              size="small"
            />
          </Box>
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

      {/* Date Selection */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Chọn ngày:
      </Typography>
      
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
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
      </LocalizationProvider>

      {date && (
        <>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Chọn khung giờ:
          </Typography>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <ToggleButtonGroup
              value={timeSlots}
              onChange={handleTimeSlotToggle}
              sx={{ 
                flexWrap: 'wrap',
                gap: 1,
                mb: 3,
                '& .MuiToggleButton-root': {
                  borderRadius: '8px',
                  border: '1px solid rgba(0, 0, 0, 0.12)',
                  m: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }
                }
              }}
              multiple
            >
              {availableSlots.map((slot) => (
                <ToggleButton
                  key={slot.id}
                  value={slot.id}
                  disabled={!slot.available}
                  sx={{ px: 2, py: 1 }}
                >
                  {slot.display}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}

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
            sx={{ mb: 3 }}
          />

          {/* Summary */}
          {timeSlots.length > 0 && (
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
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Ngày đã chọn:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {formatSelectedDate()}
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Số lượng slot:
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {timeSlots.length} slot ({calculateTotalDuration()} phút)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Khung giờ đã chọn:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {timeSlots.map((slotId) => {
                        const slot = availableSlots.find(s => s.id === slotId);
                        return slot ? (
                          <Chip
                            key={slotId}
                            label={slot.display}
                            color="primary"
                            size="small"
                          />
                        ) : null;
                      })}
                    </Box>
                  </Grid>
                  
                  <Grid size={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">
                        Tổng cộng:
                      </Typography>
                      <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 700 }}>
                        {formatPrice(calculateTotalPrice())}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </>
      )}

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
          disabled={!date || timeSlots.length === 0}
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