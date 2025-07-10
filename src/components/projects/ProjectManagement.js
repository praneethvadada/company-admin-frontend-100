// src/components/projects/ProjectManagement.js - COMPLETE VERSION WITH ADD PROJECT
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
  FiArrowRight,
  FiGrid,
  FiList,
  FiX
} from 'react-icons/fi';

// Hierarchical SubDomain Dropdown Component
const HierarchicalSubDomainSelect = ({ subDomains, value, onChange, disabled, required, showAllOption = false }) => {
  console.log('🌲 HIERARCHICAL SELECT - SubDomains:', subDomains);

  // Flatten the tree structure while preserving hierarchy for display
  const flattenSubDomains = (domains, level = 0, prefix = '') => {
    let flattened = [];
    
    domains.forEach(domain => {
      // Create display text with indentation
      const indent = '  '.repeat(level); // 2 spaces per level
      const displayText = `${indent}${prefix}${domain.title}${domain.isLeaf ? ' (Leaf - Can have projects)' : ' (Branch)'}`;
      
      flattened.push({
        id: domain.id,
        title: domain.title,
        displayText,
        level,
        isLeaf: domain.isLeaf,
        parentId: domain.parentId
      });

      // Recursively add children
      if (domain.children && domain.children.length > 0) {
        const childPrefix = level === 0 ? '└─ ' : '  └─ ';
        flattened = flattened.concat(
          flattenSubDomains(domain.children, level + 1, childPrefix)
        );
      }
    });

    return flattened;
  };

  const flattenedSubDomains = flattenSubDomains(subDomains);
  
  console.log('🌲 HIERARCHICAL SELECT - Flattened:', flattenedSubDomains);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      required={required}
      style={{
        fontFamily: 'monospace', // Monospace font to maintain alignment
        fontSize: '0.9rem'
      }}
    >
      <option value="">{showAllOption ? 'All SubDomains' : 'Select SubDomain'}</option>
      {flattenedSubDomains.map(subdomain => (
        <option 
          key={subdomain.id} 
          value={subdomain.id}
          disabled={!showAllOption && !subdomain.isLeaf} // For filters, allow all; for forms, only leafs
          style={{
            color: subdomain.isLeaf ? '#000' : '#666',
            fontWeight: subdomain.isLeaf ? 'normal' : 'bold',
            fontStyle: subdomain.isLeaf ? 'normal' : 'italic'
          }}
        >
          {subdomain.displayText}
        </option>
      ))}
    </select>
  );
};

