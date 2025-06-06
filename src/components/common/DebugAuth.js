import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { cookieUtils } from '../../utils/cookieUtils';

const DebugAuth = () => {
  const { isAuthenticated, user, loading } = useAuth();

  const handleCheckCookies = () => {
    console.log('🔍 Debug: Manual cookie check triggered');
    
    const token = cookieUtils.getToken();
    const userData = cookieUtils.getUser();
    const allCookies = cookieUtils.debugCookies();
    
    const debugInfo = {
      cookies: {
        token: token ? 'Present' : 'Missing',
        userData: userData ? 'Present' : 'Missing',
        allCookies: Object.keys(allCookies)
      },
      authContext: {
        isAuthenticated,
        loading,
        hasUser: !!user,
        userName: user?.name || 'None'
      }
    };
    
    console.log('🔍 Complete debug info:', debugInfo);
    
    alert(`🍪 COOKIES:\nToken: ${token ? 'Present' : 'Missing'}\nUser Data: ${userData ? 'Present' : 'Missing'}\n\n🔐 AUTH STATE:\nAuthenticated: ${isAuthenticated}\nLoading: ${loading}\nUser: ${user?.name || 'None'}\n\n📋 ALL COOKIES:\n${Object.keys(allCookies).join(', ')}`);
  };

  const handleClearCookies = () => {
    console.log('🗑️ Debug: Clearing all auth cookies');
    cookieUtils.clearAuth();
    alert('Cookies cleared! Refresh the page to see effect.');
  };

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: '#333',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      zIndex: 1000,
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '5px'
    }}>
      <button onClick={handleCheckCookies} style={{
        background: '#007bff',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer'
      }}>
        Debug Auth
      </button>
      
      <button onClick={handleClearCookies} style={{
        background: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '5px 10px',
        borderRadius: '3px',
        cursor: 'pointer'
      }}>
        Clear Cookies
      </button>
      
      <div>Auth: {isAuthenticated ? '✅' : '❌'}</div>
      <div>Loading: {loading ? '⏳' : '✅'}</div>
      <div>User: {user?.name || 'None'}</div>
    </div>
  );
};

export default DebugAuth;
