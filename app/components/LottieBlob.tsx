import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import animationData from '../../public/voice-blob-animation.json';

interface LottieBlobProps {
  audioLevel: number; // 0 (silent) to ~1 (loud)
  className?: string;
}

// The blob will always animate, but scale or glow based on audioLevel
const LottieBlob: React.FC<LottieBlobProps> = ({ audioLevel, className }) => {
  const [floatOffset, setFloatOffset] = useState({ x: 0, y: 0 });

  // Add floating animation effect
  useEffect(() => {
    let animationFrame: number;
    let time = 0;

    const animate = () => {
      time += 0.01;
      
      // Create a gentle floating motion using sine waves
      const x = Math.sin(time) * 10;
      const y = Math.cos(time * 0.8) * 8;
      
      setFloatOffset({ x, y });
      animationFrame = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, []);

  // Clamp scale for a subtle effect
  const scale = 1 + Math.min(audioLevel, 1) * 1;
  const boxShadow = audioLevel > 0.05
    ? `0 0 ${16 + audioLevel * 32}px 4px rgba(99,102,241,${0.3 + audioLevel * 0.5})`
    : 'none';

  return (
    <div
      className={className}
      style={{
        transform: `translate(${floatOffset.x}px, ${floatOffset.y}px) scale(${scale})`,
        transition: 'transform 0.15s cubic-bezier(.4,2,.6,1), box-shadow 0.3s ease-in-out',
        boxShadow,
        borderRadius: '50%',
        display: 'inline-block',
        willChange: 'transform',
      }}
    >
      <Lottie
        animationData={animationData}
        loop
        autoplay
        style={{ 
          width: '160px', 
          height: '160px',
          filter: `brightness(${1 + audioLevel * 0.3})`,
          transition: 'filter 0.3s ease-in-out',
        }}
      />
    </div>
  );
};

export default LottieBlob; 