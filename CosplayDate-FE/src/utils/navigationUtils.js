// src/utils/navigationUtils.js

/**
 * Get the appropriate profile path based on user role
 * @param {Object} user - User object with userType/role
 * @returns {string} Profile path
 */
export const getProfilePath = (user) => {
  if (!user || !user.id) {
    console.warn('No user or user ID provided');
    return '/login';
  }
  
  const userType = user.userType || user.role; // Support both possible field names
  
  switch (userType) {
    case 'Customer':
      return `/customer-profile/${user.id}`;
    case 'Cosplayer':
      return `/profile/${user.id}`;
    default:
      // Fallback based on user properties or default to customer
      console.warn('Unknown user type:', userType, 'Defaulting to customer profile');
      return `/customer-profile/${user.id}`;
  }
};

/**
 * Get the appropriate profile path for own profile (without user ID in URL)
 * @param {Object} user - User object with userType/role
 * @returns {string} Own profile path
 */
export const getOwnProfilePath = (user) => {
  if (!user) {
    console.warn('No user provided');
    return '/login';
  }
  
  const userType = user.userType || user.role;
  
  switch (userType) {
    case 'Customer':
      return '/customer-profile';
    case 'Cosplayer':
      return '/profile';
    default:
      console.warn('Unknown user type:', userType, 'Defaulting to customer profile');
      return '/customer-profile';
  }
};

/**
 * Get the appropriate dashboard path based on user role
 * @param {Object} user - User object with userType/role
 * @returns {string} Dashboard path
 */
export const getDashboardPath = (user) => {
  if (!user) {
    return '/';
  }
  
  const userType = user.userType || user.role;
  
  switch (userType) {
    case 'Customer':
      return '/customer-dashboard';
    case 'Cosplayer':
      return '/cosplayer-dashboard';
    case 'Admin':
      return '/admin-dashboard';
    default:
      return '/';
  }
};

/**
 * Get user-specific navigation items based on role
 * @param {Object} user - User object with userType/role
 * @returns {Array} Navigation items array
 */
export const getRoleBasedNavigation = (user) => {
  const baseNavigation = [
    { label: 'Trang chủ', path: '/', icon: 'Home' },
    { label: 'Cosplayer', path: '/cosplayers', icon: 'Person' },
  ];
  
  if (!user) {
    return baseNavigation;
  }
  
  const userType = user.userType || user.role;
  
  switch (userType) {
    case 'Customer':
      return [
        ...baseNavigation,
        { label: 'Dịch vụ', path: '/services', icon: 'Favorite' },
        { label: 'Đặt lịch', path: '/my-bookings', icon: 'Event' },
      ];
      
    case 'Cosplayer':
      return [
        ...baseNavigation,
        { label: 'Quản lý dịch vụ', path: '/manage-services', icon: 'Business' },
        { label: 'Lịch trình', path: '/schedule', icon: 'Schedule' },
        { label: 'Thu nhập', path: '/earnings', icon: 'AttachMoney' },
      ];
      
    case 'Admin':
      return [
        ...baseNavigation,
        { label: 'Quản lý', path: '/admin', icon: 'AdminPanel' },
        { label: 'Báo cáo', path: '/reports', icon: 'Analytics' },
      ];
      
    default:
      return baseNavigation;
  }
};

/**
 * Check if user has permission to access a specific route
 * @param {Object} user - User object with userType/role
 * @param {string} path - Route path to check
 * @returns {boolean} Whether user has permission
 */
export const hasRoutePermission = (user, path) => {
  if (!user) {
    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/signup', '/forgot-password', '/reset-password', '/cosplayers'];
    return publicRoutes.includes(path) || path.startsWith('/cosplayer/');
  }
  
  const userType = user.userType || user.role;
  
  // Admin has access to everything
  if (userType === 'Admin') {
    return true;
  }
  
  // Customer-specific routes
  if (userType === 'Customer') {
    const customerRoutes = [
      '/',
      '/cosplayers',
      '/services',
      '/my-bookings',
      '/customer-profile',
      '/notifications',
      '/messages',
      '/settings'
    ];
    
    return customerRoutes.includes(path) || 
           path.startsWith('/cosplayer/') || 
           path.startsWith('/customer-profile/') ||
           path.startsWith('/booking/');
  }
  
  // Cosplayer-specific routes
  if (userType === 'Cosplayer') {
    const cosplayerRoutes = [
      '/',
      '/cosplayers',
      '/profile',
      '/manage-services',
      '/schedule',
      '/earnings',
      '/notifications',
      '/messages',
      '/settings'
    ];
    
    return cosplayerRoutes.includes(path) || 
           path.startsWith('/profile/') ||
           path.startsWith('/customer-profile/');
  }
  
  return false;
};

