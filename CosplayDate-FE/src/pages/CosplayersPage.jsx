// src/pages/CosplayersPage.jsx - Complete implementation with proper user passing
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
  MenuItem,
  Grid,
  CardContent
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
    category: [],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: '',
    specialties: [],
    tags: [],
    isAvailable: null
  });
  const [sortBy, setSortBy] = useState('price');
  const [sortOrder, setSortOrder] = useState('desc');

  // Static tags data (handled on frontend)
  const staticTags = [
    'Beginner Friendly',
    'Professional',
    'Affordable',
    'Premium',
    'Quick Response',
    'Custom Outfits',
    'Props Included',
    'Makeup Included',
    'Photography',
    'Events',
    'Conventions',
    'Photoshoots',
    'Group Cosplay',
    'Solo Performance',
    'Interactive',
    'High Quality',
    'Award Winner',
    'Experienced',
    'Creative',
    'Detailed'
  ];

  // Dynamic data from API
  const [availableCategories, setAvailableCategories] = useState([]);

  const itemsPerPage = 12;

  // Static location data (not provided by API)
  const locations = [
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'Nha Trang'
  ];

  // Static specialties data (handled on frontend)
  const specialties = [
    'Costume Making',
    'Prop Making',
    'Wig Styling',
    'Makeup Artist',
    'Photography',
    'Performance',
    'Voice Acting',
    'Dancing',
    'Singing',
    'Martial Arts',
    'Magic Shows',
    'Comedy',
    'Character Interaction',
    'Event Hosting',
    'Workshop Teaching'
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // console.log('CosplayersPage - User loaded:', parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }

    const initialFilters = Object.fromEntries(searchParams);
    if (Object.keys(initialFilters).length > 0) {
      // Parse array parameters from URL
      const parsedFilters = { ...filters };
      Object.entries(initialFilters).forEach(([key, value]) => {
        if (['gender', 'category', 'specialties', 'tags'].includes(key)) {
          parsedFilters[key] = value ? value.split(',') : [];
        } else if (key !== 'searchTerm') {
          parsedFilters[key] = value;
        }
      });

      setFilters(parsedFilters);
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
        ...(filters.category.length > 0 && { category: filters.category.join(',') }),
        ...(filters.location && { location: filters.location }),
        ...(filters.minPrice && { minPrice: parseFloat(filters.minPrice) }),
        ...(filters.maxPrice && { maxPrice: parseFloat(filters.maxPrice) }),
        ...(filters.minRating && { minRating: parseFloat(filters.minRating) }),
        // Note: specialties and tags filtering are handled on frontend, not sent to API
        ...(filters.isAvailable !== null && { isAvailable: filters.isAvailable })
      };

      // console.log('API Query Params:', queryParams);
      // console.log('Selected tags filter:', filters.tags);

      const result = await cosplayerAPI.getCosplayers(queryParams);

      if (result.success) {
        const data = result.data;

        // Get cosplayers from API
        let cosplayersData = data.cosplayers || [];

        // Apply frontend specialties filtering
        if (filters.specialties.length > 0) {
          cosplayersData = cosplayersData.filter(cosplayer => {
            // Check if cosplayer has ALL of the selected specialties (AND logic)
            const cosplayerSpecialties = cosplayer.specialties || [];
            return filters.specialties.every(selectedSpecialty => 
              cosplayerSpecialties.includes(selectedSpecialty)
            );
          });
        }

        // Apply frontend tags filtering
        if (filters.tags.length > 0) {
          cosplayersData = cosplayersData.filter(cosplayer => {
            // Check if cosplayer has ALL of the selected tags (AND logic)
            const cosplayerTags = cosplayer.tags || [];
            return filters.tags.every(selectedTag => 
              cosplayerTags.includes(selectedTag)
            );
          });
        }

        // Set filtered cosplayers data
        setCosplayers(cosplayersData);
        setTotalCount(data.totalCount || 0);
        setTotalPages(data.totalPages || 1);

        // Update available filter options from API response
        if (data.availableCategories) {
          setAvailableCategories(data.availableCategories);
        }

        // console.log('Available tags (static):', staticTags);
        // console.log('Current filters:', filters);
      } else {
        setError(result.message);
        setCosplayers([]);
        setTotalCount(0);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Không thể tải danh sách cosplayer');
      setCosplayers([]);
      setTotalCount(0);
      setTotalPages(1);
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

    // Handle category and gender as single selection (comes as array from dropdown)
    if ((filterType === 'category' || filterType === 'gender') && Array.isArray(value)) {
      newFilters[filterType] = value;
    }
    // Handle other array filters (specialties, tags) as multiple selection
    else if (Array.isArray(newFilters[filterType])) {
      if (checked) {
        newFilters[filterType] = [...newFilters[filterType], value];
      } else {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      }
    } 
    // Handle non-array filters (strings, numbers, etc.)
    else {
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
    navigate('/');
  };

  const clearFilters = () => {
    setFilters({
      gender: [],
      category: [],
      minPrice: '',
      maxPrice: '',
      minRating: '',
      location: '',
      specialties: [],
      tags: [],
      isAvailable: null
    });
    setSearchTerm('');
    setCurrentPage(1);
    setSearchParams(new URLSearchParams());
  };

  const CosplayerSkeleton = () => (
    <Card sx={{ borderRadius: '16px', overflow: 'hidden', width: 280, height: 380 }}>
      <Skeleton variant="rectangular" height={240} />
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
              mt: 5,
              mb: 5,
              flexShrink: 0,
            }}
          >
            {/* Sorting Section */}
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
                    <MenuItem value="price">Giá</MenuItem>
                    <MenuItem value="name">Tên</MenuItem>
                    <MenuItem value="followersCount">Số người theo dõi</MenuItem>
                    <MenuItem value="createdDate">Ngày tham gia</MenuItem>
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

            {/* Filters Section */}
            <Accordion defaultExpanded sx={{ backgroundColor: 'transparent', boxShadow: 'none', mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px', color: '#333' }}>
                  Bộ lọc
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 0, pt: 0 }}>

                {/* Gender Filter - Single selection using dropdown */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Giới tính
                </Typography>
                <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                  <InputLabel>Chọn giới tính</InputLabel>
                  <Select
                    value={filters.gender.length > 0 ? filters.gender[0] : ''}
                    onChange={(e) => handleFilterChange('gender', e.target.value ? [e.target.value] : [])}
                    label="Chọn giới tính"
                  >
                    <MenuItem value="">Tất cả giới tính</MenuItem>
                    <MenuItem value="Male">Nam</MenuItem>
                    <MenuItem value="Female">Nữ</MenuItem>
                    <MenuItem value="Other">Khác</MenuItem>
                  </Select>
                </FormControl>

                {/* Price Range Filter */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Khoảng giá (VNĐ/giờ)
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    size="small"
                    placeholder="Giá tối thiểu"
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                  <TextField
                    size="small"
                    placeholder="Giá tối đa"
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    sx={{ flex: 1 }}
                    InputProps={{
                      inputProps: { min: 0 }
                    }}
                  />
                </Box>

                {/* Category Filter - Single selection using Radio buttons */}
                {availableCategories.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                      Danh mục
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Chọn danh mục</InputLabel>
                      <Select
                        value={filters.category.length > 0 ? filters.category[0] : ''}
                        onChange={(e) => handleFilterChange('category', e.target.value ? [e.target.value] : [])}
                        label="Chọn danh mục"
                      >
                        <MenuItem value="">Tất cả danh mục</MenuItem>
                        {availableCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </>
                )}

                {/* Specialties Filter - Using static data from frontend */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Chuyên môn
                </Typography>
                <FormGroup sx={{ mb: 2, maxHeight: 120, overflowY: 'auto' }}>
                  {specialties.map((specialty) => (
                    <FormControlLabel
                      key={specialty}
                      control={
                        <Checkbox
                          checked={filters.specialties.includes(specialty)}
                          onChange={(e) => handleFilterChange('specialties', specialty, e.target.checked)}
                          size="small"
                        />
                      }
                      label={specialty}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </FormGroup>

                {/* Tags Filter - Using static data from frontend */}
                <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '14px', color: '#333', mb: 1 }}>
                  Thẻ đặc biệt
                </Typography>
                <FormGroup sx={{ mb: 2, maxHeight: 120, overflowY: 'auto' }}>
                  {staticTags.map((tag) => (
                    <FormControlLabel
                      key={tag}
                      control={
                        <Checkbox
                          checked={filters.tags.includes(tag)}
                          onChange={(e) => handleFilterChange('tags', tag, e.target.checked)}
                          size="small"
                        />
                      }
                      label={tag}
                      sx={{ '& .MuiFormControlLabel-label': { fontSize: '14px' } }}
                    />
                  ))}
                </FormGroup>

              </AccordionDetails>
            </Accordion>

            {/* Clear Filters Button */}
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
              Xóa tất cả bộ lọc
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

            {/* Cosplayers Grid */}
            <Grid container spacing={3} justifyContent="center">
              {loading ? (
                // Loading skeletons
                Array.from(new Array(6)).map((_, index) => (
                  <Grid size="auto" key={index}>
                    <CosplayerSkeleton />
                  </Grid>
                ))
              ) : cosplayers.length > 0 ? (
                cosplayers.map((cosplayer) => (
                  <Grid size="auto" key={cosplayer.id}>
                    <CosplayerCard
                      cosplayer={cosplayer}
                      currentUser={user}  // Pass the current user properly
                      isFavorite={favorites.has(cosplayer.id)}
                      onFavorite={handleFavorite}
                      onMessage={handleMessage}
                      onBooking={handleBooking}
                    />
                  </Grid>
                ))
              ) : (
                <Grid size={12}>
                  <Alert severity="info" sx={{ borderRadius: '12px' }}>
                    Không tìm thấy cosplayer nào phù hợp với tiêu chí tìm kiếm.
                  </Alert>
                </Grid>
              )}
            </Grid>

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
