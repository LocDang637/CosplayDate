import React, { useState } from 'react';
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
  Badge
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
  Fullscreen
} from '@mui/icons-material';

const ProfileGallery = ({ 
  photos = [], 
  isOwnProfile = false, 
  onAddPhoto,
  loading = false 
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [likedPhotos, setLikedPhotos] = useState(new Set());

  // Mock categories for filtering
  const categories = [
    { id: 'all', label: 'Tất cả', count: photos.length },
    { id: 'anime', label: 'Anime', count: 12 },
    { id: 'game', label: 'Game', count: 8 },
    { id: 'original', label: 'Gốc', count: 5 },
    { id: 'event', label: 'Sự kiện', count: 3 },
  ];

  // Filter photos based on search and category
  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = searchTerm === '' || 
      photo.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      photo.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || photo.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handlePhotoClick = (photo, index) => {
    setSelectedPhoto({ ...photo, index });
  };

  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  const handleNextPhoto = () => {
    if (selectedPhoto && selectedPhoto.index < filteredPhotos.length - 1) {
      const nextIndex = selectedPhoto.index + 1;
      setSelectedPhoto({ ...filteredPhotos[nextIndex], index: nextIndex });
    }
  };

  const handlePrevPhoto = () => {
    if (selectedPhoto && selectedPhoto.index > 0) {
      const prevIndex = selectedPhoto.index - 1;
      setSelectedPhoto({ ...filteredPhotos[prevIndex], index: prevIndex });
    }
  };

  const handleLike = (photoId) => {
    const newLikedPhotos = new Set(likedPhotos);
    if (newLikedPhotos.has(photoId)) {
      newLikedPhotos.delete(photoId);
    } else {
      newLikedPhotos.add(photoId);
    }
    setLikedPhotos(newLikedPhotos);
  };

  const PhotoSkeleton = () => (
    <Card sx={{ borderRadius: '12px', overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={200} />
    </Card>
  );

  const PhotoCard = ({ photo, index }) => {
    const isLiked = likedPhotos.has(photo.id);
    
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
            '& .photo-overlay': {
              opacity: 1,
            },
          },
        }}
        onClick={() => handlePhotoClick(photo, index)}
      >
        <CardMedia
          component="img"
          height="200"
          image={photo.url}
          alt={photo.title}
          sx={{ objectFit: 'cover' }}
        />
        
        {/* Overlay */}
        <Box
          className="photo-overlay"
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
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleLike(photo.id);
              }}
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: isLiked ? '#E91E63' : 'white',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
              }}
            >
              {isLiked ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
            
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle share
                }}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  '&:hover': { backgroundColor: 'rgba(255,255,255,0.3)' }
                }}
              >
                <Share />
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPhoto({ ...photo, index });
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
            {photo.title && (
              <Typography
                variant="body2"
                sx={{
                  color: 'white',
                  fontWeight: 600,
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  mb: 0.5,
                }}
              >
                {photo.title}
              </Typography>
            )}
            
            {photo.likes && (
              <Typography
                variant="caption"
                sx={{
                  color: 'white',
                  textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                }}
              >
                {photo.likes} lượt thích
              </Typography>
            )}
          </Box>
        </Box>

        {/* Category Badge */}
        {photo.category && (
          <Chip
            label={photo.category}
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
      </Card>
    );
  };

  return (
    <Box>
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
            Bộ sưu tập ảnh ({filteredPhotos.length})
          </Typography>
          
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

          {/* Add Photo Button (Own Profile Only) */}
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddPhoto}
              sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Thêm ảnh
            </Button>
          )}
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Tìm kiếm ảnh theo tiêu đề hoặc thẻ..."
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

      {/* Photo Grid */}
      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 12 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <PhotoSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : filteredPhotos.length > 0 ? (
        <Grid container spacing={2}>
          {filteredPhotos.map((photo, index) => (
            <Grid 
              item 
              xs={12} 
              sm={viewMode === 'grid' ? 6 : 12} 
              md={viewMode === 'grid' ? 4 : 12} 
              lg={viewMode === 'grid' ? 3 : 12} 
              key={photo.id}
            >
              <PhotoCard photo={photo} index={index} />
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
            Không tìm thấy ảnh nào
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
            {searchTerm || selectedCategory !== 'all' 
              ? 'Hãy thử điều chỉnh tìm kiếm hoặc bộ lọc của bạn'
              : 'Chưa có ảnh nào được tải lên'
            }
          </Typography>
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAddPhoto}
              sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Tải lên ảnh đầu tiên của bạn
            </Button>
          )}
        </Paper>
      )}

      {/* Photo Modal */}
      <Dialog
        open={!!selectedPhoto}
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
          {selectedPhoto && (
            <>
              {/* Close Button */}
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
              {selectedPhoto.index > 0 && (
                <IconButton
                  onClick={handlePrevPhoto}
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

              {selectedPhoto.index < filteredPhotos.length - 1 && (
                <IconButton
                  onClick={handleNextPhoto}
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

              {/* Photo */}
              <Box
                component="img"
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                sx={{
                  width: '100%',
                  height: 'auto',
                  maxHeight: '80vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                }}
              />

              {/* Photo Info */}
              {(selectedPhoto.title || selectedPhoto.description) && (
                <Box sx={{ 
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                  color: 'white',
                  p: 3,
                }}>
                  {selectedPhoto.title && (
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                      {selectedPhoto.title}
                    </Typography>
                  )}
                  {selectedPhoto.description && (
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {selectedPhoto.description}
                    </Typography>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Floating Add Button (Mobile) */}
      {isOwnProfile && (
        <Fab
          color="primary"
          onClick={onAddPhoto}
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