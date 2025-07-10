// src/components/common/ComingSoon.js
import React from 'react';

const ComingSoon = ({ title = "Feature Coming Soon" }) => {
  return (
    <div className="coming-soon-container">
      <div className="coming-soon-content">
        <div className="coming-soon-icon">
          🚧
        </div>
        <h2 className="coming-soon-title">{title}</h2>
        <p className="coming-soon-description">
          This feature is currently under development. Stay tuned for updates!
        </p>
        <div className="coming-soon-animation">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;