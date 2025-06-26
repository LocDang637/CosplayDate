// src/components/booking/BookingSuccessConfirmation.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Alert
} from '@mui/material';
import {
  Celebration,
  FavoriteBorder,
  Home,
  EventNote,
  CheckCircle,
  Cancel,
  Error
} from '@mui/icons-material';
import confetti from 'canvas-confetti';

const BookingSuccessConfirmation = ({ 
  booking, 
  cosplayer, 
  bookingStatus,
  onViewBookings, 
  onBackToHome 
}) => {
  React.useEffect(() => {
    // Only show confetti for confirmed bookings
    if (bookingStatus === 'Confirmed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [bookingStatus]);

  // Render different content based on booking status
  if (bookingStatus === 'Cancelled') {
    return (
      <Box>
        {/* Cancellation Message */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Cancel sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Đặt lịch đã bị hủy
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Rất tiếc, {cosplayer?.displayName} đã hủy lịch hẹn này
          </Typography>
        </Box>

        {/* Cancellation Info Card */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: '16px',
          border: '2px solid rgba(244, 67, 54, 0.3)',
          backgroundColor: 'rgba(244, 67, 54, 0.02)'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <Error sx={{ fontSize: 48, color: 'error.main' }} />
            </Box>
            
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
              Thông tin hoàn tiền
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="body2">
                • Số tiền đã thanh toán sẽ được hoàn lại vào ví của bạn
              </Typography>
              <Typography variant="body2">
                • Thời gian hoàn tiền: trong vòng 1-2 giờ
              </Typography>
              <Typography variant="body2">
                • Bạn có thể kiểm tra lịch sử giao dịch trong phần ví
              </Typography>
              <Typography variant="body2">
                • Nếu có vấn đề, vui lòng liên hệ bộ phận hỗ trợ
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Alert */}
        <Alert severity="warning" sx={{ mb: 3, borderRadius: '12px' }}>
          <Typography variant="body2">
            Chúng tôi xin lỗi về sự bất tiện này. Bạn có thể tìm kiếm và đặt lịch với cosplayer khác phù hợp.
          </Typography>
        </Alert>

        {/* Actions */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            onClick={onViewBookings}
            startIcon={<EventNote />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1.5
            }}
          >
            Xem lịch sử đặt hẹn
          </Button>
          
          <Button
            variant="contained"
            size="large"
            onClick={onBackToHome}
            startIcon={<Home />}
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
            Tìm cosplayer khác
          </Button>
        </Box>
      </Box>
    );
  }

  // Default confirmed booking UI
  return (
    <Box>
      {/* Success Message */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Celebration sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Xác nhận thành công!
        </Typography>
        <Typography 
          variant="h5" 
          sx={{ 
            color: 'primary.main',
            fontWeight: 600,
            mb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1
          }}
        >
          <FavoriteBorder /> Chúc bạn có buổi hẹn vui vẻ với cosplayer! <FavoriteBorder />
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {cosplayer?.displayName} đã xác nhận lịch hẹn của bạn
        </Typography>
      </Box>

      {/* Success Card */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: '2px solid rgba(76, 175, 80, 0.3)',
        backgroundColor: 'rgba(76, 175, 80, 0.02)',
        overflow: 'visible'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main' }} />
          </Box>
          
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
            Điều gì sẽ xảy ra tiếp theo?
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2">
              • Bạn có thể liên hệ với cosplayer qua chat để trao đổi chi tiết
            </Typography>
            <Typography variant="body2">
              • Đến đúng giờ và địa điểm đã hẹn
            </Typography>
            <Typography variant="body2">
              • Sau buổi hẹn, hãy xác nhận hoàn thành để cosplayer nhận được thanh toán
            </Typography>
            <Typography variant="body2">
              • Đừng quên đánh giá để giúp cộng đồng phát triển
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Booking Status */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
        <Chip 
          label="Đã xác nhận" 
          color="success" 
          icon={<CheckCircle />}
          sx={{ px: 2, py: 2.5, fontSize: '16px', fontWeight: 600 }}
        />
      </Box>

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

export default BookingSuccessConfirmation;