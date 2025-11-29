/**
 * useGeminiVoice Hook
 *
 * React hook for managing voice conversations with Gemini Live API.
 * Provides state management and easy-to-use methods for voice interactions.
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import {
  GeminiVoiceService,
  VoiceConversationState,
  createAdvisorVoiceService,
} from '../services/geminiVoiceService';

interface UseGeminiVoiceOptions {
  apiKey?: string;
  advisorId?: string;
  systemPrompt?: string;
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onError?: (error: Error) => void;
}

interface UseGeminiVoiceReturn {
  // State
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  transcript: string;
  response: string;

  // Actions
  connect: () => Promise<void>;
  disconnect: () => void;
  startListening: () => Promise<void>;
  stopListening: () => void;
  sendMessage: (text: string) => void;
  toggleListening: () => Promise<void>;

  // Permission
  hasMicrophonePermission: boolean | null;
  requestMicrophonePermission: () => Promise<boolean>;
}

export function useGeminiVoice(options: UseGeminiVoiceOptions = {}): UseGeminiVoiceReturn {
  const {
    apiKey = process.env.REACT_APP_GEMINI_API_KEY,
    advisorId,
    systemPrompt = 'You are a helpful Shark Tank investor providing business advice.',
    onTranscript,
    onResponse,
    onError,
  } = options;

  // State
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [hasMicrophonePermission, setHasMicrophonePermission] = useState<boolean | null>(null);

  // Ref to voice service instance
  const serviceRef = useRef<GeminiVoiceService | null>(null);

  // Check microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  /**
   * Check if microphone permission is granted
   */
  const checkMicrophonePermission = useCallback(async () => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setHasMicrophonePermission(result.state === 'granted');

      result.onchange = () => {
        setHasMicrophonePermission(result.state === 'granted');
      };
    } catch {
      // Permissions API not supported, will check on first use
      setHasMicrophonePermission(null);
    }
  }, []);

  /**
   * Request microphone permission
   */
  const requestMicrophonePermission = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setHasMicrophonePermission(true);
      return true;
    } catch (err) {
      setHasMicrophonePermission(false);
      setError('Microphone permission denied');
      return false;
    }
  }, []);

  /**
   * Connect to Gemini Live API
   */
  const connect = useCallback(async () => {
    if (!apiKey) {
      const errorMsg = 'Gemini API key not configured';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
      return;
    }

    try {
      setError(null);

      // Create voice service
      if (advisorId) {
        serviceRef.current = createAdvisorVoiceService(apiKey, advisorId, systemPrompt);
      } else {
        serviceRef.current = new GeminiVoiceService({
          apiKey,
          systemInstruction: systemPrompt,
        });
      }

      // Set up callbacks
      serviceRef.current.setCallbacks({
        onTranscript: (text, isFinal) => {
          setTranscript(text);
          onTranscript?.(text, isFinal);
        },
        onResponse: text => {
          setResponse(prev => prev + text);
          onResponse?.(text);
        },
        onStateChange: state => {
          if (state.isConnected !== undefined) setIsConnected(state.isConnected);
          if (state.isListening !== undefined) setIsListening(state.isListening);
          if (state.isSpeaking !== undefined) setIsSpeaking(state.isSpeaking);
          if (state.error !== undefined) setError(state.error);
        },
        onError: err => {
          setError(err.message);
          onError?.(err);
        },
      });

      // Connect
      await serviceRef.current.connect(advisorId);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  }, [apiKey, advisorId, systemPrompt, onTranscript, onResponse, onError]);

  /**
   * Disconnect from Gemini Live API
   */
  const disconnect = useCallback(() => {
    serviceRef.current?.disconnect();
    serviceRef.current = null;
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setTranscript('');
    setResponse('');
  }, []);

  /**
   * Start listening to microphone
   */
  const startListening = useCallback(async () => {
    if (!serviceRef.current) {
      setError('Not connected');
      return;
    }

    // Check/request permission first
    if (hasMicrophonePermission === false) {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }

    try {
      setTranscript('');
      setResponse('');
      await serviceRef.current.startListening();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start listening';
      setError(errorMsg);
      onError?.(err instanceof Error ? err : new Error(errorMsg));
    }
  }, [hasMicrophonePermission, requestMicrophonePermission, onError]);

  /**
   * Stop listening to microphone
   */
  const stopListening = useCallback(() => {
    serviceRef.current?.stopListening();
  }, []);

  /**
   * Toggle listening state
   */
  const toggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  /**
   * Send a text message
   */
  const sendMessage = useCallback((text: string) => {
    if (!serviceRef.current) {
      setError('Not connected');
      return;
    }

    setResponse('');
    serviceRef.current.sendTextMessage(text);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      serviceRef.current?.disconnect();
    };
  }, []);

  return {
    // State
    isConnected,
    isListening,
    isSpeaking,
    error,
    transcript,
    response,

    // Actions
    connect,
    disconnect,
    startListening,
    stopListening,
    sendMessage,
    toggleListening,

    // Permission
    hasMicrophonePermission,
    requestMicrophonePermission,
  };
}

export default useGeminiVoice;
