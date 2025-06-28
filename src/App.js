// src/App.js - REPLACE EXISTING
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import AuthGuard from './components/common/AuthGuard';
import Layout from './components/common/Layout';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import ChangePassword from './components/auth/ChangePassword';
import Dashboard from './components/dashboard/Dashboard';
import DomainManagement from './components/domains/DomainManagement';
import SubDomainManagement from './components/domains/SubDomainManagement';
import ProjectManagement from './components/projects/ProjectManagement';
import LeadManagement from './components/leads/LeadManagement';
import DebugAuth from './components/common/DebugAuth';

import 'react-toastify/dist/ReactToastify.css';
import './styles/global.css';

function App() {
  console.log('🚀 App: Application starting');

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes - Protected from authenticated users */}
            <Route path="/login" element={
              <AuthGuard>
                <Login />
              </AuthGuard>
            } />
            <Route path="/signup" element={
              <AuthGuard>
                <Signup />
              </AuthGuard>
            } />
            <Route path="/forgot-password" element={
              <AuthGuard>
                <ForgotPassword />
              </AuthGuard>
            } />
            <Route path="/reset-password" element={
              <AuthGuard>
                <ResetPassword />
              </AuthGuard>
            } />
            
            {/* Protected Routes - Require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Redirect root to dashboard */}
              <Route index element={<Navigate to="/dashboard" replace />} />
              
              {/* Main Admin Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="domains" element={<DomainManagement />} />
              <Route path="domains/:domainId/subdomains" element={<SubDomainManagement />} />
              <Route path="projects" element={<ProjectManagement />} />
              <Route path="leads" element={<LeadManagement />} />
              
              {/* Account Management */}
              <Route path="change-password" element={<ChangePassword />} />
              
              {/* Settings - Coming Soon */}
              <Route path="settings" element={<ComingSoon title="Settings" />} />
              
              {/* Sub-routes for detailed management */}
              <Route path="domains/:id" element={<ComingSoon title="Domain Details" />} />
              <Route path="projects/:id" element={<ComingSoon title="Project Details" />} />
              <Route path="leads/:id" element={<ComingSoon title="Lead Details" />} />
            </Route>
            
            {/* Catch all route - redirect to dashboard if authenticated, login if not */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
          
          {/* Debug component for testing */}
          <DebugAuth />
          
          {/* Toast Notifications */}
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

// Temporary Coming Soon component for remaining features
const ComingSoon = ({ title }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center'
    }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
        {title}
      </h1>
      <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
        This feature is coming soon! 🚀
      </p>
    </div>
  );
};

export default App;

// // src/App.js - REPLACE EXISTING
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
// import DomainManagement from './components/domains/DomainManagement';
// import ProjectManagement from './components/projects/ProjectManagement';
// import LeadManagement from './components/leads/LeadManagement';
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
              
//               {/* Main Admin Routes */}
//               <Route path="dashboard" element={<Dashboard />} />
//               <Route path="domains" element={<DomainManagement />} />
//               <Route path="projects" element={<ProjectManagement />} />
//               <Route path="leads" element={<LeadManagement />} />
              
//               {/* Account Management */}
//               <Route path="change-password" element={<ChangePassword />} />
              
//               {/* Settings - Coming Soon */}
//               <Route path="settings" element={<ComingSoon title="Settings" />} />
              
//               {/* Sub-routes for detailed management */}
//               <Route path="domains/:id" element={<ComingSoon title="Domain Details" />} />
//               <Route path="projects/:id" element={<ComingSoon title="Project Details" />} />
//               <Route path="leads/:id" element={<ComingSoon title="Lead Details" />} />
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

// // Temporary Coming Soon component for remaining features
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


// // import React from 'react';
// // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // import { ToastContainer } from 'react-toastify';
// // import { AuthProvider } from './context/AuthContext';
// // import ProtectedRoute from './components/common/ProtectedRoute';
// // import AuthGuard from './components/common/AuthGuard';
// // import Layout from './components/common/Layout';
// // import Login from './components/auth/Login';
// // import Signup from './components/auth/Signup';
// // import ForgotPassword from './components/auth/ForgotPassword';
// // import ResetPassword from './components/auth/ResetPassword';
// // import ChangePassword from './components/auth/ChangePassword';
// // import Dashboard from './components/dashboard/Dashboard';
// // import DebugAuth from './components/common/DebugAuth';

// // import 'react-toastify/dist/ReactToastify.css';
// // import './styles/global.css';

// // function App() {
// //   console.log('🚀 App: Application starting');

// //   return (
// //     <AuthProvider>
// //       <Router>
// //         <div className="App">
// //           <Routes>
// //             {/* Public Routes - Protected from authenticated users */}
// //             <Route path="/login" element={
// //               <AuthGuard>
// //                 <Login />
// //               </AuthGuard>
// //             } />
// //             <Route path="/signup" element={
// //               <AuthGuard>
// //                 <Signup />
// //               </AuthGuard>
// //             } />
// //             <Route path="/forgot-password" element={
// //               <AuthGuard>
// //                 <ForgotPassword />
// //               </AuthGuard>
// //             } />
// //             <Route path="/reset-password" element={
// //               <AuthGuard>
// //                 <ResetPassword />
// //               </AuthGuard>
// //             } />
            
