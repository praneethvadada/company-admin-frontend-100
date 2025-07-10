import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiFolder,
  FiFileText,
  FiSettings,
  FiLock,
  FiGitBranch,
  FiAward,
  FiStar,
  FiUserCheck,
  FiBarChart,
  FiMail
} from 'react-icons/fi';

const Sidebar = ({ isOpen }) => {
  const location = useLocation();
  
  console.log('🧭 SIDEBAR - Current location:', location.pathname);

  const menuItems = [
    {
      path: '/dashboard',
      icon: FiHome,
      label: 'Dashboard'
    },
    {
      path: '/internships/branches',
      icon: FiGitBranch,
      label: 'Manage Branches'
    },
    {
      path: '/domains',
      icon: FiFolder,
      label: 'Project Domains'
    },
    {
      path: '/internships',
      icon: FiAward,
      label: 'Manage Internships'
    },
    {
      path: '/internship-leads',
      icon: FiUserCheck,
      label: 'Internship Enrollments'
    },
    {
      path: '/ratings',
      icon: FiStar,
      label: 'Ratings & Feedback'
    },
    {
      path: '/leads',
      icon: FiMail,
      label: 'Project Leads'
    },
    {
      path: '/projects',
      icon: FiFileText,
      label: 'Manage Projects'
    },
    {
      path: '/analytics',
      icon: FiBarChart,
      label: 'Analytics'
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
                  className={({ isActive }) => {
                    console.log(`🧭 SIDEBAR - ${item.label} isActive:`, isActive);
                    return `nav-link ${isActive ? 'active' : ''}`;
                  }}
                  onClick={() => {
                    console.log(`🧭 SIDEBAR - Clicked ${item.label} -> ${item.path}`);
                  }}
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


// // src/components/common/Sidebar.js - UPDATED FOR INTERNSHIP MANAGEMENT
// import React from 'react';
// import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// import {
//   FiHome,
//   FiFolder,
//   FiFileText,
//   FiUsers,
//   FiSettings,
//   FiLock,
//   FiGitBranch,
//   FiAward,
//   FiStar,
//   FiUserCheck,
//   FiBarChart,
//   FiMail,
//   FiBookOpen
// } from 'react-icons/fi';

// const Sidebar = ({ isOpen }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
  
//   console.log('🧭 SIDEBAR - Current location:', location.pathname);

//   const menuItems = [
//     {
//       path: '/dashboard',
//       icon: FiHome,
//       label: 'Dashboard'
//     },
//     // ✅ UPDATED: Changed path to match the ManageBranches component route
//     {
//       path: '/internships/branches',
//       icon: FiGitBranch,
//       label: 'Manage Branches'
//     },
//     // ✅ UPDATED: Keep domains but clarify it's for the old project system
//     {
//       path: '/domains',
//       icon: FiFolder,
//       label: 'Project Domains'
//     },
//     // ✅ UPDATED: Changed path to match internship management route
//     {
//       path: '/internships',
//       icon: FiAward,
//       label: 'Manage Internships'
//     },
//     // ✅ UPDATED: Changed path to match internship leads route
//     {
//       path: '/internship-leads',
//       icon: FiUserCheck,
//       label: 'Internship Enrollments'
//     },
//     {
//       path: '/ratings',
//       icon: FiStar,
//       label: 'Ratings & Feedback'
//     },
//     // ✅ NEW: Add separate entry for project leads (Phase 1)
//     {
//       path: '/leads',
//       icon: FiMail,
//       label: 'Project Leads'
//     },
//     // ✅ NEW: Add projects management (Phase 1)
//     {
//       path: '/projects',
//       icon: FiFileText,
//       label: 'Manage Projects'
//     },
//     {
//       path: '/analytics',
//       icon: FiBarChart,
//       label: 'Analytics'
//     },
//     {
//       path: '/change-password',
//       icon: FiLock,
//       label: 'Change Password'
//     },
//     {
//       path: '/settings',
//       icon: FiSettings,
//       label: 'Settings'
//     }
//   ];

//   return (
//     <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
//       <nav className="sidebar-nav">
//         <ul className="nav-list">
//           {menuItems.map((item) => {
//             const Icon = item.icon;
//             return (
//               <li key={item.path} className="nav-item">
//                 <NavLink
//                   to={item.path}
//                   className={({ isActive }) => {
//                     console.log(`🧭 SIDEBAR - ${item.label} isActive:`, isActive);
//                     return `nav-link ${isActive ? 'active' : ''}`;
//                   }}
//                   onClick={() => {
//                     console.log(`🧭 SIDEBAR - Clicked ${item.label} -> ${item.path}`);
//                   }}
//                 >
//                   <Icon className="nav-icon" />
//                   {isOpen && <span className="nav-label">{item.label}</span>}
//                 </NavLink>
//               </li>
//             );
//           })}
//         </ul>
//       </nav>
//     </aside>
//   );
// };

// export default Sidebar;

// // // src/components/common/Sidebar.js - UPDATED FOR INTERNSHIP MANAGEMENT
// // import React from 'react';
// // import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// // import { 
// //   FiHome, 
// //   FiFolder, 
// //   FiFileText, 
// //   FiUsers, 
// //   FiSettings,
// //   FiLock,
// //   FiGitBranch,
// //   FiAward,
// //   FiStar,
// //   FiUserCheck,
// //   FiBarChart
// // } from 'react-icons/fi';

// // const Sidebar = ({ isOpen }) => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   console.log('🧭 SIDEBAR - Current location:', location.pathname);

// //   const menuItems = [
// //     {
// //       path: '/dashboard',
// //       icon: FiHome,
// //       label: 'Dashboard'
// //     },
// //     {
// //       path: '/branches',
// //       icon: FiGitBranch,
// //       label: 'Manage Branches'
// //     },
// //     {
// //       path: '/domains',
// //       icon: FiFolder,
// //       label: 'Manage Domains'
// //     },
// //     {
// //       path: '/internships',
// //       icon: FiAward,
// //       label: 'Manage Internships'
// //     },
// //     {
// //       path: '/enrollments',
// //       icon: FiUserCheck,
// //       label: 'View Enrollments'
// //     },
// //     {
// //       path: '/ratings',
// //       icon: FiStar,
// //       label: 'Ratings & Feedback'
// //     },
// //     {
// //       path: '/analytics',
// //       icon: FiBarChart,
// //       label: 'Analytics'
// //     },
// //     {
// //       path: '/change-password',
// //       icon: FiLock,
// //       label: 'Change Password'
// //     },
// //     {
// //       path: '/settings',
// //       icon: FiSettings,
// //       label: 'Settings'
// //     }
// //   ];

// //   return (
// //     <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
// //       <nav className="sidebar-nav">
// //         <ul className="nav-list">
// //           {menuItems.map((item) => {
// //             const Icon = item.icon;
            
// //             return (
// //               <li key={item.path} className="nav-item">
// //                 <NavLink
// //                   to={item.path}
// //                   className={({ isActive }) => {
// //                     console.log(`🧭 SIDEBAR - ${item.label} isActive:`, isActive);
// //                     return `nav-link ${isActive ? 'active' : ''}`;
// //                   }}
// //                   onClick={() => {
// //                     console.log(`🧭 SIDEBAR - Clicked ${item.label} -> ${item.path}`);
// //                   }}
// //                 >
// //                   <Icon className="nav-icon" />
// //                   {isOpen && <span className="nav-label">{item.label}</span>}
// //                 </NavLink>
// //               </li>
// //             );
// //           })}
// //         </ul>
// //       </nav>
// //     </aside>
// //   );
// // };

// // export default Sidebar;

// // // // src/components/common/Sidebar.js - DEBUG VERSION
// // // import React from 'react';
// // // import { NavLink, useNavigate, useLocation } from 'react-router-dom';
// // // import { 
// // //   FiHome, 
// // //   FiFolder, 
// // //   FiFileText, 
// // //   FiUsers, 
// // //   FiSettings,
// // //   FiLock
// // // } from 'react-icons/fi';

// // // const Sidebar = ({ isOpen }) => {
// // //   const navigate = useNavigate();
// // //   const location = useLocation();

// // //   console.log('🧭 SIDEBAR - Current location:', location.pathname);

// // //   const handleProjectsClick = (e) => {
// // //     e.preventDefault();
// // //     console.log('🎯 SIDEBAR - Projects button clicked!');
// // //     console.log('🧭 SIDEBAR - Current location before navigation:', location.pathname);
    
// // //     try {
// // //       navigate('/projects');
// // //       console.log('✅ SIDEBAR - Navigate to /projects called');
// // //     } catch (error) {
// // //       console.error('❌ SIDEBAR - Navigation error:', error);
// // //     }
// // //   };

// // //   const menuItems = [
// // //     {
// // //       path: '/dashboard',
// // //       icon: FiHome,
// // //       label: 'Dashboard'
// // //     },
// // //     {
// // //       path: '/domains',
// // //       icon: FiFolder,
// // //       label: 'Domains'
// // //     },
// // //     {
// // //       path: '/projects',
// // //       icon: FiFileText,
// // //       label: 'Projects',
// // //       onClick: handleProjectsClick // Add custom click handler for debugging
// // //     },
// // //     {
// // //       path: '/leads',
// // //       icon: FiUsers,
// // //       label: 'Leads'
// // //     },
// // //     {
// // //       path: '/change-password',
// // //       icon: FiLock,
// // //       label: 'Change Password'
// // //     },
// // //     {
// // //       path: '/settings',
// // //       icon: FiSettings,
// // //       label: 'Settings'
// // //     }
// // //   ];

// // //   return (
// // //     <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
// // //       <nav className="sidebar-nav">
// // //         <ul className="nav-list">
// // //           {menuItems.map((item) => {
// // //             const Icon = item.icon;
            
// // //             // Special handling for Projects button with debug
// // //             if (item.label === 'Projects') {
// // //               return (
// // //                 <li key={item.path} className="nav-item">
// // //                   <button
// // //                     onClick={item.onClick}
// // //                     className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
// // //                     style={{
// // //                       background: 'none',
// // //                       border: 'none',
// // //                       width: '100%',
// // //                       textAlign: 'left',
// // //                       cursor: 'pointer',
// // //                       display: 'flex',
// // //                       alignItems: 'center',
// // //                       padding: '0.75rem 1rem',
// // //                       color: location.pathname === item.path ? 'var(--primary-color)' : 'var(--text-secondary)',
// // //                       textDecoration: 'none',
// // //                       transition: 'var(--transition)',
// // //                       borderRadius: 'var(--border-radius)',
// // //                       margin: '0.25rem 0'
// // //                     }}
// // //                   >
// // //                     <Icon className="nav-icon" style={{ marginRight: isOpen ? '0.75rem' : '0' }} />
// // //                     {isOpen && <span className="nav-label">{item.label}</span>}
// // //                   </button>
// // //                 </li>
// // //               );
// // //             }

// // //             // Regular menu items
// // //             return (
// // //               <li key={item.path} className="nav-item">
// // //                 <NavLink
// // //                   to={item.path}
// // //                   className={({ isActive }) => {
// // //                     console.log(`🧭 SIDEBAR - ${item.label} isActive:`, isActive);
// // //                     return `nav-link ${isActive ? 'active' : ''}`;
// // //                   }}
// // //                   onClick={() => {
// // //                     console.log(`🧭 SIDEBAR - Clicked ${item.label} -> ${item.path}`);
// // //                   }}
// // //                 >
// // //                   <Icon className="nav-icon" />
// // //                   {isOpen && <span className="nav-label">{item.label}</span>}
// // //                 </NavLink>
// // //               </li>
// // //             );
// // //           })}
// // //         </ul>
// // //       </nav>
// // //     </aside>
// // //   );
// // // };

// // // export default Sidebar;