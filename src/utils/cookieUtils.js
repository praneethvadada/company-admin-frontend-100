import Cookies from 'js-cookie';

const TOKEN_KEY = 'admin_token';
const USER_KEY = 'admin_user';
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: false, // Set to false for development (localhost)
  sameSite: 'lax',
  path: '/'
};

export const cookieUtils = {
  // Set authentication token
  setToken: (token) => {
    console.log('🍪 Setting token in cookies with options:', COOKIE_OPTIONS);
    console.log('🍪 Token to set:', token ? 'Present' : 'Missing');
    Cookies.set(TOKEN_KEY, token, COOKIE_OPTIONS);
    
    // Verify it was set
    const verifyToken = Cookies.get(TOKEN_KEY);
    console.log('🍪 Token verification after setting:', verifyToken ? 'Success' : 'Failed');
  },

  // Get authentication token
  getToken: () => {
    const token = Cookies.get(TOKEN_KEY);
    console.log('🍪 Getting token from cookies:', token ? 'Found' : 'Not found');
    if (token) {
      console.log('🍪 Token value:', token.substring(0, 20) + '...');
    }
    return token;
  },

  // Remove authentication token
  removeToken: () => {
    console.log('🍪 Removing token from cookies');
    Cookies.remove(TOKEN_KEY, { path: '/' });
    
    // Verify removal
    const verifyToken = Cookies.get(TOKEN_KEY);
    console.log('🍪 Token removal verification:', verifyToken ? 'Failed to remove' : 'Successfully removed');
  },

  // Set user data
  setUser: (userData) => {
    console.log('🍪 Setting user data in cookies:', userData);
    const userString = JSON.stringify(userData);
    Cookies.set(USER_KEY, userString, COOKIE_OPTIONS);
    
    // Verify it was set
    const verifyUser = Cookies.get(USER_KEY);
    console.log('🍪 User data verification after setting:', verifyUser ? 'Success' : 'Failed');
  },

  // Get user data
  getUser: () => {
    const userData = Cookies.get(USER_KEY);
    console.log('🍪 Getting user data from cookies:', userData ? 'Found' : 'Not found');
    if (userData) {
      try {
        const parsed = JSON.parse(userData);
        console.log('🍪 Parsed user data:', parsed);
        return parsed;
      } catch (error) {
        console.error('🍪 Error parsing user data from cookies:', error);
        return null;
      }
    }
    return null;
  },

  // Remove user data
  removeUser: () => {
    console.log('🍪 Removing user data from cookies');
    Cookies.remove(USER_KEY, { path: '/' });
  },

  // Clear all auth data
  clearAuth: () => {
    console.log('🍪 Clearing all auth data from cookies');
    cookieUtils.removeToken();
    cookieUtils.removeUser();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = cookieUtils.getToken();
    const user = cookieUtils.getUser();
    const isAuth = !!(token && user);
    console.log('🍪 Authentication check:', { 
      hasToken: !!token, 
      hasUser: !!user, 
      isAuthenticated: isAuth 
    });
    return isAuth;
  },

  // Debug function to list all cookies
  debugCookies: () => {
    const allCookies = Cookies.get();
    console.log('🍪 All cookies:', allCookies);
    return allCookies;
  }
};
