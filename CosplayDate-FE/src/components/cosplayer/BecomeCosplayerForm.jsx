// src/components/cosplayer/BecomeCosplayerForm.jsx - FIXED VERSION
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
    selectedTags: [], // Internal state for UI
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

  // Available tags from backend
  const availableTags = [
    'Beginner Friendly', 'Professional', 'Affordable', 'Premium', 'Quick Response',
    'Custom Outfits', 'Props Included', 'Makeup Included', 'Photography', 'Events',
    'Conventions', 'Photoshoots', 'Group Cosplay', 'Solo Performance', 'Interactive',
    'High Quality', 'Award Winner', 'Experienced', 'Creative', 'Detailed'
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
        : prev.specialties.length < 5
          ? [...prev.specialties, specialty]
          : prev.specialties
    }));
  };

  const handleTagToggle = (tag) => {
    setFormData(prev => ({
      ...prev,
      selectedTags: prev.selectedTags.includes(tag)
        ? prev.selectedTags.filter(t => t !== tag)
        : prev.selectedTags.length < 5
          ? [...prev.selectedTags, tag]
          : prev.selectedTags
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Tên hiển thị là bắt buộc';
    } else if (formData.displayName.trim().length < 2) {
      newErrors.displayName = 'Tên hiển thị phải có ít nhất 2 ký tự';
    }

    const price = parseFloat(formData.pricePerHour);
    if (!formData.pricePerHour || isNaN(price) || price < 1) {
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
      // Log the current user to check authentication
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentToken = localStorage.getItem('token');

      // console.log('🔍 Debug - Current user:', {
        id: currentUser.id,
        email: currentUser.email,
        userType: currentUser.userType,
        hasToken: !!currentToken
      });

      // FIXED: Prepare data to match backend DTO exactly
      const becomeCosplayerData = {
        DisplayName: formData.displayName.trim(),
        PricePerHour: parseFloat(formData.pricePerHour),
        Category: formData.category,
        Gender: formData.gender || null,
        CharacterSpecialty: formData.characterSpecialty?.trim() || null,
        // FIXED: Convert tags array to comma-separated string for backend
        Tags: formData.selectedTags.length > 0 ? formData.selectedTags.join(', ') : null,
        // FIXED: Send specialties as array or null
        Specialties: formData.specialties.length > 0 ? formData.specialties : null,
        AcceptCosplayerTerms: formData.acceptCosplayerTerms
      };

      // console.log('🔄 Submitting become cosplayer data:', becomeCosplayerData);

      const result = await cosplayerAPI.becomeCosplayer(becomeCosplayerData);

      // console.log('📋 API result:', result);

      if (result.success) {
        // SUCCESS: Clear the old token and user data
        // console.log('✅ Successfully became cosplayer! Logging out for new token...');

        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Redirect to login page with message and email
        navigate('/login', {
          state: {
            message: 'Tài khoản của bạn đã được nâng cấp thành Cosplayer! Vui lòng đăng nhập lại để tiếp tục.',
            email: currentUser.email || ''
          }
        });

      } else {
        console.error('❌ API call failed:', {
          message: result.message,
          errors: result.errors
        });

        // Handle specific validation errors
        if (result.errors && typeof result.errors === 'object') {
          const backendErrors = {};

          // Map backend field names to frontend field names
          if (result.errors.DisplayName) {
            backendErrors.displayName = Array.isArray(result.errors.DisplayName)
              ? result.errors.DisplayName[0]
              : result.errors.DisplayName;
          }
          if (result.errors.PricePerHour) {
            backendErrors.pricePerHour = Array.isArray(result.errors.PricePerHour)
              ? result.errors.PricePerHour[0]
              : result.errors.PricePerHour;
          }
          if (result.errors.Category) {
            backendErrors.category = Array.isArray(result.errors.Category)
              ? result.errors.Category[0]
              : result.errors.Category;
          }

          if (Object.keys(backendErrors).length > 0) {
            setErrors(backendErrors);
          } else {
            setError(result.message || 'Không thể hoàn tất đăng ký. Vui lòng thử lại.');
          }
        } else {
          setError(result.message || 'Không thể hoàn tất đăng ký. Vui lòng thử lại.');
        }
      }

    } catch (err) {
      console.error('❌ Unexpected error:', err);
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
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Tags (chọn tối đa 5)
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {availableTags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onClick={() => handleTagToggle(tag)}
                disabled={loading || (formData.selectedTags.length >= 5 && !formData.selectedTags.includes(tag))}
                variant={formData.selectedTags.includes(tag) ? 'filled' : 'outlined'}
                sx={{
                  backgroundColor: formData.selectedTags.includes(tag)
                    ? 'primary.main'
                    : 'transparent',
                  color: formData.selectedTags.includes(tag)
                    ? 'white'
                    : 'text.primary',
                  borderColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: formData.selectedTags.includes(tag)
                      ? 'primary.dark'
                      : 'rgba(233, 30, 99, 0.1)',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
                  },
                }}
              />
            ))}
          </Box>
          {formData.selectedTags.length >= 5 && (
            <Typography variant="caption" sx={{ color: 'warning.main', mt: 1, display: 'block' }}>
              Đã chọn tối đa 5 tags
            </Typography>
          )}
          {formData.selectedTags.length > 0 && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '12px' }}>
              Đã chọn: {formData.selectedTags.join(', ')}
            </Typography>
          )}
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
                  '&.Mui-disabled': {
                    opacity: 0.5,
                    cursor: 'not-allowed',
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
