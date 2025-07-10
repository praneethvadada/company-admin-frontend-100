// src/services/api.js - IMPROVED VERSION
import axios from 'axios';

// ✅ IMPROVED: More robust URL validation and environment handling
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const fallbackUrl = 'http://localhost:5001/api';
  
  console.log('🔍 Environment API URL:', envUrl);
  console.log('🔍 Fallback API URL:', fallbackUrl);
  
  // ✅ IMPROVED: Better validation for environment URL
  if (envUrl && envUrl.trim() !== '' && envUrl !== 'undefined') {
    try {
      new URL(envUrl);
      console.log('✅ Using environment API URL:', envUrl);
      return envUrl;
    } catch (error) {
      console.warn('⚠️ Invalid environment API URL, using fallback:', envUrl);
    }
  }
  
  console.log('🌐 Using fallback API Base URL:', fallbackUrl);
  return fallbackUrl;
};

const API_BASE_URL = getApiBaseUrl();

// ✅ IMPROVED: Better error handling for URL validation
try {
  new URL(API_BASE_URL);
  console.log('✅ API Base URL is valid:', API_BASE_URL);
} catch (error) {
  console.error('❌ Invalid API Base URL:', API_BASE_URL, error);
  throw new Error(`Invalid API Base URL: ${API_BASE_URL}`);
}

// ✅ IMPROVED: Enhanced axios configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // ✅ IMPROVED: Increased timeout to 15 seconds
  // ✅ NEW: Add retry configuration
  retry: 3,
  retryDelay: 1000,
});

// ✅ IMPROVED: Enhanced request interceptor with better token handling
api.interceptors.request.use(
  (config) => {
    // ✅ IMPROVED: Less verbose logging in production
    if (process.env.NODE_ENV === 'development') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }
    
    // ✅ IMPROVED: Get token from localStorage directly (more reliable)
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // ✅ NEW: Add request timestamp for debugging
    config.metadata = { requestStartTime: Date.now() };
    
    return config;
  },
  (error) => {
    console.error('🌐 API Request Error:', error);
    return Promise.reject(error);
  }
);

// ✅ IMPROVED: Enhanced response interceptor with better error handling and retry logic
api.interceptors.response.use(
  (response) => {
    // ✅ IMPROVED: Calculate response time
    const responseTime = Date.now() - response.config.metadata?.requestStartTime;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status} (${responseTime}ms)`);
    }
    
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // ✅ IMPROVED: Better error logging
    if (process.env.NODE_ENV === 'development') {
      console.log('❌ API Error Details:', {
        message: error.message,
        code: error.code,
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    // ✅ NEW: Implement retry logic for network errors
    if (
      error.code === 'NETWORK_ERROR' || 
      error.code === 'ECONNABORTED' ||
      (error.response?.status >= 500 && error.response?.status < 600)
    ) {
      originalRequest._retryCount = originalRequest._retryCount || 0;
      
      if (originalRequest._retryCount < api.defaults.retry) {
        originalRequest._retryCount++;
        console.log(`🔄 Retrying request (${originalRequest._retryCount}/${api.defaults.retry}): ${originalRequest.method?.toUpperCase()} ${originalRequest.url}`);
        
        // ✅ NEW: Exponential backoff delay
        const delay = api.defaults.retryDelay * Math.pow(2, originalRequest._retryCount - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return api(originalRequest);
      }
    }
    
    // ✅ IMPROVED: Better 401 handling
    if (error.response?.status === 401) {
      console.log('🚪 Unauthorized access detected');
      
      // ✅ IMPROVED: Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // ✅ NEW: Show user-friendly message
        console.log('🚪 Redirecting to login due to expired session');
        
        // ✅ IMPROVED: Use replace to prevent back navigation to protected page
        window.location.replace('/login');
      }
    }
    
    // ✅ NEW: Handle network errors with user-friendly messages
    if (error.code === 'NETWORK_ERROR') {
      error.userMessage = 'Network error. Please check your internet connection and try again.';
    } else if (error.code === 'ECONNABORTED') {
      error.userMessage = 'Request timeout. Please try again.';
    } else if (error.response?.status === 404) {
      error.userMessage = 'The requested resource was not found.';
    } else if (error.response?.status === 403) {
      error.userMessage = 'You do not have permission to access this resource.';
    } else if (error.response?.status >= 500) {
      error.userMessage = 'Server error. Please try again later.';
    }
    
    return Promise.reject(error);
  }
);

// ✅ NEW: Add request/response interceptor for debugging in development
if (process.env.NODE_ENV === 'development') {
  api.interceptors.request.use(
    (config) => {
      console.group(`🌐 ${config.method?.toUpperCase()} ${config.url}`);
      console.log('📤 Request Config:', {
        baseURL: config.baseURL,
        url: config.url,
        method: config.method,
        headers: config.headers,
        data: config.data
      });
      console.groupEnd();
      return config;
    }
  );
  
  api.interceptors.response.use(
    (response) => {
      console.group(`✅ ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
      console.log('📥 Response Data:', response.data);
      console.groupEnd();
      return response;
    },
    (error) => {
      console.group(`❌ ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`);
      console.log('📥 Error Response:', error.response?.data);
      console.log('📥 Error Message:', error.message);
      console.groupEnd();
      return Promise.reject(error);
    }
  );
}

