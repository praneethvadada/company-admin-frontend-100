// src/components/branches/BranchManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiGitBranch,
  FiUsers,
  FiX,
  FiSave,
  FiBookOpen
} from 'react-icons/fi';

const BranchManagement = () => {
  console.log('🚀 BRANCH MANAGEMENT - Component rendering/mounting');
  
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  console.log('📊 BRANCH MANAGEMENT - Current state:', {
    branchesCount: branches.length,
    loading,
    showAddModal,
    editingBranch: !!editingBranch
  });

  useEffect(() => {
    console.log('🔄 BRANCH MANAGEMENT - Initial useEffect triggered');
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      console.log('📡 BRANCH FETCH - Starting API call');
      
      const response = await authService.getBranches();
      console.log('✅ BRANCH FETCH - Response:', response.data);
      
      const branchData = response.data?.branches || response.data?.data?.branches || [];
      setBranches(branchData);
      
    } catch (error) {
      console.error('❌ BRANCH FETCH - Error:', error);
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBranch = () => {
    console.log('➕ BRANCH ADD - Opening modal');
    setEditingBranch(null);
    setShowAddModal(true);
  };

  const handleEditBranch = (branch) => {
    console.log('✏️ BRANCH EDIT - Editing:', branch.name);
    setEditingBranch(branch);
    setShowAddModal(true);
  };

  const handleDeleteBranch = async (branch) => {
    console.log('🗑️ BRANCH DELETE - Requesting deletion:', branch.name);
    
    if (!window.confirm(`Are you sure you want to delete "${branch.name}"?\nThis will also delete all associated domains and internships.`)) {
      console.log('❌ BRANCH DELETE - Cancelled by user');
      return;
    }

    try {
      console.log('📡 BRANCH DELETE - API call for:', branch.id);
      await authService.deleteBranch(branch.id);
      console.log('✅ BRANCH DELETE - Success');
      toast.success('Branch deleted successfully');
      fetchBranches();
    } catch (error) {
      console.error('❌ BRANCH DELETE - Error:', error);
      toast.error('Failed to delete branch');
    }
  };

  const handleModalClose = () => {
    console.log('❌ BRANCH MODAL - Closing');
    setShowAddModal(false);
    setEditingBranch(null);
  };

  const handleModalSave = () => {
    console.log('✅ BRANCH MODAL - Saved successfully');
    setShowAddModal(false);
    setEditingBranch(null);
    fetchBranches();
  };

  const filteredBranches = branches.filter(branch =>
    branch.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading branches...</p>
      </div>
    );
  }

  console.log('🎨 BRANCH MANAGEMENT - Rendering main component');

  return (
    <div className="branch-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Branch Management</h1>
          <p>Manage educational branches (CSE/IT, ECE, EEE, MECH, etc.)</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" onClick={handleAddBranch}>
            <FiPlus />
            Add Branch
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Branches Grid */}
      <div className="branches-container">
        {filteredBranches.length === 0 ? (
          <div className="empty-state">
            <FiGitBranch size={48} />
            <h3>No branches found</h3>
            <p>Get started by creating your first branch</p>
            <button className="primary-button" onClick={handleAddBranch}>
              <FiPlus />
              Create Branch
            </button>
          </div>
        ) : (
          filteredBranches.map(branch => (
            <div key={branch.id} className="branch-card">
              <div className="branch-header">
                <div className="branch-icon">
                  <FiGitBranch />
                </div>
                <div className="branch-actions">
                  <button onClick={() => handleEditBranch(branch)}>
                    <FiEdit />
                  </button>
                  <button onClick={() => handleDeleteBranch(branch)}>
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              
              <div className="branch-content">
                <h3>{branch.name}</h3>
                <p className="branch-code">Code: {branch.code}</p>
                <p className="branch-description">
                  {branch.description || 'No description available'}
                </p>
                
                <div className="branch-stats">
                  <div className="stat">
                    <FiBookOpen />
                    <span>{branch.domainCount || 0} Domains</span>
                  </div>
                  <div className="stat">
                    <FiUsers />
                    <span>{branch.internshipCount || 0} Internships</span>
                  </div>
                </div>

                <div className="branch-footer">
                  <button 
                    className="secondary-button"
                    onClick={() => navigate(`/domains?branch=${branch.id}`)}
                  >
                    Manage Domains
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Branch Modal */}
      {showAddModal && (
        <BranchModal
          branch={editingBranch}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

// Branch Modal Component
const BranchModal = ({ branch, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: branch?.name || '',
    code: branch?.code || '',
    description: branch?.description || '',
    isActive: branch?.isActive !== undefined ? branch.isActive : true
  });
  const [loading, setLoading] = useState(false);

  console.log('📝 BRANCH MODAL - Props:', {
    branch: branch?.name,
    formData
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('💾 MODAL - Submitting form data:', formData);

    try {
      const branchData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        isActive: formData.isActive
      };

      if (branch) {
        console.log('📡 MODAL - Updating branch:', branch.id);
        await authService.updateBranch(branch.id, branchData);
        console.log('✅ MODAL - Branch updated successfully');
        toast.success('Branch updated successfully');
      } else {
        console.log('📡 MODAL - Creating new branch');
        await authService.createBranch(branchData);
        console.log('✅ MODAL - Branch created successfully');
        toast.success('Branch created successfully');
      }
      onSave();
    } catch (error) {
      console.error('❌ MODAL - Error saving branch:', error);
      console.error('❌ MODAL - Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to save branch';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>{branch ? 'Edit Branch' : 'Add New Branch'}</h2>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Branch Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Computer Science & Engineering"
              required
              minLength={2}
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Branch Code *</label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
              placeholder="e.g., CSE, ECE, EEE"
              required
              minLength={2}
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the branch..."
              rows={3}
              maxLength={500}
            />
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              Active Branch
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading || !formData.name.trim() || !formData.code.trim()}
            >
              {loading ? (branch ? 'Updating...' : 'Creating...') : (branch ? 'Update Branch' : 'Create Branch')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BranchManagement;