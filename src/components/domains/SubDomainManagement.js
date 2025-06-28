// src/components/domains/SubDomainManagement.js - ENHANCED WITH PROJECT VIEW/EDIT/DELETE
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiChevronDown,
  FiChevronRight,
  FiFolder,
  FiFolderPlus,
  FiFileText,
  FiArrowLeft,
  FiMoreVertical,
  FiMove,
  FiTarget,
  FiEye,
  FiStar,
  FiArchive,
  FiList,
  FiX
} from 'react-icons/fi';

const SubDomainManagement = () => {
  console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
  const { domainId } = useParams();
  const navigate = useNavigate();
  
  const [domain, setDomain] = useState(null);
  const [subDomains, setSubDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSubDomain, setEditingSubDomain] = useState(null);
  const [selectedParent, setSelectedParent] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Project creation state
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

  // NEW: Project management states
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [selectedSubDomainForProjectsView, setSelectedSubDomainForProjectsView] = useState(null);
  const [projectsInSubDomain, setProjectsInSubDomain] = useState([]);
  const [editingProject, setEditingProject] = useState(null);
  const [showProjectEditModal, setShowProjectEditModal] = useState(false);
  const [projectsLoading, setProjectsLoading] = useState(false);

  console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
    domainId,
    domain: domain?.title,
    subDomainsCount: subDomains.length,
    loading,
    selectedParent: selectedParent?.title,
    expandedCount: expandedNodes.size,
    showProjectModal,
    selectedSubDomainForProject: selectedSubDomainForProject?.title,
    // NEW states
    showProjectsModal,
    selectedSubDomainForProjectsView: selectedSubDomainForProjectsView?.title,
    projectsInSubDomainCount: projectsInSubDomain.length,
    editingProject: editingProject?.title
  });

  useEffect(() => {
    if (domainId) {
      console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
      fetchDomainAndSubDomains();
    }
  }, [domainId]);

  const fetchDomainAndSubDomains = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
      // Get domain details
      const domainsResponse = await authService.getDomains();
      console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
      let domainData = null;
      const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
      if (domains.length > 0) {
        domainData = domains.find(d => d.id == domainId);
        console.log('🎯 SUBDOMAIN FETCH - Found domain data:', domainData);
      }
      
      if (!domainData) {
        console.log('⚠️ SUBDOMAIN FETCH - Domain not found, creating fallback');
        domainData = {
          id: domainId,
          title: `Domain ${domainId}`,
          description: 'Domain not found in list',
          projectCount: 0
        };
      }
      
      setDomain(domainData);
      
      // Get subdomains
      console.log('📡 SUBDOMAIN FETCH - Fetching subdomains with domainId:', domainId);
      const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
      console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse);
      console.log('✅ SUBDOMAIN FETCH - SubDomains response.data:', subDomainsResponse.data);
      console.log('✅ SUBDOMAIN FETCH - SubDomains response data type:', typeof subDomainsResponse.data);
      console.log('✅ SUBDOMAIN FETCH - SubDomains response data keys:', Object.keys(subDomainsResponse.data || {}));
      
      const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
      console.log('🎯 SUBDOMAIN FETCH - Extracted subdomains data:', subDomainsData);
      console.log('🎯 SUBDOMAIN FETCH - Subdomains count:', subDomainsData.length);
      
      // 🔍 DEBUGGING: Log each subdomain's project count
      subDomainsData.forEach((subdomain, index) => {
        console.log(`📊 SUBDOMAIN ${index + 1} [${subdomain.title}]:`, {
          id: subdomain.id,
          title: subdomain.title,
          projectCount: subdomain.projectCount,
          hasChildren: subdomain.children && subdomain.children.length > 0,
          childrenCount: subdomain.children?.length || 0,
          isLeaf: !subdomain.children || subdomain.children.length === 0,
          fullObject: subdomain
        });
      });
      
      setSubDomains(subDomainsData);
      
      // Auto-expand first level
      if (subDomainsData.length > 0) {
        const firstLevelIds = subDomainsData.map(sd => sd.id);
        setExpandedNodes(new Set(firstLevelIds));
        console.log('🔄 SUBDOMAIN FETCH - Auto-expanded first level IDs:', firstLevelIds);
      }
      
      // Try hierarchy API as fallback
      try {
        console.log('📡 SUBDOMAIN FETCH - Trying hierarchy API as fallback');
        const hierarchyResponse = await authService.getDomainHierarchy(domainId);
        console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse);
        console.log('✅ SUBDOMAIN FETCH - Hierarchy response.data:', hierarchyResponse.data);
        
        const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
        console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
        if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
          console.log('🔄 SUBDOMAIN FETCH - Using hierarchy data instead');
          console.log('🔄 SUBDOMAIN FETCH - Hierarchy subdomains:', hierarchyData.subDomains);
          
          // 🔍 DEBUGGING: Log hierarchy subdomain project counts
          hierarchyData.subDomains.forEach((subdomain, index) => {
            console.log(`📊 HIERARCHY SUBDOMAIN ${index + 1} [${subdomain.title}]:`, {
              id: subdomain.id,
              title: subdomain.title,
              projectCount: subdomain.projectCount,
              hasChildren: subdomain.children && subdomain.children.length > 0,
              childrenCount: subdomain.children?.length || 0,
              isLeaf: !subdomain.children || subdomain.children.length === 0,
              fullObject: subdomain
            });
          });
          
          setSubDomains(hierarchyData.subDomains);
          if (hierarchyData.title && !domainData.title.includes('Domain ')) {
            setDomain(prev => ({ ...prev, ...hierarchyData }));
          }
        }
      } catch (hierarchyError) {
        console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
        console.log('⚠️ SUBDOMAIN FETCH - Hierarchy error response:', hierarchyError.response);
      }
      
    } catch (error) {
      console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
      console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
      console.error('❌ SUBDOMAIN FETCH - Error response data:', error.response?.data);
      console.error('❌ SUBDOMAIN FETCH - Error message:', error.message);
      toast.error('Failed to fetch domain information: ' + (error.response?.data?.message || error.message));
      
      setDomain({
        id: domainId,
        title: `Domain ${domainId}`,
        description: 'Error loading domain details',
        projectCount: 0
      });
      setSubDomains([]);
    } finally {
      setLoading(false);
      console.log('🏁 SUBDOMAIN FETCH - Loading set to false');
    }
  };

  const handleAddSubDomain = (parent = null) => {
    console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
    setSelectedParent(parent);
    setEditingSubDomain(null);
    setShowAddModal(true);
  };

  const handleEditSubDomain = (subDomain) => {
    console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
    setSelectedParent(null);
    setEditingSubDomain(subDomain);
    setShowAddModal(true);
  };

  // Handle adding project to subdomain
  const handleAddProjectToSubDomain = (subDomain) => {
    console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
    console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
    if (subDomain.children && subDomain.children.length > 0) {
      toast.error('Projects can only be added to leaf sub-domains (those without children)');
      return;
    }
    
    setSelectedSubDomainForProject(subDomain);
    setShowProjectModal(true);
  };

  // NEW: Handle viewing projects in subdomain
  const handleViewProjectsInSubDomain = async (subDomain) => {
    console.log('👁️ VIEW PROJECTS - Starting for subdomain:', subDomain.title);
    console.log('🔍 VIEW PROJECTS - SubDomain object:', subDomain);
    console.log('🔍 VIEW PROJECTS - Has children?', subDomain.children && subDomain.children.length > 0);
    console.log('🔍 VIEW PROJECTS - Project count:', subDomain.projectCount);
    console.log('🔍 VIEW PROJECTS - Is leaf?', !subDomain.children || subDomain.children.length === 0);
    
    if (subDomain.children && subDomain.children.length > 0) {
      console.log('❌ VIEW PROJECTS - Not a leaf subdomain');
      toast.error('Only leaf sub-domains have projects to view');
      return;
    }
    
    if (!subDomain.projectCount || subDomain.projectCount === 0) {
      console.log('❌ VIEW PROJECTS - No projects in subdomain');
      toast.info('This sub-domain has no projects yet. Let\'s fetch anyway to check...');
      // Don't return - still try to fetch in case the count is wrong
    }
    
    console.log('✅ VIEW PROJECTS - Proceeding to fetch projects');
    setSelectedSubDomainForProjectsView(subDomain);
    await fetchProjectsInSubDomain(subDomain.id);
    setShowProjectsModal(true);
  };

  // NEW: Fetch projects for a specific subdomain
  const fetchProjectsInSubDomain = async (subDomainId) => {
    try {
      setProjectsLoading(true);
      console.log('📡 FETCH PROJECTS - For subdomain ID:', subDomainId);
      console.log('📡 FETCH PROJECTS - Making API call to authService.getProjects()');
      
      const response = await authService.getProjects({ 
        subDomainId: subDomainId,
        limit: 100 // Get all projects for this subdomain
      });
      
      console.log('✅ FETCH PROJECTS - Full API Response:', response);
      console.log('✅ FETCH PROJECTS - Response status:', response.status);
      console.log('✅ FETCH PROJECTS - Response data:', response.data);
      console.log('✅ FETCH PROJECTS - Response data type:', typeof response.data);
      console.log('✅ FETCH PROJECTS - Response data keys:', Object.keys(response.data || {}));
      
      const projects = response.data?.projects || response.data?.data?.projects || [];
      console.log('🎯 FETCH PROJECTS - Extracted projects:', projects);
      console.log('🎯 FETCH PROJECTS - Projects count:', projects.length);
      console.log('🎯 FETCH PROJECTS - First project (if any):', projects[0]);
      
      setProjectsInSubDomain(projects);
      
      if (projects.length === 0) {
        console.log('⚠️ FETCH PROJECTS - No projects found for subdomain:', subDomainId);
        toast.info(`No projects found in this subdomain. API returned ${projects.length} projects.`);
      } else {
        console.log('🎉 FETCH PROJECTS - Successfully loaded', projects.length, 'projects');
      }
      
    } catch (error) {
      console.error('❌ FETCH PROJECTS - Error occurred:', error);
      console.error('❌ FETCH PROJECTS - Error response:', error.response);
      console.error('❌ FETCH PROJECTS - Error response data:', error.response?.data);
      console.error('❌ FETCH PROJECTS - Error message:', error.message);
      toast.error('Failed to fetch projects: ' + (error.response?.data?.message || error.message));
      setProjectsInSubDomain([]);
    } finally {
      setProjectsLoading(false);
      console.log('🏁 FETCH PROJECTS - Loading set to false');
    }
  };

  // NEW: Handle editing a project
  const handleEditProject = (project) => {
    console.log('✏️ EDIT PROJECT - Starting for:', project.title);
    setEditingProject(project);
    setShowProjectEditModal(true);
  };

  // NEW: Handle deleting a project
  const handleDeleteProject = async (project) => {
    console.log('🗑️ DELETE PROJECT - Starting deletion process for:', project.title);
    console.log('🗑️ DELETE PROJECT - Project ID:', project.id);
    console.log('🗑️ DELETE PROJECT - Full project object:', project);
    
    const confirmMessage = `Are you sure you want to delete the project "${project.title}"?\n\nThis action cannot be undone.`;
    const userConfirmed = window.confirm(confirmMessage);
    
    console.log('🗑️ DELETE PROJECT - User confirmation:', userConfirmed);
    
    if (!userConfirmed) {
      console.log('❌ DELETE PROJECT - Cancelled by user');
      return;
    }

    try {
      console.log('📡 DELETE PROJECT - Making API call to authService.deleteProject()');
      console.log('📡 DELETE PROJECT - API endpoint will be: /admin/projects/' + project.id);
      
      const response = await authService.deleteProject(project.id);
      
      console.log('✅ DELETE PROJECT - API Response received:', response);
      console.log('✅ DELETE PROJECT - Response status:', response.status);
      console.log('✅ DELETE PROJECT - Response data:', response.data);
      
      toast.success('Project deleted successfully');
      console.log('🎉 DELETE PROJECT - Success toast shown');
      
      // Refresh projects list and subdomain data
      console.log('🔄 DELETE PROJECT - Refreshing projects list for subdomain:', selectedSubDomainForProjectsView.id);
      await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
      console.log('🔄 DELETE PROJECT - Refreshing domain and subdomains to update counts');
      await fetchDomainAndSubDomains(); // Refresh to update project counts
      
    } catch (error) {
      console.error('❌ DELETE PROJECT - Error occurred:', error);
      console.error('❌ DELETE PROJECT - Error type:', typeof error);
      console.error('❌ DELETE PROJECT - Error message:', error.message);
      console.error('❌ DELETE PROJECT - Error response:', error.response);
      console.error('❌ DELETE PROJECT - Error response status:', error.response?.status);
      console.error('❌ DELETE PROJECT - Error response data:', error.response?.data);
      console.error('❌ DELETE PROJECT - Error stack:', error.stack);
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      toast.error('Failed to delete project: ' + errorMessage);
      console.log('❌ DELETE PROJECT - Error toast shown with message:', errorMessage);
    }
  };

  // NEW: Handle archiving a project
  const handleArchiveProject = async (project) => {
    const isArchiving = project.isActive;
    const action = isArchiving ? 'archive' : 'restore';
    
    console.log('📁 ARCHIVE PROJECT - Action:', action, 'for:', project.title);
    
    if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
      return;
    }

    try {
      await authService.archiveProject(project.id, {
        archive: isArchiving,
        reason: `${action} via subdomain management`
      });
      console.log('✅ ARCHIVE PROJECT - Success');
      toast.success(`Project ${action}d successfully`);
      
      // Refresh projects list
      await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
    } catch (error) {
      console.error('❌ ARCHIVE PROJECT - Error:', error);
      toast.error(`Failed to ${action} project`);
    }
  };

  // NEW: Handle toggling featured status
  const handleToggleProjectFeatured = async (project) => {
    console.log('⭐ TOGGLE FEATURED - For project:', project.title);
    
    try {
      await authService.updateProject(project.id, {
        isFeatured: !project.isFeatured
      });
      console.log('✅ TOGGLE FEATURED - Success');
      toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
      
      // Refresh projects list
      await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
    } catch (error) {
      console.error('❌ TOGGLE FEATURED - Error:', error);
      toast.error('Failed to update featured status');
    }
  };

  const handleDeleteSubDomain = async (subDomain) => {
    console.log('🗑️ SUBDOMAIN DELETE - Starting deletion process for:', subDomain.title);
    console.log('🗑️ SUBDOMAIN DELETE - SubDomain ID:', subDomain.id);
    console.log('🗑️ SUBDOMAIN DELETE - Full subdomain object:', subDomain);
    
    const hasChildren = subDomain.children && subDomain.children.length > 0;
    const hasProjects = subDomain.projectCount > 0;
    
    console.log('🗑️ SUBDOMAIN DELETE - Has children:', hasChildren);
    console.log('🗑️ SUBDOMAIN DELETE - Has projects:', hasProjects);
    console.log('🗑️ SUBDOMAIN DELETE - Children count:', subDomain.children?.length || 0);
    console.log('🗑️ SUBDOMAIN DELETE - Project count:', subDomain.projectCount || 0);
    
    let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
    if (hasChildren) {
      confirmMessage += '\n\nThis will also delete all nested sub-domains.';
    }
    if (hasProjects) {
      confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
    }
    confirmMessage += '\n\nThis action cannot be undone.';
    
    const userConfirmed = window.confirm(confirmMessage);
    console.log('🗑️ SUBDOMAIN DELETE - User confirmation:', userConfirmed);
    
    if (!userConfirmed) {
      console.log('❌ SUBDOMAIN DELETE - Cancelled by user');
      return;
    }

    try {
      console.log('📡 SUBDOMAIN DELETE - Making API call to authService.deleteSubDomain()');
      console.log('📡 SUBDOMAIN DELETE - API endpoint will be: /admin/subdomains/' + subDomain.id);
      
      const response = await authService.deleteSubDomain(subDomain.id);
      
      console.log('✅ SUBDOMAIN DELETE - API Response received:', response);
      console.log('✅ SUBDOMAIN DELETE - Response status:', response.status);
      console.log('✅ SUBDOMAIN DELETE - Response data:', response.data);
      
      toast.success('Sub-domain deleted successfully');
      console.log('🎉 SUBDOMAIN DELETE - Success toast shown');
      
      console.log('🔄 SUBDOMAIN DELETE - Refreshing domain and subdomains');
      fetchDomainAndSubDomains();
      
    } catch (error) {
      console.error('❌ SUBDOMAIN DELETE - Error occurred:', error);
      console.error('❌ SUBDOMAIN DELETE - Error type:', typeof error);
      console.error('❌ SUBDOMAIN DELETE - Error message:', error.message);
      console.error('❌ SUBDOMAIN DELETE - Error response:', error.response);
      console.error('❌ SUBDOMAIN DELETE - Error response status:', error.response?.status);
      console.error('❌ SUBDOMAIN DELETE - Error response data:', error.response?.data);
      console.error('❌ SUBDOMAIN DELETE - Error stack:', error.stack);
      
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      toast.error('Failed to delete sub-domain: ' + errorMessage);
      console.log('❌ SUBDOMAIN DELETE - Error toast shown with message:', errorMessage);
    }
  };

  const toggleExpanded = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading sub-domains...</p>
      </div>
    );
  }

  return (
    <div className="subdomain-management">
      {/* Header with Breadcrumb */}
      <div className="page-header">
        <div className="header-content">
          <div className="breadcrumb">
            <button 
              className="breadcrumb-link"
              onClick={() => navigate('/domains')}
            >
              <FiArrowLeft />
              Domains
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
          </div>
          <h1>SubDomain Management</h1>
          <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
        </div>
        <div className="header-actions">
          <button 
            className="primary-button" 
            onClick={() => handleAddSubDomain()}
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '12px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            <FiPlus style={{marginRight: '6px'}} />
            Add Root SubDomain
          </button>
        </div>
      </div>

      {/* Quick Guide */}
      <div className="quick-guide">
        <h3>How to Build Your SubDomain Hierarchy:</h3>
        <div className="guide-steps">
          <div className="guide-step">
            <span className="step-number">1</span>
            <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
          </div>
          <div className="guide-step">
            <span className="step-number">2</span>
            <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
          </div>
          <div className="guide-step">
            <span className="step-number">3</span>
            <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
          </div>
          <div className="guide-step">
            <span className="step-number">4</span>
            <span className="step-text">Click <strong>"Add Project"</strong> or <strong>"View Projects"</strong> on leaf subdomains</span>
          </div>
        </div>
      </div>

      {/* Domain Info Card */}
      {domain && (
        <div className="domain-info-card">
          <div className="domain-icon">
            <FiFolder />
          </div>
          <div className="domain-details">
            <h3>{domain.title}</h3>
            <p>{domain.description}</p>
            <div className="domain-stats">
              <span className="stat-item">
                <strong>{subDomains.length}</strong> root sub-domains
              </span>
              <span className="stat-item">
                <strong>{domain.projectCount || 0}</strong> total projects
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SubDomain Tree */}
      <div className="subdomain-tree-container">
        <div className="tree-header">
          <h2>SubDomain Hierarchy</h2>
          <div className="tree-legend">
            <span className="legend-item">
              <FiFolder className="folder-icon" />
              Has children
            </span>
            <span className="legend-item">
              <FiTarget className="leaf-icon" />
              Leaf (can have projects)
            </span>
            <span className="legend-item">
              <FiFileText className="project-icon" />
              Add Project
            </span>
            <span className="legend-item">
              <FiList className="view-icon" />
              View Projects
            </span>
          </div>
        </div>

        {subDomains.length > 0 ? (
          <div className="subdomain-tree">
            {subDomains.map((subDomain) => (
              <SubDomainNode
                key={subDomain.id}
                subDomain={subDomain}
                level={0}
                isExpanded={expandedNodes.has(subDomain.id)}
                onToggleExpanded={toggleExpanded}
                onEdit={handleEditSubDomain}
                onDelete={handleDeleteSubDomain}
                onAddChild={handleAddSubDomain}
                onAddProject={handleAddProjectToSubDomain}
                onViewProjects={handleViewProjectsInSubDomain} // NEW
                expandedNodes={expandedNodes}
              />
            ))}
          </div>
        ) : (
          <div className="empty-tree-state">
            <FiFolderPlus size={64} />
            <h3>No SubDomains Yet</h3>
            <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
            <div className="empty-state-examples">
              <h4>Example Structure:</h4>
              <div className="example-tree">
                <div className="example-item">📂 Machine Learning</div>
                <div className="example-item nested">🎯 Deep Learning</div>
                <div className="example-item nested">🎯 Computer Vision</div>
                <div className="example-item">🎯 Data Science</div>
              </div>
            </div>
            <div className="empty-state-actions">
              <button 
                className="primary-button large" 
                onClick={() => handleAddSubDomain()}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '14px 20px',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600'
                }}
              >
                <FiPlus style={{marginRight: '8px'}} />
                Create Your First SubDomain
              </button>
              <p className="help-text">
                💡 Tip: Start with broad categories, then add specific subcategories as needed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit SubDomain Modal */}
      {showAddModal && (
        <SubDomainModal
          subDomain={editingSubDomain}
          parent={selectedParent}
          domain={domain}
          onClose={() => {
            setShowAddModal(false);
            setEditingSubDomain(null);
            setSelectedParent(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditingSubDomain(null);
            setSelectedParent(null);
            fetchDomainAndSubDomains();
          }}
        />
      )}

      {/* Project Creation Modal */}
      {showProjectModal && (
        <ProjectModal
          subDomain={selectedSubDomainForProject}
          domain={domain}
          onClose={() => {
            setShowProjectModal(false);
            setSelectedSubDomainForProject(null);
          }}
          onSave={() => {
            setShowProjectModal(false);
            setSelectedSubDomainForProject(null);
            toast.success('Project created successfully!');
            fetchDomainAndSubDomains(); // Refresh to update project counts
          }}
        />
      )}

      {/* NEW: Projects List Modal */}
      {showProjectsModal && (
        <ProjectsListModal
          subDomain={selectedSubDomainForProjectsView}
          projects={projectsInSubDomain}
          loading={projectsLoading}
          onClose={() => {
            setShowProjectsModal(false);
            setSelectedSubDomainForProjectsView(null);
            setProjectsInSubDomain([]);
          }}
          onEdit={handleEditProject}
          onDelete={handleDeleteProject}
          onArchive={handleArchiveProject}
          onToggleFeatured={handleToggleProjectFeatured}
          onAddProject={() => {
            setShowProjectsModal(false);
            setSelectedSubDomainForProject(selectedSubDomainForProjectsView);
            setShowProjectModal(true);
          }}
        />
      )}

      {/* NEW: Project Edit Modal */}
      {showProjectEditModal && editingProject && (
        <ProjectEditModal
          project={editingProject}
          onClose={() => {
            setShowProjectEditModal(false);
            setEditingProject(null);
          }}
          onSave={() => {
            setShowProjectEditModal(false);
            setEditingProject(null);
            // Refresh projects list and subdomain data
            fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
            fetchDomainAndSubDomains();
          }}
        />
      )}
    </div>
  );
};

// UPDATED SubDomain Node Component with View Projects functionality
const SubDomainNode = ({ 
  subDomain, 
  level, 
  isExpanded, 
  onToggleExpanded, 
  onEdit, 
  onDelete, 
  onAddChild,
  onAddProject,
  onViewProjects, // NEW
  expandedNodes 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const hasChildren = subDomain.children && subDomain.children.length > 0;
  const isLeaf = !hasChildren;
  const hasProjects = subDomain.projectCount > 0;

  console.log('🌳 SUBDOMAIN NODE - Rendering:', {
    title: subDomain.title,
    level,
    hasChildren,
    isLeaf,
    isExpanded,
    projectCount: subDomain.projectCount,
    hasProjects,
    children: subDomain.children,
    childrenLength: subDomain.children?.length,
    subDomainFullObject: subDomain
  });

  // 🔍 DEBUGGING: Log button visibility conditions
  console.log('🔍 BUTTON VISIBILITY DEBUG for', subDomain.title, ':', {
    isLeaf,
    hasProjects,
    projectCount: subDomain.projectCount,
    shouldShowViewButton: isLeaf && hasProjects,
    shouldShowAddButton: isLeaf
  });

  return (
    <div className={`subdomain-node level-${level}`}>
      <div className="node-content">
        <div className="node-main">
          {hasChildren ? (
            <button 
              className="expand-button"
              onClick={() => onToggleExpanded(subDomain.id)}
            >
              {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
            </button>
          ) : (
            <div className="expand-placeholder" />
          )}
          
          <div className="node-icon">
            {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
          </div>
          
          <div className="node-info">
            <h4 className="node-title">{subDomain.title}</h4>
            <p className="node-description">{subDomain.description}</p>
            <div className="node-stats">
              {hasChildren && (
                <span className="stat-badge">
                  {subDomain.children.length} sub-domains
                </span>
              )}
              {hasProjects && (
                <span className="stat-badge projects">
                  {subDomain.projectCount} projects
                </span>
              )}
              {isLeaf && !hasProjects && (
                <span className="stat-badge leaf">
                  Can have projects
                </span>
              )}
              {/* 🔍 DEBUGGING: Always show project count for debugging */}
              <span className="stat-badge debug" style={{backgroundColor: '#ff9999', color: '#000'}}>
                DEBUG: Count={subDomain.projectCount || 0}
              </span>
            </div>
          </div>
        </div>
        
        <div className="node-actions">
          {/* 🔍 DEBUGGING: Always show this section with debug info */}
          <div style={{fontSize: '10px', color: '#666', marginBottom: '5px'}}>
            DEBUG: isLeaf={isLeaf.toString()}, hasProjects={hasProjects.toString()}, count={subDomain.projectCount}
          </div>
          
          {/* NEW: View Projects button for leaf nodes - ALWAYS SHOW IF LEAF FOR DEBUGGING */}
          {isLeaf && (
            <button 
              className="action-button view" 
              onClick={() => {
                console.log('🎯 VIEW BUTTON CLICKED for:', subDomain.title);
                onViewProjects(subDomain);
              }}
              title={`View projects in "${subDomain.title}" (Count: ${subDomain.projectCount || 0})`}
              style={{backgroundColor: hasProjects ? '#10b981' : '#6b7280'}}
            >
              <FiList />
              <span style={{fontSize: '10px', marginLeft: '2px'}}>
                {subDomain.projectCount || 0}
              </span>
            </button>
          )}
          
          {isLeaf && (
            <button 
              className="action-button project" 
              onClick={() => {
                console.log('🎯 ADD PROJECT BUTTON CLICKED for:', subDomain.title);
                onAddProject(subDomain);
              }}
              title={`Add project to "${subDomain.title}"`}
            >
              <FiFileText />
            </button>
          )}
          
          <button 
            className="action-button add" 
            onClick={() => onAddChild(subDomain)}
            title={`Add child subdomain under "${subDomain.title}"`}
          >
            <FiPlus />
          </button>
          
          <div className="action-menu">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              title="More actions"
            >
              <FiMoreVertical />
            </button>
            {showMenu && (
              <div className="dropdown-menu">
                {/* 🔍 DEBUGGING: Always show view projects option for leaf nodes */}
                {isLeaf && (
                  <button 
                    onClick={() => {
                      console.log('🎯 DROPDOWN VIEW PROJECTS CLICKED for:', subDomain.title);
                      onViewProjects(subDomain);
                      setShowMenu(false);
                    }}
                    className="primary-option"
                    style={{backgroundColor: hasProjects ? '#dff0d8' : '#f8f9fa'}}
                  >
                    <FiList /> View Projects ({subDomain.projectCount || 0})
                  </button>
                )}
                {isLeaf && (
                  <button 
                    onClick={() => {
                      onAddProject(subDomain);
                      setShowMenu(false);
                    }}
                    className="primary-option"
                  >
                    <FiFileText /> Add Project
                  </button>
                )}
                <button onClick={() => {
                  onEdit(subDomain);
                  setShowMenu(false);
                }}>
                  <FiEdit /> Edit SubDomain
                </button>
                <button onClick={() => {
                  onAddChild(subDomain);
                  setShowMenu(false);
                }}>
                  <FiPlus /> Add Child SubDomain
                </button>
                <button onClick={() => {
                  onDelete(subDomain);
                  setShowMenu(false);
                }} className="danger">
                  <FiTrash2 /> Delete SubDomain
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="node-children">
          {subDomain.children.map((child) => (
            <SubDomainNode
              key={child.id}
              subDomain={child}
              level={level + 1}
              isExpanded={expandedNodes.has(child.id)}
              onToggleExpanded={onToggleExpanded}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddChild={onAddChild}
              onAddProject={onAddProject}
              onViewProjects={onViewProjects} // NEW
              expandedNodes={expandedNodes}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// SubDomain Modal Component (unchanged)
const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: subDomain?.title || '',
    description: subDomain?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const requestData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        domainId: domain.id,
        parentId: parent?.id || null
      };

      console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

      if (subDomain) {
        const response = await authService.updateSubDomain(subDomain.id, requestData);
        toast.success('Sub-domain updated successfully');
      } else {
        const response = await authService.createSubDomain(requestData);
        toast.success('Sub-domain created successfully');
      }

      onSave();
    } catch (error) {
      console.error('❌ SUBDOMAIN SAVE - Error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getModalTitle = () => {
    if (subDomain) {
      return `Edit SubDomain: ${subDomain.title}`;
    }
    if (parent) {
      return `Add SubDomain under: ${parent.title}`;
    }
    return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{getModalTitle()}</h2>
          <button onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>SubDomain Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Machine Learning, Deep Learning"
              required
              minLength={3}
              maxLength={100}
            />
          </div>
          
          <div className="form-group">
            <label>Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Describe what this sub-domain covers..."
              maxLength={500}
            />
          </div>
          
          <div className="modal-info">
            <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
            {parent && (
              <>
                <strong>Parent SubDomain:</strong> {parent.title}<br />
              </>
            )}
            <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading || !formData.title.trim()}
            >
              {loading ? 'Saving...' : 'Save SubDomain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Project Creation Modal Component (unchanged)
const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    abstract: '',
    specifications: '',
    learningOutcomes: '',
    subDomainId: subDomain?.id || '',
    isFeatured: false
  });
  const [loading, setLoading] = useState(false);

  console.log('📝 PROJECT MODAL - Props:', {
    subDomain: subDomain?.title,
    domain: domain?.title,
    formData
  });

  // Slug generation function
  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
      .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Don't send slug - let backend auto-generate it
      const projectData = {
        title: formData.title.trim(),
        abstract: formData.abstract.trim(),
        specifications: formData.specifications.trim(),
        learningOutcomes: formData.learningOutcomes.trim(),
        subDomainId: formData.subDomainId,
        isFeatured: formData.isFeatured
      };

      console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
      console.log('🔗 PROJECT SAVE - Backend will auto-generate slug from title:', formData.title);
      
      const response = await authService.createProject(projectData);
      console.log('✅ PROJECT CREATE - Response:', response.data);
      
      onSave();
    } catch (error) {
      console.error('❌ PROJECT SAVE - Error:', error);
      console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
      
      // Show more specific error message if available
      const errorMessage = error.response?.data?.message || 'Failed to create project';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Add Project to: {subDomain?.title}</h2>
          <button onClick={onClose}>×</button>
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
            {/* Show slug preview (for user reference only) */}
            {formData.title && (
              <div className="slug-preview">
                <small>Expected URL Slug: <code>{generateSlug(formData.title)}</code> <em>(auto-generated by backend)</em></small>
              </div>
            )}
          </div>
          
          <div className="modal-info">
            <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
            <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
            <span className="info-note">
              <FiTarget /> This is a leaf subdomain - perfect for projects!
            </span>
          </div>
          
          <div className="form-group">
            <label>Abstract *</label>
            <textarea
              value={formData.abstract}
              onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
              rows={4}
              placeholder="Brief description of the project..."
              required
              minLength={10}
              maxLength={1000}
            />
          </div>
          
          <div className="form-group">
            <label>Specifications *</label>
            <textarea
              value={formData.specifications}
              onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
              rows={6}
              placeholder="Technical specifications and requirements..."
              required
              minLength={10}
              maxLength={5000}
            />
          </div>
          
          <div className="form-group">
            <label>Learning Outcomes *</label>
            <textarea
              value={formData.learningOutcomes}
              onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
              rows={4}
              placeholder="What will students learn from this project..."
              required
              minLength={10}
              maxLength={2000}
            />
          </div>
          
          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              />
              <FiTarget />
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
              disabled={loading || !formData.title || !formData.abstract || !formData.specifications || !formData.learningOutcomes}
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// NEW: Projects List Modal Component
const ProjectsListModal = ({ 
  subDomain, 
  projects, 
  loading, 
  onClose, 
  onEdit, 
  onDelete, 
  onArchive, 
  onToggleFeatured,
  onAddProject 
}) => {
  console.log('📋 PROJECTS LIST MODAL - Rendering with props:', {
    subDomain: subDomain?.title,
    subDomainId: subDomain?.id,
    projectsCount: projects.length,
    loading,
    projects: projects,
    firstProject: projects[0]
  });

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>Projects in: {subDomain?.title}</h2>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="projects-list-content">
          <div className="projects-list-header">
            <div className="list-info">
              <p><strong>SubDomain:</strong> {subDomain?.title}</p>
              <p><strong>Total Projects:</strong> {projects.length}</p>
              {/* 🔍 DEBUGGING: Show debug info */}
              <div style={{fontSize: '12px', color: '#666', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0'}}>
                <strong>DEBUG INFO:</strong><br/>
                SubDomain ID: {subDomain?.id}<br/>
                Projects Array Length: {projects.length}<br/>
                Loading: {loading.toString()}<br/>
                Projects Data: {JSON.stringify(projects, null, 2)}
              </div>
            </div>
            <button 
              className="primary-button" 
              onClick={() => {
                console.log('🎯 ADD NEW PROJECT CLICKED from modal');
                onAddProject();
              }}
              style={{
                backgroundColor: '#3b82f6',
                color: 'white',
                padding: '10px 14px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <FiPlus style={{marginRight: '6px'}} />
              Add New Project
            </button>
          </div>
          
          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading projects...</p>
            </div>
          ) : projects.length > 0 ? (
            <div className="projects-list">
              {projects.map((project, index) => {
                console.log(`📄 RENDERING PROJECT ${index + 1}:`, project);
                return (
                  <ProjectListItem
                    key={project.id}
                    project={project}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onArchive={onArchive}
                    onToggleFeatured={onToggleFeatured}
                  />
                );
              })}
            </div>
          ) : (
            <div className="empty-projects-state">
              <FiFileText size={48} />
              <h3>No Projects Found</h3>
              <p>This subdomain doesn't have any projects yet.</p>
              <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
                <strong>DEBUG:</strong> API returned {projects.length} projects for subdomain {subDomain?.id}
              </div>
              <button 
                className="primary-button" 
                onClick={() => {
                  console.log('🎯 ADD FIRST PROJECT CLICKED from empty state');
                  onAddProject();
                }}
                style={{
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  padding: '12px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                <FiPlus style={{marginRight: '6px'}} />
                Add First Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW: Project List Item Component
const ProjectListItem = ({ 
  project, 
  onEdit, 
  onDelete, 
  onArchive, 
  onToggleFeatured 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  console.log('📄 PROJECT LIST ITEM - Rendering project:', {
    id: project.id,
    title: project.title,
    abstract: project.abstract?.substring(0, 50),
    isActive: project.isActive,
    isFeatured: project.isFeatured,
    viewCount: project.viewCount,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    fullProject: project
  });

  return (
    <div className={`project-list-item ${!project.isActive ? 'archived' : ''}`}>
      <div className="project-info">
        <div className="project-title-section">
          <h4 className="project-title">{project.title}</h4>
          <div className="project-badges">
            {project.isFeatured && (
              <span className="badge featured">
                <FiStar /> Featured
              </span>
            )}
            {!project.isActive && (
              <span className="badge archived">Archived</span>
            )}
            {/* 🔍 DEBUGGING: Always show project ID */}
            <span className="badge debug" style={{backgroundColor: '#e3f2fd', color: '#1976d2'}}>
              ID: {project.id}
            </span>
          </div>
        </div>
        <p className="project-abstract">
          {project.abstract?.substring(0, 150) || 'No abstract available'}...
        </p>
        <div className="project-stats">
          <span className="stat">
            <FiEye /> {project.viewCount || 0} views
          </span>
          <span className="stat">
            Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
          </span>
          <span className="stat">
            Updated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
          </span>
        </div>
      </div>
      
      <div className="project-actions">
        {/* 🔍 DEBUGGING: Always show edit button with debug styling */}
        <button 
          className="action-button primary" 
          onClick={() => {
            console.log('🎯 EDIT BUTTON CLICKED for project:', project.title);
            onEdit(project);
          }}
          title="Edit project"
          style={{
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '8px 12px', 
            margin: '2px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <FiEdit style={{marginRight: '4px'}} />
          Edit Project
        </button>
        
        {/* 🔍 DEBUGGING: Always show delete button with debug styling */}
        <button 
          className="action-button danger" 
          onClick={() => {
            console.log('🎯 DELETE BUTTON CLICKED for project:', project.title);
            onDelete(project);
          }}
          title="Delete project"
          style={{
            backgroundColor: '#ef4444', 
            color: 'white', 
            padding: '8px 12px', 
            margin: '2px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <FiTrash2 style={{marginRight: '4px'}} />
          Delete Project
        </button>
        
        {/* Toggle Featured Button */}
        <button 
          className="action-button featured" 
          onClick={() => {
            console.log('🎯 TOGGLE FEATURED BUTTON CLICKED for project:', project.title);
            onToggleFeatured(project);
          }}
          title={project.isFeatured ? "Remove from featured" : "Make featured"}
          style={{
            backgroundColor: project.isFeatured ? '#f59e0b' : '#6b7280', 
            color: 'white', 
            padding: '8px 12px', 
            margin: '2px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <FiStar style={{marginRight: '4px'}} />
          {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
        </button>
        
        {/* Archive/Restore Button */}
        <button 
          className="action-button archive" 
          onClick={() => {
            console.log('🎯 ARCHIVE BUTTON CLICKED for project:', project.title);
            onArchive(project);
          }}
          title={project.isActive ? "Archive project" : "Restore project"}
          style={{
            backgroundColor: project.isActive ? '#6b7280' : '#059669', 
            color: 'white', 
            padding: '8px 12px', 
            margin: '2px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px'
          }}
        >
          <FiArchive style={{marginRight: '4px'}} />
          {project.isActive ? 'Archive' : 'Restore'}
        </button>
        
        <div className="action-menu">
          <button 
            onClick={() => {
              console.log('🎯 MORE MENU CLICKED for project:', project.title);
              setShowMenu(!showMenu);
            }}
            title="More actions"
            style={{
              backgroundColor: '#6b7280', 
              color: 'white', 
              padding: '8px 12px', 
              margin: '2px',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            <FiMoreVertical style={{marginRight: '4px'}} />
            More Options
          </button>
          {showMenu && (
            <div className="dropdown-menu" style={{zIndex: 1000, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '5px'}}>
              <button onClick={() => {
                console.log('🎯 DROPDOWN EDIT CLICKED for project:', project.title);
                onEdit(project);
                setShowMenu(false);
              }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
                <FiEdit /> Edit Project
              </button>
              <button onClick={() => {
                console.log('🎯 DROPDOWN TOGGLE FEATURED CLICKED for project:', project.title);
                onToggleFeatured(project);
                setShowMenu(false);
              }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
                <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
              </button>
              <button onClick={() => {
                console.log('🎯 DROPDOWN ARCHIVE CLICKED for project:', project.title);
                onArchive(project);
                setShowMenu(false);
              }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
                <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
              </button>
              <button onClick={() => {
                console.log('🎯 DROPDOWN DELETE CLICKED for project:', project.title);
                onDelete(project);
                setShowMenu(false);
              }} className="danger" style={{display: 'block', width: '100%', padding: '5px', margin: '2px', backgroundColor: '#ef4444', color: 'white'}}>
                <FiTrash2 /> Delete Project
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// NEW: Project Edit Modal Component
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

export default SubDomainManagement;




// // src/components/domains/SubDomainManagement.js - ENHANCED WITH PROJECT VIEW/EDIT/DELETE
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { authService } from '../../services/authService';
// import { toast } from 'react-toastify';
// import {
//   FiPlus,
//   FiEdit,
//   FiTrash2,
//   FiChevronDown,
//   FiChevronRight,
//   FiFolder,
//   FiFolderPlus,
//   FiFileText,
//   FiArrowLeft,
//   FiMoreVertical,
//   FiMove,
//   FiTarget,
//   FiEye,
//   FiStar,
//   FiArchive,
//   FiList,
//   FiX
// } from 'react-icons/fi';

// const SubDomainManagement = () => {
//   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
//   const { domainId } = useParams();
//   const navigate = useNavigate();
  
//   const [domain, setDomain] = useState(null);
//   const [subDomains, setSubDomains] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [editingSubDomain, setEditingSubDomain] = useState(null);
//   const [selectedParent, setSelectedParent] = useState(null);
//   const [expandedNodes, setExpandedNodes] = useState(new Set());

//   // Project creation state
//   const [showProjectModal, setShowProjectModal] = useState(false);
//   const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

//   // NEW: Project management states
//   const [showProjectsModal, setShowProjectsModal] = useState(false);
//   const [selectedSubDomainForProjectsView, setSelectedSubDomainForProjectsView] = useState(null);
//   const [projectsInSubDomain, setProjectsInSubDomain] = useState([]);
//   const [editingProject, setEditingProject] = useState(null);
//   const [showProjectEditModal, setShowProjectEditModal] = useState(false);
//   const [projectsLoading, setProjectsLoading] = useState(false);

//   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
//     domainId,
//     domain: domain?.title,
//     subDomainsCount: subDomains.length,
//     loading,
//     selectedParent: selectedParent?.title,
//     expandedCount: expandedNodes.size,
//     showProjectModal,
//     selectedSubDomainForProject: selectedSubDomainForProject?.title,
//     // NEW states
//     showProjectsModal,
//     selectedSubDomainForProjectsView: selectedSubDomainForProjectsView?.title,
//     projectsInSubDomainCount: projectsInSubDomain.length,
//     editingProject: editingProject?.title
//   });

//   useEffect(() => {
//     if (domainId) {
//       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
//       fetchDomainAndSubDomains();
//     }
//   }, [domainId]);

//   const fetchDomainAndSubDomains = async () => {
//     try {
//       setLoading(true);
      
//       console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
//       // Get domain details
//       const domainsResponse = await authService.getDomains();
//       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
//       let domainData = null;
//       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
//       if (domains.length > 0) {
//         domainData = domains.find(d => d.id == domainId);
//         console.log('🎯 SUBDOMAIN FETCH - Found domain data:', domainData);
//       }
      
//       if (!domainData) {
//         console.log('⚠️ SUBDOMAIN FETCH - Domain not found, creating fallback');
//         domainData = {
//           id: domainId,
//           title: `Domain ${domainId}`,
//           description: 'Domain not found in list',
//           projectCount: 0
//         };
//       }
      
//       setDomain(domainData);
      
//       // Get subdomains
//       console.log('📡 SUBDOMAIN FETCH - Fetching subdomains with domainId:', domainId);
//       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
//       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse);
//       console.log('✅ SUBDOMAIN FETCH - SubDomains response.data:', subDomainsResponse.data);
//       console.log('✅ SUBDOMAIN FETCH - SubDomains response data type:', typeof subDomainsResponse.data);
//       console.log('✅ SUBDOMAIN FETCH - SubDomains response data keys:', Object.keys(subDomainsResponse.data || {}));
      
//       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
//       console.log('🎯 SUBDOMAIN FETCH - Extracted subdomains data:', subDomainsData);
//       console.log('🎯 SUBDOMAIN FETCH - Subdomains count:', subDomainsData.length);
      
//       // 🔍 DEBUGGING: Log each subdomain's project count
//       subDomainsData.forEach((subdomain, index) => {
//         console.log(`📊 SUBDOMAIN ${index + 1} [${subdomain.title}]:`, {
//           id: subdomain.id,
//           title: subdomain.title,
//           projectCount: subdomain.projectCount,
//           hasChildren: subdomain.children && subdomain.children.length > 0,
//           childrenCount: subdomain.children?.length || 0,
//           isLeaf: !subdomain.children || subdomain.children.length === 0,
//           fullObject: subdomain
//         });
//       });
      
//       setSubDomains(subDomainsData);
      
//       // Auto-expand first level
//       if (subDomainsData.length > 0) {
//         const firstLevelIds = subDomainsData.map(sd => sd.id);
//         setExpandedNodes(new Set(firstLevelIds));
//         console.log('🔄 SUBDOMAIN FETCH - Auto-expanded first level IDs:', firstLevelIds);
//       }
      
//       // Try hierarchy API as fallback
//       try {
//         console.log('📡 SUBDOMAIN FETCH - Trying hierarchy API as fallback');
//         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
//         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse);
//         console.log('✅ SUBDOMAIN FETCH - Hierarchy response.data:', hierarchyResponse.data);
        
//         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
//         console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
//         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
//           console.log('🔄 SUBDOMAIN FETCH - Using hierarchy data instead');
//           console.log('🔄 SUBDOMAIN FETCH - Hierarchy subdomains:', hierarchyData.subDomains);
          
//           // 🔍 DEBUGGING: Log hierarchy subdomain project counts
//           hierarchyData.subDomains.forEach((subdomain, index) => {
//             console.log(`📊 HIERARCHY SUBDOMAIN ${index + 1} [${subdomain.title}]:`, {
//               id: subdomain.id,
//               title: subdomain.title,
//               projectCount: subdomain.projectCount,
//               hasChildren: subdomain.children && subdomain.children.length > 0,
//               childrenCount: subdomain.children?.length || 0,
//               isLeaf: !subdomain.children || subdomain.children.length === 0,
//               fullObject: subdomain
//             });
//           });
          
//           setSubDomains(hierarchyData.subDomains);
//           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
//             setDomain(prev => ({ ...prev, ...hierarchyData }));
//           }
//         }
//       } catch (hierarchyError) {
//         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
//         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy error response:', hierarchyError.response);
//       }
      
//     } catch (error) {
//       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
//       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
//       console.error('❌ SUBDOMAIN FETCH - Error response data:', error.response?.data);
//       console.error('❌ SUBDOMAIN FETCH - Error message:', error.message);
//       toast.error('Failed to fetch domain information: ' + (error.response?.data?.message || error.message));
      
//       setDomain({
//         id: domainId,
//         title: `Domain ${domainId}`,
//         description: 'Error loading domain details',
//         projectCount: 0
//       });
//       setSubDomains([]);
//     } finally {
//       setLoading(false);
//       console.log('🏁 SUBDOMAIN FETCH - Loading set to false');
//     }
//   };

//   const handleAddSubDomain = (parent = null) => {
//     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
//     setSelectedParent(parent);
//     setEditingSubDomain(null);
//     setShowAddModal(true);
//   };

//   const handleEditSubDomain = (subDomain) => {
//     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
//     setSelectedParent(null);
//     setEditingSubDomain(subDomain);
//     setShowAddModal(true);
//   };

//   // Handle adding project to subdomain
//   const handleAddProjectToSubDomain = (subDomain) => {
//     console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
//     console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
//     if (subDomain.children && subDomain.children.length > 0) {
//       toast.error('Projects can only be added to leaf sub-domains (those without children)');
//       return;
//     }
    
//     setSelectedSubDomainForProject(subDomain);
//     setShowProjectModal(true);
//   };

//   // NEW: Handle viewing projects in subdomain
//   const handleViewProjectsInSubDomain = async (subDomain) => {
//     console.log('👁️ VIEW PROJECTS - Starting for subdomain:', subDomain.title);
//     console.log('🔍 VIEW PROJECTS - SubDomain object:', subDomain);
//     console.log('🔍 VIEW PROJECTS - Has children?', subDomain.children && subDomain.children.length > 0);
//     console.log('🔍 VIEW PROJECTS - Project count:', subDomain.projectCount);
//     console.log('🔍 VIEW PROJECTS - Is leaf?', !subDomain.children || subDomain.children.length === 0);
    
//     if (subDomain.children && subDomain.children.length > 0) {
//       console.log('❌ VIEW PROJECTS - Not a leaf subdomain');
//       toast.error('Only leaf sub-domains have projects to view');
//       return;
//     }
    
//     if (!subDomain.projectCount || subDomain.projectCount === 0) {
//       console.log('❌ VIEW PROJECTS - No projects in subdomain');
//       toast.info('This sub-domain has no projects yet. Let\'s fetch anyway to check...');
//       // Don't return - still try to fetch in case the count is wrong
//     }
    
//     console.log('✅ VIEW PROJECTS - Proceeding to fetch projects');
//     setSelectedSubDomainForProjectsView(subDomain);
//     await fetchProjectsInSubDomain(subDomain.id);
//     setShowProjectsModal(true);
//   };

//   // NEW: Fetch projects for a specific subdomain
//   const fetchProjectsInSubDomain = async (subDomainId) => {
//     try {
//       setProjectsLoading(true);
//       console.log('📡 FETCH PROJECTS - For subdomain ID:', subDomainId);
//       console.log('📡 FETCH PROJECTS - Making API call to authService.getProjects()');
      
//       const response = await authService.getProjects({ 
//         subDomainId: subDomainId,
//         limit: 100 // Get all projects for this subdomain
//       });
      
//       console.log('✅ FETCH PROJECTS - Full API Response:', response);
//       console.log('✅ FETCH PROJECTS - Response status:', response.status);
//       console.log('✅ FETCH PROJECTS - Response data:', response.data);
//       console.log('✅ FETCH PROJECTS - Response data type:', typeof response.data);
//       console.log('✅ FETCH PROJECTS - Response data keys:', Object.keys(response.data || {}));
      
//       const projects = response.data?.projects || response.data?.data?.projects || [];
//       console.log('🎯 FETCH PROJECTS - Extracted projects:', projects);
//       console.log('🎯 FETCH PROJECTS - Projects count:', projects.length);
//       console.log('🎯 FETCH PROJECTS - First project (if any):', projects[0]);
      
//       setProjectsInSubDomain(projects);
      
//       if (projects.length === 0) {
//         console.log('⚠️ FETCH PROJECTS - No projects found for subdomain:', subDomainId);
//         toast.info(`No projects found in this subdomain. API returned ${projects.length} projects.`);
//       } else {
//         console.log('🎉 FETCH PROJECTS - Successfully loaded', projects.length, 'projects');
//       }
      
//     } catch (error) {
//       console.error('❌ FETCH PROJECTS - Error occurred:', error);
//       console.error('❌ FETCH PROJECTS - Error response:', error.response);
//       console.error('❌ FETCH PROJECTS - Error response data:', error.response?.data);
//       console.error('❌ FETCH PROJECTS - Error message:', error.message);
//       toast.error('Failed to fetch projects: ' + (error.response?.data?.message || error.message));
//       setProjectsInSubDomain([]);
//     } finally {
//       setProjectsLoading(false);
//       console.log('🏁 FETCH PROJECTS - Loading set to false');
//     }
//   };

//   // NEW: Handle editing a project
//   const handleEditProject = (project) => {
//     console.log('✏️ EDIT PROJECT - Starting for:', project.title);
//     setEditingProject(project);
//     setShowProjectEditModal(true);
//   };

//   // NEW: Handle deleting a project
//   const handleDeleteProject = async (project) => {
//     console.log('🗑️ DELETE PROJECT - Starting deletion process for:', project.title);
//     console.log('🗑️ DELETE PROJECT - Project ID:', project.id);
//     console.log('🗑️ DELETE PROJECT - Full project object:', project);
    
//     const confirmMessage = `Are you sure you want to delete the project "${project.title}"?\n\nThis action cannot be undone.`;
//     const userConfirmed = window.confirm(confirmMessage);
    
//     console.log('🗑️ DELETE PROJECT - User confirmation:', userConfirmed);
    
//     if (!userConfirmed) {
//       console.log('❌ DELETE PROJECT - Cancelled by user');
//       return;
//     }

//     try {
//       console.log('📡 DELETE PROJECT - Making API call to authService.deleteProject()');
//       console.log('📡 DELETE PROJECT - API endpoint will be: /admin/projects/' + project.id);
      
//       const response = await authService.deleteProject(project.id);
      
//       console.log('✅ DELETE PROJECT - API Response received:', response);
//       console.log('✅ DELETE PROJECT - Response status:', response.status);
//       console.log('✅ DELETE PROJECT - Response data:', response.data);
      
//       toast.success('Project deleted successfully');
//       console.log('🎉 DELETE PROJECT - Success toast shown');
      
//       // Refresh projects list and subdomain data
//       console.log('🔄 DELETE PROJECT - Refreshing projects list for subdomain:', selectedSubDomainForProjectsView.id);
//       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
//       console.log('🔄 DELETE PROJECT - Refreshing domain and subdomains to update counts');
//       await fetchDomainAndSubDomains(); // Refresh to update project counts
      
//     } catch (error) {
//       console.error('❌ DELETE PROJECT - Error occurred:', error);
//       console.error('❌ DELETE PROJECT - Error type:', typeof error);
//       console.error('❌ DELETE PROJECT - Error message:', error.message);
//       console.error('❌ DELETE PROJECT - Error response:', error.response);
//       console.error('❌ DELETE PROJECT - Error response status:', error.response?.status);
//       console.error('❌ DELETE PROJECT - Error response data:', error.response?.data);
//       console.error('❌ DELETE PROJECT - Error stack:', error.stack);
      
//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
//       toast.error('Failed to delete project: ' + errorMessage);
//       console.log('❌ DELETE PROJECT - Error toast shown with message:', errorMessage);
//     }
//   };

//   // NEW: Handle archiving a project
//   const handleArchiveProject = async (project) => {
//     const isArchiving = project.isActive;
//     const action = isArchiving ? 'archive' : 'restore';
    
//     console.log('📁 ARCHIVE PROJECT - Action:', action, 'for:', project.title);
    
//     if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
//       return;
//     }

//     try {
//       await authService.archiveProject(project.id, {
//         archive: isArchiving,
//         reason: `${action} via subdomain management`
//       });
//       console.log('✅ ARCHIVE PROJECT - Success');
//       toast.success(`Project ${action}d successfully`);
      
//       // Refresh projects list
//       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
//     } catch (error) {
//       console.error('❌ ARCHIVE PROJECT - Error:', error);
//       toast.error(`Failed to ${action} project`);
//     }
//   };

//   // NEW: Handle toggling featured status
//   const handleToggleProjectFeatured = async (project) => {
//     console.log('⭐ TOGGLE FEATURED - For project:', project.title);
    
//     try {
//       await authService.updateProject(project.id, {
//         isFeatured: !project.isFeatured
//       });
//       console.log('✅ TOGGLE FEATURED - Success');
//       toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
      
//       // Refresh projects list
//       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
//     } catch (error) {
//       console.error('❌ TOGGLE FEATURED - Error:', error);
//       toast.error('Failed to update featured status');
//     }
//   };

//   const handleDeleteSubDomain = async (subDomain) => {
//     console.log('🗑️ SUBDOMAIN DELETE - Starting deletion process for:', subDomain.title);
//     console.log('🗑️ SUBDOMAIN DELETE - SubDomain ID:', subDomain.id);
//     console.log('🗑️ SUBDOMAIN DELETE - Full subdomain object:', subDomain);
    
//     const hasChildren = subDomain.children && subDomain.children.length > 0;
//     const hasProjects = subDomain.projectCount > 0;
    
//     console.log('🗑️ SUBDOMAIN DELETE - Has children:', hasChildren);
//     console.log('🗑️ SUBDOMAIN DELETE - Has projects:', hasProjects);
//     console.log('🗑️ SUBDOMAIN DELETE - Children count:', subDomain.children?.length || 0);
//     console.log('🗑️ SUBDOMAIN DELETE - Project count:', subDomain.projectCount || 0);
    
//     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
//     if (hasChildren) {
//       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
//     }
//     if (hasProjects) {
//       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
//     }
//     confirmMessage += '\n\nThis action cannot be undone.';
    
//     const userConfirmed = window.confirm(confirmMessage);
//     console.log('🗑️ SUBDOMAIN DELETE - User confirmation:', userConfirmed);
    
//     if (!userConfirmed) {
//       console.log('❌ SUBDOMAIN DELETE - Cancelled by user');
//       return;
//     }

//     try {
//       console.log('📡 SUBDOMAIN DELETE - Making API call to authService.deleteSubDomain()');
//       console.log('📡 SUBDOMAIN DELETE - API endpoint will be: /admin/subdomains/' + subDomain.id);
      
//       const response = await authService.deleteSubDomain(subDomain.id);
      
//       console.log('✅ SUBDOMAIN DELETE - API Response received:', response);
//       console.log('✅ SUBDOMAIN DELETE - Response status:', response.status);
//       console.log('✅ SUBDOMAIN DELETE - Response data:', response.data);
      
//       toast.success('Sub-domain deleted successfully');
//       console.log('🎉 SUBDOMAIN DELETE - Success toast shown');
      
//       console.log('🔄 SUBDOMAIN DELETE - Refreshing domain and subdomains');
//       fetchDomainAndSubDomains();
      
//     } catch (error) {
//       console.error('❌ SUBDOMAIN DELETE - Error occurred:', error);
//       console.error('❌ SUBDOMAIN DELETE - Error type:', typeof error);
//       console.error('❌ SUBDOMAIN DELETE - Error message:', error.message);
//       console.error('❌ SUBDOMAIN DELETE - Error response:', error.response);
//       console.error('❌ SUBDOMAIN DELETE - Error response status:', error.response?.status);
//       console.error('❌ SUBDOMAIN DELETE - Error response data:', error.response?.data);
//       console.error('❌ SUBDOMAIN DELETE - Error stack:', error.stack);
      
//       const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
//       toast.error('Failed to delete sub-domain: ' + errorMessage);
//       console.log('❌ SUBDOMAIN DELETE - Error toast shown with message:', errorMessage);
//     }
//   };

//   const toggleExpanded = (nodeId) => {
//     const newExpanded = new Set(expandedNodes);
//     if (newExpanded.has(nodeId)) {
//       newExpanded.delete(nodeId);
//     } else {
//       newExpanded.add(nodeId);
//     }
//     setExpandedNodes(newExpanded);
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading sub-domains...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="subdomain-management">
//       {/* Header with Breadcrumb */}
//       <div className="page-header">
//         <div className="header-content">
//           <div className="breadcrumb">
//             <button 
//               className="breadcrumb-link"
//               onClick={() => navigate('/domains')}
//             >
//               <FiArrowLeft />
//               Domains
//             </button>
//             <span className="breadcrumb-separator">/</span>
//             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
//           </div>
//           <h1>SubDomain Management</h1>
//           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
//         </div>
//         <div className="header-actions">
//           <button 
//             className="primary-button" 
//             onClick={() => handleAddSubDomain()}
//             style={{
//               backgroundColor: '#3b82f6',
//               color: 'white',
//               padding: '12px 16px',
//               border: 'none',
//               borderRadius: '6px',
//               cursor: 'pointer',
//               fontSize: '14px',
//               fontWeight: '500'
//             }}
//           >
//             <FiPlus style={{marginRight: '6px'}} />
//             Add Root SubDomain
//           </button>
//         </div>
//       </div>

//       {/* Quick Guide */}
//       <div className="quick-guide">
//         <h3>How to Build Your SubDomain Hierarchy:</h3>
//         <div className="guide-steps">
//           <div className="guide-step">
//             <span className="step-number">1</span>
//             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
//           </div>
//           <div className="guide-step">
//             <span className="step-number">2</span>
//             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
//           </div>
//           <div className="guide-step">
//             <span className="step-number">3</span>
//             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
//           </div>
//           <div className="guide-step">
//             <span className="step-number">4</span>
//             <span className="step-text">Click <strong>"Add Project"</strong> or <strong>"View Projects"</strong> on leaf subdomains</span>
//           </div>
//         </div>
//       </div>

//       {/* Domain Info Card */}
//       {domain && (
//         <div className="domain-info-card">
//           <div className="domain-icon">
//             <FiFolder />
//           </div>
//           <div className="domain-details">
//             <h3>{domain.title}</h3>
//             <p>{domain.description}</p>
//             <div className="domain-stats">
//               <span className="stat-item">
//                 <strong>{subDomains.length}</strong> root sub-domains
//               </span>
//               <span className="stat-item">
//                 <strong>{domain.projectCount || 0}</strong> total projects
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* SubDomain Tree */}
//       <div className="subdomain-tree-container">
//         <div className="tree-header">
//           <h2>SubDomain Hierarchy</h2>
//           <div className="tree-legend">
//             <span className="legend-item">
//               <FiFolder className="folder-icon" />
//               Has children
//             </span>
//             <span className="legend-item">
//               <FiTarget className="leaf-icon" />
//               Leaf (can have projects)
//             </span>
//             <span className="legend-item">
//               <FiFileText className="project-icon" />
//               Add Project
//             </span>
//             <span className="legend-item">
//               <FiList className="view-icon" />
//               View Projects
//             </span>
//           </div>
//         </div>

//         {subDomains.length > 0 ? (
//           <div className="subdomain-tree">
//             {subDomains.map((subDomain) => (
//               <SubDomainNode
//                 key={subDomain.id}
//                 subDomain={subDomain}
//                 level={0}
//                 isExpanded={expandedNodes.has(subDomain.id)}
//                 onToggleExpanded={toggleExpanded}
//                 onEdit={handleEditSubDomain}
//                 onDelete={handleDeleteSubDomain}
//                 onAddChild={handleAddSubDomain}
//                 onAddProject={handleAddProjectToSubDomain}
//                 onViewProjects={handleViewProjectsInSubDomain} // NEW
//                 expandedNodes={expandedNodes}
//               />
//             ))}
//           </div>
//         ) : (
//           <div className="empty-tree-state">
//             <FiFolderPlus size={64} />
//             <h3>No SubDomains Yet</h3>
//             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
//             <div className="empty-state-examples">
//               <h4>Example Structure:</h4>
//               <div className="example-tree">
//                 <div className="example-item">📂 Machine Learning</div>
//                 <div className="example-item nested">🎯 Deep Learning</div>
//                 <div className="example-item nested">🎯 Computer Vision</div>
//                 <div className="example-item">🎯 Data Science</div>
//               </div>
//             </div>
//             <div className="empty-state-actions">
//               <button 
//                 className="primary-button large" 
//                 onClick={() => handleAddSubDomain()}
//                 style={{
//                   backgroundColor: '#3b82f6',
//                   color: 'white',
//                   padding: '14px 20px',
//                   border: 'none',
//                   borderRadius: '8px',
//                   cursor: 'pointer',
//                   fontSize: '16px',
//                   fontWeight: '600'
//                 }}
//               >
//                 <FiPlus style={{marginRight: '8px'}} />
//                 Create Your First SubDomain
//               </button>
//               <p className="help-text">
//                 💡 Tip: Start with broad categories, then add specific subcategories as needed
//               </p>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add/Edit SubDomain Modal */}
//       {showAddModal && (
//         <SubDomainModal
//           subDomain={editingSubDomain}
//           parent={selectedParent}
//           domain={domain}
//           onClose={() => {
//             setShowAddModal(false);
//             setEditingSubDomain(null);
//             setSelectedParent(null);
//           }}
//           onSave={() => {
//             setShowAddModal(false);
//             setEditingSubDomain(null);
//             setSelectedParent(null);
//             fetchDomainAndSubDomains();
//           }}
//         />
//       )}

//       {/* Project Creation Modal */}
//       {showProjectModal && (
//         <ProjectModal
//           subDomain={selectedSubDomainForProject}
//           domain={domain}
//           onClose={() => {
//             setShowProjectModal(false);
//             setSelectedSubDomainForProject(null);
//           }}
//           onSave={() => {
//             setShowProjectModal(false);
//             setSelectedSubDomainForProject(null);
//             toast.success('Project created successfully!');
//             fetchDomainAndSubDomains(); // Refresh to update project counts
//           }}
//         />
//       )}

//       {/* NEW: Projects List Modal */}
//       {showProjectsModal && (
//         <ProjectsListModal
//           subDomain={selectedSubDomainForProjectsView}
//           projects={projectsInSubDomain}
//           loading={projectsLoading}
//           onClose={() => {
//             setShowProjectsModal(false);
//             setSelectedSubDomainForProjectsView(null);
//             setProjectsInSubDomain([]);
//           }}
//           onEdit={handleEditProject}
//           onDelete={handleDeleteProject}
//           onArchive={handleArchiveProject}
//           onToggleFeatured={handleToggleProjectFeatured}
//           onAddProject={() => {
//             setShowProjectsModal(false);
//             setSelectedSubDomainForProject(selectedSubDomainForProjectsView);
//             setShowProjectModal(true);
//           }}
//         />
//       )}

//       {/* NEW: Project Edit Modal */}
//       {showProjectEditModal && editingProject && (
//         <ProjectEditModal
//           project={editingProject}
//           onClose={() => {
//             setShowProjectEditModal(false);
//             setEditingProject(null);
//           }}
//           onSave={() => {
//             setShowProjectEditModal(false);
//             setEditingProject(null);
//             // Refresh projects list and subdomain data
//             fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
//             fetchDomainAndSubDomains();
//           }}
//         />
//       )}
//     </div>
//   );
// };

// // UPDATED SubDomain Node Component with View Projects functionality
// const SubDomainNode = ({ 
//   subDomain, 
//   level, 
//   isExpanded, 
//   onToggleExpanded, 
//   onEdit, 
//   onDelete, 
//   onAddChild,
//   onAddProject,
//   onViewProjects, // NEW
//   expandedNodes 
// }) => {
//   const [showMenu, setShowMenu] = useState(false);
//   const hasChildren = subDomain.children && subDomain.children.length > 0;
//   const isLeaf = !hasChildren;
//   const hasProjects = subDomain.projectCount > 0;

//   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
//     title: subDomain.title,
//     level,
//     hasChildren,
//     isLeaf,
//     isExpanded,
//     projectCount: subDomain.projectCount,
//     hasProjects,
//     children: subDomain.children,
//     childrenLength: subDomain.children?.length,
//     subDomainFullObject: subDomain
//   });

//   // 🔍 DEBUGGING: Log button visibility conditions
//   console.log('🔍 BUTTON VISIBILITY DEBUG for', subDomain.title, ':', {
//     isLeaf,
//     hasProjects,
//     projectCount: subDomain.projectCount,
//     shouldShowViewButton: isLeaf && hasProjects,
//     shouldShowAddButton: isLeaf
//   });

//   return (
//     <div className={`subdomain-node level-${level}`}>
//       <div className="node-content">
//         <div className="node-main">
//           {hasChildren ? (
//             <button 
//               className="expand-button"
//               onClick={() => onToggleExpanded(subDomain.id)}
//             >
//               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
//             </button>
//           ) : (
//             <div className="expand-placeholder" />
//           )}
          
//           <div className="node-icon">
//             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
//           </div>
          
//           <div className="node-info">
//             <h4 className="node-title">{subDomain.title}</h4>
//             <p className="node-description">{subDomain.description}</p>
//             <div className="node-stats">
//               {hasChildren && (
//                 <span className="stat-badge">
//                   {subDomain.children.length} sub-domains
//                 </span>
//               )}
//               {hasProjects && (
//                 <span className="stat-badge projects">
//                   {subDomain.projectCount} projects
//                 </span>
//               )}
//               {isLeaf && !hasProjects && (
//                 <span className="stat-badge leaf">
//                   Can have projects
//                 </span>
//               )}
//               {/* 🔍 DEBUGGING: Always show project count for debugging */}
//               <span className="stat-badge debug" style={{backgroundColor: '#ff9999', color: '#000'}}>
//                 DEBUG: Count={subDomain.projectCount || 0}
//               </span>
//             </div>
//           </div>
//         </div>
        
//         <div className="node-actions">
//           {/* 🔍 DEBUGGING: Always show this section with debug info */}
//           <div style={{fontSize: '10px', color: '#666', marginBottom: '5px'}}>
//             DEBUG: isLeaf={isLeaf.toString()}, hasProjects={hasProjects.toString()}, count={subDomain.projectCount}
//           </div>
          
//           {/* NEW: View Projects button for leaf nodes - ALWAYS SHOW IF LEAF FOR DEBUGGING */}
//           {isLeaf && (
//             <button 
//               className="action-button view" 
//               onClick={() => {
//                 console.log('🎯 VIEW BUTTON CLICKED for:', subDomain.title);
//                 onViewProjects(subDomain);
//               }}
//               title={`View projects in "${subDomain.title}" (Count: ${subDomain.projectCount || 0})`}
//               style={{backgroundColor: hasProjects ? '#10b981' : '#6b7280'}}
//             >
//               <FiList />
//               <span style={{fontSize: '10px', marginLeft: '2px'}}>
//                 {subDomain.projectCount || 0}
//               </span>
//             </button>
//           )}
          
//           {isLeaf && (
//             <button 
//               className="action-button project" 
//               onClick={() => {
//                 console.log('🎯 ADD PROJECT BUTTON CLICKED for:', subDomain.title);
//                 onAddProject(subDomain);
//               }}
//               title={`Add project to "${subDomain.title}"`}
//             >
//               <FiFileText />
//             </button>
//           )}
          
//           <button 
//             className="action-button add" 
//             onClick={() => onAddChild(subDomain)}
//             title={`Add child subdomain under "${subDomain.title}"`}
//           >
//             <FiPlus />
//           </button>
          
//           <div className="action-menu">
//             <button 
//               onClick={() => setShowMenu(!showMenu)}
//               title="More actions"
//             >
//               <FiMoreVertical />
//             </button>
//             {showMenu && (
//               <div className="dropdown-menu">
//                 {/* 🔍 DEBUGGING: Always show view projects option for leaf nodes */}
//                 {isLeaf && (
//                   <button 
//                     onClick={() => {
//                       console.log('🎯 DROPDOWN VIEW PROJECTS CLICKED for:', subDomain.title);
//                       onViewProjects(subDomain);
//                       setShowMenu(false);
//                     }}
//                     className="primary-option"
//                     style={{backgroundColor: hasProjects ? '#dff0d8' : '#f8f9fa'}}
//                   >
//                     <FiList /> View Projects ({subDomain.projectCount || 0})
//                   </button>
//                 )}
//                 {isLeaf && (
//                   <button 
//                     onClick={() => {
//                       onAddProject(subDomain);
//                       setShowMenu(false);
//                     }}
//                     className="primary-option"
//                   >
//                     <FiFileText /> Add Project
//                   </button>
//                 )}
//                 <button onClick={() => {
//                   onEdit(subDomain);
//                   setShowMenu(false);
//                 }}>
//                   <FiEdit /> Edit SubDomain
//                 </button>
//                 <button onClick={() => {
//                   onAddChild(subDomain);
//                   setShowMenu(false);
//                 }}>
//                   <FiPlus /> Add Child SubDomain
//                 </button>
//                 <button onClick={() => {
//                   onDelete(subDomain);
//                   setShowMenu(false);
//                 }} className="danger">
//                   <FiTrash2 /> Delete SubDomain
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
      
//       {/* Children */}
//       {hasChildren && isExpanded && (
//         <div className="node-children">
//           {subDomain.children.map((child) => (
//             <SubDomainNode
//               key={child.id}
//               subDomain={child}
//               level={level + 1}
//               isExpanded={expandedNodes.has(child.id)}
//               onToggleExpanded={onToggleExpanded}
//               onEdit={onEdit}
//               onDelete={onDelete}
//               onAddChild={onAddChild}
//               onAddProject={onAddProject}
//               onViewProjects={onViewProjects} // NEW
//               expandedNodes={expandedNodes}
//             />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// // SubDomain Modal Component (unchanged)
// const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     title: subDomain?.title || '',
//     description: subDomain?.description || ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const requestData = {
//         title: formData.title.trim(),
//         description: formData.description.trim(),
//         domainId: domain.id,
//         parentId: parent?.id || null
//       };

//       console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

//       if (subDomain) {
//         const response = await authService.updateSubDomain(subDomain.id, requestData);
//         toast.success('Sub-domain updated successfully');
//       } else {
//         const response = await authService.createSubDomain(requestData);
//         toast.success('Sub-domain created successfully');
//       }

//       onSave();
//     } catch (error) {
//       console.error('❌ SUBDOMAIN SAVE - Error:', error);
//       const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getModalTitle = () => {
//     if (subDomain) {
//       return `Edit SubDomain: ${subDomain.title}`;
//     }
//     if (parent) {
//       return `Add SubDomain under: ${parent.title}`;
//     }
//     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal">
//         <div className="modal-header">
//           <h2>{getModalTitle()}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>SubDomain Title *</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//               placeholder="e.g., Machine Learning, Deep Learning"
//               required
//               minLength={3}
//               maxLength={100}
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Description (Optional)</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
//               rows={3}
//               placeholder="Describe what this sub-domain covers..."
//               maxLength={500}
//             />
//           </div>
          
//           <div className="modal-info">
//             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
//             {parent && (
//               <>
//                 <strong>Parent SubDomain:</strong> {parent.title}<br />
//               </>
//             )}
//             <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
//           </div>
          
//           <div className="modal-actions">
//             <button type="button" onClick={onClose} disabled={loading}>
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               className="primary-button" 
//               disabled={loading || !formData.title.trim()}
//             >
//               {loading ? 'Saving...' : 'Save SubDomain'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Project Creation Modal Component (unchanged)
// const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     title: '',
//     abstract: '',
//     specifications: '',
//     learningOutcomes: '',
//     subDomainId: subDomain?.id || '',
//     isFeatured: false
//   });
//   const [loading, setLoading] = useState(false);

//   console.log('📝 PROJECT MODAL - Props:', {
//     subDomain: subDomain?.title,
//     domain: domain?.title,
//     formData
//   });

//   // Slug generation function
//   const generateSlug = (title) => {
//     return title
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
//       .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
//       .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       // Don't send slug - let backend auto-generate it
//       const projectData = {
//         title: formData.title.trim(),
//         abstract: formData.abstract.trim(),
//         specifications: formData.specifications.trim(),
//         learningOutcomes: formData.learningOutcomes.trim(),
//         subDomainId: formData.subDomainId,
//         isFeatured: formData.isFeatured
//       };

//       console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
//       console.log('🔗 PROJECT SAVE - Backend will auto-generate slug from title:', formData.title);
      
//       const response = await authService.createProject(projectData);
//       console.log('✅ PROJECT CREATE - Response:', response.data);
      
//       onSave();
//     } catch (error) {
//       console.error('❌ PROJECT SAVE - Error:', error);
//       console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
      
//       // Show more specific error message if available
//       const errorMessage = error.response?.data?.message || 'Failed to create project';
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>Add Project to: {subDomain?.title}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Project Title *</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//               placeholder="Enter project title..."
//               required
//               minLength={3}
//               maxLength={200}
//             />
//             {/* Show slug preview (for user reference only) */}
//             {formData.title && (
//               <div className="slug-preview">
//                 <small>Expected URL Slug: <code>{generateSlug(formData.title)}</code> <em>(auto-generated by backend)</em></small>
//               </div>
//             )}
//           </div>
          
//           <div className="modal-info">
//             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
//             <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
//             <span className="info-note">
//               <FiTarget /> This is a leaf subdomain - perfect for projects!
//             </span>
//           </div>
          
//           <div className="form-group">
//             <label>Abstract *</label>
//             <textarea
//               value={formData.abstract}
//               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
//               rows={4}
//               placeholder="Brief description of the project..."
//               required
//               minLength={10}
//               maxLength={1000}
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Specifications *</label>
//             <textarea
//               value={formData.specifications}
//               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
//               rows={6}
//               placeholder="Technical specifications and requirements..."
//               required
//               minLength={10}
//               maxLength={5000}
//             />
//           </div>
          
//           <div className="form-group">
//             <label>Learning Outcomes *</label>
//             <textarea
//               value={formData.learningOutcomes}
//               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
//               rows={4}
//               placeholder="What will students learn from this project..."
//               required
//               minLength={10}
//               maxLength={2000}
//             />
//           </div>
          
//           <div className="form-group checkbox">
//             <label>
//               <input
//                 type="checkbox"
//                 checked={formData.isFeatured}
//                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
//               />
//               <FiTarget />
//               Featured Project
//             </label>
//           </div>
          
//           <div className="modal-actions">
//             <button type="button" onClick={onClose} disabled={loading}>
//               Cancel
//             </button>
//             <button 
//               type="submit" 
//               className="primary-button" 
//               disabled={loading || !formData.title || !formData.abstract || !formData.specifications || !formData.learningOutcomes}
//             >
//               {loading ? 'Creating...' : 'Create Project'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // NEW: Projects List Modal Component
// const ProjectsListModal = ({ 
//   subDomain, 
//   projects, 
//   loading, 
//   onClose, 
//   onEdit, 
//   onDelete, 
//   onArchive, 
//   onToggleFeatured,
//   onAddProject 
// }) => {
//   console.log('📋 PROJECTS LIST MODAL - Rendering with props:', {
//     subDomain: subDomain?.title,
//     subDomainId: subDomain?.id,
//     projectsCount: projects.length,
//     loading,
//     projects: projects,
//     firstProject: projects[0]
//   });

//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>Projects in: {subDomain?.title}</h2>
//           <button onClick={onClose}>
//             <FiX />
//           </button>
//         </div>
        
//         <div className="projects-list-content">
//           <div className="projects-list-header">
//             <div className="list-info">
//               <p><strong>SubDomain:</strong> {subDomain?.title}</p>
//               <p><strong>Total Projects:</strong> {projects.length}</p>
//               {/* 🔍 DEBUGGING: Show debug info */}
//               <div style={{fontSize: '12px', color: '#666', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0'}}>
//                 <strong>DEBUG INFO:</strong><br/>
//                 SubDomain ID: {subDomain?.id}<br/>
//                 Projects Array Length: {projects.length}<br/>
//                 Loading: {loading.toString()}<br/>
//                 Projects Data: {JSON.stringify(projects, null, 2)}
//               </div>
//             </div>
//             <button 
//               className="primary-button" 
//               onClick={() => {
//                 console.log('🎯 ADD NEW PROJECT CLICKED from modal');
//                 onAddProject();
//               }}
//               style={{
//                 backgroundColor: '#3b82f6',
//                 color: 'white',
//                 padding: '10px 14px',
//                 border: 'none',
//                 borderRadius: '6px',
//                 cursor: 'pointer',
//                 fontSize: '14px',
//                 fontWeight: '500'
//               }}
//             >
//               <FiPlus style={{marginRight: '6px'}} />
//               Add New Project
//             </button>
//           </div>
          
//           {loading ? (
//             <div className="loading-container">
//               <div className="loading-spinner"></div>
//               <p>Loading projects...</p>
//             </div>
//           ) : projects.length > 0 ? (
//             <div className="projects-list">
//               {projects.map((project, index) => {
//                 console.log(`📄 RENDERING PROJECT ${index + 1}:`, project);
//                 return (
//                   <ProjectListItem
//                     key={project.id}
//                     project={project}
//                     onEdit={onEdit}
//                     onDelete={onDelete}
//                     onArchive={onArchive}
//                     onToggleFeatured={onToggleFeatured}
//                   />
//                 );
//               })}
//             </div>
//           ) : (
//             <div className="empty-projects-state">
//               <FiFileText size={48} />
//               <h3>No Projects Found</h3>
//               <p>This subdomain doesn't have any projects yet.</p>
//               <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
//                 <strong>DEBUG:</strong> API returned {projects.length} projects for subdomain {subDomain?.id}
//               </div>
//               <button 
//                 className="primary-button" 
//                 onClick={() => {
//                   console.log('🎯 ADD FIRST PROJECT CLICKED from empty state');
//                   onAddProject();
//                 }}
//                 style={{
//                   backgroundColor: '#3b82f6',
//                   color: 'white',
//                   padding: '12px 16px',
//                   border: 'none',
//                   borderRadius: '6px',
//                   cursor: 'pointer',
//                   fontSize: '14px',
//                   fontWeight: '500'
//                 }}
//               >
//                 <FiPlus style={{marginRight: '6px'}} />
//                 Add First Project
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // NEW: Project List Item Component
// const ProjectListItem = ({ 
//   project, 
//   onEdit, 
//   onDelete, 
//   onArchive, 
//   onToggleFeatured 
// }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   console.log('📄 PROJECT LIST ITEM - Rendering project:', {
//     id: project.id,
//     title: project.title,
//     abstract: project.abstract?.substring(0, 50),
//     isActive: project.isActive,
//     isFeatured: project.isFeatured,
//     viewCount: project.viewCount,
//     createdAt: project.createdAt,
//     updatedAt: project.updatedAt,
//     fullProject: project
//   });

//   return (
//     <div className={`project-list-item ${!project.isActive ? 'archived' : ''}`}>
//       <div className="project-info">
//         <div className="project-title-section">
//           <h4 className="project-title">{project.title}</h4>
//           <div className="project-badges">
//             {project.isFeatured && (
//               <span className="badge featured">
//                 <FiStar /> Featured
//               </span>
//             )}
//             {!project.isActive && (
//               <span className="badge archived">Archived</span>
//             )}
//             {/* 🔍 DEBUGGING: Always show project ID */}
//             <span className="badge debug" style={{backgroundColor: '#e3f2fd', color: '#1976d2'}}>
//               ID: {project.id}
//             </span>
//           </div>
//         </div>
//         <p className="project-abstract">
//           {project.abstract?.substring(0, 150) || 'No abstract available'}...
//         </p>
//         <div className="project-stats">
//           <span className="stat">
//             <FiEye /> {project.viewCount || 0} views
//           </span>
//           <span className="stat">
//             Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
//           </span>
//           <span className="stat">
//             Updated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
//           </span>
//         </div>
//       </div>
      
//       <div className="project-actions">
//         {/* 🔍 DEBUGGING: Always show edit button with debug styling */}
//         <button 
//           className="action-button primary" 
//           onClick={() => {
//             console.log('🎯 EDIT BUTTON CLICKED for project:', project.title);
//             onEdit(project);
//           }}
//           title="Edit project"
//           style={{
//             backgroundColor: '#10b981', 
//             color: 'white', 
//             padding: '8px 12px', 
//             margin: '2px',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '12px'
//           }}
//         >
//           <FiEdit style={{marginRight: '4px'}} />
//           Edit Project
//         </button>
        
//         {/* 🔍 DEBUGGING: Always show delete button with debug styling */}
//         <button 
//           className="action-button danger" 
//           onClick={() => {
//             console.log('🎯 DELETE BUTTON CLICKED for project:', project.title);
//             onDelete(project);
//           }}
//           title="Delete project"
//           style={{
//             backgroundColor: '#ef4444', 
//             color: 'white', 
//             padding: '8px 12px', 
//             margin: '2px',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '12px'
//           }}
//         >
//           <FiTrash2 style={{marginRight: '4px'}} />
//           Delete Project
//         </button>
        
//         {/* Toggle Featured Button */}
//         <button 
//           className="action-button featured" 
//           onClick={() => {
//             console.log('🎯 TOGGLE FEATURED BUTTON CLICKED for project:', project.title);
//             onToggleFeatured(project);
//           }}
//           title={project.isFeatured ? "Remove from featured" : "Make featured"}
//           style={{
//             backgroundColor: project.isFeatured ? '#f59e0b' : '#6b7280', 
//             color: 'white', 
//             padding: '8px 12px', 
//             margin: '2px',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '12px'
//           }}
//         >
//           <FiStar style={{marginRight: '4px'}} />
//           {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
//         </button>
        
//         {/* Archive/Restore Button */}
//         <button 
//           className="action-button archive" 
//           onClick={() => {
//             console.log('🎯 ARCHIVE BUTTON CLICKED for project:', project.title);
//             onArchive(project);
//           }}
//           title={project.isActive ? "Archive project" : "Restore project"}
//           style={{
//             backgroundColor: project.isActive ? '#6b7280' : '#059669', 
//             color: 'white', 
//             padding: '8px 12px', 
//             margin: '2px',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '12px'
//           }}
//         >
//           <FiArchive style={{marginRight: '4px'}} />
//           {project.isActive ? 'Archive' : 'Restore'}
//         </button>
        
//         <div className="action-menu">
//           <button 
//             onClick={() => {
//               console.log('🎯 MORE MENU CLICKED for project:', project.title);
//               setShowMenu(!showMenu);
//             }}
//             title="More actions"
//             style={{
//               backgroundColor: '#6b7280', 
//               color: 'white', 
//               padding: '8px 12px', 
//               margin: '2px',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: 'pointer',
//               fontSize: '12px'
//             }}
//           >
//             <FiMoreVertical style={{marginRight: '4px'}} />
//             More Options
//           </button>
//           {showMenu && (
//             <div className="dropdown-menu" style={{zIndex: 1000, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '5px'}}>
//               <button onClick={() => {
//                 console.log('🎯 DROPDOWN EDIT CLICKED for project:', project.title);
//                 onEdit(project);
//                 setShowMenu(false);
//               }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
//                 <FiEdit /> Edit Project
//               </button>
//               <button onClick={() => {
//                 console.log('🎯 DROPDOWN TOGGLE FEATURED CLICKED for project:', project.title);
//                 onToggleFeatured(project);
//                 setShowMenu(false);
//               }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
//                 <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
//               </button>
//               <button onClick={() => {
//                 console.log('🎯 DROPDOWN ARCHIVE CLICKED for project:', project.title);
//                 onArchive(project);
//                 setShowMenu(false);
//               }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
//                 <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
//               </button>
//               <button onClick={() => {
//                 console.log('🎯 DROPDOWN DELETE CLICKED for project:', project.title);
//                 onDelete(project);
//                 setShowMenu(false);
//               }} className="danger" style={{display: 'block', width: '100%', padding: '5px', margin: '2px', backgroundColor: '#ef4444', color: 'white'}}>
//                 <FiTrash2 /> Delete Project
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// // NEW: Project Edit Modal Component
// const ProjectEditModal = ({ project, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     title: project?.title || '',
//     abstract: project?.abstract || '',
//     specifications: project?.specifications || '',
//     learningOutcomes: project?.learningOutcomes || '',
//     isFeatured: project?.isFeatured || false
//   });
//   const [loading, setLoading] = useState(false);

//   console.log('📝 PROJECT EDIT MODAL - Project:', project.title);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       console.log('💾 PROJECT UPDATE - Starting with data:', formData);
//       await authService.updateProject(project.id, formData);
//       console.log('✅ PROJECT UPDATE - Success');
//       toast.success('Project updated successfully');
//       onSave();
//     } catch (error) {
//       console.error('❌ PROJECT UPDATE - Error:', error);
//       toast.error('Failed to update project');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="modal-overlay">
//       <div className="modal large">
//         <div className="modal-header">
//           <h2>Edit Project: {project.title}</h2>
//           <button onClick={onClose}>×</button>
//         </div>
        
//         <form onSubmit={handleSubmit}>
//           <div className="form-group">
//             <label>Project Title</label>
//             <input
//               type="text"
//               value={formData.title}
//               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
//               required
//             />
//           </div>

//           <div className="modal-info">
//             <strong>Domain:</strong> {project.subDomain?.domain?.title || 'Unknown'}<br />
//             <strong>SubDomain:</strong> {project.subDomain?.title || 'Unknown'}<br />
//             <span className="info-note">
//               💡 To move this project to a different domain/subdomain, contact your administrator
//             </span>
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
//               {loading ? 'Updating...' : 'Update Project'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default SubDomainManagement;



// // // src/components/domains/SubDomainManagement.js - ENHANCED WITH PROJECT VIEW/EDIT/DELETE
// // import React, { useState, useEffect } from 'react';
// // import { useParams, useNavigate } from 'react-router-dom';
// // import { authService } from '../../services/authService';
// // import { toast } from 'react-toastify';
// // import {
// //   FiPlus,
// //   FiEdit,
// //   FiTrash2,
// //   FiChevronDown,
// //   FiChevronRight,
// //   FiFolder,
// //   FiFolderPlus,
// //   FiFileText,
// //   FiArrowLeft,
// //   FiMoreVertical,
// //   FiMove,
// //   FiTarget,
// //   FiEye,
// //   FiStar,
// //   FiArchive,
// //   FiList,
// //   FiX
// // } from 'react-icons/fi';

// // const SubDomainManagement = () => {
// //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// //   const { domainId } = useParams();
// //   const navigate = useNavigate();
  
// //   const [domain, setDomain] = useState(null);
// //   const [subDomains, setSubDomains] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [showAddModal, setShowAddModal] = useState(false);
// //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// //   const [selectedParent, setSelectedParent] = useState(null);
// //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// //   // Project creation state
// //   const [showProjectModal, setShowProjectModal] = useState(false);
// //   const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

// //   // NEW: Project management states
// //   const [showProjectsModal, setShowProjectsModal] = useState(false);
// //   const [selectedSubDomainForProjectsView, setSelectedSubDomainForProjectsView] = useState(null);
// //   const [projectsInSubDomain, setProjectsInSubDomain] = useState([]);
// //   const [editingProject, setEditingProject] = useState(null);
// //   const [showProjectEditModal, setShowProjectEditModal] = useState(false);
// //   const [projectsLoading, setProjectsLoading] = useState(false);

// //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// //     domainId,
// //     domain: domain?.title,
// //     subDomainsCount: subDomains.length,
// //     loading,
// //     selectedParent: selectedParent?.title,
// //     expandedCount: expandedNodes.size,
// //     showProjectModal,
// //     selectedSubDomainForProject: selectedSubDomainForProject?.title,
// //     // NEW states
// //     showProjectsModal,
// //     selectedSubDomainForProjectsView: selectedSubDomainForProjectsView?.title,
// //     projectsInSubDomainCount: projectsInSubDomain.length,
// //     editingProject: editingProject?.title
// //   });

// //   useEffect(() => {
// //     if (domainId) {
// //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// //       fetchDomainAndSubDomains();
// //     }
// //   }, [domainId]);

// //   const fetchDomainAndSubDomains = async () => {
// //     try {
// //       setLoading(true);
      
// //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
// //       // Get domain details
// //       const domainsResponse = await authService.getDomains();
// //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// //       let domainData = null;
// //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// //       if (domains.length > 0) {
// //         domainData = domains.find(d => d.id == domainId);
// //         console.log('🎯 SUBDOMAIN FETCH - Found domain data:', domainData);
// //       }
      
// //       if (!domainData) {
// //         console.log('⚠️ SUBDOMAIN FETCH - Domain not found, creating fallback');
// //         domainData = {
// //           id: domainId,
// //           title: `Domain ${domainId}`,
// //           description: 'Domain not found in list',
// //           projectCount: 0
// //         };
// //       }
      
// //       setDomain(domainData);
      
// //       // Get subdomains
// //       console.log('📡 SUBDOMAIN FETCH - Fetching subdomains with domainId:', domainId);
// //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse);
// //       console.log('✅ SUBDOMAIN FETCH - SubDomains response.data:', subDomainsResponse.data);
// //       console.log('✅ SUBDOMAIN FETCH - SubDomains response data type:', typeof subDomainsResponse.data);
// //       console.log('✅ SUBDOMAIN FETCH - SubDomains response data keys:', Object.keys(subDomainsResponse.data || {}));
      
// //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// //       console.log('🎯 SUBDOMAIN FETCH - Extracted subdomains data:', subDomainsData);
// //       console.log('🎯 SUBDOMAIN FETCH - Subdomains count:', subDomainsData.length);
      
// //       // 🔍 DEBUGGING: Log each subdomain's project count
// //       subDomainsData.forEach((subdomain, index) => {
// //         console.log(`📊 SUBDOMAIN ${index + 1} [${subdomain.title}]:`, {
// //           id: subdomain.id,
// //           title: subdomain.title,
// //           projectCount: subdomain.projectCount,
// //           hasChildren: subdomain.children && subdomain.children.length > 0,
// //           childrenCount: subdomain.children?.length || 0,
// //           isLeaf: !subdomain.children || subdomain.children.length === 0,
// //           fullObject: subdomain
// //         });
// //       });
      
// //       setSubDomains(subDomainsData);
      
// //       // Auto-expand first level
// //       if (subDomainsData.length > 0) {
// //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// //         setExpandedNodes(new Set(firstLevelIds));
// //         console.log('🔄 SUBDOMAIN FETCH - Auto-expanded first level IDs:', firstLevelIds);
// //       }
      
// //       // Try hierarchy API as fallback
// //       try {
// //         console.log('📡 SUBDOMAIN FETCH - Trying hierarchy API as fallback');
// //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse);
// //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response.data:', hierarchyResponse.data);
        
// //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// //         console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
// //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// //           console.log('🔄 SUBDOMAIN FETCH - Using hierarchy data instead');
// //           console.log('🔄 SUBDOMAIN FETCH - Hierarchy subdomains:', hierarchyData.subDomains);
          
// //           // 🔍 DEBUGGING: Log hierarchy subdomain project counts
// //           hierarchyData.subDomains.forEach((subdomain, index) => {
// //             console.log(`📊 HIERARCHY SUBDOMAIN ${index + 1} [${subdomain.title}]:`, {
// //               id: subdomain.id,
// //               title: subdomain.title,
// //               projectCount: subdomain.projectCount,
// //               hasChildren: subdomain.children && subdomain.children.length > 0,
// //               childrenCount: subdomain.children?.length || 0,
// //               isLeaf: !subdomain.children || subdomain.children.length === 0,
// //               fullObject: subdomain
// //             });
// //           });
          
// //           setSubDomains(hierarchyData.subDomains);
// //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// //           }
// //         }
// //       } catch (hierarchyError) {
// //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
// //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy error response:', hierarchyError.response);
// //       }
      
// //     } catch (error) {
// //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// //       console.error('❌ SUBDOMAIN FETCH - Error response data:', error.response?.data);
// //       console.error('❌ SUBDOMAIN FETCH - Error message:', error.message);
// //       toast.error('Failed to fetch domain information: ' + (error.response?.data?.message || error.message));
      
// //       setDomain({
// //         id: domainId,
// //         title: `Domain ${domainId}`,
// //         description: 'Error loading domain details',
// //         projectCount: 0
// //       });
// //       setSubDomains([]);
// //     } finally {
// //       setLoading(false);
// //       console.log('🏁 SUBDOMAIN FETCH - Loading set to false');
// //     }
// //   };

// //   const handleAddSubDomain = (parent = null) => {
// //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
// //     setSelectedParent(parent);
// //     setEditingSubDomain(null);
// //     setShowAddModal(true);
// //   };

// //   const handleEditSubDomain = (subDomain) => {
// //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
// //     setSelectedParent(null);
// //     setEditingSubDomain(subDomain);
// //     setShowAddModal(true);
// //   };

// //   // Handle adding project to subdomain
// //   const handleAddProjectToSubDomain = (subDomain) => {
// //     console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
// //     console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
// //     if (subDomain.children && subDomain.children.length > 0) {
// //       toast.error('Projects can only be added to leaf sub-domains (those without children)');
// //       return;
// //     }
    
// //     setSelectedSubDomainForProject(subDomain);
// //     setShowProjectModal(true);
// //   };

// //   // NEW: Handle viewing projects in subdomain
// //   const handleViewProjectsInSubDomain = async (subDomain) => {
// //     console.log('👁️ VIEW PROJECTS - Starting for subdomain:', subDomain.title);
// //     console.log('🔍 VIEW PROJECTS - SubDomain object:', subDomain);
// //     console.log('🔍 VIEW PROJECTS - Has children?', subDomain.children && subDomain.children.length > 0);
// //     console.log('🔍 VIEW PROJECTS - Project count:', subDomain.projectCount);
// //     console.log('🔍 VIEW PROJECTS - Is leaf?', !subDomain.children || subDomain.children.length === 0);
    
// //     if (subDomain.children && subDomain.children.length > 0) {
// //       console.log('❌ VIEW PROJECTS - Not a leaf subdomain');
// //       toast.error('Only leaf sub-domains have projects to view');
// //       return;
// //     }
    
// //     if (!subDomain.projectCount || subDomain.projectCount === 0) {
// //       console.log('❌ VIEW PROJECTS - No projects in subdomain');
// //       toast.info('This sub-domain has no projects yet. Let\'s fetch anyway to check...');
// //       // Don't return - still try to fetch in case the count is wrong
// //     }
    
// //     console.log('✅ VIEW PROJECTS - Proceeding to fetch projects');
// //     setSelectedSubDomainForProjectsView(subDomain);
// //     await fetchProjectsInSubDomain(subDomain.id);
// //     setShowProjectsModal(true);
// //   };

// //   // NEW: Fetch projects for a specific subdomain
// //   const fetchProjectsInSubDomain = async (subDomainId) => {
// //     try {
// //       setProjectsLoading(true);
// //       console.log('📡 FETCH PROJECTS - For subdomain ID:', subDomainId);
// //       console.log('📡 FETCH PROJECTS - Making API call to authService.getProjects()');
      
// //       const response = await authService.getProjects({ 
// //         subDomainId: subDomainId,
// //         limit: 100 // Get all projects for this subdomain
// //       });
      
// //       console.log('✅ FETCH PROJECTS - Full API Response:', response);
// //       console.log('✅ FETCH PROJECTS - Response status:', response.status);
// //       console.log('✅ FETCH PROJECTS - Response data:', response.data);
// //       console.log('✅ FETCH PROJECTS - Response data type:', typeof response.data);
// //       console.log('✅ FETCH PROJECTS - Response data keys:', Object.keys(response.data || {}));
      
// //       const projects = response.data?.projects || response.data?.data?.projects || [];
// //       console.log('🎯 FETCH PROJECTS - Extracted projects:', projects);
// //       console.log('🎯 FETCH PROJECTS - Projects count:', projects.length);
// //       console.log('🎯 FETCH PROJECTS - First project (if any):', projects[0]);
      
// //       setProjectsInSubDomain(projects);
      
// //       if (projects.length === 0) {
// //         console.log('⚠️ FETCH PROJECTS - No projects found for subdomain:', subDomainId);
// //         toast.info(`No projects found in this subdomain. API returned ${projects.length} projects.`);
// //       } else {
// //         console.log('🎉 FETCH PROJECTS - Successfully loaded', projects.length, 'projects');
// //       }
      
// //     } catch (error) {
// //       console.error('❌ FETCH PROJECTS - Error occurred:', error);
// //       console.error('❌ FETCH PROJECTS - Error response:', error.response);
// //       console.error('❌ FETCH PROJECTS - Error response data:', error.response?.data);
// //       console.error('❌ FETCH PROJECTS - Error message:', error.message);
// //       toast.error('Failed to fetch projects: ' + (error.response?.data?.message || error.message));
// //       setProjectsInSubDomain([]);
// //     } finally {
// //       setProjectsLoading(false);
// //       console.log('🏁 FETCH PROJECTS - Loading set to false');
// //     }
// //   };

// //   // NEW: Handle editing a project
// //   const handleEditProject = (project) => {
// //     console.log('✏️ EDIT PROJECT - Starting for:', project.title);
// //     setEditingProject(project);
// //     setShowProjectEditModal(true);
// //   };

// //   // NEW: Handle deleting a project
// //   const handleDeleteProject = async (project) => {
// //     console.log('🗑️ DELETE PROJECT - Requesting deletion:', project.title);
    
// //     if (!window.confirm(`Are you sure you want to delete the project "${project.title}"?`)) {
// //       console.log('❌ DELETE PROJECT - Cancelled by user');
// //       return;
// //     }

// //     try {
// //       console.log('📡 DELETE PROJECT - API call for:', project.id);
// //       await authService.deleteProject(project.id);
// //       console.log('✅ DELETE PROJECT - Success');
// //       toast.success('Project deleted successfully');
      
// //       // Refresh projects list and subdomain data
// //       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
// //       await fetchDomainAndSubDomains(); // Refresh to update project counts
      
// //     } catch (error) {
// //       console.error('❌ DELETE PROJECT - Error:', error);
// //       toast.error('Failed to delete project');
// //     }
// //   };

// //   // NEW: Handle archiving a project
// //   const handleArchiveProject = async (project) => {
// //     const isArchiving = project.isActive;
// //     const action = isArchiving ? 'archive' : 'restore';
    
// //     console.log('📁 ARCHIVE PROJECT - Action:', action, 'for:', project.title);
    
// //     if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
// //       return;
// //     }

// //     try {
// //       await authService.archiveProject(project.id, {
// //         archive: isArchiving,
// //         reason: `${action} via subdomain management`
// //       });
// //       console.log('✅ ARCHIVE PROJECT - Success');
// //       toast.success(`Project ${action}d successfully`);
      
// //       // Refresh projects list
// //       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
// //     } catch (error) {
// //       console.error('❌ ARCHIVE PROJECT - Error:', error);
// //       toast.error(`Failed to ${action} project`);
// //     }
// //   };

// //   // NEW: Handle toggling featured status
// //   const handleToggleProjectFeatured = async (project) => {
// //     console.log('⭐ TOGGLE FEATURED - For project:', project.title);
    
// //     try {
// //       await authService.updateProject(project.id, {
// //         isFeatured: !project.isFeatured
// //       });
// //       console.log('✅ TOGGLE FEATURED - Success');
// //       toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
      
// //       // Refresh projects list
// //       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
// //     } catch (error) {
// //       console.error('❌ TOGGLE FEATURED - Error:', error);
// //       toast.error('Failed to update featured status');
// //     }
// //   };

// //   const handleDeleteSubDomain = async (subDomain) => {
// //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// //     const hasProjects = subDomain.projectCount > 0;
    
// //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// //     if (hasChildren) {
// //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// //     }
// //     if (hasProjects) {
// //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// //     }
    
// //     if (!window.confirm(confirmMessage)) {
// //       return;
// //     }

// //     try {
// //       console.log('🗑️ SUBDOMAIN DELETE - Deleting:', subDomain.title);
// //       const response = await authService.deleteSubDomain(subDomain.id);
// //       toast.success('Sub-domain deleted successfully');
// //       fetchDomainAndSubDomains();
// //     } catch (error) {
// //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// //       toast.error('Failed to delete sub-domain');
// //     }
// //   };

// //   const toggleExpanded = (nodeId) => {
// //     const newExpanded = new Set(expandedNodes);
// //     if (newExpanded.has(nodeId)) {
// //       newExpanded.delete(nodeId);
// //     } else {
// //       newExpanded.add(nodeId);
// //     }
// //     setExpandedNodes(newExpanded);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <div className="loading-spinner"></div>
// //         <p>Loading sub-domains...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="subdomain-management">
// //       {/* Header with Breadcrumb */}
// //       <div className="page-header">
// //         <div className="header-content">
// //           <div className="breadcrumb">
// //             <button 
// //               className="breadcrumb-link"
// //               onClick={() => navigate('/domains')}
// //             >
// //               <FiArrowLeft />
// //               Domains
// //             </button>
// //             <span className="breadcrumb-separator">/</span>
// //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// //           </div>
// //           <h1>SubDomain Management</h1>
// //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// //         </div>
// //         <div className="header-actions">
// //           <button 
// //             className="primary-button" 
// //             onClick={() => handleAddSubDomain()}
// //           >
// //             <FiPlus />
// //             Add Root SubDomain
// //           </button>
// //         </div>
// //       </div>

// //       {/* Quick Guide */}
// //       <div className="quick-guide">
// //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// //         <div className="guide-steps">
// //           <div className="guide-step">
// //             <span className="step-number">1</span>
// //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// //           </div>
// //           <div className="guide-step">
// //             <span className="step-number">2</span>
// //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// //           </div>
// //           <div className="guide-step">
// //             <span className="step-number">3</span>
// //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// //           </div>
// //           <div className="guide-step">
// //             <span className="step-number">4</span>
// //             <span className="step-text">Click <strong>"Add Project"</strong> or <strong>"View Projects"</strong> on leaf subdomains</span>
// //           </div>
// //         </div>
// //       </div>

// //       {/* Domain Info Card */}
// //       {domain && (
// //         <div className="domain-info-card">
// //           <div className="domain-icon">
// //             <FiFolder />
// //           </div>
// //           <div className="domain-details">
// //             <h3>{domain.title}</h3>
// //             <p>{domain.description}</p>
// //             <div className="domain-stats">
// //               <span className="stat-item">
// //                 <strong>{subDomains.length}</strong> root sub-domains
// //               </span>
// //               <span className="stat-item">
// //                 <strong>{domain.projectCount || 0}</strong> total projects
// //               </span>
// //             </div>
// //           </div>
// //         </div>
// //       )}

// //       {/* SubDomain Tree */}
// //       <div className="subdomain-tree-container">
// //         <div className="tree-header">
// //           <h2>SubDomain Hierarchy</h2>
// //           <div className="tree-legend">
// //             <span className="legend-item">
// //               <FiFolder className="folder-icon" />
// //               Has children
// //             </span>
// //             <span className="legend-item">
// //               <FiTarget className="leaf-icon" />
// //               Leaf (can have projects)
// //             </span>
// //             <span className="legend-item">
// //               <FiFileText className="project-icon" />
// //               Add Project
// //             </span>
// //             <span className="legend-item">
// //               <FiList className="view-icon" />
// //               View Projects
// //             </span>
// //           </div>
// //         </div>

// //         {subDomains.length > 0 ? (
// //           <div className="subdomain-tree">
// //             {subDomains.map((subDomain) => (
// //               <SubDomainNode
// //                 key={subDomain.id}
// //                 subDomain={subDomain}
// //                 level={0}
// //                 isExpanded={expandedNodes.has(subDomain.id)}
// //                 onToggleExpanded={toggleExpanded}
// //                 onEdit={handleEditSubDomain}
// //                 onDelete={handleDeleteSubDomain}
// //                 onAddChild={handleAddSubDomain}
// //                 onAddProject={handleAddProjectToSubDomain}
// //                 onViewProjects={handleViewProjectsInSubDomain} // NEW
// //                 expandedNodes={expandedNodes}
// //               />
// //             ))}
// //           </div>
// //         ) : (
// //           <div className="empty-tree-state">
// //             <FiFolderPlus size={64} />
// //             <h3>No SubDomains Yet</h3>
// //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// //             <div className="empty-state-examples">
// //               <h4>Example Structure:</h4>
// //               <div className="example-tree">
// //                 <div className="example-item">📂 Machine Learning</div>
// //                 <div className="example-item nested">🎯 Deep Learning</div>
// //                 <div className="example-item nested">🎯 Computer Vision</div>
// //                 <div className="example-item">🎯 Data Science</div>
// //               </div>
// //             </div>
// //             <div className="empty-state-actions">
// //               <button 
// //                 className="primary-button large" 
// //                 onClick={() => handleAddSubDomain()}
// //               >
// //                 <FiPlus />
// //                 Create Your First SubDomain
// //               </button>
// //               <p className="help-text">
// //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// //               </p>
// //             </div>
// //           </div>
// //         )}
// //       </div>

// //       {/* Add/Edit SubDomain Modal */}
// //       {showAddModal && (
// //         <SubDomainModal
// //           subDomain={editingSubDomain}
// //           parent={selectedParent}
// //           domain={domain}
// //           onClose={() => {
// //             setShowAddModal(false);
// //             setEditingSubDomain(null);
// //             setSelectedParent(null);
// //           }}
// //           onSave={() => {
// //             setShowAddModal(false);
// //             setEditingSubDomain(null);
// //             setSelectedParent(null);
// //             fetchDomainAndSubDomains();
// //           }}
// //         />
// //       )}

// //       {/* Project Creation Modal */}
// //       {showProjectModal && (
// //         <ProjectModal
// //           subDomain={selectedSubDomainForProject}
// //           domain={domain}
// //           onClose={() => {
// //             setShowProjectModal(false);
// //             setSelectedSubDomainForProject(null);
// //           }}
// //           onSave={() => {
// //             setShowProjectModal(false);
// //             setSelectedSubDomainForProject(null);
// //             toast.success('Project created successfully!');
// //             fetchDomainAndSubDomains(); // Refresh to update project counts
// //           }}
// //         />
// //       )}

// //       {/* NEW: Projects List Modal */}
// //       {showProjectsModal && (
// //         <ProjectsListModal
// //           subDomain={selectedSubDomainForProjectsView}
// //           projects={projectsInSubDomain}
// //           loading={projectsLoading}
// //           onClose={() => {
// //             setShowProjectsModal(false);
// //             setSelectedSubDomainForProjectsView(null);
// //             setProjectsInSubDomain([]);
// //           }}
// //           onEdit={handleEditProject}
// //           onDelete={handleDeleteProject}
// //           onArchive={handleArchiveProject}
// //           onToggleFeatured={handleToggleProjectFeatured}
// //           onAddProject={() => {
// //             setShowProjectsModal(false);
// //             setSelectedSubDomainForProject(selectedSubDomainForProjectsView);
// //             setShowProjectModal(true);
// //           }}
// //         />
// //       )}

// //       {/* NEW: Project Edit Modal */}
// //       {showProjectEditModal && editingProject && (
// //         <ProjectEditModal
// //           project={editingProject}
// //           onClose={() => {
// //             setShowProjectEditModal(false);
// //             setEditingProject(null);
// //           }}
// //           onSave={() => {
// //             setShowProjectEditModal(false);
// //             setEditingProject(null);
// //             // Refresh projects list and subdomain data
// //             fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
// //             fetchDomainAndSubDomains();
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // // UPDATED SubDomain Node Component with View Projects functionality
// // const SubDomainNode = ({ 
// //   subDomain, 
// //   level, 
// //   isExpanded, 
// //   onToggleExpanded, 
// //   onEdit, 
// //   onDelete, 
// //   onAddChild,
// //   onAddProject,
// //   onViewProjects, // NEW
// //   expandedNodes 
// // }) => {
// //   const [showMenu, setShowMenu] = useState(false);
// //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// //   const isLeaf = !hasChildren;
// //   const hasProjects = subDomain.projectCount > 0;

// //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// //     title: subDomain.title,
// //     level,
// //     hasChildren,
// //     isLeaf,
// //     isExpanded,
// //     projectCount: subDomain.projectCount,
// //     hasProjects,
// //     children: subDomain.children,
// //     childrenLength: subDomain.children?.length,
// //     subDomainFullObject: subDomain
// //   });

// //   // 🔍 DEBUGGING: Log button visibility conditions
// //   console.log('🔍 BUTTON VISIBILITY DEBUG for', subDomain.title, ':', {
// //     isLeaf,
// //     hasProjects,
// //     projectCount: subDomain.projectCount,
// //     shouldShowViewButton: isLeaf && hasProjects,
// //     shouldShowAddButton: isLeaf
// //   });

// //   return (
// //     <div className={`subdomain-node level-${level}`}>
// //       <div className="node-content">
// //         <div className="node-main">
// //           {hasChildren ? (
// //             <button 
// //               className="expand-button"
// //               onClick={() => onToggleExpanded(subDomain.id)}
// //             >
// //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// //             </button>
// //           ) : (
// //             <div className="expand-placeholder" />
// //           )}
          
// //           <div className="node-icon">
// //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// //           </div>
          
// //           <div className="node-info">
// //             <h4 className="node-title">{subDomain.title}</h4>
// //             <p className="node-description">{subDomain.description}</p>
// //             <div className="node-stats">
// //               {hasChildren && (
// //                 <span className="stat-badge">
// //                   {subDomain.children.length} sub-domains
// //                 </span>
// //               )}
// //               {hasProjects && (
// //                 <span className="stat-badge projects">
// //                   {subDomain.projectCount} projects
// //                 </span>
// //               )}
// //               {isLeaf && !hasProjects && (
// //                 <span className="stat-badge leaf">
// //                   Can have projects
// //                 </span>
// //               )}
// //               {/* 🔍 DEBUGGING: Always show project count for debugging */}
// //               <span className="stat-badge debug" style={{backgroundColor: '#ff9999', color: '#000'}}>
// //                 DEBUG: Count={subDomain.projectCount || 0}
// //               </span>
// //             </div>
// //           </div>
// //         </div>
        
// //         <div className="node-actions">
// //           {/* 🔍 DEBUGGING: Always show this section with debug info */}
// //           <div style={{fontSize: '10px', color: '#666', marginBottom: '5px'}}>
// //             DEBUG: isLeaf={isLeaf.toString()}, hasProjects={hasProjects.toString()}, count={subDomain.projectCount}
// //           </div>
          
// //           {/* NEW: View Projects button for leaf nodes - ALWAYS SHOW IF LEAF FOR DEBUGGING */}
// //           {isLeaf && (
// //             <button 
// //               className="action-button view" 
// //               onClick={() => {
// //                 console.log('🎯 VIEW BUTTON CLICKED for:', subDomain.title);
// //                 onViewProjects(subDomain);
// //               }}
// //               title={`View projects in "${subDomain.title}" (Count: ${subDomain.projectCount || 0})`}
// //               style={{backgroundColor: hasProjects ? '#10b981' : '#6b7280'}}
// //             >
// //               <FiList />
// //               <span style={{fontSize: '10px', marginLeft: '2px'}}>
// //                 {subDomain.projectCount || 0}
// //               </span>
// //             </button>
// //           )}
          
// //           {isLeaf && (
// //             <button 
// //               className="action-button project" 
// //               onClick={() => {
// //                 console.log('🎯 ADD PROJECT BUTTON CLICKED for:', subDomain.title);
// //                 onAddProject(subDomain);
// //               }}
// //               title={`Add project to "${subDomain.title}"`}
// //             >
// //               <FiFileText />
// //             </button>
// //           )}
          
// //           <button 
// //             className="action-button add" 
// //             onClick={() => onAddChild(subDomain)}
// //             title={`Add child subdomain under "${subDomain.title}"`}
// //           >
// //             <FiPlus />
// //           </button>
          
// //           <div className="action-menu">
// //             <button 
// //               onClick={() => setShowMenu(!showMenu)}
// //               title="More actions"
// //             >
// //               <FiMoreVertical />
// //             </button>
// //             {showMenu && (
// //               <div className="dropdown-menu">
// //                 {/* 🔍 DEBUGGING: Always show view projects option for leaf nodes */}
// //                 {isLeaf && (
// //                   <button 
// //                     onClick={() => {
// //                       console.log('🎯 DROPDOWN VIEW PROJECTS CLICKED for:', subDomain.title);
// //                       onViewProjects(subDomain);
// //                       setShowMenu(false);
// //                     }}
// //                     className="primary-option"
// //                     style={{backgroundColor: hasProjects ? '#dff0d8' : '#f8f9fa'}}
// //                   >
// //                     <FiList /> View Projects ({subDomain.projectCount || 0})
// //                   </button>
// //                 )}
// //                 {isLeaf && (
// //                   <button 
// //                     onClick={() => {
// //                       onAddProject(subDomain);
// //                       setShowMenu(false);
// //                     }}
// //                     className="primary-option"
// //                   >
// //                     <FiFileText /> Add Project
// //                   </button>
// //                 )}
// //                 <button onClick={() => {
// //                   onEdit(subDomain);
// //                   setShowMenu(false);
// //                 }}>
// //                   <FiEdit /> Edit SubDomain
// //                 </button>
// //                 <button onClick={() => {
// //                   onAddChild(subDomain);
// //                   setShowMenu(false);
// //                 }}>
// //                   <FiPlus /> Add Child SubDomain
// //                 </button>
// //                 <button onClick={() => {
// //                   onDelete(subDomain);
// //                   setShowMenu(false);
// //                 }} className="danger">
// //                   <FiTrash2 /> Delete SubDomain
// //                 </button>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
      
// //       {/* Children */}
// //       {hasChildren && isExpanded && (
// //         <div className="node-children">
// //           {subDomain.children.map((child) => (
// //             <SubDomainNode
// //               key={child.id}
// //               subDomain={child}
// //               level={level + 1}
// //               isExpanded={expandedNodes.has(child.id)}
// //               onToggleExpanded={onToggleExpanded}
// //               onEdit={onEdit}
// //               onDelete={onDelete}
// //               onAddChild={onAddChild}
// //               onAddProject={onAddProject}
// //               onViewProjects={onViewProjects} // NEW
// //               expandedNodes={expandedNodes}
// //             />
// //           ))}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // // SubDomain Modal Component (unchanged)
// // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// //   const [formData, setFormData] = useState({
// //     title: subDomain?.title || '',
// //     description: subDomain?.description || ''
// //   });
// //   const [loading, setLoading] = useState(false);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       const requestData = {
// //         title: formData.title.trim(),
// //         description: formData.description.trim(),
// //         domainId: domain.id,
// //         parentId: parent?.id || null
// //       };

// //       console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

// //       if (subDomain) {
// //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// //         toast.success('Sub-domain updated successfully');
// //       } else {
// //         const response = await authService.createSubDomain(requestData);
// //         toast.success('Sub-domain created successfully');
// //       }

// //       onSave();
// //     } catch (error) {
// //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// //       const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
// //       toast.error(errorMessage);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const getModalTitle = () => {
// //     if (subDomain) {
// //       return `Edit SubDomain: ${subDomain.title}`;
// //     }
// //     if (parent) {
// //       return `Add SubDomain under: ${parent.title}`;
// //     }
// //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// //   };

// //   return (
// //     <div className="modal-overlay">
// //       <div className="modal">
// //         <div className="modal-header">
// //           <h2>{getModalTitle()}</h2>
// //           <button onClick={onClose}>×</button>
// //         </div>
        
// //         <form onSubmit={handleSubmit}>
// //           <div className="form-group">
// //             <label>SubDomain Title *</label>
// //             <input
// //               type="text"
// //               value={formData.title}
// //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// //               placeholder="e.g., Machine Learning, Deep Learning"
// //               required
// //               minLength={3}
// //               maxLength={100}
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>Description (Optional)</label>
// //             <textarea
// //               value={formData.description}
// //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// //               rows={3}
// //               placeholder="Describe what this sub-domain covers..."
// //               maxLength={500}
// //             />
// //           </div>
          
// //           <div className="modal-info">
// //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// //             {parent && (
// //               <>
// //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// //               </>
// //             )}
// //             <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
// //           </div>
          
// //           <div className="modal-actions">
// //             <button type="button" onClick={onClose} disabled={loading}>
// //               Cancel
// //             </button>
// //             <button 
// //               type="submit" 
// //               className="primary-button" 
// //               disabled={loading || !formData.title.trim()}
// //             >
// //               {loading ? 'Saving...' : 'Save SubDomain'}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // // Project Creation Modal Component (unchanged)
// // const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
// //   const [formData, setFormData] = useState({
// //     title: '',
// //     abstract: '',
// //     specifications: '',
// //     learningOutcomes: '',
// //     subDomainId: subDomain?.id || '',
// //     isFeatured: false
// //   });
// //   const [loading, setLoading] = useState(false);

// //   console.log('📝 PROJECT MODAL - Props:', {
// //     subDomain: subDomain?.title,
// //     domain: domain?.title,
// //     formData
// //   });

// //   // Slug generation function
// //   const generateSlug = (title) => {
// //     return title
// //       .toLowerCase()
// //       .trim()
// //       .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
// //       .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
// //       .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       // Don't send slug - let backend auto-generate it
// //       const projectData = {
// //         title: formData.title.trim(),
// //         abstract: formData.abstract.trim(),
// //         specifications: formData.specifications.trim(),
// //         learningOutcomes: formData.learningOutcomes.trim(),
// //         subDomainId: formData.subDomainId,
// //         isFeatured: formData.isFeatured
// //       };

// //       console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
// //       console.log('🔗 PROJECT SAVE - Backend will auto-generate slug from title:', formData.title);
      
// //       const response = await authService.createProject(projectData);
// //       console.log('✅ PROJECT CREATE - Response:', response.data);
      
// //       onSave();
// //     } catch (error) {
// //       console.error('❌ PROJECT SAVE - Error:', error);
// //       console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
      
// //       // Show more specific error message if available
// //       const errorMessage = error.response?.data?.message || 'Failed to create project';
// //       toast.error(errorMessage);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="modal-overlay">
// //       <div className="modal large">
// //         <div className="modal-header">
// //           <h2>Add Project to: {subDomain?.title}</h2>
// //           <button onClick={onClose}>×</button>
// //         </div>
        
// //         <form onSubmit={handleSubmit}>
// //           <div className="form-group">
// //             <label>Project Title *</label>
// //             <input
// //               type="text"
// //               value={formData.title}
// //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// //               placeholder="Enter project title..."
// //               required
// //               minLength={3}
// //               maxLength={200}
// //             />
// //             {/* Show slug preview (for user reference only) */}
// //             {formData.title && (
// //               <div className="slug-preview">
// //                 <small>Expected URL Slug: <code>{generateSlug(formData.title)}</code> <em>(auto-generated by backend)</em></small>
// //               </div>
// //             )}
// //           </div>
          
// //           <div className="modal-info">
// //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// //             <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
// //             <span className="info-note">
// //               <FiTarget /> This is a leaf subdomain - perfect for projects!
// //             </span>
// //           </div>
          
// //           <div className="form-group">
// //             <label>Abstract *</label>
// //             <textarea
// //               value={formData.abstract}
// //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// //               rows={4}
// //               placeholder="Brief description of the project..."
// //               required
// //               minLength={10}
// //               maxLength={1000}
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>Specifications *</label>
// //             <textarea
// //               value={formData.specifications}
// //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// //               rows={6}
// //               placeholder="Technical specifications and requirements..."
// //               required
// //               minLength={10}
// //               maxLength={5000}
// //             />
// //           </div>
          
// //           <div className="form-group">
// //             <label>Learning Outcomes *</label>
// //             <textarea
// //               value={formData.learningOutcomes}
// //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// //               rows={4}
// //               placeholder="What will students learn from this project..."
// //               required
// //               minLength={10}
// //               maxLength={2000}
// //             />
// //           </div>
          
// //           <div className="form-group checkbox">
// //             <label>
// //               <input
// //                 type="checkbox"
// //                 checked={formData.isFeatured}
// //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// //               />
// //               <FiTarget />
// //               Featured Project
// //             </label>
// //           </div>
          
// //           <div className="modal-actions">
// //             <button type="button" onClick={onClose} disabled={loading}>
// //               Cancel
// //             </button>
// //             <button 
// //               type="submit" 
// //               className="primary-button" 
// //               disabled={loading || !formData.title || !formData.abstract || !formData.specifications || !formData.learningOutcomes}
// //             >
// //               {loading ? 'Creating...' : 'Create Project'}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // // NEW: Projects List Modal Component
// // const ProjectsListModal = ({ 
// //   subDomain, 
// //   projects, 
// //   loading, 
// //   onClose, 
// //   onEdit, 
// //   onDelete, 
// //   onArchive, 
// //   onToggleFeatured,
// //   onAddProject 
// // }) => {
// //   console.log('📋 PROJECTS LIST MODAL - Rendering with props:', {
// //     subDomain: subDomain?.title,
// //     subDomainId: subDomain?.id,
// //     projectsCount: projects.length,
// //     loading,
// //     projects: projects,
// //     firstProject: projects[0]
// //   });

// //   return (
// //     <div className="modal-overlay">
// //       <div className="modal large">
// //         <div className="modal-header">
// //           <h2>Projects in: {subDomain?.title}</h2>
// //           <button onClick={onClose}>
// //             <FiX />
// //           </button>
// //         </div>
        
// //         <div className="projects-list-content">
// //           <div className="projects-list-header">
// //             <div className="list-info">
// //               <p><strong>SubDomain:</strong> {subDomain?.title}</p>
// //               <p><strong>Total Projects:</strong> {projects.length}</p>
// //               {/* 🔍 DEBUGGING: Show debug info */}
// //               <div style={{fontSize: '12px', color: '#666', marginTop: '10px', padding: '10px', backgroundColor: '#f0f0f0'}}>
// //                 <strong>DEBUG INFO:</strong><br/>
// //                 SubDomain ID: {subDomain?.id}<br/>
// //                 Projects Array Length: {projects.length}<br/>
// //                 Loading: {loading.toString()}<br/>
// //                 Projects Data: {JSON.stringify(projects, null, 2)}
// //               </div>
// //             </div>
// //             <button 
// //               className="primary-button" 
// //               onClick={() => {
// //                 console.log('🎯 ADD NEW PROJECT CLICKED from modal');
// //                 onAddProject();
// //               }}
// //             >
// //               <FiPlus />
// //               Add New Project
// //             </button>
// //           </div>
          
// //           {loading ? (
// //             <div className="loading-container">
// //               <div className="loading-spinner"></div>
// //               <p>Loading projects...</p>
// //             </div>
// //           ) : projects.length > 0 ? (
// //             <div className="projects-list">
// //               {projects.map((project, index) => {
// //                 console.log(`📄 RENDERING PROJECT ${index + 1}:`, project);
// //                 return (
// //                   <ProjectListItem
// //                     key={project.id}
// //                     project={project}
// //                     onEdit={onEdit}
// //                     onDelete={onDelete}
// //                     onArchive={onArchive}
// //                     onToggleFeatured={onToggleFeatured}
// //                   />
// //                 );
// //               })}
// //             </div>
// //           ) : (
// //             <div className="empty-projects-state">
// //               <FiFileText size={48} />
// //               <h3>No Projects Found</h3>
// //               <p>This subdomain doesn't have any projects yet.</p>
// //               <div style={{fontSize: '12px', color: '#666', marginTop: '10px'}}>
// //                 <strong>DEBUG:</strong> API returned {projects.length} projects for subdomain {subDomain?.id}
// //               </div>
// //               <button 
// //                 className="primary-button" 
// //                 onClick={() => {
// //                   console.log('🎯 ADD FIRST PROJECT CLICKED from empty state');
// //                   onAddProject();
// //                 }}
// //               >
// //                 <FiPlus />
// //                 Add First Project
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // NEW: Project List Item Component
// // const ProjectListItem = ({ 
// //   project, 
// //   onEdit, 
// //   onDelete, 
// //   onArchive, 
// //   onToggleFeatured 
// // }) => {
// //   const [showMenu, setShowMenu] = useState(false);

// //   console.log('📄 PROJECT LIST ITEM - Rendering project:', {
// //     id: project.id,
// //     title: project.title,
// //     abstract: project.abstract?.substring(0, 50),
// //     isActive: project.isActive,
// //     isFeatured: project.isFeatured,
// //     viewCount: project.viewCount,
// //     createdAt: project.createdAt,
// //     updatedAt: project.updatedAt,
// //     fullProject: project
// //   });

// //   return (
// //     <div className={`project-list-item ${!project.isActive ? 'archived' : ''}`}>
// //       <div className="project-info">
// //         <div className="project-title-section">
// //           <h4 className="project-title">{project.title}</h4>
// //           <div className="project-badges">
// //             {project.isFeatured && (
// //               <span className="badge featured">
// //                 <FiStar /> Featured
// //               </span>
// //             )}
// //             {!project.isActive && (
// //               <span className="badge archived">Archived</span>
// //             )}
// //             {/* 🔍 DEBUGGING: Always show project ID */}
// //             <span className="badge debug" style={{backgroundColor: '#e3f2fd', color: '#1976d2'}}>
// //               ID: {project.id}
// //             </span>
// //           </div>
// //         </div>
// //         <p className="project-abstract">
// //           {project.abstract?.substring(0, 150) || 'No abstract available'}...
// //         </p>
// //         <div className="project-stats">
// //           <span className="stat">
// //             <FiEye /> {project.viewCount || 0} views
// //           </span>
// //           <span className="stat">
// //             Created: {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'Unknown'}
// //           </span>
// //           <span className="stat">
// //             Updated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'Unknown'}
// //           </span>
// //         </div>
// //       </div>
      
// //       <div className="project-actions">
// //         {/* 🔍 DEBUGGING: Always show edit button with debug styling */}
// //         <button 
// //           className="action-button primary" 
// //           onClick={() => {
// //             console.log('🎯 EDIT BUTTON CLICKED for project:', project.title);
// //             onEdit(project);
// //           }}
// //           title="Edit project"
// //           style={{backgroundColor: '#10b981', color: 'white', padding: '8px', margin: '2px'}}
// //         >
// //           <FiEdit />
// //           <span style={{fontSize: '10px', marginLeft: '2px'}}>EDIT</span>
// //         </button>
        
// //         {/* 🔍 DEBUGGING: Always show delete button with debug styling */}
// //         <button 
// //           className="action-button danger" 
// //           onClick={() => {
// //             console.log('🎯 DELETE BUTTON CLICKED for project:', project.title);
// //             onDelete(project);
// //           }}
// //           title="Delete project"
// //           style={{backgroundColor: '#ef4444', color: 'white', padding: '8px', margin: '2px'}}
// //         >
// //           <FiTrash2 />
// //           <span style={{fontSize: '10px', marginLeft: '2px'}}>DEL</span>
// //         </button>
        
// //         <div className="action-menu">
// //           <button 
// //             onClick={() => {
// //               console.log('🎯 MORE MENU CLICKED for project:', project.title);
// //               setShowMenu(!showMenu);
// //             }}
// //             title="More actions"
// //             style={{backgroundColor: '#6b7280', color: 'white', padding: '8px', margin: '2px'}}
// //           >
// //             <FiMoreVertical />
// //           </button>
// //           {showMenu && (
// //             <div className="dropdown-menu" style={{zIndex: 1000, backgroundColor: 'white', border: '1px solid #ccc', borderRadius: '4px', padding: '5px'}}>
// //               <button onClick={() => {
// //                 console.log('🎯 DROPDOWN EDIT CLICKED for project:', project.title);
// //                 onEdit(project);
// //                 setShowMenu(false);
// //               }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
// //                 <FiEdit /> Edit Project
// //               </button>
// //               <button onClick={() => {
// //                 console.log('🎯 DROPDOWN TOGGLE FEATURED CLICKED for project:', project.title);
// //                 onToggleFeatured(project);
// //                 setShowMenu(false);
// //               }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
// //                 <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
// //               </button>
// //               <button onClick={() => {
// //                 console.log('🎯 DROPDOWN ARCHIVE CLICKED for project:', project.title);
// //                 onArchive(project);
// //                 setShowMenu(false);
// //               }} style={{display: 'block', width: '100%', padding: '5px', margin: '2px'}}>
// //                 <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
// //               </button>
// //               <button onClick={() => {
// //                 console.log('🎯 DROPDOWN DELETE CLICKED for project:', project.title);
// //                 onDelete(project);
// //                 setShowMenu(false);
// //               }} className="danger" style={{display: 'block', width: '100%', padding: '5px', margin: '2px', backgroundColor: '#ef4444', color: 'white'}}>
// //                 <FiTrash2 /> Delete Project
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // NEW: Project Edit Modal Component
// // const ProjectEditModal = ({ project, onClose, onSave }) => {
// //   const [formData, setFormData] = useState({
// //     title: project?.title || '',
// //     abstract: project?.abstract || '',
// //     specifications: project?.specifications || '',
// //     learningOutcomes: project?.learningOutcomes || '',
// //     isFeatured: project?.isFeatured || false
// //   });
// //   const [loading, setLoading] = useState(false);

// //   console.log('📝 PROJECT EDIT MODAL - Project:', project.title);

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       console.log('💾 PROJECT UPDATE - Starting with data:', formData);
// //       await authService.updateProject(project.id, formData);
// //       console.log('✅ PROJECT UPDATE - Success');
// //       toast.success('Project updated successfully');
// //       onSave();
// //     } catch (error) {
// //       console.error('❌ PROJECT UPDATE - Error:', error);
// //       toast.error('Failed to update project');
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <div className="modal-overlay">
// //       <div className="modal large">
// //         <div className="modal-header">
// //           <h2>Edit Project: {project.title}</h2>
// //           <button onClick={onClose}>×</button>
// //         </div>
        
// //         <form onSubmit={handleSubmit}>
// //           <div className="form-group">
// //             <label>Project Title</label>
// //             <input
// //               type="text"
// //               value={formData.title}
// //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// //               required
// //             />
// //           </div>

// //           <div className="modal-info">
// //             <strong>Domain:</strong> {project.subDomain?.domain?.title || 'Unknown'}<br />
// //             <strong>SubDomain:</strong> {project.subDomain?.title || 'Unknown'}<br />
// //             <span className="info-note">
// //               💡 To move this project to a different domain/subdomain, contact your administrator
// //             </span>
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
// //               {loading ? 'Updating...' : 'Update Project'}
// //             </button>
// //           </div>
// //         </form>
// //       </div>
// //     </div>
// //   );
// // };

// // export default SubDomainManagement;


// // // // src/components/domains/SubDomainManagement.js - ENHANCED WITH PROJECT VIEW/EDIT/DELETE
// // // import React, { useState, useEffect } from 'react';
// // // import { useParams, useNavigate } from 'react-router-dom';
// // // import { authService } from '../../services/authService';
// // // import { toast } from 'react-toastify';
// // // import {
// // //   FiPlus,
// // //   FiEdit,
// // //   FiTrash2,
// // //   FiChevronDown,
// // //   FiChevronRight,
// // //   FiFolder,
// // //   FiFolderPlus,
// // //   FiFileText,
// // //   FiArrowLeft,
// // //   FiMoreVertical,
// // //   FiMove,
// // //   FiTarget,
// // //   FiEye,
// // //   FiStar,
// // //   FiArchive,
// // //   FiList,
// // //   FiX
// // // } from 'react-icons/fi';

// // // const SubDomainManagement = () => {
// // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // //   const { domainId } = useParams();
// // //   const navigate = useNavigate();
  
// // //   const [domain, setDomain] = useState(null);
// // //   const [subDomains, setSubDomains] = useState([]);
// // //   const [loading, setLoading] = useState(true);
// // //   const [showAddModal, setShowAddModal] = useState(false);
// // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // //   const [selectedParent, setSelectedParent] = useState(null);
// // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // //   // Project creation state
// // //   const [showProjectModal, setShowProjectModal] = useState(false);
// // //   const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

// // //   // NEW: Project management states
// // //   const [showProjectsModal, setShowProjectsModal] = useState(false);
// // //   const [selectedSubDomainForProjectsView, setSelectedSubDomainForProjectsView] = useState(null);
// // //   const [projectsInSubDomain, setProjectsInSubDomain] = useState([]);
// // //   const [editingProject, setEditingProject] = useState(null);
// // //   const [showProjectEditModal, setShowProjectEditModal] = useState(false);
// // //   const [projectsLoading, setProjectsLoading] = useState(false);

// // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // //     domainId,
// // //     domain: domain?.title,
// // //     subDomainsCount: subDomains.length,
// // //     loading,
// // //     selectedParent: selectedParent?.title,
// // //     expandedCount: expandedNodes.size,
// // //     showProjectModal,
// // //     selectedSubDomainForProject: selectedSubDomainForProject?.title,
// // //     // NEW states
// // //     showProjectsModal,
// // //     selectedSubDomainForProjectsView: selectedSubDomainForProjectsView?.title,
// // //     projectsInSubDomainCount: projectsInSubDomain.length,
// // //     editingProject: editingProject?.title
// // //   });

// // //   useEffect(() => {
// // //     if (domainId) {
// // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // //       fetchDomainAndSubDomains();
// // //     }
// // //   }, [domainId]);

// // //   const fetchDomainAndSubDomains = async () => {
// // //     try {
// // //       setLoading(true);
      
// // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
// // //       // Get domain details
// // //       const domainsResponse = await authService.getDomains();
// // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // //       let domainData = null;
// // //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// // //       if (domains.length > 0) {
// // //         domainData = domains.find(d => d.id == domainId);
// // //       }
      
// // //       if (!domainData) {
// // //         domainData = {
// // //           id: domainId,
// // //           title: `Domain ${domainId}`,
// // //           description: 'Domain not found in list',
// // //           projectCount: 0
// // //         };
// // //       }
      
// // //       setDomain(domainData);
      
// // //       // Get subdomains
// // //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// // //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse.data);
      
// // //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// // //       setSubDomains(subDomainsData);
      
// // //       // Auto-expand first level
// // //       if (subDomainsData.length > 0) {
// // //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// // //         setExpandedNodes(new Set(firstLevelIds));
// // //       }
      
// // //       // Try hierarchy API as fallback
// // //       try {
// // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// // //           setSubDomains(hierarchyData.subDomains);
// // //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// // //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// // //           }
// // //         }
// // //       } catch (hierarchyError) {
// // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
// // //       }
      
// // //     } catch (error) {
// // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // //       toast.error('Failed to fetch domain information');
      
// // //       setDomain({
// // //         id: domainId,
// // //         title: `Domain ${domainId}`,
// // //         description: 'Error loading domain details',
// // //         projectCount: 0
// // //       });
// // //       setSubDomains([]);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const handleAddSubDomain = (parent = null) => {
// // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
// // //     setSelectedParent(parent);
// // //     setEditingSubDomain(null);
// // //     setShowAddModal(true);
// // //   };

// // //   const handleEditSubDomain = (subDomain) => {
// // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
// // //     setSelectedParent(null);
// // //     setEditingSubDomain(subDomain);
// // //     setShowAddModal(true);
// // //   };

// // //   // Handle adding project to subdomain
// // //   const handleAddProjectToSubDomain = (subDomain) => {
// // //     console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
// // //     console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
// // //     if (subDomain.children && subDomain.children.length > 0) {
// // //       toast.error('Projects can only be added to leaf sub-domains (those without children)');
// // //       return;
// // //     }
    
// // //     setSelectedSubDomainForProject(subDomain);
// // //     setShowProjectModal(true);
// // //   };

// // //   // NEW: Handle viewing projects in subdomain
// // //   const handleViewProjectsInSubDomain = async (subDomain) => {
// // //     console.log('👁️ VIEW PROJECTS - Starting for subdomain:', subDomain.title);
    
// // //     if (subDomain.children && subDomain.children.length > 0) {
// // //       toast.error('Only leaf sub-domains have projects to view');
// // //       return;
// // //     }
    
// // //     if (!subDomain.projectCount || subDomain.projectCount === 0) {
// // //       toast.info('This sub-domain has no projects yet');
// // //       return;
// // //     }
    
// // //     setSelectedSubDomainForProjectsView(subDomain);
// // //     await fetchProjectsInSubDomain(subDomain.id);
// // //     setShowProjectsModal(true);
// // //   };

// // //   // NEW: Fetch projects for a specific subdomain
// // //   const fetchProjectsInSubDomain = async (subDomainId) => {
// // //     try {
// // //       setProjectsLoading(true);
// // //       console.log('📡 FETCH PROJECTS - For subdomain:', subDomainId);
      
// // //       const response = await authService.getProjects({ 
// // //         subDomainId: subDomainId,
// // //         limit: 100 // Get all projects for this subdomain
// // //       });
      
// // //       console.log('✅ FETCH PROJECTS - Response:', response.data);
// // //       const projects = response.data?.projects || [];
// // //       setProjectsInSubDomain(projects);
      
// // //     } catch (error) {
// // //       console.error('❌ FETCH PROJECTS - Error:', error);
// // //       toast.error('Failed to fetch projects');
// // //       setProjectsInSubDomain([]);
// // //     } finally {
// // //       setProjectsLoading(false);
// // //     }
// // //   };

// // //   // NEW: Handle editing a project
// // //   const handleEditProject = (project) => {
// // //     console.log('✏️ EDIT PROJECT - Starting for:', project.title);
// // //     setEditingProject(project);
// // //     setShowProjectEditModal(true);
// // //   };

// // //   // NEW: Handle deleting a project
// // //   const handleDeleteProject = async (project) => {
// // //     console.log('🗑️ DELETE PROJECT - Requesting deletion:', project.title);
    
// // //     if (!window.confirm(`Are you sure you want to delete the project "${project.title}"?`)) {
// // //       console.log('❌ DELETE PROJECT - Cancelled by user');
// // //       return;
// // //     }

// // //     try {
// // //       console.log('📡 DELETE PROJECT - API call for:', project.id);
// // //       await authService.deleteProject(project.id);
// // //       console.log('✅ DELETE PROJECT - Success');
// // //       toast.success('Project deleted successfully');
      
// // //       // Refresh projects list and subdomain data
// // //       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
// // //       await fetchDomainAndSubDomains(); // Refresh to update project counts
      
// // //     } catch (error) {
// // //       console.error('❌ DELETE PROJECT - Error:', error);
// // //       toast.error('Failed to delete project');
// // //     }
// // //   };

// // //   // NEW: Handle archiving a project
// // //   const handleArchiveProject = async (project) => {
// // //     const isArchiving = project.isActive;
// // //     const action = isArchiving ? 'archive' : 'restore';
    
// // //     console.log('📁 ARCHIVE PROJECT - Action:', action, 'for:', project.title);
    
// // //     if (!window.confirm(`Are you sure you want to ${action} "${project.title}"?`)) {
// // //       return;
// // //     }

// // //     try {
// // //       await authService.archiveProject(project.id, {
// // //         archive: isArchiving,
// // //         reason: `${action} via subdomain management`
// // //       });
// // //       console.log('✅ ARCHIVE PROJECT - Success');
// // //       toast.success(`Project ${action}d successfully`);
      
// // //       // Refresh projects list
// // //       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
// // //     } catch (error) {
// // //       console.error('❌ ARCHIVE PROJECT - Error:', error);
// // //       toast.error(`Failed to ${action} project`);
// // //     }
// // //   };

// // //   // NEW: Handle toggling featured status
// // //   const handleToggleProjectFeatured = async (project) => {
// // //     console.log('⭐ TOGGLE FEATURED - For project:', project.title);
    
// // //     try {
// // //       await authService.updateProject(project.id, {
// // //         isFeatured: !project.isFeatured
// // //       });
// // //       console.log('✅ TOGGLE FEATURED - Success');
// // //       toast.success(`Project ${project.isFeatured ? 'removed from' : 'added to'} featured`);
      
// // //       // Refresh projects list
// // //       await fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
      
// // //     } catch (error) {
// // //       console.error('❌ TOGGLE FEATURED - Error:', error);
// // //       toast.error('Failed to update featured status');
// // //     }
// // //   };

// // //   const handleDeleteSubDomain = async (subDomain) => {
// // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // //     const hasProjects = subDomain.projectCount > 0;
    
// // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // //     if (hasChildren) {
// // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // //     }
// // //     if (hasProjects) {
// // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // //     }
    
// // //     if (!window.confirm(confirmMessage)) {
// // //       return;
// // //     }

// // //     try {
// // //       console.log('🗑️ SUBDOMAIN DELETE - Deleting:', subDomain.title);
// // //       const response = await authService.deleteSubDomain(subDomain.id);
// // //       toast.success('Sub-domain deleted successfully');
// // //       fetchDomainAndSubDomains();
// // //     } catch (error) {
// // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // //       toast.error('Failed to delete sub-domain');
// // //     }
// // //   };

// // //   const toggleExpanded = (nodeId) => {
// // //     const newExpanded = new Set(expandedNodes);
// // //     if (newExpanded.has(nodeId)) {
// // //       newExpanded.delete(nodeId);
// // //     } else {
// // //       newExpanded.add(nodeId);
// // //     }
// // //     setExpandedNodes(newExpanded);
// // //   };

// // //   if (loading) {
// // //     return (
// // //       <div className="loading-container">
// // //         <div className="loading-spinner"></div>
// // //         <p>Loading sub-domains...</p>
// // //       </div>
// // //     );
// // //   }

// // //   return (
// // //     <div className="subdomain-management">
// // //       {/* Header with Breadcrumb */}
// // //       <div className="page-header">
// // //         <div className="header-content">
// // //           <div className="breadcrumb">
// // //             <button 
// // //               className="breadcrumb-link"
// // //               onClick={() => navigate('/domains')}
// // //             >
// // //               <FiArrowLeft />
// // //               Domains
// // //             </button>
// // //             <span className="breadcrumb-separator">/</span>
// // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // //           </div>
// // //           <h1>SubDomain Management</h1>
// // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // //         </div>
// // //         <div className="header-actions">
// // //           <button 
// // //             className="primary-button" 
// // //             onClick={() => handleAddSubDomain()}
// // //           >
// // //             <FiPlus />
// // //             Add Root SubDomain
// // //           </button>
// // //         </div>
// // //       </div>

// // //       {/* Quick Guide */}
// // //       <div className="quick-guide">
// // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // //         <div className="guide-steps">
// // //           <div className="guide-step">
// // //             <span className="step-number">1</span>
// // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // //           </div>
// // //           <div className="guide-step">
// // //             <span className="step-number">2</span>
// // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // //           </div>
// // //           <div className="guide-step">
// // //             <span className="step-number">3</span>
// // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // //           </div>
// // //           <div className="guide-step">
// // //             <span className="step-number">4</span>
// // //             <span className="step-text">Click <strong>"Add Project"</strong> or <strong>"View Projects"</strong> on leaf subdomains</span>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       {/* Domain Info Card */}
// // //       {domain && (
// // //         <div className="domain-info-card">
// // //           <div className="domain-icon">
// // //             <FiFolder />
// // //           </div>
// // //           <div className="domain-details">
// // //             <h3>{domain.title}</h3>
// // //             <p>{domain.description}</p>
// // //             <div className="domain-stats">
// // //               <span className="stat-item">
// // //                 <strong>{subDomains.length}</strong> root sub-domains
// // //               </span>
// // //               <span className="stat-item">
// // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // //               </span>
// // //             </div>
// // //           </div>
// // //         </div>
// // //       )}

// // //       {/* SubDomain Tree */}
// // //       <div className="subdomain-tree-container">
// // //         <div className="tree-header">
// // //           <h2>SubDomain Hierarchy</h2>
// // //           <div className="tree-legend">
// // //             <span className="legend-item">
// // //               <FiFolder className="folder-icon" />
// // //               Has children
// // //             </span>
// // //             <span className="legend-item">
// // //               <FiTarget className="leaf-icon" />
// // //               Leaf (can have projects)
// // //             </span>
// // //             <span className="legend-item">
// // //               <FiFileText className="project-icon" />
// // //               Add Project
// // //             </span>
// // //             <span className="legend-item">
// // //               <FiList className="view-icon" />
// // //               View Projects
// // //             </span>
// // //           </div>
// // //         </div>

// // //         {subDomains.length > 0 ? (
// // //           <div className="subdomain-tree">
// // //             {subDomains.map((subDomain) => (
// // //               <SubDomainNode
// // //                 key={subDomain.id}
// // //                 subDomain={subDomain}
// // //                 level={0}
// // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // //                 onToggleExpanded={toggleExpanded}
// // //                 onEdit={handleEditSubDomain}
// // //                 onDelete={handleDeleteSubDomain}
// // //                 onAddChild={handleAddSubDomain}
// // //                 onAddProject={handleAddProjectToSubDomain}
// // //                 onViewProjects={handleViewProjectsInSubDomain} // NEW
// // //                 expandedNodes={expandedNodes}
// // //               />
// // //             ))}
// // //           </div>
// // //         ) : (
// // //           <div className="empty-tree-state">
// // //             <FiFolderPlus size={64} />
// // //             <h3>No SubDomains Yet</h3>
// // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // //             <div className="empty-state-examples">
// // //               <h4>Example Structure:</h4>
// // //               <div className="example-tree">
// // //                 <div className="example-item">📂 Machine Learning</div>
// // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // //                 <div className="example-item">🎯 Data Science</div>
// // //               </div>
// // //             </div>
// // //             <div className="empty-state-actions">
// // //               <button 
// // //                 className="primary-button large" 
// // //                 onClick={() => handleAddSubDomain()}
// // //               >
// // //                 <FiPlus />
// // //                 Create Your First SubDomain
// // //               </button>
// // //               <p className="help-text">
// // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // //               </p>
// // //             </div>
// // //           </div>
// // //         )}
// // //       </div>

// // //       {/* Add/Edit SubDomain Modal */}
// // //       {showAddModal && (
// // //         <SubDomainModal
// // //           subDomain={editingSubDomain}
// // //           parent={selectedParent}
// // //           domain={domain}
// // //           onClose={() => {
// // //             setShowAddModal(false);
// // //             setEditingSubDomain(null);
// // //             setSelectedParent(null);
// // //           }}
// // //           onSave={() => {
// // //             setShowAddModal(false);
// // //             setEditingSubDomain(null);
// // //             setSelectedParent(null);
// // //             fetchDomainAndSubDomains();
// // //           }}
// // //         />
// // //       )}

// // //       {/* Project Creation Modal */}
// // //       {showProjectModal && (
// // //         <ProjectModal
// // //           subDomain={selectedSubDomainForProject}
// // //           domain={domain}
// // //           onClose={() => {
// // //             setShowProjectModal(false);
// // //             setSelectedSubDomainForProject(null);
// // //           }}
// // //           onSave={() => {
// // //             setShowProjectModal(false);
// // //             setSelectedSubDomainForProject(null);
// // //             toast.success('Project created successfully!');
// // //             fetchDomainAndSubDomains(); // Refresh to update project counts
// // //           }}
// // //         />
// // //       )}

// // //       {/* NEW: Projects List Modal */}
// // //       {showProjectsModal && (
// // //         <ProjectsListModal
// // //           subDomain={selectedSubDomainForProjectsView}
// // //           projects={projectsInSubDomain}
// // //           loading={projectsLoading}
// // //           onClose={() => {
// // //             setShowProjectsModal(false);
// // //             setSelectedSubDomainForProjectsView(null);
// // //             setProjectsInSubDomain([]);
// // //           }}
// // //           onEdit={handleEditProject}
// // //           onDelete={handleDeleteProject}
// // //           onArchive={handleArchiveProject}
// // //           onToggleFeatured={handleToggleProjectFeatured}
// // //           onAddProject={() => {
// // //             setShowProjectsModal(false);
// // //             setSelectedSubDomainForProject(selectedSubDomainForProjectsView);
// // //             setShowProjectModal(true);
// // //           }}
// // //         />
// // //       )}

// // //       {/* NEW: Project Edit Modal */}
// // //       {showProjectEditModal && editingProject && (
// // //         <ProjectEditModal
// // //           project={editingProject}
// // //           onClose={() => {
// // //             setShowProjectEditModal(false);
// // //             setEditingProject(null);
// // //           }}
// // //           onSave={() => {
// // //             setShowProjectEditModal(false);
// // //             setEditingProject(null);
// // //             // Refresh projects list and subdomain data
// // //             fetchProjectsInSubDomain(selectedSubDomainForProjectsView.id);
// // //             fetchDomainAndSubDomains();
// // //           }}
// // //         />
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // // UPDATED SubDomain Node Component with View Projects functionality
// // // const SubDomainNode = ({ 
// // //   subDomain, 
// // //   level, 
// // //   isExpanded, 
// // //   onToggleExpanded, 
// // //   onEdit, 
// // //   onDelete, 
// // //   onAddChild,
// // //   onAddProject,
// // //   onViewProjects, // NEW
// // //   expandedNodes 
// // // }) => {
// // //   const [showMenu, setShowMenu] = useState(false);
// // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // //   const isLeaf = !hasChildren;
// // //   const hasProjects = subDomain.projectCount > 0;

// // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // //     title: subDomain.title,
// // //     level,
// // //     hasChildren,
// // //     isLeaf,
// // //     isExpanded,
// // //     projectCount: subDomain.projectCount,
// // //     hasProjects
// // //   });

// // //   return (
// // //     <div className={`subdomain-node level-${level}`}>
// // //       <div className="node-content">
// // //         <div className="node-main">
// // //           {hasChildren ? (
// // //             <button 
// // //               className="expand-button"
// // //               onClick={() => onToggleExpanded(subDomain.id)}
// // //             >
// // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // //             </button>
// // //           ) : (
// // //             <div className="expand-placeholder" />
// // //           )}
          
// // //           <div className="node-icon">
// // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // //           </div>
          
// // //           <div className="node-info">
// // //             <h4 className="node-title">{subDomain.title}</h4>
// // //             <p className="node-description">{subDomain.description}</p>
// // //             <div className="node-stats">
// // //               {hasChildren && (
// // //                 <span className="stat-badge">
// // //                   {subDomain.children.length} sub-domains
// // //                 </span>
// // //               )}
// // //               {hasProjects && (
// // //                 <span className="stat-badge projects">
// // //                   {subDomain.projectCount} projects
// // //                 </span>
// // //               )}
// // //               {isLeaf && !hasProjects && (
// // //                 <span className="stat-badge leaf">
// // //                   Can have projects
// // //                 </span>
// // //               )}
// // //             </div>
// // //           </div>
// // //         </div>
        
// // //         <div className="node-actions">
// // //           {/* NEW: View Projects button for leaf nodes with projects */}
// // //           {isLeaf && hasProjects && (
// // //             <button 
// // //               className="action-button view" 
// // //               onClick={() => onViewProjects(subDomain)}
// // //               title={`View ${subDomain.projectCount} project(s) in "${subDomain.title}"`}
// // //             >
// // //               <FiList />
// // //             </button>
// // //           )}
          
// // //           {isLeaf && (
// // //             <button 
// // //               className="action-button project" 
// // //               onClick={() => onAddProject(subDomain)}
// // //               title={`Add project to "${subDomain.title}"`}
// // //             >
// // //               <FiFileText />
// // //             </button>
// // //           )}
          
// // //           <button 
// // //             className="action-button add" 
// // //             onClick={() => onAddChild(subDomain)}
// // //             title={`Add child subdomain under "${subDomain.title}"`}
// // //           >
// // //             <FiPlus />
// // //           </button>
          
// // //           <div className="action-menu">
// // //             <button 
// // //               onClick={() => setShowMenu(!showMenu)}
// // //               title="More actions"
// // //             >
// // //               <FiMoreVertical />
// // //             </button>
// // //             {showMenu && (
// // //               <div className="dropdown-menu">
// // //                 {/* NEW: View Projects option */}
// // //                 {isLeaf && hasProjects && (
// // //                   <button 
// // //                     onClick={() => {
// // //                       onViewProjects(subDomain);
// // //                       setShowMenu(false);
// // //                     }}
// // //                     className="primary-option"
// // //                   >
// // //                     <FiList /> View Projects ({subDomain.projectCount})
// // //                   </button>
// // //                 )}
// // //                 {isLeaf && (
// // //                   <button 
// // //                     onClick={() => {
// // //                       onAddProject(subDomain);
// // //                       setShowMenu(false);
// // //                     }}
// // //                     className="primary-option"
// // //                   >
// // //                     <FiFileText /> Add Project
// // //                   </button>
// // //                 )}
// // //                 <button onClick={() => {
// // //                   onEdit(subDomain);
// // //                   setShowMenu(false);
// // //                 }}>
// // //                   <FiEdit /> Edit SubDomain
// // //                 </button>
// // //                 <button onClick={() => {
// // //                   onAddChild(subDomain);
// // //                   setShowMenu(false);
// // //                 }}>
// // //                   <FiPlus /> Add Child SubDomain
// // //                 </button>
// // //                 <button onClick={() => {
// // //                   onDelete(subDomain);
// // //                   setShowMenu(false);
// // //                 }} className="danger">
// // //                   <FiTrash2 /> Delete SubDomain
// // //                 </button>
// // //               </div>
// // //             )}
// // //           </div>
// // //         </div>
// // //       </div>
      
// // //       {/* Children */}
// // //       {hasChildren && isExpanded && (
// // //         <div className="node-children">
// // //           {subDomain.children.map((child) => (
// // //             <SubDomainNode
// // //               key={child.id}
// // //               subDomain={child}
// // //               level={level + 1}
// // //               isExpanded={expandedNodes.has(child.id)}
// // //               onToggleExpanded={onToggleExpanded}
// // //               onEdit={onEdit}
// // //               onDelete={onDelete}
// // //               onAddChild={onAddChild}
// // //               onAddProject={onAddProject}
// // //               onViewProjects={onViewProjects} // NEW
// // //               expandedNodes={expandedNodes}
// // //             />
// // //           ))}
// // //         </div>
// // //       )}
// // //     </div>
// // //   );
// // // };

// // // // SubDomain Modal Component (unchanged)
// // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // //   const [formData, setFormData] = useState({
// // //     title: subDomain?.title || '',
// // //     description: subDomain?.description || ''
// // //   });
// // //   const [loading, setLoading] = useState(false);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);

// // //     try {
// // //       const requestData = {
// // //         title: formData.title.trim(),
// // //         description: formData.description.trim(),
// // //         domainId: domain.id,
// // //         parentId: parent?.id || null
// // //       };

// // //       console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

// // //       if (subDomain) {
// // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // //         toast.success('Sub-domain updated successfully');
// // //       } else {
// // //         const response = await authService.createSubDomain(requestData);
// // //         toast.success('Sub-domain created successfully');
// // //       }

// // //       onSave();
// // //     } catch (error) {
// // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // //       const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
// // //       toast.error(errorMessage);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   const getModalTitle = () => {
// // //     if (subDomain) {
// // //       return `Edit SubDomain: ${subDomain.title}`;
// // //     }
// // //     if (parent) {
// // //       return `Add SubDomain under: ${parent.title}`;
// // //     }
// // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // //   };

// // //   return (
// // //     <div className="modal-overlay">
// // //       <div className="modal">
// // //         <div className="modal-header">
// // //           <h2>{getModalTitle()}</h2>
// // //           <button onClick={onClose}>×</button>
// // //         </div>
        
// // //         <form onSubmit={handleSubmit}>
// // //           <div className="form-group">
// // //             <label>SubDomain Title *</label>
// // //             <input
// // //               type="text"
// // //               value={formData.title}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // //               placeholder="e.g., Machine Learning, Deep Learning"
// // //               required
// // //               minLength={3}
// // //               maxLength={100}
// // //             />
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Description (Optional)</label>
// // //             <textarea
// // //               value={formData.description}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // //               rows={3}
// // //               placeholder="Describe what this sub-domain covers..."
// // //               maxLength={500}
// // //             />
// // //           </div>
          
// // //           <div className="modal-info">
// // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // //             {parent && (
// // //               <>
// // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // //               </>
// // //             )}
// // //             <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
// // //           </div>
          
// // //           <div className="modal-actions">
// // //             <button type="button" onClick={onClose} disabled={loading}>
// // //               Cancel
// // //             </button>
// // //             <button 
// // //               type="submit" 
// // //               className="primary-button" 
// // //               disabled={loading || !formData.title.trim()}
// // //             >
// // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // // Project Creation Modal Component (unchanged)
// // // const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
// // //   const [formData, setFormData] = useState({
// // //     title: '',
// // //     abstract: '',
// // //     specifications: '',
// // //     learningOutcomes: '',
// // //     subDomainId: subDomain?.id || '',
// // //     isFeatured: false
// // //   });
// // //   const [loading, setLoading] = useState(false);

// // //   console.log('📝 PROJECT MODAL - Props:', {
// // //     subDomain: subDomain?.title,
// // //     domain: domain?.title,
// // //     formData
// // //   });

// // //   // Slug generation function
// // //   const generateSlug = (title) => {
// // //     return title
// // //       .toLowerCase()
// // //       .trim()
// // //       .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
// // //       .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
// // //       .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
// // //   };

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);

// // //     try {
// // //       // Don't send slug - let backend auto-generate it
// // //       const projectData = {
// // //         title: formData.title.trim(),
// // //         abstract: formData.abstract.trim(),
// // //         specifications: formData.specifications.trim(),
// // //         learningOutcomes: formData.learningOutcomes.trim(),
// // //         subDomainId: formData.subDomainId,
// // //         isFeatured: formData.isFeatured
// // //       };

// // //       console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
// // //       console.log('🔗 PROJECT SAVE - Backend will auto-generate slug from title:', formData.title);
      
// // //       const response = await authService.createProject(projectData);
// // //       console.log('✅ PROJECT CREATE - Response:', response.data);
      
// // //       onSave();
// // //     } catch (error) {
// // //       console.error('❌ PROJECT SAVE - Error:', error);
// // //       console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
      
// // //       // Show more specific error message if available
// // //       const errorMessage = error.response?.data?.message || 'Failed to create project';
// // //       toast.error(errorMessage);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="modal-overlay">
// // //       <div className="modal large">
// // //         <div className="modal-header">
// // //           <h2>Add Project to: {subDomain?.title}</h2>
// // //           <button onClick={onClose}>×</button>
// // //         </div>
        
// // //         <form onSubmit={handleSubmit}>
// // //           <div className="form-group">
// // //             <label>Project Title *</label>
// // //             <input
// // //               type="text"
// // //               value={formData.title}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // //               placeholder="Enter project title..."
// // //               required
// // //               minLength={3}
// // //               maxLength={200}
// // //             />
// // //             {/* Show slug preview (for user reference only) */}
// // //             {formData.title && (
// // //               <div className="slug-preview">
// // //                 <small>Expected URL Slug: <code>{generateSlug(formData.title)}</code> <em>(auto-generated by backend)</em></small>
// // //               </div>
// // //             )}
// // //           </div>
          
// // //           <div className="modal-info">
// // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // //             <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
// // //             <span className="info-note">
// // //               <FiTarget /> This is a leaf subdomain - perfect for projects!
// // //             </span>
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Abstract *</label>
// // //             <textarea
// // //               value={formData.abstract}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// // //               rows={4}
// // //               placeholder="Brief description of the project..."
// // //               required
// // //               minLength={10}
// // //               maxLength={1000}
// // //             />
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Specifications *</label>
// // //             <textarea
// // //               value={formData.specifications}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// // //               rows={6}
// // //               placeholder="Technical specifications and requirements..."
// // //               required
// // //               minLength={10}
// // //               maxLength={5000}
// // //             />
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Learning Outcomes *</label>
// // //             <textarea
// // //               value={formData.learningOutcomes}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// // //               rows={4}
// // //               placeholder="What will students learn from this project..."
// // //               required
// // //               minLength={10}
// // //               maxLength={2000}
// // //             />
// // //           </div>
          
// // //           <div className="form-group checkbox">
// // //             <label>
// // //               <input
// // //                 type="checkbox"
// // //                 checked={formData.isFeatured}
// // //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// // //               />
// // //               <FiTarget />
// // //               Featured Project
// // //             </label>
// // //           </div>
          
// // //           <div className="modal-actions">
// // //             <button type="button" onClick={onClose} disabled={loading}>
// // //               Cancel
// // //             </button>
// // //             <button 
// // //               type="submit" 
// // //               className="primary-button" 
// // //               disabled={loading || !formData.title || !formData.abstract || !formData.specifications || !formData.learningOutcomes}
// // //             >
// // //               {loading ? 'Creating...' : 'Create Project'}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // // NEW: Projects List Modal Component
// // // const ProjectsListModal = ({ 
// // //   subDomain, 
// // //   projects, 
// // //   loading, 
// // //   onClose, 
// // //   onEdit, 
// // //   onDelete, 
// // //   onArchive, 
// // //   onToggleFeatured,
// // //   onAddProject 
// // // }) => {
// // //   return (
// // //     <div className="modal-overlay">
// // //       <div className="modal large">
// // //         <div className="modal-header">
// // //           <h2>Projects in: {subDomain?.title}</h2>
// // //           <button onClick={onClose}>
// // //             <FiX />
// // //           </button>
// // //         </div>
        
// // //         <div className="projects-list-content">
// // //           <div className="projects-list-header">
// // //             <div className="list-info">
// // //               <p><strong>SubDomain:</strong> {subDomain?.title}</p>
// // //               <p><strong>Total Projects:</strong> {projects.length}</p>
// // //             </div>
// // //             <button 
// // //               className="primary-button" 
// // //               onClick={onAddProject}
// // //             >
// // //               <FiPlus />
// // //               Add New Project
// // //             </button>
// // //           </div>
          
// // //           {loading ? (
// // //             <div className="loading-container">
// // //               <div className="loading-spinner"></div>
// // //               <p>Loading projects...</p>
// // //             </div>
// // //           ) : projects.length > 0 ? (
// // //             <div className="projects-list">
// // //               {projects.map((project) => (
// // //                 <ProjectListItem
// // //                   key={project.id}
// // //                   project={project}
// // //                   onEdit={onEdit}
// // //                   onDelete={onDelete}
// // //                   onArchive={onArchive}
// // //                   onToggleFeatured={onToggleFeatured}
// // //                 />
// // //               ))}
// // //             </div>
// // //           ) : (
// // //             <div className="empty-projects-state">
// // //               <FiFileText size={48} />
// // //               <h3>No Projects Yet</h3>
// // //               <p>This subdomain doesn't have any projects yet.</p>
// // //               <button 
// // //                 className="primary-button" 
// // //                 onClick={onAddProject}
// // //               >
// // //                 <FiPlus />
// // //                 Add First Project
// // //               </button>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // // NEW: Project List Item Component
// // // const ProjectListItem = ({ 
// // //   project, 
// // //   onEdit, 
// // //   onDelete, 
// // //   onArchive, 
// // //   onToggleFeatured 
// // // }) => {
// // //   const [showMenu, setShowMenu] = useState(false);

// // //   return (
// // //     <div className={`project-list-item ${!project.isActive ? 'archived' : ''}`}>
// // //       <div className="project-info">
// // //         <div className="project-title-section">
// // //           <h4 className="project-title">{project.title}</h4>
// // //           <div className="project-badges">
// // //             {project.isFeatured && (
// // //               <span className="badge featured">
// // //                 <FiStar /> Featured
// // //               </span>
// // //             )}
// // //             {!project.isActive && (
// // //               <span className="badge archived">Archived</span>
// // //             )}
// // //           </div>
// // //         </div>
// // //         <p className="project-abstract">
// // //           {project.abstract?.substring(0, 150)}...
// // //         </p>
// // //         <div className="project-stats">
// // //           <span className="stat">
// // //             <FiEye /> {project.viewCount || 0} views
// // //           </span>
// // //           <span className="stat">
// // //             Created: {new Date(project.createdAt).toLocaleDateString()}
// // //           </span>
// // //           <span className="stat">
// // //             Updated: {new Date(project.updatedAt).toLocaleDateString()}
// // //           </span>
// // //         </div>
// // //       </div>
      
// // //       <div className="project-actions">
// // //         <button 
// // //           className="action-button primary" 
// // //           onClick={() => onEdit(project)}
// // //           title="Edit project"
// // //         >
// // //           <FiEdit />
// // //         </button>
        
// // //         <div className="action-menu">
// // //           <button 
// // //             onClick={() => setShowMenu(!showMenu)}
// // //             title="More actions"
// // //           >
// // //             <FiMoreVertical />
// // //           </button>
// // //           {showMenu && (
// // //             <div className="dropdown-menu">
// // //               <button onClick={() => {
// // //                 onEdit(project);
// // //                 setShowMenu(false);
// // //               }}>
// // //                 <FiEdit /> Edit Project
// // //               </button>
// // //               <button onClick={() => {
// // //                 onToggleFeatured(project);
// // //                 setShowMenu(false);
// // //               }}>
// // //                 <FiStar /> {project.isFeatured ? 'Remove Featured' : 'Make Featured'}
// // //               </button>
// // //               <button onClick={() => {
// // //                 onArchive(project);
// // //                 setShowMenu(false);
// // //               }}>
// // //                 <FiArchive /> {project.isActive ? 'Archive' : 'Restore'}
// // //               </button>
// // //               <button onClick={() => {
// // //                 onDelete(project);
// // //                 setShowMenu(false);
// // //               }} className="danger">
// // //                 <FiTrash2 /> Delete Project
// // //               </button>
// // //             </div>
// // //           )}
// // //         </div>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // // NEW: Project Edit Modal Component
// // // const ProjectEditModal = ({ project, onClose, onSave }) => {
// // //   const [formData, setFormData] = useState({
// // //     title: project?.title || '',
// // //     abstract: project?.abstract || '',
// // //     specifications: project?.specifications || '',
// // //     learningOutcomes: project?.learningOutcomes || '',
// // //     isFeatured: project?.isFeatured || false
// // //   });
// // //   const [loading, setLoading] = useState(false);

// // //   console.log('📝 PROJECT EDIT MODAL - Project:', project.title);

// // //   const handleSubmit = async (e) => {
// // //     e.preventDefault();
// // //     setLoading(true);

// // //     try {
// // //       console.log('💾 PROJECT UPDATE - Starting with data:', formData);
// // //       await authService.updateProject(project.id, formData);
// // //       console.log('✅ PROJECT UPDATE - Success');
// // //       toast.success('Project updated successfully');
// // //       onSave();
// // //     } catch (error) {
// // //       console.error('❌ PROJECT UPDATE - Error:', error);
// // //       toast.error('Failed to update project');
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   return (
// // //     <div className="modal-overlay">
// // //       <div className="modal large">
// // //         <div className="modal-header">
// // //           <h2>Edit Project: {project.title}</h2>
// // //           <button onClick={onClose}>×</button>
// // //         </div>
        
// // //         <form onSubmit={handleSubmit}>
// // //           <div className="form-group">
// // //             <label>Project Title</label>
// // //             <input
// // //               type="text"
// // //               value={formData.title}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // //               required
// // //             />
// // //           </div>

// // //           <div className="modal-info">
// // //             <strong>Domain:</strong> {project.subDomain?.domain?.title || 'Unknown'}<br />
// // //             <strong>SubDomain:</strong> {project.subDomain?.title || 'Unknown'}<br />
// // //             <span className="info-note">
// // //               💡 To move this project to a different domain/subdomain, contact your administrator
// // //             </span>
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Abstract</label>
// // //             <textarea
// // //               value={formData.abstract}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// // //               rows={4}
// // //               required
// // //             />
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Specifications</label>
// // //             <textarea
// // //               value={formData.specifications}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// // //               rows={6}
// // //               required
// // //             />
// // //           </div>
          
// // //           <div className="form-group">
// // //             <label>Learning Outcomes</label>
// // //             <textarea
// // //               value={formData.learningOutcomes}
// // //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// // //               rows={4}
// // //               required
// // //             />
// // //           </div>
          
// // //           <div className="form-group checkbox">
// // //             <label>
// // //               <input
// // //                 type="checkbox"
// // //                 checked={formData.isFeatured}
// // //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// // //               />
// // //               Featured Project
// // //             </label>
// // //           </div>
          
// // //           <div className="modal-actions">
// // //             <button type="button" onClick={onClose} disabled={loading}>
// // //               Cancel
// // //             </button>
// // //             <button type="submit" className="primary-button" disabled={loading}>
// // //               {loading ? 'Updating...' : 'Update Project'}
// // //             </button>
// // //           </div>
// // //         </form>
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default SubDomainManagement;


// // // // // src/components/domains/SubDomainManagement.js - UPDATED WITH SLUG GENERATION
// // // // import React, { useState, useEffect } from 'react';
// // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // import { authService } from '../../services/authService';
// // // // import { toast } from 'react-toastify';
// // // // import {
// // // //   FiPlus,
// // // //   FiEdit,
// // // //   FiTrash2,
// // // //   FiChevronDown,
// // // //   FiChevronRight,
// // // //   FiFolder,
// // // //   FiFolderPlus,
// // // //   FiFileText,
// // // //   FiArrowLeft,
// // // //   FiMoreVertical,
// // // //   FiMove,
// // // //   FiTarget
// // // // } from 'react-icons/fi';

// // // // const SubDomainManagement = () => {
// // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // //   const { domainId } = useParams();
// // // //   const navigate = useNavigate();
  
// // // //   const [domain, setDomain] = useState(null);
// // // //   const [subDomains, setSubDomains] = useState([]);
// // // //   const [loading, setLoading] = useState(true);
// // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // //   // NEW: Project creation state
// // // //   const [showProjectModal, setShowProjectModal] = useState(false);
// // // //   const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

// // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // //     domainId,
// // // //     domain: domain?.title,
// // // //     subDomainsCount: subDomains.length,
// // // //     loading,
// // // //     selectedParent: selectedParent?.title,
// // // //     expandedCount: expandedNodes.size,
// // // //     showProjectModal,
// // // //     selectedSubDomainForProject: selectedSubDomainForProject?.title
// // // //   });

// // // //   useEffect(() => {
// // // //     if (domainId) {
// // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // //       fetchDomainAndSubDomains();
// // // //     }
// // // //   }, [domainId]);

// // // //   const fetchDomainAndSubDomains = async () => {
// // // //     try {
// // // //       setLoading(true);
      
// // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
// // // //       // Get domain details
// // // //       const domainsResponse = await authService.getDomains();
// // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // //       let domainData = null;
// // // //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// // // //       if (domains.length > 0) {
// // // //         domainData = domains.find(d => d.id == domainId);
// // // //       }
      
// // // //       if (!domainData) {
// // // //         domainData = {
// // // //           id: domainId,
// // // //           title: `Domain ${domainId}`,
// // // //           description: 'Domain not found in list',
// // // //           projectCount: 0
// // // //         };
// // // //       }
      
// // // //       setDomain(domainData);
      
// // // //       // Get subdomains
// // // //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// // // //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse.data);
      
// // // //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// // // //       setSubDomains(subDomainsData);
      
// // // //       // Auto-expand first level
// // // //       if (subDomainsData.length > 0) {
// // // //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// // // //         setExpandedNodes(new Set(firstLevelIds));
// // // //       }
      
// // // //       // Try hierarchy API as fallback
// // // //       try {
// // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// // // //           setSubDomains(hierarchyData.subDomains);
// // // //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// // // //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// // // //           }
// // // //         }
// // // //       } catch (hierarchyError) {
// // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
// // // //       }
      
// // // //     } catch (error) {
// // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // //       toast.error('Failed to fetch domain information');
      
// // // //       setDomain({
// // // //         id: domainId,
// // // //         title: `Domain ${domainId}`,
// // // //         description: 'Error loading domain details',
// // // //         projectCount: 0
// // // //       });
// // // //       setSubDomains([]);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const handleAddSubDomain = (parent = null) => {
// // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
// // // //     setSelectedParent(parent);
// // // //     setEditingSubDomain(null);
// // // //     setShowAddModal(true);
// // // //   };

// // // //   const handleEditSubDomain = (subDomain) => {
// // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
// // // //     setSelectedParent(null);
// // // //     setEditingSubDomain(subDomain);
// // // //     setShowAddModal(true);
// // // //   };

// // // //   // NEW: Handle adding project to subdomain
// // // //   const handleAddProjectToSubDomain = (subDomain) => {
// // // //     console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
// // // //     console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
// // // //     if (subDomain.children && subDomain.children.length > 0) {
// // // //       toast.error('Projects can only be added to leaf sub-domains (those without children)');
// // // //       return;
// // // //     }
    
// // // //     setSelectedSubDomainForProject(subDomain);
// // // //     setShowProjectModal(true);
// // // //   };

// // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // //     if (hasChildren) {
// // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // //     }
// // // //     if (hasProjects) {
// // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // //     }
    
// // // //     if (!window.confirm(confirmMessage)) {
// // // //       return;
// // // //     }

// // // //     try {
// // // //       console.log('🗑️ SUBDOMAIN DELETE - Deleting:', subDomain.title);
// // // //       const response = await authService.deleteSubDomain(subDomain.id);
// // // //       toast.success('Sub-domain deleted successfully');
// // // //       fetchDomainAndSubDomains();
// // // //     } catch (error) {
// // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // //       toast.error('Failed to delete sub-domain');
// // // //     }
// // // //   };

// // // //   const toggleExpanded = (nodeId) => {
// // // //     const newExpanded = new Set(expandedNodes);
// // // //     if (newExpanded.has(nodeId)) {
// // // //       newExpanded.delete(nodeId);
// // // //     } else {
// // // //       newExpanded.add(nodeId);
// // // //     }
// // // //     setExpandedNodes(newExpanded);
// // // //   };

// // // //   if (loading) {
// // // //     return (
// // // //       <div className="loading-container">
// // // //         <div className="loading-spinner"></div>
// // // //         <p>Loading sub-domains...</p>
// // // //       </div>
// // // //     );
// // // //   }

// // // //   return (
// // // //     <div className="subdomain-management">
// // // //       {/* Header with Breadcrumb */}
// // // //       <div className="page-header">
// // // //         <div className="header-content">
// // // //           <div className="breadcrumb">
// // // //             <button 
// // // //               className="breadcrumb-link"
// // // //               onClick={() => navigate('/domains')}
// // // //             >
// // // //               <FiArrowLeft />
// // // //               Domains
// // // //             </button>
// // // //             <span className="breadcrumb-separator">/</span>
// // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // //           </div>
// // // //           <h1>SubDomain Management</h1>
// // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // //         </div>
// // // //         <div className="header-actions">
// // // //           <button 
// // // //             className="primary-button" 
// // // //             onClick={() => handleAddSubDomain()}
// // // //           >
// // // //             <FiPlus />
// // // //             Add Root SubDomain
// // // //           </button>
// // // //         </div>
// // // //       </div>

// // // //       {/* Quick Guide */}
// // // //       <div className="quick-guide">
// // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // //         <div className="guide-steps">
// // // //           <div className="guide-step">
// // // //             <span className="step-number">1</span>
// // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // //           </div>
// // // //           <div className="guide-step">
// // // //             <span className="step-number">2</span>
// // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // //           </div>
// // // //           <div className="guide-step">
// // // //             <span className="step-number">3</span>
// // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // //           </div>
// // // //           <div className="guide-step">
// // // //             <span className="step-number">4</span>
// // // //             <span className="step-text">Click <strong>"Add Project"</strong> on leaf subdomains to create new projects</span>
// // // //           </div>
// // // //         </div>
// // // //       </div>

// // // //       {/* Domain Info Card */}
// // // //       {domain && (
// // // //         <div className="domain-info-card">
// // // //           <div className="domain-icon">
// // // //             <FiFolder />
// // // //           </div>
// // // //           <div className="domain-details">
// // // //             <h3>{domain.title}</h3>
// // // //             <p>{domain.description}</p>
// // // //             <div className="domain-stats">
// // // //               <span className="stat-item">
// // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // //               </span>
// // // //               <span className="stat-item">
// // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // //               </span>
// // // //             </div>
// // // //           </div>
// // // //         </div>
// // // //       )}

// // // //       {/* SubDomain Tree */}
// // // //       <div className="subdomain-tree-container">
// // // //         <div className="tree-header">
// // // //           <h2>SubDomain Hierarchy</h2>
// // // //           <div className="tree-legend">
// // // //             <span className="legend-item">
// // // //               <FiFolder className="folder-icon" />
// // // //               Has children
// // // //             </span>
// // // //             <span className="legend-item">
// // // //               <FiTarget className="leaf-icon" />
// // // //               Leaf (can have projects)
// // // //             </span>
// // // //             <span className="legend-item">
// // // //               <FiFileText className="project-icon" />
// // // //               Add Project
// // // //             </span>
// // // //           </div>
// // // //         </div>

// // // //         {subDomains.length > 0 ? (
// // // //           <div className="subdomain-tree">
// // // //             {subDomains.map((subDomain) => (
// // // //               <SubDomainNode
// // // //                 key={subDomain.id}
// // // //                 subDomain={subDomain}
// // // //                 level={0}
// // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // //                 onToggleExpanded={toggleExpanded}
// // // //                 onEdit={handleEditSubDomain}
// // // //                 onDelete={handleDeleteSubDomain}
// // // //                 onAddChild={handleAddSubDomain}
// // // //                 onAddProject={handleAddProjectToSubDomain}
// // // //                 expandedNodes={expandedNodes}
// // // //               />
// // // //             ))}
// // // //           </div>
// // // //         ) : (
// // // //           <div className="empty-tree-state">
// // // //             <FiFolderPlus size={64} />
// // // //             <h3>No SubDomains Yet</h3>
// // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // //             <div className="empty-state-examples">
// // // //               <h4>Example Structure:</h4>
// // // //               <div className="example-tree">
// // // //                 <div className="example-item">📂 Machine Learning</div>
// // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // //                 <div className="example-item">🎯 Data Science</div>
// // // //               </div>
// // // //             </div>
// // // //             <div className="empty-state-actions">
// // // //               <button 
// // // //                 className="primary-button large" 
// // // //                 onClick={() => handleAddSubDomain()}
// // // //               >
// // // //                 <FiPlus />
// // // //                 Create Your First SubDomain
// // // //               </button>
// // // //               <p className="help-text">
// // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // //               </p>
// // // //             </div>
// // // //           </div>
// // // //         )}
// // // //       </div>

// // // //       {/* Add/Edit SubDomain Modal */}
// // // //       {showAddModal && (
// // // //         <SubDomainModal
// // // //           subDomain={editingSubDomain}
// // // //           parent={selectedParent}
// // // //           domain={domain}
// // // //           onClose={() => {
// // // //             setShowAddModal(false);
// // // //             setEditingSubDomain(null);
// // // //             setSelectedParent(null);
// // // //           }}
// // // //           onSave={() => {
// // // //             setShowAddModal(false);
// // // //             setEditingSubDomain(null);
// // // //             setSelectedParent(null);
// // // //             fetchDomainAndSubDomains();
// // // //           }}
// // // //         />
// // // //       )}

// // // //       {/* NEW: Project Creation Modal with SLUG GENERATION */}
// // // //       {showProjectModal && (
// // // //         <ProjectModal
// // // //           subDomain={selectedSubDomainForProject}
// // // //           domain={domain}
// // // //           onClose={() => {
// // // //             setShowProjectModal(false);
// // // //             setSelectedSubDomainForProject(null);
// // // //           }}
// // // //           onSave={() => {
// // // //             setShowProjectModal(false);
// // // //             setSelectedSubDomainForProject(null);
// // // //             toast.success('Project created successfully!');
// // // //             fetchDomainAndSubDomains(); // Refresh to update project counts
// // // //           }}
// // // //         />
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // // UPDATED SubDomain Node Component
// // // // const SubDomainNode = ({ 
// // // //   subDomain, 
// // // //   level, 
// // // //   isExpanded, 
// // // //   onToggleExpanded, 
// // // //   onEdit, 
// // // //   onDelete, 
// // // //   onAddChild,
// // // //   onAddProject,
// // // //   expandedNodes 
// // // // }) => {
// // // //   const [showMenu, setShowMenu] = useState(false);
// // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // //   const isLeaf = !hasChildren;

// // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // //     title: subDomain.title,
// // // //     level,
// // // //     hasChildren,
// // // //     isLeaf,
// // // //     isExpanded,
// // // //     projectCount: subDomain.projectCount
// // // //   });

// // // //   return (
// // // //     <div className={`subdomain-node level-${level}`}>
// // // //       <div className="node-content">
// // // //         <div className="node-main">
// // // //           {hasChildren ? (
// // // //             <button 
// // // //               className="expand-button"
// // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // //             >
// // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // //             </button>
// // // //           ) : (
// // // //             <div className="expand-placeholder" />
// // // //           )}
          
// // // //           <div className="node-icon">
// // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // //           </div>
          
// // // //           <div className="node-info">
// // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // //             <p className="node-description">{subDomain.description}</p>
// // // //             <div className="node-stats">
// // // //               {hasChildren && (
// // // //                 <span className="stat-badge">
// // // //                   {subDomain.children.length} sub-domains
// // // //                 </span>
// // // //               )}
// // // //               {subDomain.projectCount > 0 && (
// // // //                 <span className="stat-badge projects">
// // // //                   {subDomain.projectCount} projects
// // // //                 </span>
// // // //               )}
// // // //               {isLeaf && (
// // // //                 <span className="stat-badge leaf">
// // // //                   Can have projects
// // // //                 </span>
// // // //               )}
// // // //             </div>
// // // //           </div>
// // // //         </div>
        
// // // //         <div className="node-actions">
// // // //           {isLeaf && (
// // // //             <button 
// // // //               className="action-button project" 
// // // //               onClick={() => onAddProject(subDomain)}
// // // //               title={`Add project to "${subDomain.title}"`}
// // // //             >
// // // //               <FiFileText />
// // // //             </button>
// // // //           )}
          
// // // //           <button 
// // // //             className="action-button add" 
// // // //             onClick={() => onAddChild(subDomain)}
// // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // //           >
// // // //             <FiPlus />
// // // //           </button>
          
// // // //           <div className="action-menu">
// // // //             <button 
// // // //               onClick={() => setShowMenu(!showMenu)}
// // // //               title="More actions"
// // // //             >
// // // //               <FiMoreVertical />
// // // //             </button>
// // // //             {showMenu && (
// // // //               <div className="dropdown-menu">
// // // //                 {isLeaf && (
// // // //                   <button 
// // // //                     onClick={() => {
// // // //                       onAddProject(subDomain);
// // // //                       setShowMenu(false);
// // // //                     }}
// // // //                     className="primary-option"
// // // //                   >
// // // //                     <FiFileText /> Add Project
// // // //                   </button>
// // // //                 )}
// // // //                 <button onClick={() => {
// // // //                   onEdit(subDomain);
// // // //                   setShowMenu(false);
// // // //                 }}>
// // // //                   <FiEdit /> Edit SubDomain
// // // //                 </button>
// // // //                 <button onClick={() => {
// // // //                   onAddChild(subDomain);
// // // //                   setShowMenu(false);
// // // //                 }}>
// // // //                   <FiPlus /> Add Child SubDomain
// // // //                 </button>
// // // //                 <button onClick={() => {
// // // //                   onDelete(subDomain);
// // // //                   setShowMenu(false);
// // // //                 }} className="danger">
// // // //                   <FiTrash2 /> Delete SubDomain
// // // //                 </button>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       </div>
      
// // // //       {/* Children */}
// // // //       {hasChildren && isExpanded && (
// // // //         <div className="node-children">
// // // //           {subDomain.children.map((child) => (
// // // //             <SubDomainNode
// // // //               key={child.id}
// // // //               subDomain={child}
// // // //               level={level + 1}
// // // //               isExpanded={expandedNodes.has(child.id)}
// // // //               onToggleExpanded={onToggleExpanded}
// // // //               onEdit={onEdit}
// // // //               onDelete={onDelete}
// // // //               onAddChild={onAddChild}
// // // //               onAddProject={onAddProject}
// // // //               expandedNodes={expandedNodes}
// // // //             />
// // // //           ))}
// // // //         </div>
// // // //       )}
// // // //     </div>
// // // //   );
// // // // };

// // // // // SubDomain Modal Component (unchanged)
// // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // //   const [formData, setFormData] = useState({
// // // //     title: subDomain?.title || '',
// // // //     description: subDomain?.description || ''
// // // //   });
// // // //   const [loading, setLoading] = useState(false);

// // // //   const handleSubmit = async (e) => {
// // // //     e.preventDefault();
// // // //     setLoading(true);

// // // //     try {
// // // //       const requestData = {
// // // //         title: formData.title.trim(),
// // // //         description: formData.description.trim(),
// // // //         domainId: domain.id,
// // // //         parentId: parent?.id || null
// // // //       };

// // // //       console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

// // // //       if (subDomain) {
// // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // //         toast.success('Sub-domain updated successfully');
// // // //       } else {
// // // //         const response = await authService.createSubDomain(requestData);
// // // //         toast.success('Sub-domain created successfully');
// // // //       }

// // // //       onSave();
// // // //     } catch (error) {
// // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // //       const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
// // // //       toast.error(errorMessage);
// // // //     } finally {
// // // //       setLoading(false);
// // // //     }
// // // //   };

// // // //   const getModalTitle = () => {
// // // //     if (subDomain) {
// // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // //     }
// // // //     if (parent) {
// // // //       return `Add SubDomain under: ${parent.title}`;
// // // //     }
// // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // //   };

// // // //   return (
// // // //     <div className="modal-overlay">
// // // //       <div className="modal">
// // // //         <div className="modal-header">
// // // //           <h2>{getModalTitle()}</h2>
// // // //           <button onClick={onClose}>×</button>
// // // //         </div>
        
// // // //         <form onSubmit={handleSubmit}>
// // // //           <div className="form-group">
// // // //             <label>SubDomain Title *</label>
// // // //             <input
// // // //               type="text"
// // // //               value={formData.title}
// // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // //               required
// // // //               minLength={3}
// // // //               maxLength={100}
// // // //             />
// // // //           </div>
          
// // // //           <div className="form-group">
// // // //             <label>Description (Optional)</label>
// // // //             <textarea
// // // //               value={formData.description}
// // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // //               rows={3}
// // // //               placeholder="Describe what this sub-domain covers..."
// // // //               maxLength={500}
// // // //             />
// // // //           </div>
          
// // // //           <div className="modal-info">
// // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // //             {parent && (
// // // //               <>
// // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // //               </>
// // // //             )}
// // // //             <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
// // // //           </div>
          
// // // //           <div className="modal-actions">
// // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // //               Cancel
// // // //             </button>
// // // //             <button 
// // // //               type="submit" 
// // // //               className="primary-button" 
// // // //               disabled={loading || !formData.title.trim()}
// // // //             >
// // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // //             </button>
// // // //           </div>
// // // //         </form>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // // UPDATED: Project Modal Component with SLUG GENERATION
// // // // const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
// // // //   const [formData, setFormData] = useState({
// // // //     title: '',
// // // //     abstract: '',
// // // //     specifications: '',
// // // //     learningOutcomes: '',
// // // //     subDomainId: subDomain?.id || '',
// // // //     isFeatured: false
// // // //   });
// // // //   const [loading, setLoading] = useState(false);

// // // //   console.log('📝 PROJECT MODAL - Props:', {
// // // //     subDomain: subDomain?.title,
// // // //     domain: domain?.title,
// // // //     formData
// // // //   });

// // // //   // ✅ SLUG GENERATION FUNCTION
// // // //   const generateSlug = (title) => {
// // // //     return title
// // // //       .toLowerCase()
// // // //       .trim()
// // // //       .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
// // // //       .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
// // // //       .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
// // // //   };

// // // //   // const handleSubmit = async (e) => {
// // // //   //   e.preventDefault();
// // // //   //   setLoading(true);

// // // //   //   try {
// // // //   //     // ✅ PREPARE DATA WITHOUT SLUG (backend will auto-generate)
// // // //   //     const projectData = {
// // // //   //       title: formData.title.trim(),
// // // //   //       abstract: formData.abstract.trim(),
// // // //   //       specifications: formData.specifications.trim(),
// // // //   //       learningOutcomes: formData.learningOutcomes.trim(),
// // // //   //       subDomainId: formData.subDomainId,
// // // //   //       isFeatured: formData.isFeatured
// // // //   //       // ⚡ REMOVED SLUG - backend validation doesn't allow it
// // // //   //     };

// // // //   //     console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
// // // //   //     console.log('🔗 PROJECT SAVE - Backend will auto-generate slug from title:', formData.title);
      
// // // //   //     const response = await authService.createProject(projectData);
// // // //   //     console.log('✅ PROJECT CREATE - Response:', response.data);
      
// // // //   //     onSave();
// // // //   //   } catch (error) {
// // // //   //     console.error('❌ PROJECT SAVE - Error:', error);
// // // //   //     console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
      
// // // //   //     // Show more specific error message if available
// // // //   //     const errorMessage = error.response?.data?.message || 'Failed to create project';
// // // //   //     toast.error(errorMessage);
// // // //   //   } finally {
// // // //   //     setLoading(false);
// // // //   //   }
// // // //   // };


// // // //   const handleSubmit = async (e) => {
// // // //   e.preventDefault();
// // // //   setLoading(true);

// // // //   try {
// // // //     // ✅ DON'T SEND SLUG - let backend auto-generate it
// // // //     const projectData = {
// // // //       title: formData.title.trim(),
// // // //       abstract: formData.abstract.trim(),
// // // //       specifications: formData.specifications.trim(),
// // // //       learningOutcomes: formData.learningOutcomes.trim(),
// // // //       subDomainId: formData.subDomainId,
// // // //       isFeatured: formData.isFeatured
// // // //       // ⚡ NO SLUG FIELD - backend model hook will generate it
// // // //     };

// // // //     console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
// // // //     console.log('🔗 PROJECT SAVE - Backend will auto-generate slug from title:', formData.title);
    
// // // //     const response = await authService.createProject(projectData);
// // // //     console.log('✅ PROJECT CREATE - Response:', response.data);
    
// // // //     onSave();
// // // //   } catch (error) {
// // // //     console.error('❌ PROJECT SAVE - Error:', error);
// // // //     console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
    
// // // //     // Show more specific error message if available
// // // //     const errorMessage = error.response?.data?.message || 'Failed to create project';
// // // //     toast.error(errorMessage);
// // // //   } finally {
// // // //     setLoading(false);
// // // //   }
// // // // };


// // // //   return (
// // // //     <div className="modal-overlay">
// // // //       <div className="modal large">
// // // //         <div className="modal-header">
// // // //           <h2>Add Project to: {subDomain?.title}</h2>
// // // //           <button onClick={onClose}>×</button>
// // // //         </div>
        
// // // //         <form onSubmit={handleSubmit}>
// // // //           <div className="form-group">
// // // //             <label>Project Title *</label>
// // // //             <input
// // // //               type="text"
// // // //               value={formData.title}
// // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // //               placeholder="Enter project title..."
// // // //               required
// // // //               minLength={3}
// // // //               maxLength={200}
// // // //             />
// // // //             {/* ✅ SHOW SLUG PREVIEW (for user reference only) */}
// // // //             {formData.title && (
// // // //               <div className="slug-preview">
// // // //                 <small>Expected URL Slug: <code>{generateSlug(formData.title)}</code> <em>(auto-generated by backend)</em></small>
// // // //               </div>
// // // //             )}
// // // //           </div>
          
// // // //           <div className="modal-info">
// // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // //             <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
// // // //             <span className="info-note">
// // // //               <FiTarget /> This is a leaf subdomain - perfect for projects!
// // // //             </span>
// // // //           </div>
          
// // // //           <div className="form-group">
// // // //             <label>Abstract *</label>
// // // //             <textarea
// // // //               value={formData.abstract}
// // // //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// // // //               rows={4}
// // // //               placeholder="Brief description of the project..."
// // // //               required
// // // //               minLength={10}
// // // //               maxLength={1000}
// // // //             />
// // // //           </div>
          
// // // //           <div className="form-group">
// // // //             <label>Specifications *</label>
// // // //             <textarea
// // // //               value={formData.specifications}
// // // //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// // // //               rows={6}
// // // //               placeholder="Technical specifications and requirements..."
// // // //               required
// // // //               minLength={10}
// // // //               maxLength={5000}
// // // //             />
// // // //           </div>
          
// // // //           <div className="form-group">
// // // //             <label>Learning Outcomes *</label>
// // // //             <textarea
// // // //               value={formData.learningOutcomes}
// // // //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// // // //               rows={4}
// // // //               placeholder="What will students learn from this project..."
// // // //               required
// // // //               minLength={10}
// // // //               maxLength={2000}
// // // //             />
// // // //           </div>
          
// // // //           <div className="form-group checkbox">
// // // //             <label>
// // // //               <input
// // // //                 type="checkbox"
// // // //                 checked={formData.isFeatured}
// // // //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// // // //               />
// // // //               <FiTarget />
// // // //               Featured Project
// // // //             </label>
// // // //           </div>
          
// // // //           <div className="modal-actions">
// // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // //               Cancel
// // // //             </button>
// // // //             <button 
// // // //               type="submit" 
// // // //               className="primary-button" 
// // // //               disabled={loading || !formData.title || !formData.abstract || !formData.specifications || !formData.learningOutcomes}
// // // //             >
// // // //               {loading ? 'Creating...' : 'Create Project'}
// // // //             </button>
// // // //           </div>
// // // //         </form>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default SubDomainManagement;


// // // // // // src/components/domains/SubDomainManagement.js - UPDATED WITH SLUG GENERATION
// // // // // import React, { useState, useEffect } from 'react';
// // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // import { authService } from '../../services/authService';
// // // // // import { toast } from 'react-toastify';
// // // // // import {
// // // // //   FiPlus,
// // // // //   FiEdit,
// // // // //   FiTrash2,
// // // // //   FiChevronDown,
// // // // //   FiChevronRight,
// // // // //   FiFolder,
// // // // //   FiFolderPlus,
// // // // //   FiFileText,
// // // // //   FiArrowLeft,
// // // // //   FiMoreVertical,
// // // // //   FiMove,
// // // // //   FiTarget
// // // // // } from 'react-icons/fi';

// // // // // const SubDomainManagement = () => {
// // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // //   const { domainId } = useParams();
// // // // //   const navigate = useNavigate();
  
// // // // //   const [domain, setDomain] = useState(null);
// // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // //   const [loading, setLoading] = useState(true);
// // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // //   // NEW: Project creation state
// // // // //   const [showProjectModal, setShowProjectModal] = useState(false);
// // // // //   const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

// // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // //     domainId,
// // // // //     domain: domain?.title,
// // // // //     subDomainsCount: subDomains.length,
// // // // //     loading,
// // // // //     selectedParent: selectedParent?.title,
// // // // //     expandedCount: expandedNodes.size,
// // // // //     showProjectModal,
// // // // //     selectedSubDomainForProject: selectedSubDomainForProject?.title
// // // // //   });

// // // // //   useEffect(() => {
// // // // //     if (domainId) {
// // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // //       fetchDomainAndSubDomains();
// // // // //     }
// // // // //   }, [domainId]);

// // // // //   const fetchDomainAndSubDomains = async () => {
// // // // //     try {
// // // // //       setLoading(true);
      
// // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
// // // // //       // Get domain details
// // // // //       const domainsResponse = await authService.getDomains();
// // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // //       let domainData = null;
// // // // //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// // // // //       if (domains.length > 0) {
// // // // //         domainData = domains.find(d => d.id == domainId);
// // // // //       }
      
// // // // //       if (!domainData) {
// // // // //         domainData = {
// // // // //           id: domainId,
// // // // //           title: `Domain ${domainId}`,
// // // // //           description: 'Domain not found in list',
// // // // //           projectCount: 0
// // // // //         };
// // // // //       }
      
// // // // //       setDomain(domainData);
      
// // // // //       // Get subdomains
// // // // //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// // // // //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse.data);
      
// // // // //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// // // // //       setSubDomains(subDomainsData);
      
// // // // //       // Auto-expand first level
// // // // //       if (subDomainsData.length > 0) {
// // // // //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// // // // //         setExpandedNodes(new Set(firstLevelIds));
// // // // //       }
      
// // // // //       // Try hierarchy API as fallback
// // // // //       try {
// // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// // // // //           setSubDomains(hierarchyData.subDomains);
// // // // //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// // // // //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// // // // //           }
// // // // //         }
// // // // //       } catch (hierarchyError) {
// // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
// // // // //       }
      
// // // // //     } catch (error) {
// // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // //       toast.error('Failed to fetch domain information');
      
// // // // //       setDomain({
// // // // //         id: domainId,
// // // // //         title: `Domain ${domainId}`,
// // // // //         description: 'Error loading domain details',
// // // // //         projectCount: 0
// // // // //       });
// // // // //       setSubDomains([]);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const handleAddSubDomain = (parent = null) => {
// // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
// // // // //     setSelectedParent(parent);
// // // // //     setEditingSubDomain(null);
// // // // //     setShowAddModal(true);
// // // // //   };

// // // // //   const handleEditSubDomain = (subDomain) => {
// // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
// // // // //     setSelectedParent(null);
// // // // //     setEditingSubDomain(subDomain);
// // // // //     setShowAddModal(true);
// // // // //   };

// // // // //   // NEW: Handle adding project to subdomain
// // // // //   const handleAddProjectToSubDomain = (subDomain) => {
// // // // //     console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
// // // // //     console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
// // // // //     if (subDomain.children && subDomain.children.length > 0) {
// // // // //       toast.error('Projects can only be added to leaf sub-domains (those without children)');
// // // // //       return;
// // // // //     }
    
// // // // //     setSelectedSubDomainForProject(subDomain);
// // // // //     setShowProjectModal(true);
// // // // //   };

// // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // //     if (hasChildren) {
// // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // //     }
// // // // //     if (hasProjects) {
// // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // //     }
    
// // // // //     if (!window.confirm(confirmMessage)) {
// // // // //       return;
// // // // //     }

// // // // //     try {
// // // // //       console.log('🗑️ SUBDOMAIN DELETE - Deleting:', subDomain.title);
// // // // //       const response = await authService.deleteSubDomain(subDomain.id);
// // // // //       toast.success('Sub-domain deleted successfully');
// // // // //       fetchDomainAndSubDomains();
// // // // //     } catch (error) {
// // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // //       toast.error('Failed to delete sub-domain');
// // // // //     }
// // // // //   };

// // // // //   const toggleExpanded = (nodeId) => {
// // // // //     const newExpanded = new Set(expandedNodes);
// // // // //     if (newExpanded.has(nodeId)) {
// // // // //       newExpanded.delete(nodeId);
// // // // //     } else {
// // // // //       newExpanded.add(nodeId);
// // // // //     }
// // // // //     setExpandedNodes(newExpanded);
// // // // //   };

// // // // //   if (loading) {
// // // // //     return (
// // // // //       <div className="loading-container">
// // // // //         <div className="loading-spinner"></div>
// // // // //         <p>Loading sub-domains...</p>
// // // // //       </div>
// // // // //     );
// // // // //   }

// // // // //   return (
// // // // //     <div className="subdomain-management">
// // // // //       {/* Header with Breadcrumb */}
// // // // //       <div className="page-header">
// // // // //         <div className="header-content">
// // // // //           <div className="breadcrumb">
// // // // //             <button 
// // // // //               className="breadcrumb-link"
// // // // //               onClick={() => navigate('/domains')}
// // // // //             >
// // // // //               <FiArrowLeft />
// // // // //               Domains
// // // // //             </button>
// // // // //             <span className="breadcrumb-separator">/</span>
// // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // //           </div>
// // // // //           <h1>SubDomain Management</h1>
// // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // //         </div>
// // // // //         <div className="header-actions">
// // // // //           <button 
// // // // //             className="primary-button" 
// // // // //             onClick={() => handleAddSubDomain()}
// // // // //           >
// // // // //             <FiPlus />
// // // // //             Add Root SubDomain
// // // // //           </button>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Quick Guide */}
// // // // //       <div className="quick-guide">
// // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // //         <div className="guide-steps">
// // // // //           <div className="guide-step">
// // // // //             <span className="step-number">1</span>
// // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // //           </div>
// // // // //           <div className="guide-step">
// // // // //             <span className="step-number">2</span>
// // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // //           </div>
// // // // //           <div className="guide-step">
// // // // //             <span className="step-number">3</span>
// // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // //           </div>
// // // // //           <div className="guide-step">
// // // // //             <span className="step-number">4</span>
// // // // //             <span className="step-text">Click <strong>"Add Project"</strong> on leaf subdomains to create new projects</span>
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>

// // // // //       {/* Domain Info Card */}
// // // // //       {domain && (
// // // // //         <div className="domain-info-card">
// // // // //           <div className="domain-icon">
// // // // //             <FiFolder />
// // // // //           </div>
// // // // //           <div className="domain-details">
// // // // //             <h3>{domain.title}</h3>
// // // // //             <p>{domain.description}</p>
// // // // //             <div className="domain-stats">
// // // // //               <span className="stat-item">
// // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // //               </span>
// // // // //               <span className="stat-item">
// // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // //               </span>
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
// // // // //       )}

// // // // //       {/* SubDomain Tree */}
// // // // //       <div className="subdomain-tree-container">
// // // // //         <div className="tree-header">
// // // // //           <h2>SubDomain Hierarchy</h2>
// // // // //           <div className="tree-legend">
// // // // //             <span className="legend-item">
// // // // //               <FiFolder className="folder-icon" />
// // // // //               Has children
// // // // //             </span>
// // // // //             <span className="legend-item">
// // // // //               <FiTarget className="leaf-icon" />
// // // // //               Leaf (can have projects)
// // // // //             </span>
// // // // //             <span className="legend-item">
// // // // //               <FiFileText className="project-icon" />
// // // // //               Add Project
// // // // //             </span>
// // // // //           </div>
// // // // //         </div>

// // // // //         {subDomains.length > 0 ? (
// // // // //           <div className="subdomain-tree">
// // // // //             {subDomains.map((subDomain) => (
// // // // //               <SubDomainNode
// // // // //                 key={subDomain.id}
// // // // //                 subDomain={subDomain}
// // // // //                 level={0}
// // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // //                 onToggleExpanded={toggleExpanded}
// // // // //                 onEdit={handleEditSubDomain}
// // // // //                 onDelete={handleDeleteSubDomain}
// // // // //                 onAddChild={handleAddSubDomain}
// // // // //                 onAddProject={handleAddProjectToSubDomain}
// // // // //                 expandedNodes={expandedNodes}
// // // // //               />
// // // // //             ))}
// // // // //           </div>
// // // // //         ) : (
// // // // //           <div className="empty-tree-state">
// // // // //             <FiFolderPlus size={64} />
// // // // //             <h3>No SubDomains Yet</h3>
// // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // //             <div className="empty-state-examples">
// // // // //               <h4>Example Structure:</h4>
// // // // //               <div className="example-tree">
// // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // //               </div>
// // // // //             </div>
// // // // //             <div className="empty-state-actions">
// // // // //               <button 
// // // // //                 className="primary-button large" 
// // // // //                 onClick={() => handleAddSubDomain()}
// // // // //               >
// // // // //                 <FiPlus />
// // // // //                 Create Your First SubDomain
// // // // //               </button>
// // // // //               <p className="help-text">
// // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // //               </p>
// // // // //             </div>
// // // // //           </div>
// // // // //         )}
// // // // //       </div>

// // // // //       {/* Add/Edit SubDomain Modal */}
// // // // //       {showAddModal && (
// // // // //         <SubDomainModal
// // // // //           subDomain={editingSubDomain}
// // // // //           parent={selectedParent}
// // // // //           domain={domain}
// // // // //           onClose={() => {
// // // // //             setShowAddModal(false);
// // // // //             setEditingSubDomain(null);
// // // // //             setSelectedParent(null);
// // // // //           }}
// // // // //           onSave={() => {
// // // // //             setShowAddModal(false);
// // // // //             setEditingSubDomain(null);
// // // // //             setSelectedParent(null);
// // // // //             fetchDomainAndSubDomains();
// // // // //           }}
// // // // //         />
// // // // //       )}

// // // // //       {/* NEW: Project Creation Modal with SLUG GENERATION */}
// // // // //       {showProjectModal && (
// // // // //         <ProjectModal
// // // // //           subDomain={selectedSubDomainForProject}
// // // // //           domain={domain}
// // // // //           onClose={() => {
// // // // //             setShowProjectModal(false);
// // // // //             setSelectedSubDomainForProject(null);
// // // // //           }}
// // // // //           onSave={() => {
// // // // //             setShowProjectModal(false);
// // // // //             setSelectedSubDomainForProject(null);
// // // // //             toast.success('Project created successfully!');
// // // // //             fetchDomainAndSubDomains(); // Refresh to update project counts
// // // // //           }}
// // // // //         />
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // // UPDATED SubDomain Node Component
// // // // // const SubDomainNode = ({ 
// // // // //   subDomain, 
// // // // //   level, 
// // // // //   isExpanded, 
// // // // //   onToggleExpanded, 
// // // // //   onEdit, 
// // // // //   onDelete, 
// // // // //   onAddChild,
// // // // //   onAddProject,
// // // // //   expandedNodes 
// // // // // }) => {
// // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // //   const isLeaf = !hasChildren;

// // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // //     title: subDomain.title,
// // // // //     level,
// // // // //     hasChildren,
// // // // //     isLeaf,
// // // // //     isExpanded,
// // // // //     projectCount: subDomain.projectCount
// // // // //   });

// // // // //   return (
// // // // //     <div className={`subdomain-node level-${level}`}>
// // // // //       <div className="node-content">
// // // // //         <div className="node-main">
// // // // //           {hasChildren ? (
// // // // //             <button 
// // // // //               className="expand-button"
// // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // //             >
// // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // //             </button>
// // // // //           ) : (
// // // // //             <div className="expand-placeholder" />
// // // // //           )}
          
// // // // //           <div className="node-icon">
// // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // //           </div>
          
// // // // //           <div className="node-info">
// // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // //             <p className="node-description">{subDomain.description}</p>
// // // // //             <div className="node-stats">
// // // // //               {hasChildren && (
// // // // //                 <span className="stat-badge">
// // // // //                   {subDomain.children.length} sub-domains
// // // // //                 </span>
// // // // //               )}
// // // // //               {subDomain.projectCount > 0 && (
// // // // //                 <span className="stat-badge projects">
// // // // //                   {subDomain.projectCount} projects
// // // // //                 </span>
// // // // //               )}
// // // // //               {isLeaf && (
// // // // //                 <span className="stat-badge leaf">
// // // // //                   Can have projects
// // // // //                 </span>
// // // // //               )}
// // // // //             </div>
// // // // //           </div>
// // // // //         </div>
        
// // // // //         <div className="node-actions">
// // // // //           {isLeaf && (
// // // // //             <button 
// // // // //               className="action-button project" 
// // // // //               onClick={() => onAddProject(subDomain)}
// // // // //               title={`Add project to "${subDomain.title}"`}
// // // // //             >
// // // // //               <FiFileText />
// // // // //             </button>
// // // // //           )}
          
// // // // //           <button 
// // // // //             className="action-button add" 
// // // // //             onClick={() => onAddChild(subDomain)}
// // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // //           >
// // // // //             <FiPlus />
// // // // //           </button>
          
// // // // //           <div className="action-menu">
// // // // //             <button 
// // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // //               title="More actions"
// // // // //             >
// // // // //               <FiMoreVertical />
// // // // //             </button>
// // // // //             {showMenu && (
// // // // //               <div className="dropdown-menu">
// // // // //                 {isLeaf && (
// // // // //                   <button 
// // // // //                     onClick={() => {
// // // // //                       onAddProject(subDomain);
// // // // //                       setShowMenu(false);
// // // // //                     }}
// // // // //                     className="primary-option"
// // // // //                   >
// // // // //                     <FiFileText /> Add Project
// // // // //                   </button>
// // // // //                 )}
// // // // //                 <button onClick={() => {
// // // // //                   onEdit(subDomain);
// // // // //                   setShowMenu(false);
// // // // //                 }}>
// // // // //                   <FiEdit /> Edit SubDomain
// // // // //                 </button>
// // // // //                 <button onClick={() => {
// // // // //                   onAddChild(subDomain);
// // // // //                   setShowMenu(false);
// // // // //                 }}>
// // // // //                   <FiPlus /> Add Child SubDomain
// // // // //                 </button>
// // // // //                 <button onClick={() => {
// // // // //                   onDelete(subDomain);
// // // // //                   setShowMenu(false);
// // // // //                 }} className="danger">
// // // // //                   <FiTrash2 /> Delete SubDomain
// // // // //                 </button>
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
// // // // //         </div>
// // // // //       </div>
      
// // // // //       {/* Children */}
// // // // //       {hasChildren && isExpanded && (
// // // // //         <div className="node-children">
// // // // //           {subDomain.children.map((child) => (
// // // // //             <SubDomainNode
// // // // //               key={child.id}
// // // // //               subDomain={child}
// // // // //               level={level + 1}
// // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // //               onToggleExpanded={onToggleExpanded}
// // // // //               onEdit={onEdit}
// // // // //               onDelete={onDelete}
// // // // //               onAddChild={onAddChild}
// // // // //               onAddProject={onAddProject}
// // // // //               expandedNodes={expandedNodes}
// // // // //             />
// // // // //           ))}
// // // // //         </div>
// // // // //       )}
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // // SubDomain Modal Component (unchanged)
// // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // //   const [formData, setFormData] = useState({
// // // // //     title: subDomain?.title || '',
// // // // //     description: subDomain?.description || ''
// // // // //   });
// // // // //   const [loading, setLoading] = useState(false);

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();
// // // // //     setLoading(true);

// // // // //     try {
// // // // //       const requestData = {
// // // // //         title: formData.title.trim(),
// // // // //         description: formData.description.trim(),
// // // // //         domainId: domain.id,
// // // // //         parentId: parent?.id || null
// // // // //       };

// // // // //       console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

// // // // //       if (subDomain) {
// // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // //         toast.success('Sub-domain updated successfully');
// // // // //       } else {
// // // // //         const response = await authService.createSubDomain(requestData);
// // // // //         toast.success('Sub-domain created successfully');
// // // // //       }

// // // // //       onSave();
// // // // //     } catch (error) {
// // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // //       const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
// // // // //       toast.error(errorMessage);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   const getModalTitle = () => {
// // // // //     if (subDomain) {
// // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // //     }
// // // // //     if (parent) {
// // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // //     }
// // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // //   };

// // // // //   return (
// // // // //     <div className="modal-overlay">
// // // // //       <div className="modal">
// // // // //         <div className="modal-header">
// // // // //           <h2>{getModalTitle()}</h2>
// // // // //           <button onClick={onClose}>×</button>
// // // // //         </div>
        
// // // // //         <form onSubmit={handleSubmit}>
// // // // //           <div className="form-group">
// // // // //             <label>SubDomain Title *</label>
// // // // //             <input
// // // // //               type="text"
// // // // //               value={formData.title}
// // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // //               required
// // // // //               minLength={3}
// // // // //               maxLength={100}
// // // // //             />
// // // // //           </div>
          
// // // // //           <div className="form-group">
// // // // //             <label>Description (Optional)</label>
// // // // //             <textarea
// // // // //               value={formData.description}
// // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // //               rows={3}
// // // // //               placeholder="Describe what this sub-domain covers..."
// // // // //               maxLength={500}
// // // // //             />
// // // // //           </div>
          
// // // // //           <div className="modal-info">
// // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // //             {parent && (
// // // // //               <>
// // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // //               </>
// // // // //             )}
// // // // //             <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
// // // // //           </div>
          
// // // // //           <div className="modal-actions">
// // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // //               Cancel
// // // // //             </button>
// // // // //             <button 
// // // // //               type="submit" 
// // // // //               className="primary-button" 
// // // // //               disabled={loading || !formData.title.trim()}
// // // // //             >
// // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // //             </button>
// // // // //           </div>
// // // // //         </form>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // // UPDATED: Project Modal Component with SLUG GENERATION
// // // // // const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
// // // // //   const [formData, setFormData] = useState({
// // // // //     title: '',
// // // // //     abstract: '',
// // // // //     specifications: '',
// // // // //     learningOutcomes: '',
// // // // //     subDomainId: subDomain?.id || '',
// // // // //     isFeatured: false
// // // // //   });
// // // // //   const [loading, setLoading] = useState(false);

// // // // //   console.log('📝 PROJECT MODAL - Props:', {
// // // // //     subDomain: subDomain?.title,
// // // // //     domain: domain?.title,
// // // // //     formData
// // // // //   });

// // // // //   // ✅ SLUG GENERATION FUNCTION
// // // // //   const generateSlug = (title) => {
// // // // //     return title
// // // // //       .toLowerCase()
// // // // //       .trim()
// // // // //       .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens and underscores
// // // // //       .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
// // // // //       .replace(/^-+|-+$/g, ''); // Remove leading and trailing hyphens
// // // // //   };

// // // // //   const handleSubmit = async (e) => {
// // // // //     e.preventDefault();
// // // // //     setLoading(true);

// // // // //     try {
// // // // //       // ✅ GENERATE SLUG FROM TITLE
// // // // //       const slug = generateSlug(formData.title);
      
// // // // //       // ✅ PREPARE COMPLETE DATA WITH SLUG
// // // // //       const projectData = {
// // // // //         ...formData,
// // // // //         slug: slug, // ⚡ ADD THE GENERATED SLUG HERE
// // // // //         title: formData.title.trim(),
// // // // //         abstract: formData.abstract.trim(),
// // // // //         specifications: formData.specifications.trim(),
// // // // //         learningOutcomes: formData.learningOutcomes.trim()
// // // // //       };

// // // // //       console.log('💾 PROJECT SAVE - Starting API call with data:', projectData);
// // // // //       console.log('🔗 PROJECT SAVE - Generated slug:', slug);
      
// // // // //       const response = await authService.createProject(projectData);
// // // // //       console.log('✅ PROJECT CREATE - Response:', response.data);
      
// // // // //       onSave();
// // // // //     } catch (error) {
// // // // //       console.error('❌ PROJECT SAVE - Error:', error);
// // // // //       console.error('❌ PROJECT SAVE - Error response:', error.response?.data);
      
// // // // //       // Show more specific error message if available
// // // // //       const errorMessage = error.response?.data?.message || 'Failed to create project';
// // // // //       toast.error(errorMessage);
// // // // //     } finally {
// // // // //       setLoading(false);
// // // // //     }
// // // // //   };

// // // // //   return (
// // // // //     <div className="modal-overlay">
// // // // //       <div className="modal large">
// // // // //         <div className="modal-header">
// // // // //           <h2>Add Project to: {subDomain?.title}</h2>
// // // // //           <button onClick={onClose}>×</button>
// // // // //         </div>
        
// // // // //         <form onSubmit={handleSubmit}>
// // // // //           <div className="form-group">
// // // // //             <label>Project Title *</label>
// // // // //             <input
// // // // //               type="text"
// // // // //               value={formData.title}
// // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // //               placeholder="Enter project title..."
// // // // //               required
// // // // //               minLength={3}
// // // // //               maxLength={200}
// // // // //             />
// // // // //             {/* ✅ SHOW GENERATED SLUG PREVIEW */}
// // // // //             {formData.title && (
// // // // //               <div className="slug-preview">
// // // // //                 <small>URL Slug: <code>{generateSlug(formData.title)}</code></small>
// // // // //               </div>
// // // // //             )}
// // // // //           </div>
          
// // // // //           <div className="modal-info">
// // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // //             <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
// // // // //             <span className="info-note">
// // // // //               <FiTarget /> This is a leaf subdomain - perfect for projects!
// // // // //             </span>
// // // // //           </div>
          
// // // // //           <div className="form-group">
// // // // //             <label>Abstract *</label>
// // // // //             <textarea
// // // // //               value={formData.abstract}
// // // // //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// // // // //               rows={4}
// // // // //               placeholder="Brief description of the project..."
// // // // //               required
// // // // //               minLength={10}
// // // // //               maxLength={1000}
// // // // //             />
// // // // //           </div>
          
// // // // //           <div className="form-group">
// // // // //             <label>Specifications *</label>
// // // // //             <textarea
// // // // //               value={formData.specifications}
// // // // //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// // // // //               rows={6}
// // // // //               placeholder="Technical specifications and requirements..."
// // // // //               required
// // // // //               minLength={10}
// // // // //               maxLength={5000}
// // // // //             />
// // // // //           </div>
          
// // // // //           <div className="form-group">
// // // // //             <label>Learning Outcomes *</label>
// // // // //             <textarea
// // // // //               value={formData.learningOutcomes}
// // // // //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// // // // //               rows={4}
// // // // //               placeholder="What will students learn from this project..."
// // // // //               required
// // // // //               minLength={10}
// // // // //               maxLength={2000}
// // // // //             />
// // // // //           </div>
          
// // // // //           <div className="form-group checkbox">
// // // // //             <label>
// // // // //               <input
// // // // //                 type="checkbox"
// // // // //                 checked={formData.isFeatured}
// // // // //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// // // // //               />
// // // // //               <FiTarget />
// // // // //               Featured Project
// // // // //             </label>
// // // // //           </div>
          
// // // // //           <div className="modal-actions">
// // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // //               Cancel
// // // // //             </button>
// // // // //             <button 
// // // // //               type="submit" 
// // // // //               className="primary-button" 
// // // // //               disabled={loading || !formData.title || !formData.abstract || !formData.specifications || !formData.learningOutcomes}
// // // // //             >
// // // // //               {loading ? 'Creating...' : 'Create Project'}
// // // // //             </button>
// // // // //           </div>
// // // // //         </form>
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // export default SubDomainManagement;



// // // // // // // src/components/domains/SubDomainManagement.js - UPDATED WITH ADD PROJECT FEATURE
// // // // // // import React, { useState, useEffect } from 'react';
// // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // import { authService } from '../../services/authService';
// // // // // // import { toast } from 'react-toastify';
// // // // // // import {
// // // // // //   FiPlus,
// // // // // //   FiEdit,
// // // // // //   FiTrash2,
// // // // // //   FiChevronDown,
// // // // // //   FiChevronRight,
// // // // // //   FiFolder,
// // // // // //   FiFolderPlus,
// // // // // //   FiFileText,
// // // // // //   FiArrowLeft,
// // // // // //   FiMoreVertical,
// // // // // //   FiMove,
// // // // // //   FiTarget
// // // // // // } from 'react-icons/fi';

// // // // // // const SubDomainManagement = () => {
// // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // //   const { domainId } = useParams();
// // // // // //   const navigate = useNavigate();
  
// // // // // //   const [domain, setDomain] = useState(null);
// // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // //   const [loading, setLoading] = useState(true);
// // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // //   // NEW: Project creation state
// // // // // //   const [showProjectModal, setShowProjectModal] = useState(false);
// // // // // //   const [selectedSubDomainForProject, setSelectedSubDomainForProject] = useState(null);

// // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // //     domainId,
// // // // // //     domain: domain?.title,
// // // // // //     subDomainsCount: subDomains.length,
// // // // // //     loading,
// // // // // //     selectedParent: selectedParent?.title,
// // // // // //     expandedCount: expandedNodes.size,
// // // // // //     showProjectModal,
// // // // // //     selectedSubDomainForProject: selectedSubDomainForProject?.title
// // // // // //   });

// // // // // //   useEffect(() => {
// // // // // //     if (domainId) {
// // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // //       fetchDomainAndSubDomains();
// // // // // //     }
// // // // // //   }, [domainId]);

// // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // //     try {
// // // // // //       setLoading(true);
      
// // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls for domain:', domainId);
      
// // // // // //       // Get domain details
// // // // // //       const domainsResponse = await authService.getDomains();
// // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // //       let domainData = null;
// // // // // //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// // // // // //       if (domains.length > 0) {
// // // // // //         domainData = domains.find(d => d.id == domainId);
// // // // // //       }
      
// // // // // //       if (!domainData) {
// // // // // //         domainData = {
// // // // // //           id: domainId,
// // // // // //           title: `Domain ${domainId}`,
// // // // // //           description: 'Domain not found in list',
// // // // // //           projectCount: 0
// // // // // //         };
// // // // // //       }
      
// // // // // //       setDomain(domainData);
      
// // // // // //       // Get subdomains
// // // // // //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// // // // // //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse.data);
      
// // // // // //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// // // // // //       setSubDomains(subDomainsData);
      
// // // // // //       // Auto-expand first level
// // // // // //       if (subDomainsData.length > 0) {
// // // // // //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// // // // // //         setExpandedNodes(new Set(firstLevelIds));
// // // // // //       }
      
// // // // // //       // Try hierarchy API as fallback
// // // // // //       try {
// // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// // // // // //           setSubDomains(hierarchyData.subDomains);
// // // // // //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// // // // // //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// // // // // //           }
// // // // // //         }
// // // // // //       } catch (hierarchyError) {
// // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed:', hierarchyError);
// // // // // //       }
      
// // // // // //     } catch (error) {
// // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // //       setDomain({
// // // // // //         id: domainId,
// // // // // //         title: `Domain ${domainId}`,
// // // // // //         description: 'Error loading domain details',
// // // // // //         projectCount: 0
// // // // // //       });
// // // // // //       setSubDomains([]);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked, parent:', parent?.title);
// // // // // //     setSelectedParent(parent);
// // // // // //     setEditingSubDomain(null);
// // // // // //     setShowAddModal(true);
// // // // // //   };

// // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked:', subDomain.title);
// // // // // //     setSelectedParent(null);
// // // // // //     setEditingSubDomain(subDomain);
// // // // // //     setShowAddModal(true);
// // // // // //   };

// // // // // //   // NEW: Handle adding project to subdomain
// // // // // //   const handleAddProjectToSubDomain = (subDomain) => {
// // // // // //     console.log('📝 ADD PROJECT - Starting for subdomain:', subDomain.title);
// // // // // //     console.log('📝 ADD PROJECT - SubDomain is leaf:', !subDomain.children || subDomain.children.length === 0);
    
// // // // // //     if (subDomain.children && subDomain.children.length > 0) {
// // // // // //       toast.error('Projects can only be added to leaf sub-domains (those without children)');
// // // // // //       return;
// // // // // //     }
    
// // // // // //     setSelectedSubDomainForProject(subDomain);
// // // // // //     setShowProjectModal(true);
// // // // // //   };

// // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // //     if (hasChildren) {
// // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // //     }
// // // // // //     if (hasProjects) {
// // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // //     }
    
// // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // //       return;
// // // // // //     }

// // // // // //     try {
// // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Deleting:', subDomain.title);
// // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
// // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // //       fetchDomainAndSubDomains();
// // // // // //     } catch (error) {
// // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // //       toast.error('Failed to delete sub-domain');
// // // // // //     }
// // // // // //   };

// // // // // //   const toggleExpanded = (nodeId) => {
// // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // //     if (newExpanded.has(nodeId)) {
// // // // // //       newExpanded.delete(nodeId);
// // // // // //     } else {
// // // // // //       newExpanded.add(nodeId);
// // // // // //     }
// // // // // //     setExpandedNodes(newExpanded);
// // // // // //   };

// // // // // //   if (loading) {
// // // // // //     return (
// // // // // //       <div className="loading-container">
// // // // // //         <div className="loading-spinner"></div>
// // // // // //         <p>Loading sub-domains...</p>
// // // // // //       </div>
// // // // // //     );
// // // // // //   }

// // // // // //   return (
// // // // // //     <div className="subdomain-management">
// // // // // //       {/* Header with Breadcrumb */}
// // // // // //       <div className="page-header">
// // // // // //         <div className="header-content">
// // // // // //           <div className="breadcrumb">
// // // // // //             <button 
// // // // // //               className="breadcrumb-link"
// // // // // //               onClick={() => navigate('/domains')}
// // // // // //             >
// // // // // //               <FiArrowLeft />
// // // // // //               Domains
// // // // // //             </button>
// // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // //           </div>
// // // // // //           <h1>SubDomain Management</h1>
// // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // //         </div>
// // // // // //         <div className="header-actions">
// // // // // //           <button 
// // // // // //             className="primary-button" 
// // // // // //             onClick={() => handleAddSubDomain()}
// // // // // //           >
// // // // // //             <FiPlus />
// // // // // //             Add Root SubDomain
// // // // // //           </button>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Quick Guide */}
// // // // // //       <div className="quick-guide">
// // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // //         <div className="guide-steps">
// // // // // //           <div className="guide-step">
// // // // // //             <span className="step-number">1</span>
// // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // //           </div>
// // // // // //           <div className="guide-step">
// // // // // //             <span className="step-number">2</span>
// // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // //           </div>
// // // // // //           <div className="guide-step">
// // // // // //             <span className="step-number">3</span>
// // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // //           </div>
// // // // // //           <div className="guide-step">
// // // // // //             <span className="step-number">4</span>
// // // // // //             <span className="step-text">Click <strong>"Add Project"</strong> on leaf subdomains to create new projects</span>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>

// // // // // //       {/* Domain Info Card */}
// // // // // //       {domain && (
// // // // // //         <div className="domain-info-card">
// // // // // //           <div className="domain-icon">
// // // // // //             <FiFolder />
// // // // // //           </div>
// // // // // //           <div className="domain-details">
// // // // // //             <h3>{domain.title}</h3>
// // // // // //             <p>{domain.description}</p>
// // // // // //             <div className="domain-stats">
// // // // // //               <span className="stat-item">
// // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // //               </span>
// // // // // //               <span className="stat-item">
// // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // //               </span>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       )}

// // // // // //       {/* SubDomain Tree */}
// // // // // //       <div className="subdomain-tree-container">
// // // // // //         <div className="tree-header">
// // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // //           <div className="tree-legend">
// // // // // //             <span className="legend-item">
// // // // // //               <FiFolder className="folder-icon" />
// // // // // //               Has children
// // // // // //             </span>
// // // // // //             <span className="legend-item">
// // // // // //               <FiTarget className="leaf-icon" />
// // // // // //               Leaf (can have projects)
// // // // // //             </span>
// // // // // //             <span className="legend-item">
// // // // // //               <FiFileText className="project-icon" />
// // // // // //               Add Project
// // // // // //             </span>
// // // // // //           </div>
// // // // // //         </div>

// // // // // //         {subDomains.length > 0 ? (
// // // // // //           <div className="subdomain-tree">
// // // // // //             {subDomains.map((subDomain) => (
// // // // // //               <SubDomainNode
// // // // // //                 key={subDomain.id}
// // // // // //                 subDomain={subDomain}
// // // // // //                 level={0}
// // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // //                 onEdit={handleEditSubDomain}
// // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // //                 onAddChild={handleAddSubDomain}
// // // // // //                 onAddProject={handleAddProjectToSubDomain} // NEW
// // // // // //                 expandedNodes={expandedNodes}
// // // // // //               />
// // // // // //             ))}
// // // // // //           </div>
// // // // // //         ) : (
// // // // // //           <div className="empty-tree-state">
// // // // // //             <FiFolderPlus size={64} />
// // // // // //             <h3>No SubDomains Yet</h3>
// // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // //             <div className="empty-state-examples">
// // // // // //               <h4>Example Structure:</h4>
// // // // // //               <div className="example-tree">
// // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // //               </div>
// // // // // //             </div>
// // // // // //             <div className="empty-state-actions">
// // // // // //               <button 
// // // // // //                 className="primary-button large" 
// // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // //               >
// // // // // //                 <FiPlus />
// // // // // //                 Create Your First SubDomain
// // // // // //               </button>
// // // // // //               <p className="help-text">
// // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // //               </p>
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         )}
// // // // // //       </div>

// // // // // //       {/* Add/Edit SubDomain Modal */}
// // // // // //       {showAddModal && (
// // // // // //         <SubDomainModal
// // // // // //           subDomain={editingSubDomain}
// // // // // //           parent={selectedParent}
// // // // // //           domain={domain}
// // // // // //           onClose={() => {
// // // // // //             setShowAddModal(false);
// // // // // //             setEditingSubDomain(null);
// // // // // //             setSelectedParent(null);
// // // // // //           }}
// // // // // //           onSave={() => {
// // // // // //             setShowAddModal(false);
// // // // // //             setEditingSubDomain(null);
// // // // // //             setSelectedParent(null);
// // // // // //             fetchDomainAndSubDomains();
// // // // // //           }}
// // // // // //         />
// // // // // //       )}

// // // // // //       {/* NEW: Project Creation Modal */}
// // // // // //       {showProjectModal && (
// // // // // //         <ProjectModal
// // // // // //           subDomain={selectedSubDomainForProject}
// // // // // //           domain={domain}
// // // // // //           onClose={() => {
// // // // // //             setShowProjectModal(false);
// // // // // //             setSelectedSubDomainForProject(null);
// // // // // //           }}
// // // // // //           onSave={() => {
// // // // // //             setShowProjectModal(false);
// // // // // //             setSelectedSubDomainForProject(null);
// // // // // //             toast.success('Project created successfully!');
// // // // // //             fetchDomainAndSubDomains(); // Refresh to update project counts
// // // // // //           }}
// // // // // //         />
// // // // // //       )}
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // // UPDATED SubDomain Node Component
// // // // // // const SubDomainNode = ({ 
// // // // // //   subDomain, 
// // // // // //   level, 
// // // // // //   isExpanded, 
// // // // // //   onToggleExpanded, 
// // // // // //   onEdit, 
// // // // // //   onDelete, 
// // // // // //   onAddChild,
// // // // // //   onAddProject, // NEW
// // // // // //   expandedNodes 
// // // // // // }) => {
// // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // //   const isLeaf = !hasChildren;

// // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // //     title: subDomain.title,
// // // // // //     level,
// // // // // //     hasChildren,
// // // // // //     isLeaf,
// // // // // //     isExpanded,
// // // // // //     projectCount: subDomain.projectCount
// // // // // //   });

// // // // // //   return (
// // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // //       <div className="node-content">
// // // // // //         <div className="node-main">
// // // // // //           {hasChildren ? (
// // // // // //             <button 
// // // // // //               className="expand-button"
// // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // //             >
// // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // //             </button>
// // // // // //           ) : (
// // // // // //             <div className="expand-placeholder" />
// // // // // //           )}
          
// // // // // //           <div className="node-icon">
// // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // //           </div>
          
// // // // // //           <div className="node-info">
// // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // //             <div className="node-stats">
// // // // // //               {hasChildren && (
// // // // // //                 <span className="stat-badge">
// // // // // //                   {subDomain.children.length} sub-domains
// // // // // //                 </span>
// // // // // //               )}
// // // // // //               {subDomain.projectCount > 0 && (
// // // // // //                 <span className="stat-badge projects">
// // // // // //                   {subDomain.projectCount} projects
// // // // // //                 </span>
// // // // // //               )}
// // // // // //               {isLeaf && (
// // // // // //                 <span className="stat-badge leaf">
// // // // // //                   Can have projects
// // // // // //                 </span>
// // // // // //               )}
// // // // // //             </div>
// // // // // //           </div>
// // // // // //         </div>
        
// // // // // //         <div className="node-actions">
// // // // // //           {/* NEW: Add Project Button for Leaf Subdomains */}
// // // // // //           {isLeaf && (
// // // // // //             <button 
// // // // // //               className="action-button project" 
// // // // // //               onClick={() => onAddProject(subDomain)}
// // // // // //               title={`Add project to "${subDomain.title}"`}
// // // // // //             >
// // // // // //               <FiFileText />
// // // // // //             </button>
// // // // // //           )}
          
// // // // // //           <button 
// // // // // //             className="action-button add" 
// // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // //           >
// // // // // //             <FiPlus />
// // // // // //           </button>
          
// // // // // //           <div className="action-menu">
// // // // // //             <button 
// // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // //               title="More actions"
// // // // // //             >
// // // // // //               <FiMoreVertical />
// // // // // //             </button>
// // // // // //             {showMenu && (
// // // // // //               <div className="dropdown-menu">
// // // // // //                 {/* NEW: Add Project Option for Leaf Subdomains */}
// // // // // //                 {isLeaf && (
// // // // // //                   <button 
// // // // // //                     onClick={() => {
// // // // // //                       onAddProject(subDomain);
// // // // // //                       setShowMenu(false);
// // // // // //                     }}
// // // // // //                     className="primary-option"
// // // // // //                   >
// // // // // //                     <FiFileText /> Add Project
// // // // // //                   </button>
// // // // // //                 )}
// // // // // //                 <button onClick={() => {
// // // // // //                   onEdit(subDomain);
// // // // // //                   setShowMenu(false);
// // // // // //                 }}>
// // // // // //                   <FiEdit /> Edit SubDomain
// // // // // //                 </button>
// // // // // //                 <button onClick={() => {
// // // // // //                   onAddChild(subDomain);
// // // // // //                   setShowMenu(false);
// // // // // //                 }}>
// // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // //                 </button>
// // // // // //                 <button onClick={() => {
// // // // // //                   onDelete(subDomain);
// // // // // //                   setShowMenu(false);
// // // // // //                 }} className="danger">
// // // // // //                   <FiTrash2 /> Delete SubDomain
// // // // // //                 </button>
// // // // // //               </div>
// // // // // //             )}
// // // // // //           </div>
// // // // // //         </div>
// // // // // //       </div>
      
// // // // // //       {/* Children */}
// // // // // //       {hasChildren && isExpanded && (
// // // // // //         <div className="node-children">
// // // // // //           {subDomain.children.map((child) => (
// // // // // //             <SubDomainNode
// // // // // //               key={child.id}
// // // // // //               subDomain={child}
// // // // // //               level={level + 1}
// // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // //               onEdit={onEdit}
// // // // // //               onDelete={onDelete}
// // // // // //               onAddChild={onAddChild}
// // // // // //               onAddProject={onAddProject} // NEW
// // // // // //               expandedNodes={expandedNodes}
// // // // // //             />
// // // // // //           ))}
// // // // // //         </div>
// // // // // //       )}
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // // SubDomain Modal Component (unchanged)
// // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // //   const [formData, setFormData] = useState({
// // // // // //     title: subDomain?.title || '',
// // // // // //     description: subDomain?.description || ''
// // // // // //   });
// // // // // //   const [loading, setLoading] = useState(false);

// // // // // //   const handleSubmit = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     setLoading(true);

// // // // // //     try {
// // // // // //       const requestData = {
// // // // // //         title: formData.title.trim(),
// // // // // //         description: formData.description.trim(),
// // // // // //         domainId: domain.id,
// // // // // //         parentId: parent?.id || null
// // // // // //       };

// // // // // //       console.log('💾 SUBDOMAIN SAVE - Request data:', requestData);

// // // // // //       if (subDomain) {
// // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // //         toast.success('Sub-domain updated successfully');
// // // // // //       } else {
// // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // //         toast.success('Sub-domain created successfully');
// // // // // //       }

// // // // // //       onSave();
// // // // // //     } catch (error) {
// // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // //       const errorMessage = error.response?.data?.message || 'Failed to save sub-domain';
// // // // // //       toast.error(errorMessage);
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   const getModalTitle = () => {
// // // // // //     if (subDomain) {
// // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // //     }
// // // // // //     if (parent) {
// // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // //     }
// // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="modal-overlay">
// // // // // //       <div className="modal">
// // // // // //         <div className="modal-header">
// // // // // //           <h2>{getModalTitle()}</h2>
// // // // // //           <button onClick={onClose}>×</button>
// // // // // //         </div>
        
// // // // // //         <form onSubmit={handleSubmit}>
// // // // // //           <div className="form-group">
// // // // // //             <label>SubDomain Title *</label>
// // // // // //             <input
// // // // // //               type="text"
// // // // // //               value={formData.title}
// // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // //               required
// // // // // //               minLength={3}
// // // // // //               maxLength={100}
// // // // // //             />
// // // // // //           </div>
          
// // // // // //           <div className="form-group">
// // // // // //             <label>Description (Optional)</label>
// // // // // //             <textarea
// // // // // //               value={formData.description}
// // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // //               rows={3}
// // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // //               maxLength={500}
// // // // // //             />
// // // // // //           </div>
          
// // // // // //           <div className="modal-info">
// // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // //             {parent && (
// // // // // //               <>
// // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // //               </>
// // // // // //             )}
// // // // // //             <strong>Level:</strong> {parent ? `Level ${(parent.level || 0) + 1}` : 'Root Level'}
// // // // // //           </div>
          
// // // // // //           <div className="modal-actions">
// // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // //               Cancel
// // // // // //             </button>
// // // // // //             <button 
// // // // // //               type="submit" 
// // // // // //               className="primary-button" 
// // // // // //               disabled={loading || !formData.title.trim()}
// // // // // //             >
// // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </form>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // // NEW: Project Modal Component for SubDomain context
// // // // // // const ProjectModal = ({ subDomain, domain, onClose, onSave }) => {
// // // // // //   const [formData, setFormData] = useState({
// // // // // //     title: '',
// // // // // //     abstract: '',
// // // // // //     specifications: '',
// // // // // //     learningOutcomes: '',
// // // // // //     subDomainId: subDomain?.id || '',
// // // // // //     isFeatured: false
// // // // // //   });
// // // // // //   const [loading, setLoading] = useState(false);

// // // // // //   console.log('📝 PROJECT MODAL - Props:', {
// // // // // //     subDomain: subDomain?.title,
// // // // // //     domain: domain?.title,
// // // // // //     formData
// // // // // //   });

// // // // // //   const handleSubmit = async (e) => {
// // // // // //     e.preventDefault();
// // // // // //     setLoading(true);

// // // // // //     try {
// // // // // //       console.log('💾 PROJECT SAVE - Starting API call with data:', formData);
      
// // // // // //       const response = await authService.createProject(formData);
// // // // // //       console.log('✅ PROJECT CREATE - Response:', response.data);
      
// // // // // //       onSave();
// // // // // //     } catch (error) {
// // // // // //       console.error('❌ PROJECT SAVE - Error:', error);
// // // // // //       toast.error('Failed to create project');
// // // // // //     } finally {
// // // // // //       setLoading(false);
// // // // // //     }
// // // // // //   };

// // // // // //   return (
// // // // // //     <div className="modal-overlay">
// // // // // //       <div className="modal large">
// // // // // //         <div className="modal-header">
// // // // // //           <h2>Add Project to: {subDomain?.title}</h2>
// // // // // //           <button onClick={onClose}>×</button>
// // // // // //         </div>
        
// // // // // //         <form onSubmit={handleSubmit}>
// // // // // //           <div className="form-group">
// // // // // //             <label>Project Title *</label>
// // // // // //             <input
// // // // // //               type="text"
// // // // // //               value={formData.title}
// // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // //               placeholder="Enter project title..."
// // // // // //               required
// // // // // //             />
// // // // // //           </div>
          
// // // // // //           <div className="modal-info">
// // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // //             <strong>SubDomain:</strong> {subDomain?.title || 'Unknown'}<br />
// // // // // //             <span className="info-note">
// // // // // //               <FiTarget /> This is a leaf subdomain - perfect for projects!
// // // // // //             </span>
// // // // // //           </div>
          
// // // // // //           <div className="form-group">
// // // // // //             <label>Abstract *</label>
// // // // // //             <textarea
// // // // // //               value={formData.abstract}
// // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, abstract: e.target.value }))}
// // // // // //               rows={4}
// // // // // //               placeholder="Brief description of the project..."
// // // // // //               required
// // // // // //             />
// // // // // //           </div>
          
// // // // // //           <div className="form-group">
// // // // // //             <label>Specifications *</label>
// // // // // //             <textarea
// // // // // //               value={formData.specifications}
// // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, specifications: e.target.value }))}
// // // // // //               rows={6}
// // // // // //               placeholder="Technical specifications and requirements..."
// // // // // //               required
// // // // // //             />
// // // // // //           </div>
          
// // // // // //           <div className="form-group">
// // // // // //             <label>Learning Outcomes *</label>
// // // // // //             <textarea
// // // // // //               value={formData.learningOutcomes}
// // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
// // // // // //               rows={4}
// // // // // //               placeholder="What will students learn from this project..."
// // // // // //               required
// // // // // //             />
// // // // // //           </div>
          
// // // // // //           <div className="form-group checkbox">
// // // // // //             <label>
// // // // // //               <input
// // // // // //                 type="checkbox"
// // // // // //                 checked={formData.isFeatured}
// // // // // //                 onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
// // // // // //               />
// // // // // //               <FiTarget />
// // // // // //               Featured Project
// // // // // //             </label>
// // // // // //           </div>
          
// // // // // //           <div className="modal-actions">
// // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // //               Cancel
// // // // // //             </button>
// // // // // //             <button 
// // // // // //               type="submit" 
// // // // // //               className="primary-button" 
// // // // // //               disabled={loading || !formData.title || !formData.abstract}
// // // // // //             >
// // // // // //               {loading ? 'Creating...' : 'Create Project'}
// // // // // //             </button>
// // // // // //           </div>
// // // // // //         </form>
// // // // // //       </div>
// // // // // //     </div>
// // // // // //   );
// // // // // // };

// // // // // // export default SubDomainManagement;


// // // // // // // // src/components/domains/SubDomainManagement.js - CORRECTED VERSION
// // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // import { authService } from '../../services/authService';
// // // // // // // import { toast } from 'react-toastify';
// // // // // // // import {
// // // // // // //   FiPlus,
// // // // // // //   FiEdit,
// // // // // // //   FiTrash2,
// // // // // // //   FiChevronDown,
// // // // // // //   FiChevronRight,
// // // // // // //   FiFolder,
// // // // // // //   FiFolderPlus,
// // // // // // //   FiFileText,
// // // // // // //   FiArrowLeft,
// // // // // // //   FiMoreVertical,
// // // // // // //   FiMove,
// // // // // // //   FiTarget
// // // // // // // } from 'react-icons/fi';

// // // // // // // const SubDomainManagement = () => {
// // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // //   const { domainId } = useParams();
// // // // // // //   const navigate = useNavigate();
  
// // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // //     domainId,
// // // // // // //     domain: domain?.title,
// // // // // // //     subDomainsCount: subDomains.length,
// // // // // // //     loading,
// // // // // // //     selectedParent: selectedParent?.title,
// // // // // // //     expandedCount: expandedNodes.size
// // // // // // //   });

// // // // // // //   useEffect(() => {
// // // // // // //     if (domainId) {
// // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // //       fetchDomainAndSubDomains();
// // // // // // //     }
// // // // // // //   }, [domainId]);

// // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // //     try {
// // // // // // //       setLoading(true);
      
// // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // //       // ✅ CORRECTED: Get domain details first (without query params to get all domains, then filter)
// // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getDomains (no params)');
// // // // // // //       const domainsResponse = await authService.getDomains();
// // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // // //       // Extract specific domain from response
// // // // // // //       let domainData = null;
// // // // // // //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// // // // // // //       if (domains.length > 0) {
// // // // // // //         domainData = domains.find(d => d.id == domainId);
// // // // // // //       }
      
// // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Found domain:', domainData);
      
// // // // // // //       // If we don't have domain data, create a placeholder
// // // // // // //       if (!domainData) {
// // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - No domain found, creating placeholder');
// // // // // // //         domainData = {
// // // // // // //           id: domainId,
// // // // // // //           title: `Domain ${domainId}`,
// // // // // // //           description: 'Domain not found in list',
// // // // // // //           projectCount: 0
// // // // // // //         };
// // // // // // //       }
      
// // // // // // //       setDomain(domainData);
      
// // // // // // //       // ✅ CORRECTED: Get subdomains using the correct API
// // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getSubDomains with domainId');
// // // // // // //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// // // // // // //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse.data);
      
// // // // // // //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted subdomains:', subDomainsData);
      
// // // // // // //       setSubDomains(subDomainsData);
      
// // // // // // //       // Auto-expand first level
// // // // // // //       if (subDomainsData.length > 0) {
// // // // // // //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// // // // // // //         setExpandedNodes(new Set(firstLevelIds));
// // // // // // //         console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // //       }
      
// // // // // // //       // ✅ ALTERNATIVE: Try hierarchy API as fallback
// // // // // // //       try {
// // // // // // //         console.log('🌐 SUBDOMAIN FETCH - Also trying getDomainHierarchy as fallback');
// // // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // // //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
        
// // // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // // //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// // // // // // //           console.log('🎯 SUBDOMAIN FETCH - Using hierarchy data instead');
// // // // // // //           setSubDomains(hierarchyData.subDomains);
          
// // // // // // //           // Update domain info if more complete
// // // // // // //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// // // // // // //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// // // // // // //           }
// // // // // // //         }
// // // // // // //       } catch (hierarchyError) {
// // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed (using subdomains list):', hierarchyError);
// // // // // // //       }
      
// // // // // // //     } catch (error) {
// // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // // //       // Create fallback domain
// // // // // // //       setDomain({
// // // // // // //         id: domainId,
// // // // // // //         title: `Domain ${domainId}`,
// // // // // // //         description: 'Error loading domain details',
// // // // // // //         projectCount: 0
// // // // // // //       });
// // // // // // //       setSubDomains([]);
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // //     setSelectedParent(parent);
// // // // // // //     setEditingSubDomain(null);
// // // // // // //     setShowAddModal(true);
    
// // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // //       showAddModal: true, 
// // // // // // //       selectedParent: parent?.title,
// // // // // // //       editingSubDomain: null 
// // // // // // //     });
// // // // // // //   };

// // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // //     setSelectedParent(null);
// // // // // // //     setEditingSubDomain(subDomain);
// // // // // // //     setShowAddModal(true);
// // // // // // //   };

// // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // //     if (hasChildren) {
// // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // //     }
// // // // // // //     if (hasProjects) {
// // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // //     }
    
// // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // //       return;
// // // // // // //     }

// // // // // // //     try {
// // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // //       fetchDomainAndSubDomains();
// // // // // // //     } catch (error) {
// // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // //       newExpanded.delete(nodeId);
// // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // //     } else {
// // // // // // //       newExpanded.add(nodeId);
// // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // //     }
// // // // // // //     setExpandedNodes(newExpanded);
// // // // // // //   };

// // // // // // //   if (loading) {
// // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // //     return (
// // // // // // //       <div className="loading-container">
// // // // // // //         <div className="loading-spinner"></div>
// // // // // // //         <p>Loading sub-domains...</p>
// // // // // // //       </div>
// // // // // // //     );
// // // // // // //   }

// // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // //   return (
// // // // // // //     <div className="subdomain-management">
// // // // // // //       {/* Header with Breadcrumb */}
// // // // // // //       <div className="page-header">
// // // // // // //         <div className="header-content">
// // // // // // //           <div className="breadcrumb">
// // // // // // //             <button 
// // // // // // //               className="breadcrumb-link"
// // // // // // //               onClick={() => navigate('/domains')}
// // // // // // //             >
// // // // // // //               <FiArrowLeft />
// // // // // // //               Domains
// // // // // // //             </button>
// // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // // //           </div>
// // // // // // //           <h1>SubDomain Management</h1>
// // // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // // //         </div>
// // // // // // //         <div className="header-actions">
// // // // // // //           <button 
// // // // // // //             className="primary-button" 
// // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // //           >
// // // // // // //             <FiPlus />
// // // // // // //             Add Root SubDomain
// // // // // // //           </button>
// // // // // // //         </div>
// // // // // // //       </div>

// // // // // // //       {/* Quick Guide */}
// // // // // // //       <div className="quick-guide">
// // // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // // //         <div className="guide-steps">
// // // // // // //           <div className="guide-step">
// // // // // // //             <span className="step-number">1</span>
// // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // //           </div>
// // // // // // //           <div className="guide-step">
// // // // // // //             <span className="step-number">2</span>
// // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // //           </div>
// // // // // // //           <div className="guide-step">
// // // // // // //             <span className="step-number">3</span>
// // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>

// // // // // // //       {/* Domain Info Card */}
// // // // // // //       {domain && (
// // // // // // //         <div className="domain-info-card">
// // // // // // //           <div className="domain-icon">
// // // // // // //             <FiFolder />
// // // // // // //           </div>
// // // // // // //           <div className="domain-details">
// // // // // // //             <h3>{domain.title}</h3>
// // // // // // //             <p>{domain.description}</p>
// // // // // // //             <div className="domain-stats">
// // // // // // //               <span className="stat-item">
// // // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // // //               </span>
// // // // // // //               <span className="stat-item">
// // // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // //               </span>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       )}

// // // // // // //       {/* SubDomain Tree */}
// // // // // // //       <div className="subdomain-tree-container">
// // // // // // //         <div className="tree-header">
// // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // //           <div className="tree-legend">
// // // // // // //             <span className="legend-item">
// // // // // // //               <FiFolder className="folder-icon" />
// // // // // // //               Has children
// // // // // // //             </span>
// // // // // // //             <span className="legend-item">
// // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // //               Leaf (can have projects)
// // // // // // //             </span>
// // // // // // //           </div>
// // // // // // //         </div>

// // // // // // //         {subDomains.length > 0 ? (
// // // // // // //           <div className="subdomain-tree">
// // // // // // //             {subDomains.map((subDomain) => (
// // // // // // //               <SubDomainNode
// // // // // // //                 key={subDomain.id}
// // // // // // //                 subDomain={subDomain}
// // // // // // //                 level={0}
// // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // //                 expandedNodes={expandedNodes}
// // // // // // //               />
// // // // // // //             ))}
// // // // // // //           </div>
// // // // // // //         ) : (
// // // // // // //           <div className="empty-tree-state">
// // // // // // //             <FiFolderPlus size={64} />
// // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // // //             <div className="empty-state-examples">
// // // // // // //               <h4>Example Structure:</h4>
// // // // // // //               <div className="example-tree">
// // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // //               </div>
// // // // // // //             </div>
// // // // // // //             <div className="empty-state-actions">
// // // // // // //               <button 
// // // // // // //                 className="primary-button large" 
// // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // //               >
// // // // // // //                 <FiPlus />
// // // // // // //                 Create Your First SubDomain
// // // // // // //               </button>
// // // // // // //               <p className="help-text">
// // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // //               </p>
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         )}
// // // // // // //       </div>

// // // // // // //       {/* Add/Edit Modal */}
// // // // // // //       {showAddModal && (
// // // // // // //         <SubDomainModal
// // // // // // //           subDomain={editingSubDomain}
// // // // // // //           parent={selectedParent}
// // // // // // //           domain={domain}
// // // // // // //           onClose={() => {
// // // // // // //             setShowAddModal(false);
// // // // // // //             setEditingSubDomain(null);
// // // // // // //             setSelectedParent(null);
// // // // // // //           }}
// // // // // // //           onSave={() => {
// // // // // // //             setShowAddModal(false);
// // // // // // //             setEditingSubDomain(null);
// // // // // // //             setSelectedParent(null);
// // // // // // //             fetchDomainAndSubDomains();
// // // // // // //           }}
// // // // // // //         />
// // // // // // //       )}
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // // SubDomain Node Component
// // // // // // // const SubDomainNode = ({ 
// // // // // // //   subDomain, 
// // // // // // //   level, 
// // // // // // //   isExpanded, 
// // // // // // //   onToggleExpanded, 
// // // // // // //   onEdit, 
// // // // // // //   onDelete, 
// // // // // // //   onAddChild,
// // // // // // //   expandedNodes 
// // // // // // // }) => {
// // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // //   const isLeaf = !hasChildren;

// // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // //     title: subDomain.title,
// // // // // // //     level,
// // // // // // //     hasChildren,
// // // // // // //     isLeaf,
// // // // // // //     isExpanded,
// // // // // // //     projectCount: subDomain.projectCount
// // // // // // //   });

// // // // // // //   return (
// // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // //       <div className="node-content">
// // // // // // //         <div className="node-main">
// // // // // // //           {hasChildren ? (
// // // // // // //             <button 
// // // // // // //               className="expand-button"
// // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // //             >
// // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // //             </button>
// // // // // // //           ) : (
// // // // // // //             <div className="expand-placeholder" />
// // // // // // //           )}
          
// // // // // // //           <div className="node-icon">
// // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // //           </div>
          
// // // // // // //           <div className="node-info">
// // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // //             <div className="node-stats">
// // // // // // //               {hasChildren && (
// // // // // // //                 <span className="stat-badge">
// // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // //                 </span>
// // // // // // //               )}
// // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // //                 <span className="stat-badge projects">
// // // // // // //                   {subDomain.projectCount} projects
// // // // // // //                 </span>
// // // // // // //               )}
// // // // // // //               {isLeaf && (
// // // // // // //                 <span className="stat-badge leaf">
// // // // // // //                   Can have projects
// // // // // // //                 </span>
// // // // // // //               )}
// // // // // // //             </div>
// // // // // // //           </div>
// // // // // // //         </div>
        
// // // // // // //         <div className="node-actions">
// // // // // // //           <button 
// // // // // // //             className="action-button add" 
// // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // //           >
// // // // // // //             <FiPlus />
// // // // // // //           </button>
// // // // // // //           <div className="action-menu">
// // // // // // //             <button 
// // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // //               title="More actions"
// // // // // // //             >
// // // // // // //               <FiMoreVertical />
// // // // // // //             </button>
// // // // // // //             {showMenu && (
// // // // // // //               <div className="dropdown-menu">
// // // // // // //                 <button onClick={() => {
// // // // // // //                   onEdit(subDomain);
// // // // // // //                   setShowMenu(false);
// // // // // // //                 }}>
// // // // // // //                   <FiEdit /> Edit
// // // // // // //                 </button>
// // // // // // //                 <button onClick={() => {
// // // // // // //                   onAddChild(subDomain);
// // // // // // //                   setShowMenu(false);
// // // // // // //                 }}>
// // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // //                 </button>
// // // // // // //                 <button onClick={() => {
// // // // // // //                   onDelete(subDomain);
// // // // // // //                   setShowMenu(false);
// // // // // // //                 }} className="danger">
// // // // // // //                   <FiTrash2 /> Delete
// // // // // // //                 </button>
// // // // // // //               </div>
// // // // // // //             )}
// // // // // // //           </div>
// // // // // // //         </div>
// // // // // // //       </div>
      
// // // // // // //       {/* Children */}
// // // // // // //       {hasChildren && isExpanded && (
// // // // // // //         <div className="node-children">
// // // // // // //           {subDomain.children.map((child) => (
// // // // // // //             <SubDomainNode
// // // // // // //               key={child.id}
// // // // // // //               subDomain={child}
// // // // // // //               level={level + 1}
// // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // //               onEdit={onEdit}
// // // // // // //               onDelete={onDelete}
// // // // // // //               onAddChild={onAddChild}
// // // // // // //               expandedNodes={expandedNodes}
// // // // // // //             />
// // // // // // //           ))}
// // // // // // //         </div>
// // // // // // //       )}
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // // SubDomain Modal Component - CORRECTED VERSION
// // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // //   const [formData, setFormData] = useState({
// // // // // // //     title: subDomain?.title || '',
// // // // // // //     description: subDomain?.description || ''
// // // // // // //   });
// // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // //     isEditing: !!subDomain,
// // // // // // //     parentTitle: parent?.title,
// // // // // // //     domainTitle: domain?.title,
// // // // // // //     formData
// // // // // // //   });

// // // // // // //   const handleSubmit = async (e) => {
// // // // // // //     e.preventDefault();
// // // // // // //     setLoading(true);

// // // // // // //     try {
// // // // // // //       const requestData = {
// // // // // // //         title: formData.title.trim(),
// // // // // // //         description: formData.description.trim(),
// // // // // // //         domainId: domain.id,
// // // // // // //         parentId: parent?.id || null
// // // // // // //       };

// // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // //       if (subDomain) {
// // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // //       } else {
// // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // //       }

// // // // // // //       onSave();
// // // // // // //     } catch (error) {
// // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error response:', error.response);
// // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error data:', error.response?.data);
      
// // // // // // //       const errorMessage = error.response?.data?.message || 
// // // // // // //                           error.response?.data?.error || 
// // // // // // //                           'Failed to save sub-domain';
// // // // // // //       toast.error(errorMessage);
// // // // // // //     } finally {
// // // // // // //       setLoading(false);
// // // // // // //     }
// // // // // // //   };

// // // // // // //   const getModalTitle = () => {
// // // // // // //     if (subDomain) {
// // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // //     }
// // // // // // //     if (parent) {
// // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // //     }
// // // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // // //   };

// // // // // // //   const getLevel = () => {
// // // // // // //     if (!parent) return 'Root Level';
// // // // // // //     return `Level ${(parent.level || 0) + 1}`;
// // // // // // //   };

// // // // // // //   return (
// // // // // // //     <div className="modal-overlay">
// // // // // // //       <div className="modal">
// // // // // // //         <div className="modal-header">
// // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // //           <button onClick={onClose}>×</button>
// // // // // // //         </div>
        
// // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // //           <div className="form-group">
// // // // // // //             <label>SubDomain Title *</label>
// // // // // // //             <input
// // // // // // //               type="text"
// // // // // // //               value={formData.title}
// // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // //               required
// // // // // // //               minLength={3}
// // // // // // //               maxLength={100}
// // // // // // //             />
// // // // // // //           </div>
          
// // // // // // //           <div className="form-group">
// // // // // // //             <label>Description (Optional)</label>
// // // // // // //             <textarea
// // // // // // //               value={formData.description}
// // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // //               rows={3}
// // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // //               maxLength={500}
// // // // // // //             />
// // // // // // //           </div>
          
// // // // // // //           <div className="modal-info">
// // // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // // //             {parent && (
// // // // // // //               <>
// // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // //               </>
// // // // // // //             )}
// // // // // // //             <strong>Level:</strong> {getLevel()}
// // // // // // //           </div>
          
// // // // // // //           <div className="modal-actions">
// // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // //               Cancel
// // // // // // //             </button>
// // // // // // //             <button 
// // // // // // //               type="submit" 
// // // // // // //               className="primary-button" 
// // // // // // //               disabled={loading || !formData.title.trim()}
// // // // // // //             >
// // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // //             </button>
// // // // // // //           </div>
// // // // // // //         </form>
// // // // // // //       </div>
// // // // // // //     </div>
// // // // // // //   );
// // // // // // // };

// // // // // // // export default SubDomainManagement;







// // // // // // // // // src/components/domains/SubDomainManagement.js - CORRECTED VERSION
// // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // // import { authService } from '../../services/authService';
// // // // // // // // import { toast } from 'react-toastify';
// // // // // // // // import {
// // // // // // // //   FiPlus,
// // // // // // // //   FiEdit,
// // // // // // // //   FiTrash2,
// // // // // // // //   FiChevronDown,
// // // // // // // //   FiChevronRight,
// // // // // // // //   FiFolder,
// // // // // // // //   FiFolderPlus,
// // // // // // // //   FiFileText,
// // // // // // // //   FiArrowLeft,
// // // // // // // //   FiMoreVertical,
// // // // // // // //   FiMove,
// // // // // // // //   FiTarget
// // // // // // // // } from 'react-icons/fi';

// // // // // // // // const SubDomainManagement = () => {
// // // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // // //   const { domainId } = useParams();
// // // // // // // //   const navigate = useNavigate();
  
// // // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // // //     domainId,
// // // // // // // //     domain: domain?.title,
// // // // // // // //     subDomainsCount: subDomains.length,
// // // // // // // //     loading,
// // // // // // // //     selectedParent: selectedParent?.title,
// // // // // // // //     expandedCount: expandedNodes.size
// // // // // // // //   });

// // // // // // // //   useEffect(() => {
// // // // // // // //     if (domainId) {
// // // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // //     }
// // // // // // // //   }, [domainId]);

// // // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // // //     try {
// // // // // // // //       setLoading(true);
      
// // // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // // //       // ✅ CORRECTED: Get domain details first (without query params to get all domains, then filter)
// // // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getDomains (no params)');
// // // // // // // //       const domainsResponse = await authService.getDomains();
// // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // // // //       // Extract specific domain from response
// // // // // // // //       let domainData = null;
// // // // // // // //       const domains = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
// // // // // // // //       if (domains.length > 0) {
// // // // // // // //         domainData = domains.find(d => d.id == domainId);
// // // // // // // //       }
      
// // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Found domain:', domainData);
      
// // // // // // // //       // If we don't have domain data, create a placeholder
// // // // // // // //       if (!domainData) {
// // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - No domain found, creating placeholder');
// // // // // // // //         domainData = {
// // // // // // // //           id: domainId,
// // // // // // // //           title: `Domain ${domainId}`,
// // // // // // // //           description: 'Domain not found in list',
// // // // // // // //           projectCount: 0
// // // // // // // //         };
// // // // // // // //       }
      
// // // // // // // //       setDomain(domainData);
      
// // // // // // // //       // ✅ CORRECTED: Get subdomains using the correct API
// // // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getSubDomains with domainId');
// // // // // // // //       const subDomainsResponse = await authService.getSubDomains({ domainId: domainId });
// // // // // // // //       console.log('✅ SUBDOMAIN FETCH - SubDomains response:', subDomainsResponse.data);
      
// // // // // // // //       const subDomainsData = subDomainsResponse.data?.subDomains || subDomainsResponse.data?.data?.subDomains || [];
// // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted subdomains:', subDomainsData);
      
// // // // // // // //       setSubDomains(subDomainsData);
      
// // // // // // // //       // Auto-expand first level
// // // // // // // //       if (subDomainsData.length > 0) {
// // // // // // // //         const firstLevelIds = subDomainsData.map(sd => sd.id);
// // // // // // // //         setExpandedNodes(new Set(firstLevelIds));
// // // // // // // //         console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // // //       }
      
// // // // // // // //       // ✅ ALTERNATIVE: Try hierarchy API as fallback
// // // // // // // //       try {
// // // // // // // //         console.log('🌐 SUBDOMAIN FETCH - Also trying getDomainHierarchy as fallback');
// // // // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // // // //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
        
// // // // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // // // //         if (hierarchyData?.subDomains && hierarchyData.subDomains.length > 0) {
// // // // // // // //           console.log('🎯 SUBDOMAIN FETCH - Using hierarchy data instead');
// // // // // // // //           setSubDomains(hierarchyData.subDomains);
          
// // // // // // // //           // Update domain info if more complete
// // // // // // // //           if (hierarchyData.title && !domainData.title.includes('Domain ')) {
// // // // // // // //             setDomain(prev => ({ ...prev, ...hierarchyData }));
// // // // // // // //           }
// // // // // // // //         }
// // // // // // // //       } catch (hierarchyError) {
// // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed (using subdomains list):', hierarchyError);
// // // // // // // //       }
      
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // // // //       // Create fallback domain
// // // // // // // //       setDomain({
// // // // // // // //         id: domainId,
// // // // // // // //         title: `Domain ${domainId}`,
// // // // // // // //         description: 'Error loading domain details',
// // // // // // // //         projectCount: 0
// // // // // // // //       });
// // // // // // // //       setSubDomains([]);
// // // // // // // //     } finally {
// // // // // // // //       setLoading(false);
// // // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // // //     setSelectedParent(parent);
// // // // // // // //     setEditingSubDomain(null);
// // // // // // // //     setShowAddModal(true);
    
// // // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // // //       showAddModal: true, 
// // // // // // // //       selectedParent: parent?.title,
// // // // // // // //       editingSubDomain: null 
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // // //     setSelectedParent(null);
// // // // // // // //     setEditingSubDomain(subDomain);
// // // // // // // //     setShowAddModal(true);
// // // // // // // //   };

// // // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // // //     if (hasChildren) {
// // // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // // //     }
// // // // // // // //     if (hasProjects) {
// // // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // // //     }
    
// // // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // // //       return;
// // // // // // // //     }

// // // // // // // //     try {
// // // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // // //       newExpanded.delete(nodeId);
// // // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // // //     } else {
// // // // // // // //       newExpanded.add(nodeId);
// // // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // // //     }
// // // // // // // //     setExpandedNodes(newExpanded);
// // // // // // // //   };

// // // // // // // //   if (loading) {
// // // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // // //     return (
// // // // // // // //       <div className="loading-container">
// // // // // // // //         <div className="loading-spinner"></div>
// // // // // // // //         <p>Loading sub-domains...</p>
// // // // // // // //       </div>
// // // // // // // //     );
// // // // // // // //   }

// // // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // // //   return (
// // // // // // // //     <div className="subdomain-management">
// // // // // // // //       {/* Header with Breadcrumb */}
// // // // // // // //       <div className="page-header">
// // // // // // // //         <div className="header-content">
// // // // // // // //           <div className="breadcrumb">
// // // // // // // //             <button 
// // // // // // // //               className="breadcrumb-link"
// // // // // // // //               onClick={() => navigate('/domains')}
// // // // // // // //             >
// // // // // // // //               <FiArrowLeft />
// // // // // // // //               Domains
// // // // // // // //             </button>
// // // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // // // //           </div>
// // // // // // // //           <h1>SubDomain Management</h1>
// // // // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // // // //         </div>
// // // // // // // //         <div className="header-actions">
// // // // // // // //           <button 
// // // // // // // //             className="primary-button" 
// // // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // // //           >
// // // // // // // //             <FiPlus />
// // // // // // // //             Add Root SubDomain
// // // // // // // //           </button>
// // // // // // // //         </div>
// // // // // // // //       </div>

// // // // // // // //       {/* Quick Guide */}
// // // // // // // //       <div className="quick-guide">
// // // // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // // // //         <div className="guide-steps">
// // // // // // // //           <div className="guide-step">
// // // // // // // //             <span className="step-number">1</span>
// // // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // // //           </div>
// // // // // // // //           <div className="guide-step">
// // // // // // // //             <span className="step-number">2</span>
// // // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // // //           </div>
// // // // // // // //           <div className="guide-step">
// // // // // // // //             <span className="step-number">3</span>
// // // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>

// // // // // // // //       {/* Domain Info Card */}
// // // // // // // //       {domain && (
// // // // // // // //         <div className="domain-info-card">
// // // // // // // //           <div className="domain-icon">
// // // // // // // //             <FiFolder />
// // // // // // // //           </div>
// // // // // // // //           <div className="domain-details">
// // // // // // // //             <h3>{domain.title}</h3>
// // // // // // // //             <p>{domain.description}</p>
// // // // // // // //             <div className="domain-stats">
// // // // // // // //               <span className="stat-item">
// // // // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // // // //               </span>
// // // // // // // //               <span className="stat-item">
// // // // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // // //               </span>
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       )}

// // // // // // // //       {/* SubDomain Tree */}
// // // // // // // //       <div className="subdomain-tree-container">
// // // // // // // //         <div className="tree-header">
// // // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // // //           <div className="tree-legend">
// // // // // // // //             <span className="legend-item">
// // // // // // // //               <FiFolder className="folder-icon" />
// // // // // // // //               Has children
// // // // // // // //             </span>
// // // // // // // //             <span className="legend-item">
// // // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // // //               Leaf (can have projects)
// // // // // // // //             </span>
// // // // // // // //           </div>
// // // // // // // //         </div>

// // // // // // // //         {subDomains.length > 0 ? (
// // // // // // // //           <div className="subdomain-tree">
// // // // // // // //             {subDomains.map((subDomain) => (
// // // // // // // //               <SubDomainNode
// // // // // // // //                 key={subDomain.id}
// // // // // // // //                 subDomain={subDomain}
// // // // // // // //                 level={0}
// // // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // // //                 expandedNodes={expandedNodes}
// // // // // // // //               />
// // // // // // // //             ))}
// // // // // // // //           </div>
// // // // // // // //         ) : (
// // // // // // // //           <div className="empty-tree-state">
// // // // // // // //             <FiFolderPlus size={64} />
// // // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // // // //             <div className="empty-state-examples">
// // // // // // // //               <h4>Example Structure:</h4>
// // // // // // // //               <div className="example-tree">
// // // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // // //               </div>
// // // // // // // //             </div>
// // // // // // // //             <div className="empty-state-actions">
// // // // // // // //               <button 
// // // // // // // //                 className="primary-button large" 
// // // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // // //               >
// // // // // // // //                 <FiPlus />
// // // // // // // //                 Create Your First SubDomain
// // // // // // // //               </button>
// // // // // // // //               <p className="help-text">
// // // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // // //               </p>
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         )}
// // // // // // // //       </div>

// // // // // // // //       {/* Add/Edit Modal */}
// // // // // // // //       {showAddModal && (
// // // // // // // //         <SubDomainModal
// // // // // // // //           subDomain={editingSubDomain}
// // // // // // // //           parent={selectedParent}
// // // // // // // //           domain={domain}
// // // // // // // //           onClose={() => {
// // // // // // // //             setShowAddModal(false);
// // // // // // // //             setEditingSubDomain(null);
// // // // // // // //             setSelectedParent(null);
// // // // // // // //           }}
// // // // // // // //           onSave={() => {
// // // // // // // //             setShowAddModal(false);
// // // // // // // //             setEditingSubDomain(null);
// // // // // // // //             setSelectedParent(null);
// // // // // // // //             fetchDomainAndSubDomains();
// // // // // // // //           }}
// // // // // // // //         />
// // // // // // // //       )}
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // // SubDomain Node Component
// // // // // // // // const SubDomainNode = ({ 
// // // // // // // //   subDomain, 
// // // // // // // //   level, 
// // // // // // // //   isExpanded, 
// // // // // // // //   onToggleExpanded, 
// // // // // // // //   onEdit, 
// // // // // // // //   onDelete, 
// // // // // // // //   onAddChild,
// // // // // // // //   expandedNodes 
// // // // // // // // }) => {
// // // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // //   const isLeaf = !hasChildren;

// // // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // // //     title: subDomain.title,
// // // // // // // //     level,
// // // // // // // //     hasChildren,
// // // // // // // //     isLeaf,
// // // // // // // //     isExpanded,
// // // // // // // //     projectCount: subDomain.projectCount
// // // // // // // //   });

// // // // // // // //   return (
// // // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // // //       <div className="node-content">
// // // // // // // //         <div className="node-main">
// // // // // // // //           {hasChildren ? (
// // // // // // // //             <button 
// // // // // // // //               className="expand-button"
// // // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // // //             >
// // // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // // //             </button>
// // // // // // // //           ) : (
// // // // // // // //             <div className="expand-placeholder" />
// // // // // // // //           )}
          
// // // // // // // //           <div className="node-icon">
// // // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // // //           </div>
          
// // // // // // // //           <div className="node-info">
// // // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // // //             <div className="node-stats">
// // // // // // // //               {hasChildren && (
// // // // // // // //                 <span className="stat-badge">
// // // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // // //                 </span>
// // // // // // // //               )}
// // // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // // //                 <span className="stat-badge projects">
// // // // // // // //                   {subDomain.projectCount} projects
// // // // // // // //                 </span>
// // // // // // // //               )}
// // // // // // // //               {isLeaf && (
// // // // // // // //                 <span className="stat-badge leaf">
// // // // // // // //                   Can have projects
// // // // // // // //                 </span>
// // // // // // // //               )}
// // // // // // // //             </div>
// // // // // // // //           </div>
// // // // // // // //         </div>
        
// // // // // // // //         <div className="node-actions">
// // // // // // // //           <button 
// // // // // // // //             className="action-button add" 
// // // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // // //           >
// // // // // // // //             <FiPlus />
// // // // // // // //           </button>
// // // // // // // //           <div className="action-menu">
// // // // // // // //             <button 
// // // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // // //               title="More actions"
// // // // // // // //             >
// // // // // // // //               <FiMoreVertical />
// // // // // // // //             </button>
// // // // // // // //             {showMenu && (
// // // // // // // //               <div className="dropdown-menu">
// // // // // // // //                 <button onClick={() => {
// // // // // // // //                   onEdit(subDomain);
// // // // // // // //                   setShowMenu(false);
// // // // // // // //                 }}>
// // // // // // // //                   <FiEdit /> Edit
// // // // // // // //                 </button>
// // // // // // // //                 <button onClick={() => {
// // // // // // // //                   onAddChild(subDomain);
// // // // // // // //                   setShowMenu(false);
// // // // // // // //                 }}>
// // // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // // //                 </button>
// // // // // // // //                 <button onClick={() => {
// // // // // // // //                   onDelete(subDomain);
// // // // // // // //                   setShowMenu(false);
// // // // // // // //                 }} className="danger">
// // // // // // // //                   <FiTrash2 /> Delete
// // // // // // // //                 </button>
// // // // // // // //               </div>
// // // // // // // //             )}
// // // // // // // //           </div>
// // // // // // // //         </div>
// // // // // // // //       </div>
      
// // // // // // // //       {/* Children */}
// // // // // // // //       {hasChildren && isExpanded && (
// // // // // // // //         <div className="node-children">
// // // // // // // //           {subDomain.children.map((child) => (
// // // // // // // //             <SubDomainNode
// // // // // // // //               key={child.id}
// // // // // // // //               subDomain={child}
// // // // // // // //               level={level + 1}
// // // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // // //               onEdit={onEdit}
// // // // // // // //               onDelete={onDelete}
// // // // // // // //               onAddChild={onAddChild}
// // // // // // // //               expandedNodes={expandedNodes}
// // // // // // // //             />
// // // // // // // //           ))}
// // // // // // // //         </div>
// // // // // // // //       )}
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // // SubDomain Modal Component - CORRECTED VERSION
// // // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // //     title: subDomain?.title || '',
// // // // // // // //     description: subDomain?.description || ''
// // // // // // // //   });
// // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // // //     isEditing: !!subDomain,
// // // // // // // //     parentTitle: parent?.title,
// // // // // // // //     domainTitle: domain?.title,
// // // // // // // //     formData
// // // // // // // //   });

// // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // //     e.preventDefault();
// // // // // // // //     setLoading(true);

// // // // // // // //     try {
// // // // // // // //       const requestData = {
// // // // // // // //         title: formData.title.trim(),
// // // // // // // //         description: formData.description.trim(),
// // // // // // // //         domainId: domain.id,
// // // // // // // //         parentId: parent?.id || null
// // // // // // // //       };

// // // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // // //       if (subDomain) {
// // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // // //       } else {
// // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // // //       }

// // // // // // // //       onSave();
// // // // // // // //     } catch (error) {
// // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error response:', error.response);
// // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error data:', error.response?.data);
      
// // // // // // // //       const errorMessage = error.response?.data?.message || 
// // // // // // // //                           error.response?.data?.error || 
// // // // // // // //                           'Failed to save sub-domain';
// // // // // // // //       toast.error(errorMessage);
// // // // // // // //     } finally {
// // // // // // // //       setLoading(false);
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   const getModalTitle = () => {
// // // // // // // //     if (subDomain) {
// // // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // // //     }
// // // // // // // //     if (parent) {
// // // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // // //     }
// // // // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // // // //   };

// // // // // // // //   const getLevel = () => {
// // // // // // // //     if (!parent) return 'Root Level';
// // // // // // // //     return `Level ${(parent.level || 0) + 1}`;
// // // // // // // //   };

// // // // // // // //   return (
// // // // // // // //     <div className="modal-overlay">
// // // // // // // //       <div className="modal">
// // // // // // // //         <div className="modal-header">
// // // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // // //           <button onClick={onClose}>×</button>
// // // // // // // //         </div>
        
// // // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // // //           <div className="form-group">
// // // // // // // //             <label>SubDomain Title *</label>
// // // // // // // //             <input
// // // // // // // //               type="text"
// // // // // // // //               value={formData.title}
// // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // // //               required
// // // // // // // //               minLength={3}
// // // // // // // //               maxLength={100}
// // // // // // // //             />
// // // // // // // //           </div>
          
// // // // // // // //           <div className="form-group">
// // // // // // // //             <label>Description (Optional)</label>
// // // // // // // //             <textarea
// // // // // // // //               value={formData.description}
// // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // // //               rows={3}
// // // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // // //               maxLength={500}
// // // // // // // //             />
// // // // // // // //           </div>
          
// // // // // // // //           <div className="modal-info">
// // // // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // // // //             {parent && (
// // // // // // // //               <>
// // // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // // //               </>
// // // // // // // //             )}
// // // // // // // //             <strong>Level:</strong> {getLevel()}
// // // // // // // //           </div>
          
// // // // // // // //           <div className="modal-actions">
// // // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // // //               Cancel
// // // // // // // //             </button>
// // // // // // // //             <button 
// // // // // // // //               type="submit" 
// // // // // // // //               className="primary-button" 
// // // // // // // //               disabled={loading || !formData.title.trim()}
// // // // // // // //             >
// // // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // // //             </button>
// // // // // // // //           </div>
// // // // // // // //         </form>
// // // // // // // //       </div>
// // // // // // // //     </div>
// // // // // // // //   );
// // // // // // // // };

// // // // // // // // export default SubDomainManagement;


// // // // // // // // // // src/components/domains/SubDomainManagement.js - FIXED VERSION
// // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // // // import { authService } from '../../services/authService';
// // // // // // // // // import { toast } from 'react-toastify';
// // // // // // // // // import {
// // // // // // // // //   FiPlus,
// // // // // // // // //   FiEdit,
// // // // // // // // //   FiTrash2,
// // // // // // // // //   FiChevronDown,
// // // // // // // // //   FiChevronRight,
// // // // // // // // //   FiFolder,
// // // // // // // // //   FiFolderPlus,
// // // // // // // // //   FiFileText,
// // // // // // // // //   FiArrowLeft,
// // // // // // // // //   FiMoreVertical,
// // // // // // // // //   FiMove,
// // // // // // // // //   FiTarget
// // // // // // // // // } from 'react-icons/fi';

// // // // // // // // // const SubDomainManagement = () => {
// // // // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // // // //   const { domainId } = useParams();
// // // // // // // // //   const navigate = useNavigate();
  
// // // // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // // // //     domainId,
// // // // // // // // //     domain: domain?.title,
// // // // // // // // //     subDomainsCount: subDomains.length,
// // // // // // // // //     loading,
// // // // // // // // //     selectedParent: selectedParent?.title,
// // // // // // // // //     expandedCount: expandedNodes.size
// // // // // // // // //   });

// // // // // // // // //   useEffect(() => {
// // // // // // // // //     if (domainId) {
// // // // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // //     }
// // // // // // // // //   }, [domainId]);

// // // // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // // // //     try {
// // // // // // // // //       setLoading(true);
      
// // // // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // // // //       // First, let's try to get domain details
// // // // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getDomains with filter');
// // // // // // // // //       const domainsResponse = await authService.getDomains({ id: domainId });
// // // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // // // // //       // Extract domain from response
// // // // // // // // //       let domainData = null;
// // // // // // // // //       if (domainsResponse.data?.domains && domainsResponse.data.domains.length > 0) {
// // // // // // // // //         domainData = domainsResponse.data.domains.find(d => d.id == domainId);
// // // // // // // // //       } else if (domainsResponse.data?.data?.domains && domainsResponse.data.data.domains.length > 0) {
// // // // // // // // //         domainData = domainsResponse.data.data.domains.find(d => d.id == domainId);
// // // // // // // // //       } else if (Array.isArray(domainsResponse.data)) {
// // // // // // // // //         domainData = domainsResponse.data.find(d => d.id == domainId);
// // // // // // // // //       }
      
// // // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted domain:', domainData);
      
// // // // // // // // //       // If we don't have domain data, create a placeholder
// // // // // // // // //       if (!domainData) {
// // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - No domain found, creating placeholder');
// // // // // // // // //         domainData = {
// // // // // // // // //           id: domainId,
// // // // // // // // //           title: `Domain ${domainId}`,
// // // // // // // // //           description: 'Loading domain details...',
// // // // // // // // //           projectCount: 0
// // // // // // // // //         };
// // // // // // // // //       }
      
// // // // // // // // //       setDomain(domainData);
      
// // // // // // // // //       // Try to get hierarchy if domain exists
// // // // // // // // //       try {
// // // // // // // // //         console.log('🌐 SUBDOMAIN FETCH - Calling getDomainHierarchy');
// // // // // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // // // // //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
        
// // // // // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // // // // //         console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
// // // // // // // // //         setSubDomains(hierarchyData?.subDomains || []);
        
// // // // // // // // //         // Auto-expand first level
// // // // // // // // //         if (hierarchyData?.subDomains?.length > 0) {
// // // // // // // // //           const firstLevelIds = hierarchyData.subDomains.map(sd => sd.id);
// // // // // // // // //           setExpandedNodes(new Set(firstLevelIds));
// // // // // // // // //           console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // // // //         }
// // // // // // // // //       } catch (hierarchyError) {
// // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed, starting with empty structure:', hierarchyError);
// // // // // // // // //         setSubDomains([]);
// // // // // // // // //       }
      
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // // // // //       // Create fallback domain
// // // // // // // // //       setDomain({
// // // // // // // // //         id: domainId,
// // // // // // // // //         title: `Domain ${domainId}`,
// // // // // // // // //         description: 'Error loading domain details',
// // // // // // // // //         projectCount: 0
// // // // // // // // //       });
// // // // // // // // //       setSubDomains([]);
// // // // // // // // //     } finally {
// // // // // // // // //       setLoading(false);
// // // // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // // // //     setSelectedParent(parent);
// // // // // // // // //     setEditingSubDomain(null);
// // // // // // // // //     setShowAddModal(true);
    
// // // // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // // // //       showAddModal: true, 
// // // // // // // // //       selectedParent: parent?.title,
// // // // // // // // //       editingSubDomain: null 
// // // // // // // // //     });
// // // // // // // // //   };

// // // // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // // // //     setSelectedParent(null);
// // // // // // // // //     setEditingSubDomain(subDomain);
// // // // // // // // //     setShowAddModal(true);
// // // // // // // // //   };

// // // // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // // // //     if (hasChildren) {
// // // // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // // // //     }
// // // // // // // // //     if (hasProjects) {
// // // // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // // // //     }
    
// // // // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // // // //       return;
// // // // // // // // //     }

// // // // // // // // //     try {
// // // // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // // // //       newExpanded.delete(nodeId);
// // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // // // //     } else {
// // // // // // // // //       newExpanded.add(nodeId);
// // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // // // //     }
// // // // // // // // //     setExpandedNodes(newExpanded);
// // // // // // // // //   };

// // // // // // // // //   if (loading) {
// // // // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // // // //     return (
// // // // // // // // //       <div className="loading-container">
// // // // // // // // //         <div className="loading-spinner"></div>
// // // // // // // // //         <p>Loading sub-domains...</p>
// // // // // // // // //       </div>
// // // // // // // // //     );
// // // // // // // // //   }

// // // // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // // // //   return (
// // // // // // // // //     <div className="subdomain-management">
// // // // // // // // //       {/* Header with Breadcrumb */}
// // // // // // // // //       <div className="page-header">
// // // // // // // // //         <div className="header-content">
// // // // // // // // //           <div className="breadcrumb">
// // // // // // // // //             <button 
// // // // // // // // //               className="breadcrumb-link"
// // // // // // // // //               onClick={() => navigate('/domains')}
// // // // // // // // //             >
// // // // // // // // //               <FiArrowLeft />
// // // // // // // // //               Domains
// // // // // // // // //             </button>
// // // // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // // // // //           </div>
// // // // // // // // //           <h1>SubDomain Management</h1>
// // // // // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // // // // //         </div>
// // // // // // // // //         <div className="header-actions">
// // // // // // // // //           <button 
// // // // // // // // //             className="primary-button" 
// // // // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // // // //           >
// // // // // // // // //             <FiPlus />
// // // // // // // // //             Add Root SubDomain
// // // // // // // // //           </button>
// // // // // // // // //         </div>
// // // // // // // // //       </div>

// // // // // // // // //       {/* Quick Guide */}
// // // // // // // // //       <div className="quick-guide">
// // // // // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // // // // //         <div className="guide-steps">
// // // // // // // // //           <div className="guide-step">
// // // // // // // // //             <span className="step-number">1</span>
// // // // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // // // //           </div>
// // // // // // // // //           <div className="guide-step">
// // // // // // // // //             <span className="step-number">2</span>
// // // // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // // // //           </div>
// // // // // // // // //           <div className="guide-step">
// // // // // // // // //             <span className="step-number">3</span>
// // // // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       </div>

// // // // // // // // //       {/* Domain Info Card */}
// // // // // // // // //       {domain && (
// // // // // // // // //         <div className="domain-info-card">
// // // // // // // // //           <div className="domain-icon">
// // // // // // // // //             <FiFolder />
// // // // // // // // //           </div>
// // // // // // // // //           <div className="domain-details">
// // // // // // // // //             <h3>{domain.title}</h3>
// // // // // // // // //             <p>{domain.description}</p>
// // // // // // // // //             <div className="domain-stats">
// // // // // // // // //               <span className="stat-item">
// // // // // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // // // // //               </span>
// // // // // // // // //               <span className="stat-item">
// // // // // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // // // //               </span>
// // // // // // // // //             </div>
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       )}

// // // // // // // // //       {/* SubDomain Tree */}
// // // // // // // // //       <div className="subdomain-tree-container">
// // // // // // // // //         <div className="tree-header">
// // // // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // // // //           <div className="tree-legend">
// // // // // // // // //             <span className="legend-item">
// // // // // // // // //               <FiFolder className="folder-icon" />
// // // // // // // // //               Has children
// // // // // // // // //             </span>
// // // // // // // // //             <span className="legend-item">
// // // // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // // // //               Leaf (can have projects)
// // // // // // // // //             </span>
// // // // // // // // //           </div>
// // // // // // // // //         </div>

// // // // // // // // //         {subDomains.length > 0 ? (
// // // // // // // // //           <div className="subdomain-tree">
// // // // // // // // //             {subDomains.map((subDomain) => (
// // // // // // // // //               <SubDomainNode
// // // // // // // // //                 key={subDomain.id}
// // // // // // // // //                 subDomain={subDomain}
// // // // // // // // //                 level={0}
// // // // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // // // //                 expandedNodes={expandedNodes}
// // // // // // // // //               />
// // // // // // // // //             ))}
// // // // // // // // //           </div>
// // // // // // // // //         ) : (
// // // // // // // // //           <div className="empty-tree-state">
// // // // // // // // //             <FiFolderPlus size={64} />
// // // // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // // // // //             <div className="empty-state-examples">
// // // // // // // // //               <h4>Example Structure:</h4>
// // // // // // // // //               <div className="example-tree">
// // // // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // // // //               </div>
// // // // // // // // //             </div>
// // // // // // // // //             <div className="empty-state-actions">
// // // // // // // // //               <button 
// // // // // // // // //                 className="primary-button large" 
// // // // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // // // //               >
// // // // // // // // //                 <FiPlus />
// // // // // // // // //                 Create Your First SubDomain
// // // // // // // // //               </button>
// // // // // // // // //               <p className="help-text">
// // // // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // // // //               </p>
// // // // // // // // //             </div>
// // // // // // // // //           </div>
// // // // // // // // //         )}
// // // // // // // // //       </div>

// // // // // // // // //       {/* Add/Edit Modal */}
// // // // // // // // //       {showAddModal && (
// // // // // // // // //         <SubDomainModal
// // // // // // // // //           subDomain={editingSubDomain}
// // // // // // // // //           parent={selectedParent}
// // // // // // // // //           domain={domain}
// // // // // // // // //           onClose={() => {
// // // // // // // // //             setShowAddModal(false);
// // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // //             setSelectedParent(null);
// // // // // // // // //           }}
// // // // // // // // //           onSave={() => {
// // // // // // // // //             setShowAddModal(false);
// // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // //             setSelectedParent(null);
// // // // // // // // //             fetchDomainAndSubDomains();
// // // // // // // // //           }}
// // // // // // // // //         />
// // // // // // // // //       )}
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // // SubDomain Node Component
// // // // // // // // // const SubDomainNode = ({ 
// // // // // // // // //   subDomain, 
// // // // // // // // //   level, 
// // // // // // // // //   isExpanded, 
// // // // // // // // //   onToggleExpanded, 
// // // // // // // // //   onEdit, 
// // // // // // // // //   onDelete, 
// // // // // // // // //   onAddChild,
// // // // // // // // //   expandedNodes 
// // // // // // // // // }) => {
// // // // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // //   const isLeaf = !hasChildren;

// // // // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // // // //     title: subDomain.title,
// // // // // // // // //     level,
// // // // // // // // //     hasChildren,
// // // // // // // // //     isLeaf,
// // // // // // // // //     isExpanded,
// // // // // // // // //     projectCount: subDomain.projectCount
// // // // // // // // //   });

// // // // // // // // //   return (
// // // // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // // // //       <div className="node-content">
// // // // // // // // //         <div className="node-main">
// // // // // // // // //           {hasChildren ? (
// // // // // // // // //             <button 
// // // // // // // // //               className="expand-button"
// // // // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // // // //             >
// // // // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // // // //             </button>
// // // // // // // // //           ) : (
// // // // // // // // //             <div className="expand-placeholder" />
// // // // // // // // //           )}
          
// // // // // // // // //           <div className="node-icon">
// // // // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // // // //           </div>
          
// // // // // // // // //           <div className="node-info">
// // // // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // // // //             <div className="node-stats">
// // // // // // // // //               {hasChildren && (
// // // // // // // // //                 <span className="stat-badge">
// // // // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // // // //                 </span>
// // // // // // // // //               )}
// // // // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // // // //                 <span className="stat-badge projects">
// // // // // // // // //                   {subDomain.projectCount} projects
// // // // // // // // //                 </span>
// // // // // // // // //               )}
// // // // // // // // //               {isLeaf && (
// // // // // // // // //                 <span className="stat-badge leaf">
// // // // // // // // //                   Can have projects
// // // // // // // // //                 </span>
// // // // // // // // //               )}
// // // // // // // // //             </div>
// // // // // // // // //           </div>
// // // // // // // // //         </div>
        
// // // // // // // // //         <div className="node-actions">
// // // // // // // // //           <button 
// // // // // // // // //             className="action-button add" 
// // // // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // // // //           >
// // // // // // // // //             <FiPlus />
// // // // // // // // //           </button>
// // // // // // // // //           <div className="action-menu">
// // // // // // // // //             <button 
// // // // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // // // //               title="More actions"
// // // // // // // // //             >
// // // // // // // // //               <FiMoreVertical />
// // // // // // // // //             </button>
// // // // // // // // //             {showMenu && (
// // // // // // // // //               <div className="dropdown-menu">
// // // // // // // // //                 <button onClick={() => {
// // // // // // // // //                   onEdit(subDomain);
// // // // // // // // //                   setShowMenu(false);
// // // // // // // // //                 }}>
// // // // // // // // //                   <FiEdit /> Edit
// // // // // // // // //                 </button>
// // // // // // // // //                 <button onClick={() => {
// // // // // // // // //                   onAddChild(subDomain);
// // // // // // // // //                   setShowMenu(false);
// // // // // // // // //                 }}>
// // // // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // // // //                 </button>
// // // // // // // // //                 <button onClick={() => {
// // // // // // // // //                   onDelete(subDomain);
// // // // // // // // //                   setShowMenu(false);
// // // // // // // // //                 }} className="danger">
// // // // // // // // //                   <FiTrash2 /> Delete
// // // // // // // // //                 </button>
// // // // // // // // //               </div>
// // // // // // // // //             )}
// // // // // // // // //           </div>
// // // // // // // // //         </div>
// // // // // // // // //       </div>
      
// // // // // // // // //       {/* Children */}
// // // // // // // // //       {hasChildren && isExpanded && (
// // // // // // // // //         <div className="node-children">
// // // // // // // // //           {subDomain.children.map((child) => (
// // // // // // // // //             <SubDomainNode
// // // // // // // // //               key={child.id}
// // // // // // // // //               subDomain={child}
// // // // // // // // //               level={level + 1}
// // // // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // // // //               onEdit={onEdit}
// // // // // // // // //               onDelete={onDelete}
// // // // // // // // //               onAddChild={onAddChild}
// // // // // // // // //               expandedNodes={expandedNodes}
// // // // // // // // //             />
// // // // // // // // //           ))}
// // // // // // // // //         </div>
// // // // // // // // //       )}
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // // SubDomain Modal Component - FIXED VERSION
// // // // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // // //     title: subDomain?.title || '',
// // // // // // // // //     description: subDomain?.description || ''
// // // // // // // // //   });
// // // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // // // //     isEditing: !!subDomain,
// // // // // // // // //     parentTitle: parent?.title,
// // // // // // // // //     domainTitle: domain?.title,
// // // // // // // // //     formData
// // // // // // // // //   });

// // // // // // // // //   // Enhanced slug generation with better validation
// // // // // // // // //   const generateSlug = (title) => {
// // // // // // // // //     if (!title || title.trim() === '') {
// // // // // // // // //       return '';
// // // // // // // // //     }
    
// // // // // // // // //     let slug = title
// // // // // // // // //       .toLowerCase()
// // // // // // // // //       .trim()
// // // // // // // // //       .replace(/[^a-z0-9\s-]/g, '') // Remove special chars except spaces and hyphens
// // // // // // // // //       .replace(/\s+/g, '-')         // Replace spaces with hyphens
// // // // // // // // //       .replace(/-+/g, '-')          // Remove consecutive hyphens
// // // // // // // // //       .replace(/^-|-$/g, '');       // Remove leading/trailing hyphens
    
// // // // // // // // //     // Ensure minimum length - if too short, add timestamp
// // // // // // // // //     if (slug.length < 3) {
// // // // // // // // //       slug = slug + '-' + Date.now().toString().slice(-4);
// // // // // // // // //     }
    
// // // // // // // // //     // Ensure maximum length
// // // // // // // // //     if (slug.length > 50) {
// // // // // // // // //       slug = slug.substring(0, 50).replace(/-$/, '');
// // // // // // // // //     }
    
// // // // // // // // //     return slug;
// // // // // // // // //   };

// // // // // // // // //   const slugPreview = generateSlug(formData.title);

// // // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // // //     e.preventDefault();
// // // // // // // // //     setLoading(true);

// // // // // // // // //     try {
// // // // // // // // //       // Generate slug from title
// // // // // // // // //       const slug = generateSlug(formData.title);
      
// // // // // // // // //       // Validate slug
// // // // // // // // //       if (!slug || slug.length < 3) {
// // // // // // // // //         toast.error('Title must generate a valid slug (at least 3 characters)');
// // // // // // // // //         setLoading(false);
// // // // // // // // //         return;
// // // // // // // // //       }

// // // // // // // // //       const requestData = {
// // // // // // // // //         title: formData.title.trim(),
// // // // // // // // //         description: formData.description.trim(),
       
// // // // // // // // //         domainId: domain.id,
// // // // // // // // //         parentId: parent?.id || null
// // // // // // // // //       };

// // // // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // // // //       console.log('🔍 SUBDOMAIN SAVE - Generated slug:', slug, 'Length:', slug.length);
// // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // // // //       if (subDomain) {
// // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // // // //       } else {
// // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // // // //       }

// // // // // // // // //       onSave();
// // // // // // // // //     } catch (error) {
// // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error response:', error.response);
// // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error data:', error.response?.data);
      
// // // // // // // // //       // Better error handling
// // // // // // // // //       const errorMessage = error.response?.data?.message || 
// // // // // // // // //                           error.response?.data?.error || 
// // // // // // // // //                           'Failed to save sub-domain';
// // // // // // // // //       toast.error(errorMessage);
// // // // // // // // //     } finally {
// // // // // // // // //       setLoading(false);
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   const getModalTitle = () => {
// // // // // // // // //     if (subDomain) {
// // // // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // // // //     }
// // // // // // // // //     if (parent) {
// // // // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // // // //     }
// // // // // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // // // // //   };

// // // // // // // // //   const getLevel = () => {
// // // // // // // // //     if (!parent) return 'Root Level';
// // // // // // // // //     // This is a simplified level calculation
// // // // // // // // //     return `Level ${(parent.level || 0) + 1}`;
// // // // // // // // //   };

// // // // // // // // //   return (
// // // // // // // // //     <div className="modal-overlay">
// // // // // // // // //       <div className="modal">
// // // // // // // // //         <div className="modal-header">
// // // // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // // // //           <button onClick={onClose}>×</button>
// // // // // // // // //         </div>
        
// // // // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // // // //           <div className="form-group">
// // // // // // // // //             <label>SubDomain Title *</label>
// // // // // // // // //             <input
// // // // // // // // //               type="text"
// // // // // // // // //               value={formData.title}
// // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // // // //               required
// // // // // // // // //               minLength={3}
// // // // // // // // //               maxLength={100}
// // // // // // // // //             />
// // // // // // // // //             {formData.title && (
// // // // // // // // //               <div className="slug-preview">
// // // // // // // // //                 <small>
// // // // // // // // //                   URL Slug: <code>{slugPreview || 'enter-title-to-see-slug'}</code>
// // // // // // // // //                   {slugPreview && slugPreview.length < 3 && (
// // // // // // // // //                     <span style={{color: 'red'}}> (Too short - needs at least 3 chars)</span>
// // // // // // // // //                   )}
// // // // // // // // //                 </small>
// // // // // // // // //               </div>
// // // // // // // // //             )}
// // // // // // // // //           </div>
          
// // // // // // // // //           <div className="form-group">
// // // // // // // // //             <label>Description (Optional)</label>
// // // // // // // // //             <textarea
// // // // // // // // //               value={formData.description}
// // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // // // //               rows={3}
// // // // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // // // //               maxLength={500}
// // // // // // // // //             />
// // // // // // // // //           </div>
          
// // // // // // // // //           <div className="modal-info">
// // // // // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // // // // //             {parent && (
// // // // // // // // //               <>
// // // // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // // // //               </>
// // // // // // // // //             )}
// // // // // // // // //             <strong>Level:</strong> {getLevel()}
// // // // // // // // //           </div>
          
// // // // // // // // //           <div className="modal-actions">
// // // // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // // // //               Cancel
// // // // // // // // //             </button>
// // // // // // // // //             <button 
// // // // // // // // //               type="submit" 
// // // // // // // // //               className="primary-button" 
// // // // // // // // //               disabled={loading || !formData.title.trim() || slugPreview.length < 3}
// // // // // // // // //             >
// // // // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // // // //             </button>
// // // // // // // // //           </div>
// // // // // // // // //         </form>
// // // // // // // // //       </div>
// // // // // // // // //     </div>
// // // // // // // // //   );
// // // // // // // // // };

// // // // // // // // // export default SubDomainManagement;


// // // // // // // // // // // src/components/domains/SubDomainManagement.js - REPLACE THE TEST VERSION
// // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // // // // import { authService } from '../../services/authService';
// // // // // // // // // // import { toast } from 'react-toastify';
// // // // // // // // // // import {
// // // // // // // // // //   FiPlus,
// // // // // // // // // //   FiEdit,
// // // // // // // // // //   FiTrash2,
// // // // // // // // // //   FiChevronDown,
// // // // // // // // // //   FiChevronRight,
// // // // // // // // // //   FiFolder,
// // // // // // // // // //   FiFolderPlus,
// // // // // // // // // //   FiFileText,
// // // // // // // // // //   FiArrowLeft,
// // // // // // // // // //   FiMoreVertical,
// // // // // // // // // //   FiMove,
// // // // // // // // // //   FiTarget
// // // // // // // // // // } from 'react-icons/fi';

// // // // // // // // // // const SubDomainManagement = () => {
// // // // // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // // // // //   const { domainId } = useParams();
// // // // // // // // // //   const navigate = useNavigate();
  
// // // // // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // // // // //     domainId,
// // // // // // // // // //     domain: domain?.title,
// // // // // // // // // //     subDomainsCount: subDomains.length,
// // // // // // // // // //     loading,
// // // // // // // // // //     selectedParent: selectedParent?.title,
// // // // // // // // // //     expandedCount: expandedNodes.size
// // // // // // // // // //   });

// // // // // // // // // //   useEffect(() => {
// // // // // // // // // //     if (domainId) {
// // // // // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // //     }
// // // // // // // // // //   }, [domainId]);

// // // // // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // // // // //     try {
// // // // // // // // // //       setLoading(true);
      
// // // // // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // // // // //       // First, let's try to get domain details
// // // // // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getDomains with filter');
// // // // // // // // // //       const domainsResponse = await authService.getDomains({ id: domainId });
// // // // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // // // // // //       // Extract domain from response
// // // // // // // // // //       let domainData = null;
// // // // // // // // // //       if (domainsResponse.data?.domains && domainsResponse.data.domains.length > 0) {
// // // // // // // // // //         domainData = domainsResponse.data.domains.find(d => d.id == domainId);
// // // // // // // // // //       } else if (domainsResponse.data?.data?.domains && domainsResponse.data.data.domains.length > 0) {
// // // // // // // // // //         domainData = domainsResponse.data.data.domains.find(d => d.id == domainId);
// // // // // // // // // //       } else if (Array.isArray(domainsResponse.data)) {
// // // // // // // // // //         domainData = domainsResponse.data.find(d => d.id == domainId);
// // // // // // // // // //       }
      
// // // // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted domain:', domainData);
      
// // // // // // // // // //       // If we don't have domain data, create a placeholder
// // // // // // // // // //       if (!domainData) {
// // // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - No domain found, creating placeholder');
// // // // // // // // // //         domainData = {
// // // // // // // // // //           id: domainId,
// // // // // // // // // //           title: `Domain ${domainId}`,
// // // // // // // // // //           description: 'Loading domain details...',
// // // // // // // // // //           projectCount: 0
// // // // // // // // // //         };
// // // // // // // // // //       }
      
// // // // // // // // // //       setDomain(domainData);
      
// // // // // // // // // //       // Try to get hierarchy if domain exists
// // // // // // // // // //       try {
// // // // // // // // // //         console.log('🌐 SUBDOMAIN FETCH - Calling getDomainHierarchy');
// // // // // // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // // // // // //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
        
// // // // // // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // // // // // //         console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
// // // // // // // // // //         setSubDomains(hierarchyData?.subDomains || []);
        
// // // // // // // // // //         // Auto-expand first level
// // // // // // // // // //         if (hierarchyData?.subDomains?.length > 0) {
// // // // // // // // // //           const firstLevelIds = hierarchyData.subDomains.map(sd => sd.id);
// // // // // // // // // //           setExpandedNodes(new Set(firstLevelIds));
// // // // // // // // // //           console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // // // // //         }
// // // // // // // // // //       } catch (hierarchyError) {
// // // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed, starting with empty structure:', hierarchyError);
// // // // // // // // // //         setSubDomains([]);
// // // // // // // // // //       }
      
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // // // // // //       // Create fallback domain
// // // // // // // // // //       setDomain({
// // // // // // // // // //         id: domainId,
// // // // // // // // // //         title: `Domain ${domainId}`,
// // // // // // // // // //         description: 'Error loading domain details',
// // // // // // // // // //         projectCount: 0
// // // // // // // // // //       });
// // // // // // // // // //       setSubDomains([]);
// // // // // // // // // //     } finally {
// // // // // // // // // //       setLoading(false);
// // // // // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // // // // //     setSelectedParent(parent);
// // // // // // // // // //     setEditingSubDomain(null);
// // // // // // // // // //     setShowAddModal(true);
    
// // // // // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // // // // //       showAddModal: true, 
// // // // // // // // // //       selectedParent: parent?.title,
// // // // // // // // // //       editingSubDomain: null 
// // // // // // // // // //     });
// // // // // // // // // //   };

// // // // // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // // // // //     setSelectedParent(null);
// // // // // // // // // //     setEditingSubDomain(subDomain);
// // // // // // // // // //     setShowAddModal(true);
// // // // // // // // // //   };

// // // // // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // // // // //     if (hasChildren) {
// // // // // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // // // // //     }
// // // // // // // // // //     if (hasProjects) {
// // // // // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // // // // //     }
    
// // // // // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // // // // //       return;
// // // // // // // // // //     }

// // // // // // // // // //     try {
// // // // // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // // // // //       newExpanded.delete(nodeId);
// // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // // // // //     } else {
// // // // // // // // // //       newExpanded.add(nodeId);
// // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // // // // //     }
// // // // // // // // // //     setExpandedNodes(newExpanded);
// // // // // // // // // //   };

// // // // // // // // // //   if (loading) {
// // // // // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // // // // //     return (
// // // // // // // // // //       <div className="loading-container">
// // // // // // // // // //         <div className="loading-spinner"></div>
// // // // // // // // // //         <p>Loading sub-domains...</p>
// // // // // // // // // //       </div>
// // // // // // // // // //     );
// // // // // // // // // //   }

// // // // // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // // // // //   return (
// // // // // // // // // //     <div className="subdomain-management">
// // // // // // // // // //       {/* Header with Breadcrumb */}
// // // // // // // // // //       <div className="page-header">
// // // // // // // // // //         <div className="header-content">
// // // // // // // // // //           <div className="breadcrumb">
// // // // // // // // // //             <button 
// // // // // // // // // //               className="breadcrumb-link"
// // // // // // // // // //               onClick={() => navigate('/domains')}
// // // // // // // // // //             >
// // // // // // // // // //               <FiArrowLeft />
// // // // // // // // // //               Domains
// // // // // // // // // //             </button>
// // // // // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // // // // // //           </div>
// // // // // // // // // //           <h1>SubDomain Management</h1>
// // // // // // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // // // // // //         </div>
// // // // // // // // // //         <div className="header-actions">
// // // // // // // // // //           <button 
// // // // // // // // // //             className="primary-button" 
// // // // // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // // // // //           >
// // // // // // // // // //             <FiPlus />
// // // // // // // // // //             Add Root SubDomain
// // // // // // // // // //           </button>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>

// // // // // // // // // //       {/* Quick Guide */}
// // // // // // // // // //       <div className="quick-guide">
// // // // // // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // // // // // //         <div className="guide-steps">
// // // // // // // // // //           <div className="guide-step">
// // // // // // // // // //             <span className="step-number">1</span>
// // // // // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // // // // //           </div>
// // // // // // // // // //           <div className="guide-step">
// // // // // // // // // //             <span className="step-number">2</span>
// // // // // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // // // // //           </div>
// // // // // // // // // //           <div className="guide-step">
// // // // // // // // // //             <span className="step-number">3</span>
// // // // // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>

// // // // // // // // // //       {/* Domain Info Card */}
// // // // // // // // // //       {domain && (
// // // // // // // // // //         <div className="domain-info-card">
// // // // // // // // // //           <div className="domain-icon">
// // // // // // // // // //             <FiFolder />
// // // // // // // // // //           </div>
// // // // // // // // // //           <div className="domain-details">
// // // // // // // // // //             <h3>{domain.title}</h3>
// // // // // // // // // //             <p>{domain.description}</p>
// // // // // // // // // //             <div className="domain-stats">
// // // // // // // // // //               <span className="stat-item">
// // // // // // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // // // // // //               </span>
// // // // // // // // // //               <span className="stat-item">
// // // // // // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // // // // //               </span>
// // // // // // // // // //             </div>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       )}

// // // // // // // // // //       {/* SubDomain Tree */}
// // // // // // // // // //       <div className="subdomain-tree-container">
// // // // // // // // // //         <div className="tree-header">
// // // // // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // // // // //           <div className="tree-legend">
// // // // // // // // // //             <span className="legend-item">
// // // // // // // // // //               <FiFolder className="folder-icon" />
// // // // // // // // // //               Has children
// // // // // // // // // //             </span>
// // // // // // // // // //             <span className="legend-item">
// // // // // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // // // // //               Leaf (can have projects)
// // // // // // // // // //             </span>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>

// // // // // // // // // //         {subDomains.length > 0 ? (
// // // // // // // // // //           <div className="subdomain-tree">
// // // // // // // // // //             {subDomains.map((subDomain) => (
// // // // // // // // // //               <SubDomainNode
// // // // // // // // // //                 key={subDomain.id}
// // // // // // // // // //                 subDomain={subDomain}
// // // // // // // // // //                 level={0}
// // // // // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // // // // //                 expandedNodes={expandedNodes}
// // // // // // // // // //               />
// // // // // // // // // //             ))}
// // // // // // // // // //           </div>
// // // // // // // // // //         ) : (
// // // // // // // // // //           <div className="empty-tree-state">
// // // // // // // // // //             <FiFolderPlus size={64} />
// // // // // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // // // // // //             <div className="empty-state-examples">
// // // // // // // // // //               <h4>Example Structure:</h4>
// // // // // // // // // //               <div className="example-tree">
// // // // // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // // // // //               </div>
// // // // // // // // // //             </div>
// // // // // // // // // //             <div className="empty-state-actions">
// // // // // // // // // //               <button 
// // // // // // // // // //                 className="primary-button large" 
// // // // // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // // // // //               >
// // // // // // // // // //                 <FiPlus />
// // // // // // // // // //                 Create Your First SubDomain
// // // // // // // // // //               </button>
// // // // // // // // // //               <p className="help-text">
// // // // // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // // // // //               </p>
// // // // // // // // // //             </div>
// // // // // // // // // //           </div>
// // // // // // // // // //         )}
// // // // // // // // // //       </div>

// // // // // // // // // //       {/* Add/Edit Modal */}
// // // // // // // // // //       {showAddModal && (
// // // // // // // // // //         <SubDomainModal
// // // // // // // // // //           subDomain={editingSubDomain}
// // // // // // // // // //           parent={selectedParent}
// // // // // // // // // //           domain={domain}
// // // // // // // // // //           onClose={() => {
// // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // //           }}
// // // // // // // // // //           onSave={() => {
// // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // //             fetchDomainAndSubDomains();
// // // // // // // // // //           }}
// // // // // // // // // //         />
// // // // // // // // // //       )}
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // // SubDomain Node Component
// // // // // // // // // // const SubDomainNode = ({ 
// // // // // // // // // //   subDomain, 
// // // // // // // // // //   level, 
// // // // // // // // // //   isExpanded, 
// // // // // // // // // //   onToggleExpanded, 
// // // // // // // // // //   onEdit, 
// // // // // // // // // //   onDelete, 
// // // // // // // // // //   onAddChild,
// // // // // // // // // //   expandedNodes 
// // // // // // // // // // }) => {
// // // // // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // //   const isLeaf = !hasChildren;

// // // // // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // // // // //     title: subDomain.title,
// // // // // // // // // //     level,
// // // // // // // // // //     hasChildren,
// // // // // // // // // //     isLeaf,
// // // // // // // // // //     isExpanded,
// // // // // // // // // //     projectCount: subDomain.projectCount
// // // // // // // // // //   });

// // // // // // // // // //   return (
// // // // // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // // // // //       <div className="node-content">
// // // // // // // // // //         <div className="node-main">
// // // // // // // // // //           {hasChildren ? (
// // // // // // // // // //             <button 
// // // // // // // // // //               className="expand-button"
// // // // // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // // // // //             >
// // // // // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // // // // //             </button>
// // // // // // // // // //           ) : (
// // // // // // // // // //             <div className="expand-placeholder" />
// // // // // // // // // //           )}
          
// // // // // // // // // //           <div className="node-icon">
// // // // // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // // // // //           </div>
          
// // // // // // // // // //           <div className="node-info">
// // // // // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // // // // //             <div className="node-stats">
// // // // // // // // // //               {hasChildren && (
// // // // // // // // // //                 <span className="stat-badge">
// // // // // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // // // // //                 </span>
// // // // // // // // // //               )}
// // // // // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // // // // //                 <span className="stat-badge projects">
// // // // // // // // // //                   {subDomain.projectCount} projects
// // // // // // // // // //                 </span>
// // // // // // // // // //               )}
// // // // // // // // // //               {isLeaf && (
// // // // // // // // // //                 <span className="stat-badge leaf">
// // // // // // // // // //                   Can have projects
// // // // // // // // // //                 </span>
// // // // // // // // // //               )}
// // // // // // // // // //             </div>
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
        
// // // // // // // // // //         <div className="node-actions">
// // // // // // // // // //           <button 
// // // // // // // // // //             className="action-button add" 
// // // // // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // // // // //           >
// // // // // // // // // //             <FiPlus />
// // // // // // // // // //           </button>
// // // // // // // // // //           <div className="action-menu">
// // // // // // // // // //             <button 
// // // // // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // // // // //               title="More actions"
// // // // // // // // // //             >
// // // // // // // // // //               <FiMoreVertical />
// // // // // // // // // //             </button>
// // // // // // // // // //             {showMenu && (
// // // // // // // // // //               <div className="dropdown-menu">
// // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // //                   onEdit(subDomain);
// // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // //                 }}>
// // // // // // // // // //                   <FiEdit /> Edit
// // // // // // // // // //                 </button>
// // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // //                   onAddChild(subDomain);
// // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // //                 }}>
// // // // // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // // // // //                 </button>
// // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // //                   onDelete(subDomain);
// // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // //                 }} className="danger">
// // // // // // // // // //                   <FiTrash2 /> Delete
// // // // // // // // // //                 </button>
// // // // // // // // // //               </div>
// // // // // // // // // //             )}
// // // // // // // // // //           </div>
// // // // // // // // // //         </div>
// // // // // // // // // //       </div>
      
// // // // // // // // // //       {/* Children */}
// // // // // // // // // //       {hasChildren && isExpanded && (
// // // // // // // // // //         <div className="node-children">
// // // // // // // // // //           {subDomain.children.map((child) => (
// // // // // // // // // //             <SubDomainNode
// // // // // // // // // //               key={child.id}
// // // // // // // // // //               subDomain={child}
// // // // // // // // // //               level={level + 1}
// // // // // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // // // // //               onEdit={onEdit}
// // // // // // // // // //               onDelete={onDelete}
// // // // // // // // // //               onAddChild={onAddChild}
// // // // // // // // // //               expandedNodes={expandedNodes}
// // // // // // // // // //             />
// // // // // // // // // //           ))}
// // // // // // // // // //         </div>
// // // // // // // // // //       )}
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // // SubDomain Modal Component
// // // // // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // // // //     title: subDomain?.title || '',
// // // // // // // // // //     description: subDomain?.description || ''
// // // // // // // // // //   });
// // // // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // // // // //     isEditing: !!subDomain,
// // // // // // // // // //     parentTitle: parent?.title,
// // // // // // // // // //     domainTitle: domain?.title,
// // // // // // // // // //     formData
// // // // // // // // // //   });

// // // // // // // // // //   // Generate slug preview
// // // // // // // // // //   const generateSlug = (title) => {
// // // // // // // // // //     return title
// // // // // // // // // //       .toLowerCase()
// // // // // // // // // //       .replace(/[^a-z0-9]/g, '-')
// // // // // // // // // //       .replace(/-+/g, '-')
// // // // // // // // // //       .replace(/^-|-$/g, '');
// // // // // // // // // //   };

// // // // // // // // // //   const slugPreview = generateSlug(formData.title);

// // // // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // // // //     e.preventDefault();
// // // // // // // // // //     setLoading(true);

// // // // // // // // // //     try {
// // // // // // // // // //       // Generate slug from title
// // // // // // // // // //       const slug = generateSlug(formData.title);

// // // // // // // // // //       const requestData = {
// // // // // // // // // //         ...formData,
// // // // // // // // // //         // slug: slug,
// // // // // // // // // //         domainId: domain.id,
// // // // // // // // // //         parentId: parent?.id || null
// // // // // // // // // //       };

// // // // // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Generated slug:', slug);
// // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // // // // //       if (subDomain) {
// // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // // // // //       } else {
// // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // // // // //       }

// // // // // // // // // //       onSave();
// // // // // // // // // //     } catch (error) {
// // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error response:', error.response);
// // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error data:', error.response?.data);
// // // // // // // // // //       toast.error('Failed to save sub-domain');
// // // // // // // // // //     } finally {
// // // // // // // // // //       setLoading(false);
// // // // // // // // // //     }
// // // // // // // // // //   };

// // // // // // // // // //   const getModalTitle = () => {
// // // // // // // // // //     if (subDomain) {
// // // // // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // // // // //     }
// // // // // // // // // //     if (parent) {
// // // // // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // // // // //     }
// // // // // // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // // // // // //   };

// // // // // // // // // //   const getLevel = () => {
// // // // // // // // // //     if (!parent) return 'Root Level';
// // // // // // // // // //     // This is a simplified level calculation
// // // // // // // // // //     return `Level ${(parent.level || 0) + 1}`;
// // // // // // // // // //   };

// // // // // // // // // //   return (
// // // // // // // // // //     <div className="modal-overlay">
// // // // // // // // // //       <div className="modal">
// // // // // // // // // //         <div className="modal-header">
// // // // // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // // // // //           <button onClick={onClose}>×</button>
// // // // // // // // // //         </div>
        
// // // // // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // // // // //           <div className="form-group">
// // // // // // // // // //             <label>SubDomain Title</label>
// // // // // // // // // //             <input
// // // // // // // // // //               type="text"
// // // // // // // // // //               value={formData.title}
// // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // // // // //               required
// // // // // // // // // //             />
// // // // // // // // // //             {formData.title && (
// // // // // // // // // //               <div className="slug-preview">
// // // // // // // // // //                 <small>URL Slug: <code>{slugPreview || 'enter-title-to-see-slug'}</code></small>
// // // // // // // // // //               </div>
// // // // // // // // // //             )}
// // // // // // // // // //           </div>
          
// // // // // // // // // //           <div className="form-group">
// // // // // // // // // //             <label>Description (Optional)</label>
// // // // // // // // // //             <textarea
// // // // // // // // // //               value={formData.description}
// // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // // // // //               rows={3}
// // // // // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // // // // //             />
// // // // // // // // // //           </div>
          
// // // // // // // // // //           <div className="modal-info">
// // // // // // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // // // // // //             {parent && (
// // // // // // // // // //               <>
// // // // // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // // // // //               </>
// // // // // // // // // //             )}
// // // // // // // // // //             <strong>Level:</strong> {getLevel()}
// // // // // // // // // //           </div>
          
// // // // // // // // // //           <div className="modal-actions">
// // // // // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // // // // //               Cancel
// // // // // // // // // //             </button>
// // // // // // // // // //             <button type="submit" className="primary-button" disabled={loading}>
// // // // // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // // // // //             </button>
// // // // // // // // // //           </div>
// // // // // // // // // //         </form>
// // // // // // // // // //       </div>
// // // // // // // // // //     </div>
// // // // // // // // // //   );
// // // // // // // // // // };

// // // // // // // // // // export default SubDomainManagement;



// // // // // // // // // // // // src/components/domains/SubDomainManagement.js - REPLACE THE TEST VERSION
// // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // // // // // import { authService } from '../../services/authService';
// // // // // // // // // // // import { toast } from 'react-toastify';
// // // // // // // // // // // import {
// // // // // // // // // // //   FiPlus,
// // // // // // // // // // //   FiEdit,
// // // // // // // // // // //   FiTrash2,
// // // // // // // // // // //   FiChevronDown,
// // // // // // // // // // //   FiChevronRight,
// // // // // // // // // // //   FiFolder,
// // // // // // // // // // //   FiFolderPlus,
// // // // // // // // // // //   FiFileText,
// // // // // // // // // // //   FiArrowLeft,
// // // // // // // // // // //   FiMoreVertical,
// // // // // // // // // // //   FiMove,
// // // // // // // // // // //   FiTarget
// // // // // // // // // // // } from 'react-icons/fi';

// // // // // // // // // // // const SubDomainManagement = () => {
// // // // // // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // // // // // //   const { domainId } = useParams();
// // // // // // // // // // //   const navigate = useNavigate();
  
// // // // // // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // // // // // //     domainId,
// // // // // // // // // // //     domain: domain?.title,
// // // // // // // // // // //     subDomainsCount: subDomains.length,
// // // // // // // // // // //     loading,
// // // // // // // // // // //     selectedParent: selectedParent?.title,
// // // // // // // // // // //     expandedCount: expandedNodes.size
// // // // // // // // // // //   });

// // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // //     if (domainId) {
// // // // // // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // // //     }
// // // // // // // // // // //   }, [domainId]);

// // // // // // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // // // // // //     try {
// // // // // // // // // // //       setLoading(true);
      
// // // // // // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // // // // // //       // First, let's try to get domain details
// // // // // // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getDomains with filter');
// // // // // // // // // // //       const domainsResponse = await authService.getDomains({ id: domainId });
// // // // // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // // // // // // //       // Extract domain from response
// // // // // // // // // // //       let domainData = null;
// // // // // // // // // // //       if (domainsResponse.data?.domains && domainsResponse.data.domains.length > 0) {
// // // // // // // // // // //         domainData = domainsResponse.data.domains.find(d => d.id == domainId);
// // // // // // // // // // //       } else if (domainsResponse.data?.data?.domains && domainsResponse.data.data.domains.length > 0) {
// // // // // // // // // // //         domainData = domainsResponse.data.data.domains.find(d => d.id == domainId);
// // // // // // // // // // //       } else if (Array.isArray(domainsResponse.data)) {
// // // // // // // // // // //         domainData = domainsResponse.data.find(d => d.id == domainId);
// // // // // // // // // // //       }
      
// // // // // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted domain:', domainData);
      
// // // // // // // // // // //       // If we don't have domain data, create a placeholder
// // // // // // // // // // //       if (!domainData) {
// // // // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - No domain found, creating placeholder');
// // // // // // // // // // //         domainData = {
// // // // // // // // // // //           id: domainId,
// // // // // // // // // // //           title: `Domain ${domainId}`,
// // // // // // // // // // //           description: 'Loading domain details...',
// // // // // // // // // // //           projectCount: 0
// // // // // // // // // // //         };
// // // // // // // // // // //       }
      
// // // // // // // // // // //       setDomain(domainData);
      
// // // // // // // // // // //       // Try to get hierarchy if domain exists
// // // // // // // // // // //       try {
// // // // // // // // // // //         console.log('🌐 SUBDOMAIN FETCH - Calling getDomainHierarchy');
// // // // // // // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // // // // // // //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
        
// // // // // // // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // // // // // // //         console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
// // // // // // // // // // //         setSubDomains(hierarchyData?.subDomains || []);
        
// // // // // // // // // // //         // Auto-expand first level
// // // // // // // // // // //         if (hierarchyData?.subDomains?.length > 0) {
// // // // // // // // // // //           const firstLevelIds = hierarchyData.subDomains.map(sd => sd.id);
// // // // // // // // // // //           setExpandedNodes(new Set(firstLevelIds));
// // // // // // // // // // //           console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // // // // // //         }
// // // // // // // // // // //       } catch (hierarchyError) {
// // // // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed, starting with empty structure:', hierarchyError);
// // // // // // // // // // //         setSubDomains([]);
// // // // // // // // // // //       }
      
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // // // // // // //       // Create fallback domain
// // // // // // // // // // //       setDomain({
// // // // // // // // // // //         id: domainId,
// // // // // // // // // // //         title: `Domain ${domainId}`,
// // // // // // // // // // //         description: 'Error loading domain details',
// // // // // // // // // // //         projectCount: 0
// // // // // // // // // // //       });
// // // // // // // // // // //       setSubDomains([]);
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       setLoading(false);
// // // // // // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // // // // // //     setSelectedParent(parent);
// // // // // // // // // // //     setEditingSubDomain(null);
// // // // // // // // // // //     setShowAddModal(true);
    
// // // // // // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // // // // // //       showAddModal: true, 
// // // // // // // // // // //       selectedParent: parent?.title,
// // // // // // // // // // //       editingSubDomain: null 
// // // // // // // // // // //     });
// // // // // // // // // // //   };

// // // // // // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // // // // // //     setSelectedParent(null);
// // // // // // // // // // //     setEditingSubDomain(subDomain);
// // // // // // // // // // //     setShowAddModal(true);
// // // // // // // // // // //   };

// // // // // // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // // // // // //     if (hasChildren) {
// // // // // // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // // // // // //     }
// // // // // // // // // // //     if (hasProjects) {
// // // // // // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // // // // // //     }
    
// // // // // // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // // // // // //       return;
// // // // // // // // // // //     }

// // // // // // // // // // //     try {
// // // // // // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // // // // // //       newExpanded.delete(nodeId);
// // // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // // // // // //     } else {
// // // // // // // // // // //       newExpanded.add(nodeId);
// // // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // // // // // //     }
// // // // // // // // // // //     setExpandedNodes(newExpanded);
// // // // // // // // // // //   };

// // // // // // // // // // //   if (loading) {
// // // // // // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // // // // // //     return (
// // // // // // // // // // //       <div className="loading-container">
// // // // // // // // // // //         <div className="loading-spinner"></div>
// // // // // // // // // // //         <p>Loading sub-domains...</p>
// // // // // // // // // // //       </div>
// // // // // // // // // // //     );
// // // // // // // // // // //   }

// // // // // // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="subdomain-management">
// // // // // // // // // // //       {/* Header with Breadcrumb */}
// // // // // // // // // // //       <div className="page-header">
// // // // // // // // // // //         <div className="header-content">
// // // // // // // // // // //           <div className="breadcrumb">
// // // // // // // // // // //             <button 
// // // // // // // // // // //               className="breadcrumb-link"
// // // // // // // // // // //               onClick={() => navigate('/domains')}
// // // // // // // // // // //             >
// // // // // // // // // // //               <FiArrowLeft />
// // // // // // // // // // //               Domains
// // // // // // // // // // //             </button>
// // // // // // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // // // // // // //           </div>
// // // // // // // // // // //           <h1>SubDomain Management</h1>
// // // // // // // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // // // // // // //         </div>
// // // // // // // // // // //         <div className="header-actions">
// // // // // // // // // // //           <button 
// // // // // // // // // // //             className="primary-button" 
// // // // // // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // // // // // //           >
// // // // // // // // // // //             <FiPlus />
// // // // // // // // // // //             Add Root SubDomain
// // // // // // // // // // //           </button>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>

// // // // // // // // // // //       {/* Quick Guide */}
// // // // // // // // // // //       <div className="quick-guide">
// // // // // // // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // // // // // // //         <div className="guide-steps">
// // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // //             <span className="step-number">1</span>
// // // // // // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // // // // // //           </div>
// // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // //             <span className="step-number">2</span>
// // // // // // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // // // // // //           </div>
// // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // //             <span className="step-number">3</span>
// // // // // // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>

// // // // // // // // // // //       {/* Domain Info Card */}
// // // // // // // // // // //       {domain && (
// // // // // // // // // // //         <div className="domain-info-card">
// // // // // // // // // // //           <div className="domain-icon">
// // // // // // // // // // //             <FiFolder />
// // // // // // // // // // //           </div>
// // // // // // // // // // //           <div className="domain-details">
// // // // // // // // // // //             <h3>{domain.title}</h3>
// // // // // // // // // // //             <p>{domain.description}</p>
// // // // // // // // // // //             <div className="domain-stats">
// // // // // // // // // // //               <span className="stat-item">
// // // // // // // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // // // // // // //               </span>
// // // // // // // // // // //               <span className="stat-item">
// // // // // // // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // // // // // //               </span>
// // // // // // // // // // //             </div>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       )}

// // // // // // // // // // //       {/* SubDomain Tree */}
// // // // // // // // // // //       <div className="subdomain-tree-container">
// // // // // // // // // // //         <div className="tree-header">
// // // // // // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // // // // // //           <div className="tree-legend">
// // // // // // // // // // //             <span className="legend-item">
// // // // // // // // // // //               <FiFolder className="folder-icon" />
// // // // // // // // // // //               Has children
// // // // // // // // // // //             </span>
// // // // // // // // // // //             <span className="legend-item">
// // // // // // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // // // // // //               Leaf (can have projects)
// // // // // // // // // // //             </span>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>

// // // // // // // // // // //         {subDomains.length > 0 ? (
// // // // // // // // // // //           <div className="subdomain-tree">
// // // // // // // // // // //             {subDomains.map((subDomain) => (
// // // // // // // // // // //               <SubDomainNode
// // // // // // // // // // //                 key={subDomain.id}
// // // // // // // // // // //                 subDomain={subDomain}
// // // // // // // // // // //                 level={0}
// // // // // // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // // // // // //                 expandedNodes={expandedNodes}
// // // // // // // // // // //               />
// // // // // // // // // // //             ))}
// // // // // // // // // // //           </div>
// // // // // // // // // // //         ) : (
// // // // // // // // // // //           <div className="empty-tree-state">
// // // // // // // // // // //             <FiFolderPlus size={64} />
// // // // // // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // // // // // // //             <div className="empty-state-examples">
// // // // // // // // // // //               <h4>Example Structure:</h4>
// // // // // // // // // // //               <div className="example-tree">
// // // // // // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // // // // // //               </div>
// // // // // // // // // // //             </div>
// // // // // // // // // // //             <div className="empty-state-actions">
// // // // // // // // // // //               <button 
// // // // // // // // // // //                 className="primary-button large" 
// // // // // // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // // // // // //               >
// // // // // // // // // // //                 <FiPlus />
// // // // // // // // // // //                 Create Your First SubDomain
// // // // // // // // // // //               </button>
// // // // // // // // // // //               <p className="help-text">
// // // // // // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // // // // // //               </p>
// // // // // // // // // // //             </div>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         )}
// // // // // // // // // // //       </div>

// // // // // // // // // // //       {/* Add/Edit Modal */}
// // // // // // // // // // //       {showAddModal && (
// // // // // // // // // // //         <SubDomainModal
// // // // // // // // // // //           subDomain={editingSubDomain}
// // // // // // // // // // //           parent={selectedParent}
// // // // // // // // // // //           domain={domain}
// // // // // // // // // // //           onClose={() => {
// // // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // // //           }}
// // // // // // // // // // //           onSave={() => {
// // // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // // //             fetchDomainAndSubDomains();
// // // // // // // // // // //           }}
// // // // // // // // // // //         />
// // // // // // // // // // //       )}
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // // SubDomain Node Component
// // // // // // // // // // // const SubDomainNode = ({ 
// // // // // // // // // // //   subDomain, 
// // // // // // // // // // //   level, 
// // // // // // // // // // //   isExpanded, 
// // // // // // // // // // //   onToggleExpanded, 
// // // // // // // // // // //   onEdit, 
// // // // // // // // // // //   onDelete, 
// // // // // // // // // // //   onAddChild,
// // // // // // // // // // //   expandedNodes 
// // // // // // // // // // // }) => {
// // // // // // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // // //   const isLeaf = !hasChildren;

// // // // // // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // // // // // //     title: subDomain.title,
// // // // // // // // // // //     level,
// // // // // // // // // // //     hasChildren,
// // // // // // // // // // //     isLeaf,
// // // // // // // // // // //     isExpanded,
// // // // // // // // // // //     projectCount: subDomain.projectCount
// // // // // // // // // // //   });

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // // // // // //       <div className="node-content">
// // // // // // // // // // //         <div className="node-main">
// // // // // // // // // // //           {hasChildren ? (
// // // // // // // // // // //             <button 
// // // // // // // // // // //               className="expand-button"
// // // // // // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // // // // // //             >
// // // // // // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // // // // // //             </button>
// // // // // // // // // // //           ) : (
// // // // // // // // // // //             <div className="expand-placeholder" />
// // // // // // // // // // //           )}
          
// // // // // // // // // // //           <div className="node-icon">
// // // // // // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // // // // // //           </div>
          
// // // // // // // // // // //           <div className="node-info">
// // // // // // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // // // // // //             <div className="node-stats">
// // // // // // // // // // //               {hasChildren && (
// // // // // // // // // // //                 <span className="stat-badge">
// // // // // // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // // // // // //                 </span>
// // // // // // // // // // //               )}
// // // // // // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // // // // // //                 <span className="stat-badge projects">
// // // // // // // // // // //                   {subDomain.projectCount} projects
// // // // // // // // // // //                 </span>
// // // // // // // // // // //               )}
// // // // // // // // // // //               {isLeaf && (
// // // // // // // // // // //                 <span className="stat-badge leaf">
// // // // // // // // // // //                   Can have projects
// // // // // // // // // // //                 </span>
// // // // // // // // // // //               )}
// // // // // // // // // // //             </div>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>
        
// // // // // // // // // // //         <div className="node-actions">
// // // // // // // // // // //           <button 
// // // // // // // // // // //             className="action-button add" 
// // // // // // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // // // // // //           >
// // // // // // // // // // //             <FiPlus />
// // // // // // // // // // //           </button>
// // // // // // // // // // //           <div className="action-menu">
// // // // // // // // // // //             <button 
// // // // // // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // // // // // //               title="More actions"
// // // // // // // // // // //             >
// // // // // // // // // // //               <FiMoreVertical />
// // // // // // // // // // //             </button>
// // // // // // // // // // //             {showMenu && (
// // // // // // // // // // //               <div className="dropdown-menu">
// // // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // // //                   onEdit(subDomain);
// // // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // // //                 }}>
// // // // // // // // // // //                   <FiEdit /> Edit
// // // // // // // // // // //                 </button>
// // // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // // //                   onAddChild(subDomain);
// // // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // // //                 }}>
// // // // // // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // // // // // //                 </button>
// // // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // // //                   onDelete(subDomain);
// // // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // // //                 }} className="danger">
// // // // // // // // // // //                   <FiTrash2 /> Delete
// // // // // // // // // // //                 </button>
// // // // // // // // // // //               </div>
// // // // // // // // // // //             )}
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </div>
// // // // // // // // // // //       </div>
      
// // // // // // // // // // //       {/* Children */}
// // // // // // // // // // //       {hasChildren && isExpanded && (
// // // // // // // // // // //         <div className="node-children">
// // // // // // // // // // //           {subDomain.children.map((child) => (
// // // // // // // // // // //             <SubDomainNode
// // // // // // // // // // //               key={child.id}
// // // // // // // // // // //               subDomain={child}
// // // // // // // // // // //               level={level + 1}
// // // // // // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // // // // // //               onEdit={onEdit}
// // // // // // // // // // //               onDelete={onDelete}
// // // // // // // // // // //               onAddChild={onAddChild}
// // // // // // // // // // //               expandedNodes={expandedNodes}
// // // // // // // // // // //             />
// // // // // // // // // // //           ))}
// // // // // // // // // // //         </div>
// // // // // // // // // // //       )}
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // // SubDomain Modal Component
// // // // // // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // // // // //     title: subDomain?.title || '',
// // // // // // // // // // //     description: subDomain?.description || ''
// // // // // // // // // // //   });
// // // // // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // // // // // //     isEditing: !!subDomain,
// // // // // // // // // // //     parentTitle: parent?.title,
// // // // // // // // // // //     domainTitle: domain?.title,
// // // // // // // // // // //     formData
// // // // // // // // // // //   });

// // // // // // // // // // //   // Generate slug preview
// // // // // // // // // // //   const generateSlug = (title) => {
// // // // // // // // // // //     return title
// // // // // // // // // // //       .toLowerCase()
// // // // // // // // // // //       .replace(/[^a-z0-9]/g, '-')
// // // // // // // // // // //       .replace(/-+/g, '-')
// // // // // // // // // // //       .replace(/^-|-$/g, '');
// // // // // // // // // // //   };

// // // // // // // // // // //   const slugPreview = generateSlug(formData.title);

// // // // // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // // // // //     e.preventDefault();
// // // // // // // // // // //     setLoading(true);

// // // // // // // // // // //     try {
// // // // // // // // // // //       // Generate slug from title
// // // // // // // // // // //       const slug = generateSlug(formData.title);

// // // // // // // // // // //       const requestData = {
// // // // // // // // // // //         ...formData,
// // // // // // // // // // //         slug: slug,
// // // // // // // // // // //         domainId: domain.id,
// // // // // // // // // // //         parentId: parent?.id || null
// // // // // // // // // // //       };

// // // // // // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Generated slug:', slug);
// // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // // // // // //       if (subDomain) {
// // // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // // // // // //       } else {
// // // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // // // // // //       }

// // // // // // // // // // //       onSave();
// // // // // // // // // // //     } catch (error) {
// // // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error response:', error.response);
// // // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error data:', error.response?.data);
// // // // // // // // // // //       toast.error('Failed to save sub-domain');
// // // // // // // // // // //     } finally {
// // // // // // // // // // //       setLoading(false);
// // // // // // // // // // //     }
// // // // // // // // // // //   };

// // // // // // // // // // //   const getModalTitle = () => {
// // // // // // // // // // //     if (subDomain) {
// // // // // // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // // // // // //     }
// // // // // // // // // // //     if (parent) {
// // // // // // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // // // // // //     }
// // // // // // // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // // // // // // //   };

// // // // // // // // // // //   const getLevel = () => {
// // // // // // // // // // //     if (!parent) return 'Root Level';
// // // // // // // // // // //     // This is a simplified level calculation
// // // // // // // // // // //     return `Level ${(parent.level || 0) + 1}`;
// // // // // // // // // // //   };

// // // // // // // // // // //   return (
// // // // // // // // // // //     <div className="modal-overlay">
// // // // // // // // // // //       <div className="modal">
// // // // // // // // // // //         <div className="modal-header">
// // // // // // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // // // // // //           <button onClick={onClose}>×</button>
// // // // // // // // // // //         </div>
        
// // // // // // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // // // // // //           <div className="form-group">
// // // // // // // // // // //             <label>SubDomain Title</label>
// // // // // // // // // // //             <input
// // // // // // // // // // //               type="text"
// // // // // // // // // // //               value={formData.title}
// // // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // // // // // //               required
// // // // // // // // // // //             />
// // // // // // // // // // //             {formData.title && (
// // // // // // // // // // //               <div className="slug-preview">
// // // // // // // // // // //                 <small>URL Slug: <code>{slugPreview || 'enter-title-to-see-slug'}</code></small>
// // // // // // // // // // //               </div>
// // // // // // // // // // //             )}
// // // // // // // // // // //           </div>
          
// // // // // // // // // // //           <div className="form-group">
// // // // // // // // // // //             <label>Description (Optional)</label>
// // // // // // // // // // //             <textarea
// // // // // // // // // // //               value={formData.description}
// // // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // // // // // //               rows={3}
// // // // // // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // // // // // //             />
// // // // // // // // // // //           </div>
          
// // // // // // // // // // //           <div className="modal-info">
// // // // // // // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // // // // // // //             {parent && (
// // // // // // // // // // //               <>
// // // // // // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // // // // // //               </>
// // // // // // // // // // //             )}
// // // // // // // // // // //             <strong>Level:</strong> {getLevel()}
// // // // // // // // // // //           </div>
          
// // // // // // // // // // //           <div className="modal-actions">
// // // // // // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // // // // // //               Cancel
// // // // // // // // // // //             </button>
// // // // // // // // // // //             <button type="submit" className="primary-button" disabled={loading}>
// // // // // // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // // // // // //             </button>
// // // // // // // // // // //           </div>
// // // // // // // // // // //         </form>
// // // // // // // // // // //       </div>
// // // // // // // // // // //     </div>
// // // // // // // // // // //   );
// // // // // // // // // // // };

// // // // // // // // // // // export default SubDomainManagement;


// // // // // // // // // // // // // src/components/domains/SubDomainManagement.js - REPLACE THE TEST VERSION
// // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // // // // // // import { authService } from '../../services/authService';
// // // // // // // // // // // // import { toast } from 'react-toastify';
// // // // // // // // // // // // import {
// // // // // // // // // // // //   FiPlus,
// // // // // // // // // // // //   FiEdit,
// // // // // // // // // // // //   FiTrash2,
// // // // // // // // // // // //   FiChevronDown,
// // // // // // // // // // // //   FiChevronRight,
// // // // // // // // // // // //   FiFolder,
// // // // // // // // // // // //   FiFolderPlus,
// // // // // // // // // // // //   FiFileText,
// // // // // // // // // // // //   FiArrowLeft,
// // // // // // // // // // // //   FiMoreVertical,
// // // // // // // // // // // //   FiMove,
// // // // // // // // // // // //   FiTarget
// // // // // // // // // // // // } from 'react-icons/fi';

// // // // // // // // // // // // const SubDomainManagement = () => {
// // // // // // // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // // // // // // //   const { domainId } = useParams();
// // // // // // // // // // // //   const navigate = useNavigate();
  
// // // // // // // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // // // // // // //     domainId,
// // // // // // // // // // // //     domain: domain?.title,
// // // // // // // // // // // //     subDomainsCount: subDomains.length,
// // // // // // // // // // // //     loading,
// // // // // // // // // // // //     selectedParent: selectedParent?.title,
// // // // // // // // // // // //     expandedCount: expandedNodes.size
// // // // // // // // // // // //   });

// // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // //     if (domainId) {
// // // // // // // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // // // //     }
// // // // // // // // // // // //   }, [domainId]);

// // // // // // // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // // // // // // //     try {
// // // // // // // // // // // //       setLoading(true);
      
// // // // // // // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // // // // // // //       // First, let's try to get domain details
// // // // // // // // // // // //       console.log('🌐 SUBDOMAIN FETCH - Calling getDomains with filter');
// // // // // // // // // // // //       const domainsResponse = await authService.getDomains({ id: domainId });
// // // // // // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domains response:', domainsResponse.data);
      
// // // // // // // // // // // //       // Extract domain from response
// // // // // // // // // // // //       let domainData = null;
// // // // // // // // // // // //       if (domainsResponse.data?.domains && domainsResponse.data.domains.length > 0) {
// // // // // // // // // // // //         domainData = domainsResponse.data.domains.find(d => d.id == domainId);
// // // // // // // // // // // //       } else if (domainsResponse.data?.data?.domains && domainsResponse.data.data.domains.length > 0) {
// // // // // // // // // // // //         domainData = domainsResponse.data.data.domains.find(d => d.id == domainId);
// // // // // // // // // // // //       } else if (Array.isArray(domainsResponse.data)) {
// // // // // // // // // // // //         domainData = domainsResponse.data.find(d => d.id == domainId);
// // // // // // // // // // // //       }
      
// // // // // // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted domain:', domainData);
      
// // // // // // // // // // // //       // If we don't have domain data, create a placeholder
// // // // // // // // // // // //       if (!domainData) {
// // // // // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - No domain found, creating placeholder');
// // // // // // // // // // // //         domainData = {
// // // // // // // // // // // //           id: domainId,
// // // // // // // // // // // //           title: `Domain ${domainId}`,
// // // // // // // // // // // //           description: 'Loading domain details...',
// // // // // // // // // // // //           projectCount: 0
// // // // // // // // // // // //         };
// // // // // // // // // // // //       }
      
// // // // // // // // // // // //       setDomain(domainData);
      
// // // // // // // // // // // //       // Try to get hierarchy if domain exists
// // // // // // // // // // // //       try {
// // // // // // // // // // // //         console.log('🌐 SUBDOMAIN FETCH - Calling getDomainHierarchy');
// // // // // // // // // // // //         const hierarchyResponse = await authService.getDomainHierarchy(domainId);
// // // // // // // // // // // //         console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
        
// // // // // // // // // // // //         const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
// // // // // // // // // // // //         console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy data:', hierarchyData);
        
// // // // // // // // // // // //         setSubDomains(hierarchyData?.subDomains || []);
        
// // // // // // // // // // // //         // Auto-expand first level
// // // // // // // // // // // //         if (hierarchyData?.subDomains?.length > 0) {
// // // // // // // // // // // //           const firstLevelIds = hierarchyData.subDomains.map(sd => sd.id);
// // // // // // // // // // // //           setExpandedNodes(new Set(firstLevelIds));
// // // // // // // // // // // //           console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // // // // // // //         }
// // // // // // // // // // // //       } catch (hierarchyError) {
// // // // // // // // // // // //         console.log('⚠️ SUBDOMAIN FETCH - Hierarchy fetch failed, starting with empty structure:', hierarchyError);
// // // // // // // // // // // //         setSubDomains([]);
// // // // // // // // // // // //       }
      
// // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // // // // // // //       toast.error('Failed to fetch domain information');
      
// // // // // // // // // // // //       // Create fallback domain
// // // // // // // // // // // //       setDomain({
// // // // // // // // // // // //         id: domainId,
// // // // // // // // // // // //         title: `Domain ${domainId}`,
// // // // // // // // // // // //         description: 'Error loading domain details',
// // // // // // // // // // // //         projectCount: 0
// // // // // // // // // // // //       });
// // // // // // // // // // // //       setSubDomains([]);
// // // // // // // // // // // //     } finally {
// // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // // // // // // //     setSelectedParent(parent);
// // // // // // // // // // // //     setEditingSubDomain(null);
// // // // // // // // // // // //     setShowAddModal(true);
    
// // // // // // // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // // // // // // //       showAddModal: true, 
// // // // // // // // // // // //       selectedParent: parent?.title,
// // // // // // // // // // // //       editingSubDomain: null 
// // // // // // // // // // // //     });
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // // // // // // //     setSelectedParent(null);
// // // // // // // // // // // //     setEditingSubDomain(subDomain);
// // // // // // // // // // // //     setShowAddModal(true);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // // // // // // //     if (hasChildren) {
// // // // // // // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // // // // // // //     }
// // // // // // // // // // // //     if (hasProjects) {
// // // // // // // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // // // // // // //     }
    
// // // // // // // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // // // // // // //       return;
// // // // // // // // // // // //     }

// // // // // // // // // // // //     try {
// // // // // // // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // // // // // // //       newExpanded.delete(nodeId);
// // // // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // // // // // // //     } else {
// // // // // // // // // // // //       newExpanded.add(nodeId);
// // // // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // // // // // // //     }
// // // // // // // // // // // //     setExpandedNodes(newExpanded);
// // // // // // // // // // // //   };

// // // // // // // // // // // //   if (loading) {
// // // // // // // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // // // // // // //     return (
// // // // // // // // // // // //       <div className="loading-container">
// // // // // // // // // // // //         <div className="loading-spinner"></div>
// // // // // // // // // // // //         <p>Loading sub-domains...</p>
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     );
// // // // // // // // // // // //   }

// // // // // // // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div className="subdomain-management">
// // // // // // // // // // // //       {/* Header with Breadcrumb */}
// // // // // // // // // // // //       <div className="page-header">
// // // // // // // // // // // //         <div className="header-content">
// // // // // // // // // // // //           <div className="breadcrumb">
// // // // // // // // // // // //             <button 
// // // // // // // // // // // //               className="breadcrumb-link"
// // // // // // // // // // // //               onClick={() => navigate('/domains')}
// // // // // // // // // // // //             >
// // // // // // // // // // // //               <FiArrowLeft />
// // // // // // // // // // // //               Domains
// // // // // // // // // // // //             </button>
// // // // // // // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // // // // // // //             <span className="breadcrumb-current">{domain?.title || 'Loading...'}</span>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //           <h1>SubDomain Management</h1>
// // // // // // // // // // // //           <p>Manage the hierarchical structure of {domain?.title || 'this domain'}</p>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //         <div className="header-actions">
// // // // // // // // // // // //           <button 
// // // // // // // // // // // //             className="primary-button" 
// // // // // // // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // // // // // // //           >
// // // // // // // // // // // //             <FiPlus />
// // // // // // // // // // // //             Add Root SubDomain
// // // // // // // // // // // //           </button>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>

// // // // // // // // // // // //       {/* Quick Guide */}
// // // // // // // // // // // //       <div className="quick-guide">
// // // // // // // // // // // //         <h3>How to Build Your SubDomain Hierarchy:</h3>
// // // // // // // // // // // //         <div className="guide-steps">
// // // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // // //             <span className="step-number">1</span>
// // // // // // // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // // //             <span className="step-number">2</span>
// // // // // // // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // // //             <span className="step-number">3</span>
// // // // // // // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>

// // // // // // // // // // // //       {/* Domain Info Card */}
// // // // // // // // // // // //       {domain && (
// // // // // // // // // // // //         <div className="domain-info-card">
// // // // // // // // // // // //           <div className="domain-icon">
// // // // // // // // // // // //             <FiFolder />
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //           <div className="domain-details">
// // // // // // // // // // // //             <h3>{domain.title}</h3>
// // // // // // // // // // // //             <p>{domain.description}</p>
// // // // // // // // // // // //             <div className="domain-stats">
// // // // // // // // // // // //               <span className="stat-item">
// // // // // // // // // // // //                 <strong>{subDomains.length}</strong> root sub-domains
// // // // // // // // // // // //               </span>
// // // // // // // // // // // //               <span className="stat-item">
// // // // // // // // // // // //                 <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // // // // // // //               </span>
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       )}

// // // // // // // // // // // //       {/* SubDomain Tree */}
// // // // // // // // // // // //       <div className="subdomain-tree-container">
// // // // // // // // // // // //         <div className="tree-header">
// // // // // // // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // // // // // // //           <div className="tree-legend">
// // // // // // // // // // // //             <span className="legend-item">
// // // // // // // // // // // //               <FiFolder className="folder-icon" />
// // // // // // // // // // // //               Has children
// // // // // // // // // // // //             </span>
// // // // // // // // // // // //             <span className="legend-item">
// // // // // // // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // // // // // // //               Leaf (can have projects)
// // // // // // // // // // // //             </span>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>

// // // // // // // // // // // //         {subDomains.length > 0 ? (
// // // // // // // // // // // //           <div className="subdomain-tree">
// // // // // // // // // // // //             {subDomains.map((subDomain) => (
// // // // // // // // // // // //               <SubDomainNode
// // // // // // // // // // // //                 key={subDomain.id}
// // // // // // // // // // // //                 subDomain={subDomain}
// // // // // // // // // // // //                 level={0}
// // // // // // // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // // // // // // //                 expandedNodes={expandedNodes}
// // // // // // // // // // // //               />
// // // // // // // // // // // //             ))}
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         ) : (
// // // // // // // // // // // //           <div className="empty-tree-state">
// // // // // // // // // // // //             <FiFolderPlus size={64} />
// // // // // // // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // // // // // // //             <p>Start organizing your {domain?.title || 'domain'} projects by creating subdomains</p>
// // // // // // // // // // // //             <div className="empty-state-examples">
// // // // // // // // // // // //               <h4>Example Structure:</h4>
// // // // // // // // // // // //               <div className="example-tree">
// // // // // // // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //             <div className="empty-state-actions">
// // // // // // // // // // // //               <button 
// // // // // // // // // // // //                 className="primary-button large" 
// // // // // // // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // // // // // // //               >
// // // // // // // // // // // //                 <FiPlus />
// // // // // // // // // // // //                 Create Your First SubDomain
// // // // // // // // // // // //               </button>
// // // // // // // // // // // //               <p className="help-text">
// // // // // // // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // // // // // // //               </p>
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         )}
// // // // // // // // // // // //       </div>

// // // // // // // // // // // //       {/* Add/Edit Modal */}
// // // // // // // // // // // //       {showAddModal && (
// // // // // // // // // // // //         <SubDomainModal
// // // // // // // // // // // //           subDomain={editingSubDomain}
// // // // // // // // // // // //           parent={selectedParent}
// // // // // // // // // // // //           domain={domain}
// // // // // // // // // // // //           onClose={() => {
// // // // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // // // //           }}
// // // // // // // // // // // //           onSave={() => {
// // // // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // // // //             fetchDomainAndSubDomains();
// // // // // // // // // // // //           }}
// // // // // // // // // // // //         />
// // // // // // // // // // // //       )}
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // // SubDomain Node Component
// // // // // // // // // // // // const SubDomainNode = ({ 
// // // // // // // // // // // //   subDomain, 
// // // // // // // // // // // //   level, 
// // // // // // // // // // // //   isExpanded, 
// // // // // // // // // // // //   onToggleExpanded, 
// // // // // // // // // // // //   onEdit, 
// // // // // // // // // // // //   onDelete, 
// // // // // // // // // // // //   onAddChild,
// // // // // // // // // // // //   expandedNodes 
// // // // // // // // // // // // }) => {
// // // // // // // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // // // //   const isLeaf = !hasChildren;

// // // // // // // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // // // // // // //     title: subDomain.title,
// // // // // // // // // // // //     level,
// // // // // // // // // // // //     hasChildren,
// // // // // // // // // // // //     isLeaf,
// // // // // // // // // // // //     isExpanded,
// // // // // // // // // // // //     projectCount: subDomain.projectCount
// // // // // // // // // // // //   });

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // // // // // // //       <div className="node-content">
// // // // // // // // // // // //         <div className="node-main">
// // // // // // // // // // // //           {hasChildren ? (
// // // // // // // // // // // //             <button 
// // // // // // // // // // // //               className="expand-button"
// // // // // // // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // // // // // // //             >
// // // // // // // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // // // // // // //             </button>
// // // // // // // // // // // //           ) : (
// // // // // // // // // // // //             <div className="expand-placeholder" />
// // // // // // // // // // // //           )}
          
// // // // // // // // // // // //           <div className="node-icon">
// // // // // // // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // // // // // // //           </div>
          
// // // // // // // // // // // //           <div className="node-info">
// // // // // // // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // // // // // // //             <div className="node-stats">
// // // // // // // // // // // //               {hasChildren && (
// // // // // // // // // // // //                 <span className="stat-badge">
// // // // // // // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // // // // // // //                 </span>
// // // // // // // // // // // //               )}
// // // // // // // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // // // // // // //                 <span className="stat-badge projects">
// // // // // // // // // // // //                   {subDomain.projectCount} projects
// // // // // // // // // // // //                 </span>
// // // // // // // // // // // //               )}
// // // // // // // // // // // //               {isLeaf && (
// // // // // // // // // // // //                 <span className="stat-badge leaf">
// // // // // // // // // // // //                   Can have projects
// // // // // // // // // // // //                 </span>
// // // // // // // // // // // //               )}
// // // // // // // // // // // //             </div>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>
        
// // // // // // // // // // // //         <div className="node-actions">
// // // // // // // // // // // //           <button 
// // // // // // // // // // // //             className="action-button add" 
// // // // // // // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // // // // // // //           >
// // // // // // // // // // // //             <FiPlus />
// // // // // // // // // // // //           </button>
// // // // // // // // // // // //           <div className="action-menu">
// // // // // // // // // // // //             <button 
// // // // // // // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // // // // // // //               title="More actions"
// // // // // // // // // // // //             >
// // // // // // // // // // // //               <FiMoreVertical />
// // // // // // // // // // // //             </button>
// // // // // // // // // // // //             {showMenu && (
// // // // // // // // // // // //               <div className="dropdown-menu">
// // // // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // // // //                   onEdit(subDomain);
// // // // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // // // //                 }}>
// // // // // // // // // // // //                   <FiEdit /> Edit
// // // // // // // // // // // //                 </button>
// // // // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // // // //                   onAddChild(subDomain);
// // // // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // // // //                 }}>
// // // // // // // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // // // // // // //                 </button>
// // // // // // // // // // // //                 <button onClick={() => {
// // // // // // // // // // // //                   onDelete(subDomain);
// // // // // // // // // // // //                   setShowMenu(false);
// // // // // // // // // // // //                 }} className="danger">
// // // // // // // // // // // //                   <FiTrash2 /> Delete
// // // // // // // // // // // //                 </button>
// // // // // // // // // // // //               </div>
// // // // // // // // // // // //             )}
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       </div>
      
// // // // // // // // // // // //       {/* Children */}
// // // // // // // // // // // //       {hasChildren && isExpanded && (
// // // // // // // // // // // //         <div className="node-children">
// // // // // // // // // // // //           {subDomain.children.map((child) => (
// // // // // // // // // // // //             <SubDomainNode
// // // // // // // // // // // //               key={child.id}
// // // // // // // // // // // //               subDomain={child}
// // // // // // // // // // // //               level={level + 1}
// // // // // // // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // // // // // // //               onEdit={onEdit}
// // // // // // // // // // // //               onDelete={onDelete}
// // // // // // // // // // // //               onAddChild={onAddChild}
// // // // // // // // // // // //               expandedNodes={expandedNodes}
// // // // // // // // // // // //             />
// // // // // // // // // // // //           ))}
// // // // // // // // // // // //         </div>
// // // // // // // // // // // //       )}
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // // SubDomain Modal Component
// // // // // // // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // // // // // //     title: subDomain?.title || '',
// // // // // // // // // // // //     description: subDomain?.description || ''
// // // // // // // // // // // //   });
// // // // // // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // // // // // // //     isEditing: !!subDomain,
// // // // // // // // // // // //     parentTitle: parent?.title,
// // // // // // // // // // // //     domainTitle: domain?.title,
// // // // // // // // // // // //     formData
// // // // // // // // // // // //   });

// // // // // // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // // // // // //     e.preventDefault();
// // // // // // // // // // // //     setLoading(true);

// // // // // // // // // // // //     try {
// // // // // // // // // // // //       const requestData = {
// // // // // // // // // // // //         ...formData,
// // // // // // // // // // // //         domainId: domain.id,
// // // // // // // // // // // //         parentId: parent?.id || null
// // // // // // // // // // // //       };

// // // // // // // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // // // // // // //       if (subDomain) {
// // // // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // // // // // // //       } else {
// // // // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // // // // // // //       }

// // // // // // // // // // // //       onSave();
// // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // // // // // // //       toast.error('Failed to save sub-domain');
// // // // // // // // // // // //     } finally {
// // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // //     }
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const getModalTitle = () => {
// // // // // // // // // // // //     if (subDomain) {
// // // // // // // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // // // // // // //     }
// // // // // // // // // // // //     if (parent) {
// // // // // // // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // // // // // // //     }
// // // // // // // // // // // //     return `Add Root SubDomain in: ${domain?.title || 'Domain'}`;
// // // // // // // // // // // //   };

// // // // // // // // // // // //   const getLevel = () => {
// // // // // // // // // // // //     if (!parent) return 'Root Level';
// // // // // // // // // // // //     // This is a simplified level calculation
// // // // // // // // // // // //     return `Level ${(parent.level || 0) + 1}`;
// // // // // // // // // // // //   };

// // // // // // // // // // // //   return (
// // // // // // // // // // // //     <div className="modal-overlay">
// // // // // // // // // // // //       <div className="modal">
// // // // // // // // // // // //         <div className="modal-header">
// // // // // // // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // // // // // // //           <button onClick={onClose}>×</button>
// // // // // // // // // // // //         </div>
        
// // // // // // // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // // // // // // //           <div className="form-group">
// // // // // // // // // // // //             <label>SubDomain Title</label>
// // // // // // // // // // // //             <input
// // // // // // // // // // // //               type="text"
// // // // // // // // // // // //               value={formData.title}
// // // // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // // // // // // //               required
// // // // // // // // // // // //             />
// // // // // // // // // // // //           </div>
          
// // // // // // // // // // // //           <div className="form-group">
// // // // // // // // // // // //             <label>Description (Optional)</label>
// // // // // // // // // // // //             <textarea
// // // // // // // // // // // //               value={formData.description}
// // // // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // // // // // // //               rows={3}
// // // // // // // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // // // // // // //             />
// // // // // // // // // // // //           </div>
          
// // // // // // // // // // // //           <div className="modal-info">
// // // // // // // // // // // //             <strong>Domain:</strong> {domain?.title || 'Unknown'}<br />
// // // // // // // // // // // //             {parent && (
// // // // // // // // // // // //               <>
// // // // // // // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // // // // // // //               </>
// // // // // // // // // // // //             )}
// // // // // // // // // // // //             <strong>Level:</strong> {getLevel()}
// // // // // // // // // // // //           </div>
          
// // // // // // // // // // // //           <div className="modal-actions">
// // // // // // // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // // // // // // //               Cancel
// // // // // // // // // // // //             </button>
// // // // // // // // // // // //             <button type="submit" className="primary-button" disabled={loading}>
// // // // // // // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // // // // // // //             </button>
// // // // // // // // // // // //           </div>
// // // // // // // // // // // //         </form>
// // // // // // // // // // // //       </div>
// // // // // // // // // // // //     </div>
// // // // // // // // // // // //   );
// // // // // // // // // // // // };

// // // // // // // // // // // // export default SubDomainManagement;


// // // // // // // // // // // // // // src/components/domains/SubDomainManagement.js - NEW FILE
// // // // // // // // // // // // // import React, { useState, useEffect } from 'react';
// // // // // // // // // // // // // import { useParams, useNavigate } from 'react-router-dom';
// // // // // // // // // // // // // import { authService } from '../../services/authService';
// // // // // // // // // // // // // import { toast } from 'react-toastify';
// // // // // // // // // // // // // import {
// // // // // // // // // // // // //   FiPlus,
// // // // // // // // // // // // //   FiEdit,
// // // // // // // // // // // // //   FiTrash2,
// // // // // // // // // // // // //   FiChevronDown,
// // // // // // // // // // // // //   FiChevronRight,
// // // // // // // // // // // // //   FiFolder,
// // // // // // // // // // // // //   FiFolderPlus,
// // // // // // // // // // // // //   FiFileText,
// // // // // // // // // // // // //   FiArrowLeft,
// // // // // // // // // // // // //   FiMoreVertical,
// // // // // // // // // // // // //   FiMove,
// // // // // // // // // // // // //   FiTarget
// // // // // // // // // // // // // } from 'react-icons/fi';

// // // // // // // // // // // // // const SubDomainManagement = () => {
// // // // // // // // // // // // //   console.log('🚀 SUBDOMAIN MANAGEMENT - Component mounting');
  
// // // // // // // // // // // // //   const { domainId } = useParams();
// // // // // // // // // // // // //   const navigate = useNavigate();
  
// // // // // // // // // // // // //   const [domain, setDomain] = useState(null);
// // // // // // // // // // // // //   const [subDomains, setSubDomains] = useState([]);
// // // // // // // // // // // // //   const [loading, setLoading] = useState(true);
// // // // // // // // // // // // //   const [showAddModal, setShowAddModal] = useState(false);
// // // // // // // // // // // // //   const [editingSubDomain, setEditingSubDomain] = useState(null);
// // // // // // // // // // // // //   const [selectedParent, setSelectedParent] = useState(null);
// // // // // // // // // // // // //   const [expandedNodes, setExpandedNodes] = useState(new Set());

// // // // // // // // // // // // //   console.log('📊 SUBDOMAIN MANAGEMENT - Current state:', {
// // // // // // // // // // // // //     domainId,
// // // // // // // // // // // // //     domain: domain?.title,
// // // // // // // // // // // // //     subDomainsCount: subDomains.length,
// // // // // // // // // // // // //     loading,
// // // // // // // // // // // // //     selectedParent: selectedParent?.title,
// // // // // // // // // // // // //     expandedCount: expandedNodes.size
// // // // // // // // // // // // //   });

// // // // // // // // // // // // //   useEffect(() => {
// // // // // // // // // // // // //     if (domainId) {
// // // // // // // // // // // // //       console.log('🔄 SUBDOMAIN MANAGEMENT - useEffect triggered, fetching data');
// // // // // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   }, [domainId]);

// // // // // // // // // // // // //   const fetchDomainAndSubDomains = async () => {
// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       setLoading(true);
      
// // // // // // // // // // // // //       console.log('🔍 SUBDOMAIN FETCH - Starting API calls');
// // // // // // // // // // // // //       console.log('📋 SUBDOMAIN FETCH - Domain ID:', domainId);
      
// // // // // // // // // // // // //       // Fetch domain details and hierarchy
// // // // // // // // // // // // //       const [domainResponse, hierarchyResponse] = await Promise.all([
// // // // // // // // // // // // //         authService.getDomains({ id: domainId }),
// // // // // // // // // // // // //         authService.getDomainHierarchy(domainId)
// // // // // // // // // // // // //       ]);
      
// // // // // // // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Domain response:', domainResponse.data);
// // // // // // // // // // // // //       console.log('✅ SUBDOMAIN FETCH - Hierarchy response:', hierarchyResponse.data);
      
// // // // // // // // // // // // //       const domainData = domainResponse.data?.domains?.[0] || 
// // // // // // // // // // // // //                         domainResponse.data?.data?.domains?.[0] || 
// // // // // // // // // // // // //                         domainResponse.data;
      
// // // // // // // // // // // // //       const hierarchyData = hierarchyResponse.data?.data || hierarchyResponse.data;
      
// // // // // // // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted domain:', domainData);
// // // // // // // // // // // // //       console.log('🎯 SUBDOMAIN FETCH - Extracted hierarchy:', hierarchyData);
      
// // // // // // // // // // // // //       setDomain(domainData);
// // // // // // // // // // // // //       setSubDomains(hierarchyData?.subDomains || []);
      
// // // // // // // // // // // // //       // Auto-expand first level
// // // // // // // // // // // // //       if (hierarchyData?.subDomains?.length > 0) {
// // // // // // // // // // // // //         const firstLevelIds = hierarchyData.subDomains.map(sd => sd.id);
// // // // // // // // // // // // //         setExpandedNodes(new Set(firstLevelIds));
// // // // // // // // // // // // //         console.log('🌳 SUBDOMAIN FETCH - Auto-expanded first level nodes:', firstLevelIds);
// // // // // // // // // // // // //       }
      
// // // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error occurred:', error);
// // // // // // // // // // // // //       console.error('❌ SUBDOMAIN FETCH - Error response:', error.response);
// // // // // // // // // // // // //       toast.error('Failed to fetch sub-domains');
// // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // //       console.log('🏁 SUBDOMAIN FETCH - Loading completed');
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const handleAddSubDomain = (parent = null) => {
// // // // // // // // // // // // //     console.log('➕ SUBDOMAIN MANAGEMENT - Add subdomain clicked');
// // // // // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - Parent:', parent);
    
// // // // // // // // // // // // //     setSelectedParent(parent);
// // // // // // // // // // // // //     setEditingSubDomain(null);
// // // // // // // // // // // // //     setShowAddModal(true);
    
// // // // // // // // // // // // //     console.log('📊 SUBDOMAIN MANAGEMENT - Modal state:', { 
// // // // // // // // // // // // //       showAddModal: true, 
// // // // // // // // // // // // //       selectedParent: parent?.title,
// // // // // // // // // // // // //       editingSubDomain: null 
// // // // // // // // // // // // //     });
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const handleEditSubDomain = (subDomain) => {
// // // // // // // // // // // // //     console.log('✏️ SUBDOMAIN MANAGEMENT - Edit subdomain clicked');
// // // // // // // // // // // // //     console.log('📋 SUBDOMAIN MANAGEMENT - SubDomain to edit:', subDomain);
    
// // // // // // // // // // // // //     setSelectedParent(null);
// // // // // // // // // // // // //     setEditingSubDomain(subDomain);
// // // // // // // // // // // // //     setShowAddModal(true);
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const handleDeleteSubDomain = async (subDomain) => {
// // // // // // // // // // // // //     const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // // // // //     const hasProjects = subDomain.projectCount > 0;
    
// // // // // // // // // // // // //     let confirmMessage = `Are you sure you want to delete "${subDomain.title}"?`;
// // // // // // // // // // // // //     if (hasChildren) {
// // // // // // // // // // // // //       confirmMessage += '\n\nThis will also delete all nested sub-domains.';
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     if (hasProjects) {
// // // // // // // // // // // // //       confirmMessage += '\n\nThis sub-domain has projects assigned to it.';
// // // // // // // // // // // // //     }
    
// // // // // // // // // // // // //     if (!window.confirm(confirmMessage)) {
// // // // // // // // // // // // //       return;
// // // // // // // // // // // // //     }

// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       console.log('🗑️ SUBDOMAIN DELETE - Starting API call');
// // // // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - SubDomain to delete:', subDomain);
// // // // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has children:', hasChildren);
// // // // // // // // // // // // //       console.log('📋 SUBDOMAIN DELETE - Has projects:', hasProjects);
      
// // // // // // // // // // // // //       const response = await authService.deleteSubDomain(subDomain.id);
      
// // // // // // // // // // // // //       console.log('✅ SUBDOMAIN DELETE - Response:', response.data);
      
// // // // // // // // // // // // //       toast.success('Sub-domain deleted successfully');
// // // // // // // // // // // // //       fetchDomainAndSubDomains();
// // // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // // //       console.error('❌ SUBDOMAIN DELETE - Error:', error);
// // // // // // // // // // // // //       toast.error('Failed to delete sub-domain');
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const toggleExpanded = (nodeId) => {
// // // // // // // // // // // // //     console.log('🔄 SUBDOMAIN TREE - Toggle expansion for node:', nodeId);
    
// // // // // // // // // // // // //     const newExpanded = new Set(expandedNodes);
// // // // // // // // // // // // //     if (newExpanded.has(nodeId)) {
// // // // // // // // // // // // //       newExpanded.delete(nodeId);
// // // // // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Collapsed node:', nodeId);
// // // // // // // // // // // // //     } else {
// // // // // // // // // // // // //       newExpanded.add(nodeId);
// // // // // // // // // // // // //       console.log('📊 SUBDOMAIN TREE - Expanded node:', nodeId);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     setExpandedNodes(newExpanded);
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const isLeafNode = (subDomain) => {
// // // // // // // // // // // // //     return !subDomain.children || subDomain.children.length === 0;
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const getNodeLevel = (subDomain, level = 0) => {
// // // // // // // // // // // // //     return level;
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   if (loading) {
// // // // // // // // // // // // //     console.log('⏳ SUBDOMAIN MANAGEMENT - Showing loading state');
    
// // // // // // // // // // // // //     return (
// // // // // // // // // // // // //       <div className="loading-container">
// // // // // // // // // // // // //         <div className="loading-spinner"></div>
// // // // // // // // // // // // //         <p>Loading sub-domains...</p>
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     );
// // // // // // // // // // // // //   }

// // // // // // // // // // // // //   if (!domain) {
// // // // // // // // // // // // //     console.log('❌ SUBDOMAIN MANAGEMENT - Domain not found');
    
// // // // // // // // // // // // //     return (
// // // // // // // // // // // // //       <div className="empty-state">
// // // // // // // // // // // // //         <h3>Domain not found</h3>
// // // // // // // // // // // // //         <p>The requested domain could not be loaded.</p>
// // // // // // // // // // // // //         <button 
// // // // // // // // // // // // //           className="primary-button" 
// // // // // // // // // // // // //           onClick={() => navigate('/domains')}
// // // // // // // // // // // // //         >
// // // // // // // // // // // // //           <FiArrowLeft />
// // // // // // // // // // // // //           Back to Domains
// // // // // // // // // // // // //         </button>
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     );
// // // // // // // // // // // // //   }

// // // // // // // // // // // // //   console.log('🎨 SUBDOMAIN MANAGEMENT - Rendering main component');

// // // // // // // // // // // // //   return (
// // // // // // // // // // // // //     <div className="subdomain-management">
// // // // // // // // // // // // //       {/* Header with Breadcrumb */}
// // // // // // // // // // // // //       <div className="page-header">
// // // // // // // // // // // // //         <div className="header-content">
// // // // // // // // // // // // //           <div className="breadcrumb">
// // // // // // // // // // // // //             <button 
// // // // // // // // // // // // //               className="breadcrumb-link"
// // // // // // // // // // // // //               onClick={() => navigate('/domains')}
// // // // // // // // // // // // //             >
// // // // // // // // // // // // //               <FiArrowLeft />
// // // // // // // // // // // // //               Domains
// // // // // // // // // // // // //             </button>
// // // // // // // // // // // // //             <span className="breadcrumb-separator">/</span>
// // // // // // // // // // // // //             <span className="breadcrumb-current">{domain.title}</span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //           <h1>SubDomain Management</h1>
// // // // // // // // // // // // //           <p>Manage the hierarchical structure of {domain.title}</p>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //         <div className="header-actions">
// // // // // // // // // // // // //           <button 
// // // // // // // // // // // // //             className="primary-button" 
// // // // // // // // // // // // //             onClick={() => handleAddSubDomain()}
// // // // // // // // // // // // //           >
// // // // // // // // // // // // //             <FiPlus />
// // // // // // // // // // // // //             Add Root SubDomain
// // // // // // // // // // // // //           </button>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>

// // // // // // // // // // // // //       {/* Quick Guide */}
// // // // // // // // // // // // //       <div className="quick-guide">
// // // // // // // // // // // // //         <h3>How to Add SubDomains:</h3>
// // // // // // // // // // // // //         <div className="guide-steps">
// // // // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // // // //             <span className="step-number">1</span>
// // // // // // // // // // // // //             <span className="step-text">Click <strong>"Add Root SubDomain"</strong> to create top-level categories</span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // // // //             <span className="step-number">2</span>
// // // // // // // // // // // // //             <span className="step-text">Click the <FiPlus className="inline-icon" /> button next to any subdomain to add children</span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //           <div className="guide-step">
// // // // // // // // // // // // //             <span className="step-number">3</span>
// // // // // // // // // // // // //             <span className="step-text">Only <FiTarget className="inline-icon leaf" /> leaf subdomains can have projects assigned</span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>

// // // // // // // // // // // // //       {/* Domain Info Card */}
// // // // // // // // // // // // //       <div className="domain-info-card">
// // // // // // // // // // // // //         <div className="domain-icon">
// // // // // // // // // // // // //           <FiFolder />
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //         <div className="domain-details">
// // // // // // // // // // // // //           <h3>{domain.title}</h3>
// // // // // // // // // // // // //           <p>{domain.description}</p>
// // // // // // // // // // // // //           <div className="domain-stats">
// // // // // // // // // // // // //             <span className="stat-item">
// // // // // // // // // // // // //               <strong>{subDomains.length}</strong> root sub-domains
// // // // // // // // // // // // //             </span>
// // // // // // // // // // // // //             <span className="stat-item">
// // // // // // // // // // // // //               <strong>{domain.projectCount || 0}</strong> total projects
// // // // // // // // // // // // //             </span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>

// // // // // // // // // // // // //       {/* SubDomain Tree */}
// // // // // // // // // // // // //       <div className="subdomain-tree-container">
// // // // // // // // // // // // //         <div className="tree-header">
// // // // // // // // // // // // //           <h2>SubDomain Hierarchy</h2>
// // // // // // // // // // // // //           <div className="tree-legend">
// // // // // // // // // // // // //             <span className="legend-item">
// // // // // // // // // // // // //               <FiFolder className="folder-icon" />
// // // // // // // // // // // // //               Has children
// // // // // // // // // // // // //             </span>
// // // // // // // // // // // // //             <span className="legend-item">
// // // // // // // // // // // // //               <FiTarget className="leaf-icon" />
// // // // // // // // // // // // //               Leaf (can have projects)
// // // // // // // // // // // // //             </span>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>

// // // // // // // // // // // // //         {subDomains.length > 0 ? (
// // // // // // // // // // // // //           <div className="subdomain-tree">
// // // // // // // // // // // // //             {subDomains.map((subDomain) => (
// // // // // // // // // // // // //               <SubDomainNode
// // // // // // // // // // // // //                 key={subDomain.id}
// // // // // // // // // // // // //                 subDomain={subDomain}
// // // // // // // // // // // // //                 level={0}
// // // // // // // // // // // // //                 isExpanded={expandedNodes.has(subDomain.id)}
// // // // // // // // // // // // //                 onToggleExpanded={toggleExpanded}
// // // // // // // // // // // // //                 onEdit={handleEditSubDomain}
// // // // // // // // // // // // //                 onDelete={handleDeleteSubDomain}
// // // // // // // // // // // // //                 onAddChild={handleAddSubDomain}
// // // // // // // // // // // // //                 expandedNodes={expandedNodes}
// // // // // // // // // // // // //               />
// // // // // // // // // // // // //             ))}
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         ) : (
// // // // // // // // // // // // //           <div className="empty-tree-state">
// // // // // // // // // // // // //             <FiFolderPlus size={64} />
// // // // // // // // // // // // //             <h3>No SubDomains Yet</h3>
// // // // // // // // // // // // //             <p>Start organizing your {domain.title} projects by creating subdomains</p>
// // // // // // // // // // // // //             <div className="empty-state-examples">
// // // // // // // // // // // // //               <h4>Example Structure:</h4>
// // // // // // // // // // // // //               <div className="example-tree">
// // // // // // // // // // // // //                 <div className="example-item">📂 Machine Learning</div>
// // // // // // // // // // // // //                 <div className="example-item nested">🎯 Deep Learning</div>
// // // // // // // // // // // // //                 <div className="example-item nested">🎯 Computer Vision</div>
// // // // // // // // // // // // //                 <div className="example-item">🎯 Data Science</div>
// // // // // // // // // // // // //               </div>
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //             <div className="empty-state-actions">
// // // // // // // // // // // // //               <button 
// // // // // // // // // // // // //                 className="primary-button large" 
// // // // // // // // // // // // //                 onClick={() => handleAddSubDomain()}
// // // // // // // // // // // // //               >
// // // // // // // // // // // // //                 <FiPlus />
// // // // // // // // // // // // //                 Create Your First SubDomain
// // // // // // // // // // // // //               </button>
// // // // // // // // // // // // //               <p className="help-text">
// // // // // // // // // // // // //                 💡 Tip: Start with broad categories, then add specific subcategories as needed
// // // // // // // // // // // // //               </p>
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         )}
// // // // // // // // // // // // //       </div>

// // // // // // // // // // // // //       {/* Add/Edit Modal */}
// // // // // // // // // // // // //       {showAddModal && (
// // // // // // // // // // // // //         <SubDomainModal
// // // // // // // // // // // // //           subDomain={editingSubDomain}
// // // // // // // // // // // // //           parent={selectedParent}
// // // // // // // // // // // // //           domain={domain}
// // // // // // // // // // // // //           onClose={() => {
// // // // // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // // // // //           }}
// // // // // // // // // // // // //           onSave={() => {
// // // // // // // // // // // // //             setShowAddModal(false);
// // // // // // // // // // // // //             setEditingSubDomain(null);
// // // // // // // // // // // // //             setSelectedParent(null);
// // // // // // // // // // // // //             fetchDomainAndSubDomains();
// // // // // // // // // // // // //           }}
// // // // // // // // // // // // //         />
// // // // // // // // // // // // //       )}
// // // // // // // // // // // // //     </div>
// // // // // // // // // // // // //   );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // // SubDomain Node Component
// // // // // // // // // // // // // const SubDomainNode = ({ 
// // // // // // // // // // // // //   subDomain, 
// // // // // // // // // // // // //   level, 
// // // // // // // // // // // // //   isExpanded, 
// // // // // // // // // // // // //   onToggleExpanded, 
// // // // // // // // // // // // //   onEdit, 
// // // // // // // // // // // // //   onDelete, 
// // // // // // // // // // // // //   onAddChild,
// // // // // // // // // // // // //   expandedNodes 
// // // // // // // // // // // // // }) => {
// // // // // // // // // // // // //   const [showMenu, setShowMenu] = useState(false);
// // // // // // // // // // // // //   const hasChildren = subDomain.children && subDomain.children.length > 0;
// // // // // // // // // // // // //   const isLeaf = !hasChildren;

// // // // // // // // // // // // //   console.log('🌳 SUBDOMAIN NODE - Rendering:', {
// // // // // // // // // // // // //     title: subDomain.title,
// // // // // // // // // // // // //     level,
// // // // // // // // // // // // //     hasChildren,
// // // // // // // // // // // // //     isLeaf,
// // // // // // // // // // // // //     isExpanded,
// // // // // // // // // // // // //     projectCount: subDomain.projectCount
// // // // // // // // // // // // //   });

// // // // // // // // // // // // //   return (
// // // // // // // // // // // // //     <div className={`subdomain-node level-${level}`}>
// // // // // // // // // // // // //       <div className="node-content">
// // // // // // // // // // // // //         <div className="node-main">
// // // // // // // // // // // // //           {hasChildren ? (
// // // // // // // // // // // // //             <button 
// // // // // // // // // // // // //               className="expand-button"
// // // // // // // // // // // // //               onClick={() => onToggleExpanded(subDomain.id)}
// // // // // // // // // // // // //             >
// // // // // // // // // // // // //               {isExpanded ? <FiChevronDown /> : <FiChevronRight />}
// // // // // // // // // // // // //             </button>
// // // // // // // // // // // // //           ) : (
// // // // // // // // // // // // //             <div className="expand-placeholder" />
// // // // // // // // // // // // //           )}
          
// // // // // // // // // // // // //           <div className="node-icon">
// // // // // // // // // // // // //             {isLeaf ? <FiTarget className="leaf-icon" /> : <FiFolder className="folder-icon" />}
// // // // // // // // // // // // //           </div>
          
// // // // // // // // // // // // //           <div className="node-info">
// // // // // // // // // // // // //             <h4 className="node-title">{subDomain.title}</h4>
// // // // // // // // // // // // //             <p className="node-description">{subDomain.description}</p>
// // // // // // // // // // // // //             <div className="node-stats">
// // // // // // // // // // // // //               {hasChildren && (
// // // // // // // // // // // // //                 <span className="stat-badge">
// // // // // // // // // // // // //                   {subDomain.children.length} sub-domains
// // // // // // // // // // // // //                 </span>
// // // // // // // // // // // // //               )}
// // // // // // // // // // // // //               {subDomain.projectCount > 0 && (
// // // // // // // // // // // // //                 <span className="stat-badge projects">
// // // // // // // // // // // // //                   {subDomain.projectCount} projects
// // // // // // // // // // // // //                 </span>
// // // // // // // // // // // // //               )}
// // // // // // // // // // // // //               {isLeaf && (
// // // // // // // // // // // // //                 <span className="stat-badge leaf">
// // // // // // // // // // // // //                   Can have projects
// // // // // // // // // // // // //                 </span>
// // // // // // // // // // // // //               )}
// // // // // // // // // // // // //             </div>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
        
// // // // // // // // // // // // //         <div className="node-actions">
// // // // // // // // // // // // //           <button 
// // // // // // // // // // // // //             className="action-button add" 
// // // // // // // // // // // // //             onClick={() => onAddChild(subDomain)}
// // // // // // // // // // // // //             title={`Add child subdomain under "${subDomain.title}"`}
// // // // // // // // // // // // //           >
// // // // // // // // // // // // //             <FiPlus />
// // // // // // // // // // // // //           </button>
// // // // // // // // // // // // //           <div className="action-menu">
// // // // // // // // // // // // //             <button 
// // // // // // // // // // // // //               onClick={() => setShowMenu(!showMenu)}
// // // // // // // // // // // // //               title="More actions"
// // // // // // // // // // // // //             >
// // // // // // // // // // // // //               <FiMoreVertical />
// // // // // // // // // // // // //             </button>
// // // // // // // // // // // // //             {showMenu && (
// // // // // // // // // // // // //               <div className="dropdown-menu">
// // // // // // // // // // // // //                 <button onClick={() => onEdit(subDomain)}>
// // // // // // // // // // // // //                   <FiEdit /> Edit
// // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // //                 <button onClick={() => onAddChild(subDomain)}>
// // // // // // // // // // // // //                   <FiPlus /> Add Child SubDomain
// // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // //                 <button onClick={() => onDelete(subDomain)} className="danger">
// // // // // // // // // // // // //                   <FiTrash2 /> Delete
// // // // // // // // // // // // //                 </button>
// // // // // // // // // // // // //               </div>
// // // // // // // // // // // // //             )}
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       </div>
      
// // // // // // // // // // // // //       {/* Children */}
// // // // // // // // // // // // //       {hasChildren && isExpanded && (
// // // // // // // // // // // // //         <div className="node-children">
// // // // // // // // // // // // //           {subDomain.children.map((child) => (
// // // // // // // // // // // // //             <SubDomainNode
// // // // // // // // // // // // //               key={child.id}
// // // // // // // // // // // // //               subDomain={child}
// // // // // // // // // // // // //               level={level + 1}
// // // // // // // // // // // // //               isExpanded={expandedNodes.has(child.id)}
// // // // // // // // // // // // //               onToggleExpanded={onToggleExpanded}
// // // // // // // // // // // // //               onEdit={onEdit}
// // // // // // // // // // // // //               onDelete={onDelete}
// // // // // // // // // // // // //               onAddChild={onAddChild}
// // // // // // // // // // // // //               expandedNodes={expandedNodes}
// // // // // // // // // // // // //             />
// // // // // // // // // // // // //           ))}
// // // // // // // // // // // // //         </div>
// // // // // // // // // // // // //       )}
// // // // // // // // // // // // //     </div>
// // // // // // // // // // // // //   );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // // SubDomain Modal Component
// // // // // // // // // // // // // const SubDomainModal = ({ subDomain, parent, domain, onClose, onSave }) => {
// // // // // // // // // // // // //   const [formData, setFormData] = useState({
// // // // // // // // // // // // //     title: subDomain?.title || '',
// // // // // // // // // // // // //     description: subDomain?.description || ''
// // // // // // // // // // // // //   });
// // // // // // // // // // // // //   const [loading, setLoading] = useState(false);

// // // // // // // // // // // // //   console.log('📝 SUBDOMAIN MODAL - Props:', {
// // // // // // // // // // // // //     isEditing: !!subDomain,
// // // // // // // // // // // // //     parentTitle: parent?.title,
// // // // // // // // // // // // //     domainTitle: domain?.title,
// // // // // // // // // // // // //     formData
// // // // // // // // // // // // //   });

// // // // // // // // // // // // //   const handleSubmit = async (e) => {
// // // // // // // // // // // // //     e.preventDefault();
// // // // // // // // // // // // //     setLoading(true);

// // // // // // // // // // // // //     try {
// // // // // // // // // // // // //       const requestData = {
// // // // // // // // // // // // //         ...formData,
// // // // // // // // // // // // //         domainId: domain.id,
// // // // // // // // // // // // //         parentId: parent?.id || null
// // // // // // // // // // // // //       };

// // // // // // // // // // // // //       console.log('💾 SUBDOMAIN SAVE - Starting API call');
// // // // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Request data:', requestData);
// // // // // // // // // // // // //       console.log('📋 SUBDOMAIN SAVE - Is editing:', !!subDomain);

// // // // // // // // // // // // //       if (subDomain) {
// // // // // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains/' + subDomain.id);
// // // // // // // // // // // // //         const response = await authService.updateSubDomain(subDomain.id, requestData);
// // // // // // // // // // // // //         console.log('✅ SUBDOMAIN UPDATE - Response:', response.data);
// // // // // // // // // // // // //         toast.success('Sub-domain updated successfully');
// // // // // // // // // // // // //       } else {
// // // // // // // // // // // // //         console.log('🌐 SUBDOMAIN SAVE - API URL: /admin/subdomains');
// // // // // // // // // // // // //         const response = await authService.createSubDomain(requestData);
// // // // // // // // // // // // //         console.log('✅ SUBDOMAIN CREATE - Response:', response.data);
// // // // // // // // // // // // //         toast.success('Sub-domain created successfully');
// // // // // // // // // // // // //       }

// // // // // // // // // // // // //       onSave();
// // // // // // // // // // // // //     } catch (error) {
// // // // // // // // // // // // //       console.error('❌ SUBDOMAIN SAVE - Error:', error);
// // // // // // // // // // // // //       toast.error('Failed to save sub-domain');
// // // // // // // // // // // // //     } finally {
// // // // // // // // // // // // //       setLoading(false);
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   const getModalTitle = () => {
// // // // // // // // // // // // //     if (subDomain) {
// // // // // // // // // // // // //       return `Edit SubDomain: ${subDomain.title}`;
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     if (parent) {
// // // // // // // // // // // // //       return `Add SubDomain under: ${parent.title}`;
// // // // // // // // // // // // //     }
// // // // // // // // // // // // //     return `Add Root SubDomain in: ${domain.title}`;
// // // // // // // // // // // // //   };

// // // // // // // // // // // // //   return (
// // // // // // // // // // // // //     <div className="modal-overlay">
// // // // // // // // // // // // //       <div className="modal">
// // // // // // // // // // // // //         <div className="modal-header">
// // // // // // // // // // // // //           <h2>{getModalTitle()}</h2>
// // // // // // // // // // // // //           <button onClick={onClose}>×</button>
// // // // // // // // // // // // //         </div>
        
// // // // // // // // // // // // //         <form onSubmit={handleSubmit}>
// // // // // // // // // // // // //           <div className="form-group">
// // // // // // // // // // // // //             <label>SubDomain Title</label>
// // // // // // // // // // // // //             <input
// // // // // // // // // // // // //               type="text"
// // // // // // // // // // // // //               value={formData.title}
// // // // // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
// // // // // // // // // // // // //               placeholder="e.g., Machine Learning, Deep Learning"
// // // // // // // // // // // // //               required
// // // // // // // // // // // // //             />
// // // // // // // // // // // // //           </div>
          
// // // // // // // // // // // // //           <div className="form-group">
// // // // // // // // // // // // //             <label>Description (Optional)</label>
// // // // // // // // // // // // //             <textarea
// // // // // // // // // // // // //               value={formData.description}
// // // // // // // // // // // // //               onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
// // // // // // // // // // // // //               rows={3}
// // // // // // // // // // // // //               placeholder="Describe what this sub-domain covers..."
// // // // // // // // // // // // //             />
// // // // // // // // // // // // //           </div>
          
// // // // // // // // // // // // //           <div className="modal-info">
// // // // // // // // // // // // //             <strong>Domain:</strong> {domain.title}<br />
// // // // // // // // // // // // //             {parent && (
// // // // // // // // // // // // //               <>
// // // // // // // // // // // // //                 <strong>Parent SubDomain:</strong> {parent.title}<br />
// // // // // // // // // // // // //               </>
// // // // // // // // // // // // //             )}
// // // // // // // // // // // // //             <strong>Level:</strong> {parent ? `Level ${getLevel(parent) + 1}` : 'Root Level'}
// // // // // // // // // // // // //           </div>
          
// // // // // // // // // // // // //           <div className="modal-actions">
// // // // // // // // // // // // //             <button type="button" onClick={onClose} disabled={loading}>
// // // // // // // // // // // // //               Cancel
// // // // // // // // // // // // //             </button>
// // // // // // // // // // // // //             <button type="submit" className="primary-button" disabled={loading}>
// // // // // // // // // // // // //               {loading ? 'Saving...' : 'Save SubDomain'}
// // // // // // // // // // // // //             </button>
// // // // // // // // // // // // //           </div>
// // // // // // // // // // // // //         </form>
// // // // // // // // // // // // //       </div>
// // // // // // // // // // // // //     </div>
// // // // // // // // // // // // //   );
// // // // // // // // // // // // // };

// // // // // // // // // // // // // // Helper function to get level
// // // // // // // // // // // // // const getLevel = (subDomain, level = 0) => {
// // // // // // // // // // // // //   // This would need to be calculated based on the hierarchy
// // // // // // // // // // // // //   return level + 1;
// // // // // // // // // // // // // };

// // // // // // // // // // // // // export default SubDomainManagement;