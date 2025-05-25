import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Email, ArrowBack } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';
import CodeVerificationCard from '../components/common/CodeVerificationCard';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' or 'verification'
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(value && !validateEmail(value) ? 'Please enter a valid email address' : '');
  };

  const handleSendCode = async () => {
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Mock API call - sending verification code
      console.log('Sending reset code to:', email);
      console.log('📧 Mock verification code sent: 123456');
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Move to verification step
      setStep('verification');
      
    } catch (error) {
      console.error('Failed to send reset code:', error);
      setEmailError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCodeVerified = (code) => {
    // Handle successful code verification
    console.log('Code verified:', code);
    // Navigate to reset password page or login
    navigate('/reset-password', { state: { email, code } });
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      // Mock resend code logic
      console.log('Resending code to:', email);
      console.log('📧 Mock verification code resent: 123456');
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (error) {
      console.error('Failed to resend code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => e.key === 'Enter' && !loading && handleSendCode();

  if (step === 'verification') {
    return (
      <PageLayout>
        <CodeVerificationCard
          title="Check Your Email"
          subtitle={`We've sent a verification code to ${email}. Please enter the code below to reset your password.`}
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
        title="FORGOT PASSWORD"
        subtitle="Enter your email address and we'll send you a code to reset your password."
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
              Back to Login
            </Typography>
          </Box>

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
            placeholder="Enter your email address"
          />

          <ActionButton 
            onClick={handleSendCode} 
            loading={loading}
            disabled={loading || !email}
            sx={{ mb: 3 }}
          >
            Send Reset Code
          </ActionButton>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Remember your password?{' '}
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
                Sign in
              </Typography>
            </Typography>
          </Box>
        </Box>
      </FormContainer>
    </PageLayout>
  );
};

export default ForgotPasswordPage;