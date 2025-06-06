
// components/dashboard/StatsCard.js
import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  change, 
  changeType 
}) => {
  return (
    <div className={`stats-card ${color}`}>
      <div className="stats-card-header">
        <div className="stats-info">
          <h3 className="stats-title">{title}</h3>
          <p className="stats-value">{value.toLocaleString()}</p>
        </div>
        <div className="stats-icon">
          <Icon />
        </div>
      </div>
      
      <div className="stats-footer">
        <div className={`stats-change ${changeType}`}>
          {changeType === 'positive' ? <FiTrendingUp /> : <FiTrendingDown />}
          <span>{change}</span>
        </div>
        <span className="stats-period">from last month</span>
      </div>
    </div>
  );
};

export default StatsCard;