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
  FormControlLabel,
  Chip,
  LinearProgress,
  Fade,
  Slide,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  Autocomplete
} from '@mui/material';
import {
  Close,
  CloudUpload,
  PhotoCamera,
  Videocam,
  Image,
  VideoFile,
  CheckCircle,
  Error as ErrorIcon,
  Info,
  Settings,
  Publish,
  Lock,
  Public,
  Star,
  Delete,
  Edit
} from '@mui/icons-material';
import { cosplayerMediaAPI } from '../../services/cosplayerAPI';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const MediaUploadDialog = ({ 
  open, 
  onClose, 
  type = 'photo',
  onUploadSuccess 
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPortfolio: false,
    tags: [],
    duration: 0,
    displayOrder: 0
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const steps = ['Upload File', 'Add Details', 'Review & Publish'];

  const photoCategories = [
    { value: 'Cosplay', label: '🎭 Cosplay', color: '#E91E63' },
    { value: 'Portrait', label: '👤 Portrait', color: '#9C27B0' },
    { value: 'Action', label: '⚡ Action', color: '#FF5722' },
    { value: 'Group', label: '👥 Group', color: '#2196F3' },
    { value: 'Behind the Scenes', label: '🎬 Behind the Scenes', color: '#FF9800' },
    { value: 'Props', label: '🛡️ Props', color: '#4CAF50' },
    { value: 'Makeup', label: '💄 Makeup', color: '#E91E63' },
    { value: 'Work in Progress', label: '🔧 Work in Progress', color: '#FFC107' },
    { value: 'Convention', label: '🎪 Convention', color: '#9C27B0' },
    { value: 'Photoshoot', label: '📸 Photoshoot', color: '#00BCD4' },
    { value: 'Other', label: '📂 Other', color: '#607D8B' }
  ];

  const videoCategories = [
    { value: 'Performance', label: '🎭 Performance', color: '#E91E63' },
    { value: 'Tutorial', label: '📚 Tutorial', color: '#4CAF50' },
    { value: 'Behind the Scenes', label: '🎬 Behind the Scenes', color: '#FF9800' },
    { value: 'Transformation', label: '✨ Transformation', color: '#9C27B0' },
    { value: 'Convention', label: '🎪 Convention', color: '#2196F3' },
    { value: 'Dance', label: '💃 Dance', color: '#E91E63' },
    { value: 'Skit', label: '🎪 Skit', color: '#FF5722' },
    { value: 'Voice Acting', label: '🎤 Voice Acting', color: '#00BCD4' },
    { value: 'Review', label: '⭐ Review', color: '#FFC107' },
    { value: 'Other', label: '📂 Other', color: '#607D8B' }
  ];

  const categories = type === 'photo' ? photoCategories : videoCategories;

  const handleClose = () => {
    if (!loading) {
      // Reset all state
      setActiveStep(0);
      setFormData({
        title: '',
        description: '',
        category: '',
        isPortfolio: false,
        tags: [],
        duration: 0,
        displayOrder: 0
      });
      setSelectedFile(null);
      setThumbnailFile(null);
      setPreview(null);
      setErrors({});
      setApiError('');
      setUploadProgress(0);
      onClose();
    }
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedFile) {
      setErrors({ file: 'Please select a file to upload' });
      return;
    }
    if (activeStep === 1 && !validateDetails()) {
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const validateDetails = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  const handleFileSelect = (e, fileType = 'main') => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (type === 'photo' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, file: 'Please select an image file' }));
      return;
    }
    
    if (type === 'video' && fileType === 'main' && !file.type.startsWith('video/')) {
      setErrors(prev => ({ ...prev, file: 'Please select a video file' }));
      return;
    }

    if (fileType === 'thumbnail' && !file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, thumbnail: 'Thumbnail must be an image' }));
      return;
    }

    // Validate file size
    const maxSize = type === 'photo' ? 10 * 1024 * 1024 : 100 * 1024 * 1024;
    if (file.size > maxSize) {
      const maxSizeText = type === 'photo' ? '10MB' : '100MB';
      setErrors(prev => ({ ...prev, file: `File size cannot exceed ${maxSizeText}` }));
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
      } else if (file.type.startsWith('video/')) {
        // Get video duration
        const video = document.createElement('video');
        video.preload = 'metadata';
        video.onloadedmetadata = () => {
          window.URL.revokeObjectURL(video.src);
          const duration = Math.round(video.duration);
          setFormData(prev => ({ ...prev, duration }));
          console.log('Video duration detected:', duration, 'seconds');
        };
        video.src = URL.createObjectURL(file);
        setPreview(null);
      } else {
        setPreview(null);
      }
    }

    // Clear file errors
    setErrors(prev => ({ ...prev, file: '', thumbnail: '' }));
  };

  const handleUpload = async () => {
    setLoading(true);
    setApiError('');
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 300);
    
    try {
      let result;
      
      if (type === 'photo') {
        result = await cosplayerMediaAPI.uploadPhoto({
          file: selectedFile,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          isPortfolio: formData.isPortfolio,
          displayOrder: 0,
          tags: formData.tags || []
        });
      } else {
        result = await cosplayerMediaAPI.uploadVideo({
          videoFile: selectedFile,
          thumbnailFile: thumbnailFile,
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          duration: formData.duration,
          displayOrder: formData.displayOrder || 0
        });
      }

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setTimeout(() => {
          onUploadSuccess?.(result.data);
          handleClose();
        }, 500);
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setErrors(result.errors);
        } else {
          setApiError(result.message || 'Upload failed');
        }
        setUploadProgress(0);
      }
      
    } catch (error) {
      clearInterval(progressInterval);
      setApiError('Connection error. Please try again.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ py: 2 }}>
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: '3px dashed',
                borderColor: dragActive ? 'primary.main' : errors.file ? 'error.main' : 'grey.300',
                borderRadius: '20px',
                p: 4,
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                backgroundColor: dragActive ? 'primary.50' : selectedFile ? 'background.default' : 'background.paper',
                '&:hover': {
                  borderColor: 'primary.main',
                  backgroundColor: 'primary.50'
                }
              }}
              onClick={() => !selectedFile && document.getElementById('file-input').click()}
            >
              <input
                id="file-input"
                type="file"
                accept={type === 'photo' ? 'image/*' : 'video/*'}
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />

              {!selectedFile ? (
                <>
                  <Box sx={{ 
                    background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
                    borderRadius: '50%',
                    p: 3,
                    mb: 3
                  }}>
                    <CloudUpload sx={{ fontSize: 48, color: 'white' }} />
                  </Box>
                  <Typography variant="h5" gutterBottom fontWeight={700} color="text.primary">
                    {dragActive ? 'Drop your file here!' : `Upload your ${type}`}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    Drag and drop or click to browse
                  </Typography>
                  <Chip 
                    label={type === 'photo' 
                      ? 'JPEG, PNG, WebP • Max 10MB'
                      : 'MP4, AVI, MOV, WMV, WebM • Max 100MB'
                    }
                    sx={{ 
                      backgroundColor: 'background.paper',
                      fontWeight: 500,
                      fontSize: '0.85rem'
                    }}
                  />
                </>
              ) : (
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  {preview && (
                    <Box sx={{ mb: 3, position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={preview} 
                        alt="Preview" 
                        style={{ 
                          width: '100%',
                          height: 'auto',
                          maxHeight: '300px',
                          maxWidth: '400px',
                          objectFit: 'contain',
                          borderRadius: '16px',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                        }} 
                      />
                      <IconButton
                        sx={{
                          position: 'absolute',
                          top: -12,
                          right: -12,
                          backgroundColor: 'error.main',
                          color: 'white',
                          boxShadow: 3,
                          '&:hover': {
                            backgroundColor: 'error.dark',
                          }
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setPreview(null);
                        }}
                        disabled={loading}
                      >
                        <Close fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  
                  {!preview && (
                    <Box sx={{ 
                      background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
                      borderRadius: '50%',
                      p: 3,
                      mb: 3,
                      display: 'inline-block'
                    }}>
                      {type === 'photo' ? 
                        <Image sx={{ fontSize: 48, color: 'white' }} /> : 
                        <VideoFile sx={{ fontSize: 48, color: 'white' }} />
                      }
                    </Box>
                  )}
                  
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                    {selectedFile.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {formatFileSize(selectedFile.size)}
                  </Typography>
                  
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-input').click();
                    }}
                    disabled={loading}
                    sx={{ borderRadius: '12px' }}
                  >
                    Change File
                  </Button>
                </Box>
              )}
            </Box>
            
            {errors.file && (
              <Alert severity="error" sx={{ mt: 2, borderRadius: '12px' }}>
                {errors.file}
              </Alert>
            )}

            {/* File info for selected file */}
            {selectedFile && (
              <Card sx={{ mt: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <CheckCircle sx={{ color: 'success.main' }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        File ready for upload
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Continue to add details and publish
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>
        );

      case 1:
        return (
          <Box sx={{ py: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={handleInputChange('title')}
                  error={!!errors.title}
                  helperText={errors.title}
                  disabled={loading}
                  required
                  placeholder={`Give your ${type} a catchy title...`}
                  InputProps={{
                    sx: { borderRadius: '12px' }
                  }}
                />
              </Grid>

              {/* Category Selection with Visual Cards */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Category <span style={{ color: 'red' }}>*</span>
                </Typography>
                <Grid container spacing={2}>
                  {categories.map(cat => (
                    <Grid item xs={6} sm={4} md={3} key={cat.value}>
                      <Card
                        sx={{
                          cursor: 'pointer',
                          border: '2px solid',
                          borderColor: formData.category === cat.value ? cat.color : 'divider',
                          borderRadius: '12px',
                          transition: 'all 0.2s ease',
                          backgroundColor: formData.category === cat.value ? `${cat.color}15` : 'background.paper',
                          '&:hover': {
                            borderColor: cat.color,
                            backgroundColor: `${cat.color}10`
                          }
                        }}
                        onClick={() => handleInputChange('category')({ target: { value: cat.value } })}
                      >
                        <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                          <Typography variant="body2" fontWeight={500}>
                            {cat.label}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
                {errors.category && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                    {errors.category}
                  </Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={handleInputChange('description')}
                  multiline
                  rows={4}
                  disabled={loading}
                  placeholder={`Tell people about your ${type}...`}
                  InputProps={{
                    sx: { borderRadius: '12px' }
                  }}
                />
              </Grid>

              {/* Tags Input for Photos */}
              {type === 'photo' && (
                <Grid item xs={12}>
                  <Autocomplete
                    multiple
                    freeSolo
                    options={[]}
                    value={Array.isArray(formData.tags) ? formData.tags : []}
                    onChange={(event, newValue) => {
                      // Filter out empty strings and trim whitespace
                      const cleanTags = newValue
                        .map(tag => typeof tag === 'string' ? tag.trim() : tag)
                        .filter(tag => tag && tag.length > 0);
                      setFormData(prev => ({ ...prev, tags: cleanTags }));
                    }}
                    onInputChange={(event, newInputValue, reason) => {
                      // Handle comma-separated input
                      if (reason === 'input' && newInputValue.includes(',')) {
                        const tags = newInputValue.split(',').map(tag => tag.trim()).filter(tag => tag);
                        if (tags.length > 0) {
                          const currentTags = Array.isArray(formData.tags) ? formData.tags : [];
                          const newTags = [...new Set([...currentTags, ...tags])]; // Remove duplicates
                          setFormData(prev => ({ ...prev, tags: newTags }));
                        }
                      }
                    }}
                    disabled={loading}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => (
                        <Chip
                          variant="outlined"
                          color="primary"
                          size="small"
                          label={option}
                          {...getTagProps({ index })}
                          key={index}
                          disabled={loading}
                        />
                      ))
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Tags"
                        placeholder={formData.tags && formData.tags.length > 0 ? "Add more tags..." : "e.g., anime, manga, character name"}
                        helperText="Type and press Enter to add tags, or separate with commas"
                        InputProps={{
                          ...params.InputProps,
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    )}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '12px'
                      }
                    }}
                  />
                </Grid>
              )}

              {/* Video Thumbnail */}
              {type === 'video' && (
                <>
                  <Grid item xs={12}>
                    <Paper 
                      elevation={0} 
                      sx={{ 
                        p: 3, 
                        borderRadius: '16px',
                        border: '2px dashed',
                        borderColor: 'divider',
                        textAlign: 'center'
                      }}
                    >
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                        Video Thumbnail (Optional)
                      </Typography>
                      {!thumbnailFile ? (
                        <Button
                          variant="outlined"
                          startIcon={<PhotoCamera />}
                          onClick={() => document.getElementById('thumbnail-input').click()}
                          disabled={loading}
                          sx={{ borderRadius: '12px' }}
                        >
                          Choose Thumbnail Image
                        </Button>
                      ) : (
                        <Box>
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {thumbnailFile.name}
                          </Typography>
                          <Button
                            variant="text"
                            size="small"
                            onClick={() => setThumbnailFile(null)}
                            disabled={loading}
                          >
                            Remove
                          </Button>
                        </Box>
                      )}
                      <input
                        id="thumbnail-input"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e, 'thumbnail')}
                        style={{ display: 'none' }}
                      />
                    </Paper>
                  </Grid>

                  {/* Video Duration Display */}
                  {formData.duration > 0 && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Duration (seconds)"
                        value={formData.duration}
                        disabled
                        helperText={`Auto-detected: ${Math.floor(formData.duration / 60)}m ${formData.duration % 60}s`}
                        InputProps={{
                          sx: { borderRadius: '12px' }
                        }}
                      />
                    </Grid>
                  )}

                  {/* Display Order */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Display Order"
                      type="number"
                      value={formData.displayOrder}
                      onChange={handleInputChange('displayOrder')}
                      disabled={loading}
                      helperText="Order in video gallery (0 = first)"
                      InputProps={{
                        inputProps: { min: 0, max: 999 },
                        sx: { borderRadius: '12px' }
                      }}
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box sx={{ py: 2 }}>
            {/* Upload Progress */}
            {loading && (
              <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Uploading your {type}...
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {uploadProgress}%
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={uploadProgress} 
                  sx={{ 
                    height: 12, 
                    borderRadius: 6,
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 6,
                      background: 'linear-gradient(45deg, #E91E63, #9C27B0)'
                    }
                  }}
                />
              </Box>
            )}

            {/* Review Content */}
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Review Your {type === 'photo' ? 'Photo' : 'Video'}
            </Typography>

            <Grid container spacing={3}>
              {/* File Preview */}
              <Grid item xs={12} md={5}>
                <Card sx={{ borderRadius: '16px', overflow: 'hidden' }}>
                  {preview ? (
                    <img 
                      src={preview} 
                      alt="Preview" 
                      style={{ 
                        width: '100%',
                        height: '300px',
                        objectFit: 'cover'
                      }} 
                    />
                  ) : type === 'video' && selectedFile ? (
                    <Box sx={{ 
                      height: '300px', 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'background.default',
                      p: 2
                    }}>
                      <VideoFile sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                        Video Ready for Upload
                      </Typography>
                      <Typography variant="body2" color="text.secondary" align="center">
                        {selectedFile.name}
                      </Typography>
                      {formData.duration > 0 && (
                        <Typography variant="body2" color="primary" sx={{ mt: 1, fontWeight: 600 }}>
                          Duration: {Math.floor(formData.duration / 60)}:{(formData.duration % 60).toString().padStart(2, '0')}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Box sx={{ 
                      height: '300px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      backgroundColor: 'background.default'
                    }}>
                      {type === 'photo' ? 
                        <Image sx={{ fontSize: 64, color: 'text.secondary' }} /> : 
                        <VideoFile sx={{ fontSize: 64, color: 'text.secondary' }} />
                      }
                    </Box>
                  )}
                </Card>
              </Grid>

              {/* Details */}
              <Grid item xs={12} md={7}>
                <Box sx={{ pl: { md: 2 } }}>
                  <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
                    {formData.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip 
                      label={categories.find(c => c.value === formData.category)?.label || formData.category}
                      sx={{ 
                        backgroundColor: categories.find(c => c.value === formData.category)?.color + '20',
                        color: categories.find(c => c.value === formData.category)?.color,
                        fontWeight: 600
                      }}
                    />
                    {formData.isPortfolio && (
                      <Chip 
                        icon={<Star />}
                        label="Portfolio" 
                        size="small"
                        color="primary"
                      />
                    )}
                    {formData.tags && formData.tags.length > 0 && formData.tags.map((tag, index) => (
                      <Chip 
                        key={index}
                        label={tag}
                        size="small"
                        variant="outlined"
                        color="primary"
                      />
                    ))}
                  </Box>

                  {formData.description && (
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                      {formData.description}
                    </Typography>
                  )}

                  <Divider sx={{ my: 2 }} />
                </Box>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Typography variant="caption" color="text.secondary">
                File: {selectedFile?.name} ({formatFileSize(selectedFile?.size || 0)})
                {type === 'video' && formData.duration > 0 && ` • Duration: ${Math.floor(formData.duration / 60)}m ${formData.duration % 60}s`}
                {thumbnailFile && ` • Thumbnail: ${thumbnailFile.name}`}
              </Typography>
            </Box>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: '20px',
          overflow: 'visible',
          minHeight: '600px'
        }
      }}
    >
      <DialogTitle sx={{ 
        pb: 2,
        px: 4,
        pt: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid',
        borderColor: 'divider'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ 
            background: 'linear-gradient(135deg, #E91E63, #9C27B0)',
            borderRadius: '12px',
            p: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {type === 'photo' ? (
              <PhotoCamera sx={{ color: 'white', fontSize: 24 }} />
            ) : (
              <Videocam sx={{ color: 'white', fontSize: 24 }} />
            )}
          </Box>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              Upload {type === 'photo' ? 'Photo' : 'Video'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Share your amazing {type} with the community
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={handleClose} disabled={loading}>
          <Close />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 4, pt: 3 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      <DialogContent sx={{ px: 4, pt: 2 }}>
        {apiError && (
          <Fade in>
            <Alert 
              severity="error" 
              sx={{ mb: 3, borderRadius: '12px' }}
              icon={<ErrorIcon />}
            >
              {apiError}
            </Alert>
          </Fade>
        )}

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ 
        px: 4, 
        py: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        gap: 2
      }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
          sx={{ borderRadius: '12px', px: 3 }}
        >
          Cancel
        </Button>
        
        <Box sx={{ flexGrow: 1 }} />
        
        {activeStep > 0 && (
          <Button
            onClick={handleBack}
            disabled={loading}
            sx={{ borderRadius: '12px', px: 3 }}
          >
            Back
          </Button>
        )}
        
        {activeStep < steps.length - 1 ? (
          <Button
            variant="contained"
            onClick={handleNext}
            disabled={loading}
            sx={{
              borderRadius: '12px',
              px: 4,
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              '&:hover': {
                background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              }
            }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading || !selectedFile}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Publish />}
            sx={{
              borderRadius: '12px',
              px: 4,
              background: loading ? undefined : 'linear-gradient(45deg, #E91E63, #9C27B0)',
              '&:hover': {
                background: loading ? undefined : 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              }
            }}
          >
            {loading ? 'Publishing...' : `Publish ${type === 'photo' ? 'Photo' : 'Video'}`}
          </Button>
        )}

        {/* Privacy Settings Toggle */}
        <Box sx={{ 
          position: 'absolute', 
          bottom: '100%', 
          right: 24, 
          mb: 2,
          display: activeStep === 2 ? 'block' : 'none'
        }}>
          <Card sx={{ 
            p: 2, 
            borderRadius: '12px',
            minWidth: '250px',
            boxShadow: 3
          }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Quick Settings
            </Typography>
            {type === 'photo' && (
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPortfolio}
                    onChange={handleInputChange('isPortfolio')}
                    disabled={loading}
                    color="primary"
                    size="small"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Star fontSize="small" />
                    <Typography variant="body2">Add to Portfolio</Typography>
                  </Box>
                }
                sx={{ width: '100%' }}
              />
            )}
          </Card>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default MediaUploadDialog;