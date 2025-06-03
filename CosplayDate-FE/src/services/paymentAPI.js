import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
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

export const paymentAPI = {
  // Get available packages
  getTopUpPackages: async () => {
    try {
      const response = await api.get('/payment/packages');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load packages',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Create top-up payment
  createTopUp: async (packageData) => {
    try {
      const response = await api.post('/payment/topup', packageData);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create payment',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get wallet balance
  getWalletBalance: async () => {
    try {
      const response = await api.get('/payment/wallet/balance');
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to get balance',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};