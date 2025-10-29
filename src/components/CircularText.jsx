import { useEffect, useState } from 'react';
import './CircularText.css';

const CircularText = ({ 
  text, 
  spinDuration = 20, 
  onHover = 'speedUp', 
  className = '' 
}) => {
  const [rotation, setRotation] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const letters = Array.from(text);

  useEffect(() => {
    const speed = isHovered && onHover === 'speedUp' ? spinDuration / 4 : spinDuration;
    const interval = setInterval(() => {
      setRotation(prev => (prev + 1) % 360);
    }, speed * 1000 / 360);

    return () => clearInterval(interval);
  }, [spinDuration, isHovered, onHover]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      className={`circular-text ${className}`}
      style={{ transform: `rotate(${rotation}deg)` }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {letters.map((letter, i) => {
        const rotationDeg = (360 / letters.length) * i;
        const radius = 80;
        const angle = (rotationDeg * Math.PI) / 180;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const transform = `translate(${x}px, ${y}px) rotate(${rotationDeg + 90}deg)`;

        return (
          <span
            key={i}
            style={{
              transform,
              WebkitTransform: transform
            }}
          >
            {letter}
          </span>
        );
      })}
    </div>
  );
};

export default CircularText;