export const parseJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse JWT:', e);
    return null;
  }
};

export const debugToken = () => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (!token) {
    // console.log('❌ No token found in localStorage');
    return null;
  }
  
  const claims = parseJwt(token);
  
  // console.log('🔍 Token Debug Info:');
  // console.log('Token exists:', !!token);
  // console.log('Token preview:', token.substring(0, 50) + '...');
  // console.log('\n📋 Token Claims:', claims);
  // console.log('UserType in token:', claims?.UserType);
  // console.log('IsVerified in token:', claims?.IsVerified);
  // console.log('Email in token:', claims?.email);
  // console.log('Token issued at:', claims?.iat ? new Date(claims.iat * 1000) : 'Unknown');
  // console.log('Token expires at:', claims?.exp ? new Date(claims.exp * 1000) : 'Unknown');
  
  // console.log('\n👤 User in localStorage:');
  // console.log('UserType in localStorage:', user.userType);
  // console.log('IsVerified in localStorage:', user.isVerified);
  
  // Check for mismatches
  if (claims?.UserType !== user.userType) {
    // console.warn('⚠️ MISMATCH: Token UserType differs from localStorage!');
    // console.warn('This means the user data changed but token wasn\'t refreshed.');
    // console.warn('Solution: User needs to log in again.');
  }
  
  return claims;
};

// Export a function to check if token has correct claims for cosplayer
export const hasValidCosplayerToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  
  const claims = parseJwt(token);
  return claims?.UserType === 'Cosplayer' && claims?.IsVerified === 'True';
};