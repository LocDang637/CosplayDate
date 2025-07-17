import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Paper,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  EventNote,
  AttachMoney,
  HealthAndSafety,
  Refresh,
  MoreVert,
  CheckCircle,
  Pending,
  Error as ErrorIcon,
  Groups,
  Payment,
  Security
} from '@mui/icons-material';
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  // Real API call using your admin analytics service
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Create axios instance for API calls
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('No authentication token found');
      }

      const api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      // Call your actual admin dashboard API endpoint
      // console.log('🔄 Fetching dashboard statistics...');
      const response = await api.get('/admin/dashboard/stats');

      // console.log('✅ Dashboard API Response:', {
        status: response.status,
        isSuccess: response.data?.isSuccess,
        hasData: !!response.data?.data
      });

      // Handle the response structure from your AdminAnalyticsService
      if (response.data?.isSuccess && response.data?.data) {
        const data = response.data.data;
        
        // Map your backend DTO structure to frontend state
        const dashboardData = {
          userStats: data.userStats || {},
          bookingStats: data.bookingStats || {},
          revenueStats: data.revenueStats || {},
          systemHealth: data.systemHealth || {},
          dailyTrends: data.dailyTrends || [],
          generatedAt: data.generatedAt
        };

        // console.log('✅ Dashboard data loaded:', {
          totalUsers: dashboardData.userStats.totalUsers,
          totalBookings: dashboardData.bookingStats.totalBookings,
          totalRevenue: dashboardData.revenueStats.totalRevenue,
          trendsCount: dashboardData.dailyTrends.length
        });

        setDashboardData(dashboardData);
      } else {
        throw new Error(response.data?.message || 'Invalid response format from dashboard API');
      }
    } catch (err) {
      console.error('❌ Dashboard data fetch error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });

      // Handle different types of errors
      if (err.response?.status === 401) {
        setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } else if (err.response?.status === 403) {
        setError('Bạn không có quyền truy cập dashboard admin.');
      } else if (err.response?.status === 500) {
        setError('Lỗi hệ thống. Vui lòng thử lại sau.');
      } else if (err.code === 'ECONNABORTED') {
        setError('Timeout: Không thể kết nối đến server.');
      } else {
        setError(err.response?.data?.message || err.message || 'Không thể tải dữ liệu dashboard');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const StatsCard = ({ title, value, subtitle, icon, trend, color = 'primary', loading = false }) => (
    <Card sx={{
      borderRadius: '16px',
      background: 'linear-gradient(145deg, #FFFFFF 0%, #FEFEFE 100%)',
      border: '1px solid rgba(233, 30, 99, 0.08)',
      boxShadow: '0 8px 24px rgba(233, 30, 99, 0.1)',
      height: '100%',
      transition: 'all 0.3s ease',
      '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 32px rgba(233, 30, 99, 0.15)',
      }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Avatar sx={{
            backgroundColor: `${color}.main`,
            color: 'white',
            width: 56,
            height: 56
          }}>
            {icon}
          </Avatar>
          {trend && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {trend > 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
              <Typography variant="body2" color={trend > 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                {Math.abs(trend)}%
              </Typography>
            </Box>
          )}
        </Box>
        
        <Typography variant="h4" fontWeight={700} color="text.primary" sx={{ mb: 1 }}>
          {loading ? <CircularProgress size={20} /> : value}
        </Typography>
        
        <Typography variant="h6" color="text.secondary" fontWeight={500} sx={{ mb: 1 }}>
          {title}
        </Typography>
        
        {subtitle && (
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  if (loading && !dashboardData) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            Đang tải dashboard...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5', p: 3 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ borderRadius: '12px' }}>
            {error}
            <Button onClick={handleRefresh} sx={{ ml: 2 }}>
              Thử lại
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  const { userStats, bookingStats, revenueStats, systemHealth, dailyTrends } = dashboardData || {};

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#FFE8F5' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, rgba(233, 30, 99, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
        py: 4,
        borderBottom: '1px solid rgba(233, 30, 99, 0.1)'
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="h3" fontWeight={700} sx={{
                background: 'linear-gradient(45deg, #E91E63, #9C27B0)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 1
              }}>
                Admin Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Quản lý và theo dõi hoạt động của CosplayDate
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={handleRefresh}
                disabled={refreshing}
                sx={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(233, 30, 99, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.05)' }
                }}
              >
                <Refresh sx={{ color: refreshing ? 'action.disabled' : 'primary.main' }} />
              </IconButton>
              
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(233, 30, 99, 0.2)',
                  '&:hover': { backgroundColor: 'rgba(233, 30, 99, 0.05)' }
                }}
              >
                <MoreVert sx={{ color: 'primary.main' }} />
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={() => setAnchorEl(null)}>Xuất báo cáo</MenuItem>
                <MenuItem onClick={() => setAnchorEl(null)}>Cài đặt</MenuItem>
              </Menu>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Overview Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Tổng người dùng"
              value={formatNumber(userStats?.totalUsers || 0)}
              subtitle={`+${userStats?.newUsersThisMonth || 0} trong tháng`}
              icon={<People />}
              trend={userStats?.userGrowthRate}
              color="primary"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Đặt lịch hoàn thành"
              value={formatNumber(bookingStats?.completedBookings || 0)}
              subtitle={`${bookingStats?.completionRate || 0}% tỷ lệ hoàn thành`}
              icon={<CheckCircle />}
              trend={bookingStats?.bookingGrowthRate}
              color="success"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Doanh thu tháng này"
              value={formatCurrency(revenueStats?.revenueThisMonth || 0)}
              subtitle={`${revenueStats?.revenueGrowthRate > 0 ? '+' : ''}${revenueStats?.revenueGrowthRate || 0}% so với tháng trước`}
              icon={<AttachMoney />}
              trend={revenueStats?.revenueGrowthRate}
              color="warning"
            />
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <StatsCard
              title="Tình trạng hệ thống"
              value={`${systemHealth?.systemUptime || 0}%`}
              subtitle="Thời gian hoạt động"
              icon={<HealthAndSafety />}
              color="info"
            />
          </Grid>
        </Grid>

        {/* Detailed Stats Tabs */}
        <Paper sx={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
          overflow: 'hidden'
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              borderBottom: '1px solid rgba(233, 30, 99, 0.1)',
              '& .MuiTab-root': {
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '16px'
              }
            }}
          >
            <Tab label="Tổng quan" />
            <Tab label="Người dùng" />
            <Tab label="Đặt lịch" />
            <Tab label="Doanh thu" />
            <Tab label="Hệ thống" />
          </Tabs>

          {/* Overview Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                {/* Revenue Trend Chart */}
                <Grid item xs={12} lg={8}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Xu hướng doanh thu ({dailyTrends?.length || 0} ngày)
                  </Typography>
                  {dailyTrends && dailyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={dailyTrends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
                          }}
                        />
                        <YAxis tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(value), 'Doanh thu']}
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('vi-VN');
                          }}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#E91E63" fill="rgba(233, 30, 99, 0.1)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Không có dữ liệu xu hướng doanh thu
                    </Typography>
                  )}
                </Grid>

                {/* User Type Distribution */}
                <Grid item xs={12} lg={4}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Phân bố người dùng
                  </Typography>
                  {userStats?.totalCustomers > 0 || userStats?.totalCosplayers > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Khách hàng', value: userStats.totalCustomers || 0, color: '#E91E63' },
                            { name: 'Cosplayer', value: userStats.totalCosplayers || 0, color: '#9C27B0' }
                          ]}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {[
                            { name: 'Khách hàng', value: userStats.totalCustomers || 0, color: '#E91E63' },
                            { name: 'Cosplayer', value: userStats.totalCosplayers || 0, color: '#9C27B0' }
                          ].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Không có dữ liệu phân bố người dùng
                    </Typography>
                  )}
                </Grid>

                {/* Daily Activity */}
                <Grid item xs={12}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Hoạt động hàng ngày (7 ngày gần nhất)
                  </Typography>
                  {dailyTrends && dailyTrends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyTrends.slice(-7)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="date"
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
                          }}
                        />
                        <YAxis />
                        <Tooltip 
                          labelFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('vi-VN');
                          }}
                        />
                        <Legend />
                        <Bar dataKey="newUsers" fill="#E91E63" name="Người dùng mới" />
                        <Bar dataKey="newBookings" fill="#9C27B0" name="Đặt lịch mới" />
                        <Bar dataKey="completedBookings" fill="#4CAF50" name="Hoàn thành" />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                      Không có dữ liệu hoạt động hàng ngày
                    </Typography>
                  )}
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Users Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Thống kê người dùng
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Tổng số người dùng</Typography>
                        <Chip label={formatNumber(userStats?.totalUsers || 0)} color="primary" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Khách hàng</Typography>
                        <Chip label={formatNumber(userStats?.totalCustomers || 0)} color="secondary" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Cosplayer</Typography>
                        <Chip label={formatNumber(userStats?.totalCosplayers || 0)} color="info" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Đã xác thực</Typography>
                        <Chip label={formatNumber(userStats?.verifiedUsers || 0)} color="success" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Đang online</Typography>
                        <Chip label={formatNumber(userStats?.onlineUsers || 0)} color="warning" />
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Tăng trưởng người dùng
                    </Typography>
                    {dailyTrends && dailyTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={dailyTrends.slice(-14)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date"
                            tickFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
                            }}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(value) => {
                              const date = new Date(value);
                              return date.toLocaleDateString('vi-VN');
                            }}
                          />
                          <Line type="monotone" dataKey="newUsers" stroke="#E91E63" strokeWidth={3} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        Không có dữ liệu tăng trưởng người dùng
                      </Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Bookings Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Trạng thái đặt lịch
                    </Typography>
                    {bookingStats && (bookingStats.completedBookings > 0 || bookingStats.confirmedBookings > 0 || bookingStats.pendingBookings > 0 || bookingStats.cancelledBookings > 0) ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Hoàn thành', value: bookingStats.completedBookings || 0, color: '#4CAF50' },
                              { name: 'Đã xác nhận', value: bookingStats.confirmedBookings || 0, color: '#2196F3' },
                              { name: 'Chờ xử lý', value: bookingStats.pendingBookings || 0, color: '#FF9800' },
                              { name: 'Đã hủy', value: bookingStats.cancelledBookings || 0, color: '#F44336' }
                            ]}
                            cx="50%"
                            cy="50%"
                            outerRadius={100}
                            dataKey="value"
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                          >
                            {[
                              { name: 'Hoàn thành', value: bookingStats.completedBookings || 0, color: '#4CAF50' },
                              { name: 'Đã xác nhận', value: bookingStats.confirmedBookings || 0, color: '#2196F3' },
                              { name: 'Chờ xử lý', value: bookingStats.pendingBookings || 0, color: '#FF9800' },
                              { name: 'Đã hủy', value: bookingStats.cancelledBookings || 0, color: '#F44336' }
                            ].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        Không có dữ liệu trạng thái đặt lịch
                      </Typography>
                    )}
                  </Card>
                </Grid>

                <Grid item xs={12} md={4}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Chỉ số đặt lịch
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">Tỷ lệ hoàn thành</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={bookingStats?.completionRate || 0}
                          sx={{ height: 8, borderRadius: 4, my: 1 }}
                        />
                        <Typography variant="body2" fontWeight={600}>{bookingStats?.completionRate || 0}%</Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">Tỷ lệ hủy</Typography>
                        <LinearProgress
                          variant="determinate"
                          value={bookingStats?.cancellationRate || 0}
                          color="error"
                          sx={{ height: 8, borderRadius: 4, my: 1 }}
                        />
                        <Typography variant="body2" fontWeight={600}>{bookingStats?.cancellationRate || 0}%</Typography>
                      </Box>

                      <Box>
                        <Typography variant="body2" color="text.secondary">Giá trị trung bình</Typography>
                        <Typography variant="h5" fontWeight={600} color="primary.main">
                          {formatCurrency(bookingStats?.averageBookingValue || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* Revenue Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Doanh thu theo thời gian
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Hôm nay</Typography>
                        <Typography fontWeight={600}>{formatCurrency(revenueStats?.revenueToday || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Tuần này</Typography>
                        <Typography fontWeight={600}>{formatCurrency(revenueStats?.revenueThisWeek || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography fontWeight={600}>{formatCurrency(revenueStats?.revenueThisMonth || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Tháng trước</Typography>
                        <Typography fontWeight={600}>{formatCurrency(revenueStats?.revenueLastMonth || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid', borderColor: 'divider', pt: 2 }}>
                        <Typography fontWeight={600}>Tổng doanh thu</Typography>
                        <Typography fontWeight={700} color="primary.main">
                          {formatCurrency(revenueStats?.totalRevenue || 0)}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} lg={6}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Thông tin khác
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Doanh thu chờ</Typography>
                        <Typography fontWeight={600}>{formatCurrency(revenueStats?.pendingRevenue || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Hoa hồng TB/đơn</Typography>
                        <Typography fontWeight={600}>{formatCurrency(revenueStats?.averageCommissionPerBooking || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Dự kiến tháng này</Typography>
                        <Typography fontWeight={600} color="success.main">
                          {formatCurrency(revenueStats?.projectedMonthlyRevenue || 0)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Tăng trưởng</Typography>
                        <Chip
                          label={`${revenueStats?.revenueGrowthRate > 0 ? '+' : ''}${revenueStats?.revenueGrowthRate || 0}%`}
                          color={revenueStats?.revenueGrowthRate > 0 ? 'success' : 'error'}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>

          {/* System Tab */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Tình trạng hệ thống
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Uptime hệ thống</Typography>
                        <Chip 
                          label={`${systemHealth?.systemUptime || 0}%`} 
                          color="success" 
                          icon={<CheckCircle />}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Escrow đang hoạt động</Typography>
                        <Typography fontWeight={600}>{formatNumber(systemHealth?.activeEscrows || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Tổng tiền Escrow</Typography>
                        <Typography fontWeight={600}>{formatCurrency(systemHealth?.totalEscrowAmount || 0)}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Thanh toán chờ xử lý</Typography>
                        <Chip 
                          label={systemHealth?.pendingPayments || 0} 
                          color={(systemHealth?.pendingPayments || 0) > 20 ? 'warning' : 'info'}
                          icon={<Pending />}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Thanh toán thất bại</Typography>
                        <Chip 
                          label={systemHealth?.failedPayments || 0} 
                          color={(systemHealth?.failedPayments || 0) > 10 ? 'error' : 'default'}
                          icon={<ErrorIcon />}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Backup cuối cùng</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {systemHealth?.lastBackup ? new Date(systemHealth.lastBackup).toLocaleString('vi-VN') : 'Không có dữ liệu'}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Cảnh báo hệ thống
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {(systemHealth?.failedPayments || 0) > 5 && (
                        <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                          Có {systemHealth.failedPayments} thanh toán thất bại cần xem xét
                        </Alert>
                      )}
                      
                      {(systemHealth?.pendingPayments || 0) > 50 && (
                        <Alert severity="info" sx={{ borderRadius: '8px' }}>
                          Có {systemHealth.pendingPayments} thanh toán chờ xử lý
                        </Alert>
                      )}
                      
                      {(systemHealth?.systemUptime || 100) < 99.5 && (
                        <Alert severity="error" sx={{ borderRadius: '8px' }}>
                          Uptime hệ thống thấp: {systemHealth?.systemUptime || 0}%
                        </Alert>
                      )}

                      {(systemHealth?.activeEscrows || 0) > 100 && (
                        <Alert severity="warning" sx={{ borderRadius: '8px' }}>
                          Có {systemHealth.activeEscrows} giao dịch escrow đang hoạt động
                        </Alert>
                      )}

                      {/* Show success message if no issues */}
                      {(systemHealth?.failedPayments || 0) <= 5 && 
                       (systemHealth?.pendingPayments || 0) <= 50 && 
                       (systemHealth?.systemUptime || 100) >= 99.5 && (
                        <Alert severity="success" sx={{ borderRadius: '8px' }}>
                          Hệ thống đang hoạt động bình thường
                        </Alert>
                      )}
                    </Box>
                  </Card>
                </Grid>

                {/* System Metrics Chart */}
                <Grid item xs={12}>
                  <Card sx={{ borderRadius: '12px', p: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                      Hoạt động hệ thống (Dữ liệu từ API)
                    </Typography>
                    {dailyTrends && dailyTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={dailyTrends.slice(-7)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="newUsers" 
                            stroke="#E91E63" 
                            name="Người dùng mới"
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="newBookings" 
                            stroke="#9C27B0" 
                            name="Đặt lịch mới"
                            strokeWidth={2}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="completedBookings" 
                            stroke="#4CAF50" 
                            name="Hoàn thành"
                            strokeWidth={2}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                        Không có dữ liệu hoạt động hệ thống
                      </Typography>
                    )}
                  </Card>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </Paper>

        {/* Recent Activity Table */}
        <Paper sx={{
          borderRadius: '20px',
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(233, 30, 99, 0.1)',
          mt: 4,
          overflow: 'hidden'
        }}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              Hoạt động gần đây
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Loại</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mô tả</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Giá trị</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {/* Real recent activity data would come from an API endpoint */}
                  {/* For now showing placeholder until you create a recent activity endpoint */}
                  <TableRow>
                    <TableCell colSpan={6} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        Hoạt động gần đây sẽ hiển thị khi có dữ liệu từ API
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Cần tạo endpoint: GET /admin/dashboard/recent-activity
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        {/* Quick Actions */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Groups />}
              sx={{
                py: 2,
                borderRadius: '12px',
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'rgba(233, 30, 99, 0.05)',
                  borderColor: 'primary.main'
                }
              }}
            >
              Quản lý người dùng
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<EventNote />}
              sx={{
                py: 2,
                borderRadius: '12px',
                borderColor: 'secondary.main',
                color: 'secondary.main',
                '&:hover': {
                  backgroundColor: 'rgba(156, 39, 176, 0.05)',
                  borderColor: 'secondary.main'
                }
              }}
            >
              Quản lý đặt lịch
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Payment />}
              sx={{
                py: 2,
                borderRadius: '12px',
                borderColor: 'warning.main',
                color: 'warning.main',
                '&:hover': {
                  backgroundColor: 'rgba(255, 152, 0, 0.05)',
                  borderColor: 'warning.main'
                }
              }}
            >
              Quản lý thanh toán
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<Security />}
              sx={{
                py: 2,
                borderRadius: '12px',
                borderColor: 'info.main',
                color: 'info.main',
                '&:hover': {
                  backgroundColor: 'rgba(33, 150, 243, 0.05)',
                  borderColor: 'info.main'
                }
              }}
            >
              Cài đặt bảo mật
            </Button>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AdminDashboard;
