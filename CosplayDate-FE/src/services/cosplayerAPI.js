// src/services/cosplayerAPI.js - FIXED VERSION with better user ID handling
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
    return config;
  });

  // FIX: Improved response interceptor - don't auto-redirect on homepage and other public routes
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
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
      if (error.response?.status === 401 && !isPublicRoute) {
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
  getCosplayers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        pageSize: params.pageSize || 12,
        sortBy: params.sortBy || 'rating',
        sortOrder: params.sortOrder || 'desc',
        ...params
      });

      const response = await api.get(`/cosplayers?${queryParams}`);

      // console.log('API Response structure:', {
        hasData: !!response.data,
        hasDataData: !!response.data?.data,
        hasCosplayers: !!response.data?.data?.cosplayers,
        cosplayersCount: response.data?.data?.cosplayers?.length || 0,
        hasAvailableCategories: !!response.data?.data?.availableCategories,
        hasAvailableSpecialties: !!response.data?.data?.availableSpecialties,
        hasAvailableTags: !!response.data?.data?.availableTags,
        categoriesCount: response.data?.data?.availableCategories?.length || 0,
        specialtiesCount: response.data?.data?.availableSpecialties?.length || 0,
        tagsCount: response.data?.data?.availableTags?.length || 0
      });

      // Fixed: Extract cosplayers from the nested structure
      let cosplayersArray = [];
      let paginationData = {};

      if (response.data?.isSuccess && response.data?.data) {
        // The cosplayers are in data.data.cosplayers based on your API response
        cosplayersArray = response.data.data.cosplayers || [];

        // Extract pagination info
        paginationData = {
          totalCount: response.data.data.totalCount || 0,
          currentPage: response.data.data.currentPage || 1,
          pageSize: response.data.data.pageSize || 12,
          totalPages: response.data.data.totalPages || 1,
          hasNextPage: response.data.data.hasNextPage || false,
          hasPreviousPage: response.data.data.hasPreviousPage || false
        };
      }

      return {
        success: true,
        data: {
          cosplayers: cosplayersArray,
          totalCount: response.data.data.totalCount || 0,
          currentPage: response.data.data.currentPage || 1,
          pageSize: response.data.data.pageSize || 12,
          totalPages: response.data.data.totalPages || 1,
          hasNextPage: response.data.data.hasNextPage || false,
          hasPreviousPage: response.data.data.hasPreviousPage || false,
          // Include filter options for frontend
          availableCategories: response.data.data.availableCategories || [],
          availableSpecialties: response.data.data.availableSpecialties || [],
          availableTags: response.data.data.availableTags || []
        },
        pagination: paginationData,
        message: response.data?.message || 'Cosplayers loaded successfully'
      };
    } catch (error) {
      console.error('Failed to load cosplayers:', error);
      return {
        success: false,
        data: {
          cosplayers: [],
          totalCount: 0,
          currentPage: 1,
          pageSize: 12,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
          availableCategories: [],
          availableSpecialties: [],
          availableTags: []
        },
        pagination: {},
        message: error.response?.data?.message || 'Failed to load cosplayers',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // ✅ FIXED: Better error handling and user ID support for cosplayer details
  getCosplayerDetails: async (id) => {
    try {
      // console.log('🔍 API: Getting cosplayer details for ID:', id);

      const response = await api.get(`/cosplayers/${id}`);

      // console.log('✅ API: Raw response:', {
        status: response.status,
        data: response.data,
        dataStructure: {
          isSuccess: response.data?.isSuccess,
          hasData: !!response.data?.data,
          dataKeys: response.data?.data ? Object.keys(response.data.data) : 'no data keys'
        }
      });

      // ✅ FIXED: Handle the specific backend response format {isSuccess: true, data: {...}}
      if (response.data && response.data.isSuccess === true && response.data.data) {
        // console.log('✅ API: Extracted cosplayer data:', response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Cosplayer details loaded successfully'
        };
      }
      // Handle case where isSuccess is not explicitly true but data exists
      else if (response.data && response.data.data) {
        // console.log('✅ API: Extracted data without explicit isSuccess:', response.data.data);
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || 'Cosplayer details loaded successfully'
        };
      }
      // Handle direct data response (fallback)
      else if (response.data && (response.data.id || response.data.displayName)) {
        // console.log('✅ API: Using direct response data:', response.data);
        return {
          success: true,
          data: response.data,
          message: 'Cosplayer details loaded successfully'
        };
      }
      // Handle explicit failure response
      else if (response.data && response.data.isSuccess === false) {
        // console.log('❌ API: Backend returned isSuccess: false');
        return {
          success: false,
          message: response.data.message || 'Failed to load cosplayer details',
          errors: response.data.errors || {}
        };
      }
      // No valid data found
      else {
        console.error('❌ API: No valid data structure found in response:', response.data);
        return {
          success: false,
          message: 'Invalid response format from server',
          errors: { invalidFormat: true }
        };
      }
    } catch (error) {
      console.error('❌ API: Error getting cosplayer details:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        url: error.config?.url,
        fullResponse: error.response?.data
      });

      // ✅ FIXED: More specific error handling for different cases
      if (error.response?.status === 404) {
        return {
          success: false,
          message: error.response?.data?.message || 'Cosplayer profile not found',
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

  // ✅ NEW: Dedicated method to get own cosplayer profile using current user data
  getCurrentCosplayerProfile: async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const userId = user.id || user.userId;

      if (!userId) {
        return {
          success: false,
          message: 'User ID not found',
          errors: { noUserId: true }
        };
      }

      // console.log('🔍 API: Getting current cosplayer profile for user:', userId);

      // Use the regular endpoint - backend now handles both cosplayer ID and user ID
      const response = await api.get(`/cosplayers/${userId}`);

      // console.log('✅ API: Current cosplayer profile response:', {
        status: response.status,
        hasData: !!response.data
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Current cosplayer profile loaded successfully'
      };
    } catch (error) {
      console.error('❌ API: Error getting current cosplayer profile:', error);

      if (error.response?.status === 404) {
        return {
          success: false,
          message: 'Cosplayer profile not found - you may need to complete your profile setup',
          errors: { needsSetup: true, status: 404 }
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || 'Failed to load current cosplayer profile',
        errors: error.response?.data?.errors || { status: error.response?.status }
      };
    }
  },

  // ✅ FIXED: Add method to check if user has cosplayer profile without triggering redirects
  checkCosplayerProfile: async (userId) => {
    try {
      // console.log('🔍 API: Checking cosplayer profile for user:', userId);

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
      // console.log('🔄 API: Converting to cosplayer with data:', cosplayerData);

      const response = await api.post('/cosplayers/become-cosplayer', cosplayerData);

      // console.log('✅ API: Become cosplayer response:', {
        status: response.status,
        data: response.data,
        isSuccess: response.data?.isSuccess
      });

      if (response.status === 200 || response.status === 201) {
        if (response.data?.isSuccess === true) {
          // Success case - clear old token and session
          // console.log('✅ Successfully became a cosplayer, clearing old session...');

          // Clear the old token and user data
          localStorage.removeItem('token');
          localStorage.removeItem('user');

          return {
            success: true,
            data: response.data.data || response.data,
            message: response.data.message || 'Successfully became a cosplayer',
            requiresRelogin: true // Flag to indicate re-login is needed
          };
        }
        else if (response.data?.isSuccess === false) {
          // console.log('❌ API: Backend returned failure:', response.data);
          return {
            success: false,
            message: response.data.message || 'Failed to become a cosplayer',
            errors: response.data.errors || {}
          };
        }
      }

      return {
        success: false,
        message: 'Unexpected response from server'
      };
    } catch (error) {
      console.error('❌ API: Error in becomeCosplayer:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to become a cosplayer',
        errors: error.response?.data?.errors || {}
      };
    }
  },

  // Get cosplayer services
  getServices: async (cosplayerId) => {
    try {
      const response = await api.get(`/cosplayers/${cosplayerId}/services`);

      // Handle the specific response structure
      let services = [];
      let cosplayerName = '';

      if (response.data?.isSuccess && response.data?.data) {
        services = response.data.data.services || [];
        cosplayerName = response.data.data.cosplayerName || '';

        // FIXED: Keep the original field names instead of transforming them
        services = services.map(service => ({
          id: service.id,
          serviceName: service.serviceName,  // Keep original field name
          serviceDescription: service.serviceDescription,  // Keep original field name
          // Price and duration will need to be added from another source or set as defaults
          price: service.price || service.pricePerSlot || 500000, // Default price
          duration: service.duration || 60, // Default 60 minutes
          category: service.category || 'General',
          includedItems: service.includedItems || [],
          isActive: service.isActive !== undefined ? service.isActive : true
        }));
      }

      return {
        success: true,
        data: services,
        cosplayerName: cosplayerName,
        totalCount: response.data?.data?.totalCount || services.length,
        message: response.data?.message || 'Services loaded successfully'
      };
    } catch (error) {
      console.error('Failed to load services:', error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || 'Failed to load services',
        errors: error.response?.data?.errors || []
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

      // Required field - must match backend exactly
      formData.append('File', photoData.file);

      // Optional fields with proper casing and defaults
      formData.append('Title', photoData.title || '');
      formData.append('Description', photoData.description || '');
      formData.append('Category', photoData.category || 'Other'); // Default to 'Other' if not provided
      formData.append('IsPortfolio', photoData.isPortfolio || false);
      formData.append('DisplayOrder', photoData.displayOrder || 0);

      // Handle tags if provided
      if (photoData.tags && Array.isArray(photoData.tags)) {
        photoData.tags.forEach(tag => {
          formData.append('Tags', tag);
        });
      }

      const response = await api.post('/cosplayers/photos', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || 'Photo uploaded successfully'
      };
    } catch (error) {
      console.error('Upload photo error:', error.response?.data);
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
      formData.append('Duration', videoData.duration || 0);
      formData.append('DisplayOrder', videoData.displayOrder || 0);

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
