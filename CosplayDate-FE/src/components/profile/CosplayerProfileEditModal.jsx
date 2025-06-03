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
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Close,
  Person,
  AttachMoney,
  Category,
  LocationOn,
  Description
} from '@mui/icons-material';
import { cosplayerAPI } from '../../services/cosplayerAPI';
import { userAPI } from '../../services/api';

const CosplayerProfileEditModal = ({ 
    
  open, 
  onClose, 
  user, 
  onProfileUpdated,
  userType = 'customer' // 'customer' or 'cosplayer'
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    location: '',
    // Cosplayer specific fields
    displayName: '',
    pricePerHour: '',
    category: '',
    gender: '',
    characterSpecialty: '',
    tags: '',
    isAvailable: true,
    specialties: []
  });
  const [errors, setErrors] = useState({});

  const categories = [
    'Anime', 'Game', 'Movie', 'TV Show', 'Comic', 'Original Character',
    'Fantasy', 'Sci-Fi', 'Historical', 'Gothic', 'Kawaii', 'Maid',
    'School Uniform', 'Traditional', 'Modern', 'Other'
  ];

  const specialtiesOptions = [
    'Costume Making', 'Prop Making', 'Wig Styling', 'Makeup Artist',
    'Photography', 'Performance', 'Voice Acting', 'Dancing',
    'Singing', 'Martial Arts', 'Magic Shows', 'Comedy',
    'Character Interaction', 'Event Hosting', 'Workshop Teaching'
  ];

  const genderOptions = ['Male', 'Female', 'Other'];

  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        location: user.location || '',
        displayName: user.displayName || '',
        pricePerHour: user.pricePerHour || '',
        category: user.category || '',
        gender: user.gender || '',
        characterSpecialty: user.characterSpecialty || '',
        tags: user.tags || '',
        isAvailable: user.isAvailable !== undefined ? user.isAvailable : true,
        specialties: user.specialties || []
      });
      setErrors({});
      setError('');
    }
  }, [user, open]);

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (error) setError('');
  };

  const handleSpecialtyToggle = (specialty) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty].slice(0, 5) // Max 5 specialties
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Tên là bắt buộc';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Họ là bắt buộc';
    }
    
    if (userType === 'cosplayer') {
      if (!formData.displayName.trim()) {
        newErrors.displayName = 'Tên hiển thị là bắt buộc';
      }
      
      if (!formData.pricePerHour || parseFloat(formData.pricePerHour) < 1) {
        newErrors.pricePerHour = 'Giá phải từ 1đ trở lên';
      }
      
      if (!formData.category) {
        newErrors.category = 'Vui lòng chọn danh mục';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      let result;
      
      if (userType === 'cosplayer') {
        const cosplayerData = {
          displayName: formData.displayName.trim(),
          pricePerHour: parseFloat(formData.pricePerHour),
          category: formData.category,
          gender: formData.gender || null,
          characterSpecialty: formData.characterSpecialty?.trim() || null,
          tags: formData.tags?.trim() || null,
          isAvailable: formData.isAvailable,
          specialties: formData.specialties.length > 0 ? formData.specialties : null
        };
        result = await cosplayerAPI.updateProfile(cosplayerData);
      } else {
        const userData = {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          bio: formData.bio?.trim() || null,
          location: formData.location?.trim() || null
        };
        result = await userAPI.updateProfile(userData);
      }
      
      if (result.success) {
        const updatedData = { ...user, ...formData };
        if (onProfileUpdated) {
          onProfileUpdated(updatedData);
        }
        onClose();
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setError(result.message || 'Không thể cập nhật hồ sơ. Vui lòng thử lại.');
        }
      }
      
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
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
      PaperProps={{
        sx: { borderRadius: '16px' }
      }}
    >
      <DialogTitle sx={{ pb: 1, pr: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Person sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Chỉnh sửa hồ sơ {userType === 'cosplayer' ? 'Cosplayer' : ''}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
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
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3, borderRadius: '12px' }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Tên"
              value={formData.firstName}
              onChange={handleInputChange('firstName')}
              error={!!errors.firstName}
              helperText={errors.firstName}
              disabled={loading}
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
              label="Họ"
              value={formData.lastName}
              onChange={handleInputChange('lastName')}
              error={!!errors.lastName}
              helperText={errors.lastName}
              disabled={loading}
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
              label="Giới thiệu"
              multiline
              rows={3}
              value={formData.bio}
              onChange={handleInputChange('bio')}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
              InputProps={{
                startAdornment: <Description sx={{ color: 'primary.main', mr: 1, mt: 1 }} />
              }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Khu vực"
              value={formData.location}
              onChange={handleInputChange('location')}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
              InputProps={{
                startAdornment: <LocationOn sx={{ color: 'primary.main', mr: 1 }} />
              }}
            />
          </Grid>

          {/* Cosplayer specific fields */}
          {userType === 'cosplayer' && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Tên hiển thị"
                  value={formData.displayName}
                  onChange={handleInputChange('displayName')}
                  error={!!errors.displayName}
                  helperText={errors.displayName}
                  disabled={loading}
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
                  label="Giá mỗi giờ (VNĐ)"
                  type="number"
                  value={formData.pricePerHour}
                  onChange={handleInputChange('pricePerHour')}
                  error={!!errors.pricePerHour}
                  helperText={errors.pricePerHour}
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                  InputProps={{
                    startAdornment: <AttachMoney sx={{ color: 'primary.main', mr: 1 }} />
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Danh mục chính</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={handleInputChange('category')}
                    label="Danh mục chính"
                    disabled={loading}
                    sx={{ borderRadius: '12px' }}
                    startAdornment={<Category sx={{ color: 'primary.main', mr: 1 }} />}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.category && (
                    <Typography variant="caption" sx={{ color: 'error.main', ml: 2, mt: 0.5 }}>
                      {errors.category}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Giới tính</InputLabel>
                  <Select
                    value={formData.gender}
                    onChange={handleInputChange('gender')}
                    label="Giới tính"
                    disabled={loading}
                    sx={{ borderRadius: '12px' }}
                  >
                    {genderOptions.map((gender) => (
                      <MenuItem key={gender} value={gender}>
                        {gender === 'Male' ? 'Nam' : gender === 'Female' ? 'Nữ' : 'Khác'}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Chuyên môn nhân vật"
                  value={formData.characterSpecialty}
                  onChange={handleInputChange('characterSpecialty')}
                  disabled={loading}
                  placeholder="VD: Anime characters, Game heroes..."
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
                  label="Tags (phân cách bằng dấu phẩy)"
                  value={formData.tags}
                  onChange={handleInputChange('tags')}
                  disabled={loading}
                  placeholder="VD: professional, high-quality, creative..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Kỹ năng đặc biệt (tối đa 5)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {specialtiesOptions.map((specialty) => (
                    <Chip
                      key={specialty}
                      label={specialty}
                      onClick={() => handleSpecialtyToggle(specialty)}
                      disabled={loading || (formData.specialties.length >= 5 && !formData.specialties.includes(specialty))}
                      variant={formData.specialties.includes(specialty) ? 'filled' : 'outlined'}
                      sx={{
                        backgroundColor: formData.specialties.includes(specialty) 
                          ? 'primary.main' 
                          : 'transparent',
                        color: formData.specialties.includes(specialty) 
                          ? 'white' 
                          : 'text.primary',
                        borderColor: 'primary.main',
                        '&:hover': {
                          backgroundColor: formData.specialties.includes(specialty)
                            ? 'primary.dark'
                            : 'rgba(233, 30, 99, 0.1)',
                        },
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isAvailable}
                      onChange={handleInputChange('isAvailable')}
                      disabled={loading}
                      color="primary"
                    />
                  }
                  label="Sẵn sàng nhận đơn"
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button 
          onClick={onClose}
          disabled={loading}
          sx={{ 
            borderRadius: '12px',
            textTransform: 'none'
          }}
        >
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
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
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CosplayerProfileEditModal;