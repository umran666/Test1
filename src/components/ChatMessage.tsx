import { Message } from '../types';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  message: Message;
  accentColor: string;
}

export default function ChatMessage({ message, accentColor }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-gray-700' : 'bg-gray-800'
        }`}
        style={!isUser ? { boxShadow: `0 0 15px ${accentColor}40` } : {}}
      >
        {isUser ? (
          <User size={16} className="text-gray-300" />
        ) : (
          <Bot size={16} className="text-gray-300" />
        )}
      </div>

      <div
        className={`max-w-[70%] px-4 py-3 rounded-2xl ${
          isUser
            ? 'bg-gray-700 text-gray-100'
            : 'bg-gray-900/50 text-gray-200'
        }`}
        style={!isUser ? {
          borderLeft: `2px solid ${accentColor}`,
          boxShadow: `0 0 20px ${accentColor}20`
        } : {}}
      >
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
