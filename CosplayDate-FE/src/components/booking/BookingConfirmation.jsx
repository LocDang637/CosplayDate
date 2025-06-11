// src/components/booking/BookingConfirmation.jsx
import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent
} from '@mui/lab';
import {
  CheckCircle,
  Schedule,
  Message,
  CameraAlt,
  AttachMoney,
  Home,
  EventNote,
  LocationOn,
  Person,
  Category,
  CalendarToday,
  AccessTime,
  Info
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

const BookingConfirmation = ({
  booking,
  cosplayer,
  service,
  onViewBookings,
  onBackToHome
}) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return format(new Date(date), 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  const formatTime = (time) => {
    if (!time) return '';
    return time;
  };

  return (
    <Box>
      {/* Success Message */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          Đặt lịch thành công!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Mã đặt lịch: <strong>{booking?.bookingCode || 'BK-' + Date.now()}</strong>
        </Typography>
      </Box>

      {/* Booking Details */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid rgba(76, 175, 80, 0.3)',
        backgroundColor: 'rgba(76, 175, 80, 0.02)'
      }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
            Thông tin đặt lịch
          </Typography>
          
          <Grid container spacing={3}>
            {/* Cosplayer Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Person sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Cosplayer
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {cosplayer?.displayName}
              </Typography>
            </Grid>
            
            {/* Service Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Category sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Dịch vụ
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {service?.name}
              </Typography>
            </Grid>
            
            {/* Date Info */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <CalendarToday sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Ngày hẹn
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatDate(booking?.bookingDate)}
              </Typography>
            </Grid>
            
            {/* Time Slots */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTime sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Khung giờ
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {booking?.timeSlots?.map((slot, index) => (
                  <Chip
                    key={index}
                    label={formatTime(slot)}
                    size="small"
                    color="primary"
                  />
                )) || (
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    Đang chờ xác nhận
                  </Typography>
                )}
              </Box>
            </Grid>
            
            {/* Status */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Schedule sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Trạng thái
                </Typography>
              </Box>
              <Chip 
                label="Chờ xác nhận"
                color="warning"
                size="small"
              />
            </Grid>
            
            {/* Total Amount */}
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AttachMoney sx={{ color: 'text.secondary', fontSize: 20 }} />
                <Typography variant="body2" color="text.secondary">
                  Tổng thanh toán
                </Typography>
              </Box>
              <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 700 }}>
                {formatPrice(booking?.totalAmount || 0)}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Next Steps Timeline */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
        Các bước tiếp theo
      </Typography>
      
      <Paper sx={{ mb: 3, borderRadius: '16px', p: 2 }}>
        <Timeline position="alternate">
          <TimelineItem>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              Bây giờ
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="success">
                <CheckCircle />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Đặt lịch thành công
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Số tiền đã được giữ tạm thời trong ví
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              1-2 giờ
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot color="primary">
                <Schedule />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Cosplayer xác nhận
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cosplayer sẽ xem xét và xác nhận lịch hẹn
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              Sau xác nhận
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <Message />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Trao đổi chi tiết
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Thảo luận về địa điểm, thời gian cụ thể
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              Ngày hẹn
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <CameraAlt />
              </TimelineDot>
              <TimelineConnector />
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Thực hiện buổi hẹn
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cosplayer sẽ chụp ảnh trước và sau buổi hẹn
              </Typography>
            </TimelineContent>
          </TimelineItem>

          <TimelineItem>
            <TimelineOppositeContent color="text.secondary" sx={{ flex: 0.3 }}>
              Sau buổi hẹn
            </TimelineOppositeContent>
            <TimelineSeparator>
              <TimelineDot>
                <AttachMoney />
              </TimelineDot>
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                Hoàn tất thanh toán
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tiền sẽ được chuyển cho cosplayer khi hoàn tất
              </Typography>
            </TimelineContent>
          </TimelineItem>
        </Timeline>
      </Paper>

      {/* Important Notes */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3, borderRadius: '12px' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Lưu ý quan trọng:
        </Typography>
        <List dense sx={{ pl: 2 }}>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Bạn có thể hủy đặt lịch và nhận lại tiền trước khi cosplayer xác nhận"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Cosplayer sẽ chụp ảnh trước và sau buổi hẹn để đảm bảo an toàn cho cả hai bên"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Nếu có vấn đề xảy ra, bạn có thể báo cáo với hệ thống kèm bằng chứng"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Hệ thống sẽ bảo vệ quyền lợi của cả khách hàng và cosplayer"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
      </Alert>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
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
            py: 1.5,
            borderColor: 'primary.main',
            color: 'primary.main',
            '&:hover': {
              borderColor: 'primary.dark',
              backgroundColor: 'rgba(233, 30, 99, 0.05)'
            }
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

export default BookingConfirmation;