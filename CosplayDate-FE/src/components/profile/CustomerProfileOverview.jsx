import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemAvatar,
  Button
} from '@mui/material';
import {
  Event,
  Star,
  TrendingUp,
  LocalOffer,
  Person,
  PersonAdd,
  Visibility,
  AccountBalanceWallet,
  Schedule,
  CheckCircle,
  EmojiEvents,
  CalendarMonth,
} from '@mui/icons-material';

const CustomerProfileOverview = ({ 
  user, 
  stats: propStats, // Keep prop stats as propStats to avoid conflict
  recentActivity, 
  favoriteCategories
}) => {
  if (!user) return null;

  // Extract data from API response
  const customer = user;
  
  // Get wallet balance from API data
  const walletBalance = customer.walletBalance || 0;
  
  // Get loyalty points from API data  
  const loyaltyPoints = customer.loyaltyPoints || 0;
  
  // Get membership tier from API data
  const membershipTier = customer.membershipTier || 'Bronze';
  
  // Get profile completeness from API data
  const profileCompleteness = customer.profileCompleteness || 0;
  
  // Get stats from API data (prioritize API stats over prop stats)
  const stats = customer.stats || propStats || {};
  
  // Get verification status from API data
  const isVerified = customer.isVerified || false;
  
  // Get member since date from API data
  const memberSince = stats.memberSince || customer.createdAt;
  const StatCard = ({ icon, label, value, color = 'primary', trend, trendValue }) => (
    <Card
      sx={{
        height: '100%',
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
        border: '1px solid rgba(233, 30, 99, 0.1)',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(233, 30, 99, 0.15)',
        },
      }}
    >
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: `linear-gradient(45deg, ${color === 'primary' ? '#E91E63, #9C27B0' : color === 'success' ? '#4CAF50, #2196F3' : '#FF9800, #F44336'})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          {React.cloneElement(icon, { sx: { color: 'white', fontSize: 28 } })}
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
          {value}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 1 }}>
          {label}
        </Typography>
        {trend && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            <TrendingUp sx={{ fontSize: 14, color: trend === 'up' ? '#4CAF50' : '#F44336' }} />
            <Typography variant="caption" sx={{ color: trend === 'up' ? '#4CAF50' : '#F44336' }}>
              {trendValue}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  const CategoryBar = ({ category, bookings, total, color = '#E91E63' }) => (
    <Box sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {category}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {bookings} bookings
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={(bookings / total) * 100}
        sx={{
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(233, 30, 99, 0.1)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
            borderRadius: 4,
          },
        }}
      />
    </Box>
  );

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getTierColor = (tier) => {
    switch (tier) {
      case 'Bronze': return '#CD7F32';
      case 'Silver': return '#C0C0C0';
      case 'Gold': return '#FFD700';
      case 'Platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const membershipProgress = {
    Bronze: { current: 1250, next: 2500, nextTier: 'Silver' },
    Silver: { current: 3750, next: 5000, nextTier: 'Gold' },
    Gold: { current: 7500, next: 10000, nextTier: 'Platinum' },
    Platinum: { current: 15000, next: 15000, nextTier: 'Platinum Max' }
  };

  const currentProgress = membershipProgress[membershipTier];

  return (
    <Box>
      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Event />}
            label="Sự kiện tham gia"
            value={stats?.eventsAttended || 0}
            trend="up"
            trendValue="+12%"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<AccountBalanceWallet />}
            label="Số dư ví"
            value={formatCurrency(walletBalance)}
            color="success"
            trend="up"
            trendValue="+8%"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<PersonAdd />}
            label="Đang theo dõi"
            value={stats?.totalFollowing || 0}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            icon={<Visibility />}
            label="Lượt xem hồ sơ"
            value={stats?.profileViews || 0}
            color="success"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* About Section */}
        <Grid item xs={12} md={8}>
          {/* Customer Bio */}
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
              Về {customer.firstName}
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.6, mb: 3 }}>
              {customer.bio || "Một người đam mê cosplay, yêu thích kết nối với các cosplayer tài năng và trải nghiệm những màn hóa thân tuyệt vời. Luôn tìm kiếm những trải nghiệm cosplay mới và sáng tạo!"}
            </Typography>

            {/* User Info */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                Thông tin cá nhân
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {customer.location && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Person sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Đến từ: {customer.location}
                    </Typography>
                  </Box>
                )}
                {memberSince && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Thành viên từ: {new Date(memberSince).toLocaleDateString('vi-VN')}
                    </Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Star sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Hạng thành viên: {membershipTier}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Favorite Categories */}
            {favoriteCategories && favoriteCategories.length > 0 && (
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                  Booking Preferences
                </Typography>
                {favoriteCategories.map((category, index) => (
                  <CategoryBar
                    key={index}
                    category={category.name}
                    bookings={category.bookings}
                    total={stats?.totalBookings || 1}
                    color={category.color || '#E91E63'}
                  />
                ))}
              </Box>
            )}
          </Paper>

          {/* Recent Activity */}
          {recentActivity && recentActivity.length > 0 && (
            <Paper
              sx={{
                borderRadius: '16px',
                p: 3,
                background: 'rgba(255,255,255,0.95)',
                border: '1px solid rgba(233, 30, 99, 0.1)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
                Recent Activity
              </Typography>
              <List sx={{ p: 0 }}>
                {recentActivity.map((activity, index) => (
                  <React.Fragment key={index}>
                    <ListItem sx={{ px: 0, py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar
                          sx={{
                            backgroundColor: 'primary.main',
                            width: 40,
                            height: 40,
                          }}
                        >
                          {activity.icon}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={activity.title}
                        secondary={activity.description}
                        primaryTypographyProps={{
                          fontWeight: 600,
                          fontSize: '14px',
                        }}
                        secondaryTypographyProps={{
                          fontSize: '12px',
                          color: 'text.secondary',
                        }}
                      />
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {activity.time}
                      </Typography>
                    </ListItem>
                    {index < recentActivity.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Wallet Summary */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              mb: 3,
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Tóm tắt ví
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AccountBalanceWallet sx={{ color: '#4CAF50', mr: 1 }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#4CAF50' }}>
                {formatCurrency(walletBalance)}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Số dư khả dụng
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <LocalOffer sx={{ color: '#9C27B0', mr: 1, fontSize: 20 }} />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {loyaltyPoints.toLocaleString()} Điểm
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12px' }}>
              ≈ {formatCurrency(loyaltyPoints * 10)} giá trị
            </Typography>
          </Paper>

          {/* Membership Status */}
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
              Trạng thái thành viên
            </Typography>
            
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: `linear-gradient(45deg, ${getTierColor(membershipTier)}, ${getTierColor(membershipTier)}AA)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <EmojiEvents sx={{ color: 'white', fontSize: 36 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: getTierColor(membershipTier) }}>
                Thành viên {membershipTier}
              </Typography>
            </Box>

            {membershipTier !== 'Platinum' && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Progress to {currentProgress.nextTier}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {currentProgress.current}/{currentProgress.next}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={(currentProgress.current / currentProgress.next) * 100}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(233, 30, 99, 0.1)',
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: getTierColor(membershipTier),
                      borderRadius: 4,
                    },
                  }}
                />
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1, fontSize: '12px' }}>
                  {currentProgress.next - currentProgress.current} points to next tier
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Quick Stats */}
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
              Quick Stats
            </Typography>
            <List sx={{ p: 0 }}>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Schedule sx={{ color: 'primary.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Avg. Response Time"
                  secondary={user.avgResponseTime || "< 30 minutes"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircle sx={{ color: 'success.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Completion Rate"
                  secondary={user.completionRate || "98%"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CalendarMonth sx={{ color: 'info.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Member Since"
                  secondary={user.memberSince || "January 2023"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Star sx={{ color: 'warning.main' }} />
                </ListItemIcon>
                <ListItemText
                  primary="Avg. Rating Given"
                  secondary={user.avgRatingGiven || "4.7/5"}
                  primaryTypographyProps={{ fontSize: '14px', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '12px' }}
                />
              </ListItem>
            </List>
          </Paper>

          {/* Achievements */}
          <Paper
            sx={{
              borderRadius: '16px',
              p: 3,
              background: 'rgba(255,255,255,0.95)',
              border: '1px solid rgba(233, 30, 99, 0.1)',
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'text.primary' }}>
              Recent Achievements
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Achievement badges */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: 'rgba(76, 175, 80, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(76, 175, 80, 0.2)',
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#4CAF50',
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  🏆
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    Loyal Customer
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                    Completed 10+ bookings
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: 'rgba(255, 193, 7, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 193, 7, 0.2)',
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#FFC107',
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  ⭐
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    Review Master
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                    Left 5+ detailed reviews
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  backgroundColor: 'rgba(233, 30, 99, 0.1)',
                  borderRadius: '12px',
                  border: '1px solid rgba(233, 30, 99, 0.2)',
                }}
              >
                <Avatar
                  sx={{
                    backgroundColor: '#E91E63',
                    width: 40,
                    height: 40,
                    mr: 2,
                  }}
                >
                  💝
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px' }}>
                    Generous Tipper
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '11px' }}>
                    Consistently rates 5 stars
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                borderColor: 'primary.main',
                color: 'primary.main',
                borderRadius: '12px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(233, 30, 99, 0.05)',
                },
              }}
            >
              View All Achievements
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CustomerProfileOverview;