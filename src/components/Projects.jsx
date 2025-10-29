import React, { useEffect, useRef, useState } from 'react';
import Orb from './Orb';
import LaptopScene from './LaptopScene';
import SilverOrbScene from './SilverOrbScene';
import './Projects.css';

const Projects = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div className="projects-page" ref={sectionRef}>
      <div className="projects-container">
        <div className={`projects-header ${isVisible ? 'visible' : ''}`}>
          <h2>Projects</h2>
        </div>

        {/* Project 1 - KIJO Orb */}
        <div className={`project-section ${isVisible ? 'visible' : ''}`}>
          <h3 className="project-title">KIJO </h3>
          <p className="project-description">
            An Ai Call Receptionist for daily usage!
          </p>
          <Orb hue={240} hoverIntensity={0.3} rotateOnHover={true} />
        </div>

        {/* Learn More Button */}
        <div className={`learn-more-section ${isVisible ? 'visible' : ''}`}>
          <button
            onClick={() => window.open('https://github.com/jagainc', '_blank')}
            className="learn-more-btn"
          >
            Learn More
          </button>
        </div>

        <div className="projects-grid">
          {/* Project 2 - GitScroll Laptop Scene */}
          <div className={`project-card ${isVisible ? 'visible' : ''}`}>
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://github.com/jagainc/ecom-seller-app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  Seller smart
                </a>
              </h3>
              <p className="project-description">
                a smart billing system for a shop owner
              </p>
              <LaptopScene />
            </div>
          </div>

          {/* Project 3 - Silver Orb Scene */}
          <div className={`project-card ${isVisible ? 'visible' : ''}`}>
            <div className="project-content">
              <h3 className="project-title">
                <a
                  href="https://github.com/jagainc/gitscroll"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="project-link"
                >
                  GitScroll
                </a>
              </h3>
              <p className="project-description">
                Interactive git repository visualization and development tool.
              </p>
              <SilverOrbScene />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Projects;