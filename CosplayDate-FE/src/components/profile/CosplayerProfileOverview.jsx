// src/components/profile/CosplayerProfileOverview.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Avatar,
  Rating,
  Chip,
  LinearProgress,
  Divider,
  CircularProgress,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tooltip,
  Fade
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Star,
  People,
  Event,
  AttachMoney,
  PhotoCamera,
  Videocam,
  Verified,
  AccessTime,
  Person,
  Category,
  LocationOn,
  Note,
  WorkspacePremium,
  Add,
  Edit,
  Delete,
  Description,
  Close,
  CheckCircle,
  Work
} from '@mui/icons-material';
import { bookingAPI } from '../../services/bookingAPI';
import { cosplayerAPI } from '../../services/cosplayerAPI';

const CosplayerProfileOverview = ({ user, currentProfile, isOwnProfile }) => {
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

  // Services state
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({
    serviceName: '',
    serviceDescription: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  console.log('upcomingBooking', upcomingBooking);
  console.log('loadingBooking', loadingBooking);

  useEffect(() => {
    const fetchUpcomingBooking = async () => {
      if (!isOwnProfile) {
        setLoadingBooking(false);
        return;
      }
      try {
        setLoadingBooking(true);
        const response = await bookingAPI.getUpcomingBookings();
        // Add console.log to debug
        console.log('API Response:', response);
        
        if (response.success && response.data?.bookings && response.data.bookings.length > 0) {
          // Filter for only "Confirmed" status bookings
          const confirmedBookings = response.data.bookings.filter(booking => 
            booking.status && booking.status.toLowerCase() === 'confirmed'
          );
          
          console.log('Confirmed bookings:', confirmedBookings);
          
          if (confirmedBookings.length > 0) {
            // Find the next upcoming booking by sorting by date and time
            const now = new Date();
            const upcomingBookings = confirmedBookings
              .map(booking => {
                // Create a proper datetime for comparison
                const bookingDateTime = new Date(`${booking.bookingDate}T${booking.startTime}`);
                return {
                  ...booking,
                  dateTime: bookingDateTime
                };
              })
              .filter(booking => booking.dateTime > now) // Only future bookings
              .sort((a, b) => a.dateTime - b.dateTime); // Sort by earliest first
            
            console.log('Future upcoming bookings:', upcomingBookings);
            
            if (upcomingBookings.length > 0) {
              setUpcomingBooking(upcomingBookings[0]); // Get the earliest upcoming booking
            } else {
              console.log('No future confirmed bookings found');
              setUpcomingBooking(null);
            }
          } else {
            console.log('No confirmed bookings found');
            setUpcomingBooking(null);
          }
        } else {
          console.log('No upcoming bookings found or API error');
          setUpcomingBooking(null);
        }
      } catch (error) {
        console.error('Failed to fetch upcoming booking:', error);
        setUpcomingBooking(null);
      } finally {
        setLoadingBooking(false);
      }
    };
    fetchUpcomingBooking();
  }, [isOwnProfile]);

  // Load services when user changes
  useEffect(() => {
    if (user?.id) {
      loadServices();
    }
  }, [user?.id]);

  const loadServices = async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);

      const result = await cosplayerAPI.getServices(user.id);

      if (result.success) {
        setServices(result.data || []);
      } else {
        setServicesError(result.message);
      }
    } catch (err) {
      setServicesError('Không thể tải danh sách dịch vụ');
    } finally {
      setServicesLoading(false);
    }
  };

  // Services handlers
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
        setServicesError(result.message);
      }
    } catch (err) {
      setServicesError('Không thể xóa dịch vụ');
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
          setServicesError(result.message);
        }
      }
    } catch (err) {
      setServicesError('Không thể lưu dịch vụ');
    } finally {
      setSubmitLoading(false);
    }
  };

  // ✅ FIXED: Safe price formatting
  const formatPrice = (price) => {
    if (!price || isNaN(price)) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN').format(price) + 'đ/giờ';
  };

  // ✅ FIXED: Safe date formatting
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch (error) {
      console.warn('⚠️ Invalid date format:', dateString);
      return 'N/A';
    }
  };

  // Format date and time for upcoming booking
  const formatBookingDateTime = (booking) => {
    if (!booking) return '';

    const bookingDate = new Date(booking.bookingDate);
    const formattedDate = bookingDate.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const formatTime = (timeString) => {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'CH' : 'SA';
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    };

    return {
      date: formattedDate,
      time: `${formatTime(booking.startTime)} - ${formatTime(booking.endTime)}`
    };
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'primary.main' }) => (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${color}, ${color}20)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {value || 0}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5, fontSize: '14px' }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const RecentReview = ({ review }) => (
    <Box sx={{ p: 2, borderRadius: '12px', backgroundColor: 'rgba(233, 30, 99, 0.02)', mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        <Avatar src={review.customerAvatarUrl} sx={{ width: 32, height: 32 }}>
          {review.customerName?.[0]?.toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '14px' }}>
            {review.customerName || 'Ẩn danh'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Rating value={review.rating || 0} size="small" readOnly />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {formatDate(review.createdAt)}
            </Typography>
          </Box>
        </Box>
        {review.isVerified && <Verified sx={{ color: 'success.main', fontSize: 16 }} />}
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px', lineHeight: 1.4 }}>
        {review.comment || 'Không có bình luận'}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          {/* Services Section */}
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
            {servicesError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setServicesError(null)}>
                {servicesError}
              </Alert>
            )}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                <Work sx={{ mr: 1, verticalAlign: 'middle' }} />
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
              )}
            </Box>

            {servicesLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
                <Typography variant="body2" sx={{ mt: 2 }}>
                  Đang tải dịch vụ...
                </Typography>
              </Box>
            ) : services.length > 0 ? (
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

                          {isOwnProfile && (
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
                          )}
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
                  {isOwnProfile ? 'Nhấn "Thêm dịch vụ" để tạo dịch vụ đầu tiên của bạn' : 'Cosplayer này chưa thêm dịch vụ nào'}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* ✅ FIXED: Safe reviews rendering */}
          {user?.recentReviews && Array.isArray(user.recentReviews) && user.recentReviews.length > 0 && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Đánh giá gần đây
              </Typography>
              {user.recentReviews.slice(0, 3).map((review, index) => (
                <RecentReview key={review.id || index} review={review} />
              ))}
            </Paper>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          {/* Upcoming Booking Section */}
          {!loadingBooking && upcomingBooking && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                mb: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
                Lịch hẹn sắp tới
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Customer Name */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Person sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Khách hàng
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {upcomingBooking.customer.name}
                    </Typography>
                  </Box>
                </Box>

                {/* Service Name */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Category sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Dịch vụ
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {upcomingBooking.serviceType}
                    </Typography>
                  </Box>
                </Box>

                {/* Date and Time */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <AccessTime sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Ngày và giờ
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {formatBookingDateTime(upcomingBooking).date}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '13px' }}>
                      {formatBookingDateTime(upcomingBooking).time}
                    </Typography>
                  </Box>
                </Box>

                {/* Location */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <LocationOn sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Địa điểm
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {upcomingBooking.location}
                    </Typography>
                  </Box>
                </Box>

                {/* Special Note */}
                {upcomingBooking.specialNotes && (
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Note sx={{ color: 'text.secondary', fontSize: 20, mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Ghi chú đặc biệt
                      </Typography>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                        "{upcomingBooking.specialNotes}"
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          )}

          {/* Loading state for booking */}
          {loadingBooking && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                mb: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 200,
              }}
            >
              <CircularProgress size={40} />
            </Paper>
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
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Hiệu suất
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Thời gian phản hồi
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                  {user?.stats?.responseTime || user?.responseTime || '< 1 giờ'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <TrendingUp sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Thành viên từ {formatDate(user?.stats?.memberSince || user?.createdAt)}
              </Typography>
            </Box>

            {/* Membership Tier - Show for everyone */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <WorkspacePremium sx={{ 
                color: 
                  (user?.membershipTier || currentProfile?.membershipTier) === 'Gold' ? '#FFD700' :
                  (user?.membershipTier || currentProfile?.membershipTier) === 'Silver' ? '#C0C0C0' :
                  '#CD7F32', // Bronze
                fontSize: 20 
              }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Hạng thành viên: {user?.membershipTier || currentProfile?.membershipTier || 'Bronze'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Schedule sx={{ color: 'info.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Hoạt động thường xuyên
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <People sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.stats?.totalFollowers || user?.followersCount || 0} người theo dõi
              </Typography>
            </Box>
          </Paper>

          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: 'text.primary' }}>
              Thông tin dịch vụ
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Giá dịch vụ
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AttachMoney sx={{ color: 'success.main', fontSize: 18 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
                  {formatPrice(user?.pricePerHour)}
                </Typography>
              </Box>
            </Box>

            {user?.location && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                  Khu vực hoạt động
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {user.location}
                </Typography>
              </Box>
            )}

            <Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                Trạng thái
              </Typography>
              <Chip
                label={user?.isAvailable ? 'Sẵn sàng nhận đơn' : 'Chưa sẵn sàng'}
                sx={{
                  backgroundColor: user?.isAvailable ? '#4CAF50' : '#757575',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Edit/Add Service Dialog */}
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

export default CosplayerProfileOverview;