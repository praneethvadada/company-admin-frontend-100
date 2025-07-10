
// ================================================================================================
// 7. UPDATED BRANCH SERVICE - src/services/branchService.js
// ================================================================================================

import api from './api';

export const branchService = {
  // Branch operations
  getAllBranches: () => {
    console.log('🔄 BranchService: Fetching all branches');
    return api.get('/admin/branches');
  },
  
  getBranchById: (id) => {
    console.log('🔄 BranchService: Fetching branch by ID:', id);
    return api.get(`/admin/branches/${id}`);
  },
  
  createBranch: (data) => {
    console.log('🔄 BranchService: Creating branch:', data);
    return api.post('/admin/branches', data);
  },
  
  updateBranch: (id, data) => {
    console.log('🔄 BranchService: Updating branch:', id, data);
    return api.put(`/admin/branches/${id}`, data);
  },
  
  deleteBranch: (id) => {
    console.log('🔄 BranchService: Deleting branch:', id);
    return api.delete(`/admin/branches/${id}`);
  },
  
  getBranchStats: () => {
    console.log('🔄 BranchService: Fetching branch stats');
    return api.get('/admin/branches/stats');
  },

  // Domain operations
  getDomainsByBranch: (branchId) => {
    console.log('🔄 BranchService: Fetching domains for branch:', branchId);
    return api.get(`/admin/branches/${branchId}/internship-domains`);
  },
  
  getAllDomains: () => {
    console.log('🔄 BranchService: Fetching all domains');
    return api.get('/admin/internship-domains');
  },
  
  getDomainById: (id) => {
    console.log('🔄 BranchService: Fetching domain by ID:', id);
    return api.get(`/admin/internship-domains/${id}`);
  },
  
  createDomain: (data) => {
    console.log('🔄 BranchService: Creating domain:', data);
    return api.post('/admin/internship-domains', data);
  },
  
  updateDomain: (id, data) => {
    console.log('🔄 BranchService: Updating domain:', id, data);
    return api.put(`/admin/internship-domains/${id}`, data);
  },
  
  deleteDomain: (id) => {
    console.log('🔄 BranchService: Deleting domain:', id);
    return api.delete(`/admin/internship-domains/${id}`);
  },

  // Internship operations
  getAllInternships: () => {
    console.log('🔄 BranchService: Fetching all internships');
    return api.get('/admin/internships');
  },
  
  getInternshipById: (id) => {
    console.log('🔄 BranchService: Fetching internship by ID:', id);
    return api.get(`/admin/internships/${id}`);
  },
  
  getInternshipsByDomain: (domainId) => {
    console.log('🔄 BranchService: Fetching internships by domain:', domainId);
    return api.get(`/admin/domains/${domainId}/internships`);
  },
  
  getDirectInternships: (branchId) => {
    console.log('🔄 BranchService: Fetching direct internships for branch:', branchId);
    return api.get(`/admin/branches/${branchId}/internships?includeDomainBased=false`);
  },
  
  createInternship: (data) => {
    console.log('🔄 BranchService: Creating internship:', data);
    return api.post('/admin/internships', data);
  },
  
  updateInternship: (id, data) => {
    console.log('🔄 BranchService: Updating internship:', id, data);
    return api.put(`/admin/internships/${id}`, data);
  },
  
  deleteInternship: (id) => {
    console.log('🔄 BranchService: Deleting internship:', id);
    return api.delete(`/admin/internships/${id}`);
  },
  
  getFeaturedInternships: () => {
    console.log('🔄 BranchService: Fetching featured internships');
    return api.get('/admin/internships/featured');
  },
  
  getTopRatedInternships: () => {
    console.log('🔄 BranchService: Fetching top rated internships');
    return api.get('/admin/internships/top-rated');
  },
  
  searchInternships: (params) => {
    console.log('🔄 BranchService: Searching internships:', params);
    return api.get('/admin/internships/search', { params });
  },

  // Lead operations
  getAllLeads: () => {
    console.log('🔄 BranchService: Fetching all leads');
    return api.get('/admin/internship-leads');
  },
  
  getLeadById: (id) => {
    console.log('🔄 BranchService: Fetching lead by ID:', id);
    return api.get(`/admin/internship-leads/${id}`);
  },
  
  updateLead: (id, data) => {
    console.log('🔄 BranchService: Updating lead:', id, data);
    return api.put(`/admin/internship-leads/${id}`, data);
  },
  
  deleteLead: (id) => {
    console.log('🔄 BranchService: Deleting lead:', id);
    return api.delete(`/admin/internship-leads/${id}`);
  },
  
  exportLeads: () => {
    console.log('🔄 BranchService: Exporting leads');
    return api.get('/admin/internship-leads/export/csv');
  },
  
  getLeadStats: () => {
    console.log('🔄 BranchService: Fetching lead stats');
    return api.get('/admin/internship-leads/stats');
  },

  // Rating operations
  getAllRatings: () => {
    console.log('🔄 BranchService: Fetching all ratings');
    return api.get('/admin/ratings');
  },
  
  getRatingById: (id) => {
    console.log('🔄 BranchService: Fetching rating by ID:', id);
    return api.get(`/admin/ratings/${id}`);
  },
  
  updateRating: (id, data) => {
    console.log('🔄 BranchService: Updating rating:', id, data);
    return api.put(`/admin/ratings/${id}`, data);
  },
  
  deleteRating: (id) => {
    console.log('🔄 BranchService: Deleting rating:', id);
    return api.delete(`/admin/ratings/${id}`);
  },
  
  getRatingStats: () => {
    console.log('🔄 BranchService: Fetching rating stats');
    return api.get('/admin/ratings/stats');
  }
};

