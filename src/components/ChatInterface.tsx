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
        messages,
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
      const errorMessage: Message = {
        id: ChatService.generateId(),
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, errorMessage]);
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
    setMessages([]);
    setStreamingMessage('');
    if (!isEncrypted) {
      ChatService.clearSession(sessionId.current);
    }
    sessionId.current = ChatService.generateId();
  };

  return (
    <div className="flex flex-col h-screen bg-black text-white bg-grid scanline relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/50 pointer-events-none z-10" />
      <div className="flex-shrink-0 border-b border-gray-900 glass-effect relative z-20">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h1
                className="text-3xl font-black tracking-wider text-shadow-glow transition-all duration-300"
                style={{
                  color: currentColor,
                  fontFamily: 'Orbitron, sans-serif',
                  textShadow: `0 0 20px ${currentColor}, 0 0 40px ${currentColor}80`
                }}
              >
                OBSIDIAN
              </h1>
              <div className="text-xs text-gray-600 font-mono px-2 py-1 rounded bg-black/50 border border-gray-800">
                v1.0.0
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsEncrypted(!isEncrypted)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase
                  transition-all duration-300 border
                  ${isEncrypted
                    ? 'bg-purple-950/50 text-purple-400 border-purple-500/30 hover:bg-purple-900/50 hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                    : 'bg-gray-900/50 text-gray-400 border-gray-700/30 hover:bg-gray-800/50 hover:border-gray-600/30'
                  }
                `}
                title={isEncrypted ? 'Encrypted Mode: Session will be wiped on refresh' : 'Standard Mode: Session saved'}
              >
                {isEncrypted ? <Lock size={16} /> : <Unlock size={16} />}
                {isEncrypted ? 'ENCRYPTED' : 'STANDARD'}
              </button>

              <button
                onClick={handleClearChat}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase bg-gray-900/50 text-gray-400 border border-gray-700/30 hover:bg-red-950/30 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 hover:shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                title="Clear chat history"
              >
                <Trash2 size={16} />
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

      <div className="flex-1 overflow-y-auto relative z-20">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[400px] animate-fadeIn">
              <div className="animate-float">
                <PulseOrb isActive={isTyping} color={currentColor} />
              </div>
              <h2
                className="mt-8 text-2xl font-light text-gray-300 text-shadow-glow transition-all duration-500"
                style={{ textShadow: `0 0 10px ${currentColor}40` }}
              >
                Where silence becomes intelligence
              </h2>
              <p className="mt-4 text-sm text-gray-500 text-center max-w-md font-mono">
                {personalities[personality].description}
              </p>
              <div
                className="mt-8 h-px w-64 transition-all duration-500"
                style={{
                  background: `linear-gradient(90deg, transparent, ${currentColor}40, transparent)`,
                  boxShadow: `0 0 10px ${currentColor}20`
                }}
              />
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
                      className="max-w-[70%] px-5 py-4 rounded-2xl glass-effect text-gray-100 animate-fadeIn"
                      style={{
                        borderLeft: `3px solid ${currentColor}`,
                        boxShadow: `0 0 30px ${currentColor}15, inset 0 0 20px ${currentColor}05`
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

      <div className="flex-shrink-0 border-t border-gray-900 glass-effect relative z-20">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Enter the void..."
                className="w-full bg-black/60 text-gray-100 rounded-xl px-5 py-4 pr-12 resize-none focus:outline-none border transition-all placeholder-gray-600"
                style={{
                  borderColor: input ? currentColor : '#1a1a1a',
                  boxShadow: input ? `0 0 25px ${currentColor}25, inset 0 0 20px ${currentColor}05` : 'none'
                }}
                rows={1}
                disabled={isTyping}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 border"
              style={{
                backgroundColor: input.trim() && !isTyping ? currentColor : '#0a0a0a',
                borderColor: input.trim() && !isTyping ? currentColor : '#1a1a1a',
                boxShadow: input.trim() && !isTyping ? `0 0 30px ${currentColor}70, 0 0 60px ${currentColor}30` : 'none'
              }}
            >
              <Send size={20} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
