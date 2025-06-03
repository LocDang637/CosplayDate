// src/services/cosplayerAPI.js - FIXED VERSION with better error handling
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5068/api';

const createApiInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // FIX: Improved response interceptor - don't auto-redirect on profile routes
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      const currentPath = window.location.pathname;
      const isProfileRoute = currentPath.startsWith('/profile/') || currentPath.startsWith('/cosplayer/');
      
      // Only auto-redirect to login for 401 errors if not on profile routes
      if (error.response?.status === 401 && !isProfileRoute) {
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

export const cosplayerAPI = {
  // Get all cosplayers with filters
  getCosplayers: async (filters = {}) => {
    try {
      const response = await api.get('/cosplayers', { params: filters });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Cosplayers loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load cosplayers',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // FIX: Better error handling for cosplayer details
  getCosplayerDetails: async (id) => {
    try {
      console.log('🔍 API: Getting cosplayer details for ID:', id);
      
      const response = await api.get(`/cosplayers/${id}`);
      
      console.log('✅ API: Cosplayer details response:', {
        status: response.status,
        hasData: !!response.data
      });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Cosplayer details loaded successfully'
      };
    } catch (error) {
      console.error('❌ API: Error getting cosplayer details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url
      });
      
      // FIX: Handle different error cases without triggering global redirects
      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Cosplayer profile not found',
          errors: { notFound: true, status: 404 }
        };
      } else if (error.response?.status === 401) {
        return {
          success: false,
          message: 'Authentication required',
          errors: { unauthorized: true, status: 401 }
        };
      } else if (error.response?.status === 403) {
        return {
          success: false,
          message: 'Access denied',
          errors: { forbidden: true, status: 403 }
        };
      } else {
        return {
          success: false,
          message: error.response?.data?.message || 'Failed to load cosplayer details',
          errors: error.response?.data?.errors || { status: error.response?.status }
        };
      }
    }
  },

  // FIX: Add method to check if user has cosplayer profile without triggering redirects
  checkCosplayerProfile: async (userId) => {
    try {
      console.log('🔍 API: Checking cosplayer profile for user:', userId);
      
      // First try to get cosplayer details
      const result = await cosplayerAPI.getCosplayerDetails(userId);
      
      if (result.success) {
        return {
          success: true,
          exists: true,
          data: result.data
        };
      } else if (result.errors?.notFound) {
        return {
          success: true,
          exists: false,
          data: null
        };
      } else {
        return {
          success: false,
          exists: false,
          message: result.message
        };
      }
    } catch (error) {
      console.error('❌ API: Error checking cosplayer profile:', error);
      return {
        success: false,
        exists: false,
        message: 'Failed to check cosplayer profile'
      };
    }
  },

  // Update cosplayer profile (authenticated)
  updateProfile: async (profileData) => {
    try {
      const response = await api.put('/cosplayers/profile', profileData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Profile updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Convert customer to cosplayer
  becomeCosplayer: async (cosplayerData) => {
    try {
      console.log('🔄 API: Converting to cosplayer with data:', cosplayerData);
      
      const response = await api.post('/cosplayers/become-cosplayer', cosplayerData);
      
      console.log('✅ API: Become cosplayer response:', {
        status: response.status,
        hasData: !!response.data
      });
      
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Successfully became a cosplayer'
      };
    } catch (error) {
      console.error('❌ API: Error becoming cosplayer:', error);
      
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to become cosplayer',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get cosplayer services
  getServices: async (cosplayerId) => {
    try {
      const response = await api.get(`/cosplayers/${cosplayerId}/services`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Services loaded successfully'
      };
    } catch (error) {
      // FIX: Don't fail completely if services can't be loaded
      console.warn('⚠️ API: Could not load services:', error.response?.data?.message);
      return {
        success: true, // Return success with empty array instead of failing
        data: [],
        message: 'No services available'
      };
    }
  },

  // Add new service
  addService: async (serviceData) => {
    try {
      const response = await api.post('/cosplayers/services', serviceData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Service added successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to add service',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Update service
  updateService: async (serviceId, serviceData) => {
    try {
      const response = await api.put(`/cosplayers/services/${serviceId}`, serviceData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Service updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update service',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Delete service
  deleteService: async (serviceId) => {
    try {
      const response = await api.delete(`/cosplayers/services/${serviceId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Service deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete service',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};

export const cosplayerMediaAPI = {
  // Upload photo
  uploadPhoto: async (photoData) => {
    try {
      const formData = new FormData();
      formData.append('File', photoData.file);
      formData.append('Title', photoData.title || '');
      formData.append('Description', photoData.description || '');
      formData.append('Category', photoData.category || '');
      formData.append('IsPrivate', photoData.isPrivate || false);

      const response = await api.post('/cosplayers/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Photo uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload photo',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Update photo
  updatePhoto: async (photoId, photoData) => {
    try {
      const response = await api.put(`/cosplayers/photos/${photoId}`, photoData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Photo updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update photo',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Delete photo
  deletePhoto: async (photoId) => {
    try {
      const response = await api.delete(`/cosplayers/photos/${photoId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Photo deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete photo',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get photos
  getPhotos: async (cosplayerId, params = {}) => {
    try {
      const response = await api.get(`/cosplayers/${cosplayerId}/photos`, { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Photos loaded successfully'
      };
    } catch (error) {
      // FIX: Don't fail completely if photos can't be loaded
      console.warn('⚠️ API: Could not load photos:', error.response?.data?.message);
      return {
        success: true, // Return success with empty array instead of failing
        data: { photos: [] },
        message: 'No photos available'
      };
    }
  },

  // Upload video
  uploadVideo: async (videoData) => {
    try {
      const formData = new FormData();
      formData.append('VideoFile', videoData.videoFile);
      if (videoData.thumbnailFile) {
        formData.append('ThumbnailFile', videoData.thumbnailFile);
      }
      formData.append('Title', videoData.title || '');
      formData.append('Description', videoData.description || '');
      formData.append('Category', videoData.category || '');
      formData.append('IsPrivate', videoData.isPrivate || false);

      const response = await api.post('/cosplayers/videos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Video uploaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to upload video',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Update video
  updateVideo: async (videoId, videoData) => {
    try {
      const response = await api.put(`/cosplayers/videos/${videoId}`, videoData);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Video updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update video',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      const response = await api.delete(`/cosplayers/videos/${videoId}`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Video deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete video',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get videos
  getVideos: async (cosplayerId, params = {}) => {
    try {
      const response = await api.get(`/cosplayers/${cosplayerId}/videos`, { params });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Videos loaded successfully'
      };
    } catch (error) {
      // FIX: Don't fail completely if videos can't be loaded
      console.warn('⚠️ API: Could not load videos:', error.response?.data?.message);
      return {
        success: true, // Return success with empty array instead of failing
        data: { videos: [] },
        message: 'No videos available'
      };
    }
  },

  // Toggle photo like
  togglePhotoLike: async (photoId) => {
    try {
      const response = await api.post(`/cosplayers/photos/${photoId}/like`);
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Like toggled successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to toggle like',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Reorder photos
  reorderPhotos: async (photoOrders) => {
    try {
      const response = await api.put('/cosplayers/photos/reorder', { photoOrders });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Photos reordered successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reorder photos',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Reorder videos
  reorderVideos: async (videoOrders) => {
    try {
      const response = await api.put('/cosplayers/videos/reorder', { videoOrders });
      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Videos reordered successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to reorder videos',
        errors: error.response?.data?.errors || {}
      };
    }
  }
};