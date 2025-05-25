import React, { useState } from 'react';
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  InputAdornment,
  Button
} from '@mui/material';
import { Search } from '@mui/icons-material';

const CosplayerSearchFilters = ({ onSearch, onFiltersChange }) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    category: '',
    location: '',
    priceRange: ''
  });

  const categories = [
    { value: '', label: 'Tất cả thể loại' },
    { value: 'anime', label: 'Anime' },
    { value: 'game', label: 'Game' },
    { value: 'movie', label: 'Phim ảnh' },
    { value: 'original', label: 'Nhân vật gốc' },
    { value: 'historical', label: 'Lịch sử' }
  ];

  const locations = [
    { value: '', label: 'Tất cả khu vực' },
    { value: 'hanoi', label: 'Hà Nội' },
    { value: 'hcm', label: 'TP. Hồ Chí Minh' },
    { value: 'danang', label: 'Đà Nẵng' },
    { value: 'cantho', label: 'Cần Thơ' },
    { value: 'haiphong', label: 'Hải Phòng' }
  ];

  const priceRanges = [
    { value: '', label: 'Tất cả mức giá' },
    { value: '0-200000', label: 'Dưới 200.000đ' },
    { value: '200000-500000', label: '200.000 - 500.000đ' },
    { value: '500000-1000000', label: '500.000 - 1.000.000đ' },
    { value: '1000000+', label: 'Trên 1.000.000đ' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const handleSearch = () => {
    onSearch?.(filters);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      mb: 4, 
      flexWrap: 'wrap',
      alignItems: 'flex-end'
    }}>
      {/* Search Input */}
      <TextField
        placeholder="Tên Cosplayer"
        value={filters.searchTerm}
        onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
        sx={{
          flex: 1,
          minWidth: 250,
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            backgroundColor: 'white',
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

      {/* Category Filter */}
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Thể loại</InputLabel>
        <Select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          label="Thể loại"
          sx={{
            borderRadius: '12px',
            backgroundColor: 'white',
          }}
        >
          {categories.map((category) => (
            <MenuItem key={category.value} value={category.value}>
              {category.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Location Filter */}
      <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Khu vực</InputLabel>
        <Select
          value={filters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          label="Khu vực"
          sx={{
            borderRadius: '12px',
            backgroundColor: 'white',
          }}
        >
          {locations.map((location) => (
            <MenuItem key={location.value} value={location.value}>
              {location.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Price Filter */}
      <FormControl sx={{ minWidth: 140 }}>
        <InputLabel>Giá tiền</InputLabel>
        <Select
          value={filters.priceRange}
          onChange={(e) => handleFilterChange('priceRange', e.target.value)}
          label="Giá tiền"
          sx={{
            borderRadius: '12px',
            backgroundColor: 'white',
          }}
        >
          {priceRanges.map((range) => (
            <MenuItem key={range.value} value={range.value}>
              {range.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Search Button */}
      <Button
        variant="contained"
        onClick={handleSearch}
        sx={{
          background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
          color: 'white',
          px: 4,
          py: 1.5,
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
          minWidth: 100,
          '&:hover': {
            background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
          },
        }}
      >
        Tìm kiếm
      </Button>
    </Box>
  );
};

export default CosplayerSearchFilters;