import { useState, useRef, useEffect } from 'react';
import { Message, PersonalityMode } from '../types';
import { ChatService } from '../lib/chatService';
import { personalities } from '../lib/personalities';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';
import PersonalitySelector from './PersonalitySelector';
import PulseOrb from './PulseOrb';
import { Send, Lock, Unlock, Trash2 } from 'lucide-react';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [personality, setPersonality] = useState<PersonalityMode>('analyst');
  const [isEncrypted, setIsEncrypted] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionId = useRef(ChatService.generateId());

  const currentColor = personalities[personality].color;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingMessage]);

  useEffect(() => {
    if (!isEncrypted) {
      ChatService.saveToLocalStorage(sessionId.current, messages, personality, isEncrypted);
    }
  }, [messages, personality, isEncrypted]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: ChatService.generateId(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setStreamingMessage('');

    try {
      const response = await ChatService.sendMessage(
        userMessage.content,
        personality,
        (chunk) => setStreamingMessage(chunk)
      );

      const assistantMessage: Message = {
        id: ChatService.generateId(),
        role: 'assistant',
        content: response,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
      setStreamingMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    if (!isEncrypted) {
      ChatService.clearSession(sessionId.current);
    }
    sessionId.current = ChatService.generateId();
  };

  const handlePersonalityChange = (newPersonality: PersonalityMode) => {
    setPersonality(newPersonality);
  };

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white">
      <div className="flex-shrink-0 border-b border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: currentColor }}>
                OBSIDIAN
              </h1>
              <div className="text-xs text-gray-500 font-mono">
                v1.0.0
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEncrypted(!isEncrypted)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                  transition-all duration-300
                  ${isEncrypted ? 'bg-purple-900/30 text-purple-400' : 'bg-gray-800 text-gray-400'}
                `}
                title={isEncrypted ? 'Encrypted Mode: Session will be wiped on refresh' : 'Standard Mode: Session saved'}
              >
                {isEncrypted ? <Lock size={14} /> : <Unlock size={14} />}
                {isEncrypted ? 'ENCRYPTED' : 'STANDARD'}
              </button>

              <button
                onClick={handleClearChat}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium bg-gray-800 text-gray-400 hover:bg-gray-700 transition-colors"
                title="Clear chat history"
              >
                <Trash2 size={14} />
                CLEAR
              </button>
            </div>
          </div>

          <PersonalitySelector
            currentPersonality={personality}
            onSelect={handlePersonalityChange}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px]">
              <PulseOrb isActive={isTyping} color={currentColor} />
              <h2 className="mt-8 text-xl font-light text-gray-400">
                Where silence becomes intelligence
              </h2>
              <p className="mt-2 text-sm text-gray-600 text-center max-w-md">
                {personalities[personality].description}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  accentColor={currentColor}
                />
              ))}

              {isTyping && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8" />
                  {streamingMessage ? (
                    <div
                      className="max-w-[70%] px-4 py-3 rounded-2xl bg-gray-900/50 text-gray-200 animate-fadeIn"
                      style={{
                        borderLeft: `2px solid ${currentColor}`,
                        boxShadow: `0 0 20px ${currentColor}20`
                      }}
                    >
                      <p className="text-sm leading-relaxed">{streamingMessage}</p>
                    </div>
                  ) : (
                    <TypingIndicator />
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 border-t border-gray-800 bg-black/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter the void..."
                className="w-full bg-gray-900 text-gray-100 rounded-xl px-4 py-3 pr-12 resize-none focus:outline-none focus:ring-2 transition-all"
                style={{
                  focusRing: currentColor,
                  boxShadow: input ? `0 0 20px ${currentColor}20` : 'none'
                }}
                rows={1}
                disabled={isTyping}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: input.trim() && !isTyping ? currentColor : '#1a1a1a',
                boxShadow: input.trim() && !isTyping ? `0 0 20px ${currentColor}60` : 'none'
              }}
            >
              <Send size={18} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
