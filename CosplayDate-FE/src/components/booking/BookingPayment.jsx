// src/components/booking/BookingPayment.jsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Alert,
  Grid,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CircularProgress
} from '@mui/material';
import {
  AccountBalanceWallet,
  Warning,
  CheckCircle,
  ArrowBack,
  Payment,
  Info,
  AddCircle
} from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const BookingPayment = ({
  cosplayer,
  service,
  selectedDate,
  selectedTimeSlots,
  walletBalance,
  totalAmount,
  onConfirm,
  onBack,
  loading
}) => {
  const navigate = useNavigate();
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Get booking info from selectedTimeSlots
  const bookingInfo = selectedTimeSlots?.[0] || {};
  const actualTotalAmount = bookingInfo.totalPrice || totalAmount || 0;
  const insufficientFunds = walletBalance < actualTotalAmount;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = () => {
    if (!selectedDate) return '';
    return format(selectedDate, 'EEEE, dd/MM/yyyy', { locale: vi });
  };

  const handlePaymentClick = () => {
    if (insufficientFunds) {
      navigate('/payment/topup');
    } else {
      setConfirmDialogOpen(true);
    }
  };

  const handleConfirmPayment = async () => {
    setProcessing(true);
    const success = await onConfirm();
    setProcessing(false);
    
    if (success) {
      setConfirmDialogOpen(false);
    }
  };

  return (
    <Box>
      {/* Wallet Balance */}
      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: insufficientFunds 
          ? '2px solid #f44336' 
          : '1px solid rgba(233, 30, 99, 0.1)',
        boxShadow: 'none'
      }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBalanceWallet 
                sx={{ 
                  fontSize: 40, 
                  color: insufficientFunds ? 'error.main' : 'primary.main' 
                }} 
              />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Số dư ví
                </Typography>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700,
                    color: insufficientFunds ? 'error.main' : 'text.primary'
                  }}
                >
                  {formatPrice(walletBalance)}
                </Typography>
              </Box>
            </Box>
            
            {insufficientFunds && (
              <Button
                variant="contained"
                startIcon={<AddCircle />}
                onClick={() => navigate('/payment/topup')}
                sx={{
                  backgroundColor: 'error.main',
                  '&:hover': { backgroundColor: 'error.dark' }
                }}
              >
                Nạp tiền
              </Button>
            )}
          </Box>
          
          {insufficientFunds && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Số dư không đủ. Bạn cần nạp thêm {formatPrice(actualTotalAmount - walletBalance)} để thực hiện đặt lịch này.
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Booking Summary */}
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Chi tiết đặt lịch:
      </Typography>

      <Card sx={{ 
        mb: 3, 
        borderRadius: '16px',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        boxShadow: 'none'
      }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cosplayer
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {cosplayer?.displayName}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Dịch vụ
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {service?.name}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Giá/slot
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatPrice(service?.price || 0)}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Ngày
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {formatDate()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Thời gian
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {bookingInfo.startTime} - {bookingInfo.endTime}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Địa điểm
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {bookingInfo.location || 'Chưa xác định'}
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Khung giờ
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                <Chip
                  label={`${bookingInfo.startTime} - ${bookingInfo.endTime}`}
                  color="primary"
                  size="small"
                />
              </Box>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Tổng thanh toán:
            </Typography>
            <Typography variant="h4" sx={{ color: 'primary.main', fontWeight: 700 }}>
              {formatPrice(totalAmount)}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Important Notice */}
      <Alert severity="info" icon={<Info />} sx={{ mb: 3, borderRadius: '12px' }}>
        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
          Lưu ý quan trọng:
        </Typography>
        <List dense>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Số tiền sẽ được giữ tạm thời cho đến khi cosplayer xác nhận lịch hẹn"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Bạn có thể hủy và nhận lại tiền trước khi cosplayer xác nhận"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
          <ListItem sx={{ py: 0 }}>
            <ListItemIcon sx={{ minWidth: 30 }}>
              <CheckCircle sx={{ fontSize: 16, color: 'info.main' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Cosplayer sẽ liên hệ với bạn để thỏa thuận chi tiết"
              primaryTypographyProps={{ variant: 'body2' }}
            />
          </ListItem>
        </List>
      </Alert>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          size="large"
          onClick={onBack}
          startIcon={<ArrowBack />}
          disabled={loading || processing}
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
          onClick={handlePaymentClick}
          startIcon={insufficientFunds ? <AddCircle /> : <Payment />}
          disabled={loading || processing}
          sx={{
            background: insufficientFunds 
              ? 'linear-gradient(45deg, #f44336, #d32f2f)'
              : 'linear-gradient(45deg, #E91E63, #9C27B0)',
            color: 'white',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '16px',
            boxShadow: 'none',
            '&:hover': {
              background: insufficientFunds
                ? 'linear-gradient(45deg, #d32f2f, #c62828)'
                : 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
            }
          }}
        >
          {insufficientFunds ? 'Nạp tiền vào ví' : 'Thanh toán'}
        </Button>
      </Box>

      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={() => !processing && setConfirmDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Xác nhận thanh toán
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" icon={<Warning />} sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn thanh toán {formatPrice(totalAmount)} cho đặt lịch này?
          </Alert>
          
          <Typography variant="body2" color="text.secondary">
            Sau khi thanh toán:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemText 
                primary="• Số tiền sẽ được giữ tạm thời"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="• Cosplayer sẽ nhận được thông báo và liên hệ với bạn"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="• Bạn có thể hủy trước khi cosplayer xác nhận"
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={() => setConfirmDialogOpen(false)}
            disabled={processing}
          >
            Hủy
          </Button>
          <Button 
            variant="contained"
            onClick={handleConfirmPayment}
            disabled={processing}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              minWidth: 120
            }}
          >
            {processing ? <CircularProgress size={24} color="inherit" /> : 'Xác nhận'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BookingPayment;