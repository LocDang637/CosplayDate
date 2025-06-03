import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip
} from '@mui/material';
import { Cancel, Refresh } from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderCode = searchParams.get('orderCode');
  const status = searchParams.get('status');

  const handleTryAgain = () => {
    navigate('/customer-profile', { state: { activeTab: 'wallet' } });
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ 
        minHeight: '100vh', 
        backgroundColor: '#FFF5F5',
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
              background: 'linear-gradient(135deg, #FFEBEE 0%, #FFF5F5 100%)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            <Cancel 
              sx={{ 
                fontSize: 80, 
                color: '#F44336', 
                mb: 2 
              }} 
            />
            
            <Typography variant="h4" sx={{ fontWeight: 700, color: '#F44336', mb: 2 }}>
              Thanh toán thất bại
            </Typography>
            
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
              Giao dịch của bạn đã bị hủy. Không có khoản phí nào được thu.
            </Typography>

            {orderCode && (
              <Box sx={{ 
                backgroundColor: 'rgba(244, 67, 54, 0.1)', 
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
                    backgroundColor: '#F44336',
                    color: 'white',
                    fontWeight: 600,
                  }}
                />
              </Box>
            )}

            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
              Bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
              <Button
                variant="contained"
                startIcon={<Refresh />}
                onClick={handleTryAgain}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                  borderRadius: '12px',
                  flex: 1,
                  py: 1.5,
                }}
              >
                Thử lại
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleBackHome}
                sx={{
                  borderColor: '#F44336',
                  color: '#F44336',
                  borderRadius: '12px',
                  flex: 1,
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(244, 67, 54, 0.05)',
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

export default PaymentFailedPage;