// ✅ NEW: Add helper methods for common API patterns
api.helpers = {
  // Helper for handling paginated requests
  getPaginated: async (url, params = {}) => {
    const response = await api.get(url, { params });
    return {
      data: response.data?.data || response.data,
      pagination: response.data?.pagination,
      total: response.data?.total || response.data?.pagination?.totalItems
    };
  },
  
  // Helper for handling file uploads
  uploadFile: async (url, file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
  },
  
  // Helper for downloading files
  downloadFile: async (url, filename) => {
    const response = await api.get(url, {
      responseType: 'blob',
    });
    
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }
};

// ✅ NEW: Add connection test method
api.testConnection = async () => {
  try {
    console.log('🔍 Testing API connection...');
    const response = await api.get('/health');
    console.log('✅ API connection successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API connection failed:', error.message);
    return false;
  }
};

// ✅ NEW: Export both the api instance and helper functions
export default api;

// ✅ NEW: Export helper functions separately for convenience
export const { getPaginated, uploadFile, downloadFile } = api.helpers;
export const testConnection = api.testConnection;


// // src/services/api.js - FIXED VERSION
// import axios from 'axios';

// // Ensure we have a valid base URL
// const getApiBaseUrl = () => {
//   const envUrl = process.env.REACT_APP_API_URL;
//   const fallbackUrl = 'http://localhost:5001/api';
  
//   console.log('🔍 Environment API URL:', envUrl);
//   console.log('🔍 Fallback API URL:', fallbackUrl);
  
//   // Use environment variable if it exists and is valid, otherwise use fallback
//   const baseUrl = envUrl && envUrl.trim() !== '' ? envUrl : fallbackUrl;
//   console.log('🌐 Using API Base URL:', baseUrl);
  
//   return baseUrl;
// };

// const API_BASE_URL = getApiBaseUrl();

