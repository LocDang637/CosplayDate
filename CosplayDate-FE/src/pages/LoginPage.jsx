import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Alert, Switch, FormControlLabel } from '@mui/material';
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [useMockApi, setUseMockApi] = useState(true); // Toggle for demo
  const [pendingUser, setPendingUser] = useState(null); // Store user data for verification step

  // Mock account credentials (for demo purposes)
  const MOCK_ACCOUNTS = {
    customer: {
      email: 'customer@cosplaydate.com',
      password: 'cosplay123',
      user: {
        id: 1,
        firstName: 'Mai',
        lastName: 'Nguyen',
        email: 'customer@cosplaydate.com',
        userType: 'Customer',
        isVerified: true,
        avatar: null
      }
    },
    cosplayer: {
      email: 'cosplayer@cosplaydate.com',
      password: 'cosplay123',
      user: {
        id: 2,
        firstName: 'Sakura',
        lastName: 'Haruno',
        email: 'cosplayer@cosplaydate.com',
        userType: 'Cosplayer',
        isVerified: true,
        avatar: null
      }
    },
    unverified: {
      email: 'unverified@cosplaydate.com',
      password: 'cosplay123',
      user: {
        id: 3,
        firstName: 'Pending',
        lastName: 'User',
        email: 'unverified@cosplaydate.com',
        userType: 'Customer',
        isVerified: false,
        avatar: null
      }
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

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

  const handleSuccessfulLogin = (userData, token = null) => {
    console.log('✅ Login successful!', userData);
    
    // Store user data and token
    localStorage.setItem('user', JSON.stringify(userData));
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Navigate to home page with welcome message
    navigate('/', { 
      state: { 
        message: `Chào mừng trở lại, ${userData.firstName}!`,
        user: userData 
      }
    });
  };

  const handleUnverifiedUser = (userData) => {
    console.log('⚠️ User not verified, redirecting to verification');
    
    // Store user data with email for verification step
    const userWithEmail = {
      ...userData,
      email: userData.email || email // Ensure email is available
    };
    
    setPendingUser(userWithEmail);
    setStep('verification');
  };

  const handleMockLogin = async () => {
    console.log('Using mock login...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Find matching mock account
    const mockAccount = Object.values(MOCK_ACCOUNTS).find(
      account => account.email === email && account.password === password
    );
    
    if (mockAccount) {
      const { user } = mockAccount;
      
      if (user.isVerified) {
        // Case 1: Login successful and verified
        handleSuccessfulLogin(user, 'mock-jwt-token-' + Date.now());
      } else {
        // Case 2: Login successful but not verified
        handleUnverifiedUser(user);
      }
    } else {
      // Case 3: Invalid credentials
      const emailExists = Object.values(MOCK_ACCOUNTS).some(account => account.email === email);
      
      if (!emailExists) {
        setEmailError('Không tìm thấy tài khoản với email này');
      } else {
        setPasswordError('Mật khẩu không đúng');
      }
    }
  };

  const handleRealApiLogin = async () => {
    console.log('Using real API login...');
    
    try {
      const credentials = {
        email: email.trim().toLowerCase(),
        password: password
      };
      
      console.log('Sending login request with credentials:', { email: credentials.email, password: '***' });
      
      const result = await authAPI.login(credentials);
      
      console.log('Login API result:', {
        success: result.success,
        message: result.message,
        hasUser: !!result.data?.user,
        hasToken: !!result.data?.token,
        isVerified: result.data?.isVerified,
        userEmail: result.data?.user?.email
      });
      
      if (result.success) {
        const { user, token, isVerified } = result.data;
        
        console.log('Processing successful result:', {
          isVerified,
          hasToken: !!token,
          userEmail: user?.email
        });
        
        if (isVerified && token) {
          // Case 1: Login successful and verified
          console.log('✅ Case 1: User is verified, proceeding to login');
          handleSuccessfulLogin(user, token);
        } else if (!isVerified) {
          // Case 2: Login successful but not verified
          console.log('⚠️ Case 2: User not verified, going to verification step');
          
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
          console.log('Field-specific errors:', result.errors);
          if (result.errors.email) setEmailError(result.errors.email);
          if (result.errors.password) setPasswordError(result.errors.password);
        } else {
          // Handle different types of login errors based on message content
          const message = result.message.toLowerCase();
          
          console.log('Processing error message:', message);
          
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
      console.error('Login API error:', error);
      setApiError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
    }
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
      if (useMockApi) {
        await handleMockLogin();
      } else {
        await handleRealApiLogin();
      }
    } catch (error) {
      console.error('Login failed:', error);
      setApiError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = async (code) => {
    console.log('Verifying email with code:', code);
    
    try {
      const verificationData = {
        email: pendingUser.email,
        code: code
      };
      
      if (useMockApi) {
        // Mock verification - always successful
        await new Promise(resolve => setTimeout(resolve, 1000));
        const verifiedUser = { ...pendingUser, isVerified: true };
        handleSuccessfulLogin(verifiedUser, 'mock-jwt-token-' + Date.now());
      } else {
        const result = await authAPI.verifyEmail(verificationData);
        
        if (result.success) {
          console.log('✅ Email verified successfully!');
          const verifiedUser = { ...pendingUser, isVerified: true };
          handleSuccessfulLogin(verifiedUser, result.data.token);
        } else {
          throw new Error(result.message || 'Xác thực email thất bại');
        }
      }
      
    } catch (error) {
      console.error('Email verification error:', error);
      throw error; // Re-throw to be handled by CodeVerificationCard
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      console.log('Resending verification code to:', pendingUser.email);
      
      if (useMockApi) {
        // Mock resend
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('📧 Mock verification code resent: 123456');
      } else {
        const result = await authAPI.resendVerification(pendingUser.email);
        
        if (!result.success) {
          throw new Error(result.message || 'Không thể gửi lại mã xác thực');
        }
      }
      
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error;
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleLogin();

  const handleDemoLogin = (accountType) => {
    const account = MOCK_ACCOUNTS[accountType];
    setEmail(account.email);
    setPassword(account.password);
    setEmailError('');
    setPasswordError('');
    setApiError('');
  };

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
          {/* API Mode Toggle (for development) */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '12px' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useMockApi}
                  onChange={(e) => setUseMockApi(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '12px' }}>
                  {useMockApi ? '🎭 Chế độ Demo (Mock API)' : '🌐 Chế độ API thực'}
                </Typography>
              }
            />
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', mt: 0.5 }}>
              {useMockApi 
                ? 'Sử dụng xác thực giả lập cho mục đích demo' 
                : 'Sử dụng API backend thực để xác thực'
              }
            </Typography>
          </Box>

          {/* Demo Account Info (only show in mock mode) */}
          {useMockApi && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: 3, 
                borderRadius: '12px',
                '& .MuiAlert-message': { fontSize: '14px' }
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                🎭 Tài khoản Demo có sẵn
              </Typography>
              
              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                  👤 Khách hàng (Customer):
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>
                  Email: <strong>customer@cosplaydate.com</strong> | Mật khẩu: <strong>cosplay123</strong>
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => handleDemoLogin('customer')}
                  sx={{
                    fontSize: '11px',
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { color: 'primary.dark' }
                  }}
                >
                  Nhấn để điền tự động
                </Typography>
              </Box>

              <Box sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                  🎭 Cosplayer:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>
                  Email: <strong>cosplayer@cosplaydate.com</strong> | Mật khẩu: <strong>cosplay123</strong>
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => handleDemoLogin('cosplayer')}
                  sx={{
                    fontSize: '11px',
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { color: 'primary.dark' }
                  }}
                >
                  Nhấn để điền tự động
                </Typography>
              </Box>

              <Box>
                <Typography variant="body2" sx={{ fontSize: '12px', fontWeight: 600 }}>
                  ⚠️ Chưa xác thực (Unverified):
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '11px' }}>
                  Email: <strong>unverified@cosplaydate.com</strong> | Mật khẩu: <strong>cosplay123</strong>
                </Typography>
                <Typography
                  variant="body2"
                  onClick={() => handleDemoLogin('unverified')}
                  sx={{
                    fontSize: '11px',
                    color: 'primary.main',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    '&:hover': { color: 'primary.dark' }
                  }}
                >
                  Nhấn để điền tự động
                </Typography>
              </Box>
            </Alert>
          )}

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
            {loading ? (useMockApi ? 'Đang đăng nhập...' : 'Đang xác thực...') : 'ĐĂNG NHẬP'}
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
              {useMockApi 
                ? '🔧 Chế độ phát triển: Sử dụng xác thực giả lập với role-based navigation'
                : `🌐 API Endpoint: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5068/api'}`
              }
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default LoginPage;