// //             {/* Protected Routes - Require authentication */}
// //             <Route path="/" element={
// //               <ProtectedRoute>
// //                 <Layout />
// //               </ProtectedRoute>
// //             }>
// //               {/* Redirect root to dashboard */}
// //               <Route index element={<Navigate to="/dashboard" replace />} />
              
// //               {/* Dashboard */}
// //               <Route path="dashboard" element={<Dashboard />} />
              
// //               {/* Account Management */}
// //               <Route path="change-password" element={<ChangePassword />} />
              
// //               {/* Future routes */}
// //               <Route path="domains" element={<ComingSoon title="Domains Management" />} />
// //               <Route path="projects" element={<ComingSoon title="Projects Management" />} />
// //               <Route path="leads" element={<ComingSoon title="Leads Management" />} />
// //               <Route path="settings" element={<ComingSoon title="Settings" />} />
// //             </Route>
            
// //             {/* Catch all route - redirect to dashboard if authenticated, login if not */}
// //             <Route path="*" element={<Navigate to="/dashboard" replace />} />
// //           </Routes>
          
// //           {/* Debug component for testing */}
// //           <DebugAuth />
          
// //           {/* Toast Notifications */}
// //           <ToastContainer
// //             position="top-right"
// //             autoClose={3000}
// //             hideProgressBar={false}
// //             newestOnTop={false}
// //             closeOnClick
// //             rtl={false}
// //             pauseOnFocusLoss
// //             draggable
// //             pauseOnHover
// //             theme="light"
// //           />
// //         </div>
// //       </Router>
// //     </AuthProvider>
// //   );
// // }

// // // Temporary Coming Soon component
// // const ComingSoon = ({ title }) => {
// //   return (
// //     <div style={{
// //       display: 'flex',
// //       flexDirection: 'column',
// //       alignItems: 'center',
// //       justifyContent: 'center',
// //       minHeight: '60vh',
// //       textAlign: 'center'
// //     }}>
// //       <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
// //         {title}
// //       </h1>
// //       <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
// //         This feature is coming soon! 🚀
// //       </p>
// //     </div>
// //   );
// // };

// // export default App;

// // // import React from 'react';
// // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // import { ToastContainer } from 'react-toastify';
// // // import { AuthProvider } from './context/AuthContext';
// // // import ProtectedRoute from './components/common/ProtectedRoute';
// // // import AuthGuard from './components/common/AuthGuard';
// // // import Layout from './components/common/Layout';
// // // import Login from './components/auth/Login';
// // // import Signup from './components/auth/Signup';
// // // import ForgotPassword from './components/auth/ForgotPassword';
// // // import ChangePassword from './components/auth/ChangePassword';
// // // import Dashboard from './components/dashboard/Dashboard';
// // // import DebugAuth from './components/common/DebugAuth';

// // // import 'react-toastify/dist/ReactToastify.css';
// // // import './styles/global.css';

// // // function App() {
// // //   console.log('🚀 App: Application starting');

// // //   return (
// // //     <AuthProvider>
// // //       <Router>
// // //         <div className="App">
// // //           <Routes>
// // //             {/* Public Routes - Protected from authenticated users */}
// // //             <Route path="/login" element={
// // //               <AuthGuard>
// // //                 <Login />
// // //               </AuthGuard>
// // //             } />
// // //             <Route path="/signup" element={
// // //               <AuthGuard>
// // //                 <Signup />
// // //               </AuthGuard>
// // //             } />
// // //             <Route path="/forgot-password" element={
// // //               <AuthGuard>
// // //                 <ForgotPassword />
// // //               </AuthGuard>
// // //             } />
            
// // //             {/* Protected Routes - Require authentication */}
// // //             <Route path="/" element={
// // //               <ProtectedRoute>
// // //                 <Layout />
// // //               </ProtectedRoute>
// // //             }>
// // //               {/* Redirect root to dashboard */}
// // //               <Route index element={<Navigate to="/dashboard" replace />} />
              
// // //               {/* Dashboard */}
// // //               <Route path="dashboard" element={<Dashboard />} />
              
// // //               {/* Account Management */}
// // //               <Route path="change-password" element={<ChangePassword />} />
              
// // //               {/* Future routes */}
// // //               <Route path="domains" element={<ComingSoon title="Domains Management" />} />
// // //               <Route path="projects" element={<ComingSoon title="Projects Management" />} />
// // //               <Route path="leads" element={<ComingSoon title="Leads Management" />} />
// // //               <Route path="settings" element={<ComingSoon title="Settings" />} />
// // //             </Route>
            
// // //             {/* Catch all route - redirect to dashboard if authenticated, login if not */}
// // //             <Route path="*" element={<Navigate to="/dashboard" replace />} />
// // //           </Routes>
          
