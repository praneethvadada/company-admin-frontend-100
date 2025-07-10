
// src/components/internships/ManageBranches.js
import React, { useState, useEffect } from 'react';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiSettings, 
  FiBookOpen,
  FiUsers,
  FiSearch,
  FiGrid,
  FiList,
  FiInfo,
  FiAlertTriangle
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
import { branchService } from '../../services/branchService';
import './ManageBranches.css';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [showInternshipModal, setShowInternshipModal] = useState(false);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching branches from API...');
      
      const response = await branchService.getAllBranches();
      console.log('✅ API Response:', response);
      
      let branchesData = [];
      
      if (response.data?.data?.branches) {
        branchesData = response.data.data.branches;
      } else if (response.data?.branches) {
        branchesData = response.data.branches;
      } else if (Array.isArray(response.data?.data)) {
        branchesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        branchesData = response.data;
      }
      
      if (Array.isArray(branchesData) && branchesData.length > 0) {
        setBranches(branchesData);
        toast.success(`Loaded ${branchesData.length} branches successfully!`);
      } else {
        setBranches([]);
        toast.warning('No branches found');
      }
    } catch (error) {
      console.error('❌ Error fetching branches:', error);
      setBranches([]);
      
      if (error.response?.status === 401) {
        toast.error('Authentication required. Please login again.');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please check if the backend is running.');
      } else {
        toast.error('Failed to fetch branches. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ CHECK BRANCH STATE - determines what actions are allowed
  const getBranchState = async (branch) => {
    try {
      // Fetch domains and direct internships for this branch
      const [domainsResponse, internshipsResponse] = await Promise.all([
        branchService.getDomainsByBranch(branch.id).catch(() => ({ data: [] })),
        branchService.getDirectInternships(branch.id).catch(() => ({ data: [] }))
      ]);

      const domains = domainsResponse.data?.data || domainsResponse.data || [];
      const directInternships = internshipsResponse.data?.data || internshipsResponse.data || [];

      const hasDomains = Array.isArray(domains) && domains.length > 0;
      const hasDirectInternships = Array.isArray(directInternships) && directInternships.length > 0;

      return {
        hasDomains,
        hasDirectInternships,
        domainCount: hasDomains ? domains.length : 0,
        directInternshipCount: hasDirectInternships ? directInternships.length : 0,
        // Branch state logic
        canAddDomains: !hasDirectInternships, // Can add domains only if no direct internships
        canAddDirectInternships: !hasDomains, // Can add direct internships only if no domains
        mode: hasDomains ? 'domain-based' : hasDirectInternships ? 'direct' : 'empty'
      };
    } catch (error) {
      console.error('Error checking branch state:', error);
      return {
        hasDomains: false,
        hasDirectInternships: false,
        domainCount: 0,
        directInternshipCount: 0,
        canAddDomains: true,
        canAddDirectInternships: true,
        mode: 'empty'
      };
    }
  };


  // ================================================================================================
// ADD THESE MISSING COMPONENTS TO YOUR ManageBranches.js FILE
// ================================================================================================

// Add these components at the end of your ManageBranches.js file, before the export:

// Branch Modal Component (same as before)
const BranchModal = ({ branch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    code: branch?.code || '',
    description: branch?.description || '',
    isActive: branch?.isActive !== undefined ? branch.isActive : true,
    sortOrder: branch?.sortOrder || 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Branch name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Branch name must be at least 2 characters';
    }
    
    if (!formData.code.trim()) {
      newErrors.code = 'Branch code is required';
    } else if (formData.code.length < 2) {
      newErrors.code = 'Branch code must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving branch:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={branch ? 'Edit Branch' : 'Add Branch'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="branch-form">
        <div className="form-group">
          <label>Branch Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Computer Science & Engineering"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Branch Code *</label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., CSE"
            className={errors.code ? 'error' : ''}
          />
          {errors.code && <span className="error-text">{errors.code}</span>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the branch"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (branch ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// REAL Domain Management Modal (working version)
const DomainManagementModal = ({ branch, onClose }) => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDomainModal, setShowDomainModal] = useState(false);
  const [editingDomain, setEditingDomain] = useState(null);

  useEffect(() => {
    fetchDomains();
  }, [branch.id]);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const response = await branchService.getDomainsByBranch(branch.id);
      const domainsData = response.data?.data || response.data || [];
      setDomains(Array.isArray(domainsData) ? domainsData : []);
    } catch (error) {
      console.error('Error fetching domains:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch domains');
      }
      setDomains([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDomain = async (domainData) => {
    try {
      const dataWithBranch = { ...domainData, branchId: branch.id };
      
      if (editingDomain) {
        await branchService.updateDomain(editingDomain.id, dataWithBranch);
        toast.success('Domain updated successfully');
      } else {
        await branchService.createDomain(dataWithBranch);
        toast.success('Domain created successfully');
      }
      
      setShowDomainModal(false);
      setEditingDomain(null);
      fetchDomains();
    } catch (error) {
      console.error('Error saving domain:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save domain');
      }
    }
  };

  const handleDeleteDomain = async (domain) => {
    if (window.confirm(`Are you sure you want to delete "${domain.name}"?`)) {
      try {
        await branchService.deleteDomain(domain.id);
        toast.success('Domain deleted successfully');
        fetchDomains();
      } catch (error) {
        console.error('Error deleting domain:', error);
        toast.error('Failed to delete domain');
      }
    }
  };

  return (
    <Modal title={`Manage Domains - ${branch.name}`} onClose={onClose} size="large">
      <div className="domain-management">
        <div className="section-header">
          <h3>Domains under {branch.name}</h3>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingDomain(null);
              setShowDomainModal(true);
            }}
          >
            <FiPlus /> Add Domain
          </button>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading domains...</p>
          </div>
        ) : (
          <div className="domains-grid">
            {domains.map(domain => (
              <div key={domain.id} className="domain-card">
                <div className="domain-header">
                  <h4>{domain.name}</h4>
                  <div className="domain-actions">
                    <button 
                      className="btn btn-sm btn-outline"
                      onClick={() => {
                        setEditingDomain(domain);
                        setShowDomainModal(true);
                      }}
                    >
                      <FiEdit />
                    </button>
                    <button 
                      className="btn btn-sm btn-danger"
                      onClick={() => handleDeleteDomain(domain)}
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
                
                {domain.description && (
                  <p className="domain-description">{domain.description}</p>
                )}
                
                <div className="domain-stats">
                  <span className="stat">
                    {domain.internshipCount || 0} Internships
                  </span>
                  <span className={`status ${domain.isActive ? 'active' : 'inactive'}`}>
                    {domain.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))}
            
            {domains.length === 0 && (
              <div className="empty-state">
                <FiGrid size={32} />
                <p>No domains found</p>
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingDomain(null);
                    setShowDomainModal(true);
                  }}
                >
                  <FiPlus /> Add First Domain
                </button>
              </div>
            )}
          </div>
        )}

        {showDomainModal && (
          <DomainModal
            domain={editingDomain}
            branch={branch}
            onClose={() => {
              setShowDomainModal(false);
              setEditingDomain(null);
            }}
            onSave={handleSaveDomain}
          />
        )}
      </div>
    </Modal>
  );
};