// // Validate the URL before creating axios instance
// try {
//   new URL(API_BASE_URL);
//   console.log('✅ API Base URL is valid:', API_BASE_URL);
// } catch (error) {
//   console.error('❌ Invalid API Base URL:', API_BASE_URL, error);
//   throw new Error(`Invalid API Base URL: ${API_BASE_URL}`);
// }

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
//   timeout: 10000, // 10 second timeout
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
//     console.log('📦 Request config:', {
//       baseURL: config.baseURL,
//       url: config.url,
//       method: config.method,
//       headers: config.headers
//     });
//     // Token is already set in headers via authService.setAuthToken()
//     return config;
//   },
//   (error) => {
//     console.error('🌐 API Request Error:', error);
//     return Promise.reject(error);
//   }
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => {
//     console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
//     return response;
//   },
//   (error) => {
//     console.log('❌ API Error Details:', {
//       message: error.message,
//       code: error.code,
//       config: {
//         method: error.config?.method,
//         baseURL: error.config?.baseURL,
//         url: error.config?.url,
//         fullUrl: error.config?.baseURL + error.config?.url
//       },
//       response: {
//         status: error.response?.status,
//         data: error.response?.data
//       }
//     });

//     console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, {
//       status: error.response?.status,
//       data: error.response?.data,
//       message: error.message
//     });

//     // Handle 401 unauthorized errors
//     if (error.response?.status === 401) {
//       console.log('🚪 Unauthorized access detected, redirecting to login...');
//       // Don't auto-redirect here, let the authService handle it
//     }

//     return Promise.reject(error);
//   }
// );

// export default api;


// // // src/services/api.js - CREATE THIS FILE
// // import axios from 'axios';

// // const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// // });

// // // Request interceptor to add auth token
// // api.interceptors.request.use(
// //   (config) => {
// //     console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
// //     // Token is already set in headers via authService.setAuthToken()
// //     return config;
// //   },
// //   (error) => {
// //     console.error('🌐 API Request Error:', error);
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor for error handling
// // api.interceptors.response.use(
// //   (response) => {
// //     console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
// //     return response;
// //   },
// //   (error) => {
// //     console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, {
// //       status: error.response?.status,
// //       data: error.response?.data,
// //       message: error.message
// //     });
    
// //     // Handle 401 unauthorized errors
// //     if (error.response?.status === 401) {
// //       console.log('🚪 Unauthorized access detected, redirecting to login...');
// //       // Don't auto-redirect here, let the authService handle it
// //     }
    
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;


// // // import axios from 'axios';
// // // import { cookieUtils } from '../utils/cookieUtils';

// // // const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// // // console.log('🌐 API Base URL:', API_BASE_URL);

// // // const api = axios.create({
// // //   baseURL: API_BASE_URL,
// // //   headers: {
// // //     'Content-Type': 'application/json',
// // //   },
// // //   timeout: 10000, // 10 seconds timeout
// // // });

// // // // Request interceptor to add auth token and log requests
// // // api.interceptors.request.use(
// // //   (config) => {
// // //     console.log('📤 API Request:', {
// // //       method: config.method?.toUpperCase(),
// // //       url: config.url,
// // //       baseURL: config.baseURL,
// // //       fullURL: `${config.baseURL}${config.url}`,
// // //       headers: config.headers,
// // //       data: config.data
// // //     });
    
// // //     // Get token from cookies
// // //     const token = cookieUtils.getToken();
// // //     if (token) {
// // //       config.headers.Authorization = `Bearer ${token}`;
// // //       console.log('🔑 Added Authorization header from cookies');
// // //     } else {
// // //       console.log('⚠️ No auth token found in cookies');
// // //     }
    
// // //     return config;
// // //   },
// // //   (error) => {
// // //     console.error('❌ API Request Error:', error);
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // // Response interceptor to handle auth errors and log responses
// // // api.interceptors.response.use(
// // //   (response) => {
// // //     console.log('📥 API Response Success:', {
// // //       status: response.status,
// // //       statusText: response.statusText,
// // //       url: response.config.url,
// // //       headers: response.headers,
// // //       data: response.data,
// // //       dataType: typeof response.data,
// // //       dataKeys: typeof response.data === 'object' ? Object.keys(response.data) : 'Not an object'
// // //     });
// // //     return response;
// // //   },
// // //   (error) => {
// // //     console.error('❌ API Response Error:', {
// // //       status: error.response?.status,
// // //       statusText: error.response?.statusText,
// // //       url: error.config?.url,
// // //       message: error.message,
// // //       data: error.response?.data
// // //     });
    
// // //     if (error.response?.status === 401) {
// // //       console.log('🚨 401 Unauthorized - Clearing auth data and redirecting to login');
// // //       cookieUtils.clearAuth();
      
// // //       // Only redirect if not already on login page
// // //       if (window.location.pathname !== '/login') {
// // //         window.location.href = '/login';
// // //       }
// // //     }
    
// // //     return Promise.reject(error);
// // //   }
// // // );

// // // export default api;
