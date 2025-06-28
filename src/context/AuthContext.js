import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { cookieUtils } from '../utils/cookieUtils';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const initializeAuth = useCallback(async () => {
    console.log('🔍 AuthContext: Starting authentication initialization');
    
    try {
      cookieUtils.debugCookies();
      
      const token = cookieUtils.getToken();
      const userData = cookieUtils.getUser();
      
      console.log('📦 Auth data check:', { 
        hasToken: !!token, 
        hasUserData: !!userData,
        tokenLength: token ? token.length : 0,
        userDataKeys: userData ? Object.keys(userData) : []
      });
      
      if (token && userData) {
        console.log('✅ AuthContext: Found auth data in cookies, setting authenticated state');
        authService.setAuthToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ AuthContext: User authenticated from cookies:', userData);
      } else {
        console.log('❌ AuthContext: No valid auth data found in cookies');
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('❌ AuthContext: Error initializing auth:', error);
      setUser(null);
      setIsAuthenticated(false);
    }
    
    console.log('🔄 AuthContext: Setting loading to false');
    setLoading(false);
  }, []);

  useEffect(() => {
    console.log('🔄 AuthProvider: Component mounted, initializing authentication');
    initializeAuth();
  }, [initializeAuth]);

  const login = async (credentials) => {
    console.log('🔐 AuthContext: Login attempt started');
    
    try {
      const response = await authService.login(credentials);
      console.log('✅ Login API Response - Full Structure:', response);
      console.log('✅ Response.data:', response.data);
      console.log('✅ Response.data keys:', Object.keys(response.data));
      
      // Check different possible response structures
      let token, userData;
      
      if (response.data.token && response.data.user) {
        token = response.data.token;
        userData = response.data.user;
      } else if (response.data.data && response.data.data.token && response.data.data.user) {
        token = response.data.data.token;
        userData = response.data.data.user;
      } else if (response.data.accessToken || response.data.authToken) {
        token = response.data.accessToken || response.data.authToken;
        userData = response.data.userData || response.data.user || response.data.data;
      } else {
        // Try to find token-like fields
        for (const key in response.data) {
          const value = response.data[key];
          if (typeof value === 'string' && value.length > 20) {
            token = value;
          }
          if (typeof value === 'object' && value !== null && (value.id || value.email || value.name)) {
            userData = value;
          }
        }
      }
      
      console.log('🔍 Extracted data:', {
        hasToken: !!token,
        tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
        hasUserData: !!userData,
        userData: userData
      });
      
      if (!token || !userData) {
        console.error('❌ Could not extract token or user data from response');
        return { success: false, message: 'Invalid login response structure' };
      }
      
      cookieUtils.setToken(token);
      cookieUtils.setUser(userData);
      authService.setAuthToken(token);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('✅ Login successful, user authenticated:', userData);
      return { success: true, data: { token, user: userData } };
    } catch (error) {
      console.error('❌ Login failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const signup = async (userData) => {
    console.log('📝 AuthContext: Signup attempt started');
    
    try {
      const response = await authService.signup(userData);
      console.log('✅ Signup API Response:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ Signup failed:', error);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed' 
      };
    }
  };

  const logout = () => {
    console.log('🚪 AuthContext: Logout initiated');
    cookieUtils.clearAuth();
    authService.removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
    
    authService.logout().catch(error => {
      console.error('❌ Logout API call failed:', error);
    });
    
    console.log('✅ Logout completed');
  };

  // Step 1: Request password reset OTP
  const forgotPassword = async (email) => {
    console.log('🔑 AuthContext: Forgot password attempt started');
    console.log('📤 Forgot password request data:', { email });
    
    try {
      const response = await authService.forgotPassword(email);
      console.log('✅ Forgot password API Response:', response.data);
      
      // Based on your API: { success: true, message: "Password reset OTP sent to your email", data: { token: "...", message: "...", expiresIn: "10 minutes" } }
      if (response.data.success) {
        return { 
          success: true, 
          data: {
            token: response.data.data.token,
            message: response.data.message,
            expiresIn: response.data.data.expiresIn === "10 minutes" ? 600 : 600 // Convert to seconds
          }
        };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Failed to send OTP' 
        };
      }
    } catch (error) {
      console.error('❌ Forgot password failed:', error);
      console.error('❌ Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send reset email' 
      };
    }
  };

  // Step 2: Reset password with OTP
  const resetPassword = async (resetData) => { 
    console.log('🔄 AuthContext: Reset password attempt started');
    console.log('📤 Reset password request data:', { 
      hasToken: !!resetData.token,
      tokenPreview: resetData.token ? resetData.token.substring(0, 20) + '...' : 'None',
      hasOtp: !!resetData.otp,
      otpValue: resetData.otp,
      newPassword: '***',
      confirmPassword: '***'
    });
    
    try {
      const response = await authService.resetPassword(resetData);
      console.log('✅ Reset password API Response:', response.data);
      
      if (response.data.success) {
        return { success: true, data: response.data };
      } else {
        return { 
          success: false, 
          message: response.data.message || 'Password reset failed' 
        };
      }
    } catch (error) {
      console.error('❌ Reset password failed:', error);
      console.error('❌ Error response:', error.response?.data);
      return { 
        success: false, 
        message: error.response?.data?.message || 'Password reset failed' 
      };
    }
  };

  // Change Password (for authenticated users)
  const changePassword = async (passwordData) => {
    console.log('🔐 AuthContext: Change password step 1 - Requesting OTP');
    console.log('📤 Change password request data:', { 
      currentPassword: '***', 
      newPassword: '***',
      confirmPassword: '***'
    });
    
    try {
      const response = await authService.changePassword(passwordData);
      console.log('✅ Change password step 1 - RAW RESPONSE:');
      console.log('📄 response:', response);
      console.log('📄 response.data:', response.data);
      console.log('📄 response.data type:', typeof response.data);
      console.log('📄 response.data keys:', response.data ? Object.keys(response.data) : 'No keys');
      
      // Check if response.data.data exists
      if (response.data && response.data.data) {
        console.log('📄 response.data.data:', response.data.data);
        console.log('📄 response.data.data type:', typeof response.data.data);
        console.log('📄 response.data.data keys:', Object.keys(response.data.data));
        
        if (response.data.data.token) {
          console.log('📄 FOUND TOKEN in response.data.data.token:', response.data.data.token);
          console.log('📄 Token type:', typeof response.data.data.token);
          console.log('📄 Token length:', response.data.data.token.length);
          console.log('📄 Full token value:', response.data.data.token);
        }
      }
      
      // Based on your API structure: { success: true, message: "...", data: { token: "...", message: "...", expiresIn: 600 } }
      if (response.data.success) {
        const { data } = response.data;
        
        // CRITICAL: Log the exact token being extracted
        console.log('🔑 EXTRACTING TOKEN:');
        console.log('🔑 data object:', data);
        console.log('🔑 data.token exists:', !!data?.token);
        console.log('🔑 data.token value:', data?.token);
        console.log('🔑 data.token type:', typeof data?.token);
        
        const extractedToken = data.token;
        
        console.log('✅ OTP sent successfully, FINAL TOKEN CHECK:', {
          hasToken: !!extractedToken,
          tokenPreview: extractedToken ? extractedToken.substring(0, 50) + '...' : 'None',
          fullToken: extractedToken, // Show full token for debugging
          tokenLength: extractedToken ? extractedToken.length : 0,
          expiresIn: data?.expiresIn,
          message: data?.message
        });
        
        return { 
          success: true, 
          data: {
            token: extractedToken,
            message: response.data.message,
            expiresIn: data.expiresIn,
            sentTo: user?.email || 'your registered email'
          }
        };
      } else {
        console.error('❌ API returned success: false');
        return { 
          success: false, 
          message: response.data.message || 'Failed to send OTP' 
        };
      }
      
    } catch (error) {
      console.error('❌ Change password step 1 failed:', error);
      console.error('❌ Error response:', error.response?.data);
      
      // Handle validation errors
      if (error.response?.data?.errors) {
        const validationErrors = error.response.data.errors;
        const errorMessage = validationErrors.map(err => err.message).join(', ');
        return { 
          success: false, 
          message: errorMessage,
          validationErrors: validationErrors
        };
      }
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to send OTP. Please check your current password.' 
      };
    }
  };

  // Verify OTP for change password
  const verifyPasswordChangeOTP = async (otpData) => {
    console.log('🔐 AuthContext: Change password step 2 - Verifying OTP');
    console.log('📤 OTP verification data RECEIVED:', { 
      hasToken: !!otpData.token,
      tokenPreview: otpData.token ? otpData.token.substring(0, 50) + '...' : 'None',
      fullTokenForDebugging: otpData.token, // Show full token for debugging
      tokenType: typeof otpData.token,
      tokenLength: otpData.token ? otpData.token.length : 0,
      hasOtp: !!otpData.otp,
      otpValue: otpData.otp,
      otpType: typeof otpData.otp
    });
    
    // Ensure we have all required fields
    if (!otpData.otp) {
      console.error('❌ OTP is missing');
      return { success: false, message: 'OTP is required' };
    }
    
    if (!otpData.token) {
      console.error('❌ Token is missing');
      return { success: false, message: 'Token is missing. Please try again from the beginning.' };
    }
    
    // Validate token format (should be a non-empty string)
    if (typeof otpData.token !== 'string' || otpData.token.trim() === '') {
      console.error('❌ Token is not a valid string:', otpData.token);
      return { success: false, message: 'Invalid token format. Please try again from the beginning.' };
    }
    
    try {
      console.log('📤 SENDING TO API - Final verification:');
      const requestData = {
        token: otpData.token,
        otp: otpData.otp
      };
      console.log('📤 Request data being sent:', requestData);
      console.log('📤 JSON stringified:', JSON.stringify(requestData, null, 2));
      
      const response = await authService.verifyPasswordChangeOTP(requestData);
      
      console.log('✅ OTP verification response received:');
      console.log('📥 Full response:', response);
      console.log('📥 Response data:', response.data);
      
      // Based on your API structure: { success: true, message: "Password changed successfully" }
      if (response.data.success) {
        console.log('✅ Backend confirmed success');
        return { 
          success: true, 
          data: response.data 
        };
      } else {
        console.error('❌ Backend returned success: false');
        return { 
          success: false, 
          message: response.data.message || 'Invalid OTP' 
        };
      }
      
    } catch (error) {
      console.error('❌ OTP verification failed - DETAILED ERROR:');
      console.error('❌ Error object:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      
      return { 
        success: false, 
        message: error.response?.data?.message || 'Invalid OTP. Please try again.' 
      };
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
    changePassword,
    verifyPasswordChangeOTP
  };

  console.log('🔄 AuthContext: Current state:', { 
    isAuthenticated, 
    hasUser: !!user, 
    loading,
    userName: user?.name || 'None'
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
// import { authService } from '../services/authService';
// import { cookieUtils } from '../utils/cookieUtils';

// const AuthContext = createContext();

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error('useAuth must be used within an AuthProvider');
//   }
//   return context;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   const initializeAuth = useCallback(async () => {
//     console.log('🔍 AuthContext: Starting authentication initialization');
    
//     try {
//       cookieUtils.debugCookies();
      
//       const token = cookieUtils.getToken();
//       const userData = cookieUtils.getUser();
      
//       console.log('📦 Auth data check:', { 
//         hasToken: !!token, 
//         hasUserData: !!userData,
//         tokenLength: token ? token.length : 0,
//         userDataKeys: userData ? Object.keys(userData) : []
//       });
      
//       if (token && userData) {
//         console.log('✅ AuthContext: Found auth data in cookies, setting authenticated state');
//         authService.setAuthToken(token);
//         setUser(userData);
//         setIsAuthenticated(true);
//         console.log('✅ AuthContext: User authenticated from cookies:', userData);
//       } else {
//         console.log('❌ AuthContext: No valid auth data found in cookies');
//         setUser(null);
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error('❌ AuthContext: Error initializing auth:', error);
//       setUser(null);
//       setIsAuthenticated(false);
//     }
    
//     console.log('🔄 AuthContext: Setting loading to false');
//     setLoading(false);
//   }, []);

//   useEffect(() => {
//     console.log('🔄 AuthProvider: Component mounted, initializing authentication');
//     initializeAuth();
//   }, [initializeAuth]);

//   const login = async (credentials) => {
//     console.log('🔐 AuthContext: Login attempt started');
    
//     try {
//       const response = await authService.login(credentials);
//       console.log('✅ Login API Response - Full Structure:', response);
//       console.log('✅ Response.data:', response.data);
//       console.log('✅ Response.data keys:', Object.keys(response.data));
      
//       // Check different possible response structures
//       let token, userData;
      
//       if (response.data.token && response.data.user) {
//         token = response.data.token;
//         userData = response.data.user;
//       } else if (response.data.data && response.data.data.token && response.data.data.user) {
//         token = response.data.data.token;
//         userData = response.data.data.user;
//       } else if (response.data.accessToken || response.data.authToken) {
//         token = response.data.accessToken || response.data.authToken;
//         userData = response.data.userData || response.data.user || response.data.data;
//       } else {
//         // Try to find token-like fields
//         for (const key in response.data) {
//           const value = response.data[key];
//           if (typeof value === 'string' && value.length > 20) {
//             token = value;
//           }
//           if (typeof value === 'object' && value !== null && (value.id || value.email || value.name)) {
//             userData = value;
//           }
//         }
//       }
      
//       console.log('🔍 Extracted data:', {
//         hasToken: !!token,
//         tokenPreview: token ? token.substring(0, 20) + '...' : 'None',
//         hasUserData: !!userData,
//         userData: userData
//       });
      
//       if (!token || !userData) {
//         console.error('❌ Could not extract token or user data from response');
//         return { success: false, message: 'Invalid login response structure' };
//       }
      
//       cookieUtils.setToken(token);
//       cookieUtils.setUser(userData);
//       authService.setAuthToken(token);
//       setUser(userData);
//       setIsAuthenticated(true);
      
//       console.log('✅ Login successful, user authenticated:', userData);
//       return { success: true, data: { token, user: userData } };
//     } catch (error) {
//       console.error('❌ Login failed:', error);
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Login failed' 
//       };
//     }
//   };

//   const signup = async (userData) => {
//     console.log('📝 AuthContext: Signup attempt started');
    
//     try {
//       const response = await authService.signup(userData);
//       console.log('✅ Signup API Response:', response.data);
//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error('❌ Signup failed:', error);
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Signup failed' 
//       };
//     }
//   };

//   const logout = () => {
//     console.log('🚪 AuthContext: Logout initiated');
//     cookieUtils.clearAuth();
//     authService.removeAuthToken();
//     setUser(null);
//     setIsAuthenticated(false);
    
//     authService.logout().catch(error => {
//       console.error('❌ Logout API call failed:', error);
//     });
    
//     console.log('✅ Logout completed');
//   };

//   // Forgot Password
//   const forgotPassword = async (email) => {
//     console.log('🔑 AuthContext: Forgot password attempt started');
//     console.log('📤 Forgot password request data:', { email });
    
//     try {
//       const response = await authService.forgotPassword(email);
//       console.log('✅ Forgot password API Response:', response.data);
//       return { success: true, data: response.data };
//     } catch (error) {
//       console.error('❌ Forgot password failed:', error);
//       console.error('❌ Error response:', error.response?.data);
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Failed to send reset email' 
//       };
//     }
//   };

//   // Step 1: Request password change (sends OTP) - Based on your exact API
//   const changePassword = async (passwordData) => {
//     console.log('🔐 AuthContext: Change password step 1 - Requesting OTP');
//     console.log('📤 Change password request data:', { 
//       currentPassword: '***', 
//       newPassword: '***',
//       confirmPassword: '***'
//     });
    
//     try {
//       const response = await authService.changePassword(passwordData);
//       console.log('✅ Change password step 1 - RAW RESPONSE:');
//       console.log('📄 response:', response);
//       console.log('📄 response.data:', response.data);
//       console.log('📄 response.data type:', typeof response.data);
//       console.log('📄 response.data keys:', response.data ? Object.keys(response.data) : 'No keys');
      
//       // Check if response.data.data exists
//       if (response.data && response.data.data) {
//         console.log('📄 response.data.data:', response.data.data);
//         console.log('📄 response.data.data type:', typeof response.data.data);
//         console.log('📄 response.data.data keys:', Object.keys(response.data.data));
        
//         if (response.data.data.token) {
//           console.log('📄 FOUND TOKEN in response.data.data.token:', response.data.data.token);
//           console.log('📄 Token type:', typeof response.data.data.token);
//           console.log('📄 Token length:', response.data.data.token.length);
//           console.log('📄 Full token value:', response.data.data.token);
//         }
//       }
      
//       // Based on your API structure: { success: true, message: "...", data: { token: "...", message: "...", expiresIn: 600 } }
//       if (response.data.success) {
//         const { data } = response.data;
        
//         // CRITICAL: Log the exact token being extracted
//         console.log('🔑 EXTRACTING TOKEN:');
//         console.log('🔑 data object:', data);
//         console.log('🔑 data.token exists:', !!data?.token);
//         console.log('🔑 data.token value:', data?.token);
//         console.log('🔑 data.token type:', typeof data?.token);
        
//         const extractedToken = data.token;
        
//         console.log('✅ OTP sent successfully, FINAL TOKEN CHECK:', {
//           hasToken: !!extractedToken,
//           tokenPreview: extractedToken ? extractedToken.substring(0, 50) + '...' : 'None',
//           fullToken: extractedToken, // Show full token for debugging
//           tokenLength: extractedToken ? extractedToken.length : 0,
//           expiresIn: data?.expiresIn,
//           message: data?.message
//         });
        
//         return { 
//           success: true, 
//           data: {
//             token: extractedToken,
//             message: response.data.message,
//             expiresIn: data.expiresIn,
//             sentTo: user?.email || 'your registered email'
//           }
//         };
//       } else {
//         console.error('❌ API returned success: false');
//         return { 
//           success: false, 
//           message: response.data.message || 'Failed to send OTP' 
//         };
//       }
      
//     } catch (error) {
//       console.error('❌ Change password step 1 failed:', error);
//       console.error('❌ Error response:', error.response?.data);
      
//       // Handle validation errors
//       if (error.response?.data?.errors) {
//         const validationErrors = error.response.data.errors;
//         const errorMessage = validationErrors.map(err => err.message).join(', ');
//         return { 
//           success: false, 
//           message: errorMessage,
//           validationErrors: validationErrors
//         };
//       }
      
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Failed to send OTP. Please check your current password.' 
//       };
//     }
//   };

//   // Step 2: Verify OTP and change password - Based on your exact API
//   const verifyPasswordChangeOTP = async (otpData) => {
//     console.log('🔐 AuthContext: Change password step 2 - Verifying OTP');
//     console.log('📤 OTP verification data RECEIVED:', { 
//       hasToken: !!otpData.token,
//       tokenPreview: otpData.token ? otpData.token.substring(0, 50) + '...' : 'None',
//       fullTokenForDebugging: otpData.token, // Show full token for debugging
//       tokenType: typeof otpData.token,
//       tokenLength: otpData.token ? otpData.token.length : 0,
//       hasOtp: !!otpData.otp,
//       otpValue: otpData.otp,
//       otpType: typeof otpData.otp
//     });
    
//     // Ensure we have all required fields
//     if (!otpData.otp) {
//       console.error('❌ OTP is missing');
//       return { success: false, message: 'OTP is required' };
//     }
    
//     if (!otpData.token) {
//       console.error('❌ Token is missing');
//       return { success: false, message: 'Token is missing. Please try again from the beginning.' };
//     }
    
//     // Validate token format (should be a non-empty string)
//     if (typeof otpData.token !== 'string' || otpData.token.trim() === '') {
//       console.error('❌ Token is not a valid string:', otpData.token);
//       return { success: false, message: 'Invalid token format. Please try again from the beginning.' };
//     }
    
//     try {
//       console.log('📤 SENDING TO API - Final verification:');
//       const requestData = {
//         token: otpData.token,
//         otp: otpData.otp
//       };
//       console.log('📤 Request data being sent:', requestData);
//       console.log('📤 JSON stringified:', JSON.stringify(requestData, null, 2));
      
//       const response = await authService.verifyPasswordChangeOTP(requestData);
      
//       console.log('✅ OTP verification response received:');
//       console.log('📥 Full response:', response);
//       console.log('📥 Response data:', response.data);
      
//       // Based on your API structure: { success: true, message: "Password changed successfully" }
//       if (response.data.success) {
//         console.log('✅ Backend confirmed success');
//         return { 
//           success: true, 
//           data: response.data 
//         };
//       } else {
//         console.error('❌ Backend returned success: false');
//         return { 
//           success: false, 
//           message: response.data.message || 'Invalid OTP' 
//         };
//       }
      
//     } catch (error) {
//       console.error('❌ OTP verification failed - DETAILED ERROR:');
//       console.error('❌ Error object:', error);
//       console.error('❌ Error message:', error.message);
//       console.error('❌ Error response:', error.response);
//       console.error('❌ Error response data:', error.response?.data);
//       console.error('❌ Error status:', error.response?.status);
      
//       return { 
//         success: false, 
//         message: error.response?.data?.message || 'Invalid OTP. Please try again.' 
//       };
//     }
//   };

//   const value = {
//     user,
//     isAuthenticated,
//     loading,
//     login,
//     signup,
//     logout,
//     forgotPassword,
//     changePassword,
//     verifyPasswordChangeOTP
//   };

//   console.log('🔄 AuthContext: Current state:', { 
//     isAuthenticated, 
//     hasUser: !!user, 
//     loading,
//     userName: user?.name || 'None'
//   });

//   return (
//     <AuthContext.Provider value={value}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
