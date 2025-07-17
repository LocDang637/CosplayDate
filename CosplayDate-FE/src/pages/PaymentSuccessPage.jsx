import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  Grid
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { 
  CheckCircle, 
  AccountBalanceWallet, 
  Home, 
  Receipt,
  TrendingUp,
  Star
} from '@mui/icons-material';
import { cosplayTheme } from '../theme/cosplayTheme';
import { paymentAPI } from '../services/paymentAPI';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const PaymentSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    verifyPayment();
  }, []);

  const verifyPayment = async () => {
  try {
    setLoading(true);
    setError('');

    // Get payment parameters from URL
    const transactionId = searchParams.get('orderCode') || 
                         searchParams.get('transactionId') || 
                         searchParams.get('id');
    const status = searchParams.get('status');
    const amount = searchParams.get('amount');

    // console.log('🔍 Payment success parameters:', {
    //   transactionId,
    //   status,
    //   amount,
    //   allParams: Object.fromEntries(searchParams.entries())
    // });

    if (!transactionId) {
      setError('Không tìm thấy thông tin giao dịch');
      return;
    }

    // ===== UPDATED: Try verification with fallback =====
    try {
      // console.log('🔄 Attempting transaction verification...');
      const result = await paymentAPI.verifyTransaction(transactionId);
      
      if (result.success) {
        // console.log('✅ Transaction verified successfully');
        setPaymentData({
          transactionId,
          status: 'success',
          amount: result.data?.amount || (amount ? parseFloat(amount) : null),
          verifiedAt: new Date(),
          verified: true,
          ...result.data
        });

        // Refresh wallet balance
        await refreshWalletBalance();
        return;
      } else {
        console.warn('⚠️ Transaction verification failed:', result.message);
      }
    } catch (verifyError) {
      console.warn('⚠️ Verification endpoint error:', verifyError);
    }

    // ===== FALLBACK: Use URL parameters and refresh balance =====
    // console.log('🔄 Using fallback verification...');
    
    // Set payment data from URL parameters
    setPaymentData({
      transactionId,
      status: status || 'success',
      amount: amount ? parseFloat(amount) : null,
      verifiedAt: new Date(),
      verified: false,
      fallback: true
    });

    // Try to refresh balance as fallback
    try {
      await refreshWalletBalance();
      // console.log('✅ Fallback balance refresh successful');
    } catch (balanceError) {
      console.warn('⚠️ Balance refresh also failed:', balanceError);
      
      // Show payment success anyway since PayOS confirmed it
      setPaymentData(prev => ({
        ...prev,
        message: 'Thanh toán thành công. Số dư sẽ được cập nhật sớm.'
      }));
    }

  } catch (err) {
    console.error('❌ Payment verification error:', err);
    setError('Lỗi xác thực thanh toán. Vui lòng liên hệ hỗ trợ.');
  } finally {
    setLoading(false);
  }
};

