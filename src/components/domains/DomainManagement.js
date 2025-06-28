// src/components/domains/DomainManagement.js - REPLACE YOUR EXISTING FILE
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ADD THIS IMPORT
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiGrid,
  FiList,
  FiFolder,
  FiChevronRight,
  FiMoreVertical,
  FiSettings // ADD THIS IMPORT
} from 'react-icons/fi';

const DomainManagement = () => {
  console.log('🚀 DOMAIN MANAGEMENT - Component rendering/mounting');
  
  const navigate = useNavigate(); // ADD THIS LINE
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    isActive: true,
    sortBy: 'title',
    sortOrder: 'ASC'
  });
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState(null);

  console.log('📊 DOMAIN MANAGEMENT - Current state:', {
    domainsCount: domains.length,
    loading,
    pagination,
    filters,
    viewMode,
    showAddModal,
    editingDomain: !!editingDomain,
    selectedDomain: !!selectedDomain
  });

  useEffect(() => {
    console.log('🔄 DOMAIN MANAGEMENT - useEffect triggered for fetchDomains');
    console.log('📋 DOMAIN MANAGEMENT - Current filters:', filters);
    console.log('📋 DOMAIN MANAGEMENT - Current pagination:', pagination);
    fetchDomains();
  }, [filters, pagination.currentPage]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.currentPage,
        limit: 10,
        ...filters
      };
      
      console.log('🔍 DOMAIN FETCH - Starting API call');
      console.log('📋 DOMAIN FETCH - Request params:', params);
      console.log('🌐 DOMAIN FETCH - API URL: /admin/domains with params:', new URLSearchParams(params).toString());
      
      const response = await authService.getDomains(params);
      
      console.log('✅ DOMAIN FETCH - Full API Response:', response);
      console.log('📦 DOMAIN FETCH - Response status:', response.status);
      console.log('📦 DOMAIN FETCH - Response headers:', response.headers);
      console.log('📦 DOMAIN FETCH - Response data:', response.data);
      console.log('📦 DOMAIN FETCH - Response data type:', typeof response.data);
      console.log('📦 DOMAIN FETCH - Response data keys:', Object.keys(response.data || {}));
      
      const domains = response.data?.domains || response.data?.data?.domains || [];
      const paginationData = response.data?.pagination || response.data?.data?.pagination || pagination;
      
      console.log('🎯 DOMAIN FETCH - Extracted domains:', domains);
      console.log('🎯 DOMAIN FETCH - Extracted pagination:', paginationData);
      console.log('🎯 DOMAIN FETCH - Domains count:', domains.length);
      
      setDomains(domains);
      setPagination(paginationData);
    } catch (error) {
      console.error('❌ DOMAIN FETCH - Error occurred:', error);
      console.error('❌ DOMAIN FETCH - Error response:', error.response);
      console.error('❌ DOMAIN FETCH - Error response data:', error.response?.data);
      console.error('❌ DOMAIN FETCH - Error message:', error.message);
      toast.error('Failed to fetch domains');
    } finally {
      setLoading(false);
      console.log('🏁 DOMAIN FETCH - Loading set to false');
    }
  };

  const handleSearch = (searchTerm) => {
    console.log('🔍 DOMAIN SEARCH - Search initiated');
    console.log('📋 DOMAIN SEARCH - Search term:', searchTerm);
    console.log('📋 DOMAIN SEARCH - Previous filters:', filters);
    
    const newFilters = { ...filters, search: searchTerm };
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
    
    console.log('📋 DOMAIN SEARCH - New filters:', newFilters);
    console.log('📋 DOMAIN SEARCH - Reset pagination to page 1');
  };

  const handleAddDomain = () => {
    console.log('➕ DOMAIN MANAGEMENT - Add domain clicked');
    setEditingDomain(null);
    setShowAddModal(true);
    console.log('📊 DOMAIN MANAGEMENT - Modal state changed:', { showAddModal: true, editingDomain: null });
  };

  const handleEditDomain = (domain) => {
    console.log('✏️ DOMAIN MANAGEMENT - Edit domain clicked');
    console.log('📋 DOMAIN MANAGEMENT - Domain to edit:', domain);
    setEditingDomain(domain);
    setShowAddModal(true);
    console.log('📊 DOMAIN MANAGEMENT - Modal state changed:', { showAddModal: true, editingDomain: domain });
  };

  // ADD THIS NEW FUNCTION
  const handleManageSubDomains = (domain) => {
    console.log('🔧 DOMAIN MANAGEMENT - Manage subdomains clicked');
    console.log('📋 DOMAIN MANAGEMENT - Domain for subdomain management:', domain);
    console.log('🌐 DOMAIN MANAGEMENT - Navigating to: /domains/' + domain.id + '/subdomains');
    navigate(`/domains/${domain.id}/subdomains`);
  };

  const handleDeleteDomain = async (domain) => {
    if (!window.confirm(`Are you sure you want to delete "${domain.title}"?`)) {
      return;
    }

    try {
      console.log('🗑️ DOMAIN DELETE - Starting API call');
      console.log('📋 DOMAIN DELETE - Domain to delete:', domain);
      console.log('🌐 DOMAIN DELETE - API URL: /admin/domains/' + domain.id);
      
      const response = await authService.deleteDomain(domain.id);
      
      console.log('✅ DOMAIN DELETE - Full API Response:', response);
      console.log('📦 DOMAIN DELETE - Response status:', response.status);
      console.log('📦 DOMAIN DELETE - Response data:', response.data);
      
      toast.success('Domain deleted successfully');
      console.log('🎯 DOMAIN DELETE - Success, refreshing domains list');
      fetchDomains();
    } catch (error) {
      console.error('❌ DOMAIN DELETE - Error occurred:', error);
      console.error('❌ DOMAIN DELETE - Error response:', error.response);
      console.error('❌ DOMAIN DELETE - Error response data:', error.response?.data);
      console.error('❌ DOMAIN DELETE - Error message:', error.message);
      toast.error('Failed to delete domain');
    }
  };

  const handleViewHierarchy = async (domain) => {
    try {
      console.log('🌳 DOMAIN HIERARCHY - Starting API call');
      console.log('📋 DOMAIN HIERARCHY - Domain for hierarchy:', domain);
      console.log('🌐 DOMAIN HIERARCHY - API URL: /admin/domains/' + domain.id + '/hierarchy');
      
      const response = await authService.getDomainHierarchy(domain.id);
      
      console.log('✅ DOMAIN HIERARCHY - Full API Response:', response);
      console.log('📦 DOMAIN HIERARCHY - Response status:', response.status);
      console.log('📦 DOMAIN HIERARCHY - Response data:', response.data);
      console.log('📦 DOMAIN HIERARCHY - Response data type:', typeof response.data);
      console.log('📦 DOMAIN HIERARCHY - Response data keys:', Object.keys(response.data || {}));
      
      const hierarchyData = response.data?.data || response.data;
      console.log('🎯 DOMAIN HIERARCHY - Extracted hierarchy data:', hierarchyData);
      
      setSelectedDomain(hierarchyData);
    } catch (error) {
      console.error('❌ DOMAIN HIERARCHY - Error occurred:', error);
      console.error('❌ DOMAIN HIERARCHY - Error response:', error.response);
      console.error('❌ DOMAIN HIERARCHY - Error response data:', error.response?.data);
      console.error('❌ DOMAIN HIERARCHY - Error message:', error.message);
      toast.error('Failed to load domain hierarchy');
    }
  };

  if (loading && domains.length === 0) {
    console.log('⏳ DOMAIN MANAGEMENT - Showing loading state');
    console.log('📊 DOMAIN MANAGEMENT - Loading:', loading, 'Domains count:', domains.length);
    
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading domains...</p>
      </div>
    );
  }

  console.log('🎨 DOMAIN MANAGEMENT - Rendering main component');
  console.log('📊 DOMAIN MANAGEMENT - Final render state:', {
    domainsCount: domains.length,
    loading,
    viewMode,
    showAddModal,
    selectedDomain: !!selectedDomain
  });

  return (
    <div className="domain-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Domain Management</h1>
          <p>Manage your project domains and categories</p>
        </div>
        <button className="primary-button" onClick={handleAddDomain}>
          <FiPlus />
          Add Domain
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search domains..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="view-controls">
          <div className="filter-group">
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
            >
              <option value="title">Sort by Title</option>
              <option value="createdAt">Sort by Date</option>
              <option value="projectCount">Sort by Projects</option>
            </select>
          </div>
          
          <div className="view-mode-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <FiGrid />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <FiList />
            </button>
          </div>
        </div>
      </div>

      {/* Domains Display */}
      <div className={`domains-container ${viewMode}`}>
        {domains.length > 0 ? (
          domains.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              viewMode={viewMode}
              onEdit={handleEditDomain}
              onDelete={handleDeleteDomain}
              onViewHierarchy={handleViewHierarchy}
              onManageSubDomains={handleManageSubDomains} // ADD THIS LINE
            />
          ))
        ) : (
          <div className="empty-state">
            <FiFolder size={48} />
            <h3>No domains found</h3>
            <p>Create your first domain to get started</p>
            <button className="primary-button" onClick={handleAddDomain}>
              <FiPlus />
              Add Domain
            </button>
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <DomainModal
          domain={editingDomain}
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            fetchDomains();
          }}
        />
      )}

      {/* Hierarchy View Modal */}
      {selectedDomain && (
        <HierarchyModal
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
        />
      )}
    </div>
  );
};

