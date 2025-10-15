import { useEffect, useState } from 'react';

interface PulseOrbProps {
  isActive: boolean;
  color: string;
}

export default function PulseOrb({ isActive, color }: PulseOrbProps) {
  const [pulseIntensity, setPulseIntensity] = useState(0);

  useEffect(() => {
    if (!isActive) {
      setPulseIntensity(0);
      return;
    }

    const interval = setInterval(() => {
      setPulseIntensity(prev => (prev + 0.1) % 1);
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  const opacity = isActive ? 0.3 + pulseIntensity * 0.4 : 0.2;
  const scale = isActive ? 1 + pulseIntensity * 0.2 : 1;

  return (
    <div className="relative w-32 h-32 flex items-center justify-center">
      <div
        className="absolute w-full h-full rounded-full transition-all duration-300"
        style={{
          backgroundColor: color,
          opacity: opacity * 0.3,
          transform: `scale(${scale * 1.5})`,
          filter: 'blur(20px)'
        }}
      />
      <div
        className="absolute w-24 h-24 rounded-full transition-all duration-300"
        style={{
          backgroundColor: color,
          opacity: opacity * 0.5,
          transform: `scale(${scale})`,
          filter: 'blur(10px)'
        }}
      />
      <div
        className="absolute w-16 h-16 rounded-full transition-all duration-200"
        style={{
          backgroundColor: color,
          opacity: opacity + 0.3,
          transform: `scale(${scale})`,
          boxShadow: `0 0 30px ${color}`
        }}
      />
    </div>
  );
}
