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
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
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
  }
};

export default reviewAPI;
