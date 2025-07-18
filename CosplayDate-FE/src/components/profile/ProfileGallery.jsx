// Enhanced CardMedia Gallery with full ProfileGallery features
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Chip,
  Button,
  Skeleton,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Paper,
  Stack,
  Badge,
  alpha,
  Tooltip,
  Alert,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  MenuItem,
  Autocomplete
} from '@mui/material';
import {
  Fullscreen,
  Close,
  Add,
  Search,
  GridView,
  ViewList,
  PhotoLibrary,
  ArrowBack,
  ArrowForward,
  Edit,
  Delete,
  Save,
  PlayArrow,
  VideoFile
} from '@mui/icons-material';
import { cosplayerMediaAPI } from '../../services/cosplayerAPI';

const ProfileGallery = ({
  photos = [],
  videos = [],
  isOwnProfile = false,
  loading = false,
  onMediaUpdate,
  onAddPhoto,
  onAddMedia // New callback that includes media type
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaType, setMediaType] = useState('photos');
  const [selectedMediaForMenu, setSelectedMediaForMenu] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPortfolio: false,
    tags: [],
    duration: 0
  });
  
  // Photo categories (matching backend)
  const [photoCategories] = useState([
    'Cosplay', 'Portrait', 'Action', 'Group', 'Behind the Scenes',
    'Props', 'Makeup', 'Work in Progress', 'Convention', 'Photoshoot', 'Other'
  ]);
  
  // Video categories (matching backend)
  const [videoCategories] = useState([
    'Performance', 'Tutorial', 'Behind the Scenes', 'Transformation',
    'Convention', 'Dance', 'Skit', 'Voice Acting', 'Review', 'Other'
  ]);
  const [availableTags] = useState([]);

  // console.log('📷 CardMediaGallery received:', {
  //   photosCount: photos.length,
  //   videosCount: videos.length,
  //   photos: photos.slice(0, 2), // Log first 2 for debugging
  //   samplePhoto: photos[0], // Log structure of first photo
  //   samplePhotoKeys: photos[0] ? Object.keys(photos[0]) : []
  // });

  // Categories for filtering - dynamic based on media type
  const categories = React.useMemo(() => {
    const currentMedia = mediaType === 'photos' ? photos : videos;
    const categoryList = mediaType === 'photos' ? photoCategories : videoCategories;
    
    // Vietnamese labels for photo categories
    const photoLabels = {
      'Cosplay': 'Cosplay',
      'Portrait': 'Chân dung', 
      'Action': 'Hành động',
      'Group': 'Nhóm',
      'Behind the Scenes': 'Hậu trường',
      'Props': 'Đạo cụ',
      'Makeup': 'Trang điểm',
      'Work in Progress': 'Đang thực hiện',
      'Convention': 'Sự kiện',
      'Photoshoot': 'Chụp ảnh',
      'Other': 'Khác'
    };
    
    // Vietnamese labels for video categories
    const videoLabels = {
      'Performance': 'Biểu diễn',
      'Tutorial': 'Hướng dẫn',
      'Behind the Scenes': 'Hậu trường',
      'Transformation': 'Biến hóa',
      'Convention': 'Sự kiện',
      'Dance': 'Nhảy múa',
      'Skit': 'Tiểu phẩm',
      'Voice Acting': 'Lồng tiếng',
      'Review': 'Đánh giá',
      'Other': 'Khác'
    };
    
    const labels = mediaType === 'photos' ? photoLabels : videoLabels;
    
    const result = [
      { id: 'all', label: 'Tất cả', count: currentMedia.length }
    ];
    
    categoryList.forEach(category => {
      const count = currentMedia.filter(media => media.category === category).length;
      result.push({
        id: category,
        label: labels[category] || category,
        count: count
      });
    });
    
    return result;
  }, [mediaType, photos, videos, photoCategories, videoCategories]);

  // Reset selected category when media type changes
  React.useEffect(() => {
    setSelectedCategory('all');
  }, [mediaType]);

  // Filter media based on search and category
  const currentMedia = mediaType === 'photos' ? photos : videos;
  const filteredMedia = (currentMedia || []).filter(media => {
    const matchesSearch = searchTerm === '' ||
      media.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || media.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const openImageModal = (photo, index) => {
    setSelectedImage(photo);
    setCurrentImageIndex(index);
  };

  const closeImageModal = () => {
    setSelectedImage(null);
    setCurrentImageIndex(0);
  };

  const goToNextImage = () => {
    if (currentImageIndex < filteredMedia.length - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      setSelectedImage(filteredMedia[nextIndex]);
    }
  };

  const goToPrevImage = () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      setSelectedImage(filteredMedia[prevIndex]);
    }
  };

  const handleEditMedia = (media) => {
    // console.log('📝 Edit media called with:', media);
    setSelectedMediaForMenu(media);
    setEditFormData({
      title: media.title || '',
      description: media.description || '',
      category: media.category || 'Other',
      isPortfolio: Boolean(media.isPortfolio),
      tags: Array.isArray(media.tags) ? media.tags : [],
      duration: Number(media.duration) || 0 // Add duration for videos
    });
    setEditDialog(true);
  };

  const handleEditSave = async () => {
    if (!selectedMediaForMenu) return;

    try {
      setEditLoading(true);
      setError(null);

      // console.log('💾 Saving media with:', {
      //   selectedMedia: selectedMediaForMenu,
      //   mediaId: selectedMediaForMenu.id,
      //   editFormData,
      //   isVideo: selectedMediaForMenu.isVideo
      // });

      // Check for ID in different possible field names
      const mediaId = selectedMediaForMenu.id || selectedMediaForMenu.photoId || selectedMediaForMenu.videoId || selectedMediaForMenu.mediaId;
      // console.log('🆔 Media ID found:', mediaId);

      if (!mediaId) {
        console.error('❌ No media ID found in any expected field:', selectedMediaForMenu);
        setError('Không tìm thấy ID của media');
        return;
      }

      let result;
      
      if (selectedMediaForMenu.isVideo) {
        // Update video
        const requestData = {
          title: editFormData.title?.trim() || '',
          description: editFormData.description?.trim() || '',
          category: editFormData.category || 'Other',
          duration: Number(editFormData.duration) || 0,
          displayOrder: Number(selectedMediaForMenu.displayOrder) || 0 // Keep current displayOrder
        };

        // console.log('📤 Updating video with data:', requestData);
        result = await cosplayerMediaAPI.updateVideo(mediaId, requestData);
      } else {
        // Update photo
        const requestData = {
          title: editFormData.title?.trim() || '',
          description: editFormData.description?.trim() || '',
          category: editFormData.category || 'Other',
          isPortfolio: Boolean(editFormData.isPortfolio),
          displayOrder: Number(selectedMediaForMenu.displayOrder) || 0, // Keep current displayOrder
          tags: Array.isArray(editFormData.tags) ? editFormData.tags : []
        };

        // console.log('📤 Updating photo with data:', requestData);
        result = await cosplayerMediaAPI.updatePhoto(mediaId, requestData);
      }

      if (result.success) {
        setEditDialog(false);
        setSelectedMediaForMenu(null);
        setError(null);

        // Notify parent to refresh media
        if (onMediaUpdate) {
          onMediaUpdate();
        }

        // console.log(`✅ ${selectedMediaForMenu.isVideo ? 'Video' : 'Photo'} updated successfully`);
      } else {
        setError(result.message || `Không thể cập nhật ${selectedMediaForMenu.isVideo ? 'video' : 'ảnh'}`);
        console.error(`❌ Failed to update ${selectedMediaForMenu.isVideo ? 'video' : 'photo'}:`, result.message);
      }
    } catch (err) {
      console.error(`❌ Error updating ${selectedMediaForMenu.isVideo ? 'video' : 'photo'}:`, err);
      setError(`Có lỗi xảy ra khi cập nhật ${selectedMediaForMenu.isVideo ? 'video' : 'ảnh'}`);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMedia = async () => {
    if (!selectedMediaForMenu) return;

    try {
      setDeleteLoading(true);
      setError(null);

      // Check for ID in different possible field names
      const mediaId = selectedMediaForMenu.id || selectedMediaForMenu.photoId || selectedMediaForMenu.videoId || selectedMediaForMenu.mediaId;
      // console.log('🗑️ Deleting media with ID:', mediaId);
      // console.log('🗑️ Selected media object:', selectedMediaForMenu);

      if (!mediaId) {
        console.error('❌ No media ID found:', selectedMediaForMenu);
        setError('Không tìm thấy ID của media');
        return;
      }

      let result;
      if (mediaType === 'photos') {
        result = await cosplayerMediaAPI.deletePhoto(mediaId);
      } else {
        result = await cosplayerMediaAPI.deleteVideo(mediaId);
      }

      if (result.success) {
        setDeleteDialog(false);
        setSelectedMediaForMenu(null);
        setError(null);

        // Notify parent to refresh media
        if (onMediaUpdate) {
          onMediaUpdate();
        }

        // console.log('✅ Media deleted successfully');
      } else {
        setError(result.message || 'Không thể xóa media');
        console.error('❌ Failed to delete media:', result.message);
      }
    } catch (err) {
      console.error('❌ Error deleting media:', err);
      setError('Có lỗi xảy ra khi xóa media');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteClick = (photo) => {
    setSelectedMediaForMenu(photo);
    setDeleteDialog(true);
  };

  const MediaCard = ({ photo, index }) => {
    return (
      <Card 
        sx={{ 
          borderRadius: '16px',
          overflow: 'hidden',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          cursor: 'pointer',
          position: 'relative',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
            borderColor: 'primary.light',
            '& .overlay': {
              opacity: 1
            }
          }
        }}
        onClick={() => openImageModal(photo, index)}
      >
        <CardMedia
          component="img"
          height="250"
          image={photo.isVideo && !photo.photoUrl ? null : (photo.photoUrl || photo.url)}
          alt={photo.title || `${photo.isVideo ? 'Video' : 'Photo'} ${index + 1}`}
          sx={{
            objectFit: 'cover',
            backgroundColor: photo.isVideo && !photo.photoUrl ? 'grey.800' : 'grey.100',
            position: 'relative',
            display: photo.isVideo && !photo.photoUrl ? 'none' : 'block'
          }}
          // onLoad={() => console.log('✅ CardMedia loaded:', photo.photoUrl || photo.url)}
          onError={(e) => {
            console.error('❌ CardMedia failed:', photo.photoUrl || photo.url);
            e.target.style.backgroundColor = '#f5f5f5';
          }}
        />

        {/* Video placeholder when no thumbnail */}
        {photo.isVideo && !photo.photoUrl && (
          <Box
            sx={{
              height: 250,
              width: 250,
              backgroundColor: 'grey.800',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              gap: 2
            }}
          >
            <VideoFile sx={{ fontSize: 48, color: 'grey.400' }} />
            <Typography variant="body2" color="grey.400" sx={{ textAlign: 'center', px: 2 }}>
              Video Preview
            </Typography>
          </Box>
        )}
        
        {/* Video Play Icon Overlay */}
        {photo.isVideo && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: '50%',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1,
              backdropFilter: 'blur(10px)',
            }}
          >
            <PlayArrow sx={{ fontSize: 32, color: 'white' }} />
          </Box>
        )}

        {/* Video Duration Badge */}
        {photo.isVideo && photo.duration > 0 && (
          <Chip
            label={`${Math.floor(photo.duration / 60)}:${(photo.duration % 60).toString().padStart(2, '0')}`}
            size="small"
            sx={{
              position: 'absolute',
              bottom: 12,
              right: 12,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: 'white',
              fontSize: '11px',
              height: '24px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          />
        )}
        
        {/* Enhanced Overlay */}
        <Box
          className="overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(0,0,0,0.7) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          {/* Top actions */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            {photo.category && (
              <Chip
                label={photo.category}
                size="small"
                sx={{
                  backgroundColor: 'rgba(233, 30, 99, 0.9)',
                  color: 'white',
                  fontSize: '11px',
                  fontWeight: 600
                }}
              />
            )}
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {isOwnProfile && (
                <>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditMedia(photo);
                    }}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: 'primary.main',
                      '&:hover': { 
                        backgroundColor: 'white',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(photo);
                    }}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: 'error.main',
                      '&:hover': { 
                        backgroundColor: 'white',
                        transform: 'scale(1.1)'
                      }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </>
              )}
              
              <IconButton
                size="small"
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  color: 'primary.main',
                  '&:hover': { 
                    backgroundColor: 'white',
                    transform: 'scale(1.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  openImageModal(photo, index);
                }}
              >
                <Fullscreen />
              </IconButton>
            </Box>
          </Box>

          {/* Bottom info */}
          <Box>
            {photo.title && (
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  mb: 0.5
                }}
              >
                {photo.title}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Portfolio Badge */}
        {photo.isPortfolio && (
          <Chip
            label="Tuyển chọn"
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              right: 12,
              backgroundColor: 'rgba(156, 39, 176, 0.9)',
              color: 'white',
              fontSize: '11px',
              height: '24px',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          />
        )}
      </Card>
    );
  };

  const LoadingSkeleton = () => (
    <Card sx={{ borderRadius: '16px', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={250} />
    </Card>
  );

  if (loading) {
    return (
      <Box>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: 600 }}>
          Đang tải ảnh...
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <LoadingSkeleton />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert
          severity="error"
          sx={{
            mb: 3,
            borderRadius: '16px',
            '& .MuiAlert-icon': {
              fontSize: 28
            }
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Header with Search and Filters */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '20px',
          p: { xs: 2, md: 3 },
          mb: 3,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(252,252,255,0.98) 100%)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
        }}
      >
        {/* Title and Media Type Toggle */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          mb={3}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <PhotoLibrary sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  letterSpacing: '-0.5px'
                }}
              >
                {mediaType === 'photos' ? 'Bộ sưu tập ảnh' : 'Video của tôi'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {filteredMedia.length} {mediaType === 'photos' ? 'ảnh' : 'video'}
              </Typography>
            </Box>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Media Type Toggle */}
            <ToggleButtonGroup
              value={mediaType}
              exclusive
              onChange={(e, newType) => newType && setMediaType(newType)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 2,
                  py: 0.75,
                  borderRadius: '10px',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&.Mui-selected': {
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    }
                  }
                }
              }}
            >
              <ToggleButton value="photos">
                <PhotoLibrary sx={{ mr: 1, fontSize: 18 }} />
                Ảnh
              </ToggleButton>
              <ToggleButton value="videos">
                Video
              </ToggleButton>
            </ToggleButtonGroup>

            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(e, newMode) => newMode && setViewMode(newMode)}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '10px',
                }
              }}
            >
              <Tooltip title="Xem dạng lưới">
                <ToggleButton value="grid">
                  <GridView fontSize="small" />
                </ToggleButton>
              </Tooltip>
              <Tooltip title="Xem dạng danh sách">
                <ToggleButton value="list">
                  <ViewList fontSize="small" />
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>

            {/* Add Media Button */}
            {isOwnProfile && (onAddPhoto || onAddMedia) && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  if (onAddMedia) {
                    onAddMedia(mediaType === 'photos' ? 'photo' : 'video');
                  } else if (onAddPhoto) {
                    onAddPhoto();
                  }
                }}
                sx={{
                  background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600,
                  px: 3,
                  py: 1,
                  boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #C2185B 0%, #AD1457 100%)',
                    boxShadow: '0 6px 20px rgba(233, 30, 99, 0.4)',
                  }
                }}
              >
                Thêm {mediaType === 'photos' ? 'ảnh' : 'video'}
              </Button>
            )}
          </Stack>
        </Stack>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder={`Tìm kiếm ${mediaType === 'photos' ? 'ảnh' : 'video'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            mb: 2.5,
            '& .MuiOutlinedInput-root': {
              borderRadius: '14px',
              backgroundColor: 'background.paper',
              '&:hover': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                }
              },
              '&.Mui-focused': {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                  borderWidth: '2px',
                }
              }
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />

        {/* Category Filters */}
        <Box>
          <Typography variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: 'text.secondary' }}>
            Danh mục
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {categories.map((category) => (
              <Chip
                key={category.id}
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <span>{category.label}</span>
                    <Badge
                      badgeContent={category.count}
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: selectedCategory === category.id ? 'white' : 'primary.main',
                          color: selectedCategory === category.id ? 'primary.main' : 'white',
                          fontSize: '10px',
                          height: '16px',
                          minWidth: '16px',
                          right: -8,
                          top: 0,
                        }
                      }}
                    />
                  </Box>
                }
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? 'filled' : 'outlined'}
                sx={{
                  borderRadius: '12px',
                  fontWeight: selectedCategory === category.id ? 600 : 500,
                  borderColor: alpha('#E91E63', 0.3),
                  color: selectedCategory === category.id ? 'white' : 'primary.main',
                  backgroundColor: selectedCategory === category.id ? 'primary.main' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: selectedCategory === category.id
                      ? 'primary.dark'
                      : alpha('#E91E63', 0.08),
                    borderColor: 'primary.main',
                    transform: 'translateY(-1px)',
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </Paper>

      {/* Media Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <LoadingSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredMedia.length > 0 ? (
        <Grid container spacing={2}>
          {filteredMedia.map((photo, index) => (
            <Grid
              size={{
                xs: 12,
                sm: viewMode === 'grid' ? 6 : 12,
                md: viewMode === 'grid' ? 4 : 12,
                lg: viewMode === 'grid' ? 3 : 12
              }}
              key={photo.id || index}
            >
              <MediaCard photo={photo} index={index} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper
          elevation={0}
          sx={{
            borderRadius: '20px',
            p: 8,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(252,252,255,0.98) 100%)',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <PhotoLibrary sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
            Không tìm thấy {mediaType === 'photos' ? 'ảnh' : 'video'} nào
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, mx: 'auto' }}>
            {searchTerm || selectedCategory !== 'all'
              ? 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc chọn danh mục khác'
              : ``
            }
          </Typography>
          {isOwnProfile && (onAddPhoto || onAddMedia) && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                if (onAddMedia) {
                  onAddMedia(mediaType === 'photos' ? 'photo' : 'video');
                } else if (onAddPhoto) {
                  onAddPhoto();
                }
              }}
              sx={{
                background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 4,
                py: 1.5,
                boxShadow: '0 4px 15px rgba(233, 30, 99, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #C2185B 0%, #AD1457 100%)',
                  boxShadow: '0 6px 20px rgba(233, 30, 99, 0.4)',
                }
              }}
            >
              Thêm {mediaType === 'photos' ? 'ảnh' : 'video'}
            </Button>
          )}
        </Paper>
      )}

      {/* Enhanced Modal */}
      <Dialog
        open={!!selectedImage}
        onClose={closeImageModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)'
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedImage && (
            <>
              {/* Close button */}
              <IconButton
                onClick={closeImageModal}
                sx={{
                  position: 'absolute',
                  top: 16,
                  right: 16,
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  color: 'white',
                  zIndex: 2,
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    transform: 'scale(1.1)',
                  }
                }}
              >
                <Close />
              </IconButton>

              {/* Navigation arrows */}
              {currentImageIndex > 0 && (
                <IconButton
                  onClick={goToPrevImage}
                  sx={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    zIndex: 2,
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <ArrowBack />
                </IconButton>
              )}

              {currentImageIndex < filteredMedia.length - 1 && (
                <IconButton
                  onClick={goToNextImage}
                  sx={{
                    position: 'absolute',
                    right: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    color: 'white',
                    zIndex: 2,
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.2)',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <ArrowForward />
                </IconButton>
              )}

              {/* Media Content - Image or Video */}
              {selectedImage.isVideo ? (
                <Box
                  component="video"
                  controls
                  autoPlay
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    borderRadius: '12px',
                    backgroundColor: 'black'
                  }}
                >
                  <source src={selectedImage.videoUrl || selectedImage.url} type="video/mp4" />
                  Your browser does not support the video tag.
                </Box>
              ) : (
                <CardMedia
                  component="img"
                  image={selectedImage.photoUrl || selectedImage.url}
                  alt={selectedImage.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: '12px'
                  }}
                />
              )}

              {/* Media info */}
              {(selectedImage.title || selectedImage.description || selectedImage.isVideo) && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    color: 'white',
                    p: 4,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  {selectedImage.title && (
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedImage.title}
                    </Typography>
                  )}
                  {selectedImage.description && (
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6, mb: selectedImage.isVideo ? 2 : 0 }}>
                      {selectedImage.description}
                    </Typography>
                  )}
                  {selectedImage.isVideo && (
                    <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
                      {selectedImage.duration > 0 && (
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Duration: {Math.floor(selectedImage.duration / 60)}:{(selectedImage.duration % 60).toString().padStart(2, '0')}
                        </Typography>
                      )}
                      {selectedImage.viewCount !== undefined && (
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Views: {selectedImage.viewCount.toLocaleString()}
                        </Typography>
                      )}
                      {selectedImage.likesCount !== undefined && (
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>
                          Likes: {selectedImage.likesCount.toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Media Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Edit />
            <Typography variant="h6">
              Chỉnh sửa thông tin {selectedMediaForMenu?.isVideo ? 'video' : 'ảnh'}
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Stack spacing={3}>
            {/* Title */}
            <TextField
              fullWidth
              label="Tiêu đề"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />

            {/* Description */}
            <TextField
              fullWidth
              label="Mô tả"
              value={editFormData.description}
              onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              multiline
              rows={3}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                }
              }}
            />

            {/* Category */}
            <FormControl fullWidth>
              <InputLabel>Danh mục</InputLabel>
              <Select
                value={editFormData.category}
                onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                label="Danh mục"
                sx={{ borderRadius: '12px' }}
              >
                {(selectedMediaForMenu?.isVideo ? videoCategories : photoCategories).map((cat) => {
                  // Vietnamese labels for categories
                  const photoLabels = {
                    'Cosplay': '🎭 Cosplay',
                    'Portrait': '👤 Chân dung', 
                    'Action': '⚡ Hành động',
                    'Group': '👥 Nhóm',
                    'Behind the Scenes': '🎬 Hậu trường',
                    'Props': '🛡️ Phụ kiện',
                    'Makeup': '💄 Trang điểm',
                    'Work in Progress': '🔧 Đang thực hiện',
                    'Convention': '🎪 Hội chợ',
                    'Photoshoot': '📸 Chụp hình',
                    'Other': '📂 Khác'
                  };
                  
                  const videoLabels = {
                    'Performance': '🎭 Biểu diễn',
                    'Tutorial': '📚 Hướng dẫn',
                    'Behind the Scenes': '🎬 Hậu trường',
                    'Transformation': '✨ Biến hóa',
                    'Convention': '🎪 Hội chợ',
                    'Dance': '💃 Nhảy múa',
                    'Skit': '🎪 Tiểu phẩm',
                    'Voice Acting': '🎤 Lồng tiếng',
                    'Review': '⭐ Đánh giá',
                    'Other': '📂 Khác'
                  };
                  
                  const labels = selectedMediaForMenu?.isVideo ? videoLabels : photoLabels;
                  const displayLabel = labels[cat] || cat;
                  
                  return (
                    <MenuItem key={cat} value={cat}>{displayLabel}</MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* Tags - Only for photos */}
            {!selectedMediaForMenu?.isVideo && (
              <Autocomplete
                multiple
                freeSolo
                options={[]}
                value={Array.isArray(editFormData.tags) ? editFormData.tags : []}
                onChange={(event, newValue) => {
                  // Filter out empty strings and trim whitespace
                  const cleanTags = newValue
                    .map(tag => typeof tag === 'string' ? tag.trim() : tag)
                    .filter(tag => tag && tag.length > 0);
                  setEditFormData({ ...editFormData, tags: cleanTags });
                }}
                onInputChange={(event, newInputValue, reason) => {
                  // Handle comma-separated input
                  if (reason === 'input' && newInputValue.includes(',')) {
                    const tags = newInputValue.split(',').map(tag => tag.trim()).filter(tag => tag);
                    if (tags.length > 0) {
                      const currentTags = Array.isArray(editFormData.tags) ? editFormData.tags : [];
                      const newTags = [...new Set([...currentTags, ...tags])]; // Remove duplicates
                      setEditFormData({ ...editFormData, tags: newTags });
                    }
                  }
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      color="primary"
                      size="small"
                      label={option}
                      {...getTagProps({ index })}
                      key={index}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Thẻ"
                    placeholder={editFormData.tags && editFormData.tags.length > 0 ? "Thêm thẻ..." : "anime, manga, tên nhân vật, series"}
                    helperText="Nhập và nhấn Enter để thêm thẻ, hoặc phân cách bằng dấu phẩy"
                    variant="outlined"
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
            )}

            {/* Video-specific fields */}
            {selectedMediaForMenu?.isVideo && (
              <>
                {/* Duration - Read only for videos */}
                <TextField
                  fullWidth
                  label="Thời lượng (giây)"
                  value={editFormData.duration}
                  disabled
                  helperText={`${Math.floor(editFormData.duration / 60)}m ${editFormData.duration % 60}s`}
                  variant="outlined"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              </>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setEditDialog(false)}
            disabled={editLoading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : <Save />}
            sx={{
              background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                background: 'linear-gradient(135deg, #C2185B 0%, #AD1457 100%)',
              }
            }}
          >
            {editLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => !deleteLoading && setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
          }
        }}
      >
        <DialogTitle sx={{
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Delete sx={{ color: 'error.main' }} />
            <Typography variant="h6">Xác nhận xóa</Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bạn có chắc chắn muốn xóa {mediaType === 'photos' ? 'ảnh' : 'video'} này không?
          </Typography>
          
          {selectedMediaForMenu && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              p: 2, 
              borderRadius: '12px', 
              backgroundColor: 'grey.50',
              border: '1px solid',
              borderColor: 'divider'
            }}>
              <Box
                component="img"
                src={selectedMediaForMenu.photoUrl || selectedMediaForMenu.url}
                alt={selectedMediaForMenu.title}
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '8px',
                  objectFit: 'cover'
                }}
              />
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {selectedMediaForMenu.title || 'Không có tiêu đề'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedMediaForMenu.category || 'Không có danh mục'}
                </Typography>
              </Box>
            </Box>
          )}

          <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 500 }}>
            ⚠️ Hành động này không thể hoàn tác!
          </Typography>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={() => setDeleteDialog(false)}
            disabled={deleteLoading}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteMedia}
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <Delete />}
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              '&:hover': {
                backgroundColor: 'error.dark',
              }
            }}
          >
            {deleteLoading ? 'Đang xóa...' : 'Xóa'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfileGallery;
