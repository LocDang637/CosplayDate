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
  Alert,
  CircularProgress,
  Chip,
  Tooltip,
  Fade
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  AttachMoney,
  Schedule,
  Description,
  Close,
  CheckCircle
} from '@mui/icons-material';
import { cosplayerAPI } from '../../services/cosplayerAPI';

const CosplayerServices = ({ cosplayerId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDescription: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

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
      serviceName: '',
      serviceDescription: ''
    });
    setFormErrors({});
    setEditDialog(true);
  };

  const handleEditService = (service) => {
    setSelectedService(service);
    setFormData({
      serviceName: service.serviceName,
      serviceDescription: service.serviceDescription
    });
    setFormErrors({});
    setEditDialog(true);
  };

  const handleDeleteService = async (serviceId) => {
    try {
      const result = await cosplayerAPI.deleteService(serviceId);

      if (result.success) {
        setServices(services.filter(s => s.id !== serviceId));
        setDeleteConfirm(null);
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

    if (!formData.serviceName.trim()) {
      errors.serviceName = 'Tên dịch vụ là bắt buộc';
    }

    if (!formData.serviceDescription.trim()) {
      errors.serviceDescription = 'Mô tả là bắt buộc';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);

    try {
      // FIXED: Use correct field names for API
      const serviceData = {
        serviceName: formData.serviceName.trim(),
        serviceDescription: formData.serviceDescription.trim()
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
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper
        sx={{
          borderRadius: '16px',
          p: 3,
          mb: 3,
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Dịch vụ ({services.length})
          </Typography>


          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddService}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
              py: 1,
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #D81B60, #8E24AA)',
                boxShadow: '0 6px 16px rgba(233, 30, 99, 0.4)',
              }
            }}
          >
            Thêm dịch vụ
          </Button>

        </Box>

        {services.length > 0 ? (
          <Grid container spacing={3}>
            {services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.id}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: '16px',
                    border: '1px solid rgba(233, 30, 99, 0.1)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'visible',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 28px rgba(233, 30, 99, 0.15)',
                      borderColor: 'rgba(233, 30, 99, 0.3)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          fontSize: '18px',
                          color: '#333',
                          lineHeight: 1.3,
                          pr: 1
                        }}
                      >
                        {service.serviceName}
                      </Typography>


                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Tooltip title="Chỉnh sửa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => handleEditService(service)}
                            sx={{
                              color: '#9C27B0',
                              '&:hover': { backgroundColor: 'rgba(156, 39, 176, 0.08)' }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa" arrow>
                          <IconButton
                            size="small"
                            onClick={() => setDeleteConfirm(service.id)}
                            sx={{
                              color: 'error.main',
                              '&:hover': { backgroundColor: 'rgba(244, 67, 54, 0.08)' }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>

                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: 'text.secondary',
                        mb: 2,
                        lineHeight: 1.5,
                        minHeight: '3em',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {service.serviceDescription}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 3,
              backgroundColor: 'rgba(0,0,0,0.02)',
              borderRadius: '12px',
              border: '2px dashed rgba(0,0,0,0.1)'
            }}
          >
            <Description sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>
              Chưa có dịch vụ nào
            </Typography>

            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Nhấn "Thêm dịch vụ" để tạo dịch vụ đầu tiên của bạn
            </Typography>

          </Box>
        )}
      </Paper>

      {/* Edit/Add Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ mới'}
          </Typography>
          <IconButton onClick={() => setEditDialog(false)} size="small">
            <Close />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ py: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="Tên dịch vụ"
              value={formData.serviceName}
              onChange={handleInputChange('serviceName')}
              error={!!formErrors.serviceName}
              helperText={formErrors.serviceName}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#E91E63',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E91E63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#E91E63',
                }
              }}
            />

            <TextField
              fullWidth
              label="Mô tả dịch vụ"
              value={formData.serviceDescription}
              onChange={handleInputChange('serviceDescription')}
              error={!!formErrors.serviceDescription}
              helperText={formErrors.serviceDescription}
              multiline
              rows={4}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: '#E91E63',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#E91E63',
                  },
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: '#E91E63',
                }
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, gap: 2 }}>
          <Button
            onClick={() => setEditDialog(false)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3,
              borderColor: 'rgba(0,0,0,0.23)',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'rgba(0,0,0,0.4)',
                backgroundColor: 'rgba(0,0,0,0.04)'
              }
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitLoading}
            sx={{
              background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
              borderRadius: '12px',
              textTransform: 'none',
              px: 4,
              boxShadow: '0 4px 12px rgba(233, 30, 99, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #D81B60, #8E24AA)',
                boxShadow: '0 6px 16px rgba(233, 30, 99, 0.4)',
              },
              '&:disabled': {
                background: 'rgba(0,0,0,0.12)'
              }
            }}
          >
            {submitLoading ? (
              <CircularProgress size={24} sx={{ color: 'white' }} />
            ) : (
              selectedService ? 'Cập nhật' : 'Thêm mới'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        maxWidth="xs"
        TransitionComponent={Fade}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogContent sx={{ p: 3, textAlign: 'center' }}>
          <Delete sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1 }}>
            Xác nhận xóa dịch vụ
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Bạn có chắc chắn muốn xóa dịch vụ này không?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0, gap: 2, justifyContent: 'center' }}>
          <Button
            onClick={() => setDeleteConfirm(null)}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={() => handleDeleteService(deleteConfirm)}
            variant="contained"
            color="error"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              px: 3
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CosplayerServices;