// src/components/internships/InternshipManagement.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiAward,
  FiUsers,
  FiStar,
  FiCalendar,
  FiX,
  FiImage,
  FiFileText,
  FiGrid,
  FiList,
  FiClock,
  FiTarget
} from 'react-icons/fi';

const InternshipManagement = () => {
  console.log('🚀 INTERNSHIP MANAGEMENT - Component rendering/mounting');
  
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [branches, setBranches] = useState([]);
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingInternship, setEditingInternship] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    search: '',
    branchId: '',
    domainId: '',
    status: 'all'
  });

  console.log('📊 INTERNSHIP MANAGEMENT - Current state:', {
    internshipsCount: internships.length,
    branchesCount: branches.length,
    domainsCount: domains.length,
    loading,
    showAddModal,
    editingInternship: !!editingInternship
  });

  useEffect(() => {
    console.log('🔄 INTERNSHIP MANAGEMENT - Initial useEffect triggered');
    fetchInitialData();
  }, []);

  useEffect(() => {
    console.log('🔄 INTERNSHIP MANAGEMENT - Filters changed, fetching internships');
    if (branches.length > 0) {
      fetchInternships();
    }
  }, [filters, branches]);

  const fetchInitialData = async () => {
    try {
      console.log('📡 INITIAL DATA - Fetching branches and internships...');
      
      // Fetch branches first
      const branchesResponse = await authService.getBranches();
      const branchData = branchesResponse.data?.branches || branchesResponse.data?.data?.branches || [];
      setBranches(branchData);
      
      // Fetch all domains for filtering
      // const domainsResponse = await authService.getDomains({ limit: 1000 });
const domainsResponse = await authService.getInternshipDomains({ limit: 1000 });

      const domainData = domainsResponse.data?.domains || domainsResponse.data?.data?.domains || [];
      setDomains(domainData);
      
      console.log('✅ INITIAL DATA - Branches and domains loaded');
    } catch (error) {
      console.error('❌ INITIAL DATA - Error:', error);
      toast.error('Failed to load initial data');
    }
  };

  const fetchInternships = async () => {
    try {
      setLoading(true);
      
      const params = {
        ...filters,
        limit: 50
      };
      
      console.log('📡 INTERNSHIP FETCH - Starting with params:', params);
      
      const response = await authService.getInternships(params);
      console.log('✅ INTERNSHIP FETCH - Response:', response.data);
      
      const internshipData = response.data?.internships || response.data?.data?.internships || [];
      setInternships(internshipData);
      
    } catch (error) {
      console.error('❌ INTERNSHIP FETCH - Error:', error);
      toast.error('Failed to fetch internships');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    console.log('🔍 INTERNSHIP SEARCH - Search term:', searchTerm);
    setFilters(prev => ({ ...prev, search: searchTerm }));
  };

  const handleFilterChange = (filterKey, value) => {
    console.log('🎛️ INTERNSHIP FILTER - Changed:', filterKey, '=', value);
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    
    // If branch changes, reset domain filter
    if (filterKey === 'branchId') {
      setFilters(prev => ({ ...prev, domainId: '' }));
    }
  };

  const handleAddInternship = () => {
    console.log('➕ INTERNSHIP ADD - Opening modal');
    setEditingInternship(null);
    setShowAddModal(true);
  };

  const handleEditInternship = (internship) => {
    console.log('✏️ INTERNSHIP EDIT - Editing:', internship.title);
    setEditingInternship(internship);
    setShowAddModal(true);
  };

  const handleDeleteInternship = async (internship) => {
    console.log('🗑️ INTERNSHIP DELETE - Requesting deletion:', internship.title);
    
    if (!window.confirm(`Are you sure you want to delete "${internship.title}"?`)) {
      console.log('❌ INTERNSHIP DELETE - Cancelled by user');
      return;
    }

    try {
      console.log('📡 INTERNSHIP DELETE - API call for:', internship.id);
      await authService.deleteInternship(internship.id);
      console.log('✅ INTERNSHIP DELETE - Success');
      toast.success('Internship deleted successfully');
      fetchInternships();
    } catch (error) {
      console.error('❌ INTERNSHIP DELETE - Error:', error);
      toast.error('Failed to delete internship');
    }
  };

  const handleModalClose = () => {
    console.log('❌ INTERNSHIP MODAL - Closing');
    setShowAddModal(false);
    setEditingInternship(null);
  };

  const handleModalSave = () => {
    console.log('✅ INTERNSHIP MODAL - Saved successfully');
    setShowAddModal(false);
    setEditingInternship(null);
    fetchInternships();
  };

  // Filter domains by selected branch
  const filteredDomains = filters.branchId 
    ? domains.filter(domain => domain.branchId === parseInt(filters.branchId))
    : domains;

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = !filters.search || 
      internship.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
      internship.description?.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesBranch = !filters.branchId || internship.domain?.branchId === parseInt(filters.branchId);
    const matchesDomain = !filters.domainId || internship.domainId === parseInt(filters.domainId);
    
    const matchesStatus = filters.status === 'all' ||
      (filters.status === 'active' && internship.isActive) ||
      (filters.status === 'inactive' && !internship.isActive) ||
      (filters.status === 'upcoming' && new Date(internship.startDate) > new Date()) ||
      (filters.status === 'ongoing' && new Date(internship.startDate) <= new Date() && new Date(internship.endDate) >= new Date()) ||
      (filters.status === 'completed' && new Date(internship.endDate) < new Date());

    return matchesSearch && matchesBranch && matchesDomain && matchesStatus;
  });

  if (loading && internships.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading internships...</p>
      </div>
    );
  }

  console.log('🎨 INTERNSHIP MANAGEMENT - Rendering main component');

  return (
    <div className="internship-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Internship Management</h1>
          <p>Manage all internships across different branches and domains</p>
        </div>
        <div className="header-actions">
          <button className="primary-button" onClick={handleAddInternship}>
            <FiPlus />
            Add Internship
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search internships..."
            value={filters.search}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filters.branchId}
            onChange={(e) => handleFilterChange('branchId', e.target.value)}
          >
            <option value="">All Branches</option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name} ({branch.code})
              </option>
            ))}
          </select>

          <select
            value={filters.domainId}
            onChange={(e) => handleFilterChange('domainId', e.target.value)}
            disabled={!filters.branchId}
          >
            <option value="">All Domains</option>
            {filteredDomains.map(domain => (
              <option key={domain.id} value={domain.id}>
                {domain.title}
              </option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
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

      {/* Internships Grid/List */}
      <div className={`internships-container ${viewMode}`}>
        {filteredInternships.length === 0 ? (
          <div className="empty-state">
            <FiAward size={48} />
            <h3>No internships found</h3>
            <p>Get started by creating your first internship program</p>
            <button className="primary-button" onClick={handleAddInternship}>
              <FiPlus />
              Create Internship
            </button>
          </div>
        ) : (
          filteredInternships.map(internship => (
            <InternshipCard
              key={internship.id}
              internship={internship}
              viewMode={viewMode}
              onEdit={handleEditInternship}
              onDelete={handleDeleteInternship}
            />
          ))
        )}
      </div>

      {/* Add/Edit Internship Modal */}
      {showAddModal && (
        <InternshipModal
          internship={editingInternship}
          branches={branches}
          domains={domains}
          onClose={handleModalClose}
          onSave={handleModalSave}
        />
      )}
    </div>
  );
};

// Internship Card Component
const InternshipCard = ({ internship, viewMode, onEdit, onDelete }) => {
  const getStatusInfo = () => {
    const now = new Date();
    const startDate = new Date(internship.startDate);
    const endDate = new Date(internship.endDate);
    
    if (!internship.isActive) return { status: 'inactive', color: '#ef4444', text: 'Inactive' };
    if (startDate > now) return { status: 'upcoming', color: '#3b82f6', text: 'Upcoming' };
    if (startDate <= now && endDate >= now) return { status: 'ongoing', color: '#10b981', text: 'Ongoing' };
    if (endDate < now) return { status: 'completed', color: '#6b7280', text: 'Completed' };
    
    return { status: 'active', color: '#10b981', text: 'Active' };
  };

  const statusInfo = getStatusInfo();
  const duration = internship.startDate && internship.endDate 
    ? Math.ceil((new Date(internship.endDate) - new Date(internship.startDate)) / (1000 * 60 * 60 * 24 * 7))
    : 0;

  return (
    <div className={`internship-card ${viewMode}`}>
      <div className="internship-header">
        <div className="internship-title-section">
          <h3>{internship.title}</h3>
          <span 
            className="status-badge"
            style={{ backgroundColor: statusInfo.color }}
          >
            {statusInfo.text}
          </span>
        </div>
        <div className="internship-actions">
          <button onClick={() => onEdit(internship)}>
            <FiEdit />
          </button>
          <button onClick={() => onDelete(internship)}>
            <FiTrash2 />
          </button>
        </div>
      </div>
      
      <div className="internship-content">
        <div className="internship-meta">
          <span className="branch-domain-tag">
            {internship.domain?.branch?.name} → {internship.domain?.title}
          </span>
        </div>
        
        <p className="internship-description">
          {internship.description || 'No description available'}
        </p>
        
        <div className="internship-details">
          <div className="detail-item">
            <FiCalendar />
            <span>{new Date(internship.startDate).toLocaleDateString()} - {new Date(internship.endDate).toLocaleDateString()}</span>
          </div>
          <div className="detail-item">
            <FiClock />
            <span>{duration} weeks</span>
          </div>
          <div className="detail-item">
            <FiUsers />
            <span>{internship.totalLearners || 0} learners</span>
          </div>
          <div className="detail-item">
            <FiStar />
            <span>{internship.rating || 0}/5 ({internship.numberOfReviews || 0} reviews)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Internship Modal Component
const InternshipModal = ({ internship, branches, domains, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: internship?.title || '',
    description: internship?.description || '',
    startDate: internship?.startDate || '',
    endDate: internship?.endDate || '',
    learningOutcomes: internship?.learningOutcomes || '',
    topBenefits: internship?.topBenefits || '',
    realTimeProjects: internship?.realTimeProjects || '',
    branchId: internship?.domain?.branchId || '',
    domainId: internship?.domainId || '',
    totalLearners: internship?.totalLearners || 0,
    rating: internship?.rating || 0,
    numberOfReviews: internship?.numberOfReviews || 0,
    isActive: internship?.isActive !== undefined ? internship.isActive : true
  });
  const [loading, setLoading] = useState(false);

  console.log('📝 INTERNSHIP MODAL - Props:', {
    internship: internship?.title,
    branchesCount: branches.length,
    domainsCount: domains.length,
    formData
  });

  // Filter domains by selected branch
  const filteredDomains = formData.branchId 
    ? domains.filter(domain => domain.branchId === parseInt(formData.branchId))
    : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log('💾 MODAL - Submitting form data:', formData);

    try {
      const internshipData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        learningOutcomes: formData.learningOutcomes.trim(),
        topBenefits: formData.topBenefits.trim(),
        realTimeProjects: formData.realTimeProjects.trim(),
        domainId: formData.domainId,
        totalLearners: parseInt(formData.totalLearners) || 0,
        rating: parseFloat(formData.rating) || 0,
        numberOfReviews: parseInt(formData.numberOfReviews) || 0,
        isActive: formData.isActive
      };

      if (internship) {
        console.log('📡 MODAL - Updating internship:', internship.id);
        await authService.updateInternship(internship.id, internshipData);
        console.log('✅ MODAL - Internship updated successfully');
        toast.success('Internship updated successfully');
      } else {
        console.log('📡 MODAL - Creating new internship');
        await authService.createInternship(internshipData);
        console.log('✅ MODAL - Internship created successfully');
        toast.success('Internship created successfully');
      }
      onSave();
    } catch (error) {
      console.error('❌ MODAL - Error saving internship:', error);
      console.error('❌ MODAL - Error details:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to save internship';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal large">
        <div className="modal-header">
          <h2>{internship ? 'Edit Internship' : 'Add New Internship'}</h2>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Internship Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Full Stack Web Development Internship"
                required
                minLength={3}
                maxLength={200}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Branch *</label>
              <select
                value={formData.branchId}
                onChange={(e) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    branchId: e.target.value,
                    domainId: '' // Reset domain when branch changes
                  }));
                }}
                required
              >
                <option value="">Select Branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name} ({branch.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Domain *</label>
              <select
                value={formData.domainId}
                onChange={(e) => setFormData(prev => ({ ...prev, domainId: e.target.value }))}
                disabled={!formData.branchId}
                required
              >
                <option value="">Select Domain</option>
                {filteredDomains.map(domain => (
                  <option key={domain.id} value={domain.id}>
                    {domain.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                min={formData.startDate}
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the internship program..."
              rows={4}
              maxLength={2000}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Learning Outcomes</label>
            <textarea
              value={formData.learningOutcomes}
              onChange={(e) => setFormData(prev => ({ ...prev, learningOutcomes: e.target.value }))}
              placeholder="• Skill 1&#10;• Skill 2&#10;• Skill 3"
              rows={4}
              maxLength={1000}
            />
          </div>
          
          <div className="form-group">
            <label>Top Benefits</label>
            <textarea
              value={formData.topBenefits}
              onChange={(e) => setFormData(prev => ({ ...prev, topBenefits: e.target.value }))}
              placeholder="• Certificate&#10;• Live Projects&#10;• Mentor Support"
              rows={3}
              maxLength={1000}
            />
          </div>
          
          <div className="form-group">
            <label>Real-time Projects</label>
            <textarea
              value={formData.realTimeProjects}
              onChange={(e) => setFormData(prev => ({ ...prev, realTimeProjects: e.target.value }))}
              placeholder="List of real-time projects included..."
              rows={3}
              maxLength={1000}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Total Learners</label>
              <input
                type="number"
                value={formData.totalLearners}
                onChange={(e) => setFormData(prev => ({ ...prev, totalLearners: e.target.value }))}
                min="0"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label>Rating (0-5)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={formData.rating}
                onChange={(e) => setFormData(prev => ({ ...prev, rating: e.target.value }))}
                placeholder="0.0"
              />
            </div>

            <div className="form-group">
              <label>Number of Reviews</label>
              <input
                type="number"
                value={formData.numberOfReviews}
                onChange={(e) => setFormData(prev => ({ ...prev, numberOfReviews: e.target.value }))}
                min="0"
                placeholder="0"
              />
            </div>
          </div>

          <div className="form-group checkbox">
            <label>
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              Active Internship
            </label>
          </div>
          
          <div className="modal-actions">
            <button type="button" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              type="submit" 
              className="primary-button" 
              disabled={loading || !formData.title.trim() || !formData.domainId || !formData.startDate || !formData.endDate}
            >
              {loading ? (internship ? 'Updating...' : 'Creating...') : (internship ? 'Update Internship' : 'Create Internship')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternshipManagement;