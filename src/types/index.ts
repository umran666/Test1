export type PersonalityMode = 'analyst' | 'ghost' | 'oracle';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatSession {
  id: string;
  personality: PersonalityMode;
  isEncrypted: boolean;
  messages: Message[];
}

export interface PersonalityConfig {
  name: string;
  icon: string;
  description: string;
  systemPrompt: string;
  color: string;
  apiKey: string;
}
