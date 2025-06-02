// src/pages/CosplayersPage.jsx
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
  Skeleton,
  Alert
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
import { cosplayerAPI } from '../services/cosplayerAPI';

const CosplayersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [cosplayers, setCosplayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [favorites, setFavorites] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: [],
    categories: [],
    priceRange: []
  });
  
  const itemsPerPage = 12;

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    loadCosplayers();
  }, [currentPage, searchTerm, filters]);

  const loadCosplayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        pageSize: itemsPerPage,
        searchTerm: searchTerm || undefined,
        ...(filters.gender.length > 0 && { gender: filters.gender.join(',') }),
        ...(filters.categories.length > 0 && { categories: filters.categories.join(',') }),
        ...(filters.priceRange.length > 0 && { priceRange: filters.priceRange.join(',') })
      };

      const result = await cosplayerAPI.getCosplayers(queryParams);

      if (result.success) {
        setCosplayers(result.data.items || result.data || []);
        setTotalPages(Math.ceil((result.data.totalCount || result.data.length) / itemsPerPage));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to load cosplayers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (filterType, value, checked) => {
    const newFilters = { ...filters };
    if (checked) {
      newFilters[filterType] = [...newFilters[filterType], value];
    } else {
      newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
    }
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFavorite = (cosplayerId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(cosplayerId)) {
      newFavorites.delete(cosplayerId);
    } else {
      newFavorites.add(cosplayerId);
    }
    setFavorites(newFavorites);
  };

  const handleViewCosplayer = (cosplayerId) => {
    navigate(`/cosplayer/${cosplayerId}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  const CosplayerSkeleton = () => (
    <Card sx={{ borderRadius: '16px', overflow: 'hidden', width: 200, height: 330 }}>
      <Skeleton variant="rectangular" height={200} />
      <CardContent sx={{ p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: '16px' }} />
      </CardContent>
    </Card>
  );

  const CosplayerCard = ({ cosplayer }) => {
    const isFavorite = favorites.has(cosplayer.id);

    return (
      <Card
        onClick={() => handleViewCosplayer(cosplayer.id)}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          background: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          cursor: 'pointer',
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
            image={cosplayer.profilePicture || '/src/assets/default-avatar.png'}
            alt={cosplayer.stageName}
            sx={{ objectFit: 'cover' }}
          />
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(cosplayer.id);
            }}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255,255,255,0.9)',
              color: isFavorite ? '#D200C4' : 'text.secondary',
              width: 32,
              height: 32,
              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
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
              {cosplayer.stageName}
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
              {formatPrice(cosplayer.hourlyRate)}
            </Typography>

            {cosplayer.averageRating && (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                <Rating value={cosplayer.averageRating} size="small" readOnly />
                <Typography variant="body2" sx={{ fontSize: '10px', ml: 0.5 }}>
                  ({cosplayer.totalReviews || 0})
                </Typography>
              </Box>
            )}
          </Box>

          <Button
            variant="contained"
            fullWidth
            onClick={(e) => {
              e.stopPropagation();
              handleViewCosplayer(cosplayer.id);
            }}
            sx={{
              background: '#D200C4',
              color: 'white',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '16px',
              textTransform: 'none',
              py: 0.8,
              minHeight: 32,
              '&:hover': { background: '#B8009B' },
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
        <Header user={user} onLogout={handleLogout} />

        <Box sx={{ 
          display: 'flex', 
          backgroundColor: '#FFE8F5', 
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          justifyContent: 'center',
          gap: 4,
          px: 4,
        }}>
          {/* Sidebar */}
          <Box
            sx={{
              width: '350px',
              height: '870px',
              backgroundColor: '#FBCDFF',
              position: 'sticky',
              top: '84px',
              p: 3,
              overflowY: 'auto',
              borderRadius: '16px',
              mt: 2,
              mb: 2,
              flexShrink: 0,
            }}
          >
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

            <Accordion defaultExpanded sx={{ backgroundColor: 'transparent', boxShadow: 'none', mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px', color: '#333' }}>
                  Bộ lọc
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Giới tính
                </Typography>
                <FormGroup>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <FormControlLabel
                      key={gender}
                      control={
                        <Checkbox
                          checked={filters.gender.includes(gender)}
                          onChange={(e) => handleFilterChange('gender', gender, e.target.checked)}
                        />
                      }
                      label={gender === 'Male' ? 'Nam' : gender === 'Female' ? 'Nữ' : 'Khác'}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </FormGroup>
              </AccordionDetails>
            </Accordion>

            <Button
              variant="contained"
              onClick={() => setFilters({ gender: [], categories: [], priceRange: [] })}
              sx={{
                background: '#333',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                borderRadius: '20px',
                textTransform: 'none',
                px: 4,
                py: 1.2,
                '&:hover': { background: '#222' },
              }}
            >
              Xóa bộ lọc
            </Button>
          </Box>

          {/* Main Content */}
          <Box sx={{ 
            flex: 1, 
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            maxWidth: '1000px',
          }}>
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

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 200px)',
                  gap: '65px 65px',
                  justifyContent: 'center',
                  maxWidth: '900px',
                }}
              >
                {Array.from({ length: 12 }).map((_, index) => (
                  <CosplayerSkeleton key={index} />
                ))}
              </Box>
            ) : cosplayers.length > 0 ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 200px)',
                  gap: '65px 65px',
                  justifyContent: 'center',
                  maxWidth: '900px',
                }}
              >
                {cosplayers.map((cosplayer) => (
                  <CosplayerCard key={cosplayer.id} cosplayer={cosplayer} />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Không tìm thấy cosplayer nào
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Hãy thử thay đổi bộ lọc tìm kiếm
                </Typography>
              </Box>
            )}

            {!loading && totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </Box>
        </Box>

        <Footer />
      </Box>
    </ThemeProvider>
  );
};

export default CosplayersPage;