// UPDATED Domain Card Component
const DomainCard = ({ domain, viewMode, onEdit, onDelete, onViewHierarchy, onManageSubDomains }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`domain-card ${viewMode}`}>
      <div className="domain-header">
        <div className="domain-icon">
          <FiFolder />
        </div>
        <div className="domain-info">
          <h3 className="domain-title">{domain.title}</h3>
          <p className="domain-description">{domain.description}</p>
        </div>
        <div className="domain-menu">
          <button onClick={() => setShowMenu(!showMenu)}>
            <FiMoreVertical />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              {/* ADD THIS NEW OPTION AT THE TOP */}
              <button 
                onClick={() => {
                  onManageSubDomains(domain);
                  setShowMenu(false);
                }}
                className="primary-option"
              >
                <FiSettings /> Manage SubDomains
              </button>
              <button onClick={() => {
                onEdit(domain);
                setShowMenu(false);
              }}>
                <FiEdit /> Edit Domain
              </button>
              <button onClick={() => {
                onViewHierarchy(domain);
                setShowMenu(false);
              }}>
                <FiChevronRight /> View Hierarchy
              </button>
              <button onClick={() => {
                onDelete(domain);
                setShowMenu(false);
              }} className="danger">
                <FiTrash2 /> Delete Domain
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="domain-stats">
        <div className="stat">
          <span className="stat-value">{domain.subDomainCount || 0}</span>
          <span className="stat-label">Sub-domains</span>
        </div>
        <div className="stat">
          <span className="stat-value">{domain.projectCount || 0}</span>
          <span className="stat-label">Projects</span>
        </div>
        <div className="stat">
          <span className={`status ${domain.isActive ? 'active' : 'inactive'}`}>
            {domain.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>
    </div>
  );
};

