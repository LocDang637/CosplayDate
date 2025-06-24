// src/components/profile/EditCosplayerDialog.jsx
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
  Typography
} from '@mui/material';
import { Close } from '@mui/icons-material';
import { cosplayerAPI } from '../../services/cosplayerAPI';
import { debugToken, hasValidCosplayerToken } from '../../utils/tokenUtils';

const EditCosplayerDialog = ({ open, onClose, cosplayer, onUpdateSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
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
      setFormData({
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

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleSpecialtiesChange = (event, newValue) => {
    setFormData(prev => ({
      ...prev,
      specialties: newValue
    }));
  };

  const handleTagsChange = (event, newValue) => {
    setFormData(prev => ({
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
      if (!formData.displayName.trim()) {
        setError('Tên hiển thị không được để trống');
        return;
      }

      if (formData.pricePerHour < 0) {
        setError('Giá phải lớn hơn hoặc bằng 0');
        return;
      }

      // Prepare data for API
      const updateData = {
        displayName: formData.displayName.trim(),
        pricePerHour: Number(formData.pricePerHour),
        category: formData.category,
        gender: formData.gender,
        characterSpecialty: formData.characterSpecialty.trim(),
        tags: formData.tags.trim(),
        isAvailable: formData.isAvailable,
        specialties: formData.specialties
      };

      console.log('Updating cosplayer profile:', updateData);

      const result = await cosplayerAPI.updateProfile(updateData);

      if (result.success) {
        onUpdateSuccess?.(result.data);
        onClose();
      } else {
        // Check if it's an auth error
        if (result.message?.includes('403') || result.message?.includes('unauthorized')) {
          setError('Authentication error. Please log in again.');
          setTimeout(() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }, 2000);
        } else {
          setError(result.message || 'Cập nhật thất bại. Vui lòng thử lại.');
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
    if (!formData.tags) return [];
    return formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
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
            Chỉnh sửa hồ sơ Cosplayer
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Cập nhật thông tin để thu hút nhiều khách hàng hơn
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

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Display Name */}
            <TextField
              label="Tên hiển thị"
              value={formData.displayName}
              onChange={handleChange('displayName')}
              fullWidth
              required
              disabled={loading}
              helperText="Tên sẽ được hiển thị trên hồ sơ của bạn"
            />

            {/* Price and Availability Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Giá theo giờ"
                type="number"
                value={formData.pricePerHour}
                onChange={handleChange('pricePerHour')}
                fullWidth
                disabled={loading}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/giờ</InputAdornment>,
                }}
                helperText="Để 0 nếu muốn thương lượng"
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAvailable}
                    onChange={(e) => setFormData(prev => ({ ...prev, isAvailable: e.target.checked }))}
                    color="primary"
                    disabled={loading}
                  />
                }
                label="Sẵn sàng nhận đơn"
                sx={{ minWidth: 200 }}
              />
            </Box>

            {/* Category and Gender Row */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth disabled={loading}>
                <InputLabel>Thể loại</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleChange('category')}
                  label="Thể loại"
                >
                  <MenuItem value="">
                    <em>Chọn thể loại</em>
                  </MenuItem>
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={loading}>
                <InputLabel>Giới tính</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleChange('gender')}
                  label="Giới tính"
                >
                  <MenuItem value="">
                    <em>Chọn giới tính</em>
                  </MenuItem>
                  {genders.map(gender => (
                    <MenuItem key={gender} value={gender}>{gender}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Character Specialty */}
            <TextField
              label="Chuyên môn nhân vật"
              value={formData.characterSpecialty}
              onChange={handleChange('characterSpecialty')}
              fullWidth
              disabled={loading}
              helperText="VD: Nhân vật anime mạnh mẽ, Nhân vật game chiến thuật..."
            />

            {/* Specialties */}
            <Autocomplete
              multiple
              options={availableSpecialties}
              value={formData.specialties}
              onChange={handleSpecialtiesChange}
              disabled={loading}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Kỹ năng chuyên môn"
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
                      sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '& .MuiChip-deleteIcon': { color: 'rgba(255,255,255,0.7)' }
                      }}
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