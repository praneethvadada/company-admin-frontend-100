// src/components/internships/BranchManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiFolder, 
  FiBookOpen,
  FiUsers,
  FiEye,
  FiEyeOff
} from 'react-icons/fi';
import { internshipService } from '../../services/internshipService';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import './BranchManagement.css';

const BranchManagement = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
    sortOrder: 0
  });
  const [formLoading, setFormLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const response = await internshipService.getBranches();
      setBranches(response.data.branches || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('Failed to fetch branches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedBranch) {
        // Update existing branch
        await internshipService.updateBranch(selectedBranch.id, formData);
        toast.success('Branch updated successfully');
        setShowEditModal(false);
      } else {
        // Create new branch
        await internshipService.createBranch(formData);
        toast.success('Branch created successfully');
        setShowAddModal(false);
      }
      
      resetForm();
      fetchBranches();
    } catch (error) {
      console.error('Error saving branch:', error);
      toast.error(error.response?.data?.message || 'Failed to save branch');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      code: branch.code,
      description: branch.description || '',
      isActive: branch.isActive,
      sortOrder: branch.sortOrder
    });
    setShowEditModal(true);
  };

  const handleDelete = async (branch) => {
    if (window.confirm(`Are you sure you want to delete "${branch.name}"?`)) {
      try {
        await internshipService.deleteBranch(branch.id);
        toast.success('Branch deleted successfully');
        fetchBranches();
      } catch (error) {
        console.error('Error deleting branch:', error);
        toast.error(error.response?.data?.message || 'Failed to delete branch');
      }
    }
  };

  const toggleBranchStatus = async (branch) => {
    try {
      await internshipService.updateBranch(branch.id, {
        isActive: !branch.isActive
      });
      toast.success(`Branch ${!branch.isActive ? 'activated' : 'deactivated'} successfully`);
      fetchBranches();
    } catch (error) {
      console.error('Error toggling branch status:', error);
      toast.error('Failed to update branch status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      isActive: true,
      sortOrder: 0
    });
    setSelectedBranch(null);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    resetForm();
  };

  const navigateToDomains = (branch) => {
    navigate(`/branches/${branch.id}/domains`);
  };

  if (loading) {
    return <LoadingSpinner message="Loading branches..." />;
  }

  return (
    <div className="branch-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Branch Management</h1>
          <p>Manage engineering branches for the internship system</p>
        </div>
        <div className="header-actions">
          <button 
            className="primary-button"
            onClick={() => setShowAddModal(true)}
          >
            <FiPlus />
            Add Branch
          </button>
        </div>
      </div>

      {/* Branches Grid */}
      <div className="branches-grid">
        {branches.map((branch) => (
          <div key={branch.id} className={`branch-card ${!branch.isActive ? 'inactive' : ''}`}>
            <div className="branch-header">
              <div className="branch-info">
                <h3 className="branch-name">{branch.name}</h3>
                <span className="branch-code">{branch.code}</span>
              </div>
              <div className="branch-status">
                <button
                  className={`status-toggle ${branch.isActive ? 'active' : 'inactive'}`}
                  onClick={() => toggleBranchStatus(branch)}
                  title={branch.isActive ? 'Active' : 'Inactive'}
                >
                  {branch.isActive ? <FiEye /> : <FiEyeOff />}
                </button>
              </div>
            </div>

            {branch.description && (
              <p className="branch-description">{branch.description}</p>
            )}

            <div className="branch-stats">
              <div className="stat">
                <FiFolder className="stat-icon" />
                <span>{branch.domainCount || 0} Domains</span>
              </div>
              <div className="stat">
                <FiBookOpen className="stat-icon" />
                <span>{branch.internshipCount || 0} Internships</span>
              </div>
              <div className="stat">
                <FiUsers className="stat-icon" />
                <span>{branch.totalLearners || 0} Learners</span>
              </div>
            </div>

            <div className="branch-actions">
              <button
                className="secondary-button"
                onClick={() => navigateToDomains(branch)}
              >
                <FiFolder />
                Manage Domains
              </button>
              <button
                className="edit-button"
                onClick={() => handleEdit(branch)}
              >
                <FiEdit />
              </button>
              <button
                className="delete-button"
                onClick={() => handleDelete(branch)}
              >
                <FiTrash2 />
              </button>
            </div>
          </div>
        ))}

        {branches.length === 0 && (
          <div className="empty-state">
            <FiFolder className="empty-icon" />
            <h3>No branches found</h3>
            <p>Create your first engineering branch to get started</p>
            <button 
              className="primary-button"
              onClick={() => setShowAddModal(true)}
            >
              <FiPlus />
              Add First Branch
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Branch Modal */}
      {(showAddModal || showEditModal) && (
        <Modal
          title={selectedBranch ? 'Edit Branch' : 'Add New Branch'}
          onClose={handleCloseModal}
        >
          <form onSubmit={handleSubmit} className="branch-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Branch Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Computer Science & Information Technology"
                  required
                />
              </div>

              <div className="form-group">
                <label>Branch Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g., CSE/IT"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="Describe this engineering branch..."
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  Active Branch
                </label>
              </div>

              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
                  min="0"
                />
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" onClick={handleCloseModal} disabled={formLoading}>
                Cancel
              </button>
              <button type="submit" className="primary-button" disabled={formLoading}>
                {formLoading ? 'Saving...' : (selectedBranch ? 'Update Branch' : 'Create Branch')}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default BranchManagement;