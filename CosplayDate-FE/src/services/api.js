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

  // Enhanced login with three cases handling
  login: async (credentials) => {
    try {
      console.log('🔄 Making login API call...');
      const response = await api.post('/auth/login', credentials);
      
      console.log('📥 API Response:', {
        status: response.status,
        isSuccess: response.data?.isSuccess,
        message: response.data?.message,
        hasData: !!response.data?.data,
        hasToken: !!response.data?.data?.token,
        errors: response.data?.errors
      });
      
      // Case 1: Login successful and verified (isSuccess: true with token)
      if (response.data.isSuccess === true && response.data.data?.token) {
        const userData = response.data.data;
        const token = response.data.data.token;
        
        console.log('✅ Case 1: Login successful and verified');
        
        // Store token and user data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        
        return {
          success: true,
          data: {
            user: userData,
            token: token,
            isVerified: true
          },
          message: response.data.message || 'Login successful'
        };
      }
      
      // Case 2: Login credentials correct but not verified (isSuccess: false with specific message)
      else if (response.data.isSuccess === false && 
               response.data.message === "Account is not verified" &&
               response.data.errors?.includes("A new verification code has been sent to your email")) {
        
        console.log('⚠️ Case 2: Account not verified, OTP resent');
        
        // Extract user info from the login attempt (we'll need to get this from the credentials)
        const userData = {
          email: credentials.email,
          // We don't have full user data in this case, but we have the email
        };
        
        return {
          success: true,
          data: {
            user: userData,
            token: null,
            isVerified: false
          },
          message: 'Email verification required. OTP has been resent to your email.'
        };
      }
      
      // Case 3: Login failed (invalid credentials or other errors)
      else {
        console.log('❌ Case 3: Login failed -', response.data.message);
        
        return {
          success: false,
          message: response.data.message || 'Login failed',
          errors: response.data.errors || {}
        };
      }
      
    } catch (error) {
      console.error('🚨 Login API error:', error);
      
      // Handle different types of API errors
      if (error.response) {
        const { status, data } = error.response;
        
        console.log('📊 Error response details:', {
          status,
          message: data?.message,
          errors: data?.errors,
          isSuccess: data?.isSuccess
        });
        
        // Handle Case 2 when it comes as an error response
        if (data?.isSuccess === false && 
            data?.message === "Account is not verified" &&
            data?.errors?.includes("A new verification code has been sent to your email")) {
          
          console.log('⚠️ Case 2 (via error): Account not verified, OTP resent');
          
          const userData = {
            email: credentials.email,
          };
          
          return {
            success: true,
            data: {
              user: userData,
              token: null,
              isVerified: false
            },
            message: 'Email verification required. OTP has been resent to your email.'
          };
        }
        
        switch (status) {
          case 400:
            // Bad request - often invalid credentials
            const errorMessage = data?.message || '';
            if (errorMessage.toLowerCase().includes('password')) {
              return {
                success: false,
                message: 'Mật khẩu không đúng',
                errors: { password: 'Mật khẩu không đúng' }
              };
            } else if (errorMessage.toLowerCase().includes('email')) {
              return {
                success: false,
                message: 'Email không tồn tại',
                errors: { email: 'Email không tồn tại trong hệ thống' }
              };
            } else {
              return {
                success: false,
                message: data?.message || 'Email hoặc mật khẩu không đúng',
                errors: data?.errors || {}
              };
            }
            
          case 401:
            // Unauthorized - invalid credentials
            return {
              success: false,
              message: 'Email hoặc mật khẩu không đúng',
              errors: {}
            };
            
          case 404:
            // User not found
            return {
              success: false,
              message: 'Không tìm thấy tài khoản với email này',
              errors: { email: 'Email không tồn tại trong hệ thống' }
            };
            
          case 429:
            // Too many requests
            return {
              success: false,
              message: 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau.',
              errors: {}
            };
            
          case 500:
            // Server error
            return {
              success: false,
              message: 'Lỗi máy chủ. Vui lòng thử lại sau.',
              errors: {}
            };
            
          default:
            return {
              success: false,
              message: data?.message || 'Đăng nhập thất bại',
              errors: data?.errors || {}
            };
        }
      } else if (error.request) {
        // Network error
        console.error('🌐 Network error:', error.request);
        return {
          success: false,
          message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.',
          errors: {}
        };
      } else {
        // Other error
        console.error('❓ Other error:', error.message);
        return {
          success: false,
          message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
          errors: {}
        };
      }
    }
  },

  // Verify email with OTP
  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify-email', verificationData);
      
      // Store token and updated user data after successful verification
      if (response.data.isSuccess && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        
        // Update user data with verified status
        if (response.data.data.user) {
          const updatedUser = { ...response.data.data.user, isVerified: true };
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }
      }
      
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'Email verified successfully'
      };
    } catch (error) {
      console.error('Email verification API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || 'Mã xác thực không hợp lệ',
              errors: data?.errors || {}
            };
            
          case 404:
            return {
              success: false,
              message: 'Không tìm thấy mã xác thực. Vui lòng yêu cầu mã mới.',
              errors: {}
            };
            
          case 410:
            return {
              success: false,
              message: 'Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.',
              errors: {}
            };
            
          default:
            return {
              success: false,
              message: data?.message || 'Xác thực email thất bại',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Lỗi kết nối. Vui lòng thử lại.',
        errors: {}
      };
    }
  },

  // Resend verification code
  resendVerification: async (email) => {
    try {
      const response = await api.post('/auth/resend-verification', { email });
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || 'Verification code sent successfully'
      };
    } catch (error) {
      console.error('Resend verification API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 404:
            return {
              success: false,
              message: 'Không tìm thấy tài khoản với email này',
              errors: {}
            };
            
          case 409:
            return {
              success: false,
              message: 'Tài khoản đã được xác thực',
              errors: {}
            };
            
          case 429:
            return {
              success: false,
              message: 'Vui lòng đợi trước khi yêu cầu mã mới',
              errors: {}
            };
            
          default:
            return {
              success: false,
              message: data?.message || 'Không thể gửi mã xác thực',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Lỗi kết nối. Vui lòng thử lại.',
        errors: {}
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

  // Logout user (clear local storage and optionally call logout endpoint)
  logout: async () => {
    try {
      // Call logout endpoint if it exists (optional)
      await api.post('/auth/logout');
    } catch (error) {
      console.warn('Logout API call failed:', error);
      // Continue with local logout even if API call fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Refresh token (if you implement refresh token logic)
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response.data.isSuccess && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        
        if (response.data.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.data.refreshToken);
        }
        
        return {
          success: true,
          data: response.data.data,
          message: 'Token refreshed successfully'
        };
      }
      
      throw new Error('Invalid refresh response');
      
    } catch (error) {
      console.error('Token refresh error:', error);
      
      // Clear tokens and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        success: false,
        message: 'Session expired. Please login again.',
        errors: {}
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

// User utility functions
export const userUtils = {
  getCurrentUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  
  getCurrentToken: () => {
    return localStorage.getItem('token');
  },
  
  isAuthenticated: () => {
    return !!(localStorage.getItem('token') && localStorage.getItem('user'));
  },
  
  getUserRole: () => {
    const user = userUtils.getCurrentUser();
    return user?.userType || user?.role || null;
  },
  
  isCustomer: () => {
    const role = userUtils.getUserRole();
    return role === 'Customer';
  },
  
  isCosplayer: () => {
    const role = userUtils.getUserRole();
    return role === 'Cosplayer';
  },
  
  clearUserData: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refreshToken');
  }
};

export default api;