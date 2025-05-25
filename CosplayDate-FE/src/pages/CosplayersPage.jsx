import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Rating,
  IconButton,
  Pagination,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Skeleton
} from '@mui/material';
import {
  Message,
  Favorite,
  FavoriteBorder,
  Search,
  ExpandMore
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const CosplayersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [cosplayers, setCosplayers] = useState([]);
  const [filteredCosplayers, setFilteredCosplayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: [],
    characters: [],
    priceRange: []
  });
  
  const itemsPerPage = 12; // 3 per row, 4 rows

  // Load user from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Mock cosplayers data (expanded)
  const mockCosplayers = [
    {
      id: 1,
      name: 'Cosplayer A',
      price: 400000,
      category: 'Anime',
      image: '/src/assets/cosplayer1.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: true
    },
    {
      id: 2,
      name: 'Cosplayer B',
      price: 450000,
      category: 'Game',
      image: '/src/assets/cosplayer2.png',
      gender: 'Nam',
      character: 'Naruto',
      available: true
    },
    {
      id: 3,
      name: 'Cosplayer C',
      price: 350000,
      category: 'Movie',
      image: '/src/assets/cosplayer3.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: false
    },
    {
      id: 4,
      name: 'Cosplayer D',
      price: 500000,
      category: 'Original',
      image: '/src/assets/cosplayer4.png',
      gender: 'Nam',
      character: 'Naruto',
      available: true
    },
    {
      id: 5,
      name: 'Cosplayer E',
      price: 380000,
      category: 'Anime',
      image: '/src/assets/cosplayer5.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: true
    },
    {
      id: 6,
      name: 'Cosplayer F',
      price: 420000,
      category: 'Game',
      image: '/src/assets/cosplayer6.png',
      gender: 'Nam',
      character: 'Naruto',
      available: true
    },
    {
      id: 7,
      name: 'Cosplayer G',
      price: 460000,
      category: 'Historical',
      image: '/src/assets/cosplayer7.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: false
    },
    {
      id: 8,
      name: 'Cosplayer H',
      price: 390000,
      category: 'Anime',
      image: '/src/assets/cosplayer8.png',
      gender: 'Nam',
      character: 'Naruto',
      available: true
    },
    {
      id: 9,
      name: 'Cosplayer I',
      price: 480000,
      category: 'Game',
      image: '/src/assets/cosplayer1.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: true
    },
    {
      id: 10,
      name: 'Cosplayer J',
      price: 430000,
      category: 'Anime',
      image: '/src/assets/cosplayer2.png',
      gender: 'Nam',
      character: 'Naruto',
      available: true
    },
    {
      id: 11,
      name: 'Cosplayer K',
      price: 410000,
      category: 'Movie',
      image: '/src/assets/cosplayer3.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: true
    },
    {
      id: 12,
      name: 'Cosplayer L',
      price: 470000,
      category: 'Original',
      image: '/src/assets/cosplayer4.png',
      gender: 'Nam',
      character: 'Naruto',
      available: false
    },
    // Add more to have enough for 4 rows
    {
      id: 13,
      name: 'Cosplayer M',
      price: 440000,
      category: 'Anime',
      image: '/src/assets/cosplayer5.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: true
    },
    {
      id: 14,
      name: 'Cosplayer N',
      price: 460000,
      category: 'Game',
      image: '/src/assets/cosplayer6.png',
      gender: 'Nam',
      character: 'Naruto',
      available: true
    },
    {
      id: 15,
      name: 'Cosplayer O',
      price: 420000,
      category: 'Movie',
      image: '/src/assets/cosplayer7.png',
      gender: 'Nữ',
      character: 'Naruto',
      available: true
    }
  ];

  // Load cosplayers data
  useEffect(() => {
    const loadCosplayers = async () => {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCosplayers(mockCosplayers);
      setFilteredCosplayers(mockCosplayers);
      setLoading(false);
    };

    loadCosplayers();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(value, filters);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[filterType] = [...newFilters[filterType], value];
    } else {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    }
    setFilters(newFilters);
    applyFilters(searchTerm, newFilters);
  };

  // Apply filters
  const applyFilters = (search, currentFilters) => {
    let filtered = [...cosplayers];

    // Search by name
    if (search) {
      filtered = filtered.filter(cosplayer =>
        cosplayer.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by gender
    if (currentFilters.gender.length > 0) {
      filtered = filtered.filter(cosplayer =>
        currentFilters.gender.includes(cosplayer.gender)
      );
    }

    // Filter by character
    if (currentFilters.characters.length > 0) {
      filtered = filtered.filter(cosplayer =>
        currentFilters.characters.includes(cosplayer.character)
      );
    }

    // Filter by price range
    if (currentFilters.priceRange.length > 0) {
      filtered = filtered.filter(cosplayer => {
        return currentFilters.priceRange.some(range => {
          if (range === '100.000 vnd') return cosplayer.price <= 100000;
          if (range === '200.000 vnd') return cosplayer.price <= 200000;
          return true;
        });
      });
    }

    setFilteredCosplayers(filtered);
    setCurrentPage(1);
  };

  // Handle pagination
  const totalPages = Math.ceil(filteredCosplayers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentCosplayers = filteredCosplayers.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle actions
  const handleFavorite = (cosplayerId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(cosplayerId)) {
      newFavorites.delete(cosplayerId);
    } else {
      newFavorites.add(cosplayerId);
    }
    setFavorites(newFavorites);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/h';
  };

  // Loading skeleton
  const CosplayerSkeleton = () => (
    <Card sx={{ 
      borderRadius: '16px', 
      overflow: 'hidden',
      width: 200,
      height: 330
    }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: '16px' }} />
      </CardContent>
    </Card>
  );

  // Cosplayer Card Component
  const CosplayerCard = ({ cosplayer }) => {
    const isFavorite = favorites.has(cosplayer.id);

    return (
      <Card
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
          },
          width: 200,
          height: 330,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="180"
            image={cosplayer.image}
            alt={cosplayer.name}
            sx={{ objectFit: 'cover' }}
          />
          <IconButton
            onClick={() => handleFavorite(cosplayer.id)}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: isFavorite ? '#D200C4' : 'text.secondary',
              width: 32,
              height: 32,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,1)',
              },
            }}
          >
            {isFavorite ? <Favorite sx={{ fontSize: 18 }} /> : <FavoriteBorder sx={{ fontSize: 18 }} />}
          </IconButton>
        </Box>
        
        <CardContent sx={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          p: 1.5,
          justifyContent: 'space-between'
        }}>
          <Box>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 0.5, 
              fontSize: '14px',
              textAlign: 'center',
              lineHeight: 1.2
            }}>
              {cosplayer.name}
            </Typography>

            <Typography
              variant="h6"
              sx={{
                color: '#D200C4',
                fontWeight: 600,
                mb: 1,
                fontSize: '12px',
                textAlign: 'center',
              }}
            >
              {formatPrice(cosplayer.price)}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
              <IconButton
                onClick={() => handleFavorite(cosplayer.id)}
                sx={{
                  color: isFavorite ? '#D200C4' : 'text.secondary',
                  fontSize: '10px',
                  p: 0.5,
                }}
              >
                {isFavorite ? <Favorite sx={{ fontSize: 16 }} /> : <FavoriteBorder sx={{ fontSize: 16 }} />}
              </IconButton>
              <Typography variant="body2" sx={{ fontSize: '10px', ml: 0.5 }}>
                Yêu thích nhiều
              </Typography>
            </Box>
          </Box>

          <Button
            variant="contained"
            fullWidth
            sx={{
              background: '#D200C4',
              color: 'white',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '16px',
              textTransform: 'none',
              py: 0.8,
              minHeight: 32,
              '&:hover': {
                background: '#B8009B',
              },
            }}
          >
            Xem chi tiết
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <ThemeProvider theme={cosplayTheme}>
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
        {/* Header */}
        <Header 
          user={user} 
          onLogout={handleLogout} 
          sx={{ 
            position: 'sticky',
            top: 0,
            zIndex: 10, // Higher z-index than sidebar
            backgroundColor: '#FFE8F5',
            backdropFilter: 'blur(10px)',
          }} 
        />

        <Box 
          sx={{ 
            display: 'flex', 
            backgroundColor: '#FFE8F5', 
            minHeight: 'calc(100vh - 64px)', // Account for header height
            position: 'relative',
            justifyContent: 'center', // Center the entire content
            gap: 4, // Add gap between sidebar and main content
            px: 4, // Add horizontal padding to container
          }}
        >
          {/* Sidebar */}
          <Box
            sx={{
              width: '350px',
              height: '870px',
              backgroundColor: '#FBCDFF',
              position: 'sticky',
              top: '84px', // Header height (64px) + gap (20px)
              p: 3,
              overflowY: 'auto',
              borderRadius: '16px',
              boxShadow: '0 8px 32px rgba(109, 0, 98, 0.15)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              mt: 2,
              mb: 2,
              flexShrink: 0,
              zIndex: 1, // Ensure sidebar is below header
            }}
          >
            {/* Search */}
            <TextField
              fullWidth
              placeholder="Tên Cosplayer"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              size="small"
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255,255,255,0.8)',
                  borderRadius: '25px',
                  fontSize: '14px',
                  height: '40px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Filters */}
            <Box>
              {/* Gender Filter */}
              <Accordion
                defaultExpanded
                sx={{
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  mb: 2,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    px: 0,
                    '& .MuiAccordionSummary-content': {
                      margin: '8px 0',
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      fontSize: '16px',
                      color: '#333',
                    }}
                  >
                    Bộ lọc
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                      mb: 1,
                    }}
                  >
                    Giới tính
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.gender.includes('Nam')}
                          onChange={(e) => handleFilterChange('gender', 'Nam', e.target.checked)}
                          sx={{ color: '#6D0062' }}
                        />
                      }
                      label="Nam"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={filters.gender.includes('Nữ')}
                          onChange={(e) => handleFilterChange('gender', 'Nữ', e.target.checked)}
                          sx={{ color: '#6D0062' }}
                        />
                      }
                      label="Nữ"
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  </FormGroup>
                </AccordionDetails>
              </Accordion>

              {/* Character Filter */}
              <Accordion
                defaultExpanded
                sx={{
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  mb: 2,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    px: 0,
                    '& .MuiAccordionSummary-content': {
                      margin: '8px 0',
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                    }}
                  >
                    Nhân vật cosplay
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <FormGroup>
                    {['Naruto', 'Naruto', 'Naruto', 'Naruto'].map((character, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={filters.characters.includes(character)}
                            onChange={(e) => handleFilterChange('characters', character, e.target.checked)}
                            sx={{ color: '#6D0062' }}
                          />
                        }
                        label={character}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>

              {/* Price Filter */}
              <Accordion
                defaultExpanded
                sx={{
                  backgroundColor: 'transparent',
                  boxShadow: 'none',
                  '&:before': { display: 'none' },
                  mb: 2,
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    px: 0,
                    '& .MuiAccordionSummary-content': {
                      margin: '8px 0',
                    },
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 600,
                      fontSize: '14px',
                      color: '#333',
                    }}
                  >
                    Giá tiền
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ px: 0, pt: 0 }}>
                  <FormGroup>
                    {['100.000 vnd', '200.000 vnd'].map((price, index) => (
                      <FormControlLabel
                        key={index}
                        control={
                          <Checkbox
                            checked={filters.priceRange.includes(price)}
                            onChange={(e) => handleFilterChange('priceRange', price, e.target.checked)}
                            sx={{ color: '#6D0062' }}
                          />
                        }
                        label={price}
                        sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>

              {/* Style Section */}
              <Box sx={{ mt: 4 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    fontSize: '16px',
                    color: '#333',
                    mb: 2,
                  }}
                >
                  Style
                </Typography>
                <Button
                  variant="contained"
                  sx={{
                    background: '#333',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    borderRadius: '20px',
                    textTransform: 'none',
                    px: 4,
                    py: 1.2,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    '&:hover': {
                      background: '#222',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                    },
                    transition: 'all 0.3s ease',
                  }}
                >
                  Áp dụng
                </Button>
              </Box>
            </Box>
          </Box>

          {/* Main Content */}
          <Box sx={{ 
            flex: 1, 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            overflow: 'hidden',
            maxWidth: '1000px', // Control max width for better centering
          }}>
            {/* Page Header */}
            <Box sx={{ textAlign: 'center', mb: 4, width: '100%' }}>
              <Typography
                variant="h2"
                sx={{
                  fontFamily: 'Junge, serif',
                  fontWeight: 400,
                  fontSize: { xs: '3rem', md: '4rem' },
                  color: '#6D0062',
                  mb: 1,
                  lineHeight: 1.2,
                }}
              >
                Cosplayer
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontFamily: 'Arial, sans-serif',
                  fontWeight: 400,
                  fontSize: { xs: '1.2rem', md: '1.5rem' },
                  color: '#D200C4',
                }}
              >
                Khám phá ngay
              </Typography>
            </Box>

            {/* Cosplayers Grid */}
            {loading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 200px)',
                  gap: '65px 65px',
                  justifyContent: 'center',
                  margin: '0 auto',
                  maxWidth: '900px',
                }}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <Box key={index} sx={{ width: 200, height: 330 }}>
                    <CosplayerSkeleton />
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 200px)',
                  gap: '65px 65px',
                  justifyContent: 'center',
                  margin: '0 auto',
                  maxWidth: '900px',
                }}
              >
                {currentCosplayers.map((cosplayer) => (
                  <Box key={cosplayer.id} sx={{ width: 200, height: 330 }}>
                    <CosplayerCard cosplayer={cosplayer} />
                  </Box>
                ))}
              </Box>
            )}

            {/* No Results */}
            {!loading && filteredCosplayers.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Không tìm thấy cosplayer nào
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Hãy thử thay đổi bộ lọc tìm kiếm của bạn
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {!loading && filteredCosplayers.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                      color: '#6D0062',
                    },
                    '& .Mui-selected': {
                      backgroundColor: '#D200C4 !important',
                      color: 'white !important',
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </Box>

        {/* Footer */}
        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default CosplayersPage;