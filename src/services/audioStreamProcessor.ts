// Audio Stream Processor for Gemini Live API
// Handles microphone capture and audio processing

export type AudioChunkCallback = (chunk: ArrayBuffer) => void;

export class AudioStreamProcessor {
  private audioContext: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private isRecording = false;
  private onAudioChunk: AudioChunkCallback | null = null;

  async initialize(): Promise<void> {
    this.audioContext = new AudioContext({ sampleRate: 16000 });

    // Load audio worklet for processing
    const workletCode = `
      class PCMProcessor extends AudioWorkletProcessor {
        constructor() {
          super();
          this.buffer = [];
          this.bufferSize = 2048;
        }

        process(inputs) {
          const input = inputs[0];
          if (input.length > 0) {
            const samples = input[0];
            for (let i = 0; i < samples.length; i++) {
              this.buffer.push(samples[i]);
            }

            while (this.buffer.length >= this.bufferSize) {
              const chunk = this.buffer.splice(0, this.bufferSize);
              const int16 = new Int16Array(chunk.length);
              for (let i = 0; i < chunk.length; i++) {
                int16[i] = Math.max(-32768, Math.min(32767, chunk[i] * 32768));
              }
              this.port.postMessage(int16.buffer, [int16.buffer]);
            }
          }
          return true;
        }
      }
      registerProcessor('pcm-processor', PCMProcessor);
    `;

    const blob = new Blob([workletCode], { type: 'application/javascript' });
    const workletUrl = URL.createObjectURL(blob);

    try {
      await this.audioContext.audioWorklet.addModule(workletUrl);
    } finally {
      URL.revokeObjectURL(workletUrl);
    }
  }

  async startRecording(onChunk: AudioChunkCallback): Promise<void> {
    if (this.isRecording) return;

    if (!this.audioContext) {
      await this.initialize();
    }

    this.onAudioChunk = onChunk;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const source = this.audioContext!.createMediaStreamSource(this.mediaStream);
      this.workletNode = new AudioWorkletNode(this.audioContext!, 'pcm-processor');

      this.workletNode.port.onmessage = (event) => {
        if (this.onAudioChunk && this.isRecording) {
          this.onAudioChunk(event.data);
        }
      };

      source.connect(this.workletNode);
      this.isRecording = true;
      console.log('AudioStreamProcessor: Recording started');
    } catch (err) {
      console.error('AudioStreamProcessor: Failed to start recording', err);
      throw err;
    }
  }

  stopRecording(): void {
    this.isRecording = false;

    if (this.workletNode) {
      this.workletNode.disconnect();
      this.workletNode = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    console.log('AudioStreamProcessor: Recording stopped');
  }

  isActive(): boolean {
    return this.isRecording;
  }

  async checkPermissions(): Promise<boolean> {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state === 'granted';
    } catch {
      // Fallback: try to get user media
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch {
        return false;
      }
    }
  }

  dispose(): void {
    this.stopRecording();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}
