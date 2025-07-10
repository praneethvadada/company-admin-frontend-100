// src/services/internshipService.js
import api from './api';

export const internshipService = {
  // =============================================================================
  // BRANCH MANAGEMENT
  // =============================================================================
  
  // Get all branches
  getBranches: (params = {}) => {
    return api.get('/admin/branches', { params });
  },

  // Get branch by ID
  getBranchById: (id) => {
    return api.get(`/admin/branches/${id}`);
  },

  // Create new branch
  createBranch: (data) => {
    return api.post('/admin/branches', data);
  },

  // Update branch
  updateBranch: (id, data) => {
    return api.put(`/admin/branches/${id}`, data);
  },

  // Delete branch
  deleteBranch: (id) => {
    return api.delete(`/admin/branches/${id}`);
  },

  // Get branch stats
  getBranchStats: () => {
    return api.get('/admin/branches/stats');
  },

  // =============================================================================
  // INTERNSHIP DOMAIN MANAGEMENT
  // =============================================================================
  
  // Get all internship domains
  getInternshipDomains: (params = {}) => {
    return api.get('/admin/internship-domains', { params });
  },

  // Get domains by branch
  getDomainsByBranch: (branchId) => {
    return api.get(`/admin/branches/${branchId}/internship-domains`);
  },

  // Get internship domain by ID
  getInternshipDomainById: (id) => {
    return api.get(`/admin/internship-domains/${id}`);
  },

  // Create new internship domain
  createInternshipDomain: (data) => {
    return api.post('/admin/internship-domains', data);
  },

  // Update internship domain
  updateInternshipDomain: (id, data) => {
    return api.put(`/admin/internship-domains/${id}`, data);
  },

  // Delete internship domain
  deleteInternshipDomain: (id) => {
    return api.delete(`/admin/internship-domains/${id}`);
  },

  // =============================================================================
  // INTERNSHIP MANAGEMENT
  // =============================================================================
  
  // Get all internships
  getInternships: (params = {}) => {
    return api.get('/admin/internships', { params });
  },

  // Get featured internships
  getFeaturedInternships: () => {
    return api.get('/admin/internships/featured');
  },

  // Get top rated internships
  getTopRatedInternships: () => {
    return api.get('/admin/internships/top-rated');
  },

  // Search internships
  searchInternships: (params = {}) => {
    return api.get('/admin/internships/search', { params });
  },

  // Get internship by ID
  getInternshipById: (id) => {
    return api.get(`/admin/internships/${id}`);
  },

  // Get internship stats
  getInternshipStats: (id) => {
    return api.get(`/admin/internships/${id}/stats`);
  },

  // Get internships by domain
  getInternshipsByDomain: (domainId) => {
    return api.get(`/admin/internship-domains/${domainId}/internships`);
  },

  // Create new internship
  createInternship: (data) => {
    return api.post('/admin/internships', data);
  },

  // Update internship
  updateInternship: (id, data) => {
    return api.put(`/admin/internships/${id}`, data);
  },

  // Bulk update internships
  bulkUpdateInternships: (data) => {
    return api.put('/admin/internships/bulk-update', data);
  },

  // Delete internship
  deleteInternship: (id) => {
    return api.delete(`/admin/internships/${id}`);
  },

  // =============================================================================
  // INTERNSHIP LEAD MANAGEMENT
  // =============================================================================
  
  // Get all internship leads
  getInternshipLeads: (params = {}) => {
    return api.get('/admin/internship-leads', { params });
  },

  // Get internship lead stats
  getInternshipLeadStats: () => {
    return api.get('/admin/internship-leads/stats');
  },

  // Export leads to CSV
  exportInternshipLeadsCSV: (params = {}) => {
    return api.get('/admin/internship-leads/export/csv', { 
      params,
      responseType: 'blob' // Important for file download
    });
  },

  // Get internship lead by ID
  getInternshipLeadById: (id) => {
    return api.get(`/admin/internship-leads/${id}`);
  },

  // Get leads by internship
  getLeadsByInternship: (internshipId) => {
    return api.get(`/admin/internships/${internshipId}/leads`);
  },

  // Update internship lead
  updateInternshipLead: (id, data) => {
    return api.put(`/admin/internship-leads/${id}`, data);
  },

  // Bulk update internship leads
  bulkUpdateInternshipLeads: (data) => {
    return api.put('/admin/internship-leads/bulk-update', data);
  },

  // Delete internship lead
  deleteInternshipLead: (id) => {
    return api.delete(`/admin/internship-leads/${id}`);
  },

  // =============================================================================
  // RATING MANAGEMENT
  // =============================================================================
  
  // Get all ratings
  getRatings: (params = {}) => {
    return api.get('/admin/ratings', { params });
  },

  // Get rating stats
  getRatingStats: () => {
    return api.get('/admin/ratings/stats');
  },

  // Get featured ratings
  getFeaturedRatings: () => {
    return api.get('/admin/ratings/featured');
  },

  // Get rating by ID
  getRatingById: (id) => {
    return api.get(`/admin/ratings/${id}`);
  },

  // Get ratings by internship
  getRatingsByInternship: (internshipId) => {
    return api.get(`/admin/internships/${internshipId}/ratings`);
  },

  // Update rating
  updateRating: (id, data) => {
    return api.put(`/admin/ratings/${id}`, data);
  },

  // Approve rating
  approveRating: (id, isApproved) => {
    return api.put(`/admin/ratings/${id}/approve`, { isApproved });
  },

  // Bulk approve ratings
  bulkApproveRatings: (data) => {
    return api.put('/admin/ratings/bulk-approve', data);
  },

  // Delete rating
  deleteRating: (id) => {
    return api.delete(`/admin/ratings/${id}`);
  },

  // =============================================================================
  // IMAGE MANAGEMENT (for internships)
  // =============================================================================
  
  // Upload images for internship entities
  uploadInternshipImages: (formData) => {
    return api.post('/admin/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get images by entity
  getImagesByEntity: (entityType, entityId) => {
    return api.get(`/admin/images/entity/${entityType}/${entityId}`);
  },

  // Update image
  updateImage: (id, data) => {
    return api.put(`/admin/images/${id}`, data);
  },

  // Delete image
  deleteImage: (id) => {
    return api.delete(`/admin/images/${id}`);
  },

  // Reorder images
  reorderImages: (data) => {
    return api.put('/admin/images/reorder', data);
  },

  // =============================================================================
  // DASHBOARD STATS (internship-related)
  // =============================================================================
  
  // Get internship dashboard stats
  getInternshipDashboardStats: () => {
    return api.get('/admin/dashboard/internship-stats');
  }
};

export default internshipService;