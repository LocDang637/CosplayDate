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
  Alert
} from '@mui/material';
import { AccountBalanceWallet, Star } from '@mui/icons-material';
import { paymentAPI } from '../../services/paymentAPI';

const WalletTopUpModal = ({ open, onClose, onSuccess }) => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      loadPackages();
    }
  }, [open]);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const result = await paymentAPI.getTopUpPackages();
      if (result.success) {
        setPackages(result.data);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
  };

  const handleContinue = async () => {
    if (!selectedPackage) return;

    setLoading(true);
    setError('');

    try {
      const result = await paymentAPI.createTopUp({
        Package: selectedPackage.Package
      });

      if (result.success && result.data?.CheckoutUrl) {
        // Redirect to PayOS payment page
        window.location.href = result.data.CheckoutUrl;
      } else {
        setError(result.message || 'Failed to create payment');
      }
    } catch (err) {
      setError('Payment creation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { borderRadius: '16px' } }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <AccountBalanceWallet sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Nạp tiền vào ví
        </Typography>
      </DialogTitle>

      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={2}>
            {packages.map((pkg) => (
              <Grid item xs={12} sm={6} md={4} key={pkg.Package}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: selectedPackage?.Package === pkg.Package 
                      ? '2px solid #E91E63' 
                      : '1px solid rgba(0,0,0,0.12)',
                    backgroundColor: selectedPackage?.Package === pkg.Package 
                      ? 'rgba(233, 30, 99, 0.05)' 
                      : 'transparent',
                    borderRadius: '12px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(233, 30, 99, 0.15)',
                    },
                  }}
                  onClick={() => handlePackageSelect(pkg)}
                >
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
                  
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                      {pkg.Package}
                    </Typography>
                    
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
                      Trả: {formatCurrency(pkg.PayAmount)}
                    </Typography>
                    
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
                      Nhận: {formatCurrency(pkg.ReceiveAmount)}
                    </Typography>
                    
                    <Chip
                      label={pkg.Bonus}
                      sx={{
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        fontSize: '12px',
                      }}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          sx={{ borderRadius: '12px' }}
          disabled={loading}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleContinue}
          disabled={!selectedPackage || loading}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            borderRadius: '12px',
            px: 3,
          }}
        >
          {loading ? <CircularProgress size={20} /> : 'Tiếp tục thanh toán'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default WalletTopUpModal;