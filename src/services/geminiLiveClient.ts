// Gemini 2.5 Live API WebSocket Client
import type {
  GeminiLiveConfig,
  GeminiServerMessage,
  GeminiClientMessage,
  VoiceSessionState
} from '../types/voice';

type MessageHandler = (message: GeminiServerMessage) => void;
type AudioHandler = (audioData: ArrayBuffer) => void;
type TextHandler = (text: string) => void;
type StateHandler = (state: VoiceSessionState) => void;

export class GeminiLiveClient {
  private ws: WebSocket | null = null;
  private config: GeminiLiveConfig;
  private messageHandlers: Set<MessageHandler> = new Set();
  private audioHandlers: Set<AudioHandler> = new Set();
  private textHandlers: Set<TextHandler> = new Set();
  private stateHandlers: Set<StateHandler> = new Set();
  private state: VoiceSessionState = {
    isConnected: false,
    isListening: false,
    isSpeaking: false,
    isProcessing: false
  };
  private audioQueue: ArrayBuffer[] = [];
  private isPlaying = false;
  private audioContext: AudioContext | null = null;

  constructor(config: GeminiLiveConfig) {
    this.config = config;
    // Initialize shared AudioContext once
    try {
      this.audioContext = new AudioContext({ sampleRate: 16000 });
    } catch (err) {
      console.warn('AudioContext creation failed, will try without sample rate:', err);
      try {
        this.audioContext = new AudioContext();
      } catch (e) {
        console.error('AudioContext creation failed completely:', e);
      }
    }
  }

  private updateState(updates: Partial<VoiceSessionState>) {
    this.state = { ...this.state, ...updates };
    this.stateHandlers.forEach(handler => handler(this.state));
  }

  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const wsUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.config.apiKey}`;

      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          console.log('Gemini Live: WebSocket connected');
          this.sendSetup();
        };

        this.ws.onmessage = async (event) => {
          try {
            const data = event.data instanceof Blob
              ? await event.data.text()
              : event.data;
            const message: GeminiServerMessage = JSON.parse(data);
            this.handleMessage(message);

            if (message.setupComplete) {
              this.updateState({ isConnected: true });
              resolve();
            }
          } catch (err) {
            console.error('Gemini Live: Parse error', err);
          }
        };

        this.ws.onerror = (error) => {
          console.error('Gemini Live: WebSocket error', error);
          this.updateState({ error: 'Connection error', isConnected: false });
          reject(new Error('WebSocket connection failed'));
        };

        this.ws.onclose = (event) => {
          console.log('Gemini Live: WebSocket closed', event.code, event.reason);
          this.updateState({ isConnected: false, isListening: false });
        };

        // Timeout for connection
        setTimeout(() => {
          if (!this.state.isConnected) {
            reject(new Error('Connection timeout'));
          }
        }, 10000);
      } catch (err) {
        reject(err);
      }
    });
  }

  private sendSetup() {
    if (!this.ws) return;

    const setupMessage: GeminiClientMessage = {
      setup: {
        model: this.config.model,
        generationConfig: {
          responseModalities: this.config.generationConfig?.responseModalities || ['AUDIO', 'TEXT'],
          speechConfig: this.config.voiceConfig ? {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: this.config.voiceConfig.voiceName
              }
            }
          } : undefined
        },
        systemInstruction: this.config.systemInstruction ? {
          parts: [{ text: this.config.systemInstruction }]
        } : undefined
      }
    };

    this.ws.send(JSON.stringify(setupMessage));
  }

  private handleMessage(message: GeminiServerMessage) {
    this.messageHandlers.forEach(handler => handler(message));

    if (message.serverContent?.modelTurn?.parts) {
      for (const part of message.serverContent.modelTurn.parts) {
        if (part.text) {
          this.textHandlers.forEach(handler => handler(part.text!));
        }
        if (part.inlineData?.data) {
          const audioData = this.base64ToArrayBuffer(part.inlineData.data);
          this.audioHandlers.forEach(handler => handler(audioData));
          this.audioQueue.push(audioData);
          this.playNextAudio();
        }
      }
    }

    if (message.serverContent?.turnComplete) {
      this.updateState({ isProcessing: false, isSpeaking: false });
    }

    if (message.serverContent?.interrupted) {
      this.audioQueue = [];
      this.updateState({ isSpeaking: false });
    }
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private async playNextAudio() {
    if (this.isPlaying || this.audioQueue.length === 0) return;

    if (!this.audioContext) {
      console.error('Gemini Live: AudioContext not available');
      this.isPlaying = false;
      return;
    }

    this.isPlaying = true;
    this.updateState({ isSpeaking: true });

    const audioData = this.audioQueue.shift()!;

    try {
      const audioBuffer = await this.audioContext.decodeAudioData(audioData.slice(0));
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.audioContext.destination);

      source.onended = () => {
        this.isPlaying = false;
        if (this.audioQueue.length > 0) {
          this.playNextAudio();
        } else {
          this.updateState({ isSpeaking: false });
        }
      };

      source.start();
    } catch (err) {
      console.error('Gemini Live: Audio playback error', err);
      this.isPlaying = false;
      this.playNextAudio();
    }
  }

  sendAudio(audioData: ArrayBuffer) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Gemini Live: Cannot send audio, not connected');
      return;
    }

    const message: GeminiClientMessage = {
      realtimeInput: {
        mediaChunks: [{
          mimeType: 'audio/pcm;rate=16000',
          data: this.arrayBufferToBase64(audioData)
        }]
      }
    };

    this.ws.send(JSON.stringify(message));
    this.updateState({ isProcessing: true });
  }

  sendText(text: string) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Gemini Live: Cannot send text, not connected');
      return;
    }

    const message: GeminiClientMessage = {
      clientContent: {
        turns: [{
          role: 'user',
          parts: [{ text }]
        }],
        turnComplete: true
      }
    };

    this.ws.send(JSON.stringify(message));
    this.updateState({ isProcessing: true });
  }

  interrupt() {
    this.audioQueue = [];
    this.updateState({ isSpeaking: false });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioQueue = [];
    this.updateState({ isConnected: false, isListening: false, isSpeaking: false });
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onAudio(handler: AudioHandler) {
    this.audioHandlers.add(handler);
    return () => this.audioHandlers.delete(handler);
  }

  onText(handler: TextHandler) {
    this.textHandlers.add(handler);
    return () => this.textHandlers.delete(handler);
  }

  onStateChange(handler: StateHandler) {
    this.stateHandlers.add(handler);
    return () => this.stateHandlers.delete(handler);
  }

  getState(): VoiceSessionState {
    return { ...this.state };
  }
}
