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
  Menu,
  MenuItem,
  Alert,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Autocomplete,
  CircularProgress
} from '@mui/material';
import {
  Fullscreen,
  Close,
  Add,
  Favorite,
  FavoriteBorder,
  Search,
  GridView,
  ViewList,
  PhotoLibrary,
  ArrowBack,
  ArrowForward,
  Edit,
  Delete,
  MoreVert,
  Save
} from '@mui/icons-material';
import { cosplayerMediaAPI } from '../../services/cosplayerAPI';

const CardMediaGallery = ({
  photos = [],
  videos = [],
  isOwnProfile = false,
  loading = false,
  onMediaUpdate,
  onAddPhoto
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaType, setMediaType] = useState('photos');
  const [likedMedia, setLikedMedia] = useState(new Set());
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMediaForMenu, setSelectedMediaForMenu] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPortfolio: false,
    displayOrder: 0,
    tags: []
  });
  const [availableCategories] = useState([
    'Cosplay', 'Portrait', 'Action', 'Group', 'Behind the Scenes',
    'Props', 'Makeup', 'Work in Progress', 'Convention', 'Photoshoot', 'Other'
  ]);
  const [availableTags] = useState([]);

  console.log('CardMediaGallery received:', {
    photosCount: photos.length,
    videosCount: videos.length,
    photos: photos.slice(0, 2) // Log first 2 for debugging
  });

  // Set up liked media from photos
  useEffect(() => {
    const liked = new Set();
    photos.forEach(photo => {
      if (photo.isLiked) {
        liked.add(photo.id);
      }
    });
    setLikedMedia(liked);
  }, [photos]);

  // Categories for filtering
  const categories = [
    { id: 'all', label: 'Tất cả', count: photos.length + videos.length },
    { id: 'Cosplay', label: 'Cosplay', count: photos.filter(p => p.category === 'Cosplay').length },
    { id: 'Portrait', label: 'Chân dung', count: photos.filter(p => p.category === 'Portrait').length },
    { id: 'Action', label: 'Hành động', count: photos.filter(p => p.category === 'Action').length },
    { id: 'Props', label: 'Đạo cụ', count: photos.filter(p => p.category === 'Props').length },
    { id: 'Photoshoot', label: 'Chụp ảnh', count: photos.filter(p => p.category === 'Photoshoot').length },
    { id: 'Other', label: 'Khác', count: photos.filter(p => p.category === 'Other').length },
  ];

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

  const handleLike = async (mediaId) => {
    if (mediaType !== 'photos') return;

    try {
      console.log('Toggling like for photo:', mediaId);

      const result = await cosplayerMediaAPI.togglePhotoLike(mediaId);
      if (result.success) {
        // Toggle like state optimistically
        const newLikedMedia = new Set(likedMedia);
        if (newLikedMedia.has(mediaId)) {
          newLikedMedia.delete(mediaId);
        } else {
          newLikedMedia.add(mediaId);
        }
        setLikedMedia(newLikedMedia);

        // Notify parent to refresh if needed
        if (onMediaUpdate) {
          onMediaUpdate();
        }

        console.log('✅ Like toggled successfully');
      } else {
        console.error('❌ Failed to toggle like:', result.message);
        setError(result.message || 'Không thể thích/bỏ thích ảnh');
      }
    } catch (err) {
      console.error('❌ Error toggling like:', err);
      setError('Có lỗi xảy ra khi thích/bỏ thích ảnh');
    }
  };

  const handleMenuOpen = (event, media) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setSelectedMediaForMenu(media);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMediaForMenu(null);
  };

  const handleEditMedia = (media) => {
    setSelectedMediaForMenu(media);
    setEditFormData({
      title: media.title || '',
      description: media.description || '',
      category: media.category || 'Other',
      isPortfolio: media.isPortfolio || false,
      displayOrder: media.displayOrder || 0,
      tags: media.tags || []
    });
    setEditDialog(true);
    setMenuAnchor(null);
  };

  const handleEditSave = async () => {
    if (!selectedMediaForMenu) return;

    try {
      setEditLoading(true);
      setError(null);

      console.log('Updating photo with data:', editFormData);

      const result = await cosplayerMediaAPI.updatePhoto(selectedMediaForMenu.id, editFormData);

      if (result.success) {
        setEditDialog(false);
        setSelectedMediaForMenu(null);
        setError(null);

        // Notify parent to refresh media
        if (onMediaUpdate) {
          onMediaUpdate();
        }

        console.log('✅ Photo updated successfully');
      } else {
        setError(result.message || 'Không thể cập nhật ảnh');
        console.error('❌ Failed to update photo:', result.message);
      }
    } catch (err) {
      console.error('❌ Error updating photo:', err);
      setError('Có lỗi xảy ra khi cập nhật ảnh');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh này?')) return;

    try {
      console.log('Deleting photo with ID:', mediaId);

      let result;
      if (mediaType === 'photos') {
        result = await cosplayerMediaAPI.deletePhoto(mediaId);
      } else {
        result = await cosplayerMediaAPI.deleteVideo(mediaId);
      }

      if (result.success) {
        setMenuAnchor(null);
        setSelectedMediaForMenu(null);
        setError(null);

        // Notify parent to refresh media
        if (onMediaUpdate) {
          onMediaUpdate();
        }

        console.log('✅ Media deleted successfully');
      } else {
        setError(result.message || 'Không thể xóa media');
        console.error('❌ Failed to delete media:', result.message);
      }
    } catch (err) {
      console.error('❌ Error deleting media:', err);
      setError('Có lỗi xảy ra khi xóa media');
    }
  };

  const MediaCard = ({ photo, index }) => {
    const isLiked = likedMedia.has(photo.id);
    
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
          image={photo.url}
          alt={photo.title || `Photo ${index + 1}`}
          sx={{
            objectFit: 'cover',
            backgroundColor: 'grey.100'
          }}
          onLoad={() => console.log('✅ CardMedia loaded:', photo.url)}
          onError={(e) => {
            console.error('❌ CardMedia failed:', photo.url);
            e.target.style.backgroundColor = '#f5f5f5';
          }}
        />
        
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
              {mediaType === 'photos' && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(photo.id);
                  }}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: isLiked ? '#E91E63' : 'grey.600',
                    '&:hover': { 
                      backgroundColor: 'white',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}
              
              {isOwnProfile && (
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, photo)}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: 'grey.700',
                    '&:hover': { 
                      backgroundColor: 'white',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <MoreVert />
                </IconButton>
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
            {photo.likesCount !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Favorite sx={{ fontSize: 16, color: '#E91E63' }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)'
                  }}
                >
                  {photo.likesCount} lượt thích
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* Portfolio Badge */}
        {photo.isPortfolio && (
          <Chip
            label="Portfolio"
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
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
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
            {isOwnProfile && onAddPhoto && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onAddPhoto}
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
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <LoadingSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredMedia.length > 0 ? (
        <Grid container spacing={2}>
          {filteredMedia.map((photo, index) => (
            <Grid
              item
              xs={12}
              sm={viewMode === 'grid' ? 6 : 12}
              md={viewMode === 'grid' ? 4 : 12}
              lg={viewMode === 'grid' ? 3 : 12}
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
              : `Bắt đầu xây dựng bộ sưu tập ${mediaType === 'photos' ? 'ảnh' : 'video'} của bạn ngay hôm nay!`
            }
          </Typography>
          {isOwnProfile && onAddPhoto && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddPhoto}
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
              Tải lên {mediaType === 'photos' ? 'ảnh' : 'video'} đầu tiên
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

              {/* Image */}
              <CardMedia
                component="img"
                image={selectedImage.url}
                alt={selectedImage.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '12px'
                }}
              />

              {/* Image info */}
              {(selectedImage.title || selectedImage.description) && (
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
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                      {selectedImage.description}
                    </Typography>
                  )}
                  {mediaType === 'photos' && selectedImage.likesCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Favorite sx={{ fontSize: 20 }} />
                      <Typography variant="body2">
                        {selectedImage.likesCount} lượt thích
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: '12px',
            mt: 1,
            '& .MuiMenuItem-root': {
              px: 2,
              py: 1.5,
              borderRadius: '8px',
              mx: 1,
              my: 0.5,
              '&:hover': {
                backgroundColor: alpha('#E91E63', 0.08),
              }
            }
          }
        }}
      >
        <MenuItem onClick={() => handleEditMedia(selectedMediaForMenu)}>
          <Edit sx={{ mr: 1.5, fontSize: 20 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDeleteMedia(selectedMediaForMenu?.id);
          }}
          sx={{
            color: 'error.main',
            '&:hover': {
              backgroundColor: alpha('#f44336', 0.08),
            }
          }}
        >
          <Delete sx={{ mr: 1.5, fontSize: 20 }} />
          Xóa
        </MenuItem>
      </Menu>

      {/* Edit Photo Dialog */}
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
            <Typography variant="h6">Chỉnh sửa thông tin ảnh</Typography>
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
                {availableCategories.map((cat) => (
                  <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Tags */}
            <Autocomplete
              multiple
              options={availableTags}
              value={editFormData.tags}
              onChange={(e, newValue) => setEditFormData({ ...editFormData, tags: newValue })}
              freeSolo
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Tags"
                  placeholder="Thêm tags..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '12px',
                    }
                  }}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    variant="outlined"
                    label={option}
                    {...getTagProps({ index })}
                    sx={{ borderRadius: '8px' }}
                    key={index}
                  />
                ))
              }
            />

            {/* Portfolio and Display Order */}
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isPortfolio}
                    onChange={(e) => setEditFormData({ ...editFormData, isPortfolio: e.target.checked })}
                    color="primary"
                  />
                }
                label="Thêm vào Portfolio"
              />

              <TextField
                label="Thứ tự hiển thị"
                type="number"
                value={editFormData.displayOrder}
                onChange={(e) => setEditFormData({ ...editFormData, displayOrder: parseInt(e.target.value) || 0 })}
                sx={{
                  width: 150,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Box>
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
    </Box>
  );
};

export default CardMediaGallery;
