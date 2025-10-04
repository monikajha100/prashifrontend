import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ size = 'medium', text = 'Loading...' }) => {
  const sizeClasses = {
    small: 'w-6 h-6',
    medium: 'w-10 h-10',
    large: 'w-16 h-16'
  };

  return (
    <div className="flex-center flex-column" style={{ padding: '40px 20px' }}>
      <div className={`spinner ${sizeClasses[size]}`}></div>
      {text && <p className="text-light mt-2">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