const ProjectManagement = () => {
  console.log('🚀 PROJECT MANAGEMENT - Component rendering/mounting');
  
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [domains, setDomains] = useState([]);
  const [subDomains, setSubDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    domainId: '',
    subDomainId: '',
    isActive: true,
    isFeatured: null,
    sortBy: 'updatedAt',
    sortOrder: 'DESC'
  });

  console.log('📊 PROJECT MANAGEMENT - Current state:', {
    projectsCount: projects.length,
    domainsCount: domains.length,
    subDomainsCount: subDomains.length,
    loading,
    showAddModal,
    selectedDomain,
    pagination,
    filters
  });

  useEffect(() => {
    console.log('🔄 PROJECT MANAGEMENT - Initial useEffect triggered');
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
      console.log('🔍 INITIAL DATA - Response structure check:', {
        hasDirectDomains: !!domainsResponse.data?.domains,
        hasNestedDomains: !!domainsResponse.data?.data?.domains,
        isArray: Array.isArray(domainsResponse.data),
        responseKeys: Object.keys(domainsResponse.data || {})
      });
      
      // Extract domains using the same logic as DomainManagement
      const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
      console.log('🎯 INITIAL DATA - Extracted domains:', domains);
      console.log('📊 INITIAL DATA - Domains count:', domains.length);
      
      setDomains(domains);
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

  const fetchSubDomains = async (domainId) => {
    try {
      console.log('📡 SUBDOMAINS - Fetching for domain:', domainId);
      const response = await authService.getSubDomains({ domainId: domainId });
      console.log('✅ SUBDOMAINS - Response:', response.data);
      console.log('🔍 SUBDOMAINS - Response structure check:', {
        hasDirectSubDomains: !!response.data?.subDomains,
        hasNestedSubDomains: !!response.data?.data?.subDomains,
        isArray: Array.isArray(response.data),
        responseKeys: Object.keys(response.data || {})
      });
      
      // Extract subdomains using the same logic pattern
      const subdomains = response.data?.subDomains || response.data?.data?.subDomains || [];
      console.log('🎯 SUBDOMAINS - Extracted:', subdomains);
      console.log('📊 SUBDOMAINS - Count:', subdomains.length);
      
      setSubDomains(subdomains);
    } catch (error) {
      console.error('❌ SUBDOMAINS - Error:', error);
      setSubDomains([]);
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
    
    // If domain changes, fetch subdomains
    if (filterKey === 'domainId') {
      if (value) {
        fetchSubDomains(value);
      } else {
        setSubDomains([]);
      }
      // Reset subdomain filter when domain changes
      setFilters(prev => ({ ...prev, subDomainId: '' }));
    }
  };

  const handleAddProject = () => {
    console.log('➕ PROJECT ADD - Opening modal');
    setEditingProject(null);
    setShowAddModal(true);
  };

  const handleEditProject = (project) => {
    console.log('✏️ PROJECT EDIT - Editing:', project.title);
    setEditingProject(project);
    setShowAddModal(true);
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

  const handleModalClose = () => {
    console.log('❌ PROJECT MODAL - Closing');
    setShowAddModal(false);
    setEditingProject(null);
    setSelectedDomain('');
    setSubDomains([]);
  };

  const handleModalSave = () => {
    console.log('✅ PROJECT MODAL - Saved successfully');
    setShowAddModal(false);
    setEditingProject(null);
    setSelectedDomain('');
    setSubDomains([]);
    fetchProjects();
  };

  if (loading && projects.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  console.log('🎨 PROJECT MANAGEMENT - Rendering main component');

  return (
    <div className="project-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Project Management</h1>
          <p>Manage and organize all your projects</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" onClick={handleAddProject}>
            <FiPlus />
            Add Project
          </button>
        </div>
      </div>

      {/* Controls */}
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
              <option key={domain.id} value={domain.id}>
                {domain.title}
              </option>
            ))}
          </select>

          <HierarchicalSubDomainSelect
            subDomains={subDomains}
            value={filters.subDomainId}
            onChange={(value) => handleFilterChange('subDomainId', value)}
            disabled={!filters.domainId}
            required={false}
            showAllOption={true}
          />

          <select
            value={filters.isActive}
            onChange={(e) => handleFilterChange('isActive', e.target.value === 'true')}
          >
            <option value={true}>Active</option>
            <option value={false}>Archived</option>
          </select>
        </div>

        <div className="view-controls">
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

      {/* Projects Grid/List */}
      <div className={`projects-container ${viewMode}`}>
        {projects.length === 0 ? (
          <div className="empty-state">
            <FiFileText size={48} />
            <h3>No projects found</h3>
            <p>Get started by creating your first project</p>
            <button className="primary-button" onClick={handleAddProject}>
              <FiPlus />
              Create Project
            </button>
          </div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="project-card">
              <div className="project-header">
                <h3>{project.title}</h3>
                <div className="project-actions">
                  {project.isFeatured && <FiStar className="featured-icon" />}
                  <button onClick={() => handleEditProject(project)}>
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDeleteProject(project)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <div className="project-content">
                <p className="project-abstract">
                  {project.abstract || 'No abstract available'}
                </p>
                
                <div className="project-meta">
                  <span className="subdomain-tag">
                    <FiFolder />
                    {project.subDomain?.title || 'Unknown SubDomain'}
                  </span>
                  <span className={`status-badge ${project.isActive ? 'active' : 'inactive'}`}>
                    {project.isActive ? 'Active' : 'Archived'}
                  </span>
                </div>
              </div>
            </div>
          ))
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
          <span>
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <button
            disabled={pagination.currentPage === pagination.totalPages}
            onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Project Modal */}
      {showAddModal && (
        <ProjectModal
          project={editingProject}
          domains={domains}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

// Project Modal Component
const ProjectModal = ({ project, domains, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: project?.title || '',
    abstract: project?.abstract || '',
    specifications: project?.specifications || '',
    learningOutcomes: project?.learningOutcomes || '',
    subDomainId: project?.subDomainId || '',
    isFeatured: project?.isFeatured || false
  });
  const [loading, setLoading] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState('');
  const [subDomains, setSubDomains] = useState([]);

  console.log('📝 PROJECT MODAL - Props:', {
    project: project?.title,
    domainsCount: domains.length,
    formData
  });

  useEffect(() => {
    if (selectedDomain) {
      fetchSubDomains(selectedDomain);
    }
  }, [selectedDomain]);

  const fetchSubDomains = async (domainId) => {
    try {
      console.log('📡 MODAL - Fetching subdomains for domain:', domainId);
      const response = await authService.getSubDomains({ domainId: domainId });
      console.log('✅ MODAL - Subdomains response:', response.data);
      console.log('🔍 MODAL - Response structure check:', {
        hasDirectSubDomains: !!response.data?.subDomains,
        hasNestedSubDomains: !!response.data?.data?.subDomains,
        isArray: Array.isArray(response.data),
        responseKeys: Object.keys(response.data || {})
      });
      
      // Extract subdomains using the same logic pattern
      const subdomains = response.data?.subDomains || response.data?.data?.subDomains || [];
      console.log('🎯 MODAL - Extracted subdomains:', subdomains);
      console.log('📊 MODAL - Subdomains count:', subdomains.length);
      
      setSubDomains(subdomains);
    } catch (error) {
      console.error('❌ MODAL - Error fetching subdomains:', error);
      setSubDomains([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('💾 MODAL - Submitting form data:', formData);

    try {
      const projectData = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        specifications: formData.specifications.trim(),
        learningOutcomes: formData.learningOutcomes.trim(),
        subDomainId: formData.subDomainId,
        isFeatured: formData.isFeatured
      };

      if (project) {
        console.log('📡 MODAL - Updating project:', project.id);
        await authService.updateProject(project.id, projectData);
        console.log('✅ MODAL - Project updated successfully');
        toast.success('Project updated successfully');
      } else {
        console.log('📡 MODAL - Creating new project');
        await authService.createProject(projectData);
        console.log('✅ MODAL - Project created successfully');
        toast.success('Project created successfully');
      }
      onSave();
    } catch (error) {
      console.error('❌ MODAL - Error saving project:', error);
      console.error('❌ MODAL - Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to save project';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>{project ? 'Edit Project' : 'Add New Project'}</h2>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title..."
              required
              minLength={3}
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>Domain *</label>
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                setFormData(prev => ({ ...prev, subDomainId: '' }));
              }}
              required
            >
              <option value="">Select Domain</option>
              {domains.map(domain => (
                <option key={domain.id} value={domain.id}>
                  {domain.title}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>SubDomain * (Hierarchical View)</label>
            <HierarchicalSubDomainSelect
              subDomains={subDomains}
              value={formData.subDomainId}
              onChange={(value) => setFormData(prev => ({ ...prev, subDomainId: value }))}
              disabled={!selectedDomain}
              required={true}
            />
            <small style={{ color: '#666', fontSize: '0.875rem', marginTop: '0.25rem', display: 'block' }}>
              📋 Only leaf subdomains (marked as "Leaf") can have projects assigned to them.
              <br />
              🌳 The tree structure shows: Parent → Child → Sub-child relationships.
            </small>
          </div>
          
          <div className="form-group">
            <label>Abstract</label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
              placeholder="Brief project description..."
              rows={3}
              maxLength={1000}
            />
          </div>
          
          <div className="form-group">
            <label>Specifications</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              placeholder="Technical specifications..."
              rows={4}
              maxLength={2000}
            />
          </div>
          
          <div className="form-group">
            <label>Learning Outcomes</label>
            <textarea
              value={formData.learningOutcomes}
              onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
              placeholder="What will students learn..."
              rows={3}
              maxLength={1000}
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
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading || !formData.title.trim() || !formData.subDomainId}
            >
              {loading ? (project ? 'Updating...' : 'Creating...') : (project ? 'Update Project' : 'Create Project')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectManagement;