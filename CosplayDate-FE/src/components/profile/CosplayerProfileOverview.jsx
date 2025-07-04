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
  CircularProgress
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
  WorkspacePremium
} from '@mui/icons-material';
import { bookingAPI } from '../../services/bookingAPI';

const CosplayerProfileOverview = ({ user, currentProfile, isOwnProfile }) => {
  const [upcomingBooking, setUpcomingBooking] = useState(null);
  const [loadingBooking, setLoadingBooking] = useState(true);

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

  // ✅ FIXED: Safe tags processing function
  const getTags = () => {
    if (!user?.tags) return [];

    // If tags is already an array, return it
    if (Array.isArray(user.tags)) {
      return user.tags.filter(tag => tag && typeof tag === 'string' && tag.trim());
    }

    // If tags is a string, split it
    if (typeof user.tags === 'string') {
      return user.tags.split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
    }

    // For any other data type, return empty array
    console.warn('⚠️ Invalid tags format in Overview:', typeof user.tags, user.tags);
    return [];
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

  const tags = getTags();

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Giới thiệu
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
              {user?.bio || user?.description || "Chưa có thông tin giới thiệu."}
            </Typography>

            {user?.characterSpecialty && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                  Chuyên môn nhân vật
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {user.characterSpecialty}
                </Typography>
              </>
            )}
            {tags.length > 0 && (
              <Box>
                <Divider sx={{ my: 2.5 }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                    Tags
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {tags.map((tag, index) => (
                      <Chip
                        key={index}
                        label={tag}
                        size="small"
                        sx={{
                          backgroundColor: 'rgba(233, 30, 99, 0.08)',
                          color: 'primary.main',
                          fontSize: '0.75rem',
                          height: '26px',
                          fontWeight: 500,
                          border: '1px solid rgba(233, 30, 99, 0.15)',
                          '&:hover': {
                            backgroundColor: 'rgba(233, 30, 99, 0.12)',
                            borderColor: 'rgba(233, 30, 99, 0.25)',
                          }
                        }}
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
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
              Thống kê hoạt động
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  icon={<Event sx={{ color: 'white', fontSize: 20 }} />}
                  title="Đơn đặt"
                  value={user?.stats?.totalBookings || 0}
                  subtitle="Tổng số đơn"
                  color="#2196F3"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  icon={<Star sx={{ color: 'white', fontSize: 20 }} />}
                  title="Hoàn thành"
                  value={user?.stats?.completedBookings || 0}
                  subtitle="Đơn thành công"
                  color="#4CAF50"
                />
              </Grid>

              {/* Private Information - Only for own profile */}
              {isOwnProfile && currentProfile && (
                <>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                      icon={<AttachMoney sx={{ color: 'white', fontSize: 20 }} />}
                      title="Ví tiền"
                      value={new Intl.NumberFormat('vi-VN').format(currentProfile.walletBalance || 0)}
                      subtitle="VND"
                      color="#FF5722"
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <StatCard
                      icon={<TrendingUp sx={{ color: 'white', fontSize: 20 }} />}
                      title="Điểm thưởng"
                      value={currentProfile.loyaltyPoints || 0}
                      subtitle="Loyalty Points"
                      color="#3F51B5"
                    />
                  </Grid>
                </>
              )}
            </Grid>
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
                  Tỉ lệ thành công
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'success.main' }}>
                  {Math.round(user?.stats?.successRate || 0)}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(user?.stats?.successRate || 0, 100)}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(76, 175, 80, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    backgroundColor: '#4CAF50',
                  },
                }}
              />
            </Box>

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
                label={user?.isAvailable ? 'Sẵn sàng nhận đơn' : 'Tạm thời bận'}
                sx={{
                  backgroundColor: user?.isAvailable ? '#4CAF50' : '#FF9800',
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CosplayerProfileOverview;