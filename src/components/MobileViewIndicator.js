import React, { useState, useEffect } from 'react';
import './MobileViewIndicator.css';

/**
 * Mobile View Indicator Component
 * Shows current viewport size and device type
 * Only visible in development mode
 */
const MobileViewIndicator = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [deviceType, setDeviceType] = useState('');

  useEffect(() => {
    const updateDimensions = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setDimensions({ width, height });
      
      // Determine device type
      if (width <= 480) {
        setDeviceType('Mobile (Small)');
      } else if (width <= 768) {
        setDeviceType('Mobile (Large)');
      } else if (width <= 1024) {
        setDeviceType('Tablet');
      } else if (width <= 1199) {
        setDeviceType('Desktop (Small)');
      } else {
        setDeviceType('Desktop (Large)');
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="mobile-view-indicator">
      <div className="indicator-content">
        <div className="indicator-item">
          <span className="indicator-label">Width:</span>
          <span className="indicator-value">{dimensions.width}px</span>
        </div>
        <div className="indicator-item">
          <span className="indicator-label">Height:</span>
          <span className="indicator-value">{dimensions.height}px</span>
        </div>
        <div className="indicator-item">
          <span className="indicator-label">Device:</span>
          <span className="indicator-value device-type">{deviceType}</span>
        </div>
        <div className="indicator-item">
          <span className="indicator-label">Breakpoint:</span>
          <span className="indicator-value breakpoint">
            {dimensions.width <= 480 ? 'Mobile' : 
             dimensions.width <= 768 ? 'Mobile' : 
             dimensions.width <= 1024 ? 'Tablet' : 'Desktop'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MobileViewIndicator;


