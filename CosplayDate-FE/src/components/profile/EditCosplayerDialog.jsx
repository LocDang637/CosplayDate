// src/components/profile/EditCosplayerDialog.jsx - Updated with User Profile API
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  InputAdornment,
  FormControlLabel,
  Switch,
  IconButton,
  Alert,
  CircularProgress,
  Autocomplete,
  Typography,
  Divider
} from '@mui/material';
import { Close, Person, LocationOn, CalendarMonth, Info } from '@mui/icons-material';
import { cosplayerAPI } from '../../services/cosplayerAPI';
import { userAPI } from '../../services/api';
import { debugToken, hasValidCosplayerToken } from '../../utils/tokenUtils';

const EditCosplayerDialog = ({ open, onClose, cosplayer, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Split form data into user profile and cosplayer profile sections
  const [userFormData, setUserFormData] = useState({
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    dateOfBirth: ''
  });
  
  const [cosplayerFormData, setCosplayerFormData] = useState({
    displayName: '',
    pricePerHour: 0,
    category: '',
    gender: '',
    characterSpecialty: '',
    tags: '',
    isAvailable: true,
    specialties: []
  });

  // Available options
  const categories = [
    'Anime', 'Game', 'Movie', 'TV Show', 'Comic', 'Original Character',
    'Fantasy', 'Sci-Fi', 'Historical', 'Gothic', 'Kawaii', 'Maid',
    'School Uniform', 'Traditional', 'Modern', 'Other'
  ];

  const genders = ['Male', 'Female', 'Other'];

  const availableSpecialties = [
    'Costume Making', 'Prop Making', 'Wig Styling', 'Makeup Artist',
    'Photography', 'Performance', 'Voice Acting', 'Dancing',
    'Singing', 'Martial Arts', 'Magic Shows', 'Comedy',
    'Character Interaction', 'Event Hosting', 'Workshop Teaching'
  ];

  const availableTags = [
    'Professional', 'High Quality', 'Beginner Friendly', 'Premium',
    'Quick Response', 'Custom Outfits', 'Props Included', 'Makeup Included',
    'Photography', 'Events', 'Conventions', 'Photoshoots', 'Group Cosplay',
    'Solo Performance', 'Interactive', 'Award Winner', 'Experienced',
    'Creative', 'Detailed'
  ];

  // Initialize form data when cosplayer prop changes
  useEffect(() => {
    if (cosplayer && open) {
      // User profile data
      setUserFormData({
        firstName: cosplayer.firstName || '',
        lastName: cosplayer.lastName || '',
        location: cosplayer.location || '',
        bio: cosplayer.bio || '',
        dateOfBirth: cosplayer.dateOfBirth ? new Date(cosplayer.dateOfBirth).toISOString().split('T')[0] : ''
      });
      
      // Cosplayer profile data
      setCosplayerFormData({
        displayName: cosplayer.displayName || '',
        pricePerHour: cosplayer.pricePerHour || 0,
        category: cosplayer.category || '',
        gender: cosplayer.gender || '',
        characterSpecialty: cosplayer.characterSpecialty || '',
        tags: Array.isArray(cosplayer.tags) ? cosplayer.tags.join(', ') : cosplayer.tags || '',
        isAvailable: cosplayer.isAvailable !== undefined ? cosplayer.isAvailable : true,
        specialties: cosplayer.specialties || []
      });
      setError('');
    }
  }, [cosplayer, open]);

  // Handle user profile field changes
  const handleUserFieldChange = (field) => (event) => {
    const value = event.target.value;
    setUserFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  // Handle cosplayer profile field changes
  const handleCosplayerFieldChange = (field) => (event) => {
    const value = event.target.value;
    setCosplayerFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSpecialtiesChange = (event, newValue) => {
    setCosplayerFormData(prev => ({
      ...prev,
      specialties: newValue
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setCosplayerFormData(prev => ({
      ...prev,
      tags: newValue.join(', ')
    }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');

      // Debug token before making the request
      console.log('🔍 Checking token before update...');
      debugToken();

      // Check if token has valid cosplayer claims
      if (!hasValidCosplayerToken()) {
        setError('Your session needs to be refreshed. Please log in again.');
        setTimeout(() => {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
        return;
      }

      // Validate required fields
      if (!userFormData.firstName.trim() || !userFormData.lastName.trim()) {
        setError('Tên và họ không được để trống');
        return;
      }

      if (!cosplayerFormData.displayName.trim()) {
        setError('Tên hiển thị không được để trống');
        return;
      }

      if (cosplayerFormData.pricePerHour < 0) {
        setError('Giá phải lớn hơn hoặc bằng 0');
        return;
      }

      // Update both user profile and cosplayer profile
      console.log('Updating profiles...');

      // 1. Update user profile first
      const userUpdateData = {
        firstName: userFormData.firstName.trim(),
        lastName: userFormData.lastName.trim(),
        location: userFormData.location.trim() || null,
        bio: userFormData.bio.trim() || null,
        dateOfBirth: userFormData.dateOfBirth || null
      };

      const userResult = await userAPI.updateProfile(userUpdateData);

      if (!userResult.success) {
        setError(userResult.message || 'Failed to update user profile');
        return;
      }

      // 2. Update cosplayer profile
      const cosplayerUpdateData = {
        displayName: cosplayerFormData.displayName.trim(),
        pricePerHour: Number(cosplayerFormData.pricePerHour),
        category: cosplayerFormData.category,
        gender: cosplayerFormData.gender,
        characterSpecialty: cosplayerFormData.characterSpecialty.trim(),
        tags: cosplayerFormData.tags.trim(),
        isAvailable: cosplayerFormData.isAvailable,
        specialties: cosplayerFormData.specialties
      };

      const cosplayerResult = await cosplayerAPI.updateProfile(cosplayerUpdateData);

      if (cosplayerResult.success) {
        // Merge both results for the callback
        const mergedData = {
          ...userResult.data,
          ...cosplayerResult.data
        };
        
        onUpdateSuccess?.(mergedData);
        onClose();
      } else {
        // Check if it's an auth error
        if (cosplayerResult.message?.includes('403') || cosplayerResult.message?.includes('unauthorized')) {
          setError('Authentication error. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(cosplayerResult.message || 'Cập nhật thất bại. Vui lòng thử lại.');
        }
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Đã xảy ra lỗi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTags = () => {
    if (!cosplayerFormData.tags) return [];
    return cosplayerFormData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
            Cập nhật thông tin cá nhân và hồ sơ Cosplayer
          </Typography>
        </Box>
        <IconButton onClick={onClose} disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ p: 3 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '12px' }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* User Profile Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Person /> Thông tin cá nhân
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Name Row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Họ"
                    value={userFormData.firstName}
                    onChange={handleUserFieldChange('firstName')}
                    fullWidth
                    required
                    disabled={loading}
                  />
                  <TextField
                    label="Tên"
                    value={userFormData.lastName}
                    onChange={handleUserFieldChange('lastName')}
                    fullWidth
                    required
                    disabled={loading}
                  />
                </Box>

                {/* Location */}
                <TextField
                  label="Địa điểm"
                  value={userFormData.location}
                  onChange={handleUserFieldChange('location')}
                  fullWidth
                  disabled={loading}
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
                  value={userFormData.dateOfBirth}
                  onChange={handleUserFieldChange('dateOfBirth')}
                  fullWidth
                  disabled={loading}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarMonth />
                      </InputAdornment>
                    ),
                  }}
                  helperText="Bạn phải từ 18 tuổi trở lên"
                />

                {/* Bio */}
                <TextField
                  label="Giới thiệu bản thân"
                  value={userFormData.bio}
                  onChange={handleUserFieldChange('bio')}
                  fullWidth
                  multiline
                  rows={3}
                  disabled={loading}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Info />
                      </InputAdornment>
                    ),
                  }}
                  helperText={`${userFormData.bio.length}/1000 ký tự`}
                />
              </Box>
            </Box>

            <Divider />

            {/* Cosplayer Profile Section */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                🎭 Thông tin Cosplayer
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Display Name */}
                <TextField
                  label="Tên hiển thị"
                  value={cosplayerFormData.displayName}
                  onChange={handleCosplayerFieldChange('displayName')}
                  fullWidth
                  required
                  disabled={loading}
                  helperText="Tên sẽ được hiển thị trên hồ sơ Cosplayer của bạn"
                />

                {/* Price and Availability Row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Giá theo giờ"
                    type="number"
                    value={cosplayerFormData.pricePerHour}
                    onChange={handleCosplayerFieldChange('pricePerHour')}
                    sx={{ flex: 1 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₫/giờ</InputAdornment>,
                    }}
                    disabled={loading}
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={cosplayerFormData.isAvailable}
                        onChange={(e) => setCosplayerFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                        color="primary"
                        disabled={loading}
                      />
                    }
                    label="Có sẵn"
                    sx={{ ml: 2 }}
                  />
                </Box>

                {/* Category and Gender Row */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <FormControl fullWidth>
                    <InputLabel>Thể loại</InputLabel>
                    <Select
                      value={cosplayerFormData.category}
                      onChange={handleCosplayerFieldChange('category')}
                      label="Thể loại"
                      disabled={loading}
                    >
                      {categories.map(cat => (
                        <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel>Giới tính</InputLabel>
                    <Select
                      value={cosplayerFormData.gender}
                      onChange={handleCosplayerFieldChange('gender')}
                      label="Giới tính"
                      disabled={loading}
                    >
                      {genders.map(g => (
                        <MenuItem key={g} value={g}>{g}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {/* Character Specialty */}
                <TextField
                  label="Nhân vật chuyên môn"
                  value={cosplayerFormData.characterSpecialty}
                  onChange={handleCosplayerFieldChange('characterSpecialty')}
                  fullWidth
                  disabled={loading}
                  helperText="Ví dụ: Nezuko, Gojo Satoru, Yor Forger..."
                />

                {/* Specialties */}
                <Autocomplete
                  multiple
                  options={availableSpecialties}
                  value={cosplayerFormData.specialties}
                  onChange={handleSpecialtiesChange}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Kỹ năng đặc biệt"
                      helperText="Chọn các kỹ năng bạn có"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...otherProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...otherProps}
                          size="small"
                          color="primary"
                        />
                      );
                    })
                  }
                />

                {/* Tags */}
                <Autocomplete
                  multiple
                  freeSolo
                  options={availableTags}
                  value={getCurrentTags()}
                  onChange={handleTagsChange}
                  disabled={loading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Nhãn/Tags"
                      helperText="Thêm nhãn để khách hàng dễ tìm thấy bạn"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...otherProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option}
                          {...otherProps}
                          size="small"
                          sx={{
                            bgcolor: 'rgba(233, 30, 99, 0.1)',
                            color: 'primary.main'
                          }}
                        />
                      );
                    })
                  }
                />
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: 'none' }}
        >
          Hủy
        </Button>
        <Button
          onClick={handleSubmit}
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

export default EditCosplayerDialog;