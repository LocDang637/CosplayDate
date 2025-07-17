import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';
import CodeVerificationCard from '../components/common/CodeVerificationCard';
import { authAPI } from '../services/api';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'verification'
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value && !validateEmail(value) ? 'Vui lòng nhập địa chỉ email hợp lệ' : '');
    if (apiError) setApiError(''); // Clear API error when user types
  };

  const handleSendCode = async () => {
    if (!email) {
      setEmailError('Email là bắt buộc');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setLoading(true);
    setApiError('');
    
    try {
      // console.log('Sending reset code to:', email);
      
      const result = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      
      if (result.success) {
        // console.log('✅ Reset code sent successfully');
        setStep('verification');
      } else {
        console.error('❌ Failed to send reset code:', result.message);
        
        // Handle different types of errors
        const message = result.message.toLowerCase();
        if (message.includes('email') || message.includes('not found') || message.includes('không tìm thấy')) {
          setEmailError(result.message || 'Không tìm thấy tài khoản với email này');
        } else {
          setApiError(result.message || 'Không thể gửi mã đặt lại. Vui lòng thử lại.');
        }
      }
      
    } catch (error) {
      console.error('Failed to send reset code:', error);
      setApiError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerified = async (code) => {
    // console.log('Password reset code verified:', code);
    // Navigate to reset password page with email and code
    navigate('/reset-password', { state: { email, code } });
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      // console.log('Resending reset code to:', email);
      
      const result = await authAPI.forgotPassword({ email: email.trim().toLowerCase() });
      
      if (!result.success) {
        throw new Error(result.message || 'Không thể gửi lại mã đặt lại');
      }
      
    } catch (error) {
      console.error('Failed to resend reset code:', error);
      throw error; // Re-throw to be handled by CodeVerificationCard
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleSendCode();

  if (step === 'verification') {
    return (
      <PageLayout>
        <CodeVerificationCard
          title="Kiểm tra email của bạn"
          subtitle={`Chúng tôi đã gửi mã xác thực đến ${email}. Vui lòng nhập mã bên dưới để đặt lại mật khẩu của bạn.`}
          email={email}
          onCodeVerified={handleCodeVerified}
          onResendCode={handleResendCode}
          onBack={() => setStep('email')}
          loading={loading}
          purpose="password-reset"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <FormContainer 
        title="QUÊN MẬT KHẨU"
        subtitle="Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn mã để đặt lại mật khẩu."
      >
        <Box component="form" sx={{ mt: 3 }}>
          {/* Back to Login */}
          <Box sx={{ mb: 3 }}>
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                display: 'inline-flex',
                alignItems: 'center',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              <ArrowBack sx={{ fontSize: 16, mr: 0.5 }} />
              Quay lại đăng nhập
            </Typography>
          </Box>

          {/* API Error Alert */}
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '12px' }}
              onClose={() => setApiError('')}
            >
              {apiError}
            </Alert>
          )}

          <CosplayInput
            label="Địa chỉ email"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            error={emailError}
            required
            disabled={loading}
            icon={<Email sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mb: 3 }}
            placeholder="Nhập địa chỉ email của bạn"
          />

          <ActionButton 
            onClick={handleSendCode} 
            loading={loading}
            disabled={loading || !email}
            sx={{ mb: 3 }}
          >
            {loading ? 'Đang gửi mã...' : 'Gửi mã đặt lại'}
          </ActionButton>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Bạn nhớ mật khẩu?{' '}
              <Typography
                component={Link}
                to="/login"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Đăng nhập
              </Typography>
            </Typography>
          </Box>

          {/* API Status Info */}
          <Box sx={{ 
            mt: 3, 
            p: 2, 
            backgroundColor: 'rgba(0,0,0,0.02)', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
              🌐 API Endpoint: {import.meta.env.VITE_API_BASE_URL || 'http://localhost:5068/api'}
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default ForgotPasswordPage;
