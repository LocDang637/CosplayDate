// src/components/profile/ProfileGallery.jsx - Updated with API integration
import React, { useState, useEffect } from 'react';
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
  DialogActions,
  Button,
  Chip,
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Skeleton,
  Badge,
  Menu,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Add,
  Close,
  ArrowBack,
  ArrowForward,
  Search,
  GridView,
  ViewList,
  FilterList,
  Favorite,
  FavoriteBorder,
  Share,
  Download,
  Fullscreen,
  Edit,
  Delete,
  MoreVert
} from '@mui/icons-material';
import { cosplayerMediaAPI } from '../../services/cosplayerAPI';
import MediaUploadDialog from '../media/MediaUploadDialog';

const ProfileGallery = ({ 
  cosplayerId,
  isOwnProfile = false,
  loading: externalLoading = false 
}) => {
  const [photos, setPhotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [mediaType, setMediaType] = useState('photos'); // 'photos' or 'videos'
  const [likedMedia, setLikedMedia] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [uploadType, setUploadType] = useState('photo');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMediaForMenu, setSelectedMediaForMenu] = useState(null);

  const categories = [
    { id: 'all', label: 'Tất cả', count: photos.length + videos.length },
    { id: 'anime', label: 'Anime', count: 0 },
    { id: 'game', label: 'Game', count: 0 },
    { id: 'original', label: 'Gốc', count: 0 },
    { id: 'event', label: 'Sự kiện', count: 0 },
    { id: 'photoshoot', label: 'Chụp ảnh', count: 0 },
  ];

  useEffect(() => {
    if (cosplayerId) {
      loadMedia();
    }
  }, [cosplayerId, mediaType]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (mediaType === 'photos') {
        const result = await cosplayerMediaAPI.getPhotos(cosplayerId);
        if (result.success) {
          setPhotos(result.data || []);
        } else {
          setError(result.message);
        }
      } else {
        const result = await cosplayerMediaAPI.getVideos(cosplayerId);
        if (result.success) {
          setVideos(result.data || []);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Không thể tải media');
    } finally {
      setLoading(false);
    }
  };

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
    if (mediaType !== 'photos') return; // Only photos can be liked currently
    
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

  const handleUploadSuccess = (uploadedMedia) => {
    if (uploadType === 'photo') {
      setPhotos([uploadedMedia, ...photos]);
    } else {
      setVideos([uploadedMedia, ...videos]);
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
  const filteredMedia = currentMedia.filter(media => {
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
    <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={200} />
    </Card>
  );

  const MediaCard = ({ media, index }) => {
    const isLiked = likedMedia.has(media.id);
    const isPhoto = mediaType === 'photos';
    
    return (
      <Card
        sx={{
          borderRadius: '12px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
            '& .media-overlay': {
              opacity: 1,
            },
          },
        }}
        onClick={() => handleMediaClick(media, index)}
      >
        <CardMedia
          component={isPhoto ? "img" : "div"}
          height="200"
          image={isPhoto ? media.url : media.thumbnailUrl}
          alt={media.title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Overlay */}
        <Box
          className="media-overlay"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 50%, rgba(0,0,0,0.7) 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 1,
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
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: isLiked ? '#E91E63' : 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
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
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
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
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
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
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
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
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {media.likesCount} lượt thích
              </Typography>
            )}
          </Box>
        </Box>

        {/* Category Badge */}
        {media.category && (
          <Chip
            label={media.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              backgroundColor: 'rgba(233, 30, 99, 0.9)',
              color: 'white',
              fontSize: '10px',
              height: '20px',
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
              backgroundColor: 'rgba(0,0,0,0.7)',
              borderRadius: '50%',
              width: 48,
              height: 48,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
            }}
          >
            ▶
          </Box>
        )}
      </Card>
    );
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      {/* Header with Search and Filters */}
      <Paper
        sx={{
          borderRadius: '16px',
          p: 3,
          mb: 3,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'stretch', md: 'center' },
          gap: 2,
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', flex: 1 }}>
            {mediaType === 'photos' ? 'Ảnh' : 'Video'} ({filteredMedia.length})
          </Typography>
          
          {/* Media Type Toggle */}
          <ToggleButtonGroup
            value={mediaType}
            exclusive
            onChange={(e, newType) => newType && setMediaType(newType)}
            size="small"
          >
            <ToggleButton value="photos">Ảnh</ToggleButton>
            <ToggleButton value="videos">Video</ToggleButton>
          </ToggleButtonGroup>

          {/* View Mode Toggle */}
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(e, newMode) => newMode && setViewMode(newMode)}
            size="small"
          >
            <ToggleButton value="grid">
              <GridView />
            </ToggleButton>
            <ToggleButton value="list">
              <ViewList />
            </ToggleButton>
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
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Thêm {mediaType === 'photos' ? 'ảnh' : 'video'}
            </Button>
          )}
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder={`Tìm kiếm ${mediaType === 'photos' ? 'ảnh' : 'video'}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{
            mb: 2,
            '& .MuiOutlinedInput-root': {
              borderRadius: '12px',
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
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {categories.map((category) => (
            <Chip
              key={category.id}
              label={`${category.label} (${category.count})`}
              onClick={() => setSelectedCategory(category.id)}
              variant={selectedCategory === category.id ? 'filled' : 'outlined'}
              sx={{
                borderColor: 'primary.main',
                color: selectedCategory === category.id ? 'white' : 'primary.main',
                backgroundColor: selectedCategory === category.id ? 'primary.main' : 'transparent',
                '&:hover': {
                  backgroundColor: selectedCategory === category.id ? 'primary.dark' : 'rgba(233, 30, 99, 0.05)',
                },
              }}
            />
          ))}
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
          sx={{
            borderRadius: '16px',
            p: 6,
            textAlign: 'center',
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(233, 30, 99, 0.1)',
          }}
        >
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
            Không tìm thấy {mediaType === 'photos' ? 'ảnh' : 'video'} nào
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc'
              : `Chưa có ${mediaType === 'photos' ? 'ảnh' : 'video'} nào được tải lên`
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
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
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
            borderRadius: '16px',
            bgcolor: 'rgba(0,0,0,0.9)',
            backdropFilter: 'blur(10px)',
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
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
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
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
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
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.2)' }
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
                    borderRadius: '8px',
                  }}
                />
              ) : (
                <Box
                  component="video"
                  controls
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '80vh',
                    borderRadius: '8px',
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
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 3,
                }}>
                  {selectedMedia.title && (
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedMedia.title}
                    </Typography>
                  )}
                  {selectedMedia.description && (
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {selectedMedia.description}
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
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
          sx: { borderRadius: '12px' }
        }}
      >
        <MenuItem onClick={() => {
          // Handle edit
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 1 }} />
          Chỉnh sửa
        </MenuItem>
        <MenuItem 
          onClick={() => {
            handleDeleteMedia(selectedMediaForMenu?.id);
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 1 }} />
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
            background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
            '&:hover': {
              background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
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