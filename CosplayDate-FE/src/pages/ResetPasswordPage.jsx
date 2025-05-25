import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import { Lock, Visibility, VisibilityOff } from '@mui/icons-material';
import PageLayout from '../components/layout/PageLayout';
import FormContainer from '../components/common/FormContainer';
import CosplayInput from '../components/common/CosplayInput';
import ActionButton from '../components/common/ActionButton';

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

  // Redirect if no email/code provided
  React.useEffect(() => {
    if (!email || !code) {
      navigate('/forgot-password');
    }
  }, [email, code, navigate]);

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/(?=.*[a-z])/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/(?=.*[A-Z])/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/(?=.*\d)/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    setPasswordError(value ? validatePassword(value) : '');
    
    // Check confirm password match if it's already filled
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
    } else if (confirmPassword && value === confirmPassword) {
      setConfirmPasswordError('');
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match');
    } else {
      setConfirmPasswordError('');
    }
  };

  const handleResetPassword = async () => {
    // Validation
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    
    const passwordValidation = validatePassword(password);
    if (passwordValidation) {
      setPasswordError(passwordValidation);
      return;
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      return;
    }
    
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    setLoading(true);
    
    try {
      // Replace with your actual API call
      console.log('Resetting password for:', email, 'with code:', code);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to login with success message
      navigate('/login', { 
        state: { 
          message: 'Password reset successfully! Please log in with your new password.',
          email: email
        }
      });
      
    } catch (error) {
      console.error('Password reset failed:', error);
      setPasswordError('Failed to reset password. Please try again.');
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
        title="RESET PASSWORD"
        subtitle="Enter your new password below. Make sure it's strong and secure."
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
              Resetting password for: <strong>{email}</strong>
            </Typography>
          </Box>

          <CosplayInput
            label="New Password"
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
            placeholder="Enter your new password"
          />

          <CosplayInput
            label="Confirm New Password"
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
            placeholder="Confirm your new password"
          />

          {/* Password Requirements */}
          <Box sx={{ mb: 3, p: 2, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: '8px' }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, fontSize: '12px' }}>
              Password Requirements:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.5 }}>
              • At least 8 characters long
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary', mb: 0.5 }}>
              • Contains uppercase and lowercase letters
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '11px', color: 'text.secondary' }}>
              • Contains at least one number
            </Typography>
          </Box>

          <ActionButton 
            onClick={handleResetPassword} 
            loading={loading}
            disabled={loading || !password || !confirmPassword || !!passwordError || !!confirmPasswordError}
            sx={{ mb: 3 }}
          >
            Reset Password
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

export default ResetPasswordPage;