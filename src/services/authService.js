import api from './api';

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

  // Logout user
  logout: () => {
    console.log('🚪 authService.logout: Making logout API call');
    return api.post('/auth/logout');
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

  // Dashboard API calls
  getDashboardStats: () => {
    console.log('📊 authService.getDashboardStats: Making dashboard stats API call');
    return api.get('/admin/dashboard/stats');
  },

  // Domain management
  getDomains: () => {
    console.log('📁 authService.getDomains: Making get domains API call');
    return api.get('/admin/domains');
  },

  // Project management
  getProjects: () => {
    console.log('📋 authService.getProjects: Making get projects API call');
    return api.get('/admin/projects');
  },

  // Leads management
  getLeads: () => {
    console.log('👥 authService.getLeads: Making get leads API call');
    return api.get('/admin/leads');
  }
};

// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// import { ToastContainer } from 'react-toastify';
// import { AuthProvider } from './context/AuthContext';
// import ProtectedRoute from './components/common/ProtectedRoute';
// import AuthGuard from './components/common/AuthGuard';
// import Layout from './components/common/Layout';
// import Login from './components/auth/Login';
// import Signup from './components/auth/Signup';
// import ForgotPassword from './components/auth/ForgotPassword';
// import ResetPassword from './components/auth/ResetPassword';
// import ChangePassword from './components/auth/ChangePassword';
// import Dashboard from './components/dashboard/Dashboard';
// import DebugAuth from './components/common/DebugAuth';

// import 'react-toastify/dist/ReactToastify.css';
// import './styles/global.css';

// function App() {
//   console.log('🚀 App: Application starting');

//   return (
//     <AuthProvider>
//       <Router>
//         <div className="App">
//           <Routes>
//             {/* Public Routes - Protected from authenticated users */}
//             <Route path="/login" element={
//               <AuthGuard>
//                 <Login />
//               </AuthGuard>
//             } />
//             <Route path="/signup" element={
//               <AuthGuard>
//                 <Signup />
//               </AuthGuard>
//             } />
//             <Route path="/forgot-password" element={
//               <AuthGuard>
//                 <ForgotPassword />
//               </AuthGuard>
//             } />
//             <Route path="/reset-password" element={
//               <AuthGuard>
//                 <ResetPassword />
//               </AuthGuard>
//             } />
            
//             {/* Protected Routes - Require authentication */}
//             <Route path="/" element={
//               <ProtectedRoute>
//                 <Layout />
//               </ProtectedRoute>
//             }>
//               {/* Redirect root to dashboard */}
//               <Route index element={<Navigate to="/dashboard" replace />} />
              
//               {/* Dashboard */}
//               <Route path="dashboard" element={<Dashboard />} />
              
//               {/* Account Management */}
//               <Route path="change-password" element={<ChangePassword />} />
              
//               {/* Future routes */}
//               <Route path="domains" element={<ComingSoon title="Domains Management" />} />
//               <Route path="projects" element={<ComingSoon title="Projects Management" />} />
//               <Route path="leads" element={<ComingSoon title="Leads Management" />} />
//               <Route path="settings" element={<ComingSoon title="Settings" />} />
//             </Route>
            
//             {/* Catch all route - redirect to dashboard if authenticated, login if not */}
//             <Route path="*" element={<Navigate to="/dashboard" replace />} />
//           </Routes>
          
//           {/* Debug component for testing */}
//           <DebugAuth />
          
//           {/* Toast Notifications */}
//           <ToastContainer
//             position="top-right"
//             autoClose={3000}
//             hideProgressBar={false}
//             newestOnTop={false}
//             closeOnClick
//             rtl={false}
//             pauseOnFocusLoss
//             draggable
//             pauseOnHover
//             theme="light"
//           />
//         </div>
//       </Router>
//     </AuthProvider>
//   );
// }

// // Temporary Coming Soon component
// const ComingSoon = ({ title }) => {
//   return (
//     <div style={{
//       display: 'flex',
//       flexDirection: 'column',
//       alignItems: 'center',
//       justifyContent: 'center',
//       minHeight: '60vh',
//       textAlign: 'center'
//     }}>
//       <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
//         {title}
//       </h1>
//       <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
//         This feature is coming soon! 🚀
//       </p>
//     </div>
//   );
// };

// export default App;
