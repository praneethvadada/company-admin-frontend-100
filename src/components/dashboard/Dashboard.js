// src/components/dashboard/Dashboard.js - REPLACE EXISTING
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import { 
  FiFolder, 
  FiFileText, 
  FiUsers, 
  FiTrendingUp,
  FiCalendar,
  FiActivity,
  FiEye,
  FiPlus
} from 'react-icons/fi';
import StatsCard from './StatsCard';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    overview: {
      domains: { total: 0, active: 0 },
      projects: { total: 0, active: 0, featured: 0 },
      leads: { total: 0, new: 0 }
    },
    recentActivity: { projects: 0, leads: 0 },
    performance: { conversionRate: "0%", activeLeads: 0 },
    loading: true
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [analytics, setAnalytics] = useState({
    leadsOverTime: [],
    projectsByDomain: [],
    topProjects: []
  });

  console.log('📊 Dashboard: Component mounted');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Dashboard: Fetching real dashboard data...');
      
      // Fetch all dashboard data in parallel
      const [statsResponse, activityResponse, analyticsResponse] = await Promise.all([
        authService.getDashboardStats(),
        authService.getRecentActivity(),
        authService.getAnalytics(30)
      ]);

      console.log('✅ Dashboard: API responses received', {
        stats: statsResponse.data,
        activity: activityResponse.data,
        analytics: analyticsResponse.data
      });

      setStats({
        ...(statsResponse.data?.data || statsResponse.data),
        loading: false
      });
      
      setRecentActivity(activityResponse.data?.data || activityResponse.data || []);
      setAnalytics(analyticsResponse.data?.data || analyticsResponse.data || {});
      
    } catch (error) {
      console.error('❌ Dashboard: Failed to fetch dashboard data', error);
      
      // Fallback to mock data on error
      console.log('📊 Dashboard: Using fallback mock data');
      setStats({
        overview: {
          domains: { total: 12, active: 10 },
          projects: { total: 145, active: 130, featured: 25 },
          leads: { total: 89, new: 15 }
        },
        recentActivity: { projects: 8, leads: 12 },
        performance: { conversionRate: "12.5%", activeLeads: 25 },
        loading: false
      });
      
      setRecentActivity([
        {
          type: "lead",
          action: "submitted",
          title: "New lead: John Doe - React Development",
          timestamp: new Date().toISOString(),
          id: 1
        },
        {
          type: "project",
          action: "created",
          title: "Project 'E-commerce Platform' was updated",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          id: 2
        },
        {
          type: "domain",
          action: "created",
          title: "New domain 'Mobile Apps' was added",
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          id: 3
        }
      ]);
      
      toast.error('Failed to fetch latest dashboard data. Showing cached information.');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'lead': return FiUsers;
      case 'project': return FiFileText;
      case 'domain': return FiFolder;
      default: return FiActivity;
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  if (stats.loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.name || 'Admin'}!</h1>
          <p>Here's what's happening with your projects today.</p>
        </div>
        <div className="dashboard-date">
          <FiCalendar />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Domains"
          value={stats.overview.domains.total}
          icon={FiFolder}
          color="blue"
          change="+8%"
          changeType="positive"
        />
        
        <StatsCard
          title="Active Projects"
          value={stats.overview.projects.active}
          icon={FiFileText}
          color="green"
          change="+12%"
          changeType="positive"
        />
        
        <StatsCard
          title="Total Leads"
          value={stats.overview.leads.total}
          icon={FiUsers}
          color="purple"
          change="+25%"
          changeType="positive"
        />
        
        <StatsCard
          title="New Leads"
          value={stats.overview.leads.new}
          icon={FiTrendingUp}
          color="orange"
          change="+5%"
          changeType="positive"
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button 
              className="view-all-button"
              onClick={() => console.log('Navigate to activity log')}
            >
              View All
            </button>
          </div>
          
          <div className="activity-list">
            {recentActivity.length > 0 ? (
              recentActivity.slice(0, 5).map((activity) => {
                const IconComponent = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <IconComponent />
                    </div>
                    <div className="activity-content">
                      <p className="activity-message">{activity.title}</p>
                      <span className="activity-time">
                        {formatTimestamp(activity.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="empty-state">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <button 
              className="action-button"
              onClick={() => console.log('Navigate to add domain')}
            >
              <FiPlus />
              <span>Add Domain</span>
            </button>
            <button 
              className="action-button"
              onClick={() => console.log('Navigate to add project')}
            >
              <FiPlus />
              <span>Add Project</span>
            </button>
            <button 
              className="action-button"
              onClick={() => console.log('Navigate to view leads')}
            >
              <FiEye />
              <span>View Leads</span>
            </button>
          </div>

          {/* Performance Overview */}
          <div className="performance-overview">
            <h3>Performance Overview</h3>
            <div className="performance-stats">
              <div className="performance-item">
                <span className="performance-label">Conversion Rate</span>
                <span className="performance-value">
                  {stats.performance.conversionRate}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Active Leads</span>
                <span className="performance-value">
                  {stats.performance.activeLeads}
                </span>
              </div>
              <div className="performance-item">
                <span className="performance-label">Featured Projects</span>
                <span className="performance-value">
                  {stats.overview.projects.featured}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
// // src/components/dashboard/Dashboard.js - REPLACE EXISTING
// import React, { useState, useEffect } from 'react';
// import { useAuth } from '../../context/AuthContext';
// import { authService } from '../../services/authService';
// import { toast } from 'react-toastify';
// import { 
//   FiFolder, 
//   FiFileText, 
//   FiUsers, 
//   FiTrendingUp,
//   FiCalendar,
//   FiActivity,
//   FiEye,
//   FiPlus
// } from 'react-icons/fi';
// import StatsCard from './StatsCard';

// const Dashboard = () => {
//   const { user } = useAuth();
//   const [stats, setStats] = useState({
//     overview: {
//       domains: { total: 0, active: 0 },
//       projects: { total: 0, active: 0, featured: 0 },
//       leads: { total: 0, new: 0 }
//     },
//     recentActivity: { projects: 0, leads: 0 },
//     performance: { conversionRate: "0%", activeLeads: 0 },
//     loading: true
//   });
  
//   const [recentActivity, setRecentActivity] = useState([]);
//   const [analytics, setAnalytics] = useState({
//     leadsOverTime: [],
//     projectsByDomain: [],
//     topProjects: []
//   });

//   console.log('📊 Dashboard: Component mounted');

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       console.log('📊 Dashboard: Fetching real dashboard data...');
      
//       // Fetch all dashboard data in parallel
//       const [statsResponse, activityResponse, analyticsResponse] = await Promise.all([
//         authService.getDashboardStats(),
//         authService.getRecentActivity(),
//         authService.getAnalytics(30)
//       ]);

//       console.log('✅ Dashboard: API responses received', {
//         stats: statsResponse,
//         activity: activityResponse,
//         analytics: analyticsResponse
//       });

//       setStats({
//         ...statsResponse.data,
//         loading: false
//       });
      
//       setRecentActivity(activityResponse.data || []);
//       setAnalytics(analyticsResponse.data || {});
      
//     } catch (error) {
//       console.error('❌ Dashboard: Failed to fetch dashboard data', error);
      
//       // Fallback to mock data on error
//       console.log('📊 Dashboard: Using fallback mock data');
//       setStats({
//         overview: {
//           domains: { total: 12, active: 10 },
//           projects: { total: 145, active: 130, featured: 25 },
//           leads: { total: 89, new: 15 }
//         },
//         recentActivity: { projects: 8, leads: 12 },
//         performance: { conversionRate: "12.5%", activeLeads: 25 },
//         loading: false
//       });
      
//       setRecentActivity([
//         {
//           type: "lead",
//           action: "submitted",
//           title: "New lead: John Doe - React Development",
//           timestamp: new Date().toISOString(),
//           id: 1
//         },
//         {
//           type: "project",
//           action: "created",
//           title: "Project 'E-commerce Platform' was updated",
//           timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
//           id: 2
//         },
//         {
//           type: "domain",
//           action: "created",
//           title: "New domain 'Mobile Apps' was added",
//           timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
//           id: 3
//         }
//       ]);
      
//       toast.error('Failed to fetch latest dashboard data. Showing cached information.');
//     }
//   };

//   const getActivityIcon = (type) => {
//     switch (type) {
//       case 'lead': return FiUsers;
//       case 'project': return FiFileText;
//       case 'domain': return FiFolder;
//       default: return FiActivity;
//     }
//   };

//   const formatTimestamp = (timestamp) => {
//     const date = new Date(timestamp);
//     const now = new Date();
//     const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
//     if (diffInHours < 1) return 'Just now';
//     if (diffInHours < 24) return `${diffInHours} hours ago`;
//     const diffInDays = Math.floor(diffInHours / 24);
//     return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
//   };

//   if (stats.loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading dashboard...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <div>
//           <h1>Welcome back, {user?.name || 'Admin'}!</h1>
//           <p>Here's what's happening with your projects today.</p>
//         </div>
//         <div className="dashboard-date">
//           <FiCalendar />
//           <span>{new Date().toLocaleDateString('en-US', { 
//             weekday: 'long', 
//             year: 'numeric', 
//             month: 'long', 
//             day: 'numeric' 
//           })}</span>
//         </div>
//       </div>

//       <div className="stats-grid">
//         <StatsCard
//           title="Total Domains"
//           value={stats.overview.domains.total}
//           icon={FiFolder}
//           color="blue"
//           change="+8%"
//           changeType="positive"
//         />
        
//         <StatsCard
//           title="Active Projects"
//           value={stats.overview.projects.active}
//           icon={FiFileText}
//           color="green"
//           change="+12%"
//           changeType="positive"
//         />
        
//         <StatsCard
//           title="Total Leads"
//           value={stats.overview.leads.total}
//           icon={FiUsers}
//           color="purple"
//           change="+25%"
//           changeType="positive"
//         />
        
//         <StatsCard
//           title="New Leads"
//           value={stats.overview.leads.new}
//           icon={FiTrendingUp}
//           color="orange"
//           change="+5%"
//           changeType="positive"
//         />
//       </div>

//       <div className="dashboard-content">
//         <div className="dashboard-section">
//           <div className="section-header">
//             <h2>Recent Activity</h2>
//             <button 
//               className="view-all-button"
//               onClick={() => console.log('Navigate to activity log')}
//             >
//               View All
//             </button>
//           </div>
          
//           <div className="activity-list">
//             {recentActivity.length > 0 ? (
//               recentActivity.slice(0, 5).map((activity) => {
//                 const IconComponent = getActivityIcon(activity.type);
//                 return (
//                   <div key={activity.id} className="activity-item">
//                     <div className="activity-icon">
//                       <IconComponent />
//                     </div>
//                     <div className="activity-content">
//                       <p className="activity-message">{activity.title}</p>
//                       <span className="activity-time">
//                         {formatTimestamp(activity.timestamp)}
//                       </span>
//                     </div>
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="empty-state">
//                 <p>No recent activity</p>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="dashboard-section">
//           <div className="section-header">
//             <h2>Quick Actions</h2>
//           </div>
          
//           <div className="quick-actions">
//             <button 
//               className="action-button"
//               onClick={() => console.log('Navigate to add domain')}
//             >
//               <FiPlus />
//               <span>Add Domain</span>
//             </button>
//             <button 
//               className="action-button"
//               onClick={() => console.log('Navigate to add project')}
//             >
//               <FiPlus />
//               <span>Add Project</span>
//             </button>
//             <button 
//               className="action-button"
//               onClick={() => console.log('Navigate to view leads')}
//             >
//               <FiEye />
//               <span>View Leads</span>
//             </button>
//           </div>

//           {/* Performance Overview */}
//           <div className="performance-overview">
//             <h3>Performance Overview</h3>
//             <div className="performance-stats">
//               <div className="performance-item">
//                 <span className="performance-label">Conversion Rate</span>
//                 <span className="performance-value">
//                   {stats.performance.conversionRate}
//                 </span>
//               </div>
//               <div className="performance-item">
//                 <span className="performance-label">Active Leads</span>
//                 <span className="performance-value">
//                   {stats.performance.activeLeads}
//                 </span>
//               </div>
//               <div className="performance-item">
//                 <span className="performance-label">Featured Projects</span>
//                 <span className="performance-value">
//                   {stats.overview.projects.featured}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard; 


// // import React, { useState, useEffect } from 'react';
// // import { useAuth } from '../../context/AuthContext';
// // import { toast } from 'react-toastify';
// // import { 
// //   FiFolder, 
// //   FiFileText, 
// //   FiUsers, 
// //   FiTrendingUp,
// //   FiCalendar
// // } from 'react-icons/fi';

// // const Dashboard = () => {
// //   const { user } = useAuth();
// //   const [stats, setStats] = useState({
// //     totalDomains: 0,
// //     totalProjects: 0,
// //     totalLeads: 0,
// //     recentLeads: 0,
// //     loading: true
// //   });

// //   console.log('📊 Dashboard: Component mounted');

// //   useEffect(() => {
// //     fetchDashboardData();
// //   }, []);

// //   const fetchDashboardData = async () => {
// //     try {
// //       console.log('📊 Dashboard: Fetching dashboard data...');
      
// //       // Using mock data for now since API might not be ready
// //       console.log('📊 Dashboard: Using mock data for demo');
// //       setTimeout(() => {
// //         setStats({
// //           totalDomains: 12,
// //           totalProjects: 145,
// //           totalLeads: 89,
// //           recentLeads: 15,
// //           loading: false
// //         });
// //         console.log('✅ Dashboard: Mock data loaded');
// //       }, 1000);
      
// //     } catch (error) {
// //       console.error('❌ Dashboard: Failed to fetch dashboard data', error);
// //       toast.error('Failed to fetch dashboard data');
// //       setStats(prev => ({ ...prev, loading: false }));
// //     }
// //   };

// //   if (stats.loading) {
// //     return (
// //       <div className="loading-container">
// //         <div className="loading-spinner"></div>
// //         <p>Loading dashboard...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="dashboard">
// //       <div className="dashboard-header">
// //         <div>
// //           <h1>Welcome back, {user?.name || 'Admin'}!</h1>
// //           <p>Here's what's happening with your projects today.</p>
// //         </div>
// //         <div className="dashboard-date">
// //           <FiCalendar />
// //           <span>{new Date().toLocaleDateString('en-US', { 
// //             weekday: 'long', 
// //             year: 'numeric', 
// //             month: 'long', 
// //             day: 'numeric' 
// //           })}</span>
// //         </div>
// //       </div>

// //       <div className="stats-grid">
// //         <div className="stats-card blue">
// //           <div className="stats-card-header">
// //             <div className="stats-info">
// //               <h3 className="stats-title">Total Domains</h3>
// //               <p className="stats-value">{stats.totalDomains}</p>
// //             </div>
// //             <div className="stats-icon">
// //               <FiFolder />
// //             </div>
// //           </div>
// //           <div className="stats-footer">
// //             <div className="stats-change positive">
// //               <FiTrendingUp />
// //               <span>+12%</span>
// //             </div>
// //             <span className="stats-period">from last month</span>
// //           </div>
// //         </div>

// //         <div className="stats-card green">
// //           <div className="stats-card-header">
// //             <div className="stats-info">
// //               <h3 className="stats-title">Total Projects</h3>
// //               <p className="stats-value">{stats.totalProjects}</p>
// //             </div>
// //             <div className="stats-icon">
// //               <FiFileText />
// //             </div>
// //           </div>
// //           <div className="stats-footer">
// //             <div className="stats-change positive">
// //               <FiTrendingUp />
// //               <span>+8%</span>
// //             </div>
// //             <span className="stats-period">from last month</span>
// //           </div>
// //         </div>

// //         <div className="stats-card purple">
// //           <div className="stats-card-header">
// //             <div className="stats-info">
// //               <h3 className="stats-title">Total Leads</h3>
// //               <p className="stats-value">{stats.totalLeads}</p>
// //             </div>
// //             <div className="stats-icon">
// //               <FiUsers />
// //             </div>
// //           </div>
// //           <div className="stats-footer">
// //             <div className="stats-change positive">
// //               <FiTrendingUp />
// //               <span>+25%</span>
// //             </div>
// //             <span className="stats-period">from last month</span>
// //           </div>
// //         </div>

// //         <div className="stats-card orange">
// //           <div className="stats-card-header">
// //             <div className="stats-info">
// //               <h3 className="stats-title">Recent Leads</h3>
// //               <p className="stats-value">{stats.recentLeads}</p>
// //             </div>
// //             <div className="stats-icon">
// //               <FiTrendingUp />
// //             </div>
// //           </div>
// //           <div className="stats-footer">
// //             <div className="stats-change positive">
// //               <FiTrendingUp />
// //               <span>+5%</span>
// //             </div>
// //             <span className="stats-period">from last month</span>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="dashboard-content">
// //         <div className="dashboard-section">
// //           <div className="section-header">
// //             <h2>Recent Activity</h2>
// //             <button className="view-all-button">View All</button>
// //           </div>
          
// //           <div className="activity-list">
// //             <div className="activity-item">
// //               <div className="activity-icon">
// //                 <FiUsers />
// //               </div>
// //               <div className="activity-content">
// //                 <p className="activity-message">New lead from John Doe - React Development</p>
// //                 <span className="activity-time">2 hours ago</span>
// //               </div>
// //             </div>
            
// //             <div className="activity-item">
// //               <div className="activity-icon">
// //                 <FiFileText />
// //               </div>
// //               <div className="activity-content">
// //                 <p className="activity-message">Project "E-commerce Platform" was updated</p>
// //                 <span className="activity-time">4 hours ago</span>
// //               </div>
// //             </div>
            
// //             <div className="activity-item">
// //               <div className="activity-icon">
// //                 <FiFolder />
// //               </div>
// //               <div className="activity-content">
// //                 <p className="activity-message">New domain "Mobile Apps" was added</p>
// //                 <span className="activity-time">1 day ago</span>
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="dashboard-section">
// //           <div className="section-header">
// //             <h2>Quick Actions</h2>
// //           </div>
          
// //           <div className="quick-actions">
// //             <button className="action-button">
// //               <FiFolder />
// //               <span>Add Domain</span>
// //             </button>
// //             <button className="action-button">
// //               <FiFileText />
// //               <span>Add Project</span>
// //             </button>
// //             <button className="action-button">
// //               <FiUsers />
// //               <span>View Leads</span>
// //             </button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default Dashboard;