// // //           {/* Debug component for testing */}
// // //           <DebugAuth />
          
// // //           {/* Toast Notifications */}
// // //           <ToastContainer
// // //             position="top-right"
// // //             autoClose={3000}
// // //             hideProgressBar={false}
// // //             newestOnTop={false}
// // //             closeOnClick
// // //             rtl={false}
// // //             pauseOnFocusLoss
// // //             draggable
// // //             pauseOnHover
// // //             theme="light"
// // //           />
// // //         </div>
// // //       </Router>
// // //     </AuthProvider>
// // //   );
// // // }

// // // // Temporary Coming Soon component
// // // const ComingSoon = ({ title }) => {
// // //   return (
// // //     <div style={{
// // //       display: 'flex',
// // //       flexDirection: 'column',
// // //       alignItems: 'center',
// // //       justifyContent: 'center',
// // //       minHeight: '60vh',
// // //       textAlign: 'center'
// // //     }}>
// // //       <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
// // //         {title}
// // //       </h1>
// // //       <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
// // //         This feature is coming soon! 🚀
// // //       </p>
// // //     </div>
// // //   );
// // // };

// // // export default App;

// // // // import React from 'react';
// // // // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// // // // import { ToastContainer } from 'react-toastify';
// // // // import { AuthProvider } from './context/AuthContext';
// // // // import ProtectedRoute from './components/common/ProtectedRoute';
// // // // import AuthGuard from './components/common/AuthGuard';
// // // // import Layout from './components/common/Layout';
// // // // import Login from './components/auth/Login';
// // // // import Signup from './components/auth/Signup';
// // // // import ChangePassword from './components/auth/ChangePassword';
// // // // import Dashboard from './components/dashboard/Dashboard';
// // // // import DebugAuth from './components/common/DebugAuth';

// // // // import 'react-toastify/dist/ReactToastify.css';
// // // // import './styles/global.css';

// // // // function App() {
// // // //   console.log('🚀 App: Application starting');

// // // //   return (
// // // //     <AuthProvider>
// // // //       <Router>
// // // //         <div className="App">
// // // //           <Routes>
// // // //             {/* Public Routes - Protected from authenticated users */}
// // // //             <Route path="/login" element={
// // // //               <AuthGuard>
// // // //                 <Login />
// // // //               </AuthGuard>
// // // //             } />
// // // //             <Route path="/signup" element={
// // // //               <AuthGuard>
// // // //                 <Signup />
// // // //               </AuthGuard>
// // // //             } />
            
// // // //             {/* Protected Routes - Require authentication */}
// // // //             <Route path="/" element={
// // // //               <ProtectedRoute>
// // // //                 <Layout />
// // // //               </ProtectedRoute>
// // // //             }>
// // // //               {/* Redirect root to dashboard */}
// // // //               <Route index element={<Navigate to="/dashboard" replace />} />
              
// // // //               {/* Dashboard */}
// // // //               <Route path="dashboard" element={<Dashboard />} />
              
// // // //               {/* Account Management */}
// // // //               <Route path="change-password" element={<ChangePassword />} />
              
// // // //               {/* Future routes */}
// // // //               <Route path="domains" element={<ComingSoon title="Domains Management" />} />
// // // //               <Route path="projects" element={<ComingSoon title="Projects Management" />} />
// // // //               <Route path="leads" element={<ComingSoon title="Leads Management" />} />
// // // //               <Route path="settings" element={<ComingSoon title="Settings" />} />
// // // //             </Route>
            
// // // //             {/* Catch all route - redirect to dashboard if authenticated, login if not */}
// // // //             <Route path="*" element={<Navigate to="/dashboard" replace />} />
// // // //           </Routes>
          
// // // //           {/* Debug component for testing */}
// // // //           <DebugAuth />
          
// // // //           {/* Toast Notifications */}
// // // //           <ToastContainer
// // // //             position="top-right"
// // // //             autoClose={3000}
// // // //             hideProgressBar={false}
// // // //             newestOnTop={false}
// // // //             closeOnClick
// // // //             rtl={false}
// // // //             pauseOnFocusLoss
// // // //             draggable
// // // //             pauseOnHover
// // // //             theme="light"
// // // //           />
// // // //         </div>
// // // //       </Router>
// // // //     </AuthProvider>
// // // //   );
// // // // }

// // // // // Temporary Coming Soon component
// // // // const ComingSoon = ({ title }) => {
// // // //   return (
// // // //     <div style={{
// // // //       display: 'flex',
// // // //       flexDirection: 'column',
// // // //       alignItems: 'center',
// // // //       justifyContent: 'center',
// // // //       minHeight: '60vh',
// // // //       textAlign: 'center'
// // // //     }}>
// // // //       <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1e293b' }}>
// // // //         {title}
// // // //       </h1>
// // // //       <p style={{ fontSize: '1.125rem', color: '#64748b' }}>
// // // //         This feature is coming soon! 🚀
// // // //       </p>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default App;
