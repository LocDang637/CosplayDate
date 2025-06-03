// src/pages/CosplayersPage.jsx - Complete implementation
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
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
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Search,
  ExpandMore
} from '@mui/icons-material';
import { ThemeProvider } from '@mui/material/styles';
import { cosplayTheme } from '../theme/cosplayTheme';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import CosplayerCard from '../components/cosplayer/CosplayerCard';
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
  const [totalCount, setTotalCount] = useState(0);
  const [favorites, setFavorites] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    gender: [],
    categories: [],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: '',
    specialties: [],
    isAvailable: null
  });
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  
  const itemsPerPage = 12;

  const categories = [
    'Anime', 'Game', 'Movie', 'TV Show', 'Comic', 'Original Character',
    'Fantasy', 'Sci-Fi', 'Historical', 'Gothic', 'Kawaii', 'Maid',
    'School Uniform', 'Traditional', 'Modern', 'Other'
  ];

  const specialties = [
    'Costume Making', 'Prop Making', 'Wig Styling', 'Makeup Artist',
    'Photography', 'Performance', 'Voice Acting', 'Dancing'
  ];

  const locations = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    const initialFilters = Object.fromEntries(searchParams);
    if (Object.keys(initialFilters).length > 0) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
      setSearchTerm(initialFilters.searchTerm || '');
    }
  }, []);

  useEffect(() => {
    loadCosplayers();
  }, [currentPage, searchTerm, filters, sortBy, sortOrder]);

  const loadCosplayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: currentPage,
        pageSize: itemsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(searchTerm && { searchTerm }),
        ...(filters.gender.length > 0 && { gender: filters.gender.join(',') }),
        ...(filters.categories.length > 0 && { category: filters.categories.join(',') }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minPrice && { minPrice: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: parseFloat(filters.maxPrice) }),
        ...(filters.minRating && { minRating: parseFloat(filters.minRating) }),
        ...(filters.specialties.length > 0 && { specialties: filters.specialties.join(',') }),
        ...(filters.isAvailable !== null && { isAvailable: filters.isAvailable })
      };

      const result = await cosplayerAPI.getCosplayers(queryParams);

      if (result.success) {
        const data = result.data;
        setCosplayers(data.cosplayers || data.items || data || []);
        setTotalCount(data.totalCount || data.length || 0);
        setTotalPages(data.totalPages || Math.ceil((data.totalCount || data.length || 0) / itemsPerPage));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể tải danh sách cosplayer');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
    updateSearchParams({ ...filters, searchTerm: value });
  };

  const handleFilterChange = (filterType, value, checked) => {
    let newFilters = { ...filters };
    
    if (Array.isArray(newFilters[filterType])) {
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
    } else {
      newFilters[filterType] = value;
    }
    
    setFilters(newFilters);
    setCurrentPage(1);
    updateSearchParams({ ...newFilters, searchTerm });
  };

  const updateSearchParams = (newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && (Array.isArray(value) ? value.length > 0 : true)) {
        params.set(key, Array.isArray(value) ? value.join(',') : value);
      }
    });
    setSearchParams(params);
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

  const handleBooking = (cosplayer) => {
    navigate(`/booking/${cosplayer.id}`);
  };

  const handleMessage = (cosplayer) => {
    navigate(`/messages/${cosplayer.id}`);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      categories: [],
      minPrice: '',
      maxPrice: '',
      minRating: '',
      location: '',
      specialties: [],
      isAvailable: null
    });
    setSearchTerm('');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const CosplayerSkeleton = () => (
    <Card sx={{ borderRadius: '16px', overflow: 'hidden', width: 240, height: 380 }}>
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{ p: 2 }}>
        <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
        <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={32} sx={{ borderRadius: '16px' }} />
      </Box>
    </Card>
  );

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
              height: 'fit-content',
              backgroundColor: '#FBCDFF',
              position: 'sticky',
              top: '84px',
              p: 3,
              borderRadius: '16px',
              mt: 2,
              flexShrink: 0,
            }}
          >
            <TextField
              fullWidth
              placeholder="Tìm kiếm cosplayer..."
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
                  Sắp xếp
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Sắp xếp theo</InputLabel>
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    label="Sắp xếp theo"
                  >
                    <MenuItem value="rating">Đánh giá</MenuItem>
                    <MenuItem value="price">Giá</MenuItem>
                    <MenuItem value="name">Tên</MenuItem>
                    <MenuItem value="created_date">Ngày tham gia</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel>Thứ tự</InputLabel>
                  <Select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    label="Thứ tự"
                  >
                    <MenuItem value="desc">Giảm dần</MenuItem>
                    <MenuItem value="asc">Tăng dần</MenuItem>
                  </Select>
                </FormControl>
              </AccordionDetails>
            </Accordion>

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
                <FormGroup sx={{ mb: 2 }}>
                  {['Male', 'Female', 'Other'].map((gender) => (
                    <FormControlLabel
                      key={gender}
                      control={
                        <Checkbox
                          checked={filters.gender.includes(gender)}
                          onChange={(e) => handleFilterChange('gender', gender, e.target.checked)}
                          size="small"
                        />
                      }
                      label={gender === 'Male' ? 'Nam' : gender === 'Female' ? 'Nữ' : 'Khác'}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </FormGroup>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Danh mục
                </Typography>
                <FormGroup sx={{ mb: 2, maxHeight: 150, overflowY: 'auto' }}>
                  {categories.slice(0, 5).map((category) => (
                    <FormControlLabel
                      key={category}
                      control={
                        <Checkbox
                          checked={filters.categories.includes(category)}
                          onChange={(e) => handleFilterChange('categories', category, e.target.checked)}
                          size="small"
                        />
                      }
                      label={category}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </FormGroup>

                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Khoảng giá (VNĐ/giờ)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Từ"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    size="small"
                    placeholder="Đến"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    sx={{ flex: 1 }}
                  />
                </Box>

                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Khu vực</InputLabel>
                  <Select
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    label="Khu vực"
                  >
                    <MenuItem value="">Tất cả</MenuItem>
                    {locations.map((location) => (
                      <MenuItem key={location} value={location}>{location}</MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filters.isAvailable === true}
                      onChange={(e) => handleFilterChange('isAvailable', e.target.checked ? true : null)}
                      size="small"
                    />
                  }
                  label="Chỉ cosplayer sẵn sàng"
                  sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                />
              </AccordionDetails>
            </Accordion>

            <Button
              variant="contained"
              onClick={clearFilters}
              fullWidth
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
                  mb: 2,
                }}
              >
                Khám phá ngay
              </Typography>
              
              {totalCount > 0 && (
                <Typography
                  variant="body1"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '16px',
                  }}
                >
                  Tìm thấy {totalCount} cosplayer phù hợp
                </Typography>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px', width: '100%' }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '24px',
                  justifyContent: 'center',
                  width: '100%',
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
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '24px',
                  justifyContent: 'center',
                  width: '100%',
                  maxWidth: '900px',
                }}
              >
                {cosplayers.map((cosplayer) => (
                  <CosplayerCard 
                    key={cosplayer.id} 
                    cosplayer={cosplayer}
                    onBooking={handleBooking}
                    onMessage={handleMessage}
                    onFavorite={handleFavorite}
                    isFavorite={favorites.has(cosplayer.id)}
                  />
                ))}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                  Không tìm thấy cosplayer nào
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Hãy thử thay đổi bộ lọc tìm kiếm
                </Typography>
                <Button
                  variant="contained"
                  onClick={clearFilters}
                  sx={{
                    background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                    borderRadius: '12px',
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Xóa tất cả bộ lọc
                </Button>
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
                  sx={{
                    '& .MuiPaginationItem-root': {
                      borderRadius: '8px',
                    },
                  }}
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