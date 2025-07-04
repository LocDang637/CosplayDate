// src/components/profile/ProfileEditModal.jsx
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  IconButton,
  Typography,
  Alert,
  CircularProgress
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
      newErrors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = 'First name must be at least 2 characters';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = 'Last name must be at least 2 characters';
    }
    
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = 'Bio cannot exceed 1000 characters';
    }
    
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
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
          setApiError(result.message || 'Failed to update profile');
        }
      }
      
    } catch (error) {
      console.error('Profile update error:', error);
      setApiError('An unexpected error occurred. Please try again.');
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
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Edit Profile
          </Typography>
        </Box>
        <IconButton
          onClick={handleClose}
          disabled={loading}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'text.secondary',
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {apiError && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '12px' }}
            onClose={() => setApiError('')}
          >
            {apiError}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <Person sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <Person sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Location"
              value={formData.location}
              onChange={handleInputChange('location')}
              error={!!errors.location}
              helperText={errors.location || 'Your city or region'}
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <LocationOn sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleInputChange('dateOfBirth')}
              error={!!errors.dateOfBirth}
              helperText={errors.dateOfBirth}
              disabled={loading}
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                min: new Date(new Date().getFullYear() - 120, 0, 1).toISOString().split('T')[0], // 120 years ago
                max: new Date(new Date().getFullYear() - 18, new Date().getMonth(), new Date().getDate()).toISOString().split('T')[0] // 18 years ago
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Bio"
              multiline
              rows={4}
              value={formData.bio}
              onChange={handleInputChange('bio')}
              error={!!errors.bio}
              helperText={
                errors.bio || 
                `${formData.bio.length}/1000 characters - Tell people about yourself`
              }
              disabled={loading}
              InputProps={{
                startAdornment: (
                  <Info sx={{ color: 'text.secondary', mr: 1, fontSize: 20, alignSelf: 'flex-start', mt: 1 }} />
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={handleClose}
          disabled={loading}
          sx={{ 
            borderRadius: '12px',
            textTransform: 'none'
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            borderRadius: '12px',
            px: 3,
            textTransform: 'none',
            position: 'relative',
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
            },
          }}
        >
          {loading && (
            <CircularProgress
              size={20}
              sx={{
                color: 'white',
                position: 'absolute',
                left: '50%',
                top: '50%',
                marginLeft: '-10px',
                marginTop: '-10px',
              }}
            />
          )}
          <span style={{ opacity: loading ? 0 : 1 }}>
            Save Changes
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProfileEditModal;