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
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div
        className="absolute w-full h-full rounded-full transition-all duration-500"
        style={{
          backgroundColor: color,
          opacity: opacity * 0.2,
          transform: `scale(${scale * 2})`,
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute w-32 h-32 rounded-full transition-all duration-400"
        style={{
          backgroundColor: color,
          opacity: opacity * 0.4,
          transform: `scale(${scale * 1.5})`,
          filter: 'blur(20px)'
        }}
      />
      <div
        className="absolute w-24 h-24 rounded-full transition-all duration-300"
        style={{
          backgroundColor: color,
          opacity: opacity * 0.6,
          transform: `scale(${scale})`,
          filter: 'blur(10px)',
          boxShadow: `0 0 40px ${color}, 0 0 80px ${color}60`
        }}
      />
      <div
        className="absolute w-20 h-20 rounded-full transition-all duration-200 border-2"
        style={{
          backgroundColor: `${color}40`,
          borderColor: color,
          opacity: opacity + 0.4,
          transform: `scale(${scale})`,
          boxShadow: `0 0 30px ${color}, inset 0 0 20px ${color}30`
        }}
      />
    </div>
  );
}
