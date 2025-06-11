// src/services/bookingAPI.js
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

export const bookingAPI = {
  // Check wallet balance
  checkBalance: async () => {
    try {
      const response = await api.get('/payment/wallet/balance');
      return {
        success: true,
        data: response.data.data || { Balance: 0 },
        message: response.data.message || 'Balance retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to check balance',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Booking created successfully'
      };
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('insufficient funds')) {
        return {
          success: false,
          insufficientFunds: true,
          message: 'Số dư không đủ để thực hiện đặt lịch',
          errors: { balance: 'Insufficient funds' }
        };
      }
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get booking details
  getBookingDetails: async (bookingId) => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Booking details loaded'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load booking details',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get user's bookings
  getUserBookings: async (params = {}) => {
    try {
      const response = await api.get('/bookings/my-bookings', { params });
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Bookings loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load bookings',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Cancel booking (before confirmation)
  cancelBooking: async (bookingId, reason) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/cancel`, { reason });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Booking cancelled successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Cosplayer confirms booking
  confirmBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/confirm`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Booking confirmed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to confirm booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Upload evidence (photos before/after)
  uploadEvidence: async (bookingId, formData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/evidence`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Evidence uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload evidence',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Complete booking (cosplayer marks as complete)
  completeBooking: async (bookingId) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/complete`);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Booking completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to complete booking',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Report issue
  reportIssue: async (bookingId, reportData) => {
    try {
      const formData = new FormData();
      formData.append('bookingId', bookingId);
      formData.append('reason', reportData.reason);
      formData.append('description', reportData.description);
      
      // Add evidence files
      if (reportData.evidence) {
        reportData.evidence.forEach((file, index) => {
          formData.append(`evidence[${index}]`, file);
        });
      }

      const response = await api.post(`/bookings/${bookingId}/report`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Issue reported successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to report issue',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get available time slots
  getAvailableSlots: async (cosplayerId, date) => {
    try {
      const response = await api.get(`/bookings/available-slots`, {
        params: { cosplayerId, date }
      });
      return {
        success: true,
        data: response.data.data || [],
        message: response.data.message || 'Available slots loaded'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load available slots',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Create schedule form (cosplayer)
  createScheduleForm: async (bookingId, scheduleData) => {
    try {
      const response = await api.post(`/bookings/${bookingId}/schedule`, scheduleData);
      return {
        success: true,
        data: response.data.data,
        message: response.data.message || 'Schedule created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create schedule',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};