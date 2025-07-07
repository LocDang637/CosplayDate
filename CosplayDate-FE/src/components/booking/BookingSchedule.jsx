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
  DialogContent,
  Avatar,
  IconButton,
  Fade
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
  CheckCircle,
  Close,
  Person,
  EventNote,
  Info
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
  const [dateError, setDateError] = useState('');
  const [startTimeError, setStartTimeError] = useState('');
  const [endTimeError, setEndTimeError] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // Helper function to clear all errors
  const clearAllErrors = () => {
    setError('');
    setDateError('');
    setStartTimeError('');
    setEndTimeError('');
  };

  // Calculate price when date, start time, or end time changes
  useEffect(() => {
    if (date && startTime && endTime && cosplayer?.id && 
        isValid(date) && isValid(startTime) && isValid(endTime)) {
      // Clear previous time errors when both times are set
      if (startTimeError || endTimeError) {
        setStartTimeError('');
        setEndTimeError('');
      }
      calculatePrice();
    }
  }, [date, startTime, endTime, cosplayer?.id]);

  // Validate date selection
  const validateDate = (selectedDate) => {
    if (!selectedDate) {
      setDateError('Vui lòng chọn ngày');
      return false;
    }

    if (!isValid(selectedDate)) {
      setDateError('Ngày không hợp lệ');
      return false;
    }

    if (isBefore(selectedDate, new Date().setHours(0, 0, 0, 0))) {
      setDateError('Không thể chọn ngày trong quá khứ');
      return false;
    }

    const maxDate = addDays(new Date(), 30);
    if (isBefore(maxDate, selectedDate)) {
      setDateError('Chỉ có thể đặt lịch trong vòng 30 ngày tới');
      return false;
    }

    setDateError('');
    return true;
  };

  // Validate time selection
  const validateTime = (time, isStartTime = true) => {
    if (!time) {
      const errorMessage = isStartTime ? 'Vui lòng chọn thời gian bắt đầu' : 'Vui lòng chọn thời gian kết thúc';
      if (isStartTime) {
        setStartTimeError(errorMessage);
      } else {
        setEndTimeError(errorMessage);
      }
      return false;
    }

    if (!isValid(time)) {
      const errorMessage = isStartTime ? 'Thời gian bắt đầu không hợp lệ' : 'Thời gian kết thúc không hợp lệ';
      if (isStartTime) {
        setStartTimeError(errorMessage);
      } else {
        setEndTimeError(errorMessage);
      }
      return false;
    }

    // If both times are set, validate the relationship
    if (startTime && endTime && !isStartTime) {
      if (isBefore(time, startTime) || time.getTime() === startTime.getTime()) {
        setEndTimeError('Thời gian kết thúc phải sau thời gian bắt đầu');
        return false;
      }

      // Check minimum duration (e.g., at least 1 hour)
      const durationHours = (time.getHours() + time.getMinutes() / 60) - (startTime.getHours() + startTime.getMinutes() / 60);
      if (durationHours < 1) {
        setEndTimeError('Thời gian tối thiểu là 1 giờ');
        return false;
      }

      // Check maximum duration (e.g., max 8 hours)
      if (durationHours > 8) {
        setEndTimeError('Thời gian tối đa là 8 giờ');
        return false;
      }
    }

    if (isStartTime) {
      setStartTimeError('');
      // If end time is already set, validate it again
      if (endTime) {
        validateTime(endTime, false);
      }
    } else {
      setEndTimeError('');
    }
    return true;
  };

  // Handle date change with validation
  const handleDateChange = (newDate) => {
    setDate(newDate);
    if (newDate && validateDate(newDate)) {
      setError(''); // Clear general error if date is valid
    }
  };

  // Handle start time change with validation
  const handleStartTimeChange = (newStartTime) => {
    setStartTime(newStartTime);
    if (newStartTime && validateTime(newStartTime, true)) {
      setError(''); // Clear general error if time is valid
    }
  };

  // Handle end time change with validation
  const handleEndTimeChange = (newEndTime) => {
    setEndTime(newEndTime);
    if (newEndTime && validateTime(newEndTime, false)) {
      setError(''); // Clear general error if time is valid
    }
  };

  const calculatePrice = async () => {
    try {
      setLoading(true);
      setError('');

      // Validate times before formatting
      if (!startTime || !endTime || !isValid(startTime) || !isValid(endTime)) {
        setError('Thời gian không hợp lệ');
        setTotalPrice(0);
        return;
      }

      // Format times as HH:mm for the API
      const startTimeStr = formatTime(startTime);
      const endTimeStr = formatTime(endTime);

      if (!startTimeStr || !endTimeStr) {
        setError('Không thể định dạng thời gian');
        setTotalPrice(0);
        return;
      }

      // Call the calculate-price API
      const result = await bookingAPI.calculatePrice(
        cosplayer.id,
        startTimeStr,
        endTimeStr
      );

      if (result.success) {
        setTotalPrice(result.data);
      } else {
        // Fallback to manual calculation if API fails
        const hours = calculateDuration();
        if (hours > 0) {
          const calculatedPrice = cosplayer.pricePerHour * hours;
          setTotalPrice(calculatedPrice);
        } else {
          setError('Thời gian không hợp lệ');
        }
      }
    } catch (err) {
      console.error('Failed to calculate price:', err);
      // Fallback to manual calculation
      const hours = calculateDuration();
      if (hours > 0) {
        const calculatedPrice = cosplayer.pricePerHour * hours;
        setTotalPrice(calculatedPrice);
      } else {
        setError('Không thể tính giá. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOpenConfirmDialog = () => {
    // Clear all previous errors
    clearAllErrors();

    // Validate all fields
    let hasErrors = false;

    if (!validateDate(date)) {
      hasErrors = true;
    }

    if (!validateTime(startTime, true)) {
      hasErrors = true;
    }

    if (!validateTime(endTime, false)) {
      hasErrors = true;
    }

    if (!location.trim()) {
      setError('Vui lòng nhập địa điểm');
      hasErrors = true;
    }

    // Additional validation for business hours (optional)
    if (startTime && endTime) {
      const startHour = startTime.getHours();
      const endHour = endTime.getHours();
      
      if (startHour < 8 || endHour > 22) {
        setError('Thời gian hoạt động từ 8:00 đến 22:00');
        hasErrors = true;
      }
    }

    if (hasErrors) {
      return;
    }

    setConfirmDialogOpen(true);
  };

  const handleCreateBooking = async () => {
    try {
      setCreating(true);
      setError('');

      // Ensure all required data is valid
      if (!date || !isValid(date)) {
        setError('Vui lòng chọn ngày hợp lệ');
        return;
      }

      if (!startTime || !endTime || !isValid(startTime) || !isValid(endTime)) {
        setError('Vui lòng chọn thời gian bắt đầu và kết thúc hợp lệ');
        return;
      }

      // Create booking request data matching the exact API structure
      const bookingRequestData = {
        cosplayerId: parseInt(cosplayer.id), // Ensure it's a number
        serviceType: service?.serviceName || service?.name || 'General Service',
        bookingDate: format(date, 'yyyy-MM-dd'), // Format: "2025-06-25"
        startTime: formatTime(startTime), // Format: "14:30"
        endTime: formatTime(endTime), // Format: "16:30"
        location: location.trim(),
        specialNotes: note.trim() || '' // Empty string if no notes
      };

      // Validate formatted times
      if (!bookingRequestData.startTime || !bookingRequestData.endTime) {
        setError('Không thể định dạng thời gian. Vui lòng chọn lại.');
        return;
      }

      console.log('Sending booking request data:', bookingRequestData); // Debug log

      const result = await bookingAPI.createBooking(bookingRequestData);

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
    
    // Check if date is valid before formatting
    if (!isValid(date)) {
      console.warn('Invalid date provided to formatSelectedDate:', date);
      return 'Ngày không hợp lệ';
    }
    
    try {
      return format(date, 'EEEE, dd/MM/yyyy', { locale: vi });
    } catch (error) {
      console.error('Error formatting date:', error, date);
      return 'Ngày không hợp lệ';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Calculate duration in hours
  const calculateDuration = () => {
    if (!startTime || !endTime || !isValid(startTime) || !isValid(endTime)) {
      return 0;
    }
    
    try {
      const start = startTime.getHours() + startTime.getMinutes() / 60;
      const end = endTime.getHours() + endTime.getMinutes() / 60;
      return Math.max(0, end - start); // Ensure non-negative result
    } catch (error) {
      console.error('Error calculating duration:', error);
      return 0;
    }
  };

  // Helper function to safely format time
  const formatTime = (time) => {
    if (!time || !isValid(time)) {
      return '';
    }
    try {
      return format(time, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error, time);
      return '';
    }
  };

  // Prepare booking data for confirmation dialog
  const bookingData = {
    cosplayer: {
      name: cosplayer?.displayName,
      avatar: cosplayer?.avatarUrl
    },
    service: service?.serviceName || service?.name,
    date: formatSelectedDate(),
    time: startTime && endTime && isValid(startTime) && isValid(endTime) ?
      `${formatTime(startTime)} - ${formatTime(endTime)}` : '',
    duration: startTime && endTime && isValid(startTime) && isValid(endTime) ? 
      `${calculateDuration()} giờ` : '0 giờ',
    location: location,
    notes: note,
    totalPrice: totalPrice,
    pricePerHour: cosplayer?.pricePerHour || 0
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
            {service?.serviceName || service?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {service?.serviceDescription || service?.description}
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

      {/* Display validation summary if multiple errors exist */}
      {(dateError || startTimeError || endTimeError) && (
        <Alert
          severity="warning"
          sx={{ mb: 2, borderRadius: '8px' }}
          onClose={clearAllErrors}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Vui lòng kiểm tra lại thông tin:
          </Typography>
          <Box component="ul" sx={{ m: 0, pl: 2 }}>
            {dateError && <li>{dateError}</li>}
            {startTimeError && <li>{startTimeError}</li>}
            {endTimeError && <li>{endTimeError}</li>}
          </Box>
        </Alert>
      )}

      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
        {/* Date Selection */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Chọn ngày:
        </Typography>

        <DatePicker
          value={date}
          onChange={handleDateChange}
          shouldDisableDate={isDateDisabled}
          minDate={new Date()}
          maxDate={addDays(new Date(), 30)}
          slotProps={{
            textField: {
              fullWidth: true,
              sx: { mb: 1 },
              error: !!dateError,
              helperText: dateError,
              FormHelperTextProps: {
                sx: { ml: 0 }
              }
            }
          }}
        />

        {/* Show date error if exists */}
        {dateError && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: '8px' }}
            onClose={() => setDateError('')}
          >
            {dateError}
          </Alert>
        )}

        {/* Time Selection */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Chọn thời gian:
        </Typography>

        <Grid container spacing={2} sx={{ mb: 1 }}>
          <Grid item xs={6}>
            <TimePicker
              label="Thời gian bắt đầu"
              value={startTime}
              onChange={handleStartTimeChange}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!startTimeError,
                  helperText: startTimeError,
                  FormHelperTextProps: {
                    sx: { ml: 0 }
                  },
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
          <Grid item xs={6}>
            <TimePicker
              label="Thời gian kết thúc"
              value={endTime}
              onChange={handleEndTimeChange}
              minTime={startTime}
              slotProps={{
                textField: {
                  fullWidth: true,
                  error: !!endTimeError,
                  helperText: endTimeError,
                  FormHelperTextProps: {
                    sx: { ml: 0 }
                  },
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

        {/* Show time errors if they exist */}
        {(startTimeError || endTimeError) && (
          <Alert
            severity="error"
            sx={{ mb: 2, borderRadius: '8px' }}
            onClose={() => {
              setStartTimeError('');
              setEndTimeError('');
            }}
          >
            {startTimeError || endTimeError}
          </Alert>
        )}

        {/* Location Input */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Địa điểm:
        </Typography>

        <TextField
          fullWidth
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Nhập địa điểm gặp mặt"
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOn />
              </InputAdornment>
            )
          }}
        />

        {/* Note Input */}
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Ghi chú (tùy chọn):
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Nhập yêu cầu đặc biệt hoặc ghi chú..."
          sx={{ mb: 3 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" sx={{ alignSelf: 'flex-start', mt: 1 }}>
                <Notes />
              </InputAdornment>
            )
          }}
        />
      </LocalizationProvider>

      {/* Price Summary */}
      {totalPrice > 0 && (
        <Card sx={{
          mb: 3,
          borderRadius: '16px',
          bgcolor: 'rgba(233, 30, 99, 0.05)',
          border: '1px solid rgba(233, 30, 99, 0.1)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: 'primary.main' }} />
                <Typography variant="body1">
                  Tổng chi phí:
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
                {formatPrice(totalPrice)}
              </Typography>
            </Box>
            {loading && (
              <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="caption" color="text.secondary">
                  Đang tính toán...
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={onBack}
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
          onClick={handleOpenConfirmDialog}
          disabled={!date || !startTime || !endTime || !location || loading || !!dateError || !!startTimeError || !!endTimeError}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 4,
            py: 1.5,
            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #D81B60, #8E24AA)',
              boxShadow: '0 6px 16px rgba(233, 30, 99, 0.4)',
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

      {/* New Booking Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !creating && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            overflow: 'visible',
            position: 'relative',
            backgroundImage: 'linear-gradient(to bottom, rgba(233, 30, 99, 0.03), rgba(255, 255, 255, 0))',
          }
        }}
      >
        {/* Success Badge */}
        <Box
          sx={{
            position: 'absolute',
            top: -20,
            left: '50%',
            transform: 'translateX(-50%)',
            bgcolor: 'success.main',
            color: 'white',
            borderRadius: '50%',
            width: 40,
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(76, 175, 80, 0.3)',
          }}
        >
          <CheckCircle />
        </Box>

        {/* Close Button */}
        <IconButton
          onClick={() => setConfirmDialogOpen(false)}
          disabled={creating}
          sx={{
            position: 'absolute',
            right: 12,
            top: 12,
            bgcolor: 'rgba(0, 0, 0, 0.04)',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.08)',
            }
          }}
        >
          <Close />
        </IconButton>

        <DialogContent sx={{ px: 4, py: 4 }}>
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3, mt: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
              Xác nhận đặt lịch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Vui lòng kiểm tra thông tin trước khi xác nhận
            </Typography>
          </Box>

          {/* Error Alert in Dialog */}
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          {/* Main Content */}
          <Box sx={{ bgcolor: 'rgba(0, 0, 0, 0.02)', borderRadius: '16px', p: 3, mb: 3 }}>
            {/* Cosplayer Info */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <Avatar
                src={bookingData.cosplayer.avatar}
                sx={{
                  width: 56,
                  height: 56,
                  border: '3px solid white',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              >
                {bookingData.cosplayer.name?.charAt(0)}
              </Avatar>
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '12px' }}>
                  COSPLAYER
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '18px' }}>
                  {bookingData.cosplayer.name}
                </Typography>
              </Box>
              <Chip
                label={bookingData.service}
                size="small"
                sx={{
                  bgcolor: '#E91E63',
                  color: 'white',
                  fontWeight: 500,
                  borderRadius: '8px'
                }}
              />
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* Booking Details */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Date & Time */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <CalendarToday sx={{ fontSize: 20, color: 'text.secondary', mt: 0.3 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Ngày và giờ
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {bookingData.date}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2">
                      {bookingData.time} ({bookingData.duration})
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Location */}
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <LocationOn sx={{ fontSize: 20, color: 'text.secondary', mt: 0.3 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Địa điểm
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {bookingData.location}
                  </Typography>
                </Box>
              </Box>

              {/* Notes */}
              {bookingData.notes && (
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <EventNote sx={{ fontSize: 20, color: 'text.secondary', mt: 0.3 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Ghi chú
                    </Typography>
                    <Typography variant="body1">
                      {bookingData.notes}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>
          </Box>

          {/* Price Summary */}
          <Box
            sx={{
              bgcolor: 'rgba(233, 30, 99, 0.05)',
              borderRadius: '12px',
              p: 2.5,
              mb: 3,
              border: '1px solid rgba(233, 30, 99, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Đơn giá
              </Typography>
              <Typography variant="body2">
                {formatPrice(bookingData.pricePerHour)}/giờ
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Thời gian
              </Typography>
              <Typography variant="body2">
                {bookingData.duration}
              </Typography>
            </Box>
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Tổng cộng
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: '#E91E63',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5
                }}
              >
                {formatPrice(bookingData.totalPrice)}
              </Typography>
            </Box>
          </Box>

          {/* Info Alert */}
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              p: 2,
              bgcolor: 'info.lighter',
              borderRadius: '12px',
              mb: 3,
              backgroundColor: 'rgba(33, 150, 243, 0.08)'
            }}
          >
            <Info sx={{ fontSize: 20, color: 'info.main', flexShrink: 0, mt: 0.2 }} />
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Sau khi xác nhận, đặt lịch sẽ được gửi đến cosplayer.
              Bạn sẽ nhận thông báo khi cosplayer phản hồi.
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              fullWidth
              onClick={() => setConfirmDialogOpen(false)}
              disabled={creating}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.secondary',
                  bgcolor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              Hủy
            </Button>
            <Button
              variant="contained"
              fullWidth
              onClick={handleCreateBooking}
              disabled={creating}
              sx={{
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                boxShadow: '0 4px 16px rgba(233, 30, 99, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #D81B60, #8E24AA)',
                  boxShadow: '0 6px 20px rgba(233, 30, 99, 0.4)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)'
                }
              }}
            >
              {creating ? (
                <CircularProgress size={24} sx={{ color: 'white' }} />
              ) : (
                'Xác nhận đặt lịch'
              )}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default BookingSchedule;