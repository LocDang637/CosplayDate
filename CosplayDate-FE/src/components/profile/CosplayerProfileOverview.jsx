// src/components/profile/CosplayerProfileOverview.jsx - FIXED VERSION
import React from 'react';
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
  Divider
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
  Verified
} from '@mui/icons-material';

const CosplayerProfileOverview = ({ user, isOwnProfile }) => {
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
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  icon={<PhotoCamera sx={{ color: 'white', fontSize: 20 }} />}
                  title="Ảnh"
                  value={user?.stats?.totalPhotos || 0}
                  subtitle="Tổng số ảnh"
                  color="#FF9800"
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatCard
                  icon={<Videocam sx={{ color: 'white', fontSize: 20 }} />}
                  title="Video"
                  value={user?.stats?.totalVideos || 0}
                  subtitle="Tổng số video"
                  color="#9C27B0"
                />
              </Grid>
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
              Thông tin liên hệ
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

          {/* ✅ FIXED: Safe tags rendering */}
          {tags.length > 0 && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
              }}
            >
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
                      backgroundColor: 'rgba(233, 30, 99, 0.1)',
                      color: 'primary.main',
                      fontSize: '12px',
                    }}
                  />
                ))}
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default CosplayerProfileOverview;