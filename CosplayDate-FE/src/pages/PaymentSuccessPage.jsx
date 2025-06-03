import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { CheckCircle, AccountBalanceWallet } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');

  useEffect(() => {
    // Update wallet balance in localStorage if needed
    const updateWalletBalance = async () => {
      try {
        // You can call your wallet balance API here to get updated balance
        // const result = await paymentAPI.getWalletBalance();
        // if (result.success) {
        //   const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        //   const updatedUser = { ...currentUser, walletBalance: result.data.Balance };
        //   localStorage.setItem('user', JSON.stringify(updatedUser));
        // }
      } catch (error) {
        console.error('Failed to update wallet balance:', error);
      }
    };

    updateWalletBalance();
  }, []);

  const handleViewWallet = () => {
    navigate('/customer-profile', { state: { activeTab: 'wallet' } });
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#F0F8FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Container maxWidth="sm">
          <Paper
            sx={{
              borderRadius: '24px',
              p: 4,
              textAlign: 'center',
              background: 'linear-gradient(135deg, #E8F5E8 0%, #F0FFF0 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <CheckCircle 
              sx={{ 
                fontSize: 80, 
                color: '#4CAF50', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4CAF50', mb: 2 }}>
              Thanh toán thành công!
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Số dư ví của bạn đã được cập nhật thành công.
            </Typography>

            {orderCode && (
              <Box sx={{ 
                backgroundColor: 'rgba(76, 175, 80, 0.1)', 
                borderRadius: '12px', 
                p: 2, 
                mb: 3 
              }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Mã đơn hàng:
                </Typography>
                <Chip 
                  label={orderCode}
                  sx={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              Bạn có thể sử dụng số dư này để đặt lịch với các cosplayer!
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                startIcon={<AccountBalanceWallet />}
                onClick={handleViewWallet}
                sx={{
                  background: 'linear-gradient(45deg, #4CAF50, #2196F3)',
                  borderRadius: '12px',
                  flex: 1,
                  py: 1.5,
                }}
              >
                Xem ví của tôi
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleBackHome}
                sx={{
                  borderColor: '#4CAF50',
                  color: '#4CAF50',
                  borderRadius: '12px',
                  flex: 1,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.05)',
                  },
                }}
              >
                Về trang chủ
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default PaymentSuccessPage;