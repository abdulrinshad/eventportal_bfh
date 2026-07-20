import React from 'react';

const Loader = ({ className = '' }) => {
  return (
    <div className={`loader-container ${className}`}>
      <span className="spinner"></span>
    </div>
  );
};

export default Loader;
