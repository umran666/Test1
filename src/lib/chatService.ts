import { Message, PersonalityMode } from '../types';
import { personalities } from './personalities';

export class ChatService {
  private static async callOpenAI(
    message: string,
    personality: PersonalityMode,
    conversationHistory: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const config = personalities[personality];

    if (!config.apiKey) {
      throw new Error(`API key not configured for ${config.name} personality`);
    }

    const messages = [
      { role: 'system', content: config.systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: messages,
          stream: !!onChunk,
          temperature: personality === 'analyst' ? 0.3 : personality === 'ghost' ? 0.2 : 0.7,
          max_tokens: personality === 'ghost' ? 150 : 1000
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      if (onChunk) {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let fullResponse = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.trim() !== '');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices[0]?.delta?.content;
                  if (content) {
                    fullResponse += content;
                    onChunk(fullResponse);
                  }
                } catch (e) {
                  console.error('Error parsing chunk:', e);
                }
              }
            }
          }
        }

        return fullResponse;
      } else {
        const data = await response.json();
        return data.choices[0]?.message?.content || 'No response generated';
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  static async sendMessage(
    message: string,
    personality: PersonalityMode,
    conversationHistory: Message[] = [],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    return await this.callOpenAI(message, personality, conversationHistory, onChunk);
  }

  static generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  static saveToLocalStorage(sessionId: string, messages: Message[], personality: PersonalityMode, isEncrypted: boolean) {
    if (isEncrypted) return;

    const session = {
      id: sessionId,
      messages,
      personality,
      isEncrypted,
      lastActive: Date.now()
    };

    localStorage.setItem(`obsidian-session-${sessionId}`, JSON.stringify(session));
  }

  static loadFromLocalStorage(sessionId: string) {
    const data = localStorage.getItem(`obsidian-session-${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  static clearSession(sessionId: string) {
    localStorage.removeItem(`obsidian-session-${sessionId}`);
  }
}
