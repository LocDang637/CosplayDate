import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography, Grid, FormControlLabel, Checkbox } from '@mui/material';
import { Person, Email, Lock, CalendarToday } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';
import CodeVerificationCard from '../components/common/CodeVerificationCard';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('signup'); // 'signup' or 'verification'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
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
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 >= 18 : age >= 18;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    else if (!validateAge(formData.dateOfBirth)) newErrors.dateOfBirth = 'You must be at least 18 years old';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!validateEmail(formData.email)) newErrors.email = 'Please enter a valid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (!formData.acceptTerms) newErrors.acceptTerms = 'You must accept the terms and conditions';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      // Mock API call for creating account
      console.log('Creating account:', formData);
      console.log('📧 Mock verification code sent: 123456');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to email verification step
      setStep('verification');
      
    } catch (error) {
      console.error('Sign up failed:', error);
      // Handle signup error (show notification, etc.)
      setErrors({ email: 'An account with this email already exists' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = (code) => {
    // Handle successful email verification
    console.log('Email verified with code:', code);
    
    // Navigate to login or directly to profile
    navigate('/login', { 
      state: { 
        message: 'Account created and verified successfully! Please log in.',
        email: formData.email 
      }
    });
  };

  const handleResendVerificationCode = async () => {
    setLoading(true);
    try {
      // Mock resend verification code logic
      console.log('Resending verification code to:', formData.email);
      console.log('📧 Mock verification code resent: 123456');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to resend verification code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleSignUp();

  // Email verification step
  if (step === 'verification') {
    return (
      <PageLayout showSidebar>
        <CodeVerificationCard
          title="Verify Your Email"
          subtitle={`Welcome to CosplayDate! We've sent a verification code to ${formData.email}. Please enter the code below to complete your registration.`}
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
        title="COSPLAYDATE SIGNUP"
        subtitle="Mở tài khoản cho mọi ứng dụng, để mọi thứ đơn giản hơn."
      >
        <Box component="form" sx={{ mt: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <CosplayInput
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                onKeyPress={handleKeyPress}
                error={errors.firstName}
                required
                disabled={loading}
                icon={<Person sx={{ color: 'primary.main', fontSize: 20 }} />}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <CosplayInput
                label="Last Name"
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
                onKeyPress={handleKeyPress}
                error={errors.lastName}
                required
                disabled={loading}
                icon={<Person sx={{ color: 'primary.main', fontSize: 20 }} />}
              />
            </Grid>
          </Grid>

          <CosplayInput
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleInputChange('dateOfBirth')}
            error={errors.dateOfBirth}
            required
            disabled={loading}
            icon={<CalendarToday sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mt: 2 }}
            InputLabelProps={{ shrink: true }}
          />

          <CosplayInput
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            onKeyPress={handleKeyPress}
            error={errors.email}
            required
            disabled={loading}
            icon={<Email sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mt: 2 }}
          />

          <CosplayInput
            label="Password"
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
                Hãy tick vào đây để nhận email về sản phẩm, ứng dụng, sự kiện, nội dung cũng như quyền và nhiều điều thú vị khác.{' '}
                <Typography 
                  component={Link} 
                  to="/privacy-policy"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  Xem Chính sách quyền riêng tư của chúng tôi.
                </Typography>
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
            disabled={loading}
            sx={{ mt: 3 }}
          >
            Create Account
          </ActionButton>

          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Already have an account?{' '}
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
                Log in
              </Typography>
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default SignUpPage;