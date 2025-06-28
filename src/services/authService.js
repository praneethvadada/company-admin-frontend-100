// src/services/authService.js - REPLACE EXISTING (Hybrid Version)
import api from './api';
import { cookieUtils } from '../utils/cookieUtils';

export const authService = {
  // Login user
  login: (credentials) => {
    console.log('🔐 authService.login: Making login API call');
    return api.post('/auth/login', credentials);
  },

  // Register new user
  signup: (userData) => {
    console.log('📝 authService.signup: Making signup API call');
    return api.post('/auth/signup', userData);
  },

  // Step 1: Request password reset OTP
  forgotPassword: (email) => {
    console.log('🔑 authService.forgotPassword: Making forgot password API call');
    return api.post('/auth/forgot-password', { email });
  },

  // Step 2: Reset password with OTP
  resetPassword: (resetData) => {
    console.log('🔄 authService.resetPassword: Making reset password API call');
    console.log('📦 Reset password data:', {
      token: resetData.token ? 'Present' : 'Missing',
      otp: resetData.otp ? 'Present' : 'Missing',
      newPassword: resetData.newPassword ? 'Present' : 'Missing',
      confirmPassword: resetData.confirmPassword ? 'Present' : 'Missing'
    });
    return api.post('/auth/reset-password', {
      token: resetData.token,
      otp: resetData.otp,
      newPassword: resetData.newPassword,
      confirmPassword: resetData.confirmPassword
    });
  },

  // Step 1: Request password change (sends OTP) - Exact API match
  changePassword: (passwordData) => {
    console.log('🔐 authService.changePassword: Step 1 - Requesting password change with OTP');
    console.log('📦 Request data being sent to /auth/change-password:', {
      currentPassword: passwordData.currentPassword ? 'Present' : 'Missing',
      newPassword: passwordData.newPassword ? 'Present' : 'Missing',
      confirmPassword: passwordData.confirmPassword ? 'Present' : 'Missing'
    });
    const requestBody = {
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
      confirmPassword: passwordData.confirmPassword
    };
    console.log('📤 Exact request body:', JSON.stringify(requestBody, null, 2));
    return api.post('/auth/change-password', requestBody);
  },

  // Step 2: Verify OTP and complete password change - Exact API match
  verifyPasswordChangeOTP: (otpData) => {
    console.log('🔐 authService.verifyPasswordChangeOTP: Step 2 - Verifying OTP');
    console.log('📦 OTP verification data received in authService:', {
      token: otpData.token ? 'Present' : 'Missing',
      tokenValue: otpData.token,
      tokenType: typeof otpData.token,
      tokenLength: otpData.token ? otpData.token.length : 0,
      otp: otpData.otp ? 'Present' : 'Missing',
      otpValue: otpData.otp,
      otpType: typeof otpData.otp
    });
    // Exact API structure as specified
    const requestBody = {
      token: otpData.token,
      otp: otpData.otp
    };
    console.log('📤 Final request body for /auth/verify-password-change:');
    console.log('📤 Request body object:', requestBody);
    console.log('📤 Request body JSON:', JSON.stringify(requestBody, null, 2));
    return api.post('/auth/verify-password-change', requestBody);
  },

  // Logout user (FIXED VERSION)
  logout: async () => {
    console.log('🚪 authService.logout: Making logout API call');
    try {
      const response = await api.post('/auth/logout');
      console.log('✅ Logout API call successful');
      return response;
    } catch (error) {
      console.error('❌ Logout API call failed:', error);
      throw error;
    } finally {
      // Always clean up regardless of API success/failure
      console.log('🧹 Cleaning up auth data...');
      authService.removeAuthToken();
      cookieUtils.clearAuth();
    }
  },

  // Set auth token in headers
  setAuthToken: (token) => {
    console.log('🔑 authService.setAuthToken: Setting auth token in API headers');
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  },

  // Remove auth token from headers
  removeAuthToken: () => {
    console.log('🗑️ authService.removeAuthToken: Removing auth token from API headers');
    delete api.defaults.headers.common['Authorization'];
  },

  // Profile management
  getProfile: () => {
    console.log('👤 authService.getProfile: Making get profile API call');
    return api.get('/auth/profile');
  },

  // Dashboard API calls
  getDashboardStats: () => {
    console.log('📊 authService.getDashboardStats: Making dashboard stats API call');
    return api.get('/admin/dashboard/stats');
  },

  getRecentActivity: () => {
    console.log('📋 authService.getRecentActivity: Making recent activity API call');
    return api.get('/admin/dashboard/recent-activity');
  },

  getAnalytics: (period = 30) => {
    console.log('📈 authService.getAnalytics: Making analytics API call');
    return api.get(`/admin/dashboard/analytics?period=${period}`);
  },

  // Domain management
  getDomains: (params = {}) => {
    console.log('📁 authService.getDomains: Making get domains API call');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/admin/domains?${queryString}` : '/admin/domains';
    return api.get(url);
  },

  createDomain: (data) => {
    console.log('📁 authService.createDomain: Making create domain API call');
    return api.post('/admin/domains', data);
  },

  updateDomain: (id, data) => {
    console.log('📁 authService.updateDomain: Making update domain API call');
    return api.put(`/admin/domains/${id}`, data);
  },

  deleteDomain: (id) => {
    console.log('📁 authService.deleteDomain: Making delete domain API call');
    return api.delete(`/admin/domains/${id}`);
  },

  getDomainHierarchy: (id) => {
    console.log('🌳 authService.getDomainHierarchy: Making get domain hierarchy API call');
    return api.get(`/admin/domains/${id}/hierarchy`);
  },

  // SubDomain management
  getSubDomains: (params = {}) => {
    console.log('📂 authService.getSubDomains: Making get sub-domains API call');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/admin/subdomains?${queryString}` : '/admin/subdomains';
    return api.get(url);
  },

  createSubDomain: (data) => {
    console.log('📂 authService.createSubDomain: Making create sub-domain API call');
    return api.post('/admin/subdomains', data);
  },

  updateSubDomain: (id, data) => {
    console.log('📂 authService.updateSubDomain: Making update sub-domain API call');
    return api.put(`/admin/subdomains/${id}`, data);
  },

  deleteSubDomain: (id) => {
    console.log('📂 authService.deleteSubDomain: Making delete sub-domain API call');
    return api.delete(`/admin/subdomains/${id}`);
  },

  getLeafSubDomains: (domainId) => {
    console.log('🍃 authService.getLeafSubDomains: Making get leaf sub-domains API call');
    return api.get(`/admin/subdomains/leafs?domainId=${domainId}`);
  },

  // Project management
  getProjects: (params = {}) => {
    console.log('📋 authService.getProjects: Making get projects API call');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/admin/projects?${queryString}` : '/admin/projects';
    return api.get(url);
  },

  createProject: (data) => {
    console.log('📋 authService.createProject: Making create project API call');
    return api.post('/admin/projects', data);
  },

  updateProject: (id, data) => {
    console.log('📋 authService.updateProject: Making update project API call');
    return api.put(`/admin/projects/${id}`, data);
  },

  deleteProject: (id) => {
    console.log('📋 authService.deleteProject: Making delete project API call');
    return api.delete(`/admin/projects/${id}`);
  },

  moveProject: (id, data) => {
    console.log('📋 authService.moveProject: Making move project API call');
    return api.put(`/admin/projects/${id}/move`, data);
  },

  archiveProject: (id, data) => {
    console.log('📋 authService.archiveProject: Making archive project API call');
    return api.put(`/admin/projects/${id}/archive`, data);
  },

  // Leads management
  getLeads: (params = {}) => {
    console.log('👥 authService.getLeads: Making get leads API call');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/admin/leads?${queryString}` : '/admin/leads';
    return api.get(url);
  },

  updateLead: (id, data) => {
    console.log('👥 authService.updateLead: Making update lead API call');
    return api.put(`/admin/leads/${id}`, data);
  },

  exportLeads: (params = {}) => {
    console.log('💾 authService.exportLeads: Making export leads API call');
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `/admin/leads/export/csv?${queryString}` : '/admin/leads/export/csv';
    return api.get(url, { responseType: 'blob' });
  },

  // Image management
  uploadImages: (formData) => {
    console.log('🖼️ authService.uploadImages: Making upload images API call');
    return api.post('/admin/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  updateImage: (id, data) => {
    console.log('🖼️ authService.updateImage: Making update image API call');
    return api.put(`/admin/images/${id}`, data);
  },

  deleteImage: (id) => {
    console.log('🖼️ authService.deleteImage: Making delete image API call');
    return api.delete(`/admin/images/${id}`);
  },

  reorderImages: (data) => {
    console.log('🖼️ authService.reorderImages: Making reorder images API call');
    return api.put('/admin/images/reorder', data);
  }
};


// // old code
// import api from './api';

// export const authService = {
//   // Login user
//   login: (credentials) => {
//     console.log('🔐 authService.login: Making login API call');
//     return api.post('/auth/login', credentials);
//   },

//   // Register new user
//   signup: (userData) => {
//     console.log('📝 authService.signup: Making signup API call');
//     return api.post('/auth/signup', userData);
//   },

//   // Step 1: Request password reset OTP
//   forgotPassword: (email) => {
//     console.log('🔑 authService.forgotPassword: Making forgot password API call');
//     return api.post('/auth/forgot-password', { email });
//   },

//   // Step 2: Reset password with OTP
//   resetPassword: (resetData) => {
//     console.log('🔄 authService.resetPassword: Making reset password API call');
//     console.log('📦 Reset password data:', {
//       token: resetData.token ? 'Present' : 'Missing',
//       otp: resetData.otp ? 'Present' : 'Missing',
//       newPassword: resetData.newPassword ? 'Present' : 'Missing',
//       confirmPassword: resetData.confirmPassword ? 'Present' : 'Missing'
//     });
    
//     return api.post('/auth/reset-password', {
//       token: resetData.token,
//       otp: resetData.otp,
//       newPassword: resetData.newPassword,
//       confirmPassword: resetData.confirmPassword
//     });
//   },

//   // Step 1: Request password change (sends OTP) - Exact API match
//   changePassword: (passwordData) => {
//     console.log('🔐 authService.changePassword: Step 1 - Requesting password change with OTP');
//     console.log('📦 Request data being sent to /auth/change-password:', {
//       currentPassword: passwordData.currentPassword ? 'Present' : 'Missing',
//       newPassword: passwordData.newPassword ? 'Present' : 'Missing',
//       confirmPassword: passwordData.confirmPassword ? 'Present' : 'Missing'
//     });
    
//     const requestBody = {
//       currentPassword: passwordData.currentPassword,
//       newPassword: passwordData.newPassword,
//       confirmPassword: passwordData.confirmPassword
//     };
    
//     console.log('📤 Exact request body:', JSON.stringify(requestBody, null, 2));
    
//     return api.post('/auth/change-password', requestBody);
//   },

//   // Step 2: Verify OTP and complete password change - Exact API match
//   verifyPasswordChangeOTP: (otpData) => {
//     console.log('🔐 authService.verifyPasswordChangeOTP: Step 2 - Verifying OTP');
//     console.log('📦 OTP verification data received in authService:', {
//       token: otpData.token ? 'Present' : 'Missing',
//       tokenValue: otpData.token,
//       tokenType: typeof otpData.token,
//       tokenLength: otpData.token ? otpData.token.length : 0,
//       otp: otpData.otp ? 'Present' : 'Missing',
//       otpValue: otpData.otp,
//       otpType: typeof otpData.otp
//     });
    
//     // Exact API structure as specified
//     const requestBody = {
//       token: otpData.token,
//       otp: otpData.otp
//     };
    
//     console.log('📤 Final request body for /auth/verify-password-change:');
//     console.log('📤 Request body object:', requestBody);
//     console.log('📤 Request body JSON:', JSON.stringify(requestBody, null, 2));
    
//     return api.post('/auth/verify-password-change', requestBody);
//   },

//   // Logout user
//   logout: () => {
//     console.log('🚪 authService.logout: Making logout API call');
//     return api.post('/auth/logout');
//   },

//   // Set auth token in headers
//   setAuthToken: (token) => {
//     console.log('🔑 authService.setAuthToken: Setting auth token in API headers');
//     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//   },

//   // Remove auth token from headers
//   removeAuthToken: () => {
//     console.log('🗑️ authService.removeAuthToken: Removing auth token from API headers');
//     delete api.defaults.headers.common['Authorization'];
//   },

//   // Dashboard API calls
//   getDashboardStats: () => {
//     console.log('📊 authService.getDashboardStats: Making dashboard stats API call');
//     return api.get('/admin/dashboard/stats');
//   },

//   // Domain management
//   getDomains: () => {
//     console.log('📁 authService.getDomains: Making get domains API call');
//     return api.get('/admin/domains');
//   },

//   // Project management
//   getProjects: () => {
//     console.log('📋 authService.getProjects: Making get projects API call');
//     return api.get('/admin/projects');
//   },

//   // Leads management
//   getLeads: () => {
//     console.log('👥 authService.getLeads: Making get leads API call');
//     return api.get('/admin/leads');
//   }
// };
