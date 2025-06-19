// src/components/booking/BookingSuccessConfirmation.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip
} from '@mui/material';
import {
  Celebration,
  FavoriteBorder,
  Home,
  EventNote,
  CheckCircle
} from '@mui/icons-material';
import confetti from 'canvas-confetti';

const BookingSuccessConfirmation = ({ booking, cosplayer, onViewBookings, onBackToHome }) => {
  React.useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

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
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Chip label="1" size="small" color="primary" />
              <Typography variant="body2">
                Cosplayer sẽ liên hệ với bạn để trao đổi chi tiết về buổi hẹn
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Chip label="2" size="small" color="primary" />
              <Typography variant="body2">
                Hãy chuẩn bị và đến đúng giờ tại địa điểm đã hẹn
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Chip label="3" size="small" color="primary" />
              <Typography variant="body2">
                Tận hưởng thời gian vui vẻ với cosplayer yêu thích của bạn
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <Chip label="4" size="small" color="primary" />
              <Typography variant="body2">
                Sau buổi hẹn, đừng quên đánh giá để giúp cộng đồng phát triển
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Fun message */}
      <Box sx={{ 
        textAlign: 'center', 
        mb: 4, 
        p: 3,
        borderRadius: '16px',
        background: 'linear-gradient(45deg, rgba(233, 30, 99, 0.1), rgba(156, 39, 176, 0.1))'
      }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
          💕 Lời khuyên nhỏ 💕
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Hãy tôn trọng cosplayer, giữ đúng giờ và tạo ra những kỷ niệm đẹp nhé!
        </Typography>
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