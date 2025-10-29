import React, { useState, useRef, useEffect } from 'react';
import MetallicText from './MetallicText';
import './Homepage.css';

const Homepage = ({ onEnter }) => {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayButton, setShowPlayButton] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('loadeddata', () => {
        setIsVideoLoaded(true);
      });

      video.addEventListener('ended', () => {
        // When video ends, navigate to liquid ether page
        if (onEnter) {
          onEnter();
        }
      });

      video.addEventListener('error', (e) => {
        console.error('Video loading error:', e);
        setIsVideoLoaded(true); // Show play button even if video fails
      });

      // Pause the video initially
      video.pause();
    }

    return () => {
      if (video) {
        video.removeEventListener('loadeddata', () => {});
        video.removeEventListener('ended', () => {});
        video.removeEventListener('error', () => {});
      }
    };
  }, [onEnter]);

  const handlePlayClick = () => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0; // Start from beginning
      video.play();
      setIsPlaying(true);
      setShowPlayButton(false);
    }
  };

  return (
    <div className="homepage">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="homepage-video"
        muted
        playsInline
      >
        <source src={`${import.meta.env.BASE_URL}intro.mp4`} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Overlay */}
      <div className={`homepage-overlay ${isPlaying ? 'playing' : ''}`} />

      {/* Content */}
      <div className="homepage-content">
        {/* Logo/Brand */}
        {!isPlaying && (
          <div className="homepage-brand">
            <MetallicText 
              text="Jagadeesh" 
              fontSize={180}
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
        )}

        {/* Glass Play Button */}
        {showPlayButton && (
          <button 
            className={`glass-play-button ${isVideoLoaded ? 'visible' : ''}`}
            onClick={handlePlayClick}
          >
            <div className="play-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path 
                  d="M8 5V19L19 12L8 5Z" 
                  fill="currentColor"
                />
              </svg>
            </div>
            <span>Play Intro</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Homepage;