// // Domain Modal Component
// const DomainModal = ({ domain, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     title: domain?.title || '',
//     description: domain?.description || ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       console.log('💾 DOMAIN SAVE - Starting API call');
//       console.log('📋 DOMAIN SAVE - Form data:', formData);
//       console.log('📋 DOMAIN SAVE - Is editing?', !!domain);
//       console.log('📋 DOMAIN SAVE - Domain ID (if editing):', domain?.id);
      
//       if (domain) {
//         console.log('🌐 DOMAIN SAVE - API URL: /admin/domains/' + domain.id + ' (PUT)');
//         const response = await authService.updateDomain(domain.id, formData);
        
//         console.log('✅ DOMAIN UPDATE - Full API Response:', response);
//         console.log('📦 DOMAIN UPDATE - Response status:', response.status);
//         console.log('📦 DOMAIN UPDATE - Response data:', response.data);
        
//         toast.success('Domain updated successfully');
//       } else {
//         console.log('🌐 DOMAIN SAVE - API URL: /admin/domains (POST)');
//         const response = await authService.createDomain(formData);
        
//         console.log('✅ DOMAIN CREATE - Full API Response:', response);
//         console.log('📦 DOMAIN CREATE - Response status:', response.status);
//         console.log('📦 DOMAIN CREATE - Response data:', response.data);
        
