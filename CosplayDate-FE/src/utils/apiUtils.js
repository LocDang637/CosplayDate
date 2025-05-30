// src/utils/apiUtils.js

/**
 * Standardized API response handler
 * @param {Promise} apiCall - The API call promise
 * @returns {Object} Standardized response object
 */
export const handleApiCall = async (apiCall) => {
  try {
    const response = await apiCall;
    return {
      success: true,
      data: response.data,
      status: response.status,
      message: response.data.message || 'Operation successful'
    };
  } catch (error) {
    console.error('API Call Error:', error);
    
    if (error.response) {
      // Server responded with error status
      return {
        success: false,
        data: null,
        status: error.response.status,
        message: error.response.data?.message || 'Server error occurred',
        errors: error.response.data?.errors || {},
        validationErrors: error.response.data?.validationErrors || {}
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        data: null,
        status: null,
        message: 'Network error - please check your connection',
        errors: {},
        validationErrors: {}
      };
    } else {
      // Something else happened
      return {
        success: false,
        data: null,
        status: null,
        message: error.message || 'An unexpected error occurred',
        errors: {},
        validationErrors: {}
      };
    }
  }
};

/**
 * Extract validation errors from API response
 * @param {Object} apiResponse - API response object
 * @returns {Object} Field-specific errors
 */
export const extractValidationErrors = (apiResponse) => {
  const errors = {};
  
  if (apiResponse.validationErrors) {
    Object.keys(apiResponse.validationErrors).forEach(field => {
      errors[field] = apiResponse.validationErrors[field][0]; // Take first error message
    });
  }
  
  if (apiResponse.errors) {
    Object.assign(errors, apiResponse.errors);
  }
  
  return errors;
};

/**
 * Format error message for display
 * @param {Object} apiResponse - API response object
 * @returns {string} Formatted error message
 */
export const formatErrorMessage = (apiResponse) => {
  if (!apiResponse.success) {
    if (apiResponse.status === 400) {
      return 'Please check your input and try again.';
    } else if (apiResponse.status === 401) {
      return 'Authentication failed. Please check your credentials.';
    } else if (apiResponse.status === 403) {
      return 'You do not have permission to perform this action.';
    } else if (apiResponse.status === 404) {
      return 'The requested resource was not found.';
    } else if (apiResponse.status === 409) {
      return 'This operation conflicts with existing data.';
    } else if (apiResponse.status >= 500) {
      return 'Server error occurred. Please try again later.';
    } else if (!apiResponse.status) {
      return 'Network error. Please check your connection.';
    }
    
    return apiResponse.message || 'An error occurred. Please try again.';
  }
  
  return apiResponse.message || 'Operation completed successfully.';
};

/**
 * Check if error is due to network issues
 * @param {Object} apiResponse - API response object
 * @returns {boolean} True if network error
 */
export const isNetworkError = (apiResponse) => {
  return !apiResponse.success && !apiResponse.status;
};

/**
 * Check if error is due to authentication issues
 * @param {Object} apiResponse - API response object
 * @returns {boolean} True if auth error
 */
export const isAuthError = (apiResponse) => {
  return !apiResponse.success && (apiResponse.status === 401 || apiResponse.status === 403);
};

/**
 * Check if error is due to validation issues
 * @param {Object} apiResponse - API response object
 * @returns {boolean} True if validation error
 */
export const isValidationError = (apiResponse) => {
  return !apiResponse.success && apiResponse.status === 400 && 
         (Object.keys(apiResponse.errors).length > 0 || Object.keys(apiResponse.validationErrors).length > 0);
};

/**
 * Retry an API call with exponential backoff
 * @param {Function} apiCall - Function that returns API call promise
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} baseDelay - Base delay in milliseconds
 * @returns {Promise} API response
 */
export const retryApiCall = async (apiCall, maxRetries = 3, baseDelay = 1000) => {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await handleApiCall(apiCall());
      
      if (result.success || !isNetworkError(result)) {
        return result;
      }
      
      lastError = result;
    } catch (error) {
      lastError = {
        success: false,
        message: error.message || 'Retry failed',
        errors: {},
        validationErrors: {}
      };
    }
    
    if (attempt < maxRetries) {
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return lastError;
};

/**
 * Create a debounced API call function
 * @param {Function} apiCall - Function that makes API call
 * @param {number} delay - Debounce delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounceApiCall = (apiCall, delay = 500) => {
  let timeoutId;
  
  return (...args) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await apiCall(...args);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, delay);
    });
  };
};

/**
 * Local storage utilities for token management
 */
export const tokenUtils = {
  getToken: () => localStorage.getItem('token'),
  setToken: (token) => localStorage.setItem('token', token),
  removeToken: () => localStorage.removeItem('token'),
  isTokenExpired: (token) => {
    if (!token) return true;
    
    try {
      // Parse JWT token (basic check)
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }
};

/**
 * User data utilities
 */
export const userUtils = {
  getUser: () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },
  setUser: (user) => localStorage.setItem('user', JSON.stringify(user)),
  removeUser: () => localStorage.removeItem('user'),
  clearAuthData: () => {
    tokenUtils.removeToken();
    userUtils.removeUser();
  }
};

/**
 * API status checker
 * @param {string} baseURL - API base URL
 * @returns {Promise<boolean>} True if API is reachable
 */
export const checkApiStatus = async (baseURL) => {
  try {
    const response = await fetch(`${baseURL}/health`, {
      method: 'GET',
      timeout: 5000
    });
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
};