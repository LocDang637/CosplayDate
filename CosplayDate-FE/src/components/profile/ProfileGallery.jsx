// src/components/profile/ProfileGallery.jsx - Complete component with API integration
import React, { useState, useCallback, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Fab,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Menu,
  MenuItem,
  Alert,
  Stack,
  Divider,
  Badge,
  Tooltip,
  alpha,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  FormHelperText,
  Autocomplete
} from '@mui/material';
import {
  Add,
  Close,
  ArrowBack,
  ArrowForward,
  Search,
  GridView,
  ViewList,
  Favorite,
  FavoriteBorder,
  Fullscreen,
  Edit,
  Delete,
  MoreVert,
  PhotoLibrary,
  VideoLibrary,
  CameraAlt,
  Collections,
  PlayCircleOutline,
  Save,
  Cancel
} from '@mui/icons-material';
import { cosplayerMediaAPI } from '../../services/cosplayerAPI';
import MediaUploadDialog from '../media/MediaUploadDialog';

const ProfileGallery = ({
  cosplayerId,
  photos: externalPhotos = [],
  videos: externalVideos = [],
  isOwnProfile = true,
  loading: externalLoading = false,
  onMediaUpdate
}) => {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaType, setMediaType] = useState('photos');
  const [likedMedia, setLikedMedia] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState('photo');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMediaForMenu, setSelectedMediaForMenu] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPortfolio: false,
    displayOrder: 0,
    tags: []
  });
  const [availableCategories, setAvailableCategories] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Load photos from API
  useEffect(() => {
    if (cosplayerId) {
      loadPhotos();
    }
  }, [cosplayerId]);

  // Update local state when external props change
  useEffect(() => {
    if (externalPhotos.length > 0) {
      setPhotos(externalPhotos);
    }
  }, [externalPhotos]);

  useEffect(() => {
    if (externalVideos.length > 0) {
      setVideos(externalVideos);
    }
  }, [externalVideos]);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const result = await cosplayerMediaAPI.getPhotos(cosplayerId);

      if (result.success && result.data) {
        const photoData = result.data.photos || [];
        // Map photoUrl to url for consistency
        const mappedPhotos = photoData.map(photo => ({
          ...photo,
          url: photo.photoUrl || photo.url,
          likesCount: photo.likesCount || 0,
          category: photo.category || 'Other'
        }));

        setPhotos(mappedPhotos);

        // Set available categories and tags from API response
        if (result.data.availableCategories) {
          setAvailableCategories(result.data.availableCategories);
        }
        if (result.data.availableTags) {
          setAvailableTags(result.data.availableTags);
        }

        // Update liked media based on isLiked property
        const liked = new Set();
        mappedPhotos.forEach(photo => {
          if (photo.isLiked) {
            liked.add(photo.id);
          }
        });
        setLikedMedia(liked);
      }
    } catch (err) {
      console.error('Failed to load photos:', err);
      setError('Không thể tải ảnh');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { id: 'all', label: 'Tất cả', count: photos.length + videos.length },
    { id: 'Cosplay', label: 'Cosplay', count: photos.filter(p => p.category === 'Cosplay').length },
    { id: 'Portrait', label: 'Chân dung', count: photos.filter(p => p.category === 'Portrait').length },
    { id: 'Action', label: 'Hành động', count: photos.filter(p => p.category === 'Action').length },
    { id: 'Props', label: 'Đạo cụ', count: photos.filter(p => p.category === 'Props').length },
    { id: 'Photoshoot', label: 'Chụp ảnh', count: photos.filter(p => p.category === 'Photoshoot').length },
    { id: 'Other', label: 'Khác', count: photos.filter(p => p.category === 'Other').length },
  ];

  const handleMediaClick = (media, index) => {
    setSelectedMedia({ ...media, index });
  };

  const handleCloseModal = () => {
    setSelectedMedia(null);
  };

  const handleNextMedia = () => {
    const currentMedia = mediaType === 'photos' ? filteredPhotos : filteredVideos;
    if (selectedMedia && selectedMedia.index < currentMedia.length - 1) {
      const nextIndex = selectedMedia.index + 1;
      setSelectedMedia({ ...currentMedia[nextIndex], index: nextIndex });
    }
  };

  const handlePrevMedia = () => {
    const currentMedia = mediaType === 'photos' ? filteredPhotos : filteredVideos;
    if (selectedMedia && selectedMedia.index > 0) {
      const prevIndex = selectedMedia.index - 1;
      setSelectedMedia({ ...currentMedia[prevIndex], index: prevIndex });
    }
  };

  const handleLike = async (mediaId) => {
    if (mediaType !== 'photos') return;

    try {
      const result = await cosplayerMediaAPI.togglePhotoLike(mediaId);
      if (result.success) {
        const newLikedMedia = new Set(likedMedia);
        if (newLikedMedia.has(mediaId)) {
          newLikedMedia.delete(mediaId);
        } else {
          newLikedMedia.add(mediaId);
        }
        setLikedMedia(newLikedMedia);

        // Update photo likes count
        setPhotos(photos.map(photo =>
          photo.id === mediaId
            ? { ...photo, likesCount: photo.likesCount + (newLikedMedia.has(mediaId) ? 1 : -1) }
            : photo
        ));
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleUploadSuccess = useCallback((uploadedMedia) => {
    setUploadDialog(false);
    // Reload photos from API
    loadPhotos();
    // Call parent to refresh if needed
    if (onMediaUpdate) {
      onMediaUpdate();
    }
  }, [onMediaUpdate]);

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
      const result = await cosplayerMediaAPI.updatePhoto(selectedMediaForMenu.id, editFormData);

      if (result.success) {
        // Update local state
        setPhotos(photos.map(photo =>
          photo.id === selectedMediaForMenu.id
            ? { ...photo, ...editFormData }
            : photo
        ));

        setEditDialog(false);
        setSelectedMediaForMenu(null);

        // Show success message
        setError(null);
      } else {
        setError(result.message || 'Không thể cập nhật ảnh');
      }
    } catch (err) {
      console.error('Failed to update photo:', err);
      setError('Có lỗi xảy ra khi cập nhật ảnh');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteMedia = async (mediaId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa media này?')) return;

    try {
      let result;
      if (mediaType === 'photos') {
        result = await cosplayerMediaAPI.deletePhoto(mediaId);
      } else {
        result = await cosplayerMediaAPI.deleteVideo(mediaId);
      }

      if (result.success) {
        if (mediaType === 'photos') {
          setPhotos(photos.filter(p => p.id !== mediaId));
        } else {
          setVideos(videos.filter(v => v.id !== mediaId));
        }
        setMenuAnchor(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể xóa media');
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

  // Filter media based on search and category
  const currentMedia = mediaType === 'photos' ? photos : videos;
  const filteredMedia = (currentMedia || []).filter(media => {
    const matchesSearch = searchTerm === '' ||
      media.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      media.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || media.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = searchTerm === '' ||
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchTerm === '' ||
      video.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const MediaSkeleton = () => (
    <Card
      elevation={0}
      sx={{
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Skeleton variant="rectangular" height={250} />
    </Card>
  );

  const MediaCard = ({ media, index }) => {
    const isLiked = likedMedia.has(media.id);
    const isPhoto = mediaType === 'photos';

    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          backgroundColor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          '&:hover': {
            transform: 'translateY(-8px) scale(1.02)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.12)',
            borderColor: 'primary.light',
            '& .media-overlay': {
              opacity: 1,
            },
            '& .media-image': {
              transform: 'scale(1.05)',
            }
          },
        }}
        onClick={() => handleMediaClick(media, index)}
      >
        <Box sx={{ position: 'relative', paddingBottom: '75%', overflow: 'hidden' }}>
          <CardMedia
            className="media-image"
            component={isPhoto ? "img" : "div"}
            image={isPhoto ? media.url : media.thumbnailUrl}
            alt={media.title}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />

          {/* Enhanced Overlay */}
          <Box
            className="media-overlay"
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
              p: 2,
            }}
          >
            {/* Top Actions */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              {isPhoto && (
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLike(media.id);
                  }}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: isLiked ? '#E91E63' : 'grey.600',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      transform: 'scale(1.1)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isLiked ? <Favorite /> : <FavoriteBorder />}
                </IconButton>
              )}

              <Box sx={{ display: 'flex', gap: 0.5, ml: 'auto' }}>
                {isOwnProfile && (
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, media)}
                    sx={{
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: 'grey.700',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.95)',
                        transform: 'scale(1.1)',
                      }
                    }}
                  >
                    <MoreVert />
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedMedia({ ...media, index });
                  }}
                  sx={{
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    color: 'grey.700',
                    backdropFilter: 'blur(10px)',
                    '&:hover': {
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      transform: 'scale(1.1)',
                    }
                  }}
                >
                  <Fullscreen />
                </IconButton>
              </Box>
            </Box>

            {/* Bottom Info */}
            <Box>
              {media.title && (
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
                    mb: 0.5,
                  }}
                >
                  {media.title}
                </Typography>
              )}

              {isPhoto && media.likesCount !== undefined && (
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
                  }}
                >
                  {media.likesCount} lượt thích
                </Typography>
              )}
            </Box>
          </Box>

          {/* Category Badge */}
          {media.category && media.category !== 'Other' && (
            <Chip
              label={media.category}
              size="small"
              sx={{
                position: 'absolute',
                top: 12,
                left: 12,
                backgroundColor: 'rgba(233, 30, 99, 0.9)',
                color: 'white',
                fontSize: '11px',
                height: '24px',
                fontWeight: 600,
                backdropFilter: 'blur(10px)',
              }}
            />
          )}

          {/* Portfolio Badge */}
          {media.isPortfolio && (
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

          {/* Video Play Icon */}
          {!isPhoto && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                pointerEvents: 'none',
              }}
            >
              <PlayCircleOutline
                sx={{
                  fontSize: 64,
                  color: 'white',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))',
                }}
              />
            </Box>
          )}

          {/* Video Duration Badge */}
          {!isPhoto && media.duration && (
            <Chip
              label={media.duration}
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
              }}
            />
          )}
        </Box>
      </Card>
    );
  };

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
            {mediaType === 'photos' ? (
              <PhotoLibrary sx={{ color: 'primary.main', fontSize: 28 }} />
            ) : (
              <VideoLibrary sx={{ color: 'primary.main', fontSize: 28 }} />
            )}
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
                <CameraAlt sx={{ mr: 1, fontSize: 18 }} />
                Ảnh
              </ToggleButton>
              <ToggleButton value="videos">
                <VideoLibrary sx={{ mr: 1, fontSize: 18 }} />
                Video
              </ToggleButton>
            </ToggleButtonGroup>

            <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

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
            {isOwnProfile && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => {
                  setUploadType(mediaType === 'photos' ? 'photo' : 'video');
                  setUploadDialog(true);
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
      {loading || externalLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <MediaSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredMedia.length > 0 ? (
        <Grid container spacing={2}>
          {filteredMedia.map((media, index) => (
            <Grid
              item
              xs={12}
              sm={viewMode === 'grid' ? 6 : 12}
              md={viewMode === 'grid' ? 4 : 12}
              lg={viewMode === 'grid' ? 3 : 12}
              key={media.id}
            >
              <MediaCard media={media} index={index} />
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
          <Collections sx={{ fontSize: 80, color: 'text.disabled', mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'text.primary', mb: 2, fontWeight: 600 }}>
            Không tìm thấy {mediaType === 'photos' ? 'ảnh' : 'video'} nào
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, maxWidth: 400, mx: 'auto' }}>
            {searchTerm || selectedCategory !== 'all'
              ? 'Hãy thử điều chỉnh từ khóa tìm kiếm hoặc chọn danh mục khác'
              : `Bắt đầu xây dựng bộ sưu tập ${mediaType === 'photos' ? 'ảnh' : 'video'} của bạn ngay hôm nay!`
            }
          </Typography>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setUploadType(mediaType === 'photos' ? 'photo' : 'video');
                setUploadDialog(true);
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
              Tải lên {mediaType === 'photos' ? 'ảnh' : 'video'} đầu tiên
            </Button>
          )}
        </Paper>
      )}

      {/* Media Modal */}
      <Dialog
        open={!!selectedMedia}
        onClose={handleCloseModal}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            bgcolor: 'rgba(0,0,0,0.95)',
            backdropFilter: 'blur(20px)',
          }
        }}
      >
        <DialogContent sx={{ p: 0, position: 'relative' }}>
          {selectedMedia && (
            <>
              <IconButton
                onClick={handleCloseModal}
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

              {/* Navigation Arrows */}
              {selectedMedia.index > 0 && (
                <IconButton
                  onClick={handlePrevMedia}
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

              {selectedMedia.index < filteredMedia.length - 1 && (
                <IconButton
                  onClick={handleNextMedia}
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

              {/* Media Content */}
              {mediaType === 'photos' ? (
                <Box
                  component="img"
                  src={selectedMedia.url}
                  alt={selectedMedia.title}
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    objectFit: 'contain',
                    borderRadius: '12px',
                  }}
                />
              ) : (
                <Box
                  component="video"
                  controls
                  autoPlay
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    borderRadius: '12px',
                  }}
                >
                  <source src={selectedMedia.url} type="video/mp4" />
                </Box>
              )}

              {/* Media Info */}
              {(selectedMedia.title || selectedMedia.description) && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                  color: 'white',
                  p: 4,
                  backdropFilter: 'blur(10px)',
                }}>
                  {selectedMedia.title && (
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedMedia.title}
                    </Typography>
                  )}
                  {selectedMedia.description && (
                    <Typography variant="body1" sx={{ opacity: 0.9, lineHeight: 1.6 }}>
                      {selectedMedia.description}
                    </Typography>
                  )}
                  {mediaType === 'photos' && selectedMedia.likesCount !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                      <Favorite sx={{ fontSize: 20 }} />
                      <Typography variant="body2">
                        {selectedMedia.likesCount} lượt thích
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

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
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))
                ) : (
                  ['Cosplay', 'Portrait', 'Action', 'Group', 'Props', 'Photoshoot', 'Other'].map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))
                )}
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

      {/* Upload Dialog */}
      <MediaUploadDialog
        open={uploadDialog}
        onClose={() => setUploadDialog(false)}
        type={uploadType}
        onUploadSuccess={handleUploadSuccess}
      />

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

      {/* Floating Add Button (Mobile) */}
      {isOwnProfile && (
        <Fab
          color="primary"
          onClick={() => {
            setUploadType(mediaType === 'photos' ? 'photo' : 'video');
            setUploadDialog(true);
          }}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            display: { xs: 'flex', md: 'none' },
            background: 'linear-gradient(135deg, #E91E63 0%, #C2185B 100%)',
            boxShadow: '0 4px 20px rgba(233, 30, 99, 0.4)',
            '&:hover': {
              background: 'linear-gradient(135deg, #C2185B 0%, #AD1457 100%)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <Add />
        </Fab>
      )}
    </Box>
  );
};

export default ProfileGallery;