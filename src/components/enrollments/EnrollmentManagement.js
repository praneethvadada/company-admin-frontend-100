// src/components/enrollments/EnrollmentManagement.js
import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiSearch,
  FiFilter,
  FiDownload,
  FiUsers,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBookOpen,
  FiEye,
  FiX,
  FiAward,
  FiGitBranch
} from 'react-icons/fi';

const EnrollmentManagement = () => {
  console.log('🚀 ENROLLMENT MANAGEMENT - Component rendering/mounting');
  
  const [enrollments, setEnrollments] = useState([]);
  const [internships, setInternships] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    internshipId: '',
    branchId: '',
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });

  console.log('📊 ENROLLMENT MANAGEMENT - Current state:', {
    enrollmentsCount: enrollments.length,
    internshipsCount: internships.length,
    branchesCount: branches.length,
    loading,
    selectedEnrollment: !!selectedEnrollment
  });

  useEffect(() => {
    console.log('🔄 ENROLLMENT MANAGEMENT - Initial useEffect triggered');
    fetchInitialData();
  }, []);

  useEffect(() => {
    console.log('🔄 ENROLLMENT MANAGEMENT - Filters changed, fetching enrollments');
    fetchEnrollments();
  }, [filters, pagination.currentPage]);

  const fetchInitialData = async () => {
    try {
      console.log('📡 INITIAL DATA - Fetching internships and branches...');
      
      // Fetch internships for filtering
      const internshipsResponse = await authService.getInternships({ limit: 1000 });
      const internshipData = internshipsResponse.data?.internships || internshipsResponse.data?.data?.internships || [];
      setInternships(internshipData);
      
      // Fetch branches for filtering
      const branchesResponse = await authService.getBranches();
      const branchData = branchesResponse.data?.branches || branchesResponse.data?.data?.branches || [];
      setBranches(branchData);
      
      console.log('✅ INITIAL DATA - Internships and branches loaded');
    } catch (error) {
      console.error('❌ INITIAL DATA - Error:', error);
      toast.error('Failed to load initial data');
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      
      const params = {
        page: pagination.currentPage,
        limit: 20,
        ...filters
      };
      
      console.log('📡 ENROLLMENT FETCH - Starting with params:', params);
      
      const response = await authService.getEnrollments(params);
      console.log('✅ ENROLLMENT FETCH - Response:', response.data);
      
      const enrollmentData = response.data?.enrollments || response.data?.data?.enrollments || [];
      const paginationData = response.data?.pagination || response.data?.data?.pagination || pagination;
      
      setEnrollments(enrollmentData);
      setPagination(paginationData);
      
    } catch (error) {
      console.error('❌ ENROLLMENT FETCH - Error:', error);
      toast.error('Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    console.log('🔍 ENROLLMENT SEARCH - Search term:', searchTerm);
    setFilters(prev => ({ ...prev, search: searchTerm }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleFilterChange = (filterKey, value) => {
    console.log('🎛️ ENROLLMENT FILTER - Changed:', filterKey, '=', value);
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  const handleExportCSV = async () => {
    try {
      console.log('📊 EXPORT - Starting CSV export');
      const response = await authService.exportEnrollments(filters);
      
      // Create and download file
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `enrollments_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('✅ EXPORT - CSV downloaded successfully');
      toast.success('Enrollments exported successfully');
    } catch (error) {
      console.error('❌ EXPORT - Error:', error);
      toast.error('Failed to export enrollments');
    }
  };

  const handleViewEnrollment = (enrollment) => {
    console.log('👁️ VIEW ENROLLMENT - Opening details:', enrollment.name);
    setSelectedEnrollment(enrollment);
  };

  const handleCloseDetails = () => {
    console.log('❌ ENROLLMENT DETAILS - Closing');
    setSelectedEnrollment(null);
  };

  // Filter internships by selected branch
  const filteredInternships = filters.branchId 
    ? internships.filter(internship => internship.domain?.branchId === parseInt(filters.branchId))
    : internships;

  if (loading && enrollments.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading enrollments...</p>
      </div>
    );
  }

  console.log('🎨 ENROLLMENT MANAGEMENT - Rendering main component');

  return (
    <div className="enrollment-management">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Enrollment Management</h1>
          <p>View and manage all internship enrollment submissions</p>
        </div>
        <div className="header-actions">
          <button className="secondary-button" onClick={handleExportCSV}>
            <FiDownload />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
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
            value={filters.internshipId}
            onChange={(e) => handleFilterChange('internshipId', e.target.value)}
          >
            <option value="">All Internships</option>
            {filteredInternships.map(internship => (
              <option key={internship.id} value={internship.id}>
                {internship.title}
              </option>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{pagination.totalItems || enrollments.length}</h3>
            <p>Total Enrollments</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiAward />
          </div>
          <div className="stat-content">
            <h3>{internships.length}</h3>
            <p>Active Internships</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiGitBranch />
          </div>
          <div className="stat-content">
            <h3>{branches.length}</h3>
            <p>Branches</p>
          </div>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="enrollments-table-container">
        {enrollments.length === 0 ? (
          <div className="empty-state">
            <FiUsers size={48} />
            <h3>No enrollments found</h3>
            <p>No students have enrolled yet or your filters are too restrictive</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="enrollments-table">
              <thead>
                <tr>
                  <th>Student Details</th>
                  <th>Internship</th>
                  <th>College & Branch</th>
                  <th>Contact</th>
                  <th>Enrolled Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map(enrollment => (
                  <tr key={enrollment.id}>
                    <td>
                      <div className="student-info">
                        <h4>{enrollment.name}</h4>
                        <p>{enrollment.email}</p>
                      </div>
                    </td>
                    <td>
                      <div className="internship-info">
                        <h4>{enrollment.internship?.title}</h4>
                        <p>{enrollment.internship?.domain?.branch?.name} → {enrollment.internship?.domain?.title}</p>
                      </div>
                    </td>
                    <td>
                      <div className="college-info">
                        <h4>{enrollment.college}</h4>
                        <p>{enrollment.branch}</p>
                      </div>
                    </td>
                    <td>
                      <div className="contact-info">
                        <div className="contact-item">
                          <FiPhone size={14} />
                          <span>{enrollment.phone}</span>
                        </div>
                        <div className="contact-item">
                          <FiMapPin size={14} />
                          <span>{enrollment.city}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-info">
                        <FiCalendar size={14} />
                        <span>{new Date(enrollment.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="view-button"
                          onClick={() => handleViewEnrollment(enrollment)}
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Enrollment Details Modal */}
      {selectedEnrollment && (
        <EnrollmentDetailsModal
          enrollment={selectedEnrollment}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
};

// Enrollment Details Modal Component
const EnrollmentDetailsModal = ({ enrollment, onClose }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Enrollment Details</h2>
          <button onClick={onClose}>
            <FiX />
          </button>
        </div>
        
        <div className="enrollment-details">
          <div className="detail-section">
            <h3>Student Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Full Name:</label>
                <span>{enrollment.name}</span>
              </div>
              <div className="detail-item">
                <label>Email:</label>
                <span>{enrollment.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{enrollment.phone}</span>
              </div>
              <div className="detail-item">
                <label>City:</label>
                <span>{enrollment.city}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Academic Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>College:</label>
                <span>{enrollment.college}</span>
              </div>
              <div className="detail-item">
                <label>Branch:</label>
                <span>{enrollment.branch}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Internship Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Internship:</label>
                <span>{enrollment.internship?.title}</span>
              </div>
              <div className="detail-item">
                <label>Domain:</label>
                <span>{enrollment.internship?.domain?.title}</span>
              </div>
              <div className="detail-item">
                <label>Branch Category:</label>
                <span>{enrollment.internship?.domain?.branch?.name}</span>
              </div>
              <div className="detail-item">
                <label>Duration:</label>
                <span>
                  {enrollment.internship?.startDate && enrollment.internship?.endDate && 
                    `${new Date(enrollment.internship.startDate).toLocaleDateString()} - ${new Date(enrollment.internship.endDate).toLocaleDateString()}`
                  }
                </span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <h3>Enrollment Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <label>Enrolled Date:</label>
                <span>{new Date(enrollment.createdAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <label>Status:</label>
                <span className="status-badge active">Enrolled</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} className="primary-button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentManagement;