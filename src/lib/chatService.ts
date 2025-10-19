import { Message, PersonalityMode } from '../types';
import { personalities } from './personalities';

export class ChatService {
  private static async callDeepSeek(
    message: string,
    conversationHistory: Message[],
    systemPrompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DeepSeek API key not configured.');
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-reasoner',
        messages: messages,
        stream: !!onChunk,
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'DeepSeek API request failed';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    return this.handleStreamResponse(response, onChunk);
  }

  private static async callGemini(
    message: string,
    conversationHistory: Message[],
    systemPrompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('Gemini API key not configured.');
    }

    const contents = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }]
      },
      ...conversationHistory.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      })),
      {
        role: 'user',
        parts: [{ text: message }]
      }
    ];

    const endpoint = onChunk
      ? `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`
      : `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = 'Gemini API request failed';
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.error?.message || errorMessage;
      } catch (e) {
        errorMessage = errorText || errorMessage;
      }
      throw new Error(errorMessage);
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
            try {
              const parsed = JSON.parse(line);
              const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
              if (text) {
                fullResponse += text;
                onChunk(fullResponse);
              }
            } catch (e) {
              console.error('Error parsing Gemini chunk:', e);
            }
          }
        }
      }

      return fullResponse;
    } else {
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
    }
  }

  private static async callLMStudio(
    message: string,
    conversationHistory: Message[],
    systemPrompt: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const baseUrl = import.meta.env.VITE_LM_STUDIO_URL || 'http://127.0.0.1:1234';

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'wizardlm-7b-uncensored',
        messages: messages,
        stream: !!onChunk,
        temperature: 0.2,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`LM Studio API request failed: ${errorText}. Make sure LM Studio is running.`);
    }

    return this.handleStreamResponse(response, onChunk);
  }

  private static async handleStreamResponse(response: Response, onChunk?: (chunk: string) => void): Promise<string> {
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
  }

  static async sendMessage(
    message: string,
    personality: PersonalityMode,
    conversationHistory: Message[] = [],
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const config = personalities[personality];

    try {
      switch (personality) {
        case 'analyst':
          return await this.callGemini(message, conversationHistory, config.systemPrompt, onChunk);
        case 'oracle':
          return await this.callGemini(message, conversationHistory, config.systemPrompt, onChunk);
        case 'ghost':
          return await this.callLMStudio(message, conversationHistory, config.systemPrompt, onChunk);
        default:
          throw new Error('Unknown personality mode');
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
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
