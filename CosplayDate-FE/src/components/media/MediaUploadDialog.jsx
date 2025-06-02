// src/components/media/MediaUploadDialog.jsx
import React, { useState } from 'react';
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
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Close,
  CloudUpload,
  PhotoCamera,
  Videocam
} from '@mui/icons-material';
import { cosplayerMediaAPI } from '../../services/cosplayerAPI';

const MediaUploadDialog = ({ 
  open, 
  onClose, 
  type = 'photo', // 'photo' or 'video'
  onUploadSuccess 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPrivate: false
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null); // For videos
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const categories = [
    { value: 'anime', label: 'Anime' },
    { value: 'game', label: 'Game' },
    { value: 'movie', label: 'Phim' },
    { value: 'original', label: 'Nhân vật gốc' },
    { value: 'event', label: 'Sự kiện' },
    { value: 'photoshoot', label: 'Chụp ảnh' },
    { value: 'other', label: 'Khác' }
  ];

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleFileSelect = (e, fileType = 'main') => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (type === 'photo' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, file: 'Vui lòng chọn file hình ảnh' }));
      return;
    }
    
    if (type === 'video' && fileType === 'main' && !file.type.startsWith('video/')) {
      setErrors(prev => ({ ...prev, file: 'Vui lòng chọn file video' }));
      return;
    }

    if (fileType === 'thumbnail' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, thumbnail: 'Vui lòng chọn file hình ảnh cho thumbnail' }));
      return;
    }

    // Validate file size
    const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for photos, 100MB for videos
    if (file.size > maxSize) {
      const maxSizeText = type === 'photo' ? '10MB' : '100MB';
      setErrors(prev => ({ ...prev, file: `File không được vượt quá ${maxSizeText}` }));
      return;
    }

    if (fileType === 'thumbnail') {
      setThumbnailFile(file);
    } else {
      setSelectedFile(file);
      
      // Create preview for images
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(file);
      } else {
        setPreview(null);
      }
    }

    // Clear file errors
    setErrors(prev => ({ ...prev, file: '', thumbnail: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedFile) {
      newErrors.file = 'Vui lòng chọn file';
    }
    
    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề là bắt buộc';
    }
    
    if (!formData.category) {
      newErrors.category = 'Vui lòng chọn danh mục';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setApiError('');
    
    try {
      let result;
      
      if (type === 'photo') {
        result = await cosplayerMediaAPI.uploadPhoto({
          file: selectedFile,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          isPrivate: formData.isPrivate
        });
      } else {
        result = await cosplayerMediaAPI.uploadVideo({
          videoFile: selectedFile,
          thumbnailFile: thumbnailFile,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          isPrivate: formData.isPrivate
        });
      }

      if (result.success) {
        onUploadSuccess?.(result.data);
        handleClose();
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setApiError(result.message || 'Tải lên thất bại');
        }
      }
      
    } catch (error) {
      setApiError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ title: '', description: '', category: '', isPrivate: false });
      setSelectedFile(null);
      setThumbnailFile(null);
      setPreview(null);
      setErrors({});
      setApiError('');
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
          {type === 'photo' ? <PhotoCamera sx={{ color: 'primary.main' }} /> : <Videocam sx={{ color: 'primary.main' }} />}
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {type === 'photo' ? 'Tải lên ảnh' : 'Tải lên video'}
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
          {/* File Upload */}
          <Grid item xs={12}>
            <Box
              sx={{
                border: '2px dashed',
                borderColor: errors.file ? 'error.main' : 'primary.main',
                borderRadius: '12px',
                p: 4,
                textAlign: 'center',
                backgroundColor: errors.file ? 'rgba(244, 67, 54, 0.05)' : 'rgba(233, 30, 99, 0.05)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: errors.file ? 'rgba(244, 67, 54, 0.1)' : 'rgba(233, 30, 99, 0.1)',
                },
              }}
              onClick={() => document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept={type === 'photo' ? 'image/*' : 'video/*'}
                onChange={(e) => handleFileSelect(e, 'main')}
                style={{ display: 'none' }}
                disabled={loading}
              />
              
              <CloudUpload sx={{ fontSize: 48, color: errors.file ? 'error.main' : 'primary.main', mb: 2 }} />
              
              {selectedFile ? (
                <Typography variant="body1" sx={{ fontWeight: 600, color: 'success.main' }}>
                  ✓ {selectedFile.name}
                </Typography>
              ) : (
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Nhấp để chọn {type === 'photo' ? 'hình ảnh' : 'video'}
                </Typography>
              )}
              
              {errors.file && (
                <Typography variant="body2" sx={{ color: 'error.main', mt: 1 }}>
                  {errors.file}
                </Typography>
              )}
            </Box>
          </Grid>

          {/* Thumbnail for videos */}
          {type === 'video' && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Thumbnail (Tùy chọn)
              </Typography>
              <Box
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  p: 2,
                  textAlign: 'center',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.05)' },
                }}
                onClick={() => document.getElementById('thumbnail-input').click()}
              >
                <input
                  id="thumbnail-input"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e, 'thumbnail')}
                  style={{ display: 'none' }}
                  disabled={loading}
                />
                
                {thumbnailFile ? (
                  <Typography variant="body2" sx={{ color: 'success.main' }}>
                    ✓ {thumbnailFile.name}
                  </Typography>
                ) : (
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Chọn thumbnail cho video
                  </Typography>
                )}
              </Box>
            </Grid>
          )}

          {/* Preview */}
          {preview && (
            <Grid item xs={12}>
              <Box sx={{ textAlign: 'center' }}>
                <img
                  src={preview}
                  alt="Preview"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '200px',
                    borderRadius: '8px',
                    objectFit: 'contain'
                  }}
                />
              </Box>
            </Grid>
          )}

          {/* Title */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tiêu đề"
              value={formData.title}
              onChange={handleInputChange('title')}
              error={!!errors.title}
              helperText={errors.title}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          {/* Description */}
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleInputChange('description')}
              error={!!errors.description}
              helperText={errors.description}
              disabled={loading}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />
          </Grid>

          {/* Category */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth error={!!errors.category}>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={formData.category}
                onChange={handleInputChange('category')}
                label="Danh mục"
                disabled={loading}
                sx={{ borderRadius: '12px' }}
              >
                {categories.map((category) => (
                  <MenuItem key={category.value} value={category.value}>
                    {category.label}
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

          {/* Privacy */}
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isPrivate}
                  onChange={handleInputChange('isPrivate')}
                  disabled={loading}
                  color="primary"
                />
              }
              label="Riêng tư"
              sx={{ mt: 2 }}
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
          Hủy
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={loading || !selectedFile}
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
            {loading ? 'Đang tải lên...' : 'Tải lên'}
          </span>
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default MediaUploadDialog;