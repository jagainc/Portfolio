import React, { useState, useEffect } from 'react';
import MetallicText from './MetallicText';
import './Homepage.css';

const Homepage = ({ onEnter }) => {
  const [fontSize, setFontSize] = useState(180);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 480) {
        setFontSize(90);
      } else if (window.innerWidth <= 768) {
        setFontSize(130);
      } else if (window.innerWidth <= 1024) {
        setFontSize(160);
      } else {
        setFontSize(180);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="homepage">
      {/* Overlay */}
      <div className="homepage-overlay" />

      {/* Content */}
      <div className="homepage-content">
        {/* Logo/Brand */}
        <div className="homepage-brand">
          <MetallicText 
            text="Jagadeesh" 
            fontSize={fontSize}
            params={{
              patternScale: 1.8,
              refraction: 0.02,
              edge: 0.8,
              patternBlur: 0.008,
              liquid: 0.05,
              speed: 0.4
            }}
          />
          <p>Developer Portfolio</p>
        </div>

        {/* Glass Enter Button */}
        <button 
          className="glass-play-button visible"
          onClick={onEnter}
        >
          <span>Enter Portfolio</span>
        </button>
      </div>
    </div>
  );
};

export default Homepage;