// Domain Modal Component
const DomainModal = ({ domain, branch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: domain?.name || '',
    description: domain?.description || '',
    isActive: domain?.isActive !== undefined ? domain.isActive : true,
    sortOrder: domain?.sortOrder || 0
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Domain name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Domain name must be at least 2 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Error saving domain:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title={domain ? 'Edit Domain' : 'Add Domain'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="domain-form">
        <div className="form-group">
          <label>Domain Name *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Artificial Intelligence & Machine Learning"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Brief description of the domain"
            rows={3}
          />
        </div>

        <div className="form-group">
          <label>Sort Order</label>
          <input
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
            min="0"
          />
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            Active
          </label>
        </div>

        <div className="form-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : (domain ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </Modal>
  );
};

// Direct Internship Modal (placeholder for now)
const DirectInternshipModal = ({ branch, onClose }) => {
  return (
    <Modal title={`Direct Internships - ${branch.name}`} onClose={onClose} size="large">
      <div className="coming-soon">
        <h3>🚀 Coming Soon!</h3>
        <p>Direct internship management will be available here.</p>
        <p>You'll be able to add internships directly to {branch.name} without requiring domains.</p>
        
        <div className="feature-preview">
          <h4>What you'll be able to do:</h4>
          <ul>
            <li>Add internships directly to the branch</li>
            <li>Set internship title, duration, and description</li>
            <li>Manage learner enrollments</li>
            <li>Track ratings and feedback</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};

  const handleSaveBranch = async (branchData) => {
    try {
      console.log('💾 Saving branch:', branchData);
      
      if (editingBranch) {
        await branchService.updateBranch(editingBranch.id, branchData);
        toast.success('Branch updated successfully');
      } else {
        await branchService.createBranch(branchData);
        toast.success('Branch created successfully');
      }
      
      setShowModal(false);
      setEditingBranch(null);
      fetchBranches();
    } catch (error) {
      console.error('❌ Error saving branch:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to save branch');
      }
    }
  };

  const handleDeleteBranch = async () => {
    try {
      await branchService.deleteBranch(branchToDelete.id);
      toast.success('Branch deleted successfully');
      
      setShowDeleteModal(false);
      setBranchToDelete(null);
      fetchBranches();
    } catch (error) {
      console.error('❌ Error deleting branch:', error);
      
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to delete branch');
      }
    }
  };

  // ✅ SMART BRANCH ACTION HANDLER
  const handleBranchAction = async (branch, action) => {
    const branchState = await getBranchState(branch);
    
    if (action === 'domains') {
      if (!branchState.canAddDomains) {
        toast.warning(
          `Cannot add domains to ${branch.name} because it has direct internships. ` +
          `A branch can either have domains OR direct internships, not both.`
        );
        return;
      }
      setSelectedBranch({ ...branch, state: branchState });
      setShowDomainModal(true);
    } else if (action === 'internships') {
      if (!branchState.canAddDirectInternships) {
        toast.warning(
          `Cannot add direct internships to ${branch.name} because it has domains. ` +
          `Please add internships within the existing domains instead.`
        );
        return;
      }
      setSelectedBranch({ ...branch, state: branchState });
      setShowInternshipModal(true);
    }
  };

  const filteredBranches = Array.isArray(branches) ? branches.filter(branch =>
    branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code?.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading branches...</p>
      </div>
    );
  }

  return (
    <div className="manage-branches">
      <div className="page-header">
        <div className="header-content">
          <h1>Manage Branches</h1>
          <p>Manage academic branches and their associated domains or direct internships</p>
        </div>
        <button 
          className="btn btn-primary"
          onClick={() => {
            setEditingBranch(null);
            setShowModal(true);
          }}
        >
          <FiPlus /> Add Branch
        </button>
      </div>

      <div className="page-controls">
        <div className="search-controls">
          <div className="search-box">
            <FiSearch />
            <input
              type="text"
              placeholder="Search branches..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            <FiGrid />
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            <FiList />
          </button>
        </div>
      </div>

      {/* ✅ BRANCH STATE INFO PANEL */}
      <div className="info-panel">
        <div className="info-card">
          <FiInfo className="info-icon" />
          <div className="info-content">
            <h4>Branch Organization Rules</h4>
            <ul>
              <li><strong>Domain-based:</strong> Create domains first, then add internships within domains</li>
              <li><strong>Direct internships:</strong> Add internships directly to the branch without domains</li>
              <li><strong>Exclusive:</strong> A branch can have either domains OR direct internships, not both</li>
            </ul>
          </div>
        </div>
      </div>

      <div className={`branches-container ${viewMode}`}>
        {filteredBranches.map(branch => (
          <EnhancedBranchCard
            key={branch.id}
            branch={branch}
            viewMode={viewMode}
            onEdit={(branch) => {
              setEditingBranch(branch);
              setShowModal(true);
            }}
            onDelete={(branch) => {
              setBranchToDelete(branch);
              setShowDeleteModal(true);
            }}
            onBranchAction={handleBranchAction}
            getBranchState={getBranchState}
          />
        ))}
      </div>

      {filteredBranches.length === 0 && !loading && (
        <div className="empty-state">
          <FiBookOpen size={48} />
          <h3>No branches found</h3>
          <p>Get started by creating your first branch</p>
          <button 
            className="btn btn-primary"
            onClick={() => {
              setEditingBranch(null);
              setShowModal(true);
            }}
          >
            <FiPlus /> Add Branch
          </button>
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <BranchModal
          branch={editingBranch}
          onClose={() => {
            setShowModal(false);
            setEditingBranch(null);
          }}
          onSave={handleSaveBranch}
        />
      )}

      {showDeleteModal && (
        <ConfirmationModal
          title="Delete Branch"
          message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone.`}
          onConfirm={handleDeleteBranch}
          onCancel={() => {
            setShowDeleteModal(false);
            setBranchToDelete(null);
          }}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      )}

      {showDomainModal && selectedBranch && (
        <DomainManagementModal
          branch={selectedBranch}
          onClose={() => {
            setShowDomainModal(false);
            setSelectedBranch(null);
          }}
        />
      )}

      {showInternshipModal && selectedBranch && (
        <DirectInternshipModal
          branch={selectedBranch}
          onClose={() => {
            setShowInternshipModal(false);
            setSelectedBranch(null);
          }}
        />
      )}
    </div>
  );
};

// ✅ ENHANCED BRANCH CARD WITH STATE LOGIC
const EnhancedBranchCard = ({ branch, viewMode, onEdit, onDelete, onBranchAction, getBranchState }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [branchState, setBranchState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBranchState();
  }, [branch.id]);

  const loadBranchState = async () => {
    try {
      setLoading(true);
      const state = await getBranchState(branch);
      setBranchState(state);
    } catch (error) {
      console.error('Error loading branch state:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`branch-card ${viewMode} loading`}>
        <div className="loading-content">
          <div className="loading-spinner-sm"></div>
          <span>Loading branch data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`branch-card ${viewMode} ${branchState?.mode}`}>
      <div className="branch-header">
        <div className="branch-icon">
          <FiBookOpen />
        </div>
        <div className="branch-info">
          <h3 className="branch-name">{branch.name}</h3>
          <span className="branch-code">{branch.code}</span>
          {branch.description && (
            <p className="branch-description">{branch.description}</p>
          )}
          
          {/* ✅ BRANCH STATE INDICATOR */}
          <div className="branch-state">
            {branchState?.mode === 'domain-based' && (
              <span className="state-badge domain-based">
                <FiGrid /> Domain-based ({branchState.domainCount} domains)
              </span>
            )}
            {branchState?.mode === 'direct' && (
              <span className="state-badge direct">
                <FiUsers /> Direct internships ({branchState.directInternshipCount})
              </span>
            )}
            {branchState?.mode === 'empty' && (
              <span className="state-badge empty">
                <FiInfo /> Ready to configure
              </span>
            )}
          </div>
        </div>
        
        <div className="branch-menu">
          <button onClick={() => setShowMenu(!showMenu)}>
            <FiSettings />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              {/* ✅ SMART MENU OPTIONS BASED ON BRANCH STATE */}
              <button 
                onClick={() => {
                  onBranchAction(branch, 'domains');
                  setShowMenu(false);
                }}
                disabled={!branchState?.canAddDomains}
                className={!branchState?.canAddDomains ? 'disabled' : ''}
                title={!branchState?.canAddDomains ? 'Cannot add domains - branch has direct internships' : ''}
              >
                <FiGrid /> 
                {branchState?.hasDomains ? 'Manage Domains' : 'Add Domains'}
                {!branchState?.canAddDomains && <FiAlertTriangle className="warning-icon" />}
              </button>
              
              <button 
                onClick={() => {
                  onBranchAction(branch, 'internships');
                  setShowMenu(false);
                }}
                disabled={!branchState?.canAddDirectInternships}
                className={!branchState?.canAddDirectInternships ? 'disabled' : ''}
                title={!branchState?.canAddDirectInternships ? 'Cannot add direct internships - branch has domains' : ''}
              >
                <FiUsers /> 
                {branchState?.hasDirectInternships ? 'Manage Internships' : 'Add Direct Internships'}
                {!branchState?.canAddDirectInternships && <FiAlertTriangle className="warning-icon" />}
              </button>
              
              <div className="menu-divider"></div>
              
              <button onClick={() => {
                onEdit(branch);
                setShowMenu(false);
              }}>
                <FiEdit /> Edit Branch
              </button>
              
              <button 
                onClick={() => {
                  onDelete(branch);
                  setShowMenu(false);
                }} 
                className="danger"
              >
                <FiTrash2 /> Delete Branch
              </button>
            </div>
          )}
        </div>
      </div>
      
      <div className="branch-stats">
        <div className="stat">
          <span className="stat-value">{branchState?.domainCount || 0}</span>
          <span className="stat-label">Domains</span>
        </div>
        <div className="stat">
          <span className="stat-value">
            {(branchState?.directInternshipCount || 0) + (branch.internshipCount || 0)}
          </span>
          <span className="stat-label">Internships</span>
        </div>
        <div className="stat">
          <span className="stat-value">{branch.totalLearners || 0}</span>
          <span className="stat-label">Learners</span>
        </div>
        <div className="stat">
          <span className={`status ${branch.isActive ? 'active' : 'inactive'}`}>
            {branch.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="branch-actions">
        <button 
          className={`btn btn-sm ${branchState?.canAddDomains ? 'btn-outline' : 'btn-disabled'}`}
          onClick={() => onBranchAction(branch, 'domains')}
          disabled={!branchState?.canAddDomains}
          title={!branchState?.canAddDomains ? 'Cannot add domains - branch has direct internships' : ''}
        >
          <FiGrid /> Domains
        </button>
        <button 
          className={`btn btn-sm ${branchState?.canAddDirectInternships ? 'btn-outline' : 'btn-disabled'}`}
          onClick={() => onBranchAction(branch, 'internships')}
          disabled={!branchState?.canAddDirectInternships}
          title={!branchState?.canAddDirectInternships ? 'Cannot add direct internships - branch has domains' : ''}
        >
          <FiUsers /> Internships
        </button>
      </div>
    </div>
  );
};

// Keep existing BranchModal, DomainManagementModal, and DirectInternshipModal components...
// (Previous implementations remain the same)

export default ManageBranches;






// // src/components/internships/ManageBranches.js - REAL API INTEGRATION

// import React, { useState, useEffect } from 'react';
// import { 
//   FiPlus, 
//   FiEdit, 
//   FiTrash2, 
//   FiSettings, 
//   FiBookOpen,
//   FiUsers,
//   FiSearch,
//   FiGrid,
//   FiList
// } from 'react-icons/fi';
// import { toast } from 'react-toastify';
// import Modal from '../common/Modal';
// import ConfirmationModal from '../common/ConfirmationModal';
// import { branchService } from '../../services/branchService';
// import './ManageBranches.css';

// const ManageBranches = () => {
//   const [branches, setBranches] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingBranch, setEditingBranch] = useState(null);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [branchToDelete, setBranchToDelete] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [viewMode, setViewMode] = useState('grid');
//   const [selectedBranch, setSelectedBranch] = useState(null);
//   const [showDomainModal, setShowDomainModal] = useState(false);
//   const [showInternshipModal, setShowInternshipModal] = useState(false);

//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   // const fetchBranches = async () => {
//   //   try {
//   //     setLoading(true);
//   //     console.log('🔄 Fetching branches from API...');
      
//   //     const response = await branchService.getAllBranches();
//   //     console.log('✅ API Response:', response);
      
//   //     // Handle different response structures
//   //     const branchesData = response.data?.data || response.data || [];
      
//   //     if (Array.isArray(branchesData)) {
//   //       setBranches(branchesData);
//   //       toast.success(`Loaded ${branchesData.length} branches successfully!`);
//   //     } else {
//   //       console.warn('⚠️ Invalid response format:', response);
//   //       setBranches([]);
//   //       toast.warning('No branches found');
//   //     }
//   //   } catch (error) {
//   //     console.error('❌ Error fetching branches:', error);
      
//   //     if (error.response?.status === 401) {
//   //       toast.error('Authentication required. Please login again.');
//   //     } else if (error.response?.status === 500) {
//   //       toast.error('Server error. Please check if the backend is running.');
//   //     } else {
//   //       toast.error('Failed to fetch branches. Please try again.');
//   //     }
      
//   //     setBranches([]);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };


//   // src/components/internships/ManageBranches.js - FIXED RESPONSE PARSING

// // Replace the fetchBranches function in your ManageBranches.js with this:

// const fetchBranches = async () => {
//   try {
//     setLoading(true);
//     console.log('🔄 Fetching branches from API...');
    
//     const response = await branchService.getAllBranches();
//     console.log('✅ API Response:', response);
    
//     // ✅ FIXED: Correct data extraction from response
//     // Your API returns: { success: true, data: { branches: [...], pagination: {...} } }
//     // So we need to access response.data.data.branches
    
//     let branchesData = [];
    
//     // Handle different possible response structures
//     if (response.data?.data?.branches) {
//       // Standard API response: response.data.data.branches
//       branchesData = response.data.data.branches;
//       console.log('✅ Using response.data.data.branches:', branchesData);
//     } else if (response.data?.branches) {
//       // Alternative structure: response.data.branches
//       branchesData = response.data.branches;
//       console.log('✅ Using response.data.branches:', branchesData);
//     } else if (Array.isArray(response.data?.data)) {
//       // Direct array in data: response.data.data
//       branchesData = response.data.data;
//       console.log('✅ Using response.data.data (array):', branchesData);
//     } else if (Array.isArray(response.data)) {
//       // Direct array: response.data
//       branchesData = response.data;
//       console.log('✅ Using response.data (array):', branchesData);
//     } else {
//       console.warn('⚠️ Unexpected response structure:', response.data);
//       branchesData = [];
//     }
    
//     if (Array.isArray(branchesData) && branchesData.length > 0) {
//       setBranches(branchesData);
//       toast.success(`Loaded ${branchesData.length} branches successfully!`);
//       console.log('✅ Branches set successfully:', branchesData);
//     } else {
//       console.warn('⚠️ No branches found in response');
//       setBranches([]);
//       toast.warning('No branches found');
//     }
//   } catch (error) {
//     console.error('❌ Error fetching branches:', error);
    
//     if (error.response?.status === 401) {
//       toast.error('Authentication required. Please login again.');
//     } else if (error.response?.status === 500) {
//       toast.error('Server error. Please check if the backend is running.');
//     } else {
//       toast.error('Failed to fetch branches. Please try again.');
//     }
    
//     setBranches([]);
//   } finally {
//     setLoading(false);
//   }
// };
//   const handleSaveBranch = async (branchData) => {
//     try {
//       console.log('💾 Saving branch:', branchData);
      
//       if (editingBranch) {
//         await branchService.updateBranch(editingBranch.id, branchData);
//         toast.success('Branch updated successfully');
//       } else {
//         await branchService.createBranch(branchData);
//         toast.success('Branch created successfully');
//       }
      
//       setShowModal(false);
//       setEditingBranch(null);
//       fetchBranches(); // Refresh the list
//     } catch (error) {
//       console.error('❌ Error saving branch:', error);
      
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error('Failed to save branch');
//       }
//     }
//   };

//   const handleDeleteBranch = async () => {
//     try {
//       console.log('🗑️ Deleting branch:', branchToDelete);
      
//       await branchService.deleteBranch(branchToDelete.id);
//       toast.success('Branch deleted successfully');
      
//       setShowDeleteModal(false);
//       setBranchToDelete(null);
//       fetchBranches(); // Refresh the list
//     } catch (error) {
//       console.error('❌ Error deleting branch:', error);
      
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error('Failed to delete branch');
//       }
//     }
//   };

//   // Safe filtering with array check
//   const filteredBranches = Array.isArray(branches) ? branches.filter(branch =>
//     branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     branch.code?.toLowerCase().includes(searchTerm.toLowerCase())
//   ) : [];

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="loading-spinner"></div>
//         <p>Loading branches...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="manage-branches">
//       <div className="page-header">
//         <div className="header-content">
//           <h1>Manage Branches</h1>
//           <p>Manage academic branches and their associated domains</p>
//         </div>
//         <button 
//           className="btn btn-primary"
//           onClick={() => {
//             setEditingBranch(null);
//             setShowModal(true);
//           }}
//         >
//           <FiPlus /> Add Branch
//         </button>
//       </div>

//       <div className="page-controls">
//         <div className="search-controls">
//           <div className="search-box">
//             <FiSearch />
//             <input
//               type="text"
//               placeholder="Search branches..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//           </div>
//         </div>
        
//         <div className="view-controls">
//           <button
//             className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
//             onClick={() => setViewMode('grid')}
//           >
//             <FiGrid />
//           </button>
//           <button
//             className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
//             onClick={() => setViewMode('list')}
//           >
//             <FiList />
//           </button>
//         </div>
//       </div>

//       <div className={`branches-container ${viewMode}`}>
//         {filteredBranches.map(branch => (
//           <BranchCard
//             key={branch.id}
//             branch={branch}
//             viewMode={viewMode}
//             onEdit={(branch) => {
//               setEditingBranch(branch);
//               setShowModal(true);
//             }}
//             onDelete={(branch) => {
//               setBranchToDelete(branch);
//               setShowDeleteModal(true);
//             }}
//             onManageDomains={(branch) => {
//               setSelectedBranch(branch);
//               setShowDomainModal(true);
//             }}
//             onManageInternships={(branch) => {
//               setSelectedBranch(branch);
//               setShowInternshipModal(true);
//             }}
//           />
//         ))}
//       </div>

//       {filteredBranches.length === 0 && !loading && (
//         <div className="empty-state">
//           <FiBookOpen size={48} />
//           <h3>No branches found</h3>
//           <p>Get started by creating your first branch</p>
//           <button 
//             className="btn btn-primary"
//             onClick={() => {
//               setEditingBranch(null);
//               setShowModal(true);
//             }}
//           >
//             <FiPlus /> Add Branch
//           </button>
//         </div>
//       )}

//       {/* Branch Modal */}
//       {showModal && (
//         <BranchModal
//           branch={editingBranch}
//           onClose={() => {
//             setShowModal(false);
//             setEditingBranch(null);
//           }}
//           onSave={handleSaveBranch}
//         />
//       )}

//       {/* Delete Confirmation Modal */}
//       {showDeleteModal && (
//         <ConfirmationModal
//           title="Delete Branch"
//           message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone.`}
//           onConfirm={handleDeleteBranch}
//           onCancel={() => {
//             setShowDeleteModal(false);
//             setBranchToDelete(null);
//           }}
//           confirmText="Delete"
//           cancelText="Cancel"
//           type="danger"
//         />
//       )}

//       {/* ✅ REAL DOMAIN MANAGEMENT MODAL */}
//       {showDomainModal && selectedBranch && (
//         <DomainManagementModal
//           branch={selectedBranch}
//           onClose={() => {
//             setShowDomainModal(false);
//             setSelectedBranch(null);
//           }}
//         />
//       )}

//       {/* Direct Internship Management Modal */}
//       {showInternshipModal && selectedBranch && (
//         <DirectInternshipModal
//           branch={selectedBranch}
//           onClose={() => {
//             setShowInternshipModal(false);
//             setSelectedBranch(null);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// // Branch Card Component (same as before)
// const BranchCard = ({ branch, viewMode, onEdit, onDelete, onManageDomains, onManageInternships }) => {
//   const [showMenu, setShowMenu] = useState(false);

//   return (
//     <div className={`branch-card ${viewMode}`}>
//       <div className="branch-header">
//         <div className="branch-icon">
//           <FiBookOpen />
//         </div>
//         <div className="branch-info">
//           <h3 className="branch-name">{branch.name}</h3>
//           <span className="branch-code">{branch.code}</span>
//           {branch.description && (
//             <p className="branch-description">{branch.description}</p>
//           )}
//         </div>
//         <div className="branch-menu">
//           <button onClick={() => setShowMenu(!showMenu)}>
//             <FiSettings />
//           </button>
//           {showMenu && (
//             <div className="dropdown-menu">
//               <button onClick={() => {
//                 onManageDomains(branch);
//                 setShowMenu(false);
//               }}>
//                 <FiGrid /> Manage Domains
//               </button>
//               <button onClick={() => {
//                 onManageInternships(branch);
//                 setShowMenu(false);
//               }}>
//                 <FiUsers /> Direct Internships
//               </button>
//               <button onClick={() => {
//                 onEdit(branch);
//                 setShowMenu(false);
//               }}>
//                 <FiEdit /> Edit Branch
//               </button>
//               <button 
//                 onClick={() => {
//                   onDelete(branch);
//                   setShowMenu(false);
//                 }} 
//                 className="danger"
//               >
//                 <FiTrash2 /> Delete Branch
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
      
//       <div className="branch-stats">
//         <div className="stat">
//           <span className="stat-value">{branch.domainCount || 0}</span>
//           <span className="stat-label">Domains</span>
//         </div>
//         <div className="stat">
//           <span className="stat-value">{branch.internshipCount || 0}</span>
//           <span className="stat-label">Internships</span>
//         </div>
//         <div className="stat">
//           <span className="stat-value">{branch.totalLearners || 0}</span>
//           <span className="stat-label">Learners</span>
//         </div>
//         <div className="stat">
//           <span className={`status ${branch.isActive ? 'active' : 'inactive'}`}>
//             {branch.isActive ? 'Active' : 'Inactive'}
//           </span>
//         </div>
//       </div>

//       <div className="branch-actions">
//         <button 
//           className="btn btn-sm btn-outline"
//           onClick={() => onManageDomains(branch)}
//         >
//           <FiGrid /> Domains
//         </button>
//         <button 
//           className="btn btn-sm btn-outline"
//           onClick={() => onManageInternships(branch)}
//         >
//           <FiUsers /> Internships
//         </button>
//       </div>
//     </div>
//   );
// };

// // Branch Modal Component (same as before)
// const BranchModal = ({ branch, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: branch?.name || '',
//     code: branch?.code || '',
//     description: branch?.description || '',
//     isActive: branch?.isActive !== undefined ? branch.isActive : true,
//     sortOrder: branch?.sortOrder || 0
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const validate = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Branch name is required';
//     } else if (formData.name.length < 2) {
//       newErrors.name = 'Branch name must be at least 2 characters';
//     }
    
//     if (!formData.code.trim()) {
//       newErrors.code = 'Branch code is required';
//     } else if (formData.code.length < 2) {
//       newErrors.code = 'Branch code must be at least 2 characters';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validate()) return;
    
//     setLoading(true);
//     try {
//       await onSave(formData);
//     } catch (error) {
//       console.error('Error saving branch:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal title={branch ? 'Edit Branch' : 'Add Branch'} onClose={onClose}>
//       <form onSubmit={handleSubmit} className="branch-form">
//         <div className="form-group">
//           <label>Branch Name *</label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             placeholder="e.g., Computer Science & Engineering"
//             className={errors.name ? 'error' : ''}
//           />
//           {errors.name && <span className="error-text">{errors.name}</span>}
//         </div>

//         <div className="form-group">
//           <label>Branch Code *</label>
//           <input
//             type="text"
//             value={formData.code}
//             onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
//             placeholder="e.g., CSE"
//             className={errors.code ? 'error' : ''}
//           />
//           {errors.code && <span className="error-text">{errors.code}</span>}
//         </div>

//         <div className="form-group">
//           <label>Description</label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             placeholder="Brief description of the branch"
//             rows={3}
//           />
//         </div>

//         <div className="form-group">
//           <label>Sort Order</label>
//           <input
//             type="number"
//             value={formData.sortOrder}
//             onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
//             min="0"
//           />
//         </div>

//         <div className="form-group">
//           <label className="checkbox-label">
//             <input
//               type="checkbox"
//               checked={formData.isActive}
//               onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//             />
//             Active
//           </label>
//         </div>

//         <div className="form-actions">
//           <button type="button" className="btn btn-secondary" onClick={onClose}>
//             Cancel
//           </button>
//           <button type="submit" className="btn btn-primary" disabled={loading}>
//             {loading ? 'Saving...' : (branch ? 'Update' : 'Create')}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// // ✅ REAL DOMAIN MANAGEMENT MODAL WITH API INTEGRATION
// const DomainManagementModal = ({ branch, onClose }) => {
//   const [domains, setDomains] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showDomainModal, setShowDomainModal] = useState(false);
//   const [editingDomain, setEditingDomain] = useState(null);

//   useEffect(() => {
//     fetchDomains();
//   }, [branch.id]);

//   const fetchDomains = async () => {
//     try {
//       setLoading(true);
//       console.log('🔄 Fetching domains for branch:', branch.id);
      
//       const response = await branchService.getDomainsByBranch(branch.id);
//       console.log('✅ Domains API Response:', response);
      
//       const domainsData = response.data?.data || response.data || [];
//       setDomains(Array.isArray(domainsData) ? domainsData : []);
      
//     } catch (error) {
//       console.error('❌ Error fetching domains:', error);
      
//       if (error.response?.status === 404) {
//         setDomains([]); // No domains found is okay
//       } else {
//         toast.error('Failed to fetch domains');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveDomain = async (domainData) => {
//     try {
//       const dataWithBranch = { ...domainData, branchId: branch.id };
//       console.log('💾 Saving domain:', dataWithBranch);
      
//       if (editingDomain) {
//         await branchService.updateDomain(editingDomain.id, dataWithBranch);
//         toast.success('Domain updated successfully');
//       } else {
//         await branchService.createDomain(dataWithBranch);
//         toast.success('Domain created successfully');
//       }
      
//       setShowDomainModal(false);
//       setEditingDomain(null);
//       fetchDomains(); // Refresh the list
//     } catch (error) {
//       console.error('❌ Error saving domain:', error);
      
//       if (error.response?.data?.message) {
//         toast.error(error.response.data.message);
//       } else {
//         toast.error('Failed to save domain');
//       }
//     }
//   };

//   const handleDeleteDomain = async (domain) => {
//     if (window.confirm(`Are you sure you want to delete "${domain.name}"?`)) {
//       try {
//         console.log('🗑️ Deleting domain:', domain);
        
//         await branchService.deleteDomain(domain.id);
//         toast.success('Domain deleted successfully');
//         fetchDomains(); // Refresh the list
//       } catch (error) {
//         console.error('❌ Error deleting domain:', error);
        
//         if (error.response?.data?.message) {
//           toast.error(error.response.data.message);
//         } else {
//           toast.error('Failed to delete domain');
//         }
//       }
//     }
//   };

//   return (
//     <Modal 
//       title={`Manage Domains - ${branch.name}`} 
//       onClose={onClose}
//       size="large"
//     >
//       <div className="domain-management">
//         <div className="section-header">
//           <h3>Domains under {branch.name}</h3>
//           <button 
//             className="btn btn-primary"
//             onClick={() => {
//               setEditingDomain(null);
//               setShowDomainModal(true);
//             }}
//           >
//             <FiPlus /> Add Domain
//           </button>
//         </div>

//         {loading ? (
//           <div className="loading-container">
//             <div className="loading-spinner"></div>
//             <p>Loading domains...</p>
//           </div>
//         ) : (
//           <div className="domains-grid">
//             {domains.map(domain => (
//               <div key={domain.id} className="domain-card">
//                 <div className="domain-header">
//                   <h4>{domain.name}</h4>
//                   <div className="domain-actions">
//                     <button 
//                       className="btn btn-sm btn-outline"
//                       onClick={() => {
//                         setEditingDomain(domain);
//                         setShowDomainModal(true);
//                       }}
//                     >
//                       <FiEdit />
//                     </button>
//                     <button 
//                       className="btn btn-sm btn-danger"
//                       onClick={() => handleDeleteDomain(domain)}
//                     >
//                       <FiTrash2 />
//                     </button>
//                   </div>
//                 </div>
                
//                 {domain.description && (
//                   <p className="domain-description">{domain.description}</p>
//                 )}
                
//                 <div className="domain-stats">
//                   <span className="stat">
//                     {domain.internshipCount || 0} Internships
//                   </span>
//                   <span className={`status ${domain.isActive ? 'active' : 'inactive'}`}>
//                     {domain.isActive ? 'Active' : 'Inactive'}
//                   </span>
//                 </div>
//               </div>
//             ))}
            
//             {domains.length === 0 && (
//               <div className="empty-state">
//                 <FiGrid size={32} />
//                 <p>No domains found</p>
//                 <button 
//                   className="btn btn-primary"
//                   onClick={() => {
//                     setEditingDomain(null);
//                     setShowDomainModal(true);
//                   }}
//                 >
//                   <FiPlus /> Add First Domain
//                 </button>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Domain Modal */}
//         {showDomainModal && (
//           <DomainModal
//             domain={editingDomain}
//             branch={branch}
//             onClose={() => {
//               setShowDomainModal(false);
//               setEditingDomain(null);
//             }}
//             onSave={handleSaveDomain}
//           />
//         )}
//       </div>
//     </Modal>
//   );
// };

// // Domain Modal Component
// const DomainModal = ({ domain, branch, onClose, onSave }) => {
//   const [formData, setFormData] = useState({
//     name: domain?.name || '',
//     description: domain?.description || '',
//     isActive: domain?.isActive !== undefined ? domain.isActive : true,
//     sortOrder: domain?.sortOrder || 0
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);

//   const validate = () => {
//     const newErrors = {};
    
//     if (!formData.name.trim()) {
//       newErrors.name = 'Domain name is required';
//     } else if (formData.name.length < 2) {
//       newErrors.name = 'Domain name must be at least 2 characters';
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!validate()) return;
    