const refreshWalletBalance = async () => {
  try {
    // Try the new refresh balance endpoint first
    const refreshResult = await paymentAPI.refreshBalance();
    if (refreshResult.success && user) {
      const newBalance = refreshResult.data.balance || refreshResult.data.Balance || 0;
      
      // Update user data in localStorage
      const updatedUser = { 
        ...user, 
        walletBalance: newBalance 
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // console.log('💰 Wallet balance updated via refresh endpoint:', newBalance);
      return;
    }

    // Fallback to original balance endpoint
    const result = await paymentAPI.getWalletBalance();
    if (result.success && user) {
      const newBalance = result.data.Balance || result.data.balance || 0;
      
      // Update user data in localStorage
      const updatedUser = { 
        ...user, 
        walletBalance: newBalance 
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // console.log('💰 Wallet balance updated via balance endpoint:', newBalance);
    }
  } catch (error) {
    console.warn('⚠️ Could not refresh wallet balance:', error);
    // Don't throw error - payment might still be valid
  }
};

  const formatCurrency = (amount) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(validAmount);
  };

  const handleGoToWallet = () => {
    navigate('/customer-profile?tab=wallet');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
  };

  if (loading) {
    return (
      <ThemeProvider theme={cosplayTheme}>
        <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
          <Header user={user} onLogout={handleLogout} />
          <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ color: 'primary.main', mb: 3 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Đang xác thực thanh toán...
            </Typography>
          </Container>
          <Footer />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={handleLogout} />
        
        <Container maxWidth="md" sx={{ py: 8 }}>
          {error ? (
            <Card
              sx={{
                borderRadius: '24px',
                p: 4,
                textAlign: 'center',
                background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                border: '1px solid rgba(244, 67, 54, 0.2)',
              }}
            >
              <Typography variant="h4" sx={{ color: '#f44336', mb: 2, fontWeight: 700 }}>
                ❌ Lỗi xác thực
              </Typography>
              
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
              
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  variant="outlined"
                  onClick={handleGoHome}
                  sx={{ borderRadius: '12px' }}
                >
                  Về trang chủ
                </Button>
                <Button
                  variant="contained"
                  onClick={() => window.location.reload()}
                  sx={{ borderRadius: '12px' }}
                >
                  Thử lại
                </Button>
              </Box>
            </Card>
          ) : paymentData ? (
            <Card
              sx={{
                borderRadius: '24px',
                overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
                border: '1px solid rgba(76, 175, 80, 0.2)',
              }}
            >
              {/* Success Header */}
              <Box
                sx={{
                  background: 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)',
                  color: 'white',
                  p: 4,
                  textAlign: 'center',
                }}
              >
                <CheckCircle sx={{ fontSize: 80, mb: 2 }} />
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Thanh toán thành công!
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.9 }}>
                  Tiền đã được nạp vào ví của bạn
                </Typography>
              </Box>

              <CardContent sx={{ p: 4 }}>
                {/* Payment Details */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <AccountBalanceWallet sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Số tiền nạp
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {paymentData.amount ? formatCurrency(paymentData.amount) : 'Đang cập nhật...'}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <Box sx={{ textAlign: 'center', p: 2 }}>
                      <Receipt sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                        Mã giao dịch
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600, wordBreak: 'break-all' }}>
                        {paymentData.transactionId}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ mb: 3 }} />

                {/* Transaction Status */}
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Chip
                    label="Giao dịch thành công"
                    sx={{
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      fontSize: '14px',
                      fontWeight: 600,
                      mb: 2,
                    }}
                  />
                  
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Thời gian: {paymentData.verifiedAt?.toLocaleString('vi-VN') || 'Đang cập nhật...'}
                  </Typography>
                  
                  {paymentData.fallback && (
                    <Typography variant="body2" sx={{ color: '#ff9800', mt: 1 }}>
                      ⚠️ Đang chờ xác nhận từ hệ thống
                    </Typography>
                  )}
                </Box>

                {/* Current Balance */}
                {user?.walletBalance !== undefined && (
                  <Box
                    sx={{
                      backgroundColor: 'rgba(33, 150, 243, 0.1)',
                      borderRadius: '12px',
                      p: 2,
                      textAlign: 'center',
                      mb: 3,
                    }}
                  >
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Số dư ví hiện tại
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#2196F3' }}>
                      {formatCurrency(user.walletBalance)}
                    </Typography>
                  </Box>
                )}

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    startIcon={<AccountBalanceWallet />}
                    onClick={handleGoToWallet}
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
                    Xem ví của tôi
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

                {/* Success Tips */}
                <Box
                  sx={{
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderRadius: '12px',
                    p: 2,
                    mt: 3,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Star sx={{ color: '#FFC107', fontSize: 20 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      Mẹo sử dụng ví
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Kiểm tra số dư trước khi đặt lịch cosplayer
                    <br />
                    • Nhận điểm thưởng khi thanh toán thành công
                    <br />
                    • Ví của bạn được bảo mật tuyệt đối
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          ) : null}
        </Container>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};


export default PaymentSuccessPage;
