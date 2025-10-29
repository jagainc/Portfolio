import React, { useEffect, useRef, useState } from 'react';
import GradientText from './GradientText';
import './About.css';

const About = () => {
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
    <div className="about-page" ref={sectionRef}>
      <div className="about-container">
        {/* Left Side - Image */}
        <div className={`about-image ${isVisible ? 'visible' : ''}`}>
          <img src="/about.jpg" alt="Jagadeesh" className={`profile-image ${isVisible ? 'visible' : ''}`} />
        </div>

        {/* Right Side - Content */}
        <div className={`about-content ${isVisible ? 'visible' : ''}`}>
          <h2>About Me</h2>
          <div className="about-text">
            <GradientText
              colors={['#2020a4ff', '#8a8aff', '#c0c0c0', '#6f3cff', '#3131c9ff']}
              animationSpeed={6}
            >
              I have 2 and half years of experience in prompt engineering — yes, I speak fluent AI, and no, I don't whisper sweet nothings to Ai… usually. I turn ideas into words so powerful that even machines say, 'Whoa, that's clever.This could make me a friend of Ai and this Friend would complete works faster than other manual Developers'
            </GradientText>
          </div>
          <div className="about-text">
            <GradientText
              colors={['#3e3ec3ff', '#3434afff', '#c0c0c0', '#6f3cff', '#2b2bc2ff']}
              animationSpeed={8}
            >
              My development style is clean, modular, and future-proof — I write code so neat that even my future self wants to high-five me. Maintenance? I treat it like gardening: regular check-ups, pruning messy parts, and making sure everything grows smoothly without any bugs taking over the lawn.
            </GradientText>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;