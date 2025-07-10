import React, { useState, useEffect } from 'react';
import { FiDownload, FiEye, FiSearch, FiMail } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './InternshipLeads.css';

const InternshipLeads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Placeholder - will be implemented with actual API calls
    setLoading(false);
    toast.info('Internship Leads page loaded - Coming Soon!');
  }, []);

  return (
    <div className="internship-leads">
      <div className="page-header">
        <div className="header-content">
          <h1>Internship Enrollments</h1>
          <p>View and manage internship enrollment applications</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <FiDownload /> Export CSV
          </button>
        </div>
      </div>

      <div className="page-controls">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="content-area">
        <div className="coming-soon">
          <h3>📋 Coming Soon!</h3>
          <p>Internship enrollment management will be available here.</p>
          <p>You'll be able to view, export, and manage all internship applications.</p>
        </div>
      </div>
    </div>
  );
};

export default InternshipLeads;