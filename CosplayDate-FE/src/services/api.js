// src/services/api.js
import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints (existing code)
export const authAPI = {
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

  login: async (credentials) => {
    try {
      console.log('🔄 Making login API call...');
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.isSuccess === true && response.data.data?.token) {
        const userData = response.data.data;
        const token = response.data.data.token;
        
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
      
      else if (response.data.isSuccess === false && 
               response.data.message === "Account is not verified" &&
               response.data.errors?.includes("A new verification code has been sent to your email")) {
        
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
      
      else {
        return {
          success: false,
          message: response.data.message || 'Login failed',
          errors: response.data.errors || {}
        };
      }
      
    } catch (error) {
      console.error('🚨 Login API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        if (data?.isSuccess === false && 
            data?.message === "Account is not verified" &&
            data?.errors?.includes("A new verification code has been sent to your email")) {
          
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
            return {
              success: false,
              message: 'Email hoặc mật khẩu không đúng',
              errors: {}
            };
            
          case 404:
            return {
              success: false,
              message: 'Không tìm thấy tài khoản với email này',
              errors: { email: 'Email không tồn tại trong hệ thống' }
            };
            
          default:
            return {
              success: false,
              message: data?.message || 'Đăng nhập thất bại',
              errors: data?.errors || {}
            };
        }
      } else if (error.request) {
        return {
          success: false,
          message: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.',
          errors: {}
        };
      } else {
        return {
          success: false,
          message: 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.',
          errors: {}
        };
      }
    }
  },

  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post('/auth/verify-email', verificationData);
      
      if (response.data.isSuccess && response.data.data?.token) {
        localStorage.setItem('token', response.data.data.token);
        
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
  }
};

// NEW: User API endpoints
export const userAPI = {
  // Get current user profile
  getCurrentProfile: async () => {
    try {
      const response = await api.get('/users/profile');
      
      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Profile retrieved successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get profile',
          errors: response.data.errors || {}
        };
      }
    } catch (error) {
      console.error('Get current profile API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            return {
              success: false,
              message: 'Unauthorized. Please login again.',
              errors: {}
            };
          case 404:
            return {
              success: false,
              message: 'Profile not found',
              errors: {}
            };
          default:
            return {
              success: false,
              message: data?.message || 'Failed to get profile',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please try again.',
        errors: {}
      };
    }
  },

  // Get user profile by ID
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/users/profile/${userId}`);
      
      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Profile retrieved successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to get profile',
          errors: response.data.errors || {}
        };
      }
    } catch (error) {
      console.error('Get user profile API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 404:
            return {
              success: false,
              message: 'User not found',
              errors: {}
            };
          case 403:
            return {
              success: false,
              message: 'Access denied',
              errors: {}
            };
          default:
            return {
              success: false,
              message: data?.message || 'Failed to get profile',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please try again.',
        errors: {}
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/users/profile', profileData);
      
      if (response.data.isSuccess) {
        // Update local storage with new profile data
        const updatedUser = response.data.data;
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const mergedUser = { ...currentUser, ...updatedUser };
        localStorage.setItem('user', JSON.stringify(mergedUser));
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Profile updated successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to update profile',
          errors: response.data.errors || {}
        };
      }
    } catch (error) {
      console.error('Update profile API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            return {
              success: false,
              message: 'Invalid profile data',
              errors: data?.errors || {}
            };
          case 401:
            return {
              success: false,
              message: 'Unauthorized. Please login again.',
              errors: {}
            };
          default:
            return {
              success: false,
              message: data?.message || 'Failed to update profile',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please try again.',
        errors: {}
      };
    }
  },

  // Upload profile avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/users/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.isSuccess) {
        // Update local storage with new avatar URL
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { 
          ...currentUser, 
          avatarUrl: response.data.data.avatarUrl 
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Avatar uploaded successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to upload avatar',
          errors: response.data.errors || {}
        };
      }
    } catch (error) {
      console.error('Upload avatar API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || 'Invalid file format or size',
              errors: data?.errors || {}
            };
          case 401:
            return {
              success: false,
              message: 'Unauthorized. Please login again.',
              errors: {}
            };
          case 413:
            return {
              success: false,
              message: 'File too large. Maximum size is 5MB.',
              errors: {}
            };
          default:
            return {
              success: false,
              message: data?.message || 'Failed to upload avatar',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please try again.',
        errors: {}
      };
    }
  },

  // Delete profile avatar
  deleteAvatar: async () => {
    try {
      const response = await api.delete('/users/avatar');
      
      if (response.data.isSuccess) {
        // Update local storage to remove avatar URL
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, avatarUrl: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Avatar deleted successfully'
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to delete avatar',
          errors: response.data.errors || {}
        };
      }
    } catch (error) {
      console.error('Delete avatar API error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            return {
              success: false,
              message: 'Unauthorized. Please login again.',
              errors: {}
            };
          case 404:
            return {
              success: false,
              message: 'No avatar to delete',
              errors: {}
            };
          default:
            return {
              success: false,
              message: data?.message || 'Failed to delete avatar',
              errors: data?.errors || {}
            };
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please try again.',
        errors: {}
      };
    }
  }
};

// Existing utility functions
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