/**
 * Get redirect path for unauthorized access
 * @param {Object} user - User object with userType/role
 * @param {string} attemptedPath - The path user tried to access
 * @returns {string} Redirect path
 */
export const getRedirectPath = (user, attemptedPath) => {
  if (!user) {
    return '/login';
  }
  
  // If user has permission, return the attempted path
  if (hasRoutePermission(user, attemptedPath)) {
    return attemptedPath;
  }
  
  // Otherwise, redirect to appropriate dashboard
  return getDashboardPath(user);
};

/**
 * Get user type display name in Vietnamese
 * @param {string} userType - User type/role
 * @returns {string} Display name
 */
export const getUserTypeDisplayName = (userType) => {
  switch (userType) {
    case 'Customer':
      return 'Khách hàng';
    case 'Cosplayer':
      return 'Cosplayer';
    case 'Admin':
      return 'Quản trị viên';
    default:
      return 'Người dùng';
  }
};

/**
 * Get user type emoji
 * @param {string} userType - User type/role
 * @returns {string} Emoji
 */
export const getUserTypeEmoji = (userType) => {
  switch (userType) {
    case 'Customer':
      return '👤';
    case 'Cosplayer':
      return '🎭';
    case 'Admin':
      return '👨‍💼';
    default:
      return '👤';
  }
};

/**
 * Check if current user can view another user's profile
 * @param {Object} currentUser - Current logged-in user
 * @param {Object} targetUser - Target user whose profile is being viewed
 * @returns {boolean} Whether current user can view target user's profile
 */
export const canViewProfile = (currentUser, targetUser) => {
  // Public profiles (cosplayers) can be viewed by anyone
  if (targetUser?.userType === 'Cosplayer') {
    return true;
  }
  
  // Customer profiles can only be viewed by the owner or admin
  if (targetUser?.userType === 'Customer') {
    if (!currentUser) return false;
    if (currentUser.userType === 'Admin') return true;
    return currentUser.id === targetUser.id;
  }
  
  return false;
};

/**
 * Get appropriate welcome message based on user role
 * @param {Object} user - User object
 * @param {string} context - Context (login, signup, etc.)
 * @returns {string} Welcome message
 */
export const getWelcomeMessage = (user, context = 'login') => {
  const name = user?.firstName || 'Người dùng';
  const userType = user?.userType || user?.role;
  
  if (context === 'login') {
    switch (userType) {
      case 'Customer':
        return `Chào mừng trở lại, ${name}! Sẵn sàng khám phá thế giới cosplay chưa?`;
      case 'Cosplayer':
        return `Chào mừng trở lại, ${name}! Hôm nay bạn sẽ mang đến những trải nghiệm tuyệt vời nào?`;
      case 'Admin':
        return `Chào mừng trở lại, ${name}! Hệ thống đang chờ bạn quản lý.`;
      default:
        return `Chào mừng trở lại, ${name}!`;
    }
  }
  
  if (context === 'signup') {
    switch (userType) {
      case 'Customer':
        return `Chào mừng ${name} đến với CosplayDate! Hãy bắt đầu hành trình khám phá cosplay của bạn.`;
      case 'Cosplayer':
        return `Chào mừng ${name} đến với CosplayDate! Sẵn sàng chia sẻ tài năng cosplay của bạn chưa?`;
      default:
        return `Chào mừng ${name} đến với CosplayDate!`;
    }
  }
  
  return `Chào ${name}!`;
};

export default {
  getProfilePath,
  getOwnProfilePath,
  getDashboardPath,
  getRoleBasedNavigation,
  hasRoutePermission,
  getRedirectPath,
  getUserTypeDisplayName,
  getUserTypeEmoji,
  canViewProfile,
  getWelcomeMessage
};