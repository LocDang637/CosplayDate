// src/utils/navigationUtils.js - FIXED VERSION
/**
 * Get the appropriate profile path based on user role
 * @param {Object} user - User object with userType/role
 * @returns {string} Profile path
 */
export const getProfilePath = (user) => {
  if (!user) {
    console.warn('No user provided');
    return '/login';
  }
  
  // FIX: Handle both id and userId fields and ensure they exist
  const userId = user.id || user.userId;
  if (!userId) {
    console.warn('No user ID found in user object:', user);
    return '/login';
  }
  
  const userType = user.userType || user.role; // Support both possible field names
  
  // console.log('🔍 getProfilePath Debug:', {
  //   userId: userId,
  //   userType: userType,
  //   originalUser: user
  // });
  
  switch (userType) {
    case 'Customer':
      return `/customer-profile/${userId}`;
    case 'Cosplayer':
      // FIX: Always use /profile for cosplayers (not /cosplayer)
      return `/profile/${userId}`;
    default:
      // Fallback based on user properties or default to customer
      console.warn('Unknown user type:', userType, 'Defaulting to customer profile');
      return `/customer-profile/${userId}`;
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
  const userId = user.id || user.userId;
  
  // FIX: For own profile, always include user ID for consistency
  switch (userType) {
    case 'Customer':
      return userId ? `/customer-profile/${userId}` : '/customer-profile';
    case 'Cosplayer':
      return userId ? `/profile/${userId}` : '/profile';
    default:
      console.warn('Unknown user type:', userType, 'Defaulting to customer profile');
      return userId ? `/customer-profile/${userId}` : '/customer-profile';
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
    
    // FIX: Handle both id and userId fields for comparison
    const currentUserId = currentUser.id || currentUser.userId;
    const targetUserId = targetUser.id || targetUser.userId;
    
    return currentUserId && targetUserId && 
           parseInt(currentUserId) === parseInt(targetUserId);
  }
  
  return false;
};

/**
 * Helper function to normalize user ID
 * @param {Object} user - User object
 * @returns {number|null} Normalized user ID
 */
export const getUserId = (user) => {
  if (!user) return null;
  
  const userId = user.id || user.userId;
  return userId ? parseInt(userId) : null;
};

/**
 * Helper function to check if two users are the same
 * @param {Object} user1 - First user object
 * @param {Object} user2 - Second user object
 * @returns {boolean} Whether users are the same
 */
export const isSameUser = (user1, user2) => {
  if (!user1 || !user2) return false;
  
  const id1 = getUserId(user1);
  const id2 = getUserId(user2);
  
  return id1 && id2 && id1 === id2;
};

// FIX: Add function to get correct profile route based on current URL and user type
export const getCorrectProfileRoute = (user, currentPath) => {
  if (!user) return '/login';
  
  const userType = user.userType || user.role;
  const userId = user.id || user.userId;
  
  // If user is on wrong profile type route, redirect to correct one
  if (userType === 'Customer' && currentPath.startsWith('/profile/')) {
    return `/customer-profile/${userId}`;
  }
  
  if (userType === 'Cosplayer' && currentPath.startsWith('/customer-profile/')) {
    return `/profile/${userId}`;
  }
  
  // Return appropriate profile path
  return getProfilePath(user);
};

// FIX: Update existing functions to use the new helper
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
      '/settings',
      '/cosplayer-policy' // Allow cosplayers to view policy
    ];
    
    return cosplayerRoutes.includes(path) || 
           path.startsWith('/profile/') ||
           path.startsWith('/customer-profile/') ||
           path.startsWith('/cosplayer/'); // Allow viewing other cosplayers
  }
  
  return false;
};

export const getRedirectPath = (user, attemptedPath) => {
  if (!user) {
    return '/login';
  }
  
  // If user has permission, return the attempted path
  if (hasRoutePermission(user, attemptedPath)) {
    return attemptedPath;
  }
  
  // FIX: Check if user is on wrong profile type and redirect to correct one
  const correctRoute = getCorrectProfileRoute(user, attemptedPath);
  if (correctRoute !== attemptedPath) {
    return correctRoute;
  }
  
  // Otherwise, redirect to appropriate dashboard
  return getDashboardPath(user);
};

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

// FIX: Add helper to validate profile route match
export const isValidProfileRoute = (user, currentPath) => {
  if (!user) return false;
  
  const userType = user.userType || user.role;
  const userId = user.id || user.userId;
  
  // Check if current path matches user type
  if (userType === 'Customer' && currentPath.startsWith('/customer-profile/')) {
    return true;
  }
  
  if (userType === 'Cosplayer' && currentPath.startsWith('/profile/')) {
    return true;
  }
  
  return false;
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
  getWelcomeMessage,
  getUserId,
  isSameUser,
  getCorrectProfileRoute,
  isValidProfileRoute
};