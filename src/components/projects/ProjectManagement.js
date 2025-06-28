// src/components/projects/ProjectManagement.js - SIMPLIFIED VERSION FOR VIEWING/MANAGING PROJECTS
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiMove,
  FiArchive,
  FiStar,
  FiEye,
  FiUsers,
  FiImage,
  FiMoreVertical,
  FiFolder,
  FiFileText,
  FiPlus,
  FiSettings,
  FiArrowRight
} from 'react-icons/fi';

const ProjectManagement = () => {
  console.log('🚀 PROJECT MANAGEMENT - Component rendering/mounting');
  
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    domainId: '',
    isActive: true,
    isFeatured: null,
    sortBy: 'updatedAt',
    sortOrder: 'DESC'
  });
  const [editingProject, setEditingProject] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  console.log('📊 PROJECT MANAGEMENT - Current state:', {
    projectsCount: projects.length,
    loading,
    pagination,
    filters,
    editingProject: !!editingProject,
    selectedProject: !!selectedProject
  });

  useEffect(() => {
    console.log('🔄 PROJECT MANAGEMENT - useEffect triggered');
    fetchInitialData();
  }, []);

  useEffect(() => {
    console.log('🔄 PROJECT MANAGEMENT - Filters or pagination changed');
    fetchProjects();
  }, [filters, pagination.currentPage]);

  const fetchInitialData = async () => {
    try {
      console.log('📡 INITIAL DATA - Fetching domains...');
      const domainsResponse = await authService.getDomains({ limit: 100 });
      console.log('✅ INITIAL DATA - Domains fetched:', domainsResponse.data);
      
      setDomains(domainsResponse.data?.domains || []);
    } catch (error) {
      console.error('❌ INITIAL DATA - Error fetching domains:', error);
      toast.error('Failed to load domains');
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Clean up filters - remove empty strings and null values
      const cleanFilters = {};
      Object.keys(filters).forEach(key => {
        const value = filters[key];
        if (value !== '' && value !== null && value !== undefined) {
          cleanFilters[key] = value;
        }
      });
      
      const params = {
        page: pagination.currentPage,
        limit: 12,
        ...cleanFilters
      };
      
      console.log('📡 PROJECT FETCH - Starting with params:', params);
      
      const response = await authService.getProjects(params);
      console.log('✅ PROJECT FETCH - Response:', response.data);
      
      setProjects(response.data.projects || []);
      setPagination(response.data.pagination || pagination);
      
    } catch (error) {
      console.error('❌ PROJECT FETCH - Error:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    console.log('🔍 PROJECT SEARCH - Search term:', searchTerm);
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterKey, value) => {
    console.log('🎛️ PROJECT FILTER - Changed:', filterKey, '=', value);
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleEditProject = (project) => {
    console.log('✏️ PROJECT EDIT - Editing:', project.title);
    setEditingProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = async (project) => {
    console.log('🗑️ PROJECT DELETE - Requesting deletion:', project.title);
    
    if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
      console.log('❌ PROJECT DELETE - Cancelled by user');
      return;
    }

    try {
      console.log('📡 PROJECT DELETE - API call for:', project.id);
      await authService.deleteProject(project.id);
      console.log('✅ PROJECT DELETE - Success');
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      console.error('❌ PROJECT DELETE - Error:', error);
      toast.error('Failed to delete project');
    }
  };

  const handleArchiveProject = async (project) => {
    const isArchiving = project.isActive;
    const action = isArchiving ? 'archive' : 'restore';
    
    console.log('📁 PROJECT ARCHIVE - Action:', action, 'for:', project.title);
    
    if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
      return;
    }

    try {
      await authService.archiveProject(project.id, {
        archive: isArchiving,
        reason: `${action} via admin panel`
      });
      console.log('✅ PROJECT ARCHIVE - Success');
      toast.success(`Project ${action}d successfully`);
      fetchProjects();
    } catch (error) {
      console.error('❌ PROJECT ARCHIVE - Error:', error);
      toast.error(`Failed to ${action} project`);
    }
  };

  const handleToggleFeatured = async (project) => {
    console.log('⭐ PROJECT FEATURED - Toggle for:', project.title);
    
    try {
      await authService.updateProject(project.id, {
        isFeatured: !project.isFeatured
      });
      console.log('✅ PROJECT FEATURED - Success');
      toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
      fetchProjects();
    } catch (error) {
      console.error('❌ PROJECT FEATURED - Error:', error);
      toast.error('Failed to update featured status');
    }
  };

  const navigateToCreateProject = () => {
    console.log('🌐 NAVIGATION - Redirecting to domains for project creation');
    navigate('/domains');
    toast.info('Navigate to Domains → SubDomains to create new projects');
  };

  if (loading && projects.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="project-management">
      <div className="page-header">
        <div className="header-content">
          <h1>Project Management</h1>
          <p>View and manage your existing projects</p>
        </div>
        <div className="header-actions">
          <button 
            className="secondary-button" 
            onClick={navigateToCreateProject}
          >
            <FiSettings />
            Manage Domains
          </button>
          <button 
            className="primary-button" 
            onClick={navigateToCreateProject}
          >
            <FiPlus />
            Create New Project
            <FiArrowRight />
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="info-banner">
        <div className="banner-content">
          <FiFileText className="banner-icon" />
          <div className="banner-text">
            <strong>Want to create a new project?</strong>
            <p>Go to <strong>Domains → SubDomains</strong> and click "Add Project" on any leaf subdomain for better organization.</p>
          </div>
          <button 
            className="banner-button" 
            onClick={navigateToCreateProject}
          >
            Go to Domains <FiArrowRight />
          </button>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search projects..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        
        <div className="filter-controls">
          <select
            value={filters.domainId}
            onChange={(e) => handleFilterChange('domainId', e.target.value)}
          >
            <option value="">All Domains</option>
            {domains.map(domain => (
              <option key={domain.id} value={domain.id}>{domain.title}</option>
            ))}
          </select>
          
          <select
            value={filters.isFeatured === null ? '' : filters.isFeatured}
            onChange={(e) => handleFilterChange('isFeatured', 
              e.target.value === '' ? null : e.target.value === 'true'
            )}
          >
            <option value="">All Projects</option>
            <option value="true">Featured Only</option>
            <option value="false">Non-Featured</option>
          </select>
          
          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
          >
            <option value="true">Active Projects</option>
            <option value="false">Archived Projects</option>
          </select>
          
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
          >
            <option value="updatedAt">Sort by Last Updated</option>
            <option value="title">Sort by Title</option>
            <option value="createdAt">Sort by Date Created</option>
            <option value="leadCount">Sort by Leads</option>
            <option value="viewCount">Sort by Views</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onArchive={handleArchiveProject}
              onToggleFeatured={handleToggleFeatured}
              onViewDetails={(project) => setSelectedProject(project)}
            />
          ))
        ) : (
          <div className="empty-state">
            <FiFileText size={48} />
            <h3>No projects found</h3>
            <p>Projects are created from Domain → SubDomain pages for better organization</p>
            <div className="empty-state-actions">
              <button className="primary-button" onClick={navigateToCreateProject}>
                <FiSettings />
                Go to Domains
              </button>
              <p className="help-text">
                💡 Tip: Organize your projects by creating domains and subdomains first
              </p>
            </div>
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

      {/* Edit Project Modal */}
      {showEditModal && editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => {
            setShowEditModal(false);
            setEditingProject(null);
          }}
          onSave={() => {
            setShowEditModal(false);
            setEditingProject(null);
            fetchProjects();
          }}
        />
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <ProjectDetailsModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ 
  project, 
  onEdit, 
  onDelete, 
  onArchive, 
  onToggleFeatured, 
  onViewDetails 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`project-card ${!project.isActive ? 'archived' : ''}`}>
      <div className="project-header">
        <div className="project-image">
          {project.images && project.images.length > 0 ? (
            <img src={project.images[0].url} alt={project.title} />
          ) : (
            <div className="image-placeholder">
              <FiImage />
            </div>
          )}
        </div>
        
        <div className="project-badges">
          {project.isFeatured && (
            <span className="badge featured">
              <FiStar /> Featured
            </span>
          )}
          {!project.isActive && (
            <span className="badge archived">Archived</span>
          )}
        </div>
        
        <div className="project-menu">
          <button onClick={() => setShowMenu(!showMenu)}>
            <FiMoreVertical />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => onViewDetails(project)}>
                <FiEye /> View Details
              </button>
              <button onClick={() => onEdit(project)}>
                <FiEdit /> Edit
              </button>
              <button onClick={() => onToggleFeatured(project)}>
                <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
              </button>
              <button onClick={() => onArchive(project)}>
                <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
              </button>
              <button onClick={() => onDelete(project)} className="danger">
                <FiTrash2 /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="project-content">
        <h3 className="project-title">{project.title}</h3>
        <p className="project-subdomain">
          <FiFolder className="subdomain-icon" />
          {project.subDomain?.domain?.title} → {project.subDomain?.title || 'No sub-domain'}
        </p>
        <p className="project-abstract">
          {project.abstract?.substring(0, 100)}...
        </p>
      </div>
      
      <div className="project-footer">
        <div className="project-stats">
          <div className="stat">
            <FiEye />
            <span>{project.viewCount || 0}</span>
          </div>
          <div className="stat">
            <FiUsers />
            <span>{project.leadCount || 0}</span>
          </div>
        </div>
        
        <div className="project-actions">
          <button onClick={() => onEdit(project)} className="edit-button">
            <FiEdit />
          </button>
        </div>
      </div>
    </div>
  );
};

