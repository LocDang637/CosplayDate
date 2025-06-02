// src/components/cosplayer/CosplayerServices.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  Schedule,
  Description,
  Close
} from '@mui/icons-material';
import { cosplayerAPI } from '../../services/cosplayerAPI';

const CosplayerServices = ({ cosplayerId, isOwnProfile = false }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    category: '',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  const serviceCategories = [
    { value: 'photoshoot', label: 'Chụp ảnh' },
    { value: 'event', label: 'Tham dự sự kiện' },
    { value: 'meetup', label: 'Gặp gỡ' },
    { value: 'convention', label: 'Convention' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ];

  useEffect(() => {
    if (cosplayerId) {
      loadServices();
    }
  }, [cosplayerId]);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await cosplayerAPI.getServices(cosplayerId);
      
      if (result.success) {
        setServices(result.data || []);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể tải danh sách dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      duration: '',
      category: '',
      isActive: true
    });
    setFormErrors({});
    setEditDialog(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      isActive: service.isActive
    });
    setFormErrors({});
    setEditDialog(true);
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) return;

    try {
      const result = await cosplayerAPI.deleteService(serviceId);
      
      if (result.success) {
        setServices(services.filter(s => s.id !== serviceId));
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Không thể xóa dịch vụ');
    }
  };

  const handleInputChange = (field) => (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Tên dịch vụ là bắt buộc';
    }
    
    if (!formData.description.trim()) {
      errors.description = 'Mô tả là bắt buộc';
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = 'Giá phải lớn hơn 0';
    }
    
    if (!formData.duration || parseInt(formData.duration) <= 0) {
      errors.duration = 'Thời gian phải lớn hơn 0';
    }
    
    if (!formData.category) {
      errors.category = 'Vui lòng chọn danh mục';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);
    
    try {
      const serviceData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
        category: formData.category,
        isActive: formData.isActive
      };

      let result;
      if (selectedService) {
        result = await cosplayerAPI.updateService(selectedService.id, serviceData);
      } else {
        result = await cosplayerAPI.addService(serviceData);
      }

      if (result.success) {
        if (selectedService) {
          setServices(services.map(s => s.id === selectedService.id ? result.data : s));
        } else {
          setServices([...services, result.data]);
        }
        setEditDialog(false);
      } else {
        if (result.errors && Object.keys(result.errors).length > 0) {
          setFormErrors(result.errors);
        } else {
          setError(result.message);
        }
      }
    } catch (err) {
      setError('Không thể lưu dịch vụ');
    } finally {
      setSubmitLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
  };

  const getCategoryLabel = (category) => {
    const cat = serviceCategories.find(c => c.value === category);
    return cat ? cat.label : category;
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <CircularProgress />
        <Typography variant="body2" sx={{ mt: 2 }}>
          Đang tải dịch vụ...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: '16px',
          p: 3,
          mb: 3,
          background: 'rgba(255,255,255,0.95)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Dịch vụ ({services.length})
          </Typography>
          
          {isOwnProfile && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAddService}
              sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
              }}
            >
              Thêm dịch vụ
            </Button>
          )}
        </Box>

        {services.length > 0 ? (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '12px',
                    border: '1px solid rgba(233, 30, 99, 0.1)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '16px' }}>
                        {service.name}
                      </Typography>
                      
                      {isOwnProfile && (
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditService(service)}
                            sx={{ mr: 0.5 }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteService(service.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      )}
                    </Box>

                    <Chip
                      label={getCategoryLabel(service.category)}
                      size="small"
                      sx={{
                        backgroundColor: 'rgba(233, 30, 99, 0.1)',
                        color: 'primary.main',
                        mb: 2
                      }}
                    />

                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, lineHeight: 1.5 }}>
                      {service.description}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <AttachMoney sx={{ fontSize: 16, color: 'success.main' }} />
                      <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                        {formatPrice(service.price)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {service.duration} giờ
                      </Typography>
                    </Box>

                    {!service.isActive && (
                      <Chip
                        label="Không hoạt động"
                        size="small"
                        sx={{
                          backgroundColor: 'error.main',
                          color: 'white',
                          mt: 2
                        }}
                      />
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
              Chưa có dịch vụ nào
            </Typography>
            {isOwnProfile && (
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={handleAddService}
                sx={{
                  background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                  borderRadius: '12px',
                  textTransform: 'none',
                }}
              >
                Thêm dịch vụ đầu tiên
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {/* Add/Edit Service Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => !submitLoading && setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: '16px' }
        }}
      >
        <DialogTitle sx={{ pb: 1, pr: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Description sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
            </Typography>
          </Box>
          <IconButton
            onClick={() => setEditDialog(false)}
            disabled={submitLoading}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: 'text.secondary',
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên dịch vụ"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!formErrors.name}
                helperText={formErrors.name}
                disabled={submitLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={3}
                value={formData.description}
                onChange={handleInputChange('description')}
                error={!!formErrors.description}
                helperText={formErrors.description}
                disabled={submitLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Giá (VNĐ)"
                type="number"
                value={formData.price}
                onChange={handleInputChange('price')}
                error={!!formErrors.price}
                helperText={formErrors.price}
                disabled={submitLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Thời gian (giờ)"
                type="number"
                value={formData.duration}
                onChange={handleInputChange('duration')}
                error={!!formErrors.duration}
                helperText={formErrors.duration}
                disabled={submitLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                  }
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.category}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleInputChange('category')}
                  label="Danh mục"
                  disabled={submitLoading}
                  sx={{ borderRadius: '12px' }}
                >
                  {serviceCategories.map((category) => (
                    <MenuItem key={category.value} value={category.value}>
                      {category.label}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && (
                  <Typography variant="caption" sx={{ color: 'error.main', ml: 2, mt: 0.5 }}>
                    {formErrors.category}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={() => setEditDialog(false)}
            disabled={submitLoading}
            sx={{ 
              borderRadius: '12px',
              textTransform: 'none'
            }}
          >
            Hủy
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitLoading}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              borderRadius: '12px',
              px: 3,
              textTransform: 'none',
              position: 'relative',
              '&:hover': {
                background: 'linear-gradient(45deg, #AD1457, #7B1FA2)',
              },
            }}
          >
            {submitLoading && (
              <CircularProgress
                size={20}
                sx={{
                  color: 'white',
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  marginLeft: '-10px',
                  marginTop: '-10px',
                }}
              />
            )}
            <span style={{ opacity: submitLoading ? 0 : 1 }}>
              {submitLoading ? 'Đang lưu...' : selectedService ? 'Cập nhật' : 'Thêm dịch vụ'}
            </span>
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CosplayerServices;