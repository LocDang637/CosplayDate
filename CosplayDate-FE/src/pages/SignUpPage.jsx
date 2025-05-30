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
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    return monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate()) 
      ? age - 1 >= 18 : age >= 18;
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
          email: result.message || 'This email is already registered' 
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
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    } else if (!validateAge(formData.dateOfBirth)) {
      newErrors.dateOfBirth = 'You must be at least 18 years old';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'You must accept the terms and conditions';
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

      console.log('Registering user:', registrationData);
      
      const result = await authAPI.register(registrationData);
      
      if (result.success) {
        console.log('✅ Registration successful!', result.data);
        
        // Move to email verification step
        setStep('verification');
      } else {
        console.error('❌ Registration failed:', result.message);
        
        // Handle validation errors from backend
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setApiError(result.message || 'Registration failed. Please try again.');
        }
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      setApiError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailVerified = async (code) => {
    console.log('Verifying email with code:', code);
    
    try {
      const verificationData = {
        email: formData.email.trim().toLowerCase(),
        code: code
      };
      
      const result = await authAPI.verifyEmail(verificationData);
      
      if (result.success) {
        console.log('✅ Email verified successfully!', result.data);
        
        // Navigate to login with success message
        navigate('/login', { 
          state: { 
            message: 'Account created and verified successfully! Please log in.',
            email: formData.email 
          }
        });
      } else {
        console.error('❌ Email verification failed:', result.message);
        throw new Error(result.message || 'Email verification failed');
      }
      
    } catch (error) {
      console.error('Email verification error:', error);
      throw error; // Re-throw to be handled by CodeVerificationCard
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      console.log('Resending verification code to:', formData.email);
      
      const result = await authAPI.resendVerification(formData.email.trim().toLowerCase());
      
      if (result.success) {
        console.log('✅ Verification code resent successfully!');
        return result;
      } else {
        console.error('❌ Failed to resend verification code:', result.message);
        throw new Error(result.message || 'Failed to resend verification code');
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
                label="First Name"
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
                onKeyPress={handleKeyPress}
                error={errors.firstName}
                required
                disabled={loading}
                icon={<Person sx={{ color: 'primary.main', fontSize: 20 }} />}
                placeholder="Enter your first name"
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
                placeholder="Enter your last name"
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
            helperText="You must be at least 18 years old to register"
          />

          <CosplayInput
            label="Email address"
            type="email"
            value={formData.email}
            onChange={handleInputChange('email')}
            onKeyPress={handleKeyPress}
            error={errors.email}
            required
            disabled={loading || emailCheckLoading}
            icon={<Email sx={{ color: 'primary.main', fontSize: 20 }} />}
            sx={{ mt: 2 }}
            placeholder="Enter your email address"
            helperText={emailCheckLoading ? "Checking email availability..." : ""}
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
            placeholder="Create a secure password"
            helperText="Password must be at least 6 characters long"
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
                I agree to receive emails about products, updates, events, and promotional content. I have read and accept the{' '}
                <Typography 
                  component={Link} 
                  to="/terms-of-service"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  Terms of Service
                </Typography>
                {' '}and{' '}
                <Typography 
                  component={Link} 
                  to="/privacy-policy"
                  sx={{ color: 'primary.main', fontWeight: 600, textDecoration: 'none' }}
                >
                  Privacy Policy
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
            {loading ? 'Creating Account...' : 'Create Account'}
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