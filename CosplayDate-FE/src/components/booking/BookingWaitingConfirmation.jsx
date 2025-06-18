// src/components/booking/BookingWaitingConfirmation.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import {
  HourglassEmpty,
  Home,
  EventNote
} from '@mui/icons-material';

const BookingWaitingConfirmation = ({ booking, cosplayer, onViewBookings, onBackToHome }) => {
  return (
    <Box>
      {/* Waiting Message */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <HourglassEmpty sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Đang chờ xác nhận
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Đặt lịch của bạn đang chờ {cosplayer?.displayName} xác nhận
        </Typography>
      </Box>

      {/* Loading animation */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
        <CircularProgress color="primary" />
      </Box>

      {/* Information Card */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        backgroundColor: 'rgba(255, 193, 7, 0.02)'
      }}>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Alert */}
      <Alert severity="info" sx={{ mb: 3, borderRadius: '12px' }}>
        <Typography variant="body2">
          Thời gian xác nhận thường trong vòng 1-2 giờ. Nếu cosplayer không xác nhận trong 24 giờ, đặt lịch sẽ tự động hủy và tiền sẽ được hoàn lại vào ví của bạn.
        </Typography>
      </Alert>

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
          Xem đặt lịch của tôi
        </Button>
      </Box>
    </Box>
  );
};

export default BookingWaitingConfirmation;