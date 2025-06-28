// src/services/api.js - FIXED VERSION
import axios from 'axios';

// Ensure we have a valid base URL
const getApiBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const fallbackUrl = 'http://localhost:5001/api';
  
  console.log('🔍 Environment API URL:', envUrl);
  console.log('🔍 Fallback API URL:', fallbackUrl);
  
  // Use environment variable if it exists and is valid, otherwise use fallback
  const baseUrl = envUrl && envUrl.trim() !== '' ? envUrl : fallbackUrl;
  console.log('🌐 Using API Base URL:', baseUrl);
  
  return baseUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Validate the URL before creating axios instance
try {
  new URL(API_BASE_URL);
  console.log('✅ API Base URL is valid:', API_BASE_URL);
} catch (error) {
  console.error('❌ Invalid API Base URL:', API_BASE_URL, error);
  throw new Error(`Invalid API Base URL: ${API_BASE_URL}`);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    console.log('📦 Request config:', {
      baseURL: config.baseURL,
      url: config.url,
      method: config.method,
      headers: config.headers
    });
    // Token is already set in headers via authService.setAuthToken()
    return config;
  },
  (error) => {
    console.error('🌐 API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    console.log('❌ API Error Details:', {
      message: error.message,
      code: error.code,
      config: {
        method: error.config?.method,
        baseURL: error.config?.baseURL,
        url: error.config?.url,
        fullUrl: error.config?.baseURL + error.config?.url
      },
      response: {
        status: error.response?.status,
        data: error.response?.data
      }
    });

    console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });

    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      console.log('🚪 Unauthorized access detected, redirecting to login...');
      // Don't auto-redirect here, let the authService handle it
    }

    return Promise.reject(error);
  }
);

export default api;


// // src/services/api.js - CREATE THIS FILE
// import axios from 'axios';

// const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// const api = axios.create({
//   baseURL: API_BASE_URL,
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor to add auth token
// api.interceptors.request.use(
//   (config) => {
//     console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
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


// // import axios from 'axios';
// // import { cookieUtils } from '../utils/cookieUtils';

// // const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// // console.log('🌐 API Base URL:', API_BASE_URL);

// // const api = axios.create({
// //   baseURL: API_BASE_URL,
// //   headers: {
// //     'Content-Type': 'application/json',
// //   },
// //   timeout: 10000, // 10 seconds timeout
// // });

// // // Request interceptor to add auth token and log requests
// // api.interceptors.request.use(
// //   (config) => {
// //     console.log('📤 API Request:', {
// //       method: config.method?.toUpperCase(),
// //       url: config.url,
// //       baseURL: config.baseURL,
// //       fullURL: `${config.baseURL}${config.url}`,
// //       headers: config.headers,
// //       data: config.data
// //     });
    
// //     // Get token from cookies
// //     const token = cookieUtils.getToken();
// //     if (token) {
// //       config.headers.Authorization = `Bearer ${token}`;
// //       console.log('🔑 Added Authorization header from cookies');
// //     } else {
// //       console.log('⚠️ No auth token found in cookies');
// //     }
    
// //     return config;
// //   },
// //   (error) => {
// //     console.error('❌ API Request Error:', error);
// //     return Promise.reject(error);
// //   }
// // );

// // // Response interceptor to handle auth errors and log responses
// // api.interceptors.response.use(
// //   (response) => {
// //     console.log('📥 API Response Success:', {
// //       status: response.status,
// //       statusText: response.statusText,
// //       url: response.config.url,
// //       headers: response.headers,
// //       data: response.data,
// //       dataType: typeof response.data,
// //       dataKeys: typeof response.data === 'object' ? Object.keys(response.data) : 'Not an object'
// //     });
// //     return response;
// //   },
// //   (error) => {
// //     console.error('❌ API Response Error:', {
// //       status: error.response?.status,
// //       statusText: error.response?.statusText,
// //       url: error.config?.url,
// //       message: error.message,
// //       data: error.response?.data
// //     });
    
// //     if (error.response?.status === 401) {
// //       console.log('🚨 401 Unauthorized - Clearing auth data and redirecting to login');
// //       cookieUtils.clearAuth();
      
// //       // Only redirect if not already on login page
// //       if (window.location.pathname !== '/login') {
// //         window.location.href = '/login';
// //       }
// //     }
    
// //     return Promise.reject(error);
// //   }
// // );

// // export default api;
