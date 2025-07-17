// src/components/wallet/WalletTopUpModal.jsx (Fixed Version)
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Divider
} from '@mui/material';
import { 
  AccountBalanceWallet, 
  Star, 
  Close, 
  CheckCircle,
  Payment,
  Security,
  TrendingUp
} from '@mui/icons-material';
import { paymentAPI } from '../../services/paymentAPI';

const WalletTopUpModal = ({ open, onClose, onSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadPackages();
    }
  }, [open]);

  // ===== FIXED: Enhanced package loading =====
  const loadPackages = async () => {
    setLoading(true);
    setError('');
    setSelectedPackage(null);
    
    try {
      // console.log('🔄 Loading packages in modal...');
      const result = await paymentAPI.getTopUpPackages();
      
      if (result.success && Array.isArray(result.data)) {
        // Additional validation for modal
        const validPackages = result.data.filter(pkg => {
          const isValid = pkg && 
            typeof pkg.PayAmount === 'number' && 
            typeof pkg.ReceiveAmount === 'number' &&
            pkg.PayAmount > 0 && 
            pkg.ReceiveAmount > 0 &&
            pkg.Package;
          
          if (!isValid) {
            console.warn('⚠️ Invalid package in modal:', pkg);
          }
          
          return isValid;
        });

        if (validPackages.length === 0) {
          setError('Không có gói thanh toán hợp lệ');
          return;
        }

        // console.log('✅ Valid packages for modal:', validPackages.length);
        setPackages(validPackages);
        
        // Auto-select popular or first package
        const popularPackage = validPackages.find(pkg => pkg.Popular);
        if (popularPackage) {
          setSelectedPackage(popularPackage);
        } else if (validPackages.length > 0) {
          setSelectedPackage(validPackages[0]);
        }
      } else {
        setError(result.message || 'Không thể tải gói thanh toán');
      }
    } catch (err) {
      console.error('❌ Modal package loading error:', err);
      setError('Lỗi tải gói thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // ===== FIXED: Currency formatting =====
  const formatCurrency = (amount) => {
    const validAmount = typeof amount === 'number' && !isNaN(amount) ? amount : 0;
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(validAmount);
  };

  // ===== FIXED: Safe calculation functions =====
  const getBonusMultiplier = (pkg) => {
    if (!pkg?.ReceiveAmount || !pkg?.PayAmount || pkg.PayAmount === 0) return 1;
    return Math.round(pkg.ReceiveAmount / pkg.PayAmount);
  };

  const getSavingsAmount = (pkg) => {
    if (!pkg?.ReceiveAmount || !pkg?.PayAmount) return 0;
    return pkg.ReceiveAmount - pkg.PayAmount;
  };

  const handlePackageSelect = (pkg) => {
    if (pkg && pkg.PayAmount && pkg.ReceiveAmount) {
      setSelectedPackage(pkg);
      // console.log('📦 Modal package selected:', pkg.Package);
    }
  };

  // ===== FIXED: Enhanced payment processing =====
  const handleContinue = async () => {
    // Comprehensive validation
    if (!selectedPackage) {
      setError('Vui lòng chọn gói thanh toán');
      return;
    }

    if (!selectedPackage.Package) {
      setError('Gói thanh toán không hợp lệ');
      return;
    }

    if (!selectedPackage.PayAmount || selectedPackage.PayAmount <= 0) {
      setError('Số tiền thanh toán không hợp lệ');
      return;
    }

    if (!selectedPackage.ReceiveAmount || selectedPackage.ReceiveAmount <= 0) {
      setError('Số tiền nhận không hợp lệ');
      return;
    }

    setProcessingPayment(true);
    setError('');

    try {
      const paymentData = {
        Package: selectedPackage.Package
      };

      // console.log('🔄 Modal creating payment for:', selectedPackage.Package);

      const result = await paymentAPI.createTopUp(paymentData);

      if (result.success) {
        if (result.data?.CheckoutUrl) {
          // Validate URL before redirect
          try {
            const url = new URL(result.data.CheckoutUrl);
            
            // Additional security check
            if (url.protocol === 'https:' && (url.hostname.includes('payos') || url.hostname.includes('pay.os'))) {
              // console.log('✅ Modal redirecting to PayOS checkout');
              onClose(); // Close modal before redirect
              if (onSuccess) {
                onSuccess(selectedPackage);
              }
              window.location.href = result.data.CheckoutUrl;
            } else {
              throw new Error('URL không hợp lệ');
            }
          } catch (urlError) {
            console.error('❌ Modal invalid checkout URL:', urlError);
            setError('URL thanh toán không hợp lệ');
          }
        } else {
          setError('Không nhận được link thanh toán');
        }
      } else {
        setError(result.message || 'Không thể tạo thanh toán');
      }
    } catch (err) {
      console.error('❌ Modal payment creation error:', err.message);
      setError('Lỗi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setProcessingPayment(false);
    }
  };

  const handleClose = () => {
    if (!processingPayment) {
      setError('');
      setSelectedPackage(null);
      onClose();
    }
  };

  // ===== FIXED: Enhanced PackageCard for modal =====
  const PackageCard = ({ pkg, isSelected, onSelect }) => {
    // Validation to prevent NaN issues
    if (!pkg || typeof pkg.PayAmount !== 'number' || typeof pkg.ReceiveAmount !== 'number') {
      return (
        <Card
          sx={{
            border: '1px solid rgba(0,0,0,0.12)',
            borderRadius: '12px',
            p: 2,
            textAlign: 'center',
            minHeight: '180px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              Đang tải...
            </Typography>
          </Box>
        </Card>
      );
    }

    const bonusMultiplier = getBonusMultiplier(pkg);
    const savings = getSavingsAmount(pkg);
    
    return (
      <Card
        sx={{
          cursor: 'pointer',
          border: isSelected 
            ? '2px solid #E91E63' 
            : '1px solid rgba(0,0,0,0.12)',
          backgroundColor: isSelected 
            ? 'rgba(233, 30, 99, 0.05)' 
            : 'transparent',
          borderRadius: '12px',
          transition: 'all 0.3s ease',
          position: 'relative',
          minHeight: '180px',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 4px 12px rgba(233, 30, 99, 0.15)',
          },
        }}
        onClick={() => onSelect(pkg)}
      >
        {/* Popular Badge */}
        {pkg.Popular && (
          <Chip
            label="Phổ biến"
            sx={{
              position: 'absolute',
              top: -8,
              right: 8,
              backgroundColor: '#E91E63',
              color: 'white',
              fontSize: '10px',
            }}
          />
        )}

        {/* Selection Indicator */}
        {isSelected && (
          <CheckCircle 
            sx={{ 
              position: 'absolute',
              top: 8,
              right: 8,
              color: '#E91E63',
              fontSize: 20,
            }} 
          />
        )}
        
        <CardContent sx={{ textAlign: 'center', py: 3 }}>
          {/* Package Name */}
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
            {pkg.Package || 'Gói thanh toán'}
          </Typography>
          
          {/* Payment Amount */}
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
            Trả: {formatCurrency(pkg.PayAmount)}
          </Typography>
          
          {/* Receive Amount */}
          <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Nhận: {formatCurrency(pkg.ReceiveAmount)}
          </Typography>
          
          {/* Bonus Chip */}
          {savings > 0 && (
            <Chip
              label={pkg.Bonus || `Tiết kiệm ${formatCurrency(savings)}`}
              sx={{
                backgroundColor: '#4CAF50',
                color: 'white',
                fontSize: '12px',
              }}
            />
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ 
        sx: { 
          borderRadius: '16px',
          maxHeight: '90vh',
        } 
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ flex: 1 }} />
          <Box sx={{ textAlign: 'center' }}>
            <AccountBalanceWallet sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Nạp tiền vào ví
            </Typography>
          </Box>
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <IconButton onClick={handleClose} disabled={processingPayment}>
              <Close />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3, 
              borderRadius: '12px',
              fontSize: '14px',
            }}
          >
            {error}
          </Alert>
        )}

        {/* Loading State */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress size={60} />
          </Box>
        ) : (
          <>
            {/* Header */}
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Chọn gói nạp tiền phù hợp với bạn
              </Typography>
            </Box>

            {/* Package Grid */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
              {packages.map((pkg) => (
                <Grid item xs={12} sm={6} md={4} key={pkg.Package}>
                  <PackageCard
                    pkg={pkg}
                    isSelected={selectedPackage?.Package === pkg.Package}
                    onSelect={handlePackageSelect}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Selected Package Details */}
            {selectedPackage && (
              <Box
                sx={{
                  backgroundColor: 'rgba(233, 30, 99, 0.05)',
                  borderRadius: '12px',
                  p: 3,
                  mb: 3,
                  border: '1px solid rgba(233, 30, 99, 0.2)',
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, textAlign: 'center' }}>
                  Chi tiết gói {selectedPackage.Package}
                </Typography>
                
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Số tiền thanh toán
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#E91E63' }}>
                        {formatCurrency(selectedPackage.PayAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Số dư nhận được
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                        {formatCurrency(selectedPackage.ReceiveAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1 }}>
                  <TrendingUp sx={{ color: '#FF9800', fontSize: 20 }} />
                  <Typography variant="body1" sx={{ fontWeight: 600, color: '#FF9800' }}>
                    Tiết kiệm được: {formatCurrency(getSavingsAmount(selectedPackage))}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Security Notice */}
            <Alert 
              severity="info" 
              sx={{ 
                borderRadius: '12px',
                backgroundColor: 'rgba(33, 150, 243, 0.05)',
                border: '1px solid rgba(33, 150, 243, 0.2)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Security sx={{ fontSize: 20 }} />
                <Typography variant="body2">
                  Thanh toán được bảo mật bởi PayOS • Không lưu trữ thông tin thẻ
                </Typography>
              </Box>
            </Alert>
          </>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          sx={{ borderRadius: '12px' }}
          disabled={processingPayment}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!selectedPackage || loading || processingPayment}
          startIcon={processingPayment ? <CircularProgress size={20} /> : <Payment />}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            borderRadius: '12px',
            px: 3,
            '&:disabled': {
              background: 'rgba(0, 0, 0, 0.12)',
            },
          }}
        >
          {processingPayment ? 'Đang xử lý...' : 'Tiếp tục thanh toán'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletTopUpModal;
