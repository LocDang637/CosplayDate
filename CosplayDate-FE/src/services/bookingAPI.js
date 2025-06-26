// src/services/bookingAPI.js - FIXED VERSION
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

export const bookingAPI = {
  // Create a new booking
  createBooking: async (bookingData) => {
    try {
      console.log('Creating booking with data:', bookingData);
      
      // Validate required fields
      const requiredFields = ['cosplayerId', 'serviceType', 'bookingDate', 'startTime', 'endTime', 'location'];
      for (const field of requiredFields) {
        if (!bookingData[field] && bookingData[field] !== 0) {
          console.error(`Missing required field: ${field}`);
          return {
            success: false,
            message: `Missing required field: ${field}`,
            errors: { [field]: `${field} is required` }
          };
        }
      }
      
      const response = await api.post('/Booking', bookingData);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking created successfully'
      };
    } catch (error) {
      console.error('Failed to create booking:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get all bookings (for cosplayers to see their bookings)
  getBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/Booking?${queryParams}`);
      
      // Handle the response structure
      if (response.data?.isSuccess) {
        return {
          success: true,
          data: response.data.data || response.data,
          message: response.data.message || 'Bookings loaded successfully'
        };
      }
      
      return {
        success: true,
        data: response.data || [],
        message: 'Bookings loaded successfully'
      };
    } catch (error) {
      console.error('Failed to load bookings:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load bookings',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/Booking/${bookingId}`);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking details loaded successfully'
      };
    } catch (error) {
      console.error('Failed to load booking details:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load booking details',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Update booking - FIXED with proper request body
  updateBooking: async (bookingId, updateData) => {
    try {
      console.log(`Updating booking ${bookingId} with data:`, updateData);
      
      // Ensure all date/time fields are in correct format
      const requestBody = {
        bookingDate: updateData.bookingDate, // Should be "yyyy-MM-dd" format
        startTime: updateData.startTime, // Should be "HH:mm" format
        endTime: updateData.endTime, // Should be "HH:mm" format
        location: updateData.location || '',
        specialNotes: updateData.specialNotes || ''
      };
      
      const response = await api.put(`/Booking/${bookingId}`, requestBody);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking updated successfully'
      };
    } catch (error) {
      console.error('Failed to update booking:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Cancel booking - FIXED with proper request body
  cancelBooking: async (bookingId, reason = '') => {
    try {
      console.log(`Cancelling booking ${bookingId} with reason:`, reason);
      
      // API expects { cancellationReason: string }
      const requestBody = {
        cancellationReason: reason || ''
      };
      
      const response = await api.post(`/Booking/${bookingId}/cancel`, requestBody);
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking cancelled successfully'
      };
    } catch (error) {
      console.error('Failed to cancel booking:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Confirm booking (for cosplayer) - FIXED
  confirmBooking: async (bookingId) => {
    try {
      console.log(`Confirming booking ${bookingId}`);
      
      // No request body needed
      const response = await api.post(`/Booking/${bookingId}/confirm`, {});
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking confirmed successfully'
      };
    } catch (error) {
      console.error('Failed to confirm booking:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Complete booking - FIXED
  completeBooking: async (bookingId) => {
    try {
      console.log(`Completing booking ${bookingId}`);
      
      // No request body needed
      const response = await api.post(`/Booking/${bookingId}/complete`, {});
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Booking completed successfully'
      };
    } catch (error) {
      console.error('Failed to complete booking:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Calculate booking price - FIXED to use GET with query parameters
  calculatePrice: async (cosplayerId, startTime, endTime) => {
    try {
      // Ensure cosplayerId is an integer
      const id = parseInt(cosplayerId);
      
      console.log('Calculating price:', { cosplayerId: id, startTime, endTime });
      
      // Make GET request with query parameters
      const response = await api.get('/Booking/calculate-price', {
        params: {
          cosplayerId: id,
          startTime: startTime,
          endTime: endTime
        }
      });
      
      console.log('Price calculation response:', response.data);
      
      // Handle the specific response format
      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data, // The calculated price
          message: response.data.message
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Failed to calculate price',
          errors: response.data.errors || []
        };
      }
    } catch (error) {
      console.error('Failed to calculate price:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to calculate price',
        errors: error.response?.data?.errors || []
      };
    }
  }
};