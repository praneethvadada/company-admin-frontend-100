import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  console.log('🏗️ Layout: Rendering with sidebar', sidebarOpen ? 'open' : 'closed');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    console.log('🔄 Layout: Toggling sidebar to', !sidebarOpen ? 'open' : 'closed');
  };

  return (
    <div className="layout">
      <Header toggleSidebar={toggleSidebar} />
      <div className="layout-content">
        <Sidebar isOpen={sidebarOpen} />
        <main className={`main-content ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
