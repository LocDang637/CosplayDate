import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, IconButton } from '@mui/material';
import { ArrowBack, Email, Refresh } from '@mui/icons-material';
import FormContainer from './FormContainer';
import ActionButton from './ActionButton';

const CodeVerificationCard = ({ 
  title = "Verify Your Email",
  subtitle,
  email,
  onCodeVerified,
  onResendCode,
  onBack,
  loading = false,
  purpose = "email-verification", // "email-verification" or "password-reset"
  codeLength = 6
}) => {
  const [code, setCode] = useState(new Array(codeLength).fill(''));
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [verifying, setVerifying] = useState(false);
  const inputRefs = useRef([]);

  // Initialize input refs
  useEffect(() => {
    inputRefs.current = inputRefs.current.slice(0, codeLength);
  }, [codeLength]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Auto-focus next input
    if (value && index < codeLength - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (newCode.every(digit => digit !== '') && newCode.join('').length === codeLength) {
      handleVerifyCode(newCode.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    // Handle paste
    if (e.key === 'v' && e.ctrlKey) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedCode = text.replace(/\D/g, '').slice(0, codeLength);
        const newCode = [...code];
        for (let i = 0; i < pastedCode.length && i < codeLength; i++) {
          newCode[i] = pastedCode[i];
        }
        setCode(newCode);
        if (pastedCode.length === codeLength) {
          handleVerifyCode(pastedCode);
        }
      });
    }
  };

  const handleVerifyCode = async (codeToVerify = code.join('')) => {
    if (codeToVerify.length !== codeLength) {
      setError(`Please enter all ${codeLength} digits`);
      return;
    }

    setVerifying(true);
    setError('');

    try {
      // Mock API call for code verification
      console.log('Verifying code:', codeToVerify, 'for purpose:', purpose);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification - accept 123456 as valid code
      const isValid = codeToVerify === '123456';
      
      if (isValid) {
        console.log('✅ Code verified successfully!');
        onCodeVerified?.(codeToVerify);
      } else {
        setError('Invalid verification code. Please try again. (Hint: Use 123456)');
        setCode(new Array(codeLength).fill(''));
        inputRefs.current[0]?.focus();
      }
      
    } catch (error) {
      console.error('Code verification failed:', error);
      setError('Verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0) return;
    
    setResendTimer(60); // 60 second cooldown
    setCode(new Array(codeLength).fill(''));
    setError('');
    
    try {
      await onResendCode?.();
    } catch (error) {
      setError('Failed to resend code. Please try again.');
    }
  };

  const getIcon = () => {
    switch (purpose) {
      case 'password-reset':
        return <Box sx={{ fontSize: 48, mb: 2 }}>🔐</Box>;
      case 'email-verification':
      default:
        return <Email sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />;
    }
  };

  return (
    <FormContainer 
      title={title}
      subtitle={subtitle}
      maxWidth="sm"
    >
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        {/* Icon */}
        {getIcon()}

        {/* Code Input Fields */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
          {code.map((digit, index) => (
            <TextField
              key={index}
              ref={el => inputRefs.current[index] = el}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              disabled={verifying || loading}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  padding: '16px 0',
                },
              }}
              sx={{
                width: '56px',
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&.Mui-focused': {
                    '& fieldset': {
                      borderColor: 'primary.main',
                      borderWidth: '2px',
                    },
                  },
                  '&.Mui-error': {
                    '& fieldset': {
                      borderColor: 'error.main',
                    },
                  },
                },
              }}
              error={!!error}
            />
          ))}
        </Box>

        {/* Error Message */}
        {error && (
          <Typography 
            variant="body2" 
            sx={{ color: 'error.main', mb: 2, fontSize: '14px' }}
          >
            {error}
          </Typography>
        )}

        {/* Verify Button */}
        <ActionButton
          onClick={() => handleVerifyCode()}
          loading={verifying}
          disabled={verifying || code.some(digit => !digit)}
          sx={{ mb: 3 }}
        >
          Verify Code
        </ActionButton>

        {/* Resend Code */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Didn't receive the code?
          </Typography>
          <Button
            variant="text"
            onClick={handleResendCode}
            disabled={resendTimer > 0}
            startIcon={<Refresh />}
            sx={{
              color: 'primary.main',
              fontWeight: 600,
              textTransform: 'none',
              '&:disabled': {
                color: 'text.disabled',
              },
            }}
          >
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </Button>
        </Box>

        {/* Back Button */}
        {onBack && (
          <Box sx={{ textAlign: 'center' }}>
            <Button
              variant="text"
              onClick={onBack}
              startIcon={<ArrowBack />}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Back
            </Button>
          </Box>
        )}

        {/* Email Info */}
        <Box sx={{ 
          mt: 3, 
          p: 2, 
          backgroundColor: 'rgba(233, 30, 99, 0.05)', 
          borderRadius: '12px',
          border: '1px solid rgba(233, 30, 99, 0.1)'
        }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
            Code sent to: <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', mt: 0.5 }}>
            The code will expire in 10 minutes
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main', fontSize: '12px', mt: 1, fontWeight: 600 }}>
            💡 Demo Code: 123456
          </Typography>
        </Box>
      </Box>
    </FormContainer>
  );
};

export default CodeVerificationCard;