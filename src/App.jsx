import { useState } from 'react';
import Homepage from './components/Homepage';
import LiquidEther from './components/LiquidEther';
import About from './components/About';
import Projects from './components/Projects';
import Contact from './components/Contact';
import MetallicText from './components/MetallicText';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('intro');

  const handleEnterPortfolio = () => {
    setCurrentPage('home');
  };

  const handleBackToIntro = () => {
    setCurrentPage('intro');
  };

  const handleGoHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="app-container">
      {currentPage === 'intro' ? (
        <Homepage onEnter={handleEnterPortfolio} />
      ) : (
        <div className="portfolio-container">
          {/* Glass Navbar - Fixed */}
          <nav className="glass-navbar">
            <div className="navbar-content">
              <div className="navbar-brand" onClick={handleGoHome} style={{ cursor: 'pointer' }}>
                Jagadeesh
              </div>
              <div className="navbar-links">
                <a href="#home" className="nav-link" onClick={handleGoHome}>Home</a>
                <a href="#about" className="nav-link" onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })}>About</a>
                <a href="#projects" className="nav-link" onClick={() => document.getElementById('projects').scrollIntoView({ behavior: 'smooth' })}>Projects</a>
                <a href="#contact" className="nav-link" onClick={() => document.getElementById('contact').scrollIntoView({ behavior: 'smooth' })}>Contact</a>
              </div>
            </div>
          </nav>

          {/* Home Section - Liquid Ether */}
          <section id="home" className="liquid-ether-page">
            <div className="liquid-ether-fullscreen">
              <LiquidEther
                colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                mouseForce={40}
                cursorSize={150}
                isViscous={false}
                viscous={30}
                iterationsViscous={32}
                iterationsPoisson={32}
                resolution={1.0}
                isBounce={false}
                autoDemo={true}
                autoSpeed={1.2}
                autoIntensity={4.5}
                takeoverDuration={0.25}
                autoResumeDelay={500}
                autoRampDuration={0.3}
              />
            </div>

            {/* Centered Hero Text */}
            <div className="ether-hero-text">
              <h1>I Build whats exactly in your mind</h1>
            </div>
          </section>

          {/* About Section */}
          <section id="about">
            <About />
          </section>

          {/* Projects Section */}
          <section id="projects">
            <Projects />
          </section>

          {/* Contact Section */}
          <section id="contact">
            <Contact />
          </section>
        </div>
      )}
    </div>
  );
}

export default App;