//     setLoading(true);
//     try {
//       await onSave(formData);
//     } catch (error) {
//       console.error('Error saving domain:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Modal title={domain ? 'Edit Domain' : 'Add Domain'} onClose={onClose}>
//       <form onSubmit={handleSubmit} className="domain-form">
//         <div className="form-group">
//           <label>Domain Name *</label>
//           <input
//             type="text"
//             value={formData.name}
//             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             placeholder="e.g., Artificial Intelligence & Machine Learning"
//             className={errors.name ? 'error' : ''}
//           />
//           {errors.name && <span className="error-text">{errors.name}</span>}
//         </div>

//         <div className="form-group">
//           <label>Description</label>
//           <textarea
//             value={formData.description}
//             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//             placeholder="Brief description of the domain"
//             rows={3}
//           />
//         </div>

//         <div className="form-group">
//           <label>Sort Order</label>
//           <input
//             type="number"
//             value={formData.sortOrder}
//             onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
//             min="0"
//           />
//         </div>

//         <div className="form-group">
//           <label className="checkbox-label">
//             <input
//               type="checkbox"
//               checked={formData.isActive}
//               onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
//             />
//             Active
//           </label>
//         </div>

//         <div className="form-actions">
//           <button type="button" className="btn btn-secondary" onClick={onClose}>
//             Cancel
//           </button>
//           <button type="submit" className="btn btn-primary" disabled={loading}>
//             {loading ? 'Saving...' : (domain ? 'Update' : 'Create')}
//           </button>
//         </div>
//       </form>
//     </Modal>
//   );
// };

// // Placeholder for Direct Internship Modal
// const DirectInternshipModal = ({ branch, onClose }) => {
//   return (
//     <Modal title={`Direct Internships - ${branch.name}`} onClose={onClose} size="large">
//       <div className="coming-soon">
//         <h3>🚀 Coming Soon!</h3>
//         <p>Direct internship management will be available here.</p>
//         <p>You'll be able to add internships directly to {branch.name} without requiring domains.</p>
//       </div>
//     </Modal>
//   );
// };

// export default ManageBranches;



// // // src/components/internships/ManageBranches.js - FIXED VERSION
// // import React, { useState, useEffect } from 'react';
// // import { 
// //   FiPlus, 
// //   FiEdit, 
// //   FiTrash2, 
// //   FiSettings, 
// //   FiBookOpen,
// //   FiUsers,
// //   FiSearch,
// //   FiGrid,
// //   FiList
// // } from 'react-icons/fi';
// // import { toast } from 'react-toastify';
// // import Modal from '../common/Modal';
// // import ConfirmationModal from '../common/ConfirmationModal';
// // // import { branchService } from '../../services/branchService'; // Commented out for now
// // import './ManageBranches.css';

// // const ManageBranches = () => {
// //   const [branches, setBranches] = useState([]); // ✅ Ensure it's always an array
// //   const [loading, setLoading] = useState(true);
// //   const [showModal, setShowModal] = useState(false);
// //   const [editingBranch, setEditingBranch] = useState(null);
// //   const [showDeleteModal, setShowDeleteModal] = useState(false);
// //   const [branchToDelete, setBranchToDelete] = useState(null);
// //   const [searchTerm, setSearchTerm] = useState('');
// //   const [viewMode, setViewMode] = useState('grid');
// //   const [selectedBranch, setSelectedBranch] = useState(null);
// //   const [showDomainModal, setShowDomainModal] = useState(false);
// //   const [showInternshipModal, setShowInternshipModal] = useState(false);

// //   useEffect(() => {
// //     fetchBranches();
// //   }, []);

// //   const fetchBranches = async () => {
// //     try {
// //       setLoading(true);
      
// //       // ✅ TEMPORARY: Mock data for testing (replace with real API call later)
// //       const mockBranches = [
// //         {
// //           id: 1,
// //           name: 'Computer Science & Engineering',
// //           code: 'CSE',
// //           description: 'Computer Science and Engineering branch focusing on software development and technology.',
// //           isActive: true,
// //           domainCount: 5,
// //           internshipCount: 12,
// //           totalLearners: 150
// //         },
// //         {
// //           id: 2,
// //           name: 'Electronics & Communication Engineering',
// //           code: 'ECE',
// //           description: 'Electronics and Communication Engineering branch.',
// //           isActive: true,
// //           domainCount: 3,
// //           internshipCount: 8,
// //           totalLearners: 95
// //         },
// //         {
// //           id: 3,
// //           name: 'Mechanical Engineering',
// //           code: 'MECH',
// //           description: 'Mechanical Engineering branch.',
// //           isActive: true,
// //           domainCount: 2,
// //           internshipCount: 5,
// //           totalLearners: 60
// //         }
// //       ];

// //       // Simulate API delay
// //       setTimeout(() => {
// //         setBranches(mockBranches);
// //         setLoading(false);
// //         toast.success('Branches loaded successfully!');
// //       }, 1000);

// //       // ✅ FUTURE: Uncomment this when branchService is ready
// //       // const response = await branchService.getAllBranches();
// //       // setBranches(Array.isArray(response.data) ? response.data : []);
      
// //     } catch (error) {
// //       console.error('Error fetching branches:', error);
// //       toast.error('Failed to fetch branches');
// //       setBranches([]); // ✅ Ensure it's always an array on error
// //     } finally {
// //       setTimeout(() => setLoading(false), 1000); // Ensure loading stops
// //     }
// //   };

// //   const handleSaveBranch = async (branchData) => {
// //     try {
// //       if (editingBranch) {
// //         // ✅ TEMPORARY: Mock update
// //         setBranches(prev => prev.map(branch => 
// //           branch.id === editingBranch.id 
// //             ? { ...branch, ...branchData }
// //             : branch
// //         ));
// //         toast.success('Branch updated successfully');
        
// //         // ✅ FUTURE: Uncomment when API is ready
// //         // await branchService.updateBranch(editingBranch.id, branchData);
// //       } else {
// //         // ✅ TEMPORARY: Mock create
// //         const newBranch = {
// //           id: Date.now(), // Temporary ID
// //           ...branchData,
// //           domainCount: 0,
// //           internshipCount: 0,
// //           totalLearners: 0
// //         };
// //         setBranches(prev => [...prev, newBranch]);
// //         toast.success('Branch created successfully');
        
// //         // ✅ FUTURE: Uncomment when API is ready
// //         // await branchService.createBranch(branchData);
// //       }
      
// //       setShowModal(false);
// //       setEditingBranch(null);
// //       // fetchBranches(); // Re-fetch when using real API
// //     } catch (error) {
// //       console.error('Error saving branch:', error);
// //       toast.error('Failed to save branch');
// //     }
// //   };

// //   const handleDeleteBranch = async () => {
// //     try {
// //       // ✅ TEMPORARY: Mock delete
// //       setBranches(prev => prev.filter(branch => branch.id !== branchToDelete.id));
// //       toast.success('Branch deleted successfully');
      
// //       // ✅ FUTURE: Uncomment when API is ready
// //       // await branchService.deleteBranch(branchToDelete.id);
      
// //       setShowDeleteModal(false);
// //       setBranchToDelete(null);
// //       // fetchBranches(); // Re-fetch when using real API
// //     } catch (error) {
// //       console.error('Error deleting branch:', error);
// //       toast.error('Failed to delete branch');
// //     }
// //   };

// //   // ✅ SAFE FILTERING: Ensure branches is always an array
// //   const filteredBranches = Array.isArray(branches) ? branches.filter(branch =>
// //     branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
// //     branch.code.toLowerCase().includes(searchTerm.toLowerCase())
// //   ) : [];

// //   if (loading) {
// //     return (
// //       <div className="loading-container">
// //         <div className="loading-spinner"></div>
// //         <p>Loading branches...</p>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="manage-branches">
// //       <div className="page-header">
// //         <div className="header-content">
// //           <h1>Manage Branches</h1>
// //           <p>Manage academic branches and their associated domains</p>
// //         </div>
// //         <button 
// //           className="btn btn-primary"
// //           onClick={() => {
// //             setEditingBranch(null);
// //             setShowModal(true);
// //           }}
// //         >
// //           <FiPlus /> Add Branch
// //         </button>
// //       </div>

// //       <div className="page-controls">
// //         <div className="search-controls">
// //           <div className="search-box">
// //             <FiSearch />
// //             <input
// //               type="text"
// //               placeholder="Search branches..."
// //               value={searchTerm}
// //               onChange={(e) => setSearchTerm(e.target.value)}
// //             />
// //           </div>
// //         </div>
        
// //         <div className="view-controls">
// //           <button
// //             className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
// //             onClick={() => setViewMode('grid')}
// //           >
// //             <FiGrid />
// //           </button>
// //           <button
// //             className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
// //             onClick={() => setViewMode('list')}
// //           >
// //             <FiList />
// //           </button>
// //         </div>
// //       </div>

// //       <div className={`branches-container ${viewMode}`}>
// //         {filteredBranches.map(branch => (
// //           <BranchCard
// //             key={branch.id}
// //             branch={branch}
// //             viewMode={viewMode}
// //             onEdit={(branch) => {
// //               setEditingBranch(branch);
// //               setShowModal(true);
// //             }}
// //             onDelete={(branch) => {
// //               setBranchToDelete(branch);
// //               setShowDeleteModal(true);
// //             }}
// //             onManageDomains={(branch) => {
// //               setSelectedBranch(branch);
// //               setShowDomainModal(true);
// //             }}
// //             onManageInternships={(branch) => {
// //               setSelectedBranch(branch);
// //               setShowInternshipModal(true);
// //             }}
// //           />
// //         ))}
// //       </div>

// //       {filteredBranches.length === 0 && !loading && (
// //         <div className="empty-state">
// //           <FiBookOpen size={48} />
// //           <h3>No branches found</h3>
// //           <p>Get started by creating your first branch</p>
// //           <button 
// //             className="btn btn-primary"
// //             onClick={() => {
// //               setEditingBranch(null);
// //               setShowModal(true);
// //             }}
// //           >
// //             <FiPlus /> Add Branch
// //           </button>
// //         </div>
// //       )}

// //       {/* Branch Modal */}
// //       {showModal && (
// //         <BranchModal
// //           branch={editingBranch}
// //           onClose={() => {
// //             setShowModal(false);
// //             setEditingBranch(null);
// //           }}
// //           onSave={handleSaveBranch}
// //         />
// //       )}

// //       {/* Delete Confirmation Modal */}
// //       {showDeleteModal && (
// //         <ConfirmationModal
// //           title="Delete Branch"
// //           message={`Are you sure you want to delete "${branchToDelete?.name}"? This action cannot be undone.`}
// //           onConfirm={handleDeleteBranch}
// //           onCancel={() => {
// //             setShowDeleteModal(false);
// //             setBranchToDelete(null);
// //           }}
// //           confirmText="Delete"
// //           cancelText="Cancel"
// //           type="danger"
// //         />
// //       )}

// //       {/* Domain Management Modal */}
// //       {showDomainModal && selectedBranch && (
// //         <DomainManagementModal
// //           branch={selectedBranch}
// //           onClose={() => {
// //             setShowDomainModal(false);
// //             setSelectedBranch(null);
// //           }}
// //         />
// //       )}

// //       {/* Direct Internship Management Modal */}
// //       {showInternshipModal && selectedBranch && (
// //         <DirectInternshipModal
// //           branch={selectedBranch}
// //           onClose={() => {
// //             setShowInternshipModal(false);
// //             setSelectedBranch(null);
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // // Branch Card Component
// // const BranchCard = ({ branch, viewMode, onEdit, onDelete, onManageDomains, onManageInternships }) => {
// //   const [showMenu, setShowMenu] = useState(false);

// //   return (
// //     <div className={`branch-card ${viewMode}`}>
// //       <div className="branch-header">
// //         <div className="branch-icon">
// //           <FiBookOpen />
// //         </div>
// //         <div className="branch-info">
// //           <h3 className="branch-name">{branch.name}</h3>
// //           <span className="branch-code">{branch.code}</span>
// //           {branch.description && (
// //             <p className="branch-description">{branch.description}</p>
// //           )}
// //         </div>
// //         <div className="branch-menu">
// //           <button onClick={() => setShowMenu(!showMenu)}>
// //             <FiSettings />
// //           </button>
// //           {showMenu && (
// //             <div className="dropdown-menu">
// //               <button onClick={() => {
// //                 onManageDomains(branch);
// //                 setShowMenu(false);
// //               }}>
// //                 <FiGrid /> Manage Domains
// //               </button>
// //               <button onClick={() => {
// //                 onManageInternships(branch);
// //                 setShowMenu(false);
// //               }}>
// //                 <FiUsers /> Direct Internships
// //               </button>
// //               <button onClick={() => {
// //                 onEdit(branch);
// //                 setShowMenu(false);
// //               }}>
// //                 <FiEdit /> Edit Branch
// //               </button>
// //               <button 
// //                 onClick={() => {
// //                   onDelete(branch);
// //                   setShowMenu(false);
// //                 }} 
// //                 className="danger"
// //               >
// //                 <FiTrash2 /> Delete Branch
// //               </button>
// //             </div>
// //           )}
// //         </div>
// //       </div>
      
// //       <div className="branch-stats">
// //         <div className="stat">
// //           <span className="stat-value">{branch.domainCount || 0}</span>
// //           <span className="stat-label">Domains</span>
// //         </div>
// //         <div className="stat">
// //           <span className="stat-value">{branch.internshipCount || 0}</span>
// //           <span className="stat-label">Internships</span>
// //         </div>
// //         <div className="stat">
// //           <span className="stat-value">{branch.totalLearners || 0}</span>
// //           <span className="stat-label">Learners</span>
// //         </div>
// //         <div className="stat">
// //           <span className={`status ${branch.isActive ? 'active' : 'inactive'}`}>
// //             {branch.isActive ? 'Active' : 'Inactive'}
// //           </span>
// //         </div>
// //       </div>

// //       <div className="branch-actions">
// //         <button 
// //           className="btn btn-sm btn-outline"
// //           onClick={() => onManageDomains(branch)}
// //         >
// //           <FiGrid /> Domains
// //         </button>
// //         <button 
// //           className="btn btn-sm btn-outline"
// //           onClick={() => onManageInternships(branch)}
// //         >
// //           <FiUsers /> Internships
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // // Branch Modal Component
// // const BranchModal = ({ branch, onClose, onSave }) => {
// //   const [formData, setFormData] = useState({
// //     name: branch?.name || '',
// //     code: branch?.code || '',
// //     description: branch?.description || '',
// //     isActive: branch?.isActive !== undefined ? branch.isActive : true,
// //     sortOrder: branch?.sortOrder || 0
// //   });

// //   const [errors, setErrors] = useState({});
// //   const [loading, setLoading] = useState(false);

// //   const validate = () => {
// //     const newErrors = {};
    
// //     if (!formData.name.trim()) {
// //       newErrors.name = 'Branch name is required';
// //     } else if (formData.name.length < 2) {
// //       newErrors.name = 'Branch name must be at least 2 characters';
// //     }
    
// //     if (!formData.code.trim()) {
// //       newErrors.code = 'Branch code is required';
// //     } else if (formData.code.length < 2) {
// //       newErrors.code = 'Branch code must be at least 2 characters';
// //     }
    
// //     setErrors(newErrors);
// //     return Object.keys(newErrors).length === 0;
// //   };

// //   const handleSubmit = async (e) => {
// //     e.preventDefault();
    
// //     if (!validate()) return;
    
// //     setLoading(true);
// //     try {
// //       await onSave(formData);
// //     } catch (error) {
// //       console.error('Error saving branch:', error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   return (
// //     <Modal title={branch ? 'Edit Branch' : 'Add Branch'} onClose={onClose}>
// //       <form onSubmit={handleSubmit} className="branch-form">
// //         <div className="form-group">
// //           <label>Branch Name *</label>
// //           <input
// //             type="text"
// //             value={formData.name}
// //             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
// //             placeholder="e.g., Computer Science & Engineering"
// //             className={errors.name ? 'error' : ''}
// //           />
// //           {errors.name && <span className="error-text">{errors.name}</span>}
// //         </div>

// //         <div className="form-group">
// //           <label>Branch Code *</label>
// //           <input
// //             type="text"
// //             value={formData.code}
// //             onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
// //             placeholder="e.g., CSE"
// //             className={errors.code ? 'error' : ''}
// //           />
// //           {errors.code && <span className="error-text">{errors.code}</span>}
// //         </div>

// //         <div className="form-group">
// //           <label>Description</label>
// //           <textarea
// //             value={formData.description}
// //             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
// //             placeholder="Brief description of the branch"
// //             rows={3}
// //           />
// //         </div>

// //         <div className="form-group">
// //           <label>Sort Order</label>
// //           <input
// //             type="number"
// //             value={formData.sortOrder}
// //             onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
// //             min="0"
// //           />
// //         </div>

// //         <div className="form-group">
// //           <label className="checkbox-label">
// //             <input
// //               type="checkbox"
// //               checked={formData.isActive}
// //               onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
// //             />
// //             Active
// //           </label>
// //         </div>

// //         <div className="form-actions">
// //           <button type="button" className="btn btn-secondary" onClick={onClose}>
// //             Cancel
// //           </button>
// //           <button type="submit" className="btn btn-primary" disabled={loading}>
// //             {loading ? 'Saving...' : (branch ? 'Update' : 'Create')}
// //           </button>
// //         </div>
// //       </form>
// //     </Modal>
// //   );
// // };

// // // ✅ PLACEHOLDER MODALS (will show "Coming Soon" for now)
// // const DomainManagementModal = ({ branch, onClose }) => {
// //   return (
// //     <Modal title={`Manage Domains - ${branch.name}`} onClose={onClose} size="large">
// //       <div className="coming-soon">
// //         <h3>🚀 Coming Soon!</h3>
// //         <p>Domain management interface will be available here.</p>
// //         <p>You'll be able to add and manage domains for {branch.name}.</p>
// //       </div>
// //     </Modal>
// //   );
// // };

// // const DirectInternshipModal = ({ branch, onClose }) => {
// //   return (
// //     <Modal title={`Direct Internships - ${branch.name}`} onClose={onClose} size="large">
// //       <div className="coming-soon">
// //         <h3>🚀 Coming Soon!</h3>
// //         <p>Direct internship management will be available here.</p>
// //         <p>You'll be able to add internships directly to {branch.name} without requiring domains.</p>
// //       </div>
// //     </Modal>
// //   );
// // };

// // export default ManageBranches;




