// Voice Types for Gemini 2.5 Live API Integration

export interface VoiceConfig {
  voiceName: string;
  languageCode: string;
  sampleRate: number;
}

export interface GeminiLiveConfig {
  apiKey: string;
  model: string;
  systemInstruction?: string;
  voiceConfig?: VoiceConfig;
  generationConfig?: {
    temperature?: number;
    maxOutputTokens?: number;
    responseModalities?: ('AUDIO' | 'TEXT')[];
  };
}

export interface AudioChunk {
  data: ArrayBuffer;
  timestamp: number;
  sampleRate: number;
}

export interface VoiceSessionState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  error?: string;
}

export interface VoiceMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  timestamp: Date;
  duration?: number;
}

export interface GeminiServerMessage {
  serverContent?: {
    modelTurn?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string;
        };
      }>;
    };
    turnComplete?: boolean;
    interrupted?: boolean;
  };
  setupComplete?: boolean;
  toolCall?: {
    functionCalls: Array<{
      id: string;
      name: string;
      args: Record<string, unknown>;
    }>;
  };
}

export interface GeminiClientMessage {
  setup?: {
    model: string;
    generationConfig?: {
      responseModalities?: string[];
      speechConfig?: {
        voiceConfig?: {
          prebuiltVoiceConfig?: {
            voiceName: string;
          };
        };
      };
    };
    systemInstruction?: {
      parts: Array<{ text: string }>;
    };
  };
  realtimeInput?: {
    mediaChunks: Array<{
      mimeType: string;
      data: string;
    }>;
  };
  clientContent?: {
    turns: Array<{
      role: string;
      parts: Array<{ text: string }>;
    }>;
    turnComplete: boolean;
  };
}

export interface VoiceConversationContext {
  advisorId: string;
  advisorName: string;
  systemPrompt: string;
  conversationHistory: VoiceMessage[];
}

// Available Gemini voices
export const GEMINI_VOICES = [
  'Puck',
  'Charon',
  'Kore',
  'Fenrir',
  'Aoede'
] as const;

export type GeminiVoiceName = typeof GEMINI_VOICES[number];
