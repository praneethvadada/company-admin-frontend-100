import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiEye, FiSearch, FiFilter } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './ManageInternships.css';

const ManageInternships = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Placeholder - will be implemented with actual API calls
    setLoading(false);
    toast.info('Manage Internships page loaded - Coming Soon!');
  }, []);

  return (
    <div className="manage-internships">
      <div className="page-header">
        <div className="header-content">
          <h1>Manage Internships</h1>
          <p>Create and manage internship programs</p>
        </div>
        <button className="btn btn-primary">
          <FiPlus /> Add Internship
        </button>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search internships..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-outline">
          <FiFilter /> Filters
        </button>
      </div>

      <div className="content-area">
        <div className="coming-soon">
          <h3>🚀 Coming Soon!</h3>
          <p>Full internship management interface will be available here.</p>
          <p>For now, use "Manage Branches" to create branches and add internships directly.</p>
        </div>
      </div>
    </div>
  );
};

export default ManageInternships;
