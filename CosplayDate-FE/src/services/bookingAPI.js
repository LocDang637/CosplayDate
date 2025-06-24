// src/services/bookingAPI.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const bookingAPI = {
  // Create new booking
  createBooking: async (bookingData) => {
    try {
      const response = await api.post("/booking", bookingData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking created successfully",
      };
    } catch (error) {
      console.error("Failed to create booking:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to create booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get bookings with filters
  getBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/booking`);
      return {
        success: true,
        data: response.data.data || response.data || [],
        pagination: response.data.pagination || {},
        message: response.data.message || "Bookings loaded successfully",
      };
    } catch (error) {
      console.error("Failed to load bookings:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load bookings",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      const response = await api.get(`/booking/${bookingId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking details loaded",
      };
    } catch (error) {
      console.error("Failed to load booking details:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to load booking details",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Update booking
  updateBooking: async (bookingId, updateData) => {
    try {
      const response = await api.put(`/booking/${bookingId}`, updateData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking updated successfully",
      };
    } catch (error) {
      console.error("Failed to update booking:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Confirm booking
  confirmBooking: async (bookingId) => {
    try {
      const response = await api.post(`/booking/${bookingId}/confirm`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking confirmed successfully",
      };
    } catch (error) {
      console.error("Failed to confirm booking:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to confirm booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, reason = "") => {
    try {
      const response = await api.post(`/booking/${bookingId}/cancel`, {
        cancellationReason: reason,
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking cancelled successfully",
      };
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Complete booking
  completeBooking: async (bookingId) => {
    try {
      const response = await api.post(`/booking/${bookingId}/complete`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Booking completed successfully",
      };
    } catch (error) {
      console.error("Failed to complete booking:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to complete booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Calculate price
  calculatePrice: async (cosplayerId, startTime, endTime) => {
    try {
      const params = { cosplayerId, startTime, endTime };
      const response = await api.get("/booking/calculate-price", { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Price calculated successfully",
      };
    } catch (error) {
      console.error("Failed to calculate price:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to calculate price",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get upcoming bookings
  getUpcomingBookings: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/booking/upcoming`);
      return {
        success: true,
        data: response.data.data || response.data || [],
        pagination: response.data.pagination || {},
        message:
          response.data.message || "Upcoming bookings loaded successfully",
      };
    } catch (error) {
      console.error("Failed to load upcoming bookings:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load upcoming bookings",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get booking history
  getBookingHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(`/booking/history`);
      return {
        success: true,
        data: response.data.data || response.data || [],
        pagination: response.data.pagination || {},
        message: response.data.message || "Booking history loaded successfully",
      };
    } catch (error) {
      console.error("Failed to load booking history:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load booking history",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // === NEW: CUSTOMER-SPECIFIC BOOKING FUNCTIONS FOR CUSTOMERPROFILE ===

  // Get customer bookings with status filter (for CustomerBookingHistory)
  getCustomerBookings: async (status = "all", page = 1, pageSize = 20) => {
    try {
      const queryParams = new URLSearchParams({ status, page, pageSize });
      const response = await api.get(`/customers/bookings?${queryParams}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        summary: response.data.summary || {},
        message:
          response.data.message || "Customer bookings retrieved successfully",
      };
    } catch (error) {
      console.error("Get customer bookings API error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load bookings",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Customer cancel booking (different from general cancelBooking)
  cancelCustomerBooking: async (bookingId, reason = "") => {
    try {
      const response = await api.post(
        `/customers/bookings/${bookingId}/cancel`,
        { reason }
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Booking cancelled successfully",
      };
    } catch (error) {
      console.error("Cancel customer booking API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Reschedule booking (customer-specific)
  rescheduleBooking: async (bookingId, newDate, newTime) => {
    try {
      const response = await api.post(
        `/customers/bookings/${bookingId}/reschedule`,
        {
          newDate,
          newTime,
        }
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message:
          response.data.message || "Reschedule request sent successfully",
      };
    } catch (error) {
      console.error("Reschedule booking API error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to reschedule booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};
