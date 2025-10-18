import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  accentColor: string;
}

export default function ChatMessage({ message, accentColor }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} ${isUser ? 'animate-slideIn' : 'animate-fadeIn'}`}>
      <div
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border transition-all duration-300 ${
          isUser ? 'bg-gray-800/60 border-gray-700' : 'glass-effect'
        }`}
        style={!isUser ? {
          borderColor: accentColor,
          boxShadow: `0 0 20px ${accentColor}40, inset 0 0 15px ${accentColor}10`
        } : {}}
      >
        {isUser ? (
          <User size={18} className="text-gray-400" />
        ) : (
          <Bot
            size={18}
            style={{
              color: accentColor,
              filter: `drop-shadow(0 0 4px ${accentColor})`
            }}
          />
        )}
      </div>

      <div
        className={`max-w-[70%] px-5 py-4 rounded-2xl transition-all duration-300 ${
          isUser
            ? 'bg-gray-800/60 text-gray-100 border border-gray-700'
            : 'glass-effect text-gray-100'
        }`}
        style={!isUser ? {
          borderLeft: `3px solid ${accentColor}`,
          boxShadow: `0 0 30px ${accentColor}15, inset 0 0 20px ${accentColor}05`
        } : {}}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
