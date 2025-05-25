import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { Email, Lock } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock account credentials
  const MOCK_ACCOUNT = {
    email: 'mai@cosplaydate.com',
    password: 'cosplay123',
    user: {
      firstName: 'Mai',
      lastName: 'Nguyen',
      email: 'mai@cosplaydate.com',
      id: 1,
      avatar: null
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value && !validateEmail(value) ? 'Please enter a valid email address' : '');
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value && value.length < 6 ? 'Password must be at least 6 characters' : '');
  };

  const handleLogin = async () => {
    // Validation
    if (!email) { 
      setEmailError('Email is required'); 
      return; 
    }
    if (!password) { 
      setPasswordError('Password is required'); 
      return; 
    }
    if (!validateEmail(email)) { 
      setEmailError('Please enter a valid email address'); 
      return; 
    }

    setLoading(true);
    
    try {
      // Mock login validation
      console.log('Login attempt:', { email, password });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check mock credentials
      if (email === MOCK_ACCOUNT.email && password === MOCK_ACCOUNT.password) {
        console.log('✅ Login successful!');
        
        // Store user data in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(MOCK_ACCOUNT.user));
        localStorage.setItem('token', 'mock-jwt-token-' + Date.now());
        
        // Navigate to home page
        navigate('/', { 
          state: { 
            message: `Welcome back, ${MOCK_ACCOUNT.user.firstName}!`,
            user: MOCK_ACCOUNT.user 
          }
        });
      } else {
        // Invalid credentials
        if (email !== MOCK_ACCOUNT.email) {
          setEmailError('Account not found. Try: mai@cosplaydate.com');
        } else {
          setPasswordError('Incorrect password. Try: cosplay123');
        }
      }
      
    } catch (error) {
      console.error('Login failed:', error);
      setPasswordError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleLogin();

  const handleDemoLogin = () => {
    setEmail(MOCK_ACCOUNT.email);
    setPassword(MOCK_ACCOUNT.password);
    setEmailError('');
    setPasswordError('');
  };

  return (
    <PageLayout>
      <FormContainer 
        title="COSPLAYDATE LOGIN"
        subtitle="Cosplay theo cách của bạn, lưu nhận vật yêu thích và tìm kết nối gỡ & tuyệt tập nhập vào cùng nhau!"
      >
        <Box component="form" sx={{ mt: 3 }}>
          {/* Demo Account Info */}
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              '& .MuiAlert-message': { fontSize: '14px' }
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              🎭 Demo Account Available
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', mb: 1 }}>
              Email: <strong>mai@cosplaydate.com</strong>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '12px', mb: 1 }}>
              Password: <strong>cosplay123</strong>
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                onClick={handleDemoLogin}
                sx={{
                  fontSize: '12px',
                  color: 'primary.main',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  '&:hover': { color: 'primary.dark' }
                }}
              >
                Click here to auto-fill demo credentials
              </Typography>
            </Box>
          </Alert>

          <CosplayInput
            label="Email address"
            type="email"
            value={email}
            onChange={handleEmailChange}
            onKeyPress={handleKeyPress}
            error={emailError}
            required
            disabled={loading}
            icon={<Email sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mb: 3 }}
          />

          <CosplayInput
            label="Password"
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
              Forgot password?
            </Typography>
          </Box>

          <ActionButton 
            onClick={handleLogin} 
            loading={loading}
            disabled={loading}
            sx={{ mb: 3 }}
          >
            LOG IN
          </ActionButton>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Don't have an account?{' '}
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
                Sign up
              </Typography>
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default LoginPage;