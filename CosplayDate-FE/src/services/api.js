// src/services/api.js
import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API endpoints
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await api.post("/auth/register", userData);
      return {
        success: true,
        data: response.data,
        message: "Registration successful",
      };
    } catch (error) {
      console.error("Registration API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  login: async (credentials) => {
    try {
      console.log("🔄 Making login API call...");
      const response = await api.post("/auth/login", credentials);

      if (response.data.isSuccess === true && response.data.data?.token) {
        const userData = response.data.data;
        const token = response.data.data.token;

        const normalizedUserData = {
          id: userData.userId, // ← Map userId to id
          userId: userData.userId, // ← Keep original for reference
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          userType: userData.userType,
          // Add any other fields that might be missing
          avatar: userData.avatar || userData.avatarUrl || null,
          isVerified: true,
          location: userData.location || null,
          bio: userData.bio || null,
          dateOfBirth: userData.dateOfBirth || null,
          walletBalance: userData.walletBalance || 0,
          loyaltyPoints: userData.loyaltyPoints || 0,
          membershipTier: userData.membershipTier || "Bronze",
        };

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(normalizedUserData));

        console.log("🔄 Login successful, user data:", normalizedUserData);
        return {
          success: true,
          data: {
            user: normalizedUserData,
            token: token,
            isVerified: true,
          },
          message: response.data.message || "Login successful",
        };
      } else if (
        response.data.isSuccess === false &&
        response.data.message === "Account is not verified" &&
        response.data.errors?.includes(
          "A new verification code has been sent to your email"
        )
      ) {
        const userData = {
          email: credentials.email,
        };

        return {
          success: true,
          data: {
            user: userData,
            token: null,
            isVerified: false,
          },
          message:
            "Email verification required. OTP has been resent to your email.",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Login failed",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("🚨 Login API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        if (
          data?.isSuccess === false &&
          data?.message === "Account is not verified" &&
          data?.errors?.includes(
            "A new verification code has been sent to your email"
          )
        ) {
          const userData = {
            email: credentials.email,
          };

          return {
            success: true,
            data: {
              user: userData,
              token: null,
              isVerified: false,
            },
            message:
              "Email verification required. OTP has been resent to your email.",
          };
        }

        switch (status) {
          case 400:
            const errorMessage = data?.message || "";
            if (errorMessage.toLowerCase().includes("password")) {
              return {
                success: false,
                message: "Mật khẩu không đúng",
                errors: { password: "Mật khẩu không đúng" },
              };
            } else if (errorMessage.toLowerCase().includes("email")) {
              return {
                success: false,
                message: "Email không tồn tại",
                errors: { email: "Email không tồn tại trong hệ thống" },
              };
            } else {
              return {
                success: false,
                message: data?.message || "Email hoặc mật khẩu không đúng",
                errors: data?.errors || {},
              };
            }

          case 401:
            return {
              success: false,
              message: "Email hoặc mật khẩu không đúng",
              errors: {},
            };

          case 404:
            return {
              success: false,
              message: "Không tìm thấy tài khoản với email này",
              errors: { email: "Email không tồn tại trong hệ thống" },
            };

          default:
            return {
              success: false,
              message: data?.message || "Đăng nhập thất bại",
              errors: data?.errors || {},
            };
        }
      } else if (error.request) {
        return {
          success: false,
          message: "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối của bạn.",
          errors: {},
        };
      } else {
        return {
          success: false,
          message: "Đã xảy ra lỗi không mong muốn. Vui lòng thử lại.",
          errors: {},
        };
      }
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Logged out successfully",
      };
    } catch (error) {
      console.error("Logout API error:", error);
      // Even if API call fails, clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        success: true,
        message: "Logged out successfully",
      };
    }
  },

  verifyEmail: async (verificationData) => {
    try {
      const response = await api.post("/auth/verify-email", verificationData);

      if (response.data.isSuccess && response.data.data?.token) {
        localStorage.setItem("token", response.data.data.token);

        if (response.data.data.user) {
          const updatedUser = { ...response.data.data.user, isVerified: true };
          localStorage.setItem("user", JSON.stringify(updatedUser));
        }
      }

      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Email verified successfully",
      };
    } catch (error) {
      console.error("Email verification API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || "Mã xác thực không hợp lệ",
              errors: data?.errors || {},
            };

          case 404:
            return {
              success: false,
              message: "Không tìm thấy mã xác thực. Vui lòng yêu cầu mã mới.",
              errors: {},
            };

          case 410:
            return {
              success: false,
              message: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
              errors: {},
            };

          default:
            return {
              success: false,
              message: data?.message || "Xác thực email thất bại",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        errors: {},
      };
    }
  },

  resendVerification: async (email) => {
    try {
      const response = await api.post("/auth/resend-verification", { email });
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Verification code sent successfully",
      };
    } catch (error) {
      console.error("Resend verification API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 404:
            return {
              success: false,
              message: "Không tìm thấy tài khoản với email này",
              errors: {},
            };

          case 409:
            return {
              success: false,
              message: "Tài khoản đã được xác thực",
              errors: {},
            };

          case 429:
            return {
              success: false,
              message: "Vui lòng đợi trước khi yêu cầu mã mới",
              errors: {},
            };

          default:
            return {
              success: false,
              message: data?.message || "Không thể gửi mã xác thực",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        errors: {},
      };
    }
  },

  forgotPassword: async (emailData) => {
    try {
      const response = await api.post("/auth/forgot-password", emailData);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Reset code sent successfully",
      };
    } catch (error) {
      console.error("Forgot password API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 404:
            return {
              success: false,
              message: "Không tìm thấy tài khoản với email này",
              errors: {},
            };

          case 429:
            return {
              success: false,
              message: "Vui lòng đợi trước khi yêu cầu mã mới",
              errors: {},
            };

          default:
            return {
              success: false,
              message: data?.message || "Không thể gửi mã đặt lại mật khẩu",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        errors: {},
      };
    }
  },

  resetPassword: async (resetData) => {
    try {
      // Ensure the data structure matches your backend DTO
      const requestData = {
        email: resetData.email,
        token: resetData.code,
        newPassword: resetData.password, // Changed from 'password' to 'newPassword'
      };

      console.log("🔄 Sending reset password request:", {
        email: requestData.email,
        code: requestData.code,
        newPassword: "[HIDDEN]",
      });

      const response = await api.post("/auth/reset-password", requestData);

      console.log("✅ Reset password API response:", response.data);

      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Password reset successfully",
      };
    } catch (error) {
      console.error("🚨 Reset password API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        console.log("❌ Error response:", {
          status,
          data,
          message: data?.message,
        });

        switch (status) {
          case 400:
            // Check if it's a validation error
            if (data?.errors && typeof data.errors === "object") {
              return {
                success: false,
                message: "Dữ liệu không hợp lệ",
                errors: data.errors,
              };
            }

            return {
              success: false,
              message: data?.message || "Dữ liệu không hợp lệ",
              errors: data?.errors || {},
            };

          case 404:
            return {
              success: false,
              message: "Mã xác thực không hợp lệ hoặc đã hết hạn",
              errors: {},
            };

          case 410:
            return {
              success: false,
              message: "Mã xác thực đã hết hạn. Vui lòng yêu cầu mã mới.",
              errors: {},
            };

          default:
            return {
              success: false,
              message: data?.message || "Không thể đặt lại mật khẩu",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        errors: {},
      };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.post("/auth/change-password", passwordData);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Password changed successfully",
      };
    } catch (error) {
      console.error("Change password API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || "Mật khẩu hiện tại không đúng",
              errors: data?.errors || {},
            };

          case 401:
            return {
              success: false,
              message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
              errors: {},
            };

          default:
            return {
              success: false,
              message: data?.message || "Không thể thay đổi mật khẩu",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Lỗi kết nối. Vui lòng thử lại.",
        errors: {},
      };
    }
  },

  checkEmailAvailability: async (email) => {
    try {
      const response = await api.get(
        `/auth/check-email?email=${encodeURIComponent(email)}`
      );
      return {
        success: true,
        isAvailable: response.data.isAvailable,
        message: response.data.message,
      };
    } catch (error) {
      console.error("Check email API error:", error);
      return {
        success: false,
        isAvailable: false,
        message:
          error.response?.data?.message || "Failed to check email availability",
      };
    }
  },
};

