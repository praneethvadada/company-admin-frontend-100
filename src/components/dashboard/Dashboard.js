import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { 
  FiFolder, 
  FiFileText, 
  FiUsers, 
  FiTrendingUp,
  FiCalendar
} from 'react-icons/fi';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalDomains: 0,
    totalProjects: 0,
    totalLeads: 0,
    recentLeads: 0,
    loading: true
  });

  console.log('📊 Dashboard: Component mounted');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('📊 Dashboard: Fetching dashboard data...');
      
      // Using mock data for now since API might not be ready
      console.log('📊 Dashboard: Using mock data for demo');
      setTimeout(() => {
        setStats({
          totalDomains: 12,
          totalProjects: 145,
          totalLeads: 89,
          recentLeads: 15,
          loading: false
        });
        console.log('✅ Dashboard: Mock data loaded');
      }, 1000);
      
    } catch (error) {
      console.error('❌ Dashboard: Failed to fetch dashboard data', error);
      toast.error('Failed to fetch dashboard data');
      setStats(prev => ({ ...prev, loading: false }));
    }
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
        <div className="stats-card blue">
          <div className="stats-card-header">
            <div className="stats-info">
              <h3 className="stats-title">Total Domains</h3>
              <p className="stats-value">{stats.totalDomains}</p>
            </div>
            <div className="stats-icon">
              <FiFolder />
            </div>
          </div>
          <div className="stats-footer">
            <div className="stats-change positive">
              <FiTrendingUp />
              <span>+12%</span>
            </div>
            <span className="stats-period">from last month</span>
          </div>
        </div>

        <div className="stats-card green">
          <div className="stats-card-header">
            <div className="stats-info">
              <h3 className="stats-title">Total Projects</h3>
              <p className="stats-value">{stats.totalProjects}</p>
            </div>
            <div className="stats-icon">
              <FiFileText />
            </div>
          </div>
          <div className="stats-footer">
            <div className="stats-change positive">
              <FiTrendingUp />
              <span>+8%</span>
            </div>
            <span className="stats-period">from last month</span>
          </div>
        </div>

        <div className="stats-card purple">
          <div className="stats-card-header">
            <div className="stats-info">
              <h3 className="stats-title">Total Leads</h3>
              <p className="stats-value">{stats.totalLeads}</p>
            </div>
            <div className="stats-icon">
              <FiUsers />
            </div>
          </div>
          <div className="stats-footer">
            <div className="stats-change positive">
              <FiTrendingUp />
              <span>+25%</span>
            </div>
            <span className="stats-period">from last month</span>
          </div>
        </div>

        <div className="stats-card orange">
          <div className="stats-card-header">
            <div className="stats-info">
              <h3 className="stats-title">Recent Leads</h3>
              <p className="stats-value">{stats.recentLeads}</p>
            </div>
            <div className="stats-icon">
              <FiTrendingUp />
            </div>
          </div>
          <div className="stats-footer">
            <div className="stats-change positive">
              <FiTrendingUp />
              <span>+5%</span>
            </div>
            <span className="stats-period">from last month</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
            <button className="view-all-button">View All</button>
          </div>
          
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-icon">
                <FiUsers />
              </div>
              <div className="activity-content">
                <p className="activity-message">New lead from John Doe - React Development</p>
                <span className="activity-time">2 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">
                <FiFileText />
              </div>
              <div className="activity-content">
                <p className="activity-message">Project "E-commerce Platform" was updated</p>
                <span className="activity-time">4 hours ago</span>
              </div>
            </div>
            
            <div className="activity-item">
              <div className="activity-icon">
                <FiFolder />
              </div>
              <div className="activity-content">
                <p className="activity-message">New domain "Mobile Apps" was added</p>
                <span className="activity-time">1 day ago</span>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Quick Actions</h2>
          </div>
          
          <div className="quick-actions">
            <button className="action-button">
              <FiFolder />
              <span>Add Domain</span>
            </button>
            <button className="action-button">
              <FiFileText />
              <span>Add Project</span>
            </button>
            <button className="action-button">
              <FiUsers />
              <span>View Leads</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