// Project Edit Modal Component
const ProjectEditModal = ({ project, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    abstract: project?.abstract || '',
    specifications: project?.specifications || '',
    learningOutcomes: project?.learningOutcomes || '',
    isFeatured: project?.isFeatured || false
  });
  const [loading, setLoading] = useState(false);

  console.log('📝 PROJECT EDIT MODAL - Project:', project.title);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('💾 PROJECT UPDATE - Starting with data:', formData);
      await authService.updateProject(project.id, formData);
      console.log('✅ PROJECT UPDATE - Success');
      toast.success('Project updated successfully');
      onSave();
    } catch (error) {
      console.error('❌ PROJECT UPDATE - Error:', error);
      toast.error('Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Edit Project: {project.title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="modal-info">
            <strong>Domain:</strong> {project.subDomain?.domain?.title || 'Unknown'}<br />
            <strong>SubDomain:</strong> {project.subDomain?.title || 'Unknown'}<br />
            <span className="info-note">
              💡 To move this project to a different domain/subdomain, contact your administrator
            </span>
          </div>
          
          <div className="form-group">
            <label>Abstract</label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
              rows={4}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Specifications</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              rows={6}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Learning Outcomes</label>
            <textarea
              value={formData.learningOutcomes}
              onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
              rows={4}
              required
            />
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              />
              Featured Project
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? 'Updating...' : 'Update Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Details Modal
const ProjectDetailsModal = ({ project, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>{project.title}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <div className="project-details">
          <div className="detail-section">
            <h3>Location</h3>
            <p><strong>Domain:</strong> {project.subDomain?.domain?.title || 'Unknown'}</p>
            <p><strong>SubDomain:</strong> {project.subDomain?.title || 'Unknown'}</p>
          </div>
          
          <div className="detail-section">
            <h3>Abstract</h3>
            <p>{project.abstract}</p>
          </div>
          
          <div className="detail-section">
            <h3>Specifications</h3>
            <p>{project.specifications}</p>
          </div>
          
          <div className="detail-section">
            <h3>Learning Outcomes</h3>
            <p>{project.learningOutcomes}</p>
          </div>
          
          <div className="detail-stats">
            <div className="stat-item">
              <strong>Views:</strong> {project.viewCount || 0}
            </div>
            <div className="stat-item">
              <strong>Leads:</strong> {project.leadCount || 0}
            </div>
            <div className="stat-item">
              <strong>Featured:</strong> {project.isFeatured ? 'Yes' : 'No'}
            </div>
            <div className="stat-item">
              <strong>Status:</strong> {project.isActive ? 'Active' : 'Archived'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManagement;


// // src/components/projects/ProjectManagement.js - FIXED WITH LOGGING
// import React, { useState, useEffect } from 'react';
// import { authService } from '../../services/authService';
// import { toast } from 'react-toastify';
// import {
//   FiPlus,
//   FiEdit,
//   FiTrash2,
//   FiSearch,
//   FiFilter,
//   FiMove,
//   FiArchive,
//   FiStar,
//   FiEye,
//   FiUsers,
//   FiImage,
//   FiMoreVertical,
//   FiFolder,
//   FiFileText
// } from 'react-icons/fi';

// const ProjectManagement = () => {
//   const [projects, setProjects] = useState([]);
//   const [domains, setDomains] = useState([]);
//   const [subDomains, setSubDomains] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0
//   });
//   const [filters, setFilters] = useState({
//     search: '',
//     subDomainId: '',
//     isActive: true,
//     isFeatured: null,
//     sortBy: 'title',
//     sortOrder: 'ASC'
//   });
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingProject, setEditingProject] = useState(null);
//   const [selectedProject, setSelectedProject] = useState(null);

//   useEffect(() => {
//     console.log('🚀 ProjectManagement component mounted');
//     fetchInitialData();
//   }, []);

//   useEffect(() => {
//     console.log('🔄 Filters or pagination changed:', { filters, currentPage: pagination.currentPage });
//     fetchProjects();
//   }, [filters, pagination.currentPage]);

//   const fetchInitialData = async () => {
//     try {
//       console.log('📡 Fetching initial data (domains)...');
//       const [domainsResponse] = await Promise.all([
//         authService.getDomains({ limit: 100 })
//       ]);
      
//       console.log('✅ Domains fetched:', domainsResponse);
//       setDomains(domainsResponse.data.domains || []);
//     } catch (error) {
//       console.error('❌ Error fetching initial data:', error);
//       toast.error('Failed to load domains');
//     }
//   };

//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
      
//       // Clean up filters - remove empty strings and null values
//       const cleanFilters = {};
//       Object.keys(filters).forEach(key => {
//         const value = filters[key];
//         // Only add non-empty values to the params
//         if (value !== '' && value !== null && value !== undefined) {
//           cleanFilters[key] = value;
//         }
//       });
      
//       const params = {
//         page: pagination.currentPage,
//         limit: 12,
//         ...cleanFilters
//       };
      
//       console.log('📡 Fetching projects with params:', params);
//       console.log('🔍 Raw filters before cleaning:', filters);
//       console.log('🧹 Cleaned filters:', cleanFilters);
      
//       const response = await authService.getProjects(params);
//       console.log('✅ Projects API response:', response);
      
//       setProjects(response.data.projects || []);
//       setPagination(response.data.pagination || pagination);
      
//       console.log('📊 Projects set:', response.data.projects?.length || 0, 'projects');
//       console.log('📄 Pagination set:', response.data.pagination);
      
//     } catch (error) {
//       console.error('❌ Error fetching projects:', error);
//       console.error('❌ Error details:', {
//         message: error.message,
//         response: error.response?.data,
//         status: error.response?.status,
//         config: error.config
//       });
//       toast.error('Failed to fetch projects');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchSubDomains = async (domainId) => {
//     try {
//       console.log('📡 Fetching subdomains for domain:', domainId);
//       const response = await authService.getLeafSubDomains(domainId);
//       console.log('✅ Subdomains fetched:', response);
//       setSubDomains(response.data || []);
//     } catch (error) {
//       console.error('❌ Error fetching sub-domains:', error);
//     }
//   };

//   const handleSearch = (searchTerm) => {
//     console.log('🔍 Search term changed:', searchTerm);
//     setFilters(prev => ({ ...prev, search: searchTerm }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handleFilterChange = (filterKey, value) => {
//     console.log('🎛️ Filter changed:', filterKey, '=', value);
//     setFilters(prev => ({ ...prev, [filterKey]: value }));
//     setPagination(prev => ({ ...prev, currentPage: 1 }));
//   };

//   const handleDomainChange = (domainId) => {
//     console.log('🏢 Domain changed:', domainId);
//     if (domainId) {
//       fetchSubDomains(domainId);
//     } else {
//       setSubDomains([]);
//     }
//     // Reset subdomain filter when domain changes
//     setFilters(prev => ({ ...prev, subDomainId: '' }));
//   };

//   const handleAddProject = () => {
//     console.log('➕ Add project clicked');
//     setEditingProject(null);
//     setShowAddModal(true);
//   };

//   const handleEditProject = (project) => {
//     console.log('✏️ Edit project clicked:', project.id, project.title);
//     setEditingProject(project);
//     setShowAddModal(true);
//   };

//   const handleDeleteProject = async (project) => {
//     console.log('🗑️ Delete project requested:', project.id, project.title);
    
//     if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
//       console.log('❌ Delete cancelled by user');
//       return;
//     }

//     try {
//       console.log('📡 Deleting project:', project.id);
//       await authService.deleteProject(project.id);
//       console.log('✅ Project deleted successfully');
//       toast.success('Project deleted successfully');
//       fetchProjects();
//     } catch (error) {
//       console.error('❌ Error deleting project:', error);
//       toast.error('Failed to delete project');
//     }
//   };

//   const handleMoveProject = async (project, newSubDomainId) => {
//     console.log('📦 Move project requested:', project.id, 'to subdomain:', newSubDomainId);
    
//     try {
//       await authService.moveProject(project.id, {
//         newSubDomainId,
//         reason: 'Moved via admin panel'
//       });
//       console.log('✅ Project moved successfully');
//       toast.success('Project moved successfully');
//       fetchProjects();
//     } catch (error) {
//       console.error('❌ Error moving project:', error);
//       toast.error('Failed to move project');
//     }
//   };

//   const handleArchiveProject = async (project) => {
//     const isArchiving = project.isActive;
//     const action = isArchiving ? 'archive' : 'restore';
    
//     console.log('📁 Archive/restore project requested:', project.id, action);
    
//     if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
//       console.log('❌ Archive/restore cancelled by user');
//       return;
//     }

//     try {
//       await authService.archiveProject(project.id, {
//         archive: isArchiving,
//         reason: `${action} via admin panel`
//       });
//       console.log('✅ Project archived/restored successfully');
//       toast.success(`Project ${action}d successfully`);
//       fetchProjects();
//     } catch (error) {
//       console.error(`❌ Error ${action}ing project:`, error);
//       toast.error(`Failed to ${action} project`);
//     }
//   };

//   const handleToggleFeatured = async (project) => {
//     console.log('⭐ Toggle featured requested:', project.id, 'current:', project.isFeatured);
    
//     try {
//       await authService.updateProject(project.id, {
//         isFeatured: !project.isFeatured
//       });
//       console.log('✅ Featured status updated successfully');
//       toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
//       fetchProjects();
//     } catch (error) {
//       console.error('❌ Error updating featured status:', error);
//       toast.error('Failed to update featured status');
//     }
//   };

//   if (loading && projects.length === 0) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading projects...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="project-management">
//       <div className="page-header">
//         <div className="header-content">
//           <h1>Project Management</h1>
//           <p>Manage your project portfolio and content</p>
//         </div>
//         <button className="primary-button" onClick={handleAddProject}>
//           <FiPlus />
//           Add Project
//         </button>
//       </div>

//       {/* Filters and Controls */}
//       <div className="controls-section">
//         <div className="search-bar">
//           <FiSearch className="search-icon" />
//           <input
//             type="text"
//             placeholder="Search projects..."
//             value={filters.search}
//             onChange={(e) => handleSearch(e.target.value)}
//           />
//         </div>
        
//         <div className="filter-controls">
//           {/* Domain Selector */}
//           <select
//             onChange={(e) => handleDomainChange(e.target.value)}
//           >
//             <option value="">Select Domain</option>
//             {domains.map(domain => (
//               <option key={domain.id} value={domain.id}>{domain.title}</option>
//             ))}
//           </select>
          
//           {/* Subdomain Selector */}
//           <select
//             value={filters.subDomainId}
//             onChange={(e) => handleFilterChange('subDomainId', e.target.value)}
//             disabled={subDomains.length === 0}
//           >
//             <option value="">All Sub-domains</option>
//             {subDomains.map(sub => (
//               <option key={sub.id} value={sub.id}>{sub.title}</option>
//             ))}
//           </select>
          
//           <select
//             value={filters.isFeatured === null ? '' : filters.isFeatured}
//             onChange={(e) => handleFilterChange('isFeatured', 
//               e.target.value === '' ? null : e.target.value === 'true'
//             )}
//           >
//             <option value="">All Projects</option>
//             <option value="true">Featured Only</option>
//             <option value="false">Non-Featured</option>
//           </select>
          
//           <select
//             value={filters.isActive}
//             onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
//           >
//             <option value="true">Active Projects</option>
//             <option value="false">Archived Projects</option>
//           </select>
          
//           <select
//             value={filters.sortBy}
//             onChange={(e) => handleFilterChange('sortBy', e.target.value)}
//           >
//             <option value="title">Sort by Title</option>
//             <option value="createdAt">Sort by Date</option>
//             <option value="leadCount">Sort by Leads</option>
//             <option value="viewCount">Sort by Views</option>
//           </select>
//         </div>
//       </div>

//       {/* Projects Grid */}
//       <div className="projects-grid">
//         {projects.length > 0 ? (
//           projects.map((project) => (
//             <ProjectCard
//               key={project.id}
//               project={project}
//               onEdit={handleEditProject}
//               onDelete={handleDeleteProject}
//               onMove={handleMoveProject}
//               onArchive={handleArchiveProject}
//               onToggleFeatured={handleToggleFeatured}
//               onViewDetails={(project) => setSelectedProject(project)}
//             />
//           ))
//         ) : (
//           <div className="empty-state">
//             <FiFileText size={48} />
//             <h3>No projects found</h3>
//             <p>Create your first project to get started</p>
//             <button className="primary-button" onClick={handleAddProject}>
//               <FiPlus />
//               Add Project
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
//         <ProjectModal
//           project={editingProject}
//           domains={domains}
//           onClose={() => setShowAddModal(false)}
//           onSave={() => {
//             setShowAddModal(false);
//             fetchProjects();
//           }}
//         />
//       )}

//       {/* Project Details Modal */}
//       {selectedProject && (
//         <ProjectDetailsModal
//           project={selectedProject}
//           onClose={() => setSelectedProject(null)}
//         />
//       )}
//     </div>
//   );
// };

// // Project Card Component
// const ProjectCard = ({ 
//   project, 
//   onEdit, 
//   onDelete, 
//   onMove, 
//   onArchive, 
//   onToggleFeatured, 
//   onViewDetails 
// }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   return (
//     <div className={`project-card ${!project.isActive ? 'archived' : ''}`}>
//       <div className="project-header">
//         <div className="project-image">
//           {project.images && project.images.length > 0 ? (
//             <img src={project.images[0].url} alt={project.title} />
//           ) : (
//             <div className="image-placeholder">
//               <FiImage />
//             </div>
//           )}
//         </div>
        
//         <div className="project-badges">
//           {project.isFeatured && (
//             <span className="badge featured">
//               <FiStar /> Featured
//             </span>
//           )}
//           {!project.isActive && (
//             <span className="badge archived">Archived</span>
//           )}
//         </div>
        
//         <div className="project-menu">
//           <button onClick={() => setShowMenu(!showMenu)}>
//             <FiMoreVertical />
//           </button>
//           {showMenu && (
//             <div className="dropdown-menu">
//               <button onClick={() => onViewDetails(project)}>
//                 <FiEye /> View Details
//               </button>
//               <button onClick={() => onEdit(project)}>
//                 <FiEdit /> Edit
//               </button>
//               <button onClick={() => onToggleFeatured(project)}>
//                 <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
//               </button>
//               <button onClick={() => onMove(project)}>
//                 <FiMove /> Move
//               </button>
//               <button onClick={() => onArchive(project)}>
//                 <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
//               </button>
//               <button onClick={() => onDelete(project)} className="danger">
//                 <FiTrash2 /> Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="project-content">
//         <h3 className="project-title">{project.title}</h3>
//         <p className="project-subdomain">
//           <FiFolder className="subdomain-icon" />
//           {project.subDomain?.title || 'No sub-domain'}
//         </p>
//         <p className="project-abstract">
//           {project.abstract?.substring(0, 100)}...
//         </p>
//       </div>
      
//       <div className="project-footer">
//         <div className="project-stats">
//           <div className="stat">
//             <FiEye />
//             <span>{project.viewCount || 0}</span>
//           </div>
//           <div className="stat">
//             <FiUsers />
//             <span>{project.leadCount || 0}</span>
//           </div>
//         </div>
        
//         <div className="project-actions">
//           <button onClick={() => onEdit(project)} className="edit-button">
//             <FiEdit />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Project Modal Component (Add/Edit)
// const ProjectModal = ({ project, domains, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     title: project?.title || '',
//     abstract: project?.abstract || '',
//     specifications: project?.specifications || '',
//     learningOutcomes: project?.learningOutcomes || '',
//     subDomainId: project?.subDomainId || '',
//     isFeatured: project?.isFeatured || false
//   });
//   const [loading, setLoading] = useState(false);
//   const [selectedDomain, setSelectedDomain] = useState('');
//   const [subDomains, setSubDomains] = useState([]);

//   useEffect(() => {
//     if (selectedDomain) {
//       fetchSubDomains(selectedDomain);
//     }
//   }, [selectedDomain]);

//   const fetchSubDomains = async (domainId) => {
//     try {
//       console.log('📡 Modal: Fetching subdomains for domain:', domainId);
//       const response = await authService.getLeafSubDomains(domainId);
//       console.log('✅ Modal: Subdomains fetched:', response);
//       setSubDomains(response.data || []);
//     } catch (error) {
//       console.error('❌ Modal: Error fetching sub-domains:', error);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     console.log('💾 Modal: Submitting form data:', formData);

//     try {
//       if (project) {
//         console.log('📡 Modal: Updating project:', project.id);
//         await authService.updateProject(project.id, formData);
//         console.log('✅ Modal: Project updated successfully');
//         toast.success('Project updated successfully');
//       } else {
//         console.log('📡 Modal: Creating new project');
//         await authService.createProject(formData);
//         console.log('✅ Modal: Project created successfully');
//         toast.success('Project created successfully');
//       }
//       onSave();
//     } catch (error) {
//       console.error('❌ Modal: Error saving project:', error);
//       toast.error('Failed to save project');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-grid">
//             <div className="form-group">
//               <label>Project Title</label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//                 required
//               />
//             </div>
            
//             <div className="form-group">
//               <label>Domain</label>
//               <select
//                 value={selectedDomain}
//                 onChange={(e) => setSelectedDomain(e.target.value)}
//                 required={!project}
//               >
//                 <option value="">Select Domain</option>
//                 {domains.map(domain => (
//                   <option key={domain.id} value={domain.id}>{domain.title}</option>
//                 ))}
//               </select>
//             </div>
            
//             <div className="form-group">
//               <label>Sub-Domain</label>
//               <select
//                 value={formData.subDomainId}
//                 onChange={(e) => setFormData(prev => ({ ...prev, subDomainId: e.target.value }))}
//                 required
//               >
//                 <option value="">Select Sub-Domain</option>
//                 {subDomains.map(sub => (
//                   <option key={sub.id} value={sub.id}>{sub.title}</option>
//                 ))}
//               </select>
//             </div>
//           </div>
          
//           <div className="form-group">
//             <label>Abstract</label>
//             <textarea
//               value={formData.abstract}
//               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
//               rows={4}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Specifications</label>
//             <textarea
//               value={formData.specifications}
//               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
//               rows={6}
//               required
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Learning Outcomes</label>
//             <textarea
//               value={formData.learningOutcomes}
//               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
//               rows={4}
//               required
//             />
//           </div>
          
//           <div className="form-group checkbox">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={formData.isFeatured}
//                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
//               />
//               Featured Project
//             </label>
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

// // Project Details Modal
// const ProjectDetailsModal = ({ project, onClose }) => {
//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>{project.title}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <div className="project-details">
//           <div className="detail-section">
//             <h3>Abstract</h3>
//             <p>{project.abstract}</p>
//           </div>
          
//           <div className="detail-section">
//             <h3>Specifications</h3>
//             <p>{project.specifications}</p>
//           </div>
          
//           <div className="detail-section">
//             <h3>Learning Outcomes</h3>
//             <p>{project.learningOutcomes}</p>
//           </div>
          
//           <div className="detail-stats">
//             <div className="stat-item">
//               <strong>Views:</strong> {project.viewCount || 0}
//             </div>
//             <div className="stat-item">
//               <strong>Leads:</strong> {project.leadCount || 0}
//             </div>
//             <div className="stat-item">
//               <strong>Featured:</strong> {project.isFeatured ? 'Yes' : 'No'}
//             </div>
//             <div className="stat-item">
//               <strong>Status:</strong> {project.isActive ? 'Active' : 'Archived'}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectManagement;


// // // src/components/projects/ProjectManagement.js - NEW FILE
// // import React, { useState, useEffect } from 'react';
// // import { authService } from '../../services/authService';
// // import { toast } from 'react-toastify';
// // import {
// //   FiPlus,
// //   FiEdit,
// //   FiTrash2,
// //   FiSearch,
// //   FiFilter,
// //   FiMove,
// //   FiArchive,
// //   FiStar,
// //   FiEye,
// //   FiUsers,
// //   FiImage,
// //   FiMoreVertical,
// //   FiFolder,
// //   FiFileText
// // } from 'react-icons/fi';

// // const ProjectManagement = () => {
// //   const [projects, setProjects] = useState([]);
// //   const [domains, setDomains] = useState([]);
// //   const [subDomains, setSubDomains] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [pagination, setPagination] = useState({
// //     currentPage: 1,
// //     totalPages: 1,
// //     totalItems: 0
// //   });
// //   const [filters, setFilters] = useState({
// //     search: '',
// //     subDomainId: '',
// //     isActive: true,
// //     isFeatured: null,
// //     sortBy: 'title',
// //     sortOrder: 'ASC'
// //   });
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [editingProject, setEditingProject] = useState(null);
// //   const [selectedProject, setSelectedProject] = useState(null);

// //   useEffect(() => {
// //     fetchInitialData();
// //   }, []);

// //   useEffect(() => {
// //     fetchProjects();
// //   }, [filters, pagination.currentPage]);

// //   const fetchInitialData = async () => {
// //     try {
// //       const [domainsResponse] = await Promise.all([
// //         authService.getDomains({ limit: 100 })
// //       ]);
      
// //       setDomains(domainsResponse.data.domains || []);
// //     } catch (error) {
// //       console.error('❌ Error fetching initial data:', error);
// //       toast.error('Failed to load domains');
// //     }
// //   };

// //   const fetchProjects = async () => {
// //     try {
// //       setLoading(true);
// //       const params = {
// //         page: pagination.currentPage,
// //         limit: 12,
// //         ...filters
// //       };
      
// //       const response = await authService.getProjects(params);
// //       console.log('✅ Projects fetched:', response);
      
// //       setProjects(response.data.projects || []);
// //       setPagination(response.data.pagination || pagination);
// //     } catch (error) {
// //       console.error('❌ Error fetching projects:', error);
// //       toast.error('Failed to fetch projects');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const fetchSubDomains = async (domainId) => {
// //     try {
// //       const response = await authService.getLeafSubDomains(domainId);
// //       setSubDomains(response.data || []);
// //     } catch (error) {
// //       console.error('❌ Error fetching sub-domains:', error);
// //     }
// //   };

// //   const handleSearch = (searchTerm) => {
// //     setFilters(prev => ({ ...prev, search: searchTerm }));
// //     setPagination(prev => ({ ...prev, currentPage: 1 }));
// //   };

// //   const handleFilterChange = (filterKey, value) => {
// //     setFilters(prev => ({ ...prev, [filterKey]: value }));
// //     setPagination(prev => ({ ...prev, currentPage: 1 }));
// //   };

// //   const handleAddProject = () => {
// //     setEditingProject(null);
// //     setShowAddModal(true);
// //   };

// //   const handleEditProject = (project) => {
// //     setEditingProject(project);
// //     setShowAddModal(true);
// //   };

// //   const handleDeleteProject = async (project) => {
// //     if (!window.confirm(`Are you sure you want to delete "${project.title}"?`)) {
// //       return;
// //     }

// //     try {
// //       await authService.deleteProject(project.id);
// //       toast.success('Project deleted successfully');
// //       fetchProjects();
// //     } catch (error) {
// //       console.error('❌ Error deleting project:', error);
// //       toast.error('Failed to delete project');
// //     }
// //   };

// //   const handleMoveProject = async (project, newSubDomainId) => {
// //     try {
// //       await authService.moveProject(project.id, {
// //         newSubDomainId,
// //         reason: 'Moved via admin panel'
// //       });
// //       toast.success('Project moved successfully');
// //       fetchProjects();
// //     } catch (error) {
// //       console.error('❌ Error moving project:', error);
// //       toast.error('Failed to move project');
// //     }
// //   };

// //   const handleArchiveProject = async (project) => {
// //     const isArchiving = project.isActive;
// //     const action = isArchiving ? 'archive' : 'restore';
    
// //     if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
// //       return;
// //     }

// //     try {
// //       await authService.archiveProject(project.id, {
// //         archive: isArchiving,
// //         reason: `${action} via admin panel`
// //       });
// //       toast.success(`Project ${action}d successfully`);
// //       fetchProjects();
// //     } catch (error) {
// //       console.error(`❌ Error ${action}ing project:`, error);
// //       toast.error(`Failed to ${action} project`);
// //     }
// //   };

// //   const handleToggleFeatured = async (project) => {
// //     try {
// //       await authService.updateProject(project.id, {
// //         isFeatured: !project.isFeatured
// //       });
// //       toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
// //       fetchProjects();
// //     } catch (error) {
// //       console.error('❌ Error updating featured status:', error);
// //       toast.error('Failed to update featured status');
// //     }
// //   };

// //   if (loading && projects.length === 0) {
// //     return (
// //       <div className="loading-container">
// //         <div className="loading-spinner"></div>
// //         <p>Loading projects...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="project-management">
// //       <div className="page-header">
// //         <div className="header-content">
// //           <h1>Project Management</h1>
// //           <p>Manage your project portfolio and content</p>
// //         </div>
// //         <button className="primary-button" onClick={handleAddProject}>
// //           <FiPlus />
// //           Add Project
// //         </button>
// //       </div>

// //       {/* Filters and Controls */}
// //       <div className="controls-section">
// //         <div className="search-bar">
// //           <FiSearch className="search-icon" />
// //           <input
// //             type="text"
// //             placeholder="Search projects..."
// //             value={filters.search}
// //             onChange={(e) => handleSearch(e.target.value)}
// //           />
// //         </div>
        
// //         <div className="filter-controls">
// //           <select
// //             value={filters.subDomainId}
// //             onChange={(e) => handleFilterChange('subDomainId', e.target.value)}
// //           >
// //             <option value="">All Sub-domains</option>
// //             {subDomains.map(sub => (
// //               <option key={sub.id} value={sub.id}>{sub.title}</option>
// //             ))}
// //           </select>
          
// //           <select
// //             value={filters.isFeatured === null ? '' : filters.isFeatured}
// //             onChange={(e) => handleFilterChange('isFeatured', 
// //               e.target.value === '' ? null : e.target.value === 'true'
// //             )}
// //           >
// //             <option value="">All Projects</option>
// //             <option value="true">Featured Only</option>
// //             <option value="false">Non-Featured</option>
// //           </select>
          
// //           <select
// //             value={filters.isActive}
// //             onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
// //           >
// //             <option value="true">Active Projects</option>
// //             <option value="false">Archived Projects</option>
// //           </select>
          
// //           <select
// //             value={filters.sortBy}
// //             onChange={(e) => handleFilterChange('sortBy', e.target.value)}
// //           >
// //             <option value="title">Sort by Title</option>
// //             <option value="createdAt">Sort by Date</option>
// //             <option value="leadCount">Sort by Leads</option>
// //             <option value="viewCount">Sort by Views</option>
// //           </select>
// //         </div>
// //       </div>

// //       {/* Projects Grid */}
// //       <div className="projects-grid">
// //         {projects.length > 0 ? (
// //           projects.map((project) => (
// //             <ProjectCard
// //               key={project.id}
// //               project={project}
// //               onEdit={handleEditProject}
// //               onDelete={handleDeleteProject}
// //               onMove={handleMoveProject}
// //               onArchive={handleArchiveProject}
// //               onToggleFeatured={handleToggleFeatured}
// //               onViewDetails={(project) => setSelectedProject(project)}
// //             />
// //           ))
// //         ) : (
// //           <div className="empty-state">
// //             <FiFileText size={48} />
// //             <h3>No projects found</h3>
// //             <p>Create your first project to get started</p>
// //             <button className="primary-button" onClick={handleAddProject}>
// //               <FiPlus />
// //               Add Project
// //             </button>
// //           </div>
// //         )}
// //       </div>

// //       {/* Pagination */}
// //       {pagination.totalPages > 1 && (
// //         <div className="pagination">
// //           <button
// //             disabled={pagination.currentPage === 1}
// //             onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
// //           >
// //             Previous
// //           </button>
          
// //           <span className="page-info">
// //             Page {pagination.currentPage} of {pagination.totalPages}
// //             ({pagination.totalItems} total)
// //           </span>
          
// //           <button
// //             disabled={pagination.currentPage === pagination.totalPages}
// //             onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
// //           >
// //             Next
// //           </button>
// //         </div>
// //       )}

// //       {/* Add/Edit Modal */}
// //       {showAddModal && (
// //         <ProjectModal
// //           project={editingProject}
// //           domains={domains}
// //           onClose={() => setShowAddModal(false)}
// //           onSave={() => {
// //             setShowAddModal(false);
// //             fetchProjects();
// //           }}
// //         />
// //       )}

// //       {/* Project Details Modal */}
// //       {selectedProject && (
// //         <ProjectDetailsModal
// //           project={selectedProject}
// //           onClose={() => setSelectedProject(null)}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // // Project Card Component
// // const ProjectCard = ({ 
// //   project, 
// //   onEdit, 
// //   onDelete, 
// //   onMove, 
// //   onArchive, 
// //   onToggleFeatured, 
// //   onViewDetails 
// // }) => {
// //   const [showMenu, setShowMenu] = useState(false);

// //   return (
// //     <div className={`project-card ${!project.isActive ? 'archived' : ''}`}>
// //       <div className="project-header">
// //         <div className="project-image">
// //           {project.images && project.images.length > 0 ? (
// //             <img src={project.images[0].url} alt={project.title} />
// //           ) : (
// //             <div className="image-placeholder">
// //               <FiImage />
// //             </div>
// //           )}
// //         </div>
        
// //         <div className="project-badges">
// //           {project.isFeatured && (
// //             <span className="badge featured">
// //               <FiStar /> Featured
// //             </span>
// //           )}
// //           {!project.isActive && (
// //             <span className="badge archived">Archived</span>
// //           )}
// //         </div>
        
// //         <div className="project-menu">
// //           <button onClick={() => setShowMenu(!showMenu)}>
// //             <FiMoreVertical />
// //           </button>
// //           {showMenu && (
// //             <div className="dropdown-menu">
// //               <button onClick={() => onViewDetails(project)}>
// //                 <FiEye /> View Details
// //               </button>
// //               <button onClick={() => onEdit(project)}>
// //                 <FiEdit /> Edit
// //               </button>
// //               <button onClick={() => onToggleFeatured(project)}>
// //                 <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
// //               </button>
// //               <button onClick={() => onMove(project)}>
// //                 <FiMove /> Move
// //               </button>
// //               <button onClick={() => onArchive(project)}>
// //                 <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
// //               </button>
// //               <button onClick={() => onDelete(project)} className="danger">
// //                 <FiTrash2 /> Delete
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
      
// //       <div className="project-content">
// //         <h3 className="project-title">{project.title}</h3>
// //         <p className="project-subdomain">
// //           <FiFolder className="subdomain-icon" />
// //           {project.subDomain?.title || 'No sub-domain'}
// //         </p>
// //         <p className="project-abstract">
// //           {project.abstract?.substring(0, 100)}...
// //         </p>
// //       </div>
      
// //       <div className="project-footer">
// //         <div className="project-stats">
// //           <div className="stat">
// //             <FiEye />
// //             <span>{project.viewCount || 0}</span>
// //           </div>
// //           <div className="stat">
// //             <FiUsers />
// //             <span>{project.leadCount || 0}</span>
// //           </div>
// //         </div>
        
// //         <div className="project-actions">
// //           <button onClick={() => onEdit(project)} className="edit-button">
// //             <FiEdit />
// //           </button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // Project Modal Component (Add/Edit)
// // const ProjectModal = ({ project, domains, onClose, onSave }) => {
// //   const [formData, setFormData] = useState({
// //     title: project?.title || '',
// //     abstract: project?.abstract || '',
// //     specifications: project?.specifications || '',
// //     learningOutcomes: project?.learningOutcomes || '',
// //     subDomainId: project?.subDomainId || '',
// //     isFeatured: project?.isFeatured || false
// //   });
// //   const [loading, setLoading] = useState(false);
// //   const [selectedDomain, setSelectedDomain] = useState('');
// //   const [subDomains, setSubDomains] = useState([]);

// //   useEffect(() => {
// //     if (selectedDomain) {
// //       fetchSubDomains(selectedDomain);
// //     }
// //   }, [selectedDomain]);

// //   const fetchSubDomains = async (domainId) => {
// //     try {
// //       const response = await authService.getLeafSubDomains(domainId);
// //       setSubDomains(response.data || []);
// //     } catch (error) {
// //       console.error('❌ Error fetching sub-domains:', error);
// //     }
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       if (project) {
// //         await authService.updateProject(project.id, formData);
// //         toast.success('Project updated successfully');
// //       } else {
// //         await authService.createProject(formData);
// //         toast.success('Project created successfully');
// //       }
// //       onSave();
// //     } catch (error) {
// //       console.error('❌ Error saving project:', error);
// //       toast.error('Failed to save project');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="modal-overlay">
// //       <div className="modal large">
// //         <div className="modal-header">
// //           <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
// //           <button onClick={onClose}>×</button>
// //         </div>
        
// //         <form onSubmit={handleSubmit}>
// //           <div className="form-grid">
// //             <div className="form-group">
// //               <label>Project Title</label>
// //               <input
// //                 type="text"
// //                 value={formData.title}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// //                 required
// //               />
// //             </div>
            
// //             <div className="form-group">
// //               <label>Domain</label>
// //               <select
// //                 value={selectedDomain}
// //                 onChange={(e) => setSelectedDomain(e.target.value)}
// //                 required={!project}
// //               >
// //                 <option value="">Select Domain</option>
// //                 {domains.map(domain => (
// //                   <option key={domain.id} value={domain.id}>{domain.title}</option>
// //                 ))}
// //               </select>
// //             </div>
            
// //             <div className="form-group">
// //               <label>Sub-Domain</label>
// //               <select
// //                 value={formData.subDomainId}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, subDomainId: e.target.value }))}
// //                 required
// //               >
// //                 <option value="">Select Sub-Domain</option>
// //                 {subDomains.map(sub => (
// //                   <option key={sub.id} value={sub.id}>{sub.title}</option>
// //                 ))}
// //               </select>
// //             </div>
// //           </div>
          
// //           <div className="form-group">
// //             <label>Abstract</label>
// //             <textarea
// //               value={formData.abstract}
// //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// //               rows={4}
// //               required
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>Specifications</label>
// //             <textarea
// //               value={formData.specifications}
// //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// //               rows={6}
// //               required
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>Learning Outcomes</label>
// //             <textarea
// //               value={formData.learningOutcomes}
// //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// //               rows={4}
// //               required
// //             />
// //           </div>
          
// //           <div className="form-group checkbox">
// //             <label>
// //               <input
// //                 type="checkbox"
// //                 checked={formData.isFeatured}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// //               />
// //               Featured Project
// //             </label>
// //           </div>
          
// //           <div className="modal-actions">
// //             <button type="button" onClick={onClose} disabled={loading}>
// //               Cancel
// //             </button>
// //             <button type="submit" className="primary-button" disabled={loading}>
// //               {loading ? 'Saving...' : 'Save'}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // // Project Details Modal
// // const ProjectDetailsModal = ({ project, onClose }) => {
// //   return (
// //     <div className="modal-overlay">
// //       <div className="modal large">
// //         <div className="modal-header">
// //           <h2>{project.title}</h2>
// //           <button onClick={onClose}>×</button>
// //         </div>
        
// //         <div className="project-details">
// //           <div className="detail-section">
// //             <h3>Abstract</h3>
// //             <p>{project.abstract}</p>
// //           </div>
          
// //           <div className="detail-section">
// //             <h3>Specifications</h3>
// //             <p>{project.specifications}</p>
// //           </div>
          
// //           <div className="detail-section">
// //             <h3>Learning Outcomes</h3>
// //             <p>{project.learningOutcomes}</p>
// //           </div>
          
// //           <div className="detail-stats">
// //             <div className="stat-item">
// //               <strong>Views:</strong> {project.viewCount || 0}
// //             </div>
// //             <div className="stat-item">
// //               <strong>Leads:</strong> {project.leadCount || 0}
// //             </div>
// //             <div className="stat-item">
// //               <strong>Featured:</strong> {project.isFeatured ? 'Yes' : 'No'}
// //             </div>
// //             <div className="stat-item">
// //               <strong>Status:</strong> {project.isActive ? 'Active' : 'Archived'}
// //             </div>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ProjectManagement;