// User API endpoints (existing code continues...)
export const userAPI = {
  // Get current user profile
  getCurrentProfile: async () => {
    try {
      const response = await api.get("/users/profile");

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Profile retrieved successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to get profile",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Get current profile API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            return {
              success: false,
              message: "Unauthorized. Please login again.",
              errors: {},
            };
          case 404:
            return {
              success: false,
              message: "Profile not found",
              errors: {},
            };
          default:
            return {
              success: false,
              message: data?.message || "Failed to get profile",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Network error. Please try again.",
        errors: {},
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
          message: response.data.message || "Profile retrieved successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to get profile",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Get user profile API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 404:
            return {
              success: false,
              message: "User not found",
              errors: {},
            };
          case 403:
            return {
              success: false,
              message: "Access denied",
              errors: {},
            };
          default:
            return {
              success: false,
              message: data?.message || "Failed to get profile",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Network error. Please try again.",
        errors: {},
      };
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      const response = await api.put("/users/profile", profileData);

      if (response.data.isSuccess) {
        // Update local storage with new profile data
        const updatedUser = response.data.data;
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const mergedUser = { ...currentUser, ...updatedUser };
        localStorage.setItem("user", JSON.stringify(mergedUser));

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Profile updated successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to update profile",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Update profile API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            return {
              success: false,
              message: "Invalid profile data",
              errors: data?.errors || {},
            };
          case 401:
            return {
              success: false,
              message: "Unauthorized. Please login again.",
              errors: {},
            };
          default:
            return {
              success: false,
              message: data?.message || "Failed to update profile",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Network error. Please try again.",
        errors: {},
      };
    }
  },

  // Upload profile avatar
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await api.post("/users/upload-avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.isSuccess) {
        // Update local storage with new avatar URL
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = {
          ...currentUser,
          avatarUrl: response.data.data.avatarUrl,
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Avatar uploaded successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to upload avatar",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Upload avatar API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || "Invalid file format or size",
              errors: data?.errors || {},
            };
          case 401:
            return {
              success: false,
              message: "Unauthorized. Please login again.",
              errors: {},
            };
          case 413:
            return {
              success: false,
              message: "File too large. Maximum size is 5MB.",
              errors: {},
            };
          default:
            return {
              success: false,
              message: data?.message || "Failed to upload avatar",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Network error. Please try again.",
        errors: {},
      };
    }
  },

  // Delete profile avatar
  deleteAvatar: async () => {
    try {
      const response = await api.delete("/users/avatar");

      if (response.data.isSuccess) {
        // Update local storage to remove avatar URL
        const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { ...currentUser, avatarUrl: null };
        localStorage.setItem("user", JSON.stringify(updatedUser));

        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Avatar deleted successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to delete avatar",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Delete avatar API error:", error);

      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            return {
              success: false,
              message: "Unauthorized. Please login again.",
              errors: {},
            };
          case 404:
            return {
              success: false,
              message: "No avatar to delete",
              errors: {},
            };
          default:
            return {
              success: false,
              message: data?.message || "Failed to delete avatar",
              errors: data?.errors || {},
            };
        }
      }

      return {
        success: false,
        message: "Network error. Please try again.",
        errors: {},
      };
    }
  },

  // === UNUSED API 1: User Settings ===
  getUserSettings: async () => {
    try {
      const response = await api.get("/users/settings");

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Settings retrieved successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to get settings",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Get settings API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get settings",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  updateUserSettings: async (settings) => {
    try {
      const response = await api.put("/users/settings", settings);

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Settings updated successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to update settings",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Update settings API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update settings",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // === UNUSED API 2: User Interests ===
  getUserInterests: async () => {
    try {
      const response = await api.get("/users/interests");

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Interests retrieved successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to get interests",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Get interests API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to get interests",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  updateUserInterests: async (interests) => {
    try {
      const response = await api.put("/users/interests", { interests });

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "Interests updated successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to update interests",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Update interests API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update interests",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // === UNUSED API 3: Follow/Unfollow ===
  followUser: async (userId) => {
    try {
      const response = await api.post(`/users/follow/${userId}`);

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "User followed successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to follow user",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Follow user API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to follow user",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  unfollowUser: async (userId) => {
    try {
      const response = await api.delete(`/users/follow/${userId}`);

      if (response.data.isSuccess) {
        return {
          success: true,
          data: response.data.data,
          message: response.data.message || "User unfollowed successfully",
        };
      } else {
        return {
          success: false,
          message: response.data.message || "Failed to unfollow user",
          errors: response.data.errors || {},
        };
      }
    } catch (error) {
      console.error("Unfollow user API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to unfollow user",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// === MISSING APIS FOR CUSTOMER PROFILE - NEWLY ADDED ===

// 1. FOLLOW/UNFOLLOW API (needed for CustomerProfileHeader follow button)
export const followAPI = {
  // Follow a cosplayer
  followCosplayer: async (cosplayerId) => {
    try {
      const response = await api.post(`/users/follow/${cosplayerId}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Cosplayer followed successfully",
      };
    } catch (error) {
      console.error("Follow cosplayer API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to follow cosplayer",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Unfollow a cosplayer
  unfollowCosplayer: async (cosplayerId) => {
    try {
      const response = await api.delete(`/users/follow/${cosplayerId}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Cosplayer unfollowed successfully",
      };
    } catch (error) {
      console.error("Unfollow cosplayer API error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to unfollow cosplayer",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Check follow status
  checkFollowStatus: async (cosplayerId) => {
    try {
      const response = await api.get(`/users/follow/status/${cosplayerId}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Follow status retrieved",
      };
    } catch (error) {
      console.error("Check follow status API error:", error);
      return {
        success: false,
        data: { isFollowing: false },
        message:
          error.response?.data?.message || "Failed to check follow status",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get followed cosplayers (for Favorites tab)
  getFollowedCosplayers: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get(
        `/users/following?page=${page}&pageSize=${pageSize}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        message:
          response.data.message || "Followed cosplayers retrieved successfully",
      };
    } catch (error) {
      console.error("Get followed cosplayers API error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load followed cosplayers",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// 2. CUSTOMER STATS API (needed for CustomerProfileOverview stats)
export const customerStatsAPI = {
  // Get customer statistics
  getCustomerStats: async (userId) => {
    try {
      const response = await api.get(`/customers/${userId}/stats`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message:
          response.data.message || "Customer statistics retrieved successfully",
      };
    } catch (error) {
      console.error("Get customer stats API error:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to load customer statistics",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get recent activity (for CustomerProfileOverview activity feed)
  getRecentActivity: async (userId, limit = 10) => {
    try {
      const response = await api.get(
        `/customers/${userId}/activity?limit=${limit}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        message:
          response.data.message || "Recent activity retrieved successfully",
      };
    } catch (error) {
      console.error("Get recent activity API error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load recent activity",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get favorite categories (for CustomerProfileOverview charts)
  getFavoriteCategories: async (userId) => {
    try {
      const response = await api.get(
        `/customers/${userId}/favorite-categories`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        message:
          response.data.message || "Favorite categories retrieved successfully",
      };
    } catch (error) {
      console.error("Get favorite categories API error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load favorite categories",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// 3. ENHANCED WALLET API (needed for CustomerWallet component)
export const enhancedWalletAPI = {
  // Get detailed wallet information (extends existing paymentAPI)
  getWalletDetails: async () => {
    try {
      const response = await api.get("/payment/wallet/details");
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message:
          response.data.message || "Wallet details retrieved successfully",
      };
    } catch (error) {
      console.error("Get wallet details API error:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to load wallet details",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get spending analytics
  getSpendingAnalytics: async (timeRange = "6m") => {
    try {
      const response = await api.get(
        `/payment/wallet/analytics?timeRange=${timeRange}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message:
          response.data.message || "Spending analytics retrieved successfully",
      };
    } catch (error) {
      console.error("Get spending analytics API error:", error);
      return {
        success: false,
        data: null,
        message:
          error.response?.data?.message || "Failed to load spending analytics",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get transaction history with filters
  getTransactionHistory: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await api.get(
        `/payment/wallet/transactions?${queryParams}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        message:
          response.data.message || "Transaction history retrieved successfully",
      };
    } catch (error) {
      console.error("Get transaction history API error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load transaction history",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// 4. CUSTOMER BOOKINGS API (needed for CustomerBookingHistory component)
export const customerBookingsAPI = {
  // Get customer bookings with status filter
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

  // Cancel booking
  cancelBooking: async (bookingId, reason = "") => {
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
      console.error("Cancel booking API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to cancel booking",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Reschedule booking
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

// 5. CUSTOMER REVIEWS API (for reviews section)
export const customerReviewsAPI = {
  // Get customer's submitted reviews
  getCustomerReviews: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get(
        `/customers/reviews?page=${page}&pageSize=${pageSize}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        message:
          response.data.message || "Customer reviews retrieved successfully",
      };
    } catch (error) {
      console.error("Get customer reviews API error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load reviews",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Submit review
  submitReview: async (reviewData) => {
    try {
      const response = await api.post("/customers/reviews", reviewData);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Review submitted successfully",
      };
    } catch (error) {
      console.error("Submit review API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to submit review",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Update review
  updateReview: async (reviewId, reviewData) => {
    try {
      const response = await api.put(
        `/customers/reviews/${reviewId}`,
        reviewData
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Review updated successfully",
      };
    } catch (error) {
      console.error("Update review API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to update review",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Delete review
  deleteReview: async (reviewId) => {
    try {
      const response = await api.delete(`/customers/reviews/${reviewId}`);
      return {
        success: response.data.isSuccess,
        message: response.data.message || "Review deleted successfully",
      };
    } catch (error) {
      console.error("Delete review API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete review",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// 6. NOTIFICATION API (for notification count in header)
export const notificationAPI = {
  // Get notifications
  getNotifications: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get(
        `/notifications?page=${page}&pageSize=${pageSize}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        message:
          response.data.message || "Notifications retrieved successfully",
      };
    } catch (error) {
      console.error("Get notifications API error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load notifications",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return {
        success: response.data.isSuccess,
        message: response.data.message || "Notification marked as read",
      };
    } catch (error) {
      console.error("Mark notification as read API error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message ||
          "Failed to mark notification as read",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get unread count
  getUnreadCount: async () => {
    try {
      const response = await api.get("/notifications/unread-count");
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Unread count retrieved",
      };
    } catch (error) {
      console.error("Get unread count API error:", error);
      return {
        success: false,
        data: { count: 0 },
        message: error.response?.data?.message || "Failed to get unread count",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// 7. FAVORITES API (for Favorites tab)
export const favoritesAPI = {
  // Get favorite cosplayers
  getFavoriteCosplayers: async (page = 1, pageSize = 20) => {
    try {
      const response = await api.get(
        `/customers/favorites?page=${page}&pageSize=${pageSize}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        pagination: response.data.pagination || {},
        message:
          response.data.message || "Favorite cosplayers retrieved successfully",
      };
    } catch (error) {
      console.error("Get favorite cosplayers API error:", error);
      return {
        success: false,
        data: [],
        message:
          error.response?.data?.message || "Failed to load favorite cosplayers",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Add to favorites
  addToFavorites: async (cosplayerId) => {
    try {
      const response = await api.post(`/customers/favorites/${cosplayerId}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Added to favorites successfully",
      };
    } catch (error) {
      console.error("Add to favorites API error:", error);
      return {
        success: false,
        message: error.response?.data?.message || "Failed to add to favorites",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Remove from favorites
  removeFromFavorites: async (cosplayerId) => {
    try {
      const response = await api.delete(`/customers/favorites/${cosplayerId}`);
      return {
        success: response.data.isSuccess,
        data: response.data.data,
        message: response.data.message || "Removed from favorites successfully",
      };
    } catch (error) {
      console.error("Remove from favorites API error:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to remove from favorites",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

// Utility functions
export const userUtils = {
  getCurrentUser: () => {
    const userData = localStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
  },

  getCurrentToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem("token") && localStorage.getItem("user"));
  },

  getUserRole: () => {
    const user = userUtils.getCurrentUser();
    return user?.userType || user?.role || null;
  },

  isCustomer: () => {
    const role = userUtils.getUserRole();
    return role === "Customer";
  },

  isCosplayer: () => {
    const role = userUtils.getUserRole();
    return role === "Cosplayer";
  },

  clearUserData: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("refreshToken");
  },
};

// === ENHANCED CUSTOMER MEDIA API ===
export const customerMediaAPI = {
  // Upload profile photo
  uploadProfilePhoto: async (photoData) => {
    try {
      const formData = new FormData();
      formData.append("File", photoData.file);
      formData.append("Title", photoData.title || "");
      formData.append("Description", photoData.description || "");
      formData.append("Category", photoData.category || "profile");

      const response = await api.post("/users/photos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Photo uploaded successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to upload photo",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Delete profile photo
  deleteProfilePhoto: async (photoId) => {
    try {
      const response = await api.delete(`/users/photos/${photoId}`);

      return {
        success: true,
        data: response.data.data || response.data,
        message: response.data.message || "Photo deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Failed to delete photo",
        errors: error.response?.data?.errors || {},
      };
    }
  },

  // Get user gallery
  getUserGallery: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/photos`);

      return {
        success: true,
        data: response.data.data || response.data || [],
        message: response.data.message || "Gallery loaded successfully",
      };
    } catch (error) {
      return {
        success: true, // Return success with empty array instead of failing
        data: [],
        message: "No photos available",
      };
    }
  },

  // Get customer gallery with category filter (enhanced for CustomerProfilePage)
  getCustomerGallery: async (userId, category = "all") => {
    try {
      const queryParams = category !== "all" ? `?category=${category}` : "";
      const response = await api.get(
        `/customers/${userId}/gallery${queryParams}`
      );
      return {
        success: response.data.isSuccess,
        data: response.data.data || [],
        message: response.data.message || "Gallery retrieved successfully",
      };
    } catch (error) {
      console.error("Get customer gallery API error:", error);
      return {
        success: false,
        data: [],
        message: error.response?.data?.message || "Failed to load gallery",
        errors: error.response?.data?.errors || {},
      };
    }
  },
};

export default api;
