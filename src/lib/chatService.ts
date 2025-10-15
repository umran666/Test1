import { Message, PersonalityMode } from '../types';
import { personalities } from './personalities';

export class ChatService {
  private static async simulateAIResponse(message: string, personality: PersonalityMode): Promise<string> {
    const config = personalities[personality];

    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200));

    const responses: Record<PersonalityMode, string[]> = {
      analyst: [
        `Processing query: "${message}". Analysis suggests multiple optimization vectors.`,
        'Data correlation detected. Running probabilistic assessment...',
        'Query received. Initiating pattern recognition algorithms.',
        'Input analyzed. Cross-referencing with knowledge base...'
      ],
      ghost: [
        'Acknowledged.',
        'Confirmed.',
        'Understood.',
        'Received.',
        'Noted.'
      ],
      oracle: [
        'The answer you seek lies not in what is said, but in what remains unspoken...',
        'I perceive patterns beyond the immediate. Your question touches deeper truths.',
        'The threads of possibility converge here. What you ask reveals more than you know.',
        'In the silence between your words, I find clarity.'
      ]
    };

    const modeResponses = responses[personality];
    return modeResponses[Math.floor(Math.random() * modeResponses.length)];
  }

  static async sendMessage(
    message: string,
    personality: PersonalityMode,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const response = await this.simulateAIResponse(message, personality);

    if (onChunk) {
      for (let i = 0; i < response.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
        onChunk(response.slice(0, i + 1));
      }
    }

    return response;
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
