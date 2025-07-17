import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Box, Typography, Alert } from '@mui/material';
import { Lock } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';
import { authAPI } from '../services/api';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, code } = location.state || {};
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');

  // Redirect if no email/code provided
  React.useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) return 'Mật khẩu phải có ít nhất 8 ký tự';
    if (!/(?=.*[a-z])/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ thường';
    if (!/(?=.*[A-Z])/.test(password)) return 'Mật khẩu phải chứa ít nhất một chữ hoa';
    if (!/(?=.*\d)/.test(password)) return 'Mật khẩu phải chứa ít nhất một số';
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value ? validatePassword(value) : '');
    if (apiError) setApiError(''); // Clear API error when user types
    
    // Check confirm password match if it's already filled
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (apiError) setApiError(''); // Clear API error when user types
    
    if (value && value !== password) {
      setConfirmPasswordError('Mật khẩu không khớp');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = async () => {
    // Validation
    if (!password) {
      setPasswordError('Mật khẩu là bắt buộc');
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Vui lòng xác nhận mật khẩu của bạn');
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    setApiError('');
    
    try {
      // console.log('Resetting password for:', email, 'with code:', code);
      
      const resetData = {
        email: email.trim().toLowerCase(),
        code: code,
        password: password
      };
      
      const result = await authAPI.resetPassword(resetData);
      
      if (result.success) {
        // console.log('✅ Password reset successful');
        
        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Đặt lại mật khẩu thành công! Vui lòng đăng nhập với mật khẩu mới.',
            email: email
          }
        });
      } else {
        console.error('❌ Password reset failed:', result.message);
        
        // Handle different types of errors
        if (result.errors && Object.keys(result.errors).length > 0) {
          // Handle field-specific errors
          if (result.errors.password) setPasswordError(result.errors.password);
          if (result.errors.code) {
            setApiError('Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.');
          }
        } else {
          const message = result.message.toLowerCase();
          if (message.includes('code') || message.includes('invalid') || message.includes('expired')) {
            setApiError('Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu mã mới.');
          } else if (message.includes('password')) {
            setPasswordError(result.message);
          } else {
            setApiError(result.message || 'Không thể đặt lại mật khẩu. Vui lòng thử lại.');
          }
        }
      }
      
    } catch (error) {
      console.error('Password reset failed:', error);
      setApiError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleResetPassword();

  if (!email || !code) {
    return null; // Will redirect in useEffect
  }

  return (
    <PageLayout>
      <FormContainer 
        title="ĐẶT LẠI MẬT KHẨU"
        subtitle="Nhập mật khẩu mới của bạn bên dưới. Hãy đảm bảo mật khẩu mạnh và bảo mật."
      >
        <Box component="form" sx={{ mt: 3 }}>
          {/* Email Display */}
          <Box sx={{ 
            mb: 3, 
            p: 2, 
            backgroundColor: 'rgba(233, 30, 99, 0.05)', 
            borderRadius: '12px',
            border: '1px solid rgba(233, 30, 99, 0.1)'
          }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
              Đặt lại mật khẩu cho: <strong>{email}</strong>
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
            label="Mật khẩu mới"
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
            sx={{ mb: 3 }}
            placeholder="Nhập mật khẩu mới của bạn"
          />

          <CosplayInput
            label="Xác nhận mật khẩu mới"
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            onKeyPress={handleKeyPress}
            error={confirmPasswordError}
            required
            disabled={loading}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            icon={<Lock sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mb: 3 }}
            placeholder="Xác nhận mật khẩu mới của bạn"
          />

          {/* Password Requirements */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: '12px' }}>
              Yêu cầu mật khẩu:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.5 }}>
              • Ít nhất 8 ký tự
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.5 }}>
              • Chứa chữ hoa và chữ thường
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
              • Chứa ít nhất một số
            </Typography>
          </Box>

          <ActionButton 
            onClick={handleResetPassword} 
            loading={loading}
            disabled={loading || !password || !confirmPassword || !!passwordError || !!confirmPasswordError}
            sx={{ mb: 3 }}
          >
            {loading ? 'Đang đặt lại mật khẩu...' : 'Đặt lại mật khẩu'}
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

export default ResetPasswordPage;
