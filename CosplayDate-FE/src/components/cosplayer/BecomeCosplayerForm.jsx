// src/components/cosplayer/BecomeCosplayerForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  TheaterComedy,
  AttachMoney,
  Category,
  Person,
  Star,
  Label
} from '@mui/icons-material';
import { cosplayerAPI } from '../../services/cosplayerAPI';

const BecomeCosplayerForm = ({ user, onSuccess }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
    pricePerHour: '',
    category: '',
    gender: user?.gender || '',
    characterSpecialty: '',
    tags: '',
    specialties: [],
    acceptCosplayerTerms: false
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
        : [...prev.specialties, specialty]
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Tên hiển thị là bắt buộc';
    }
    
    if (!formData.pricePerHour || parseFloat(formData.pricePerHour) < 1) {
      newErrors.pricePerHour = 'Giá phải từ 1đ trở lên';
    }
    
    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }
    
    if (!formData.acceptCosplayerTerms) {
      newErrors.acceptCosplayerTerms = 'Bạn phải chấp nhận điều khoản';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    
    try {
      const becomeCosplayerData = {
        displayName: formData.displayName.trim(),
        pricePerHour: parseFloat(formData.pricePerHour),
        category: formData.category,
        gender: formData.gender || null,
        characterSpecialty: formData.characterSpecialty?.trim() || null,
        tags: formData.tags?.trim() || null,
        specialties: formData.specialties.length > 0 ? formData.specialties : null,
        acceptCosplayerTerms: formData.acceptCosplayerTerms
      };

      const result = await cosplayerAPI.becomeCosplayer(becomeCosplayerData);
      
      if (result.success) {
        const updatedUser = { 
          ...user, 
          userType: 'Cosplayer',
          cosplayerId: result.data.cosplayerId 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (onSuccess) {
          onSuccess(updatedUser, result.data);
        } else {
          navigate(`/profile/${updatedUser.id}`, { 
            state: { 
              message: result.data.message || 'Chúc mừng! Bạn đã trở thành Cosplayer.',
              upgraded: true 
            }
          });
        }
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setError(result.message || 'Không thể hoàn tất đăng ký. Vui lòng thử lại.');
        }
      }
      
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      sx={{
        maxWidth: '800px',
        mx: 'auto',
        p: 4,
        borderRadius: '24px',
        background: 'rgba(255,255,255,0.95)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
      }}
    >
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <TheaterComedy 
          sx={{ 
            fontSize: 48, 
            color: 'primary.main', 
            mb: 2 
          }} 
        />
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
            mb: 1,
          }}
        >
          Trở thành Cosplayer
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: 'text.secondary',
            maxWidth: '500px',
            mx: 'auto',
          }}
        >
          Hoàn thiện thông tin để bắt đầu hành trình cosplayer của bạn
        </Typography>
      </Box>

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
            InputProps={{
              startAdornment: <Person sx={{ color: 'primary.main', mr: 1 }} />
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
            placeholder="VD: Anime characters, Game heroes, Original characters..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
            InputProps={{
              startAdornment: <Star sx={{ color: 'primary.main', mr: 1 }} />
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
            placeholder="VD: professional, high-quality, creative, experienced..."
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
              }
            }}
            InputProps={{
              startAdornment: <Label sx={{ color: 'primary.main', mr: 1 }} />
            }}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Kỹ năng đặc biệt (chọn tối đa 5)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {specialtiesOptions.map((specialty) => (
              <Chip
                key={specialty}
                label={specialty}
                onClick={() => handleSpecialtyToggle(specialty)}
                disabled={loading}
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
          {formData.specialties.length >= 5 && (
            <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'block' }}>
              Đã chọn tối đa 5 kỹ năng
            </Typography>
          )}
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.acceptCosplayerTerms}
            onChange={handleInputChange('acceptCosplayerTerms')}
            disabled={loading}
            sx={{
              color: 'primary.main',
              '&.Mui-checked': { color: 'primary.main' },
            }}
          />
        }
        label={
          <Typography variant="body2" sx={{ fontSize: '14px' }}>
            Tôi đồng ý với{' '}
            <Typography 
              component="span"
              sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => navigate('/cosplayer-policy')}
            >
              điều khoản và chính sách Cosplayer
            </Typography>
            {' '}và cam kết cung cấp dịch vụ chuyên nghiệp.
          </Typography>
        }
        sx={{ 
          alignItems: 'flex-start',
          mb: 3
        }}
      />
      
      {errors.acceptCosplayerTerms && (
        <Typography variant="body2" sx={{ color: 'error.main', fontSize: '12px', mb: 2 }}>
          {errors.acceptCosplayerTerms}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          disabled={loading}
          sx={{
            borderColor: 'text.secondary',
            color: 'text.secondary',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          Hủy bỏ
        </Button>
        
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            px: 4,
            py: 1.5,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            minWidth: '200px',
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
            {loading ? 'Đang xử lý...' : 'Trở thành Cosplayer'}
          </span>
        </Button>
      </Box>
    </Paper>
  );
};

export default BecomeCosplayerForm;