// src/components/common/AuthGuard.js
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Prevents authenticated users from accessing login/signup pages
const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🛡️ AuthGuard: Checking if user should access auth pages', { 
    isAuthenticated, 
    loading 
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    console.log('✅ AuthGuard: User is authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('✅ AuthGuard: User not authenticated, allowing access to auth pages');
  return children;
};

export default AuthGuard;


// import React from 'react';
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';

// // Prevents authenticated users from accessing login/signup pages
// const AuthGuard = ({ children }) => {
//   const { isAuthenticated, loading } = useAuth();

//   console.log('🛡️ AuthGuard: Checking if user should access auth pages', { 
//     isAuthenticated, 
//     loading 
//   });

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading...</p>
//       </div>
//     );
//   }

//   if (isAuthenticated) {
//     console.log('✅ AuthGuard: User is authenticated, redirecting to dashboard');
//     return <Navigate to="/dashboard" replace />;
//   }

//   console.log('✅ AuthGuard: User not authenticated, allowing access to auth pages');
//   return children;
// };

// export default AuthGuard;
