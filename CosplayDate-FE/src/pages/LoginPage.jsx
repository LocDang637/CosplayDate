import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';
import CodeVerificationCard from '../components/common/CodeVerificationCard';
import { authAPI } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('login'); // 'login' or 'verification'
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [pendingUser, setPendingUser] = useState(null); // Store user data for verification step
  const location = useLocation();
  const [email, setEmail] = useState(location.state?.email || '');
  const [redirectMessage, setRedirectMessage] = useState('');

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Check for redirect message and pre-fill email
  useEffect(() => {
    if (location.state?.message) {
      setRedirectMessage(location.state.message);
      // Auto-dismiss message after 10 seconds
      const timer = setTimeout(() => {
        setRedirectMessage('');
      }, 10000);
      return () => clearTimeout(timer);
    }

    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location.state]);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value && !validateEmail(value) ? 'Vui lòng nhập địa chỉ email hợp lệ' : '');
    if (apiError) setApiError(''); // Clear API error when user types
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value && value.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : '');
    if (apiError) setApiError(''); // Clear API error when user types
  };

  // NEW: Function to determine redirect path based on user type
  const getRedirectPath = (userData) => {
    const userType = userData.userType || userData.role;
    
    // console.log('🔍 Determining redirect path for user:', {
    //   userType,
    //   email: userData.email,
    //   firstName: userData.firstName
    // });
    
    switch (userType) {
      case 'Admin':
        // console.log('🎯 Admin user detected - redirecting to admin dashboard');
        return '/admin/dashboard';
      case 'Cosplayer':
        // console.log('🎭 Cosplayer user detected - redirecting to homepage');
        return '/';
      case 'Customer':
        // console.log('👤 Customer user detected - redirecting to homepage');
        return '/';
      default:
        // console.log('❓ Unknown user type - redirecting to homepage');
        return '/';
    }
  };

  // NEW: Function to get welcome message based on user type
  const getWelcomeMessage = (userData) => {
    const userType = userData.userType || userData.role;
    const name = userData.firstName || 'Người dùng';
    
    switch (userType) {
      case 'Admin':
        return `Chào mừng quản trị viên ${name}! Hệ thống đang chờ bạn quản lý.`;
      case 'Cosplayer':
        return `Chào mừng trở lại, ${name}! Hôm nay bạn sẽ mang đến những trải nghiệm tuyệt vời nào?`;
      case 'Customer':
        return `Chào mừng trở lại, ${name}! Sẵn sàng khám phá thế giới cosplay chưa?`;
      default:
        return `Chào mừng trở lại, ${name}!`;
    }
  };

  const handleSuccessfulLogin = (userData, token = null) => {
    // console.log('✅ Login successful!', {
    //   user: userData,
    //   userType: userData.userType || userData.role,
    //   hasToken: !!token
    // });
    
    // Store user data and token
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // NEW: Get redirect path and welcome message based on user type
    const redirectPath = getRedirectPath(userData);
    const welcomeMessage = getWelcomeMessage(userData);
    
    // console.log('🚀 Redirecting to:', redirectPath);
    
    // Navigate to appropriate page with welcome message
    navigate(redirectPath, { 
      state: { 
        message: welcomeMessage,
        user: userData 
      }
    });
  };

  const handleUnverifiedUser = (userData) => {
    // console.log('⚠️ User not verified, redirecting to verification');

    // Store user data with email for verification step
    const userWithEmail = {
      ...userData,
      email: userData.email || email // Ensure email is available
    };

    setPendingUser(userWithEmail);
    setStep('verification');
  };

  const handleLogin = async () => {
    // Validation
    if (!email) {
      setEmailError('Email là bắt buộc');
      return;
    }
    if (!password) {
      setPasswordError('Mật khẩu là bắt buộc');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setLoading(true);
    setApiError('');

    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password: password
      };

      // console.log('Sending login request with credentials:', { email: credentials.email, password: '***' });

      const result = await authAPI.login(credentials);

      // console.log('Login API result:', {
      //   success: result.success,
      //   message: result.message,
      //   hasUser: !!result.data?.user,
      //   hasToken: !!result.data?.token,
      //   isVerified: result.data?.isVerified,
      //   userEmail: result.data?.user?.email,
      //   userType: result.data?.user?.userType || result.data?.user?.role // NEW: Log user type
      // });

      if (result.success) {
        const { user, token, isVerified } = result.data;

        // console.log('Processing successful result:', {
        //   isVerified,
        //   hasToken: !!token,
        //   userEmail: user?.email,
        //   userType: user?.userType || user?.role // NEW: Log user type
        // });

        if (isVerified && token) {
          // Case 1: Login successful and verified
          // console.log('✅ Case 1: User is verified, proceeding to login');
          handleSuccessfulLogin(user, token);
        } else if (!isVerified) {
          // Case 2: Login successful but not verified
          // console.log('⚠️ Case 2: User not verified, going to verification step');

          // Ensure we have the email for verification
          const userWithEmail = {
            ...user,
            email: user?.email || email // Use form email as fallback
          };

          handleUnverifiedUser(userWithEmail);
        } else {
          // Edge case: verified but no token
          console.error('❌ Edge case: User verified but no token received');
          setApiError('Lỗi xác thực. Vui lòng thử lại.');
        }
      } else {
        console.error('❌ API login failed:', result.message);

        // Case 3: Invalid credentials or other errors
        if (result.errors && Object.keys(result.errors).length > 0) {
          // Handle field-specific errors
          // console.log('Field-specific errors:', result.errors);
          if (result.errors.email) setEmailError(result.errors.email);
          if (result.errors.password) setPasswordError(result.errors.password);
        } else {
          // Handle different types of login errors based on message content
          const message = result.message.toLowerCase();

          // console.log('Processing error message:', message);

          if (message.includes('email') || message.includes('not found') || message.includes('không tìm thấy')) {
            setEmailError(result.message);
          } else if (message.includes('password') || message.includes('incorrect') || message.includes('wrong') ||
            message.includes('mật khẩu') || message.includes('không đúng') || message.includes('sai')) {
            setPasswordError(result.message);
          } else if (message.includes('invalid') && (message.includes('email') || message.includes('password'))) {
            // Generic invalid credentials - could be either field
            setPasswordError('Email hoặc mật khẩu không đúng');
          } else {
            setApiError(result.message || 'Đăng nhập thất bại. Vui lòng kiểm tra thông tin đăng nhập.');
          }
        }
      }

    } catch (error) {
      console.error('Login failed:', error);
      setApiError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = async (code) => {
    // console.log('Verifying email with code:', code);

    try {
      const verificationData = {
        email: pendingUser.email,
        code: code
      };

      const result = await authAPI.verifyEmail(verificationData);

      if (result.success) {
        // console.log('✅ Email verified successfully!');
        const verifiedUser = { ...pendingUser, isVerified: true };
        handleSuccessfulLogin(verifiedUser, result.data.token);
      } else {
        throw new Error(result.message || 'Xác thực email thất bại');
      }

    } catch (error) {
      console.error('Email verification error:', error);
      throw error; // Re-throw to be handled by CodeVerificationCard
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      // console.log('Resending verification code to:', pendingUser.email);

      const result = await authAPI.resendVerification(pendingUser.email);

      if (!result.success) {
        throw new Error(result.message || 'Không thể gửi lại mã xác thực');
      }

    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleLogin();

  // Email verification step
  if (step === 'verification') {
    return (
      <PageLayout>
        <CodeVerificationCard
          title="Xác thực email để hoàn tất đăng nhập"
          subtitle={`Chúng tôi đã gửi mã xác thực đến ${pendingUser?.email}. Vui lòng nhập mã bên dưới để hoàn tất đăng nhập.`}
          email={pendingUser?.email}
          onCodeVerified={handleEmailVerified}
          onResendCode={handleResendVerificationCode}
          onBack={() => setStep('login')}
          loading={loading}
          purpose="email-verification"
        />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <FormContainer
        title="ĐĂNG NHẬP COSPLAYDATE"
        subtitle="Cosplay theo cách của bạn, lưu giữ nhân vật yêu thích và tìm kiếm kết nối để gặp gỡ & cùng nhau cosplay!"
      >
        <Box component="form" sx={{ mt: 3 }}>
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

          {/* Display redirect message if exists */}
          {redirectMessage && (
            <Alert 
              severity="success" 
              onClose={() => setRedirectMessage('')}
              sx={{ mb: 3, borderRadius: '12px' }}
            >
              {redirectMessage}
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

          <CosplayInput
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={handlePasswordChange}
            onKeyPress={handleKeyPress}
            error={passwordError}
            required
            disabled={loading}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            icon={<Lock sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mb: 2 }}
            placeholder="Nhập mật khẩu của bạn"
          />

          <Box sx={{ textAlign: 'right', mb: 3 }}>
            <Typography
              component={Link}
              to="/forgot-password"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Quên mật khẩu?
            </Typography>
          </Box>

          <ActionButton
            onClick={handleLogin}
            loading={loading}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            {loading ? 'Đang xác thực...' : 'ĐĂNG NHẬP'}
          </ActionButton>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Chưa có tài khoản?{' '}
              <Typography
                component={Link}
                to="/signup"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Đăng ký
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
            {/* NEW: Show login instructions for testing */}
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', mt: 1 }}>
              👨‍💼 Admin: admin@cosplaydate.com | 🎭 Cosplayer/Customer: Use regular accounts
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default LoginPage;
