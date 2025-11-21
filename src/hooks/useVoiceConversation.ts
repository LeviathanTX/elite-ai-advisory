// React Hook for Voice Conversations with Gemini Live API
import { useState, useCallback, useRef, useEffect } from 'react';
import { GeminiLiveClient } from '../services/geminiLiveClient';
import { AudioStreamProcessor } from '../services/audioStreamProcessor';
import type { VoiceSessionState, VoiceMessage, GeminiVoiceName } from '../types/voice';

interface UseVoiceConversationOptions {
  advisorId: string;
  advisorName: string;
  systemPrompt: string;
  voiceName?: GeminiVoiceName;
  onTranscript?: (text: string, isUser: boolean) => void;
}

interface UseVoiceConversationReturn {
  state: VoiceSessionState;
  messages: VoiceMessage[];
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendText: (text: string) => void;
  interrupt: () => void;
  error: string | null;
}

export function useVoiceConversation(options: UseVoiceConversationOptions): UseVoiceConversationReturn {
  const { advisorId, advisorName, systemPrompt, voiceName = 'Puck', onTranscript } = options;

  const [state, setState] = useState<VoiceSessionState>({
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false
  });
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<GeminiLiveClient | null>(null);
  const processorRef = useRef<AudioStreamProcessor | null>(null);
  const currentTextRef = useRef<string>('');

  // Get API key from environment
  const apiKey = process.env.REACT_APP_GEMINI_API_KEY;

  const connect = useCallback(async () => {
    if (!apiKey) {
      setError('Gemini API key not configured');
      return;
    }

    try {
      setError(null);

      // Create client with advisor-specific system prompt
      const fullSystemPrompt = `You are ${advisorName}, an AI business advisor. ${systemPrompt}

Engage in natural conversation. Be concise but insightful. Ask clarifying questions when needed.
Speak naturally as if in a real conversation.`;

      clientRef.current = new GeminiLiveClient({
        apiKey,
        model: 'models/gemini-2.0-flash-exp',
        systemInstruction: fullSystemPrompt,
        voiceConfig: {
          voiceName,
          languageCode: 'en-US',
          sampleRate: 24000
        },
        generationConfig: {
          responseModalities: ['AUDIO', 'TEXT'],
          temperature: 0.7
        }
      });

      // Set up handlers
      clientRef.current.onStateChange((newState) => {
        setState(prev => ({ ...prev, ...newState }));
      });

      clientRef.current.onText((text) => {
        currentTextRef.current += text;
        onTranscript?.(text, false);
      });

      clientRef.current.onMessage((message) => {
        if (message.serverContent?.turnComplete && currentTextRef.current) {
          const newMessage: VoiceMessage = {
            id: crypto.randomUUID(),
            type: 'assistant',
            content: currentTextRef.current,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, newMessage]);
          currentTextRef.current = '';
        }
      });

      await clientRef.current.connect();

      // Initialize audio processor
      processorRef.current = new AudioStreamProcessor();
      await processorRef.current.initialize();

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to connect';
      setError(message);
      console.error('Voice connection error:', err);
    }
  }, [apiKey, advisorName, systemPrompt, voiceName, onTranscript]);

  const disconnect = useCallback(() => {
    processorRef.current?.dispose();
    processorRef.current = null;

    clientRef.current?.disconnect();
    clientRef.current = null;

    setState({
      isConnected: false,
      isListening: false,
      isSpeaking: false,
      isProcessing: false
    });
  }, []);

  const startListening = useCallback(async () => {
    if (!clientRef.current || !processorRef.current) {
      setError('Not connected');
      return;
    }

    try {
      await processorRef.current.startRecording((chunk) => {
        clientRef.current?.sendAudio(chunk);
      });
      setState(prev => ({ ...prev, isListening: true }));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to start listening';
      setError(message);
    }
  }, []);

  const stopListening = useCallback(() => {
    processorRef.current?.stopRecording();
    setState(prev => ({ ...prev, isListening: false }));
  }, []);

  const sendText = useCallback((text: string) => {
    if (!clientRef.current) return;

    const userMessage: VoiceMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    onTranscript?.(text, true);

    clientRef.current.sendText(text);
  }, [onTranscript]);

  const interrupt = useCallback(() => {
    clientRef.current?.interrupt();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    state,
    messages,
    connect,
    disconnect,
    startListening,
    stopListening,
    sendText,
    interrupt,
    error
  };
}
