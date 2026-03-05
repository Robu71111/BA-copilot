import React from 'react';
const LoadingSpinner = ({ message = 'Loading…' }) => (
  <div className="spinner-wrap">
    <div className="spinner" />
    <span>{message}</span>
  </div>
);
export default LoadingSpinner;
