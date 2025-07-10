// src/components/internships/ManageBranches.js - FIXED VERSION
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
  FiList
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import Modal from '../common/Modal';
import ConfirmationModal from '../common/ConfirmationModal';
// import { branchService } from '../../services/branchService'; // Commented out for now
import './ManageBranches.css';

const ManageBranches = () => {
  const [branches, setBranches] = useState([]); // ✅ Ensure it's always an array
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
      
      // ✅ TEMPORARY: Mock data for testing (replace with real API call later)
      const mockBranches = [
        {
          id: 1,
          name: 'Computer Science & Engineering',
          code: 'CSE',
          description: 'Computer Science and Engineering branch focusing on software development and technology.',
          isActive: true,
          domainCount: 5,
          internshipCount: 12,
          totalLearners: 150
        },
        {
          id: 2,
          name: 'Electronics & Communication Engineering',
          code: 'ECE',
          description: 'Electronics and Communication Engineering branch.',
          isActive: true,
          domainCount: 3,
          internshipCount: 8,
          totalLearners: 95
        },
        {
          id: 3,
          name: 'Mechanical Engineering',
          code: 'MECH',
          description: 'Mechanical Engineering branch.',
          isActive: true,
          domainCount: 2,
          internshipCount: 5,
          totalLearners: 60
        }
      ];

      // Simulate API delay
      setTimeout(() => {
        setBranches(mockBranches);
        setLoading(false);
        toast.success('Branches loaded successfully!');
      }, 1000);

      // ✅ FUTURE: Uncomment this when branchService is ready
      // const response = await branchService.getAllBranches();
      // setBranches(Array.isArray(response.data) ? response.data : []);
      
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
      setBranches([]); // ✅ Ensure it's always an array on error
    } finally {
      setTimeout(() => setLoading(false), 1000); // Ensure loading stops
    }
  };

  const handleSaveBranch = async (branchData) => {
    try {
      if (editingBranch) {
        // ✅ TEMPORARY: Mock update
        setBranches(prev => prev.map(branch => 
          branch.id === editingBranch.id 
            ? { ...branch, ...branchData }
            : branch
        ));
        toast.success('Branch updated successfully');
        
        // ✅ FUTURE: Uncomment when API is ready
        // await branchService.updateBranch(editingBranch.id, branchData);
      } else {
        // ✅ TEMPORARY: Mock create
        const newBranch = {
          id: Date.now(), // Temporary ID
          ...branchData,
          domainCount: 0,
          internshipCount: 0,
          totalLearners: 0
        };
        setBranches(prev => [...prev, newBranch]);
        toast.success('Branch created successfully');
        
        // ✅ FUTURE: Uncomment when API is ready
        // await branchService.createBranch(branchData);
      }
      
      setShowModal(false);
      setEditingBranch(null);
      // fetchBranches(); // Re-fetch when using real API
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error('Failed to save branch');
    }
  };

  const handleDeleteBranch = async () => {
    try {
      // ✅ TEMPORARY: Mock delete
      setBranches(prev => prev.filter(branch => branch.id !== branchToDelete.id));
      toast.success('Branch deleted successfully');
      
      // ✅ FUTURE: Uncomment when API is ready
      // await branchService.deleteBranch(branchToDelete.id);
      
      setShowDeleteModal(false);
      setBranchToDelete(null);
      // fetchBranches(); // Re-fetch when using real API
    } catch (error) {
      console.error('Error deleting branch:', error);
      toast.error('Failed to delete branch');
    }
  };

  // ✅ SAFE FILTERING: Ensure branches is always an array
  const filteredBranches = Array.isArray(branches) ? branches.filter(branch =>
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code.toLowerCase().includes(searchTerm.toLowerCase())
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
          <p>Manage academic branches and their associated domains</p>
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

      <div className={`branches-container ${viewMode}`}>
        {filteredBranches.map(branch => (
          <BranchCard
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
            onManageDomains={(branch) => {
              setSelectedBranch(branch);
              setShowDomainModal(true);
            }}
            onManageInternships={(branch) => {
              setSelectedBranch(branch);
              setShowInternshipModal(true);
            }}
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

      {/* Branch Modal */}
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

      {/* Delete Confirmation Modal */}
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

      {/* Domain Management Modal */}
      {showDomainModal && selectedBranch && (
        <DomainManagementModal
          branch={selectedBranch}
          onClose={() => {
            setShowDomainModal(false);
            setSelectedBranch(null);
          }}
        />
      )}

      {/* Direct Internship Management Modal */}
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

// Branch Card Component
const BranchCard = ({ branch, viewMode, onEdit, onDelete, onManageDomains, onManageInternships }) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className={`branch-card ${viewMode}`}>
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
        </div>
        <div className="branch-menu">
          <button onClick={() => setShowMenu(!showMenu)}>
            <FiSettings />
          </button>
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => {
                onManageDomains(branch);
                setShowMenu(false);
              }}>
                <FiGrid /> Manage Domains
              </button>
              <button onClick={() => {
                onManageInternships(branch);
                setShowMenu(false);
              }}>
                <FiUsers /> Direct Internships
              </button>
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
          <span className="stat-value">{branch.domainCount || 0}</span>
          <span className="stat-label">Domains</span>
        </div>
        <div className="stat">
          <span className="stat-value">{branch.internshipCount || 0}</span>
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
          className="btn btn-sm btn-outline"
          onClick={() => onManageDomains(branch)}
        >
          <FiGrid /> Domains
        </button>
        <button 
          className="btn btn-sm btn-outline"
          onClick={() => onManageInternships(branch)}
        >
          <FiUsers /> Internships
        </button>
      </div>
    </div>
  );
};

// Branch Modal Component
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

// ✅ PLACEHOLDER MODALS (will show "Coming Soon" for now)
const DomainManagementModal = ({ branch, onClose }) => {
  return (
    <Modal title={`Manage Domains - ${branch.name}`} onClose={onClose} size="large">
      <div className="coming-soon">
        <h3>🚀 Coming Soon!</h3>
        <p>Domain management interface will be available here.</p>
        <p>You'll be able to add and manage domains for {branch.name}.</p>
      </div>
    </Modal>
  );
};

const DirectInternshipModal = ({ branch, onClose }) => {
  return (
    <Modal title={`Direct Internships - ${branch.name}`} onClose={onClose} size="large">
      <div className="coming-soon">
        <h3>🚀 Coming Soon!</h3>
        <p>Direct internship management will be available here.</p>
        <p>You'll be able to add internships directly to {branch.name} without requiring domains.</p>
      </div>
    </Modal>
  );
};

export default ManageBranches;