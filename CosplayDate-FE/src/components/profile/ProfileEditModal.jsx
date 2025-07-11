// src/components/profile/ProfileEditModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  IconButton,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment
} from '@mui/material';
import { Close, Person, LocationOn, Info } from '@mui/icons-material';
import { userAPI } from '../../services/api';

const ProfileEditModal = ({ 
  open, 
  onClose, 
  user, 
  onProfileUpdated 
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  // Initialize form with user data
  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        location: user.location || '',
        bio: user.bio || '',
        dateOfBirth: user.dateOfBirth ? new Date(user.dateOfBirth).toISOString().split('T')[0] : ''
      });
      setErrors({});
      setApiError('');
    }
  }, [user, open]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific errors
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Họ là bắt buộc';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'Họ phải có ít nhất 2 ký tự';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Tên là bắt buộc';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Tên phải có ít nhất 2 ký tự';
    }
    
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Giới thiệu không được vượt quá 1000 ký tự';
    }
    
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Địa điểm không được vượt quá 100 ký tự';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      // Prepare update data
      const updateData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        location: formData.location.trim() || null,
        bio: formData.bio.trim() || null,
        dateOfBirth: formData.dateOfBirth || null
      };

      const result = await userAPI.updateProfile(updateData);
      
      if (result.success) {
        onProfileUpdated?.(result.data);
        onClose();
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setApiError(result.message || 'Cập nhật hồ sơ thất bại');
        }
      }
      
    } catch (error) {
      console.error('Profile update error:', error);
      setApiError('Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: '16px' }
      }}
    >
      <DialogTitle sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.12)'
      }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Chỉnh sửa hồ sơ
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Cập nhật thông tin cá nhân của bạn
          </Typography>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ p: 3 }}>
          {apiError && (
            <Alert 
              severity="error" 
              sx={{ mb: 2, borderRadius: '12px' }}
              onClose={() => setApiError('')}
            >
              {apiError}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Personal Information Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Thông tin cá nhân
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Name Row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Họ"
                    value={formData.firstName}
                    onChange={handleInputChange('firstName')}
                    fullWidth
                    required
                    disabled={loading}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                  <TextField
                    label="Tên"
                    value={formData.lastName}
                    onChange={handleInputChange('lastName')}
                    fullWidth
                    required
                    disabled={loading}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Box>

                {/* Location */}
                <TextField
                  label="Địa điểm"
                  value={formData.location}
                  onChange={handleInputChange('location')}
                  fullWidth
                  disabled={loading}
                  error={!!errors.location}
                  helperText={errors.location || 'Thành phố hoặc khu vực của bạn'}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOn />
                      </InputAdornment>
                    ),
                  }}
                />

                {/* Date of Birth */}
                <TextField
                  label="Ngày sinh"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange('dateOfBirth')}
                  fullWidth
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    min: new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0], // 120 years ago
                    max: new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0] // 18 years ago
                  }}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth || 'Bạn phải từ 18 tuổi trở lên'}
                />

                {/* Bio */}
                <TextField
                  label="Giới thiệu bản thân"
                  value={formData.bio}
                  onChange={handleInputChange('bio')}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={loading}
                  error={!!errors.bio}
                  helperText={
                    errors.bio || 
                    `${formData.bio.length}/1000 ký tự - Hãy giới thiệu về bản thân bạn`
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Info />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading}
          sx={{
            textTransform: 'none',
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            minWidth: 120,
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
            }
          }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Lưu thay đổi'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditModal;