// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5068/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return {
        success: true,
        data: response.data,
        message: 'Registration successful'
      };
    } catch (error) {
      console.error('Registration API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Verify email with OTP
  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify-email', verificationData);
      return {
        success: true,
        data: response.data,
        message: 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Email verification failed',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Resend verification code
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return {
        success: true,
        data: response.data,
        message: 'Verification code sent successfully'
      };
    } catch (error) {
      console.error('Resend verification API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to resend verification code',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Check email availability
  checkEmailAvailability: async (email) => {
    try {
      const response = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
      return {
        success: true,
        isAvailable: response.data.isAvailable,
        message: response.data.message
      };
    } catch (error) {
      console.error('Check email API error:', error);
      return {
        success: false,
        isAvailable: false,
        message: error.response?.data?.message || 'Failed to check email availability'
      };
    }
  },

  // Login user (if you want to add this later)
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return {
        success: true,
        data: response.data,
        message: 'Login successful'
      };
    } catch (error) {
      console.error('Login API error:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      errors: error.response.data?.errors || {}
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: null,
      errors: {}
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'An unexpected error occurred',
      status: null,
      errors: {}
    };
  }
};

export default api;