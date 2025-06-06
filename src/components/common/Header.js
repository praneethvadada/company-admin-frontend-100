import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiLogOut, FiUser } from 'react-icons/fi';

const Header = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    console.log('🚪 Header: Logout button clicked');
    logout();
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={toggleSidebar}>
          <FiMenu />
        </button>
        <h1 className="header-title">Admin Panel</h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <FiUser className="user-icon" />
          <span className="user-name">{user?.name || user?.email || 'Admin'}</span>
        </div>
        <button className="logout-button" onClick={handleLogout}>
          <FiLogOut />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
