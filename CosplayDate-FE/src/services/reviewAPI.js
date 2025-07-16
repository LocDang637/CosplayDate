// src/services/reviewAPI.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const createApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log(`📤 ${config.method.toUpperCase()} ${config.url}`, config.data || config.params);
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      console.log(`✅ Response from ${response.config.url}:`, response.data);
      return response;
    },
    (error) => {
      console.error(`❌ Error from ${error.config?.url}:`, error.response?.data);
      if (error.response?.status === 401) {
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath === '/' || 
                             currentPath.startsWith('/profile/') || 
                             currentPath.startsWith('/customer-profile/') ||
                             currentPath.startsWith('/cosplayer/') ||
                             currentPath.startsWith('/cosplayers') ||
                             currentPath.startsWith('/login') ||
                             currentPath.startsWith('/signup') ||
                             currentPath.startsWith('/forgot-password') ||
                             currentPath.startsWith('/reset-password');

        // Only auto-redirect to login for 401 errors if not on public routes
        if (!isPublicRoute) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createApiInstance();

export const reviewAPI = {
  // Create a new review
  createReview: async (reviewData) => {
    try {
      console.log('Creating review with data:', reviewData);
      
      const response = await api.post('/Review', reviewData);
      
      return {
        success: true,
        data: response.data,
        message: 'Review created successfully'
      };
    } catch (error) {
      console.error('Error creating review:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to create review',
        data: null
      };
    }
  },

  // Get all reviews from all cosplayers with pagination
  getAllReviews: async (page = 1, pageSize = 10) => {
    try {
      console.log(`Getting all reviews, page ${page}, pageSize ${pageSize}`);
      
      const response = await api.get('/Review/all', {
        params: {
          page,
          pageSize
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'All reviews retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting all reviews:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get all reviews',
        data: null
      };
    }
  },

  // Get reviews for a specific cosplayer with pagination
  getCosplayerReviews: async (cosplayerId, page = 1, pageSize = 10) => {
    try {
      console.log(`Getting reviews for cosplayer ${cosplayerId}, page ${page}, pageSize ${pageSize}`);
      
      const response = await api.get(`/Review/cosplayer/${cosplayerId}`, {
        params: {
          page,
          pageSize
        }
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Reviews retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting cosplayer reviews:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get reviews',
        data: null
      };
    }
  },

  // Get review for a specific booking
  getReviewByBookingId: async (bookingId) => {
    try {
      console.log(`Getting review for booking ${bookingId}`);
      
      const response = await api.get(`/Review/booking/${bookingId}`);
      
      // Extract the actual review data from the API response
      const apiResponse = response.data;
      
      return {
        success: apiResponse.isSuccess,
        data: apiResponse.data, // This is the actual review object
        message: apiResponse.message || 'Review retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting review by booking ID:', error);
      
      // If it's a 404 error, it means no review exists for this booking
      if (error.response?.status === 404) {
        return {
          success: false,
          error: 'No review found for this booking',
          data: null
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get review',
        data: null
      };
    }
  },

  // Get average rating for a specific cosplayer
  getCosplayerAverageRating: async (cosplayerId) => {
    try {
      console.log(`Getting average rating for cosplayer ${cosplayerId}`);
      
      const response = await api.get(`/Review/cosplayer/${cosplayerId}/average`);
      
      return {
        success: true,
        data: response.data,
        message: 'Average rating retrieved successfully'
      };
    } catch (error) {
      console.error('Error getting average rating:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get average rating',
        data: null
      };
    }
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    try {
      console.log(`Updating review ${reviewId} with data:`, reviewData);
      
      const response = await api.put(`/Review/${reviewId}`, reviewData);
      
      return {
        success: true,
        data: response.data,
        message: 'Review updated successfully'
      };
    } catch (error) {
      console.error('Error updating review:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update review',
        data: null
      };
    }
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    try {
      console.log(`Deleting review ${reviewId}`);
      
      const response = await api.delete(`/Review/${reviewId}`);
      
      return {
        success: true,
        data: response.data,
        message: 'Review deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting review:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete review',
        data: null
      };
    }
  },

  // Add owner response to a review
  addOwnerResponse: async (reviewId, response) => {
    try {
      console.log(`Adding owner response to review ${reviewId}:`, response);
      
      const apiResponse = await api.post(`/Review/${reviewId}/owner-response`, {
        response
      });
      
      return {
        success: true,
        data: apiResponse.data,
        message: 'Owner response added successfully'
      };
    } catch (error) {
      console.error('Error adding owner response:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to add owner response',
        data: null
      };
    }
  },

  // Update owner response for a review
  updateOwnerResponse: async (reviewId, response) => {
    try {
      console.log(`Updating owner response for review ${reviewId}:`, response);
      
      const apiResponse = await api.put(`/Review/${reviewId}/owner-response`, {
        response
      });
      
      return {
        success: true,
        data: apiResponse.data,
        message: 'Owner response updated successfully'
      };
    } catch (error) {
      console.error('Error updating owner response:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update owner response',
        data: null
      };
    }
  },

  // Delete owner response for a review
  deleteOwnerResponse: async (reviewId) => {
    try {
      console.log(`Deleting owner response for review ${reviewId}`);
      
      const apiResponse = await api.delete(`/Review/${reviewId}/owner-response`);
      
      return {
        success: true,
        data: apiResponse.data,
        message: 'Owner response deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting owner response:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete owner response',
        data: null
      };
    }
  },

  // Toggle helpful vote on a review
  toggleHelpful: async (reviewId, isHelpful) => {
    try {
      console.log(`Toggling helpful vote for review ${reviewId}:`, { isHelpful });
      
      const apiResponse = await api.post(`/Review/${reviewId}/helpful`, {
        isHelpful
      });
      
      return {
        success: true,
        data: apiResponse.data,
        message: 'Vote recorded successfully'
      };
    } catch (error) {
      console.error('Error toggling helpful vote:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to record vote',
        data: null
      };
    }
  }
};

export default reviewAPI;
