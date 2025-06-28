// src/components/leads/LeadManagement.js - NEW FILE
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiMail,
  FiPhone,
  FiUser,
  FiMapPin,
  FiCalendar,
  FiFileText,
  FiEdit,
  FiEye,
  FiMoreVertical,
  FiUsers,
  FiClock
} from 'react-icons/fi';

const LeadManagement = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: 'new',
    projectId: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC'
  });
  const [projects, setProjects] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const leadStatuses = [
    { value: 'new', label: 'New', color: '#3b82f6' },
    { value: 'contacted', label: 'Contacted', color: '#f59e0b' },
    { value: 'qualified', label: 'Qualified', color: '#10b981' },
    { value: 'converted', label: 'Converted', color: '#059669' },
    { value: 'closed', label: 'Closed', color: '#6b7280' }
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [filters, pagination.currentPage]);

  const fetchInitialData = async () => {
    try {
      const projectsResponse = await authService.getProjects({ limit: 100 });
      setProjects(projectsResponse.data?.projects || projectsResponse.data?.data?.projects || []);
    } catch (error) {
      console.error('❌ Error fetching initial data:', error);
    }
  };

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 15,
        ...filters
      };
      
      const response = await authService.getLeads(params);
      console.log('✅ Leads fetched:', response.data);
      
      setLeads(response.data?.leads || response.data?.data?.leads || []);
      setPagination(response.data?.pagination || response.data?.data?.pagination || pagination);
    } catch (error) {
      console.error('❌ Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleUpdateLead = async (leadId, updateData) => {
    try {
      await authService.updateLead(leadId, updateData);
      toast.success('Lead updated successfully');
      fetchLeads();
      setShowUpdateModal(false);
      setSelectedLead(null);
    } catch (error) {
      console.error('❌ Error updating lead:', error);
      toast.error('Failed to update lead');
    }
  };

  const handleExportLeads = async () => {
    try {
      const blob = await authService.exportLeads(filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success('Leads exported successfully');
    } catch (error) {
      console.error('❌ Error exporting leads:', error);
      toast.error('Failed to export leads');
    }
  };

  const getStatusColor = (status) => {
    const statusConfig = leadStatuses.find(s => s.value === status);
    return statusConfig?.color || '#6b7280';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && leads.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading leads...</p>
      </div>
    );
  }

  return (
    <div className="lead-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Lead Management</h1>
          <p>Track and manage customer inquiries and conversions</p>
        </div>
        <button className="primary-button" onClick={handleExportLeads}>
          <FiDownload />
          Export CSV
        </button>
      </div>

      {/* Stats Overview */}
      <div className="lead-stats">
        {leadStatuses.map(status => {
          const count = leads.filter(lead => lead.status === status.value).length;
          return (
            <div key={status.value} className="stat-card" style={{ borderLeftColor: status.color }}>
              <div className="stat-number">{count}</div>
              <div className="stat-label">{status.label}</div>
            </div>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search leads by name, email, or company..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            {leadStatuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          
          <select
            value={filters.projectId}
            onChange={(e) => handleFilterChange('projectId', e.target.value)}
          >
            <option value="">All Projects</option>
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.title}</option>
            ))}
          </select>
          
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            placeholder="From Date"
          />
          
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            placeholder="To Date"
          />
          
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="createdAt">Sort by Date</option>
            <option value="fullName">Sort by Name</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="leads-table-container">
        {leads.length > 0 ? (
          <table className="leads-table">
            <thead>
              <tr>
                <th>Lead Info</th>
                <th>Contact</th>
                <th>Project</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <LeadRow
                  key={lead.id}
                  lead={lead}
                  onView={() => setSelectedLead(lead)}
                  onUpdate={() => {
                    setSelectedLead(lead);
                    setShowUpdateModal(true);
                  }}
                  getStatusColor={getStatusColor}
                  formatDate={formatDate}
                />
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <FiUsers size={48} />
            <h3>No leads found</h3>
            <p>No leads match your current filters</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.currentPage === 1}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {pagination.currentPage} of {pagination.totalPages}
            ({pagination.totalItems} total)
          </span>
          
          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Lead Details Modal */}
      {selectedLead && !showUpdateModal && (
        <LeadDetailsModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onUpdate={() => {
            setShowUpdateModal(true);
          }}
          formatDate={formatDate}
          getStatusColor={getStatusColor}
        />
      )}

      {/* Update Lead Modal */}
      {showUpdateModal && selectedLead && (
        <UpdateLeadModal
          lead={selectedLead}
          leadStatuses={leadStatuses}
          onClose={() => {
            setShowUpdateModal(false);
            setSelectedLead(null);
          }}
          onUpdate={handleUpdateLead}
        />
      )}
    </div>
  );
};

// Lead Row Component
const LeadRow = ({ lead, onView, onUpdate, getStatusColor, formatDate }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="lead-row">
      <td className="lead-info">
        <div className="lead-name">
          <FiUser className="lead-icon" />
          <span className="name">{lead.fullName}</span>
        </div>
        <div className="lead-details">
          <span className="college">{lead.collegeName}</span>
          <span className="branch">{lead.branch}</span>
        </div>
      </td>
      
      <td className="contact-info">
        <div className="contact-item">
          <FiMail />
          <a href={`mailto:${lead.email}`}>{lead.email}</a>
        </div>
        <div className="contact-item">
          <FiPhone />
          <a href={`tel:${lead.phone}`}>{lead.phone}</a>
        </div>
        <div className="contact-item">
          <FiMapPin />
          <span>{lead.city}</span>
        </div>
      </td>
      
      <td className="project-info">
        <div className="project-name">
          <FiFileText />
          <span>{lead.project?.title || 'Unknown Project'}</span>
        </div>
      </td>
      
      <td className="status-cell">
        <span 
          className="status-badge" 
          style={{ backgroundColor: getStatusColor(lead.status) }}
        >
          {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
        </span>
      </td>
      
      <td className="date-cell">
        <div className="date-info">
          <FiCalendar />
          <span>{formatDate(lead.createdAt)}</span>
        </div>
      </td>
      
      <td className="actions-cell">
        <div className="action-menu">
          <button onClick={() => setShowMenu(!showMenu)}>
            <FiMoreVertical />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => onView()}>
                <FiEye /> View Details
              </button>
              <button onClick={() => onUpdate()}>
                <FiEdit /> Update Status
              </button>
              <button onClick={() => window.open(`mailto:${lead.email}`)}>
                <FiMail /> Send Email
              </button>
              <button onClick={() => window.open(`tel:${lead.phone}`)}>
                <FiPhone /> Call
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

// Lead Details Modal
const LeadDetailsModal = ({ lead, onClose, onUpdate, formatDate, getStatusColor }) => {
  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Lead Details</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="lead-details">
          <div className="detail-grid">
            <div className="detail-section">
              <h3>Personal Information</h3>
              <div className="detail-item">
                <strong>Name:</strong> {lead.fullName}
              </div>
              <div className="detail-item">
                <strong>Email:</strong> 
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </div>
              <div className="detail-item">
                <strong>Phone:</strong> 
                <a href={`tel:${lead.phone}`}>{lead.phone}</a>
              </div>
              <div className="detail-item">
                <strong>City:</strong> {lead.city}
              </div>
            </div>
            
            <div className="detail-section">
              <h3>Academic Information</h3>
              <div className="detail-item">
                <strong>College:</strong> {lead.collegeName}
              </div>
              <div className="detail-item">
                <strong>Branch:</strong> {lead.branch}
              </div>
            </div>
            
            <div className="detail-section">
              <h3>Project Interest</h3>
              <div className="detail-item">
                <strong>Project:</strong> {lead.project?.title || 'Unknown'}
              </div>
              <div className="detail-item">
                <strong>Inquiry Date:</strong> {formatDate(lead.createdAt)}
              </div>
            </div>
            
            <div className="detail-section">
              <h3>Status & Notes</h3>
              <div className="detail-item">
                <strong>Status:</strong>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(lead.status) }}
                >
                  {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                </span>
              </div>
              {lead.notes && (
                <div className="detail-item">
                  <strong>Notes:</strong>
                  <p>{lead.notes}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="modal-actions">
            <button onClick={onUpdate} className="primary-button">
              Update Status
            </button>
            <button onClick={() => window.open(`mailto:${lead.email}`)}>
              Send Email
            </button>
            <button onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Update Lead Modal
const UpdateLeadModal = ({ lead, leadStatuses, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    status: lead.status,
    notes: lead.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await onUpdate(lead.id, formData);
    } catch (error) {
      console.error('Error updating lead:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Update Lead Status</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="lead-summary">
            <h3>{lead.fullName}</h3>
            <p>{lead.email} | {lead.project?.title}</p>
          </div>
          
          <div className="form-group">
            <label>Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
              required
            >
              {leadStatuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={4}
              placeholder="Add notes about this lead..."
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Lead'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadManagement;


// // src/components/leads/LeadManagement.js - NEW FILE
// import React, { useState, useEffect } from 'react';
// import { authService } from '../../services/authService';
// import { toast } from 'react-toastify';
// import {
//   FiSearch,
//   FiFilter,
//   FiDownload,
//   FiMail,
//   FiPhone,
//   FiUser,
//   FiMapPin,
//   FiCalendar,
//   FiFileText,
//   FiEdit,
//   FiEye,
//   FiMoreVertical,
//   FiUsers,
//   FiClock
// } from 'react-icons/fi';

// const LeadManagement = () => {
//   const [leads, setLeads] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0
//   });
//   const [filters, setFilters] = useState({
//     search: '',
//     status: 'new',
//     projectId: '',
//     dateFrom: '',
//     dateTo: '',
//     sortBy: 'createdAt',
//     sortOrder: 'DESC'
//   });
//   const [projects, setProjects] = useState([]);
//   const [selectedLead, setSelectedLead] = useState(null);
//   const [showUpdateModal, setShowUpdateModal] = useState(false);

//   const leadStatuses = [
//     { value: 'new', label: 'New', color: '#3b82f6' },
//     { value: 'contacted', label: 'Contacted', color: '#f59e0b' },
//     { value: 'qualified', label: 'Qualified', color: '#10b981' },
//     { value: 'converted', label: 'Converted', color: '#059669' },
//     { value: 'closed', label: 'Closed', color: '#6b7280' }
//   ];

//   useEffect(() => {
//     fetchInitialData();
//   }, []);

//   useEffect(() => {
//     fetchLeads();
//   }, [filters, pagination.currentPage]);

//   const fetchInitialData = async () => {
//     try {
//       const projectsResponse = await authService.getProjects({ limit: 100 });
//       setProjects(projectsResponse.data.projects || []);
//     } catch (error) {
//       console.error('❌ Error fetching initial data:', error);
//     }
//   };

//   const fetchLeads = async () => {
//     try {
//       setLoading(true);
//       const params = {
//         page: pagination.currentPage,
//         limit: 15,
//         ...filters
//       };
      
//       const response = await authService.getLeads(params);
//       console.log('✅ Leads fetched:', response);
      
//       setLeads(response.data.leads || []);
//       setPagination(response.data.pagination || pagination);
//     } catch (error) {
//       console.error('❌ Error fetching leads:', error);
//       toast.error('Failed to fetch leads');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSearch = (searchTerm) => {
//     setFilters(prev => ({ ...prev, search: searchTerm }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handleFilterChange = (filterKey, value) => {
//     setFilters(prev => ({ ...prev, [filterKey]: value }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handleUpdateLead = async (leadId, updateData) => {
//     try {
//       await authService.updateLead(leadId, updateData);
//       toast.success('Lead updated successfully');
//       fetchLeads();
//       setShowUpdateModal(false);
//       setSelectedLead(null);
//     } catch (error) {
//       console.error('❌ Error updating lead:', error);
//       toast.error('Failed to update lead');
//     }
//   };

//   const handleExportLeads = async () => {
//     try {
//       const blob = await authService.exportLeads(filters);
//       const url = window.URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`;
//       document.body.appendChild(a);
//       a.click();
//       document.body.removeChild(a);
//       window.URL.revokeObjectURL(url);
//       toast.success('Leads exported successfully');
//     } catch (error) {
//       console.error('❌ Error exporting leads:', error);
//       toast.error('Failed to export leads');
//     }
//   };

//   const getStatusColor = (status) => {
//     const statusConfig = leadStatuses.find(s => s.value === status);
//     return statusConfig?.color || '#6b7280';
//   };

//   const formatDate = (dateString) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'short',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   if (loading && leads.length === 0) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading leads...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="lead-management">
//       <div className="page-header">
//         <div className="header-content">
//           <h1>Lead Management</h1>
//           <p>Track and manage customer inquiries and conversions</p>
//         </div>
//         <button className="primary-button" onClick={handleExportLeads}>
//           <FiDownload />
//           Export CSV
//         </button>
//       </div>

//       {/* Stats Overview */}
//       <div className="lead-stats">
//         {leadStatuses.map(status => {
//           const count = leads.filter(lead => lead.status === status.value).length;
//           return (
//             <div key={status.value} className="stat-card" style={{ borderLeftColor: status.color }}>
//               <div className="stat-number">{count}</div>
//               <div className="stat-label">{status.label}</div>
//             </div>
//           );
//         })}
//       </div>

//       {/* Filters and Controls */}
//       <div className="controls-section">
//         <div className="search-bar">
//           <FiSearch className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search leads by name, email, or company..."
//             value={filters.search}
//             onChange={(e) => handleSearch(e.target.value)}
//           />
//         </div>
        
//         <div className="filter-controls">
//           <select
//             value={filters.status}
//             onChange={(e) => handleFilterChange('status', e.target.value)}
//           >
//             <option value="">All Statuses</option>
//             {leadStatuses.map(status => (
//               <option key={status.value} value={status.value}>{status.label}</option>
//             ))}
//           </select>
          
//           <select
//             value={filters.projectId}
//             onChange={(e) => handleFilterChange('projectId', e.target.value)}
//           >
//             <option value="">All Projects</option>
//             {projects.map(project => (
//               <option key={project.id} value={project.id}>{project.title}</option>
//             ))}
//           </select>
          
//           <input
//             type="date"
//             value={filters.dateFrom}
//             onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
//             placeholder="From Date"
//           />
          
//           <input
//             type="date"
//             value={filters.dateTo}
//             onChange={(e) => handleFilterChange('dateTo', e.target.value)}
//             placeholder="To Date"
//           />
          
//           <select
//             value={filters.sortBy}
//             onChange={(e) => handleFilterChange('sortBy', e.target.value)}
//           >
//             <option value="createdAt">Sort by Date</option>
//             <option value="fullName">Sort by Name</option>
//             <option value="status">Sort by Status</option>
//           </select>
//         </div>
//       </div>

//       {/* Leads Table */}
//       <div className="leads-table-container">
//         {leads.length > 0 ? (
//           <table className="leads-table">
//             <thead>
//               <tr>
//                 <th>Lead Info</th>
//                 <th>Contact</th>
//                 <th>Project</th>
//                 <th>Status</th>
//                 <th>Date</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {leads.map((lead) => (
//                 <LeadRow
//                   key={lead.id}
//                   lead={lead}
//                   onView={() => setSelectedLead(lead)}
//                   onUpdate={() => {
//                     setSelectedLead(lead);
//                     setShowUpdateModal(true);
//                   }}
//                   getStatusColor={getStatusColor}
//                   formatDate={formatDate}
//                 />
//               ))}
//             </tbody>
//           </table>
//         ) : (
//           <div className="empty-state">
//             <FiUsers size={48} />
//             <h3>No leads found</h3>
//             <p>No leads match your current filters</p>
//           </div>
//         )}
//       </div>

//       {/* Pagination */}
//       {pagination.totalPages > 1 && (
//         <div className="pagination">
//           <button
//             disabled={pagination.currentPage === 1}
//             onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
//           >
//             Previous
//           </button>
          
//           <span className="page-info">
//             Page {pagination.currentPage} of {pagination.totalPages}
//             ({pagination.totalItems} total)
//           </span>
          
//           <button
//             disabled={pagination.currentPage === pagination.totalPages}
//             onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
//           >
//             Next
//           </button>
//         </div>
//       )}

//       {/* Lead Details Modal */}
//       {selectedLead && !showUpdateModal && (
//         <LeadDetailsModal
//           lead={selectedLead}
//           onClose={() => setSelectedLead(null)}
//           onUpdate={() => {
//             setShowUpdateModal(true);
//           }}
//           formatDate={formatDate}
//           getStatusColor={getStatusColor}
//         />
//       )}

//       {/* Update Lead Modal */}
//       {showUpdateModal && selectedLead && (
//         <UpdateLeadModal
//           lead={selectedLead}
//           leadStatuses={leadStatuses}
//           onClose={() => {
//             setShowUpdateModal(false);
//             setSelectedLead(null);
//           }}
//           onUpdate={handleUpdateLead}
//         />
//       )}
//     </div>
//   );
// };

// // Lead Row Component
// const LeadRow = ({ lead, onView, onUpdate, getStatusColor, formatDate }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   return (
//     <tr className="lead-row">
//       <td className="lead-info">
//         <div className="lead-name">
//           <FiUser className="lead-icon" />
//           <span className="name">{lead.fullName}</span>
//         </div>
//         <div className="lead-details">
//           <span className="college">{lead.collegeName}</span>
//           <span className="branch">{lead.branch}</span>
//         </div>
//       </td>
      
//       <td className="contact-info">
//         <div className="contact-item">
//           <FiMail />
//           <a href={`mailto:${lead.email}`}>{lead.email}</a>
//         </div>
//         <div className="contact-item">
//           <FiPhone />
//           <a href={`tel:${lead.phone}`}>{lead.phone}</a>
//         </div>
//         <div className="contact-item">
//           <FiMapPin />
//           <span>{lead.city}</span>
//         </div>
//       </td>
      
//       <td className="project-info">
//         <div className="project-name">
//           <FiFileText />
//           <span>{lead.project?.title || 'Unknown Project'}</span>
//         </div>
//       </td>
      
//       <td className="status-cell">
//         <span 
//           className="status-badge" 
//           style={{ backgroundColor: getStatusColor(lead.status) }}
//         >
//           {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
//         </span>
//       </td>
      
//       <td className="date-cell">
//         <div className="date-info">
//           <FiCalendar />
//           <span>{formatDate(lead.createdAt)}</span>
//         </div>
//       </td>
      
//       <td className="actions-cell">
//         <div className="action-menu">
//           <button onClick={() => setShowMenu(!showMenu)}>
//             <FiMoreVertical />
//           </button>
//           {showMenu && (
//             <div className="dropdown-menu">
//               <button onClick={() => onView()}>
//                 <FiEye /> View Details
//               </button>
//               <button onClick={() => onUpdate()}>
//                 <FiEdit /> Update Status
//               </button>
//               <button onClick={() => window.open(`mailto:${lead.email}`)}>
//                 <FiMail /> Send Email
//               </button>
//               <button onClick={() => window.open(`tel:${lead.phone}`)}>
//                 <FiPhone /> Call
//               </button>
//             </div>
//           )}
//         </div>
//       </td>
//     </tr>
//   );
// };

// // Lead Details Modal
// const LeadDetailsModal = ({ lead, onClose, onUpdate, formatDate, getStatusColor }) => {
//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>Lead Details</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <div className="lead-details">
//           <div className="detail-grid">
//             <div className="detail-section">
//               <h3>Personal Information</h3>
//               <div className="detail-item">
//                 <strong>Name:</strong> {lead.fullName}
//               </div>
//               <div className="detail-item">
//                 <strong>Email:</strong> 
//                 <a href={`mailto:${lead.email}`}>{lead.email}</a>
//               </div>
//               <div className="detail-item">
//                 <strong>Phone:</strong> 
//                 <a href={`tel:${lead.phone}`}>{lead.phone}</a>
//               </div>
//               <div className="detail-item">
//                 <strong>City:</strong> {lead.city}
//               </div>
//             </div>
            
//             <div className="detail-section">
//               <h3>Academic Information</h3>
//               <div className="detail-item">
//                 <strong>College:</strong> {lead.collegeName}
//               </div>
//               <div className="detail-item">
//                 <strong>Branch:</strong> {lead.branch}
//               </div>
//             </div>
            
//             <div className="detail-section">
//               <h3>Project Interest</h3>
//               <div className="detail-item">
//                 <strong>Project:</strong> {lead.project?.title || 'Unknown'}
//               </div>
//               <div className="detail-item">
//                 <strong>Inquiry Date:</strong> {formatDate(lead.createdAt)}
//               </div>
//             </div>
            
//             <div className="detail-section">
//               <h3>Status & Notes</h3>
//               <div className="detail-item">
//                 <strong>Status:</strong>
//                 <span 
//                   className="status-badge" 
//                   style={{ backgroundColor: getStatusColor(lead.status) }}
//                 >
//                   {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
//                 </span>
//               </div>
//               {lead.notes && (
//                 <div className="detail-item">
//                   <strong>Notes:</strong>
//                   <p>{lead.notes}</p>
//                 </div>
//               )}
//             </div>
//           </div>
          
//           <div className="modal-actions">
//             <button onClick={onUpdate} className="primary-button">
//               Update Status
//             </button>
//             <button onClick={() => window.open(`mailto:${lead.email}`)}>
//               Send Email
//             </button>
//             <button onClick={onClose}>Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Update Lead Modal
// const UpdateLeadModal = ({ lead, leadStatuses, onClose, onUpdate }) => {
//   const [formData, setFormData] = useState({
//     status: lead.status,
//     notes: lead.notes || ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       await onUpdate(lead.id, formData);
//     } catch (error) {
//       console.error('Error updating lead:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h2>Update Lead Status</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="lead-summary">
//             <h3>{lead.fullName}</h3>
//             <p>{lead.email} | {lead.project?.title}</p>
//           </div>
          
//           <div className="form-group">
//             <label>Status</label>
//             <select
//               value={formData.status}
//               onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
//               required
//             >
//               {leadStatuses.map(status => (
//                 <option key={status.value} value={status.value}>
//                   {status.label}
//                 </option>
//               ))}
//             </select>
//           </div>
          
//           <div className="form-group">
//             <label>Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
//               rows={4}
//               placeholder="Add notes about this lead..."
//             />
//           </div>
          
//           <div className="modal-actions">
//             <button type="button" onClick={onClose} disabled={loading}>
//               Cancel
//             </button>
//             <button type="submit" className="primary-button" disabled={loading}>
//               {loading ? 'Updating...' : 'Update Lead'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default LeadManagement;