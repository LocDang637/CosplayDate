import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, TextField, Button, IconButton, Alert } from '@mui/material';
import { ArrowBack, Email, Refresh } from '@mui/icons-material';
import FormContainer from './FormContainer';
import ActionButton from './ActionButton';

const CodeVerificationCard = ({ 
  title = "Xác thực Email của bạn",
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
  const [resending, setResending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');

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
      setError(`Vui lòng nhập đủ ${codeLength} chữ số`);
      return;
    }

    setVerifying(true);
    setError('');
    setSuccessMessage('');

    try {
      // console.log('Verifying code:', codeToVerify, 'for purpose:', purpose);
      
      // Call the parent component's verification handler
      await onCodeVerified?.(codeToVerify);
      
      // If we reach here, verification was successful
      setSuccessMessage('✅ Mã xác thực thành công!');
      
    } catch (error) {
      console.error('Code verification failed:', error);
      
      // Handle different types of errors
      let errorMessage = 'Xác thực thất bại. Vui lòng thử lại.';
      
      if (error.message) {
        if (error.message.includes('expired')) {
          errorMessage = 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.';
        } else if (error.message.includes('invalid') || error.message.includes('incorrect')) {
          errorMessage = 'Mã xác thực không hợp lệ. Vui lòng kiểm tra và thử lại.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      
      // Clear the code inputs for retry
      setCode(new Array(codeLength).fill(''));
      inputRefs.current[0]?.focus();
      
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (resendTimer > 0 || resending) return;
    
    setResending(true);
    setResendTimer(60); // 60 second cooldown
    setCode(new Array(codeLength).fill(''));
    setError('');
    setSuccessMessage('');
    
    try {
      // console.log('Resending verification code...');
      
      // Call the parent component's resend handler
      await onResendCode?.();
      
      // Show success message
      setSuccessMessage('📧 Mã xác thực mới đã được gửi thành công!');
      
      // Focus first input
      inputRefs.current[0]?.focus();
      
    } catch (error) {
      console.error('Failed to resend code:', error);
      
      let errorMessage = 'Gửi lại mã thất bại. Vui lòng thử lại.';
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      setResendTimer(0); // Reset timer on error
      
    } finally {
      setResending(false);
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

        {/* Success Message */}
        {successMessage && (
          <Alert 
            severity="success" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              '& .MuiAlert-message': { fontSize: '14px' }
            }}
          >
            {successMessage}
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              '& .MuiAlert-message': { fontSize: '14px' }
            }}
          >
            {error}
          </Alert>
        )}

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

        {/* Verify Button */}
        <ActionButton
          onClick={() => handleVerifyCode()}
          loading={verifying}
          disabled={verifying || code.some(digit => !digit)}
          sx={{ mb: 3 }}
        >
          {verifying ? 'Đang xác thực...' : 'Xác thực mã'}
        </ActionButton>

        {/* Resend Code */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
            Bạn chưa nhận được mã?
          </Typography>
          <Button
            variant="text"
            onClick={handleResendCode}
            disabled={resendTimer > 0 || resending}
            startIcon={<Refresh />}
            sx={{
              color: resendTimer > 0 || resending ? 'text.disabled' : 'primary.main',
              fontWeight: 600,
              textTransform: 'none',
              '&:disabled': {
                color: 'text.disabled',
              },
            }}
          >
            {resending 
              ? 'Đang gửi...' 
              : resendTimer > 0 
                ? `Gửi lại sau ${resendTimer}s` 
                : 'Gửi lại mã'
            }
          </Button>
        </Box>

        {/* Back Button */}
        {onBack && (
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="text"
              onClick={onBack}
              startIcon={<ArrowBack />}
              disabled={verifying || resending}
              sx={{
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 500,
              }}
            >
              Quay lại
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
            Mã đã được gửi đến: <strong>{email}</strong>
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', mt: 0.5 }}>
            Mã sẽ hết hạn sau 10 phút
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px', mt: 1 }}>
            💡 Kiểm tra thư mục spam nếu bạn không thấy email
          </Typography>
        </Box>
      </Box>
    </FormContainer>
  );
};

export default CodeVerificationCard;
