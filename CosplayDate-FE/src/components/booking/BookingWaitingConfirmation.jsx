// src/components/booking/BookingWaitingConfirmation.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Alert,
  LinearProgress
} from '@mui/material';
import {
  HourglassEmpty,
  Home,
  EventNote,
  CheckCircle,
  Cancel
} from '@mui/icons-material';

const BookingWaitingConfirmation = ({ 
  booking, 
  cosplayer, 
  bookingStatus,
  onViewBookings, 
  onBackToHome 
}) => {
  // Show different UI based on current booking status
  const getStatusDisplay = () => {
    switch (bookingStatus) {
      case 'Pending':
        return {
          icon: <HourglassEmpty sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />,
          title: 'Đang chờ xác nhận',
          subtitle: `Đặt lịch của bạn đang chờ ${cosplayer?.displayName} xác nhận`,
          showProgress: true
        };
      case 'Confirmed':
        return {
          icon: <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />,
          title: 'Đã được xác nhận!',
          subtitle: `${cosplayer?.displayName} đã xác nhận lịch hẹn của bạn`,
          showProgress: false
        };
      case 'Cancelled':
        return {
          icon: <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />,
          title: 'Đã bị hủy',
          subtitle: 'Rất tiếc, lịch hẹn của bạn đã bị hủy',
          showProgress: false
        };
      default:
        return {
          icon: <HourglassEmpty sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />,
          title: 'Đang xử lý',
          subtitle: 'Vui lòng chờ trong giây lát...',
          showProgress: true
        };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <Box>
      {/* Status Message */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        {statusDisplay.icon}
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {statusDisplay.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {statusDisplay.subtitle}
        </Typography>
      </Box>

      {/* Loading animation */}
      {statusDisplay.showProgress && (
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <CircularProgress color="primary" />
          </Box>
          <LinearProgress sx={{ maxWidth: 400, mx: 'auto' }} />
        </Box>
      )}

      {/* Information Card */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: bookingStatus === 'Cancelled' 
          ? '1px solid rgba(244, 67, 54, 0.3)' 
          : '1px solid rgba(255, 193, 7, 0.3)',
        backgroundColor: bookingStatus === 'Cancelled'
          ? 'rgba(244, 67, 54, 0.02)'
          : 'rgba(255, 193, 7, 0.02)'
      }}>
        <CardContent>
          {bookingStatus === 'Pending' && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Điều gì sẽ xảy ra tiếp theo?
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2">
                  • Cosplayer sẽ xem xét và xác nhận lịch hẹn của bạn
                </Typography>
                <Typography variant="body2">
                  • Bạn sẽ nhận được thông báo khi cosplayer xác nhận
                </Typography>
                <Typography variant="body2">
                  • Sau khi xác nhận, bạn có thể trao đổi chi tiết với cosplayer
                </Typography>
                <Typography variant="body2">
                  • Số tiền sẽ được giữ tạm thời cho đến khi hoàn tất buổi hẹn
                </Typography>
              </Box>
            </>
          )}
          
          {bookingStatus === 'Cancelled' && (
            <>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin hoàn tiền
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Typography variant="body2">
                  • Số tiền sẽ được hoàn lại vào ví của bạn trong vòng 1-2 giờ
                </Typography>
                <Typography variant="body2">
                  • Bạn có thể kiểm tra lịch sử giao dịch trong phần ví của mình
                </Typography>
                <Typography variant="body2">
                  • Nếu có vấn đề, vui lòng liên hệ hỗ trợ
                </Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Alert */}
      {bookingStatus === 'Pending' && (
        <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="body2">
            Thời gian xác nhận thường trong vòng 1-2 giờ. Nếu cosplayer không xác nhận trong 24 giờ, đặt lịch sẽ tự động hủy và tiền sẽ được hoàn lại vào ví của bạn.
          </Typography>
        </Alert>
      )}
      
      {bookingStatus === 'Cancelled' && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="body2">
            Lịch hẹn đã bị hủy. Tiền của bạn sẽ được hoàn lại sớm.
          </Typography>
        </Alert>
      )}

      {/* Booking Details */}
      {booking && (
        <Card sx={{ mb: 3, borderRadius: '12px' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Thông tin đặt lịch
            </Typography>
            
            <Box sx={{ display: 'grid', gap: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Mã đặt lịch:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {booking.bookingCode || `BK${booking.id}`}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="text.secondary">
                  Tổng thanh toán:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {booking.totalPrice?.toLocaleString('vi-VN')} VND
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onBackToHome}
          startIcon={<Home />}
          sx={{
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1.5
          }}
        >
          Về trang chủ
        </Button>
        
        <Button
          variant="contained"
          size="large"
          onClick={onViewBookings}
          startIcon={<EventNote />}
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
            }
          }}
        >
          Xem chi tiết đặt lịch
        </Button>
      </Box>
    </Box>
  );
};

export default BookingWaitingConfirmation;