//         toast.success('Domain created successfully');
//       }
      
//       console.log('🎯 DOMAIN SAVE - Success, calling onSave callback');
//       onSave();
//     } catch (error) {
//       console.error('❌ DOMAIN SAVE - Error occurred:', error);
//       console.error('❌ DOMAIN SAVE - Error response:', error.response);
//       console.error('❌ DOMAIN SAVE - Error response data:', error.response?.data);
//       console.error('❌ DOMAIN SAVE - Error message:', error.message);
//       toast.error('Failed to save domain');
//     } finally {
//       setLoading(false);
//       console.log('🏁 DOMAIN SAVE - Loading set to false');
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h2>{domain ? 'Edit Domain' : 'Add New Domain'}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Domain Title</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Description (Optional)</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//               rows={3}
//             />
//           </div>
          
//           <div className="modal-actions">
//             <button type="button" onClick={onClose} disabled={loading}>
//               Cancel
//             </button>
//             <button type="submit" className="primary-button" disabled={loading}>
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };


// FINAL CORRECTED VERSION - REPLACE ENTIRELY

// Domain Modal Component
const DomainModal = ({ domain, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: domain?.title || '',
    description: domain?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('💾 DOMAIN SAVE - Starting API call');
      console.log('📋 DOMAIN SAVE - Form data:', formData);
      console.log('📋 DOMAIN SAVE - Is editing?', !!domain);
      console.log('📋 DOMAIN SAVE - Domain ID (if editing):', domain?.id);
      
      if (domain) {
        console.log('🌐 DOMAIN SAVE - API URL: /admin/domains/' + domain.id + ' (PUT)');
        const response = await authService.updateDomain(domain.id, formData);
        
        console.log('✅ DOMAIN UPDATE - Full API Response:', response);
        console.log('📦 DOMAIN UPDATE - Response status:', response.status);
        console.log('📦 DOMAIN UPDATE - Response data:', response.data);
        
        toast.success('Domain updated successfully');
      } else {
        console.log('🌐 DOMAIN SAVE - API URL: /admin/domains (POST)');
        const response = await authService.createDomain(formData);
        
        console.log('✅ DOMAIN CREATE - Full API Response:', response);
        console.log('📦 DOMAIN CREATE - Response status:', response.status);
        console.log('📦 DOMAIN CREATE - Response data:', response.data);
        
        toast.success('Domain created successfully');
      }
      
      console.log('🎯 DOMAIN SAVE - Success, calling onSave callback');
      onSave();
    } catch (error) {
      console.error('❌ DOMAIN SAVE - Error occurred:', error);
      console.error('❌ DOMAIN SAVE - Error response:', error.response);
      console.error('❌ DOMAIN SAVE - Error response data:', error.response?.data);
      console.error('❌ DOMAIN SAVE - Error message:', error.message);
      toast.error('Failed to save domain');
    } finally {
      setLoading(false);
      console.log('🏁 DOMAIN SAVE - Loading set to false');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{domain ? 'Edit Domain' : 'Add New Domain'}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Domain Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Hierarchy Modal Component
const HierarchyModal = ({ domain, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Domain Hierarchy: {domain.title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="hierarchy-content">
          <div className="hierarchy-tree">
            {domain.subDomains && domain.subDomains.length > 0 ? (
              domain.subDomains.map((subDomain) => (
                <HierarchyNode key={subDomain.id} node={subDomain} level={0} />
              ))
            ) : (
              <p>No sub-domains found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Hierarchy Node Component
const HierarchyNode = ({ node, level }) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`hierarchy-node level-${level}`}>
      <div className="node-header">
        {node.children && node.children.length > 0 && (
          <button 
            className="expand-button"
            onClick={() => setExpanded(!expanded)}
          >
            <FiChevronRight className={expanded ? 'expanded' : ''} />
          </button>
        )}
        <FiFolder className="node-icon" />
        <span className="node-title">{node.title}</span>
        {node.projects && (
          <span className="project-count">({node.projects.length} projects)</span>
        )}
      </div>
      
      {expanded && node.children && node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((child) => (
            <HierarchyNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export default DomainManagement;


// // src/components/domains/DomainManagement.js - NEW FILE
// import React, { useState, useEffect } from 'react';
// import { authService } from '../../services/authService';
// import { toast } from 'react-toastify';
// import {
//   FiPlus,
//   FiEdit,
//   FiTrash2,
//   FiSearch,
//   FiGrid,
//   FiList,
//   FiFolder,
//   FiChevronRight,
//   FiMoreVertical
// } from 'react-icons/fi';

// const DomainManagement = () => {
//   console.log('🚀 DOMAIN MANAGEMENT - Component rendering/mounting');
  
//   const [domains, setDomains] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0
//   });
//   const [filters, setFilters] = useState({
//     search: '',
//     isActive: true,
//     sortBy: 'title',
//     sortOrder: 'ASC'
//   });
//   const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingDomain, setEditingDomain] = useState(null);
//   const [selectedDomain, setSelectedDomain] = useState(null);

//   console.log('📊 DOMAIN MANAGEMENT - Current state:', {
//     domainsCount: domains.length,
//     loading,
//     pagination,
//     filters,
//     viewMode,
//     showAddModal,
//     editingDomain: !!editingDomain,
//     selectedDomain: !!selectedDomain
//   });

//   useEffect(() => {
//     console.log('🔄 DOMAIN MANAGEMENT - useEffect triggered for fetchDomains');
//     console.log('📋 DOMAIN MANAGEMENT - Current filters:', filters);
//     console.log('📋 DOMAIN MANAGEMENT - Current pagination:', pagination);
//     fetchDomains();
//   }, [filters, pagination.currentPage]);

//   const fetchDomains = async () => {
//     try {
//       setLoading(true);
//       const params = {
//         page: pagination.currentPage,
//         limit: 10,
//         ...filters
//       };
      
//       console.log('🔍 DOMAIN FETCH - Starting API call');
//       console.log('📋 DOMAIN FETCH - Request params:', params);
//       console.log('🌐 DOMAIN FETCH - API URL: /admin/domains with params:', new URLSearchParams(params).toString());
      
//       const response = await authService.getDomains(params);
      
//       console.log('✅ DOMAIN FETCH - Full API Response:', response);
//       console.log('📦 DOMAIN FETCH - Response status:', response.status);
//       console.log('📦 DOMAIN FETCH - Response headers:', response.headers);
//       console.log('📦 DOMAIN FETCH - Response data:', response.data);
//       console.log('📦 DOMAIN FETCH - Response data type:', typeof response.data);
//       console.log('📦 DOMAIN FETCH - Response data keys:', Object.keys(response.data || {}));
      
//       const domains = response.data?.domains || response.data?.data?.domains || [];
//       const paginationData = response.data?.pagination || response.data?.data?.pagination || pagination;
      
//       console.log('🎯 DOMAIN FETCH - Extracted domains:', domains);
//       console.log('🎯 DOMAIN FETCH - Extracted pagination:', paginationData);
//       console.log('🎯 DOMAIN FETCH - Domains count:', domains.length);
      
//       setDomains(domains);
//       setPagination(paginationData);
//     } catch (error) {
//       console.error('❌ DOMAIN FETCH - Error occurred:', error);
//       console.error('❌ DOMAIN FETCH - Error response:', error.response);
//       console.error('❌ DOMAIN FETCH - Error response data:', error.response?.data);
//       console.error('❌ DOMAIN FETCH - Error message:', error.message);
//       toast.error('Failed to fetch domains');
//     } finally {
//       setLoading(false);
//       console.log('🏁 DOMAIN FETCH - Loading set to false');
//     }
//   };

//   const handleSearch = (searchTerm) => {
//     console.log('🔍 DOMAIN SEARCH - Search initiated');
//     console.log('📋 DOMAIN SEARCH - Search term:', searchTerm);
//     console.log('📋 DOMAIN SEARCH - Previous filters:', filters);
    
//     const newFilters = { ...filters, search: searchTerm };
//     setFilters(prev => ({ ...prev, search: searchTerm }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
    
//     console.log('📋 DOMAIN SEARCH - New filters:', newFilters);
//     console.log('📋 DOMAIN SEARCH - Reset pagination to page 1');
//   };

//   const handleAddDomain = () => {
//     console.log('➕ DOMAIN MANAGEMENT - Add domain clicked');
//     setEditingDomain(null);
//     setShowAddModal(true);
//     console.log('📊 DOMAIN MANAGEMENT - Modal state changed:', { showAddModal: true, editingDomain: null });
//   };

//   const handleEditDomain = (domain) => {
//     console.log('✏️ DOMAIN MANAGEMENT - Edit domain clicked');
//     console.log('📋 DOMAIN MANAGEMENT - Domain to edit:', domain);
//     setEditingDomain(domain);
//     setShowAddModal(true);
//     console.log('📊 DOMAIN MANAGEMENT - Modal state changed:', { showAddModal: true, editingDomain: domain });
//   };

//   const handleDeleteDomain = async (domain) => {
//     if (!window.confirm(`Are you sure you want to delete "${domain.title}"?`)) {
//       return;
//     }

//     try {
//       console.log('🗑️ DOMAIN DELETE - Starting API call');
//       console.log('📋 DOMAIN DELETE - Domain to delete:', domain);
//       console.log('🌐 DOMAIN DELETE - API URL: /admin/domains/' + domain.id);
      
//       const response = await authService.deleteDomain(domain.id);
      
//       console.log('✅ DOMAIN DELETE - Full API Response:', response);
//       console.log('📦 DOMAIN DELETE - Response status:', response.status);
//       console.log('📦 DOMAIN DELETE - Response data:', response.data);
      
//       toast.success('Domain deleted successfully');
//       console.log('🎯 DOMAIN DELETE - Success, refreshing domains list');
//       fetchDomains();
//     } catch (error) {
//       console.error('❌ DOMAIN DELETE - Error occurred:', error);
//       console.error('❌ DOMAIN DELETE - Error response:', error.response);
//       console.error('❌ DOMAIN DELETE - Error response data:', error.response?.data);
//       console.error('❌ DOMAIN DELETE - Error message:', error.message);
//       toast.error('Failed to delete domain');
//     }
//   };

//   const handleViewHierarchy = async (domain) => {
//     try {
//       console.log('🌳 DOMAIN HIERARCHY - Starting API call');
//       console.log('📋 DOMAIN HIERARCHY - Domain for hierarchy:', domain);
//       console.log('🌐 DOMAIN HIERARCHY - API URL: /admin/domains/' + domain.id + '/hierarchy');
      
//       const response = await authService.getDomainHierarchy(domain.id);
      
//       console.log('✅ DOMAIN HIERARCHY - Full API Response:', response);
//       console.log('📦 DOMAIN HIERARCHY - Response status:', response.status);
//       console.log('📦 DOMAIN HIERARCHY - Response data:', response.data);
//       console.log('📦 DOMAIN HIERARCHY - Response data type:', typeof response.data);
//       console.log('📦 DOMAIN HIERARCHY - Response data keys:', Object.keys(response.data || {}));
      
//       const hierarchyData = response.data?.data || response.data;
//       console.log('🎯 DOMAIN HIERARCHY - Extracted hierarchy data:', hierarchyData);
      
//       setSelectedDomain(hierarchyData);
//     } catch (error) {
//       console.error('❌ DOMAIN HIERARCHY - Error occurred:', error);
//       console.error('❌ DOMAIN HIERARCHY - Error response:', error.response);
//       console.error('❌ DOMAIN HIERARCHY - Error response data:', error.response?.data);
//       console.error('❌ DOMAIN HIERARCHY - Error message:', error.message);
//       toast.error('Failed to load domain hierarchy');
//     }
//   };

//   if (loading && domains.length === 0) {
//     console.log('⏳ DOMAIN MANAGEMENT - Showing loading state');
//     console.log('📊 DOMAIN MANAGEMENT - Loading:', loading, 'Domains count:', domains.length);
    
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading domains...</p>
//       </div>
//     );
//   }

//   console.log('🎨 DOMAIN MANAGEMENT - Rendering main component');
//   console.log('📊 DOMAIN MANAGEMENT - Final render state:', {
//     domainsCount: domains.length,
//     loading,
//     viewMode,
//     showAddModal,
//     selectedDomain: !!selectedDomain
//   });

//   return (
//     <div className="domain-management">
//       <div className="page-header">
//         <div className="header-content">
//           <h1>Domain Management</h1>
//           <p>Manage your project domains and categories</p>
//         </div>
//         <button className="primary-button" onClick={handleAddDomain}>
//           <FiPlus />
//           Add Domain
//         </button>
//       </div>

//       {/* Filters and Controls */}
//       <div className="controls-section">
//         <div className="search-bar">
//           <FiSearch className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search domains..."
//             value={filters.search}
//             onChange={(e) => handleSearch(e.target.value)}
//           />
//         </div>
        
//         <div className="view-controls">
//           <div className="filter-group">
//             <select
//               value={filters.sortBy}
//               onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
//             >
//               <option value="title">Sort by Title</option>
//               <option value="createdAt">Sort by Date</option>
//               <option value="projectCount">Sort by Projects</option>
//             </select>
//           </div>
          
//           <div className="view-mode-toggle">
//             <button
//               className={viewMode === 'grid' ? 'active' : ''}
//               onClick={() => setViewMode('grid')}
//             >
//               <FiGrid />
//             </button>
//             <button
//               className={viewMode === 'list' ? 'active' : ''}
//               onClick={() => setViewMode('list')}
//             >
//               <FiList />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Domains Display */}
//       <div className={`domains-container ${viewMode}`}>
//         {domains.length > 0 ? (
//           domains.map((domain) => (
//             <DomainCard
//               key={domain.id}
//               domain={domain}
//               viewMode={viewMode}
//               onEdit={handleEditDomain}
//               onDelete={handleDeleteDomain}
//               onViewHierarchy={handleViewHierarchy}
//             />
//           ))
//         ) : (
//           <div className="empty-state">
//             <FiFolder size={48} />
//             <h3>No domains found</h3>
//             <p>Create your first domain to get started</p>
//             <button className="primary-button" onClick={handleAddDomain}>
//               <FiPlus />
//               Add Domain
//             </button>
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

//       {/* Add/Edit Modal */}
//       {showAddModal && (
//         <DomainModal
//           domain={editingDomain}
//           onClose={() => setShowAddModal(false)}
//           onSave={() => {
//             setShowAddModal(false);
//             fetchDomains();
//           }}
//         />
//       )}

//       {/* Hierarchy View Modal */}
//       {selectedDomain && (
//         <HierarchyModal
//           domain={selectedDomain}
//           onClose={() => setSelectedDomain(null)}
//         />
//       )}
//     </div>
//   );
// };

// // Domain Card Component
// const DomainCard = ({ domain, viewMode, onEdit, onDelete, onViewHierarchy }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   return (
//     <div className={`domain-card ${viewMode}`}>
//       <div className="domain-header">
//         <div className="domain-icon">
//           <FiFolder />
//         </div>
//         <div className="domain-info">
//           <h3 className="domain-title">{domain.title}</h3>
//           <p className="domain-description">{domain.description}</p>
//         </div>
//         <div className="domain-menu">
//           <button onClick={() => setShowMenu(!showMenu)}>
//             <FiMoreVertical />
//           </button>
//           {showMenu && (
//             <div className="dropdown-menu">
//               <button onClick={() => onEdit(domain)}>
//                 <FiEdit /> Edit
//               </button>
//               <button onClick={() => onViewHierarchy(domain)}>
//                 <FiChevronRight /> View Hierarchy
//               </button>
//               <button onClick={() => onDelete(domain)} className="danger">
//                 <FiTrash2 /> Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="domain-stats">
//         <div className="stat">
//           <span className="stat-value">{domain.subDomainCount || 0}</span>
//           <span className="stat-label">Sub-domains</span>
//         </div>
//         <div className="stat">
//           <span className="stat-value">{domain.projectCount || 0}</span>
//           <span className="stat-label">Projects</span>
//         </div>
//         <div className="stat">
//           <span className={`status ${domain.isActive ? 'active' : 'inactive'}`}>
//             {domain.isActive ? 'Active' : 'Inactive'}
//           </span>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Domain Modal Component
// const DomainModal = ({ domain, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     title: domain?.title || '',
//     description: domain?.description || ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       console.log('💾 DOMAIN SAVE - Starting API call');
//       console.log('📋 DOMAIN SAVE - Form data:', formData);
//       console.log('📋 DOMAIN SAVE - Is editing?', !!domain);
//       console.log('📋 DOMAIN SAVE - Domain ID (if editing):', domain?.id);
      
//       if (domain) {
//         console.log('🌐 DOMAIN SAVE - API URL: /admin/domains/' + domain.id + ' (PUT)');
//         const response = await authService.updateDomain(domain.id, formData);
        
//         console.log('✅ DOMAIN UPDATE - Full API Response:', response);
//         console.log('📦 DOMAIN UPDATE - Response status:', response.status);
//         console.log('📦 DOMAIN UPDATE - Response data:', response.data);
        
//         toast.success('Domain updated successfully');
//       } else {
//         console.log('🌐 DOMAIN SAVE - API URL: /admin/domains (POST)');
//         const response = await authService.createDomain(formData);
        
//         console.log('✅ DOMAIN CREATE - Full API Response:', response);
//         console.log('📦 DOMAIN CREATE - Response status:', response.status);
//         console.log('📦 DOMAIN CREATE - Response data:', response.data);
        
//         toast.success('Domain created successfully');
//       }
      
//       console.log('🎯 DOMAIN SAVE - Success, calling onSave callback');
//       onSave();
//     } catch (error) {
//       console.error('❌ DOMAIN SAVE - Error occurred:', error);
//       console.error('❌ DOMAIN SAVE - Error response:', error.response);
//       console.error('❌ DOMAIN SAVE - Error response data:', error.response?.data);
//       console.error('❌ DOMAIN SAVE - Error message:', error.message);
//       toast.error('Failed to save domain');
//     } finally {
//       setLoading(false);
//       console.log('🏁 DOMAIN SAVE - Loading set to false');
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h2>{domain ? 'Edit Domain' : 'Add New Domain'}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Domain Title</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Description (Optional)</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//               rows={3}
//             />
//           </div>
          
//           <div className="modal-actions">
//             <button type="button" onClick={onClose} disabled={loading}>
//               Cancel
//             </button>
//             <button type="submit" className="primary-button" disabled={loading}>
//               {loading ? 'Saving...' : 'Save'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Hierarchy Modal Component
// const HierarchyModal = ({ domain, onClose }) => {
//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>Domain Hierarchy: {domain.title}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <div className="hierarchy-content">
//           <div className="hierarchy-tree">
//             {domain.subDomains && domain.subDomains.length > 0 ? (
//               domain.subDomains.map((subDomain) => (
//                 <HierarchyNode key={subDomain.id} node={subDomain} level={0} />
//               ))
//             ) : (
//               <p>No sub-domains found</p>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Hierarchy Node Component
// const HierarchyNode = ({ node, level }) => {
//   const [expanded, setExpanded] = useState(true);

//   return (
//     <div className={`hierarchy-node level-${level}`}>
//       <div className="node-header">
//         {node.children && node.children.length > 0 && (
//           <button 
//             className="expand-button"
//             onClick={() => setExpanded(!expanded)}
//           >
//             <FiChevronRight className={expanded ? 'expanded' : ''} />
//           </button>
//         )}
//         <FiFolder className="node-icon" />
//         <span className="node-title">{node.title}</span>
//         {node.projects && (
//           <span className="project-count">({node.projects.length} projects)</span>
//         )}
//       </div>
      
//       {expanded && node.children && node.children.length > 0 && (
//         <div className="node-children">
//           {node.children.map((child) => (
//             <HierarchyNode key={child.id} node={child} level={level + 1} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DomainManagement;


