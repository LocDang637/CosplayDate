import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
  Chip,
  Divider
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { 
  Cancel, 
  Refresh, 
  Home, 
  SupportAgent,
  Warning
} from '@mui/icons-material';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PaymentFailedPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [failureReason, setFailureReason] = useState('');

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Get failure reason from URL parameters
    const reason = searchParams.get('reason') || 
                  searchParams.get('error') || 
                  searchParams.get('message') || 
                  'Thanh toán không thành công';
    
    setFailureReason(reason);

    console.log('❌ Payment failed parameters:', {
      reason,
      allParams: Object.fromEntries(searchParams.entries())
    });
  }, [searchParams]);

  const handleRetryPayment = () => {
    navigate('/customer-profile?tab=wallet');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Open support chat or navigate to contact page
    window.open('mailto:support@cosplaydate.com?subject=Thanh toán không thành công', '_blank');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  const getFailureMessage = (reason) => {
    switch (reason?.toLowerCase()) {
      case 'cancelled':
      case 'canceled':
        return 'Bạn đã hủy thanh toán';
      case 'timeout':
        return 'Phiên thanh toán đã hết hạn';
      case 'insufficient_funds':
        return 'Số dư tài khoản không đủ';
      case 'card_declined':
        return 'Thẻ của bạn đã bị từ chối';
      case 'network_error':
        return 'Lỗi kết nối mạng';
      default:
        return reason || 'Thanh toán không thành công';
    }
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />
        
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Card
            sx={{
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
            }}
          >
            {/* Failure Header */}
            <Box
              sx={{
                background: 'linear-gradient(135deg, #f44336 0%, #e57373 100%)',
                color: 'white',
                p: 4,
                textAlign: 'center',
              }}
            >
              <Cancel sx={{ fontSize: 80, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Thanh toán thất bại
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.9 }}>
                Giao dịch của bạn không thể hoàn tất
              </Typography>
            </Box>

            <CardContent sx={{ p: 4 }}>
              {/* Failure Reason */}
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3, 
                  borderRadius: '12px',
                  fontSize: '16px',
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                  Lý do thất bại:
                </Typography>
                {getFailureMessage(failureReason)}
              </Alert>

              {/* Status Chip */}
              <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Chip
                  label="Giao dịch thất bại"
                  sx={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    mb: 2,
                  }}
                />
                
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Thời gian: {new Date().toLocaleString('vi-VN')}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              {/* What to do next */}
              <Box
                sx={{
                  backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  borderRadius: '12px',
                  p: 3,
                  mb: 3,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Warning sx={{ color: '#2196F3', fontSize: 24 }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Bạn có thể làm gì tiếp theo?
                  </Typography>
                </Box>
                
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  • Kiểm tra thông tin thẻ và số dư tài khoản
                  <br />
                  • Thử lại với phương thức thanh toán khác
                  <br />
                  • Liên hệ ngân hàng nếu thẻ bị từ chối
                  <br />
                  • Liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục
                </Typography>
              </Box>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  startIcon={<Refresh />}
                  onClick={handleRetryPayment}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                    },
                  }}
                >
                  Thử lại thanh toán
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<SupportAgent />}
                  onClick={handleContactSupport}
                  sx={{
                    borderColor: '#ff9800',
                    color: '#ff9800',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 152, 0, 0.05)',
                    },
                  }}
                >
                  Liên hệ hỗ trợ
                </Button>
                
                <Button
                  variant="outlined"
                  startIcon={<Home />}
                  onClick={handleGoHome}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    borderRadius: '12px',
                    px: 3,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    },
                  }}
                >
                  Về trang chủ
                </Button>
              </Box>

              {/* FAQ Section */}
              <Box
                sx={{
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '12px',
                  p: 3,
                  mt: 3,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  ❓ Câu hỏi thường gặp
                </Typography>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Q: Tại sao thanh toán của tôi bị từ chối?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    A: Có thể do số dư không đủ, thẻ hết hạn, hoặc ngân hàng từ chối giao dịch.
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Q: Tiền có bị trừ không khi thanh toán thất bại?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    A: Không, tiền chỉ bị trừ khi thanh toán thành công. Nếu thấy bị trừ, liên hệ hỗ trợ.
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    Q: Tôi có thể thử thanh toán lại không?
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                    A: Có, bạn có thể thử lại ngay lập tức hoặc sử dụng phương thức khác.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default PaymentFailedPage;