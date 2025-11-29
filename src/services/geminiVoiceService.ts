/**
 * Gemini Live API Voice Service
 *
 * Implements real-time voice conversations using Google's Gemini Live API.
 * Supports bidirectional audio streaming with WebSocket connection.
 *
 * Based on: https://ai.google.dev/gemini-api/docs/live
 */

// Voice profiles for each Shark Tank advisor
export const ADVISOR_VOICE_PROFILES: Record<
  string,
  {
    voice: string;
    style: string;
    pitch: number;
    rate: number;
  }
> = {
  'mark-cuban': {
    voice: 'Puck', // Energetic, direct
    style: 'direct and no-nonsense',
    pitch: 1.0,
    rate: 1.1,
  },
  'barbara-corcoran': {
    voice: 'Charon', // Warm, NYC accent feel
    style: 'warm and encouraging with NYC energy',
    pitch: 1.1,
    rate: 1.0,
  },
  'daymond-john': {
    voice: 'Kore', // Smooth, confident
    style: 'confident and culturally aware',
    pitch: 0.95,
    rate: 0.95,
  },
  'lori-greiner': {
    voice: 'Aoede', // Warm, supportive
    style: 'warm and decisive',
    pitch: 1.05,
    rate: 1.0,
  },
  'kevin-oleary': {
    voice: 'Fenrir', // Authoritative, blunt
    style: 'blunt and numbers-focused',
    pitch: 0.9,
    rate: 1.05,
  },
  'robert-herjavec': {
    voice: 'Orus', // Charming, tech-savvy
    style: 'charming and empathetic',
    pitch: 1.0,
    rate: 0.95,
  },
  'kendra-scott': {
    voice: 'Aoede', // Warm, empowering
    style: 'warm and empowering',
    pitch: 1.1,
    rate: 0.95,
  },
  'daniel-lubetzky': {
    voice: 'Kore', // Thoughtful, mission-driven
    style: 'thoughtful and mission-focused',
    pitch: 1.0,
    rate: 0.9,
  },
};

export interface GeminiLiveConfig {
  apiKey: string;
  model?: string;
  voice?: string;
  systemInstruction?: string;
}

export interface VoiceConversationState {
  isConnected: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  currentTranscript: string;
  error: string | null;
}

export type VoiceEventCallback = {
  onTranscript?: (text: string, isFinal: boolean) => void;
  onResponse?: (text: string) => void;
  onAudioResponse?: (audioData: ArrayBuffer) => void;
  onStateChange?: (state: Partial<VoiceConversationState>) => void;
  onError?: (error: Error) => void;
};

/**
 * GeminiVoiceService - Handles real-time voice conversations with Gemini Live API
 */
export class GeminiVoiceService {
  private ws: WebSocket | null = null;
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private config: GeminiLiveConfig;
  private callbacks: VoiceEventCallback = {};
  private state: VoiceConversationState = {
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    currentTranscript: '',
    error: null,
  };

  constructor(config: GeminiLiveConfig) {
    this.config = {
      model: 'gemini-2.0-flash-live-001', // Gemini Live API model
      voice: 'Puck',
      ...config,
    };
  }

