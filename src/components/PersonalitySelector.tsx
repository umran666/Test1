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
    <div className="flex gap-2">
      {(Object.keys(personalities) as PersonalityMode[]).map((key) => {
        const personality = personalities[key];
        const Icon = icons[personality.icon as keyof typeof icons];
        const isActive = currentPersonality === key;

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`
              relative flex flex-col items-center gap-2 px-4 py-3 rounded-xl
              transition-all duration-300 group
              ${isActive ? 'bg-gray-800' : 'bg-gray-900 hover:bg-gray-800'}
            `}
            style={isActive ? {
              boxShadow: `0 0 20px ${personality.color}40`,
              borderTop: `2px solid ${personality.color}`
            } : {}}
          >
            <Icon
              size={20}
              style={{ color: isActive ? personality.color : '#888' }}
              className="transition-colors duration-300"
            />
            <span
              className="text-xs font-medium transition-colors duration-300"
              style={{ color: isActive ? personality.color : '#888' }}
            >
              {personality.name}
            </span>
            {isActive && (
              <div
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 rounded-full"
                style={{
                  backgroundColor: personality.color,
                  boxShadow: `0 0 10px ${personality.color}`
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
