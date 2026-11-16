import React from 'react';

const LoadingSpinner = ({ message = "Loading data..." }) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center py-5">
      <div 
        className="spinner-border text-primary-green mb-3" 
        role="status"
        style={{ width: '2.5rem', height: '2.5rem', borderWidth: '0.25em' }}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      <p className="text-muted-custom small mb-0 fw-medium">{message}</p>
    </div>
  );
};

export default LoadingSpinner;
