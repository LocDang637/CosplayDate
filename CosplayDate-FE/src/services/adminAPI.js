import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const adminAPI = {
  // Get complete dashboard statistics
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/stats');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'Dashboard statistics retrieved successfully'
      };
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load dashboard statistics',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get user statistics only
  getUserStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/users/stats');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'User statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load user statistics',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get booking statistics only
  getBookingStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/bookings/stats');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'Booking statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load booking statistics',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get revenue statistics only
  getRevenueStats: async () => {
    try {
      const response = await api.get('/admin/dashboard/revenue/stats');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'Revenue statistics retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load revenue statistics',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get daily trends
  getDailyTrends: async (fromDate = null, toDate = null) => {
    try {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);
      
      const response = await api.get(`/admin/dashboard/trends/daily?${params}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'Daily trends retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load daily trends',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get system health
  getSystemHealth: async () => {
    try {
      const response = await api.get('/admin/dashboard/system/health');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'System health retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load system health',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};