  /**
   * Set event callbacks
   */
  setCallbacks(callbacks: VoiceEventCallback) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<VoiceConversationState>) {
    this.state = { ...this.state, ...updates };
    this.callbacks.onStateChange?.(updates);
  }

  /**
   * Connect to Gemini Live API via WebSocket
   */
  async connect(advisorId?: string): Promise<void> {
    try {
      // Get voice profile for advisor
      const voiceProfile = advisorId ? ADVISOR_VOICE_PROFILES[advisorId] : null;
      const voice = voiceProfile?.voice || this.config.voice;

      // Build WebSocket URL
      // Note: In production, you'd get an ephemeral token from your backend
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;

      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('[GeminiVoice] WebSocket connected');
        this.updateState({ isConnected: true, error: null });

        // Send setup message per Gemini Live API spec
        // Request both TEXT and AUDIO so we get transcripts and voice responses
        const setupMessage = {
          setup: {
            model: `models/${this.config.model}`,
            generation_config: {
              response_modalities: ['TEXT', 'AUDIO'],
              speech_config: {
                voice_config: {
                  prebuilt_voice_config: {
                    voice_name: voice,
                  },
                },
              },
            },
            system_instruction: {
              parts: [
                {
                  text: this.config.systemInstruction || 'You are a helpful assistant.',
                },
              ],
            },
          },
        };

        console.log('[GeminiVoice] Sending setup:', JSON.stringify(setupMessage));
        this.ws?.send(JSON.stringify(setupMessage));
      };

      this.ws.onmessage = event => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = error => {
        console.error('[GeminiVoice] WebSocket error:', error);
        this.updateState({ error: 'Connection error' });
        this.callbacks.onError?.(new Error('WebSocket connection error'));
      };

      this.ws.onclose = event => {
        console.log('[GeminiVoice] WebSocket closed:', event.code, event.reason);
        this.updateState({ isConnected: false, isListening: false });
        this.cleanup();
      };
    } catch (error) {
      console.error('[GeminiVoice] Connection failed:', error);
      this.updateState({ error: 'Failed to connect' });
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string | ArrayBuffer) {
    try {
      if (typeof data === 'string') {
        const message = JSON.parse(data);
        console.log('[GeminiVoice] 📨 Received message:', Object.keys(message));

        // Handle setup complete
        if (message.setupComplete) {
          console.log('[GeminiVoice] ✅ Setup complete');
          return;
        }

        // Handle server content (responses)
        if (message.serverContent) {
          const content = message.serverContent;
          console.log('[GeminiVoice] 📦 Server content:', Object.keys(content));

          // Handle model turn (text/audio response)
          if (content.modelTurn) {
            const parts = content.modelTurn.parts || [];
            console.log('[GeminiVoice] 🎭 Model turn with', parts.length, 'parts');

            for (const part of parts) {
              if (part.text) {
                console.log('[GeminiVoice] 📝 Text response:', part.text.substring(0, 100) + '...');
                this.callbacks.onResponse?.(part.text);
              }
              if (part.inlineData?.mimeType?.startsWith('audio/')) {
                console.log('[GeminiVoice] 🔊 Audio response received, mimeType:', part.inlineData.mimeType);
                // Decode base64 audio and play
                const audioData = this.base64ToArrayBuffer(part.inlineData.data);
                console.log('[GeminiVoice] 🔊 Audio data size:', audioData.byteLength, 'bytes');
                this.callbacks.onAudioResponse?.(audioData);
                this.playAudio(audioData);
              }
            }
          }

          // Handle turn complete
          if (content.turnComplete) {
            console.log('[GeminiVoice] ✅ Turn complete');
            this.updateState({ isSpeaking: false });
          }

          // Handle interruption
          if (content.interrupted) {
            console.log('[GeminiVoice] ⚠️ Response interrupted');
            this.updateState({ isSpeaking: false });
          }
        }

        // Handle tool calls (if configured)
        if (message.toolCall) {
          console.log('[GeminiVoice] 🔧 Tool call:', message.toolCall);
        }
      }
    } catch (error) {
      console.error('[GeminiVoice] ❌ Error handling message:', error);
    }
  }

  /**
   * Start listening to microphone
   */
  async startListening(): Promise<void> {
    if (!this.state.isConnected) {
      throw new Error('Not connected to Gemini Live API');
    }

    try {
      // Get microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      // Create audio context
      this.audioContext = new AudioContext({ sampleRate: 16000 });

      // Create source from microphone
      const source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Use ScriptProcessor for wider browser support
      // (AudioWorklet would be better for production)
      const processor = this.audioContext.createScriptProcessor(4096, 1, 1);

      let chunkCount = 0;
      processor.onaudioprocess = event => {
        if (!this.state.isListening || !this.ws) return;

        const inputData = event.inputBuffer.getChannelData(0);

        // Convert Float32 to Int16 PCM
        const pcmData = this.float32ToInt16(inputData);

        // Convert to base64
        const base64Audio = this.arrayBufferToBase64(pcmData.buffer);

        // Send audio chunk to Gemini
        const audioMessage = {
          realtimeInput: {
            mediaChunks: [
              {
                mimeType: 'audio/pcm;rate=16000',
                data: base64Audio,
              },
            ],
          },
        };

        this.ws.send(JSON.stringify(audioMessage));
        chunkCount++;
        if (chunkCount % 50 === 0) {
          console.log('[GeminiVoice] 🎤 Sent', chunkCount, 'audio chunks to Gemini');
        }
      };

      source.connect(processor);
      processor.connect(this.audioContext.destination);

      this.updateState({ isListening: true });
      console.log('[GeminiVoice] Started listening');
    } catch (error) {
      console.error('[GeminiVoice] Failed to start listening:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Stop listening to microphone
   */
  stopListening(): void {
    this.updateState({ isListening: false });

    // Stop media tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    console.log('[GeminiVoice] Stopped listening');
  }

  /**
   * Send a text message (instead of voice)
   */
  sendTextMessage(text: string): void {
    if (!this.ws || !this.state.isConnected) {
      throw new Error('Not connected');
    }

    const message = {
      clientContent: {
        turns: [
          {
            role: 'user',
            parts: [{ text }],
          },
        ],
        turnComplete: true,
      },
    };

    this.ws.send(JSON.stringify(message));
    this.updateState({ isSpeaking: true });
  }

  /**
   * Disconnect from Gemini Live API
   */
  disconnect(): void {
    this.stopListening();

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    this.cleanup();
    this.updateState({ isConnected: false });
    console.log('[GeminiVoice] Disconnected');
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
  }

  /**
   * Play audio response from Gemini
   */
  private async playAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      console.log('[GeminiVoice] 🎵 Starting audio playback...');
      console.log('[GeminiVoice] 🎵 Audio buffer size:', audioData.byteLength);

      // Create audio context - use default sample rate for better compatibility
      const audioContext = new AudioContext();
      console.log('[GeminiVoice] 🎵 AudioContext state:', audioContext.state);

      // Resume if suspended (required by some browsers)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
        console.log('[GeminiVoice] 🎵 AudioContext resumed');
      }

      // Decode audio data (assuming PCM 24kHz from Gemini)
      // For PCM, we need to create the buffer manually
      const int16Array = new Int16Array(audioData);
      const float32Array = new Float32Array(int16Array.length);

      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768;
      }

      console.log('[GeminiVoice] 🎵 Converted to float32, length:', float32Array.length);

      // Create audio buffer at 24kHz (Gemini's output rate)
      const audioBuffer = audioContext.createBuffer(1, float32Array.length, 24000);
      audioBuffer.getChannelData(0).set(float32Array);

      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);

      console.log('[GeminiVoice] 🎵 Playing audio, duration:', audioBuffer.duration, 'seconds');
      source.start();

      this.updateState({ isSpeaking: true });

      source.onended = () => {
        console.log('[GeminiVoice] 🎵 Audio playback ended');
        this.updateState({ isSpeaking: false });
        audioContext.close();
      };
    } catch (error) {
      console.error('[GeminiVoice] ❌ Error playing audio:', error);
    }
  }

  /**
   * Convert Float32Array to Int16Array (PCM)
   */
  private float32ToInt16(float32Array: Float32Array): Int16Array {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }
    return int16Array;
  }

  /**
   * Convert ArrayBuffer to base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  /**
   * Get current state
   */
  getState(): VoiceConversationState {
    return { ...this.state };
  }
}

/**
 * Create a pre-configured voice service for an advisor
 */
export function createAdvisorVoiceService(
  apiKey: string,
  advisorId: string,
  systemPrompt: string
): GeminiVoiceService {
  const voiceProfile = ADVISOR_VOICE_PROFILES[advisorId];

  return new GeminiVoiceService({
    apiKey,
    voice: voiceProfile?.voice || 'Puck',
    systemInstruction: systemPrompt,
  });
}

export default GeminiVoiceService;
