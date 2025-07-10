import api from './api';

export const branchService = {
  // Branch operations
  getAllBranches: () => api.get('/admin/branches'),
  getBranchById: (id) => api.get(`/admin/branches/${id}`),
  createBranch: (data) => api.post('/admin/branches', data),
  updateBranch: (id, data) => api.put(`/admin/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/admin/branches/${id}`),
  getBranchStats: () => api.get('/admin/branches/stats'),

  // Domain operations
  getDomainsByBranch: (branchId) => api.get(`/admin/branches/${branchId}/internship-domains`),
  getAllDomains: () => api.get('/admin/internship-domains'),
  getDomainById: (id) => api.get(`/admin/internship-domains/${id}`),
  createDomain: (data) => api.post('/admin/internship-domains', data),
  updateDomain: (id, data) => api.put(`/admin/internship-domains/${id}`, data),
  deleteDomain: (id) => api.delete(`/admin/internship-domains/${id}`),

  // Internship operations
  getAllInternships: () => api.get('/admin/internships'),
  getInternshipById: (id) => api.get(`/admin/internships/${id}`),
  getInternshipsByDomain: (domainId) => api.get(`/admin/domains/${domainId}/internships`),
  getDirectInternships: (branchId) => api.get(`/admin/branches/${branchId}/internships?includeDomainBased=false`),
  createInternship: (data) => api.post('/admin/internships', data),
  updateInternship: (id, data) => api.put(`/admin/internships/${id}`, data),
  deleteInternship: (id) => api.delete(`/admin/internships/${id}`),
  getFeaturedInternships: () => api.get('/admin/internships/featured'),
  getTopRatedInternships: () => api.get('/admin/internships/top-rated'),
  searchInternships: (params) => api.get('/admin/internships/search', { params }),

  // Lead operations
  getAllLeads: () => api.get('/admin/internship-leads'),
  getLeadById: (id) => api.get(`/admin/internship-leads/${id}`),
  updateLead: (id, data) => api.put(`/admin/internship-leads/${id}`, data),
  deleteLead: (id) => api.delete(`/admin/internship-leads/${id}`),
  exportLeads: () => api.get('/admin/internship-leads/export/csv'),
  getLeadStats: () => api.get('/admin/internship-leads/stats'),

  // Rating operations
  getAllRatings: () => api.get('/admin/ratings'),
  getRatingById: (id) => api.get(`/admin/ratings/${id}`),
  updateRating: (id, data) => api.put(`/admin/ratings/${id}`, data),
  deleteRating: (id) => api.delete(`/admin/ratings/${id}`),
  getRatingStats: () => api.get('/admin/ratings/stats')
};
