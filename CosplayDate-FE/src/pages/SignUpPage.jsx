import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Grid, FormControlLabel, Checkbox, Alert } from '@mui/material';
import { Person, Email, Lock, CalendarToday } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';
import CodeVerificationCard from '../components/common/CodeVerificationCard';
import { authAPI } from '../services/api';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('signup'); // 'signup' or 'verification'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);
  const [apiError, setApiError] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    email: '',
    password: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  
  const validateAge = (dateOfBirth) => {
    if (!dateOfBirth) return false;
    
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      
      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        return false;
      }
      
      // Check if date is not in the future
      if (birthDate > today) {
        return false;
      }
      
      // Check minimum age (18 years)
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      const calculatedAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
        ? age - 1 : age;
      
      return calculatedAge >= 18 && calculatedAge <= 120; // Also check maximum reasonable age
    } catch (error) {
      console.error('Error validating date of birth:', error);
      return false;
    }
  };

  // Debounced email availability check
  const checkEmailAvailability = async (email) => {
    if (!email || !validateEmail(email)) return;
    
    setEmailCheckLoading(true);
    try {
      const result = await authAPI.checkEmailAvailability(email);
      if (!result.success || !result.isAvailable) {
        setErrors(prev => ({ 
          ...prev, 
          email: result.message || 'Email này đã được đăng ký' 
        }));
      } else {
        // Clear email error if email is available
        if (errors.email && errors.email.includes('already')) {
          setErrors(prev => ({ ...prev, email: '' }));
        }
      }
    } catch (error) {
      console.error('Email check failed:', error);
    } finally {
      setEmailCheckLoading(false);
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear API error when user starts typing
    if (apiError) setApiError('');
    
    // Clear field-specific errors
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));

    // Special handling for email - check availability with debounce
    if (field === 'email' && value && validateEmail(value)) {
      // Clear previous timeout
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
      
      // Set new timeout for email check
      const timeout = setTimeout(() => {
        checkEmailAvailability(value);
      }, 1000); // 1 second debounce
      
      setEmailCheckTimeout(timeout);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
    };
  }, [emailCheckTimeout]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Tên là bắt buộc';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Tên phải có ít nhất 2 ký tự';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Họ là bắt buộc';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Họ phải có ít nhất 2 ký tự';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh là bắt buộc';
    } else {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      
      if (isNaN(birthDate.getTime())) {
        newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
      } else if (birthDate > today) {
        newErrors.dateOfBirth = 'Ngày sinh không thể là ngày trong tương lai';
      } else if (!validateAge(formData.dateOfBirth)) {
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age > 120) {
          newErrors.dateOfBirth = 'Ngày sinh không hợp lệ';
        } else {
          newErrors.dateOfBirth = 'Bạn phải ít nhất 18 tuổi';
        }
      }
    }
    
    if (!formData.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Vui lòng nhập địa chỉ email hợp lệ';
    }
    
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'Bạn phải chấp nhận điều khoản và điều kiện';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      // Prepare registration data to match backend DTO
      const registrationData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        dateOfBirth: formData.dateOfBirth
      };

      // console.log('Registering user:', registrationData);
      
      const result = await authAPI.register(registrationData);
      
      if (result.success) {
        // console.log('✅ Registration successful!', result.data);
        
        // Move to email verification step
        setStep('verification');
      } else {
        console.error('❌ Registration failed:', result.message);
        
        // Handle validation errors from backend
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setApiError(result.message || 'Đăng ký thất bại. Vui lòng thử lại.');
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setApiError('Lỗi kết nối. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = async (code) => {
    // console.log('Verifying email with code:', code);
    
    try {
      const verificationData = {
        email: formData.email.trim().toLowerCase(),
        code: code
      };
      
      const result = await authAPI.verifyEmail(verificationData);
      
      if (result.success) {
        // console.log('✅ Email verified successfully!', result.data);
        
        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Tài khoản đã được tạo và xác thực thành công! Vui lòng đăng nhập.',
            email: formData.email 
          }
        });
      } else {
        console.error('❌ Email verification failed:', result.message);
        throw new Error(result.message || 'Xác thực email thất bại');
      }
      
    } catch (error) {
      console.error('Email verification error:', error);
      throw error; // Re-throw to be handled by CodeVerificationCard
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      // console.log('Resending verification code to:', formData.email);
      
      const result = await authAPI.resendVerification(formData.email.trim().toLowerCase());
      
      if (result.success) {
        // console.log('✅ Verification code resent successfully!');
        return result;
      } else {
        console.error('❌ Failed to resend verification code:', result.message);
        throw new Error(result.message || 'Không thể gửi lại mã xác thực');
      }
      
    } catch (error) {
      console.error('Resend verification error:', error);
      throw error; // Re-throw to be handled by CodeVerificationCard
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleSignUp();

  // Email verification step
  if (step === 'verification') {
    return (
      <PageLayout showSidebar>
        <CodeVerificationCard
          title="Xác thực email của bạn"
          subtitle={`Chào mừng đến với CosplayDate! Chúng tôi đã gửi mã xác thực đến ${formData.email}. Vui lòng nhập mã bên dưới để hoàn tất đăng ký.`}
          email={formData.email}
          onCodeVerified={handleEmailVerified}
          onResendCode={handleResendVerificationCode}
          onBack={() => setStep('signup')}
          loading={loading}
          purpose="email-verification"
        />
      </PageLayout>
    );
  }

  // Sign up form step
  return (
    <PageLayout showSidebar>
      <FormContainer 
        title="ĐĂNG KÝ COSPLAYDATE"
        subtitle="Mở tài khoản cho mọi ứng dụng, để mọi thứ đơn giản hơn."
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

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CosplayInput
                label="Tên"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                onKeyPress={handleKeyPress}
                error={errors.firstName}
                required
                disabled={loading}
                icon={<Person sx={{ color: 'primary.main', fontSize: 20 }} />}
                placeholder="Nhập tên của bạn"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CosplayInput
                label="Họ"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                onKeyPress={handleKeyPress}
                error={errors.lastName}
                required
                disabled={loading}
                icon={<Person sx={{ color: 'primary.main', fontSize: 20 }} />}
                placeholder="Nhập họ của bạn"
              />
            </Grid>
          </Grid>

          <CosplayInput
            label="Ngày sinh"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange('dateOfBirth')}
            error={errors.dateOfBirth}
            required
            disabled={loading}
            icon={<CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
            helperText="Bạn phải ít nhất 18 tuổi để đăng ký"
            inputProps={{
              min: new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0], // 120 years ago
              max: new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0] // 18 years ago
            }}
          />

          <CosplayInput
            label="Địa chỉ email"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            onKeyPress={handleKeyPress}
            error={errors.email}
            required
            disabled={loading || emailCheckLoading}
            icon={<Email sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mt: 2 }}
            placeholder="Nhập địa chỉ email của bạn"
            helperText={emailCheckLoading ? "Đang kiểm tra email..." : ""}
          />

          <CosplayInput
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleInputChange('password')}
            onKeyPress={handleKeyPress}
            error={errors.password}
            required
            disabled={loading}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            icon={<Lock sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mt: 2 }}
            placeholder="Tạo mật khẩu bảo mật"
            helperText="Mật khẩu phải có ít nhất 6 ký tự"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.acceptTerms}
                onChange={handleInputChange('acceptTerms')}
                disabled={loading}
                sx={{
                  color: 'primary.main',
                  '&.Mui-checked': { color: 'primary.main' },
                }}
              />
            }
            label={
              <Typography variant="body2" sx={{ fontSize: '12px', color: 'text.secondary' }}>
                Tôi đồng ý nhận email về sản phẩm, cập nhật, sự kiện và nội dung khuyến mãi. Tôi đã đọc và chấp nhận{' '}
                <Typography 
                  component={Link} 
                  to="/terms-of-service"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  Điều khoản dịch vụ
                </Typography>
                {' '}và{' '}
                <Typography 
                  component={Link} 
                  to="/privacy-policy"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  Chính sách bảo mật
                </Typography>
                .
              </Typography>
            }
            sx={{ mt: 2, alignItems: 'flex-start' }}
          />
          
          {errors.acceptTerms && (
            <Typography variant="body2" sx={{ color: 'error.main', fontSize: '12px', mt: 1 }}>
              {errors.acceptTerms}
            </Typography>
          )}

          <ActionButton 
            onClick={handleSignUp} 
            loading={loading}
            disabled={loading || emailCheckLoading}
            sx={{ mt: 3 }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </ActionButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Đã có tài khoản?{' '}
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
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default SignUpPage;
