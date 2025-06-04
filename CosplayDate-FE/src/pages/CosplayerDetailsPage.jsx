// src/pages/CosplayerDetailsPage.jsx (FIXED VERSION)
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Button,
  Avatar,
  Card,
  CardContent,
  IconButton,
  Chip,
  Tab,
  Tabs,
  Paper,
  Rating,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Message,
  Coffee,
  Chat,
  Favorite,
  Person,
  CameraAlt,
  ArrowBackIos
} from '@mui/icons-material';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { cosplayerAPI, cosplayerMediaAPI } from '../services/cosplayerAPI';

const CosplayerDetailsPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cosplayer, setCosplayer] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [services, setServices] = useState([]); // ✅ Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  useEffect(() => {
    if (id) {
      loadCosplayerData();
    }
  }, [id]);

  const loadCosplayerData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Loading cosplayer data for ID:', id);

      // ✅ FIX: Load cosplayer details first, then handle optional data
      const cosplayerResult = await cosplayerAPI.getCosplayerDetails(id);
      
      if (!cosplayerResult.success) {
        console.error('❌ Failed to load cosplayer:', cosplayerResult.message);
        setError(cosplayerResult.message || 'Không thể tải thông tin cosplayer');
        return;
      }

      console.log('✅ Cosplayer loaded:', cosplayerResult.data);
      setCosplayer(cosplayerResult.data);

      // ✅ FIX: Load photos and services with error handling - don't fail if these fail
      try {
        const photosResult = await cosplayerMediaAPI.getPhotos(id);
        if (photosResult.success && Array.isArray(photosResult.data?.photos)) {
          setPhotos(photosResult.data.photos);
          console.log('✅ Photos loaded:', photosResult.data.photos.length);
        } else if (photosResult.success && Array.isArray(photosResult.data)) {
          setPhotos(photosResult.data);
          console.log('✅ Photos loaded:', photosResult.data.length);
        } else {
          console.warn('⚠️ No photos or invalid photos data:', photosResult);
          setPhotos([]); // ✅ Ensure it's an array
        }
      } catch (photoError) {
        console.warn('⚠️ Could not load photos:', photoError);
        setPhotos([]); // ✅ Fallback to empty array
      }

      // ✅ FIX: Load services with proper error handling
      try {
        const servicesResult = await cosplayerAPI.getServices(id);
        if (servicesResult.success && Array.isArray(servicesResult.data)) {
          setServices(servicesResult.data);
          console.log('✅ Services loaded:', servicesResult.data.length);
        } else if (servicesResult.success && servicesResult.data && Array.isArray(servicesResult.data.services)) {
          setServices(servicesResult.data.services);
          console.log('✅ Services loaded:', servicesResult.data.services.length);
        } else {
          console.warn('⚠️ No services or invalid services data:', servicesResult);
          setServices([]); // ✅ Ensure it's an array
        }
      } catch (serviceError) {
        console.warn('⚠️ Could not load services:', serviceError);
        setServices([]); // ✅ Fallback to empty array
      }
      
    } catch (err) {
      console.error('❌ Error loading cosplayer data:', err);
      setError('Không thể tải thông tin cosplayer');
    } finally {
      setLoading(false);
    }
  };

  const handleImageNavigation = (direction) => {
    if (!photos.length) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === photos.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? photos.length - 1 : prev - 1
      );
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleBooking = () => {
    navigate(`/booking/${cosplayer.id}`, { 
      state: { cosplayer } 
    });
  };

  const handleMessage = () => {
    navigate(`/messages/${cosplayer.id}`, { 
      state: { cosplayer } 
    });
  };

  const handleGoBack = () => {
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/cosplayers');
    }
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  // ✅ FIX: Add safe rendering checks
  const renderServices = () => {
    if (!Array.isArray(services)) {
      console.warn('⚠️ Services is not an array:', services);
      return (
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
          Không thể tải danh sách dịch vụ
        </Typography>
      );
    }

    if (services.length === 0) {
      return (
        <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
          Chưa có dịch vụ nào
        </Typography>
      );
    }

    return (
      <Grid container spacing={2}>
        {services.map((service, index) => (
          <Grid item xs={6} key={service.id || index}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 2,
                backgroundColor: 'rgba(255,255,255,0.7)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'center', color: 'text.primary', fontSize: '12px' }}>
                {service.name || service.serviceName || 'Dịch vụ'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '10px' }}>
                {formatPrice(service.price || service.pricePerHour)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderPhotos = () => {
    if (!Array.isArray(photos)) {
      console.warn('⚠️ Photos is not an array:', photos);
      return null;
    }

    return photos;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={onLogout} />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <CircularProgress size={60} sx={{ color: 'primary.main' }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            Đang tải thông tin cosplayer...
          </Typography>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={onLogout} />
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            action={
              <Button color="inherit" onClick={handleGoBack}>
                Quay lại
              </Button>
            }
          >
            {error}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!cosplayer) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        <Header user={user} onLogout={onLogout} />
        <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
          <Alert severity="warning">
            Không tìm thấy thông tin cosplayer
          </Alert>
          <Button onClick={handleGoBack} sx={{ mt: 2 }}>
            Quay lại
          </Button>
        </Container>
        <Footer />
      </Box>
    );
  }

  const safePhotos = renderPhotos();

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
      <Header user={user} onLogout={onLogout} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Button
          startIcon={<ArrowBackIos />}
          onClick={handleGoBack}
          sx={{
            mb: 3,
            color: 'text.secondary',
            textTransform: 'none',
            '&:hover': {
              backgroundColor: 'rgba(233, 30, 99, 0.05)',
              color: 'primary.main',
            },
          }}
        >
          Quay lại
        </Button>

        <Grid container spacing={3}>
          <Grid item xs={12} md={7}>
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                mb: 3,
                background: 'linear-gradient(135deg, #F8BBD9 0%, #E1BEE7 100%)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={cosplayer.profilePicture || cosplayer.avatar || cosplayer.avatarUrl}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '3px solid white',
                  }}
                >
                  {cosplayer.stageName ? cosplayer.stageName[0] : cosplayer.firstName?.[0] || '?'}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {cosplayer.stageName || `${cosplayer.firstName} ${cosplayer.lastName}` || 'Cosplayer'}
                    </Typography>
                    <Chip
                      label={cosplayer.isOnline ? 'Đang hoạt động' : 'Ngoại tuyến'}
                      size="small"
                      sx={{
                        backgroundColor: cosplayer.isOnline ? '#4CAF50' : '#9E9E9E',
                        color: 'white',
                        fontSize: '10px',
                        height: '20px',
                      }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {cosplayer.averageRating && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Rating value={cosplayer.averageRating} size="small" readOnly />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          ({cosplayer.totalReviews || 0})
                        </Typography>
                      </Box>
                    )}
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      👥 {cosplayer.followersCount || 0}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={handleMessage} sx={{ backgroundColor: 'rgba(233, 30, 99, 0.1)', color: 'primary.main' }}>
                  <Message />
                </IconButton>
              </Box>
            </Paper>

            {/* ✅ FIX: Safe photo rendering */}
            {safePhotos && safePhotos.length > 0 && (
              <Paper sx={{ borderRadius: '16px', overflow: 'hidden', position: 'relative', mb: 3 }}>
                <Box
                  component="img"
                  src={safePhotos[currentImageIndex]?.url || safePhotos[currentImageIndex]?.imageUrl}
                  sx={{
                    width: '100%',
                    height: '400px',
                    objectFit: 'cover',
                  }}
                />
                
                {safePhotos.length > 1 && (
                  <>
                    <IconButton
                      onClick={() => handleImageNavigation('prev')}
                      sx={{
                        position: 'absolute',
                        left: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                      }}
                    >
                      <ArrowBack />
                    </IconButton>
                    
                    <IconButton
                      onClick={() => handleImageNavigation('next')}
                      sx={{
                        position: 'absolute',
                        right: 10,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        backgroundColor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.7)' },
                      }}
                    >
                      <ArrowForward />
                    </IconButton>

                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        p: 2,
                        backgroundColor: 'rgba(0,0,0,0.1)',
                        justifyContent: 'center',
                      }}
                    >
                      {safePhotos.slice(0, 4).map((photo, index) => (
                        <Box
                          key={photo.id || index}
                          component="img"
                          src={photo.url || photo.imageUrl}
                          onClick={() => setCurrentImageIndex(index)}
                          sx={{
                            width: 60,
                            height: 60,
                            objectFit: 'cover',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            border: currentImageIndex === index ? '2px solid white' : '2px solid transparent',
                            opacity: currentImageIndex === index ? 1 : 0.7,
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </Box>
                  </>
                )}
              </Paper>
            )}

            <Paper sx={{ borderRadius: '16px', p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Giới thiệu
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                {cosplayer.bio || cosplayer.description || "Chưa có thông tin giới thiệu."}
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper sx={{ borderRadius: '16px', overflow: 'hidden', mb: 3 }}>
              <Tabs
                value={selectedTab}
                onChange={handleTabChange}
                sx={{
                  backgroundColor: '#F8BBD9',
                  '& .MuiTab-root': {
                    flex: 1,
                    fontWeight: 600,
                    color: 'text.primary',
                  },
                  '& .Mui-selected': { color: 'primary.main !important' },
                  '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: '3px' },
                }}
              >
                <Tab label="Dịch vụ" />
                <Tab label="Khoảnh khắc" />
              </Tabs>

              <Box sx={{ p: 3, backgroundColor: '#F8BBD9' }}>
                {selectedTab === 0 && renderServices()}

                {selectedTab === 1 && (
                  <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>
                    Chưa có khoảnh khắc nào
                  </Typography>
                )}
              </Box>

              <Box sx={{ p: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleBooking}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: '24px',
                    textTransform: 'none',
                    '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.05)' },
                  }}
                >
                  Đặt lịch
                </Button>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleMessage}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    color: 'white',
                    fontWeight: 600,
                    py: 1.5,
                    borderRadius: '24px',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(45deg, #AD1457, #7B1FA2)' },
                  }}
                >
                  Nhắn tin
                </Button>
              </Box>
            </Paper>

            {/* ✅ FIX: Safe photo grid rendering */}
            {safePhotos && safePhotos.length > 4 && (
              <Paper sx={{ borderRadius: '16px', p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CameraAlt sx={{ color: 'text.secondary' }} />
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    Hình ảnh nổi bật
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {safePhotos.slice(0, 6).map((photo, index) => (
                    <Grid item xs={6} key={photo.id || index}>
                      <Box
                        component="img"
                        src={photo.url || photo.imageUrl}
                        sx={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'scale(1.05)' },
                        }}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default CosplayerDetailsPage;