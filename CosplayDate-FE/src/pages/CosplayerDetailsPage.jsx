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

const CosplayerDetailsPage = ({ user, onLogout }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [cosplayer, setCosplayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedTab, setSelectedTab] = useState(0);

  // Mock cosplayer database
  const mockCosplayersDB = {
    1: {
      id: 1,
      name: 'Cosplayer A',
      avatar: '/src/assets/cosplayer1.png',
      rating: 4.8,
      reviews: 24,
      followers: '9.5k',
      isOnline: true,
      price: 450000,
      category: 'Anime',
      location: 'TP. Hồ Chí Minh',
      bio: {
        intro: 'Xin chào, mình là cosplayer chuyên nghiệp với 5 năm kinh nghiệm',
        experience: 'Mình biết cosplay nhiều thể loại từ anime, game đến characters gốc',
        skills: 'Mình biết giao tiếp tốt và luôn mang đến trải nghiệm tuyệt vời',
        note: 'Mình luôn sẵn sàng tạo ra những khoảnh khắc đáng nhớ cùng bạn'
      },
      services: [
        { icon: <Coffee />, name: 'Uống cafe', description: 'Cà phê cùng cosplayer' },
        { icon: <Chat />, name: 'Nói chuyện', description: 'Trò chuyện thân thiện' },
        { icon: <Favorite />, name: 'Hẹn hò', description: 'Buổi hẹn lãng mạn' },
        { icon: <Person />, name: 'Đi chơi', description: 'Đi chơi cùng nhau' }
      ],
      images: [
        '/src/assets/cosplayer1.png',
        '/src/assets/cosplayer2.png',
        '/src/assets/cosplayer3.png',
        '/src/assets/cosplayer4.png'
      ],
      portfolioImages: [
        '/src/assets/cosplayer1.png',
        '/src/assets/cosplayer2.png',
        '/src/assets/cosplayer3.png'
      ]
    },
    2: {
      id: 2,
      name: 'Cosplayer B',
      avatar: '/src/assets/cosplayer2.png',
      rating: 4.9,
      reviews: 18,
      followers: '12.3k',
      isOnline: false,
      price: 450000,
      category: 'Game',
      location: 'Hà Nội',
      bio: {
        intro: 'Xin chào, mình là B - cosplayer game chuyên nghiệp',
        experience: 'Mình cosplay chủ yếu các nhân vật game nổi tiếng',
        skills: 'Mình biết makeup và styling chuyên nghiệp',
        note: 'Mình có thể cosplay theo yêu cầu của bạn'
      },
      services: [
        { icon: <Coffee />, name: 'Uống cafe', description: 'Cà phê cùng cosplayer' },
        { icon: <Chat />, name: 'Nói chuyện', description: 'Trò chuyện thân thiện' },
        { icon: <Favorite />, name: 'Hẹn hò', description: 'Buổi hẹn lãng mạn' },
        { icon: <Person />, name: 'Đi chơi', description: 'Đi chơi cùng nhau' }
      ],
      images: [
        '/src/assets/cosplayer2.png',
        '/src/assets/cosplayer1.png',
        '/src/assets/cosplayer3.png',
        '/src/assets/cosplayer4.png'
      ],
      portfolioImages: [
        '/src/assets/cosplayer2.png',
        '/src/assets/cosplayer1.png',
        '/src/assets/cosplayer3.png'
      ]
    },
    // Add more mock data for other cosplayers...
    3: {
      id: 3,
      name: 'Cosplayer C',
      avatar: '/src/assets/cosplayer3.png',
      rating: 4.7,
      reviews: 32,
      followers: '8.1k',
      isOnline: true,
      price: 350000,
      category: 'Movie',
      location: 'Đà Nẵng',
      bio: {
        intro: 'Xin chào, mình là C - chuyên cosplay nhân vật phim',
        experience: 'Mình có kinh nghiệm cosplay các nhân vật từ phim Hollywood',
        skills: 'Mình biết acting và tạo dáng chuyên nghiệp',
        note: 'Mình luôn chuẩn bị kỹ lưỡng cho mỗi buổi hẹn'
      },
      services: [
        { icon: <Coffee />, name: 'Uống cafe', description: 'Cà phê cùng cosplayer' },
        { icon: <Chat />, name: 'Nói chuyện', description: 'Trò chuyện thân thiện' },
        { icon: <Favorite />, name: 'Hẹn hò', description: 'Buổi hẹn lãng mạn' },
        { icon: <Person />, name: 'Đi chơi', description: 'Đi chơi cùng nhau' }
      ],
      images: [
        '/src/assets/cosplayer3.png',
        '/src/assets/cosplayer1.png',
        '/src/assets/cosplayer2.png',
        '/src/assets/cosplayer4.png'
      ],
      portfolioImages: [
        '/src/assets/cosplayer3.png',
        '/src/assets/cosplayer1.png',
        '/src/assets/cosplayer2.png'
      ]
    }
  };

  useEffect(() => {
    // Simulate API call to fetch cosplayer data
    const fetchCosplayer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const cosplayerData = mockCosplayersDB[parseInt(id)];
        
        if (!cosplayerData) {
          throw new Error('Cosplayer not found');
        }
        
        setCosplayer(cosplayerData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCosplayer();
    }
  }, [id]);

  const handleImageNavigation = (direction) => {
    if (!cosplayer) return;
    
    if (direction === 'next') {
      setCurrentImageIndex((prev) => 
        prev === cosplayer.images.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentImageIndex((prev) => 
        prev === 0 ? cosplayer.images.length - 1 : prev - 1
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
    // Go back to previous page or default to cosplayers page
    if (location.state?.from) {
      navigate(location.state.from);
    } else {
      navigate('/cosplayers');
    }
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
            {error === 'Cosplayer not found' ? 'Không tìm thấy cosplayer này' : 'Có lỗi xảy ra khi tải dữ liệu'}
          </Alert>
        </Container>
        <Footer />
      </Box>
    );
  }

  if (!cosplayer) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
      <Header user={user} onLogout={onLogout} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Back Button */}
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
          {/* Left Column */}
          <Grid item xs={12} md={7}>
            {/* Profile Header */}
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
                  src={cosplayer.avatar}
                  sx={{
                    width: 64,
                    height: 64,
                    border: '3px solid white',
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: 'text.primary',
                      }}
                    >
                      {cosplayer.name}
                    </Typography>
                    <Chip
                      label={cosplayer.isOnline ? 'Online' : 'Offline'}
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={cosplayer.rating} size="small" readOnly />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {cosplayer.reviews}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      👥 {cosplayer.followers}
                    </Typography>
                  </Box>
                </Box>
                <IconButton
                  onClick={handleMessage}
                  sx={{
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    color: 'primary.main',
                  }}
                >
                  <Message />
                </IconButton>
              </Box>
            </Paper>

            {/* Main Image with Navigation */}
            <Paper
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                position: 'relative',
                mb: 3,
              }}
            >
              <Box
                component="img"
                src={cosplayer.images[currentImageIndex]}
                sx={{
                  width: '100%',
                  height: '400px',
                  objectFit: 'cover',
                }}
              />
              
              {/* Image Navigation */}
              <IconButton
                onClick={() => handleImageNavigation('prev')}
                sx={{
                  position: 'absolute',
                  left: 10,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  },
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
                  '&:hover': {
                    backgroundColor: 'rgba(0,0,0,0.7)',
                  },
                }}
              >
                <ArrowForward />
              </IconButton>

              {/* Thumbnail Navigation */}
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  p: 2,
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  justifyContent: 'center',
                }}
              >
                {cosplayer.images.map((image, index) => (
                  <Box
                    key={index}
                    component="img"
                    src={image}
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
            </Paper>

            {/* Bio Section */}
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                mb: 3,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'text.primary',
                }}
              >
                Bio
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {cosplayer.bio.intro}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {cosplayer.bio.experience}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {cosplayer.bio.skills}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {cosplayer.bio.note}
                </Typography>
              </Box>
            </Paper>

            {/* User Comments Section (replacing Gifts) */}
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                border: '2px solid #E91E63',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  color: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <Message sx={{ color: 'primary.main' }} />
                Đánh giá từ người dùng
              </Typography>

              {/* Comments List */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Comment 1 */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: 'primary.main',
                        fontSize: '14px',
                      }}
                    >
                      M
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: '13px' }}
                      >
                        Minh Anh
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={5} size="small" readOnly />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          2 ngày trước
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    Cosplayer rất chuyên nghiệp và dễ thương! Tôi đã có một buổi hẹn tuyệt vời.
                  </Typography>
                </Box>

                {/* Comment 2 */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: 'secondary.main',
                        fontSize: '14px',
                      }}
                    >
                      H
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: '13px' }}
                      >
                        Hoàng Nam
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={4} size="small" readOnly />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          5 ngày trước
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    Dịch vụ tốt, giá cả hợp lý. Cosplayer rất thân thiện và đúng giờ hẹn.
                  </Typography>
                </Box>

                {/* Comment 3 */}
                <Box
                  sx={{
                    p: 2,
                    backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        backgroundColor: '#4CAF50',
                        fontSize: '14px',
                      }}
                    >
                      T
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, fontSize: '13px' }}
                      >
                        Thu Hà
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={5} size="small" readOnly />
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          1 tuần trước
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      color: 'text.primary',
                      fontSize: '13px',
                      lineHeight: 1.4,
                    }}
                  >
                    Trải nghiệm tuyệt vời! Cosplayer rất đẹp và có kỹ năng diễn xuất tốt.
                  </Typography>
                </Box>
              </Box>

              {/* View More Button */}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    textTransform: 'none',
                    borderRadius: '20px',
                    px: 3,
                    py: 1,
                    fontSize: '13px',
                    '&:hover': {
                      backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    },
                  }}
                >
                  Xem thêm đánh giá
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* Right Column */}
          <Grid item xs={12} md={5}>
            {/* Service Tabs */}
            <Paper
              sx={{
                borderRadius: '16px',
                overflow: 'hidden',
                mb: 3,
              }}
            >
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
                  '& .Mui-selected': {
                    color: 'primary.main !important',
                  },
                  '& .MuiTabs-indicator': {
                    backgroundColor: 'primary.main',
                    height: '3px',
                  },
                }}
              >
                <Tab label="Dịch vụ" />
                <Tab label="Khoảnh khắc" />
              </Tabs>

              <Box sx={{ p: 3, backgroundColor: '#F8BBD9' }}>
                {selectedTab === 0 && (
                  <Grid container spacing={2}>
                    {cosplayer.services.map((service, index) => (
                      <Grid item xs={6} key={index}>
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
                          <Box
                            sx={{
                              fontSize: '32px',
                              mb: 1,
                              color: 'primary.main',
                            }}
                          >
                            {service.icon}
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              textAlign: 'center',
                              color: 'text.primary',
                              fontSize: '12px',
                            }}
                          >
                            {service.name}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {selectedTab === 1 && (
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      color: 'text.secondary',
                      py: 4,
                    }}
                  >
                    Chưa có khoảnh khắc nào
                  </Typography>
                )}
              </Box>

              {/* Action Buttons */}
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
                    '&:hover': {
                      backgroundColor: 'rgba(233, 30, 99, 0.05)',
                    },
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
                    '&:hover': {
                      background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
                    },
                  }}
                >
                  Nhắn tin
                </Button>
              </Box>
            </Paper>

            {/* Portfolio Images */}
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <CameraAlt sx={{ color: 'text.secondary' }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                  }}
                >
                  Hình ảnh nổi bật
                </Typography>
              </Box>
              
              <Grid container spacing={2}>
                {cosplayer.portfolioImages.map((image, index) => (
                  <Grid item xs={6} key={index}>
                    <Box
                      component="img"
                      src={image}
                      sx={{
                        width: '100%',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.05)',
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
};

export default CosplayerDetailsPage;