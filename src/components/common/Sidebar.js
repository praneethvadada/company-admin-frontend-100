import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiFolder, 
  FiFileText, 
  FiUsers, 
  FiSettings,
  FiLock
} from 'react-icons/fi';

const Sidebar = ({ isOpen }) => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Dashboard'
    },
    {
      path: '/domains',
      icon: FiFolder,
      label: 'Domains'
    },
    {
      path: '/projects',
      icon: FiFileText,
      label: 'Projects'
    },
    {
      path: '/leads',
      icon: FiUsers,
      label: 'Leads'
    },
    {
      path: '/change-password',
      icon: FiLock,
      label: 'Change Password'
    },
    {
      path: '/settings',
      icon: FiSettings,
      label: 'Settings'
    }
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path} className="nav-item">
                <NavLink
                  to={item.path}
                  className={({ isActive }) => 
                    `nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <Icon className="nav-icon" />
                  {isOpen && <span className="nav-label">{item.label}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
