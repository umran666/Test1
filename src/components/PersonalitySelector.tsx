import { PersonalityMode } from '../types';
import { personalities } from '../lib/personalities';
import { Brain, Ghost, Sparkles } from 'lucide-react';

interface PersonalitySelectorProps {
  currentPersonality: PersonalityMode;
  onSelect: (personality: PersonalityMode) => void;
}

const icons = {
  brain: Brain,
  ghost: Ghost,
  sparkles: Sparkles
};

export default function PersonalitySelector({ currentPersonality, onSelect }: PersonalitySelectorProps) {
  return (
    <div className="flex gap-3">
      {(Object.keys(personalities) as PersonalityMode[]).map((key) => {
        const personality = personalities[key];
        const Icon = icons[personality.icon as keyof typeof icons];
        const isActive = currentPersonality === key;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`
              relative flex flex-col items-center gap-3 px-6 py-4 rounded-xl
              transition-all duration-300 group border
              hover:scale-105 active:scale-95
              ${isActive ? 'glass-effect' : 'bg-black/40 hover:bg-black/60'}
            `}
            style={isActive ? {
              boxShadow: `0 0 30px ${personality.color}50, 0 0 60px ${personality.color}20, inset 0 0 20px ${personality.color}10`,
              borderColor: personality.color,
              borderWidth: '2px'
            } : {
              borderColor: '#1a1a1a'
            }}
          >
            <Icon
              size={24}
              style={{
                color: isActive ? personality.color : '#555',
                filter: isActive ? `drop-shadow(0 0 8px ${personality.color})` : 'none'
              }}
              className={`transition-all duration-300 ${isActive ? 'animate-pulse-custom' : ''}`}
            />
            <span
              className={`text-xs font-bold uppercase tracking-wider transition-all duration-300 ${isActive ? 'text-shadow-glow' : ''}`}
              style={{
                color: isActive ? personality.color : '#666',
                fontFamily: 'Orbitron, sans-serif'
              }}
            >
              {personality.name}
            </span>
            {isActive && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-16 h-1 rounded-full animate-pulse-custom"
                style={{
                  backgroundColor: personality.color,
                  boxShadow: `0 0 15px ${personality.color}, 0 0 30px ${personality.color}80`
                }}
              />
            )}
            {isActive && (
              <div
                className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
                style={{
                  background: `radial-gradient(circle at center, ${personality.color}20, transparent)`
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
