/**
 * Professional Audio Analysis Engine for Pitch Coaching
 * Provides real-time audio processing and speech analysis capabilities
 */

export interface AudioFeatures {
  // Fundamental frequency analysis
  pitch: {
    fundamental: number[];      // F0 values over time
    mean: number;              // Average pitch
    variance: number;          // Pitch variability
    range: number;             // Pitch range (max - min)
    monotoneScore: number;     // 0-100, higher = more monotone
  };

  // Volume and energy analysis
  volume: {
    rms: number[];             // RMS energy over time
    peak: number;              // Peak volume
    average: number;           // Average volume
    dynamic_range: number;     // Volume variation
    consistency: number;       // Volume consistency score
  };

  // Speaking pace and rhythm
  rhythm: {
    speaking_rate: number;     // Words per minute (actual)
    syllable_rate: number;     // Syllables per minute
    pause_rate: number;        // Pauses per minute
    rhythm_regularity: number; // Rhythm consistency score
  };

  // Voice quality metrics
  voice_quality: {
    jitter: number;            // Pitch perturbation
    shimmer: number;           // Amplitude perturbation
    hnr: number;               // Harmonics-to-noise ratio
    spectral_centroid: number; // Voice brightness
    voice_breaks: number;      // Number of voice breaks detected
  };

  // Emotional and stress indicators
  emotional_markers: {
    stress_level: number;      // 0-100, vocal stress indicators
    confidence_level: number;  // 0-100, vocal confidence
    energy_level: number;      // 0-100, vocal energy
    nervousness: number;       // 0-100, nervousness indicators
    authenticity: number;      // 0-100, vocal authenticity
  };

  // Pause and timing analysis
  timing: {
    total_speech_time: number; // Total speaking time
    total_pause_time: number;  // Total pause time
    pause_count: number;       // Number of pauses
    average_pause_length: number; // Average pause duration
    longest_pause: number;     // Longest pause
    speech_to_pause_ratio: number; // Ratio of speech to pause
  };

  // Professional coaching metrics
  coaching_metrics: {
    clarity_score: number;     // 0-100, pronunciation clarity
    articulation_score: number; // 0-100, articulation quality
    flow_score: number;        // 0-100, speech flow quality
    emphasis_variation: number; // 0-100, emphasis variety
    professional_tone: number; // 0-100, professional delivery
  };
}

export interface VocalDeliveryInsights {
  strengths: string[];
  improvement_areas: string[];
  specific_recommendations: string[];
  coaching_tips: string[];
  professional_score: number;
}

export class AudioAnalysisEngine {
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioData: Float32Array[] = [];
  private sampleRate: number = 44100;
  private isAnalyzing: boolean = false;

  // Analysis buffers
  private pitchBuffer: number[] = [];
  private volumeBuffer: number[] = [];
  private spectralBuffer: Float32Array[] = [];
  private timeBuffer: number[] = [];

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      console.log('Audio analysis engine initialized');
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  async startAnalysis(stream: MediaStream): Promise<void> {
    if (!this.audioContext) {
      throw new Error('Audio context not initialized');
    }

    // Reset analysis buffers
    this.resetBuffers();
    this.isAnalyzing = true;

    // Create audio nodes for real-time analysis
    const source = this.audioContext.createMediaStreamSource(stream);
    this.analyserNode = this.audioContext.createAnalyser();

    // Configure analyzer
    this.analyserNode.fftSize = 2048;
    this.analyserNode.smoothingTimeConstant = 0.8;

    // Connect audio graph
    source.connect(this.analyserNode);

    // Start real-time analysis
    this.performRealTimeAnalysis();

    console.log('Audio analysis started');
  }

  private resetBuffers(): void {
    this.audioData = [];
    this.pitchBuffer = [];
    this.volumeBuffer = [];
    this.spectralBuffer = [];
    this.timeBuffer = [];
  }

  private performRealTimeAnalysis(): void {
    if (!this.analyserNode || !this.isAnalyzing) return;

    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength);
    const timeArray = new Float32Array(bufferLength);

    const analyze = () => {
      if (!this.isAnalyzing || !this.analyserNode) return;

      // Get frequency and time domain data
      this.analyserNode.getFloatFrequencyData(dataArray);
      this.analyserNode.getFloatTimeDomainData(timeArray);

      // Store data for analysis
      this.spectralBuffer.push(new Float32Array(dataArray));
      this.audioData.push(new Float32Array(timeArray));
      this.timeBuffer.push(Date.now());

      // Extract real-time features
      const pitch = this.extractPitch(timeArray);
      const volume = this.calculateRMS(timeArray);

      if (pitch > 0) this.pitchBuffer.push(pitch);
      this.volumeBuffer.push(volume);

      // Continue analysis
      requestAnimationFrame(analyze);
    };

    analyze();
  }

  stopAnalysis(): void {
    this.isAnalyzing = false;
    console.log('Audio analysis stopped');
  }

  async generateComprehensiveAnalysis(
    transcript: string,
    recordingDuration: number
  ): Promise<AudioFeatures> {
    console.log('Generating comprehensive audio analysis...');

    // Calculate fundamental audio features
    const pitchFeatures = this.analyzePitch();
    const volumeFeatures = this.analyzeVolume();
    const timingFeatures = this.analyzeTimingAndPauses(transcript, recordingDuration);
    const voiceQualityFeatures = this.analyzeVoiceQuality();
    const emotionalFeatures = this.analyzeEmotionalMarkers();
    const coachingFeatures = this.generateCoachingMetrics();

    return {
      pitch: pitchFeatures,
      volume: volumeFeatures,
      rhythm: this.calculateRhythmMetrics(transcript, recordingDuration),
      voice_quality: voiceQualityFeatures,
      emotional_markers: emotionalFeatures,
      timing: timingFeatures,
      coaching_metrics: coachingFeatures
    };
  }

  private analyzePitch(): AudioFeatures['pitch'] {
    if (this.pitchBuffer.length === 0) {
      return {
        fundamental: [],
        mean: 0,
        variance: 0,
        range: 0,
        monotoneScore: 50
      };
    }

    const validPitches = this.pitchBuffer.filter(p => p > 0);
    const mean = validPitches.reduce((a, b) => a + b, 0) / validPitches.length;
    const variance = validPitches.reduce((sum, pitch) => sum + Math.pow(pitch - mean, 2), 0) / validPitches.length;
    const range = Math.max(...validPitches) - Math.min(...validPitches);

    // Calculate monotone score (lower variance = higher monotone score)
    const monotoneScore = Math.max(0, Math.min(100, 100 - (variance / 1000) * 100));

    return {
      fundamental: this.pitchBuffer,
      mean,
      variance,
      range,
      monotoneScore
    };
  }

  private analyzeVolume(): AudioFeatures['volume'] {
    if (this.volumeBuffer.length === 0) {
      return {
        rms: [],
        peak: 0,
        average: 0,
        dynamic_range: 0,
        consistency: 0
      };
    }

    const peak = Math.max(...this.volumeBuffer);
    const average = this.volumeBuffer.reduce((a, b) => a + b, 0) / this.volumeBuffer.length;
    const dynamic_range = peak - Math.min(...this.volumeBuffer);

    // Calculate volume consistency (lower variance = higher consistency)
    const variance = this.volumeBuffer.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) / this.volumeBuffer.length;
    const consistency = Math.max(0, Math.min(100, 100 - (variance * 1000)));

    return {
      rms: this.volumeBuffer,
      peak,
      average,
      dynamic_range,
      consistency
    };
  }

  private analyzeTimingAndPauses(transcript: string, duration: number): AudioFeatures['timing'] {
    // Estimate pauses from transcript punctuation and audio gaps
    const sentences = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = transcript.split(/\s+/).filter(w => w.length > 0);

    // Estimate speech timing
    const estimatedSpeechTime = duration * 0.75; // Assume 75% speaking, 25% pauses
    const estimatedPauseTime = duration - estimatedSpeechTime;
    const pauseCount = Math.max(1, sentences.length - 1);
    const averagePauseLength = pauseCount > 0 ? estimatedPauseTime / pauseCount : 0;

    return {
      total_speech_time: estimatedSpeechTime,
      total_pause_time: estimatedPauseTime,
      pause_count: pauseCount,
      average_pause_length: averagePauseLength,
      longest_pause: averagePauseLength * 1.5, // Estimate
      speech_to_pause_ratio: estimatedSpeechTime / Math.max(0.1, estimatedPauseTime)
    };
  }

  private analyzeVoiceQuality(): AudioFeatures['voice_quality'] {
    // Advanced voice quality metrics using audio analysis
    const jitter = this.calculateJitter();
    const shimmer = this.calculateShimmer();
    const hnr = this.calculateHNR();
    const spectralCentroid = this.calculateSpectralCentroid();
    const voiceBreaks = this.detectVoiceBreaks();

    return {
      jitter,
      shimmer,
      hnr,
      spectral_centroid: spectralCentroid,
      voice_breaks: voiceBreaks
    };
  }

  private analyzeEmotionalMarkers(): AudioFeatures['emotional_markers'] {
    const pitchFeatures = this.analyzePitch();
    const volumeFeatures = this.analyzeVolume();

    // Calculate emotional indicators based on voice features
    const stressLevel = this.calculateStressLevel(pitchFeatures, volumeFeatures);
    const confidenceLevel = this.calculateConfidenceLevel(pitchFeatures, volumeFeatures);
    const energyLevel = this.calculateEnergyLevel(volumeFeatures);
    const nervousness = this.calculateNervousness(pitchFeatures);
    const authenticity = this.calculateAuthenticity(pitchFeatures, volumeFeatures);

    return {
      stress_level: stressLevel,
      confidence_level: confidenceLevel,
      energy_level: energyLevel,
      nervousness: nervousness,
      authenticity: authenticity
    };
  }

  private generateCoachingMetrics(): AudioFeatures['coaching_metrics'] {
    const pitchFeatures = this.analyzePitch();
    const volumeFeatures = this.analyzeVolume();

    // Professional coaching scores
    const clarityScore = this.calculateClarityScore();
    const articulationScore = this.calculateArticulationScore();
    const flowScore = this.calculateFlowScore(pitchFeatures);
    const emphasisVariation = 100 - pitchFeatures.monotoneScore; // Inverse of monotone
    const professionalTone = this.calculateProfessionalTone(pitchFeatures, volumeFeatures);

    return {
      clarity_score: clarityScore,
      articulation_score: articulationScore,
      flow_score: flowScore,
      emphasis_variation: emphasisVariation,
      professional_tone: professionalTone
    };
  }

  // Helper methods for audio feature extraction
  private extractPitch(timeData: Float32Array): number {
    // Simple autocorrelation-based pitch detection
    const correlations = new Array(timeData.length / 2);
    let maxCorrelation = 0;
    let bestPeriod = 0;

    for (let period = 20; period < timeData.length / 2; period++) {
      let correlation = 0;
      for (let i = 0; i < timeData.length - period; i++) {
        correlation += timeData[i] * timeData[i + period];
      }

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? this.sampleRate / bestPeriod : 0;
  }

  private calculateRMS(timeData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return Math.sqrt(sum / timeData.length);
  }

  private calculateJitter(): number {
    // Period-to-period pitch variation
    if (this.pitchBuffer.length < 3) return 0;

    let jitterSum = 0;
    for (let i = 1; i < this.pitchBuffer.length - 1; i++) {
      const diff = Math.abs(this.pitchBuffer[i] - this.pitchBuffer[i - 1]);
      jitterSum += diff;
    }

    return (jitterSum / (this.pitchBuffer.length - 1)) / 1000; // Normalize
  }

  private calculateShimmer(): number {
    // Amplitude variation measure
    if (this.volumeBuffer.length < 3) return 0;

    let shimmerSum = 0;
    for (let i = 1; i < this.volumeBuffer.length; i++) {
      const diff = Math.abs(this.volumeBuffer[i] - this.volumeBuffer[i - 1]);
      shimmerSum += diff;
    }

    return (shimmerSum / (this.volumeBuffer.length - 1)) * 100; // Convert to percentage
  }

  private calculateHNR(): number {
    // Harmonics-to-noise ratio (simplified)
    const avgVolume = this.volumeBuffer.reduce((a, b) => a + b, 0) / this.volumeBuffer.length;
    const noise = this.volumeBuffer.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) / this.volumeBuffer.length;
    return Math.max(0, Math.min(40, 20 * Math.log10(avgVolume / Math.max(0.001, Math.sqrt(noise)))));
  }

  private calculateSpectralCentroid(): number {
    // Brightness of voice
    if (this.spectralBuffer.length === 0) return 1000;

    const latest = this.spectralBuffer[this.spectralBuffer.length - 1];
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < latest.length; i++) {
      const magnitude = Math.pow(10, latest[i] / 20); // Convert from dB
      numerator += i * magnitude;
      denominator += magnitude;
    }

    return denominator > 0 ? (numerator / denominator) * (this.sampleRate / 2) / latest.length : 1000;
  }

  private detectVoiceBreaks(): number {
    // Detect sudden volume drops (voice breaks)
    let breaks = 0;
    const threshold = -20; // dB threshold for voice break

    for (let i = 1; i < this.volumeBuffer.length; i++) {
      const volumeDB = 20 * Math.log10(Math.max(0.001, this.volumeBuffer[i]));
      if (volumeDB < threshold) {
        breaks++;
      }
    }

    return breaks;
  }

  private calculateRhythmMetrics(transcript: string, duration: number): AudioFeatures['rhythm'] {
    const words = transcript.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.estimateSyllables(transcript);

    const speakingRate = duration > 0 ? (words.length / duration) * 60 : 0;
    const syllableRate = duration > 0 ? (syllables / duration) * 60 : 0;
    const pauseRate = duration > 0 ? (this.pitchBuffer.filter(p => p === 0).length / duration) * 60 : 0;

    // Rhythm regularity based on pitch and volume consistency
    const pitchVariance = this.pitchBuffer.length > 0 ?
      this.pitchBuffer.reduce((sum, p, i, arr) => sum + Math.pow(p - arr.reduce((a, b) => a + b) / arr.length, 2), 0) / this.pitchBuffer.length : 0;
    const rhythmRegularity = Math.max(0, Math.min(100, 100 - (pitchVariance / 10000) * 100));

    return {
      speaking_rate: speakingRate,
      syllable_rate: syllableRate,
      pause_rate: pauseRate,
      rhythm_regularity: rhythmRegularity
    };
  }

  private estimateSyllables(text: string): number {
    // Simple syllable estimation
    return text.toLowerCase()
      .replace(/[^a-z]/g, '')
      .replace(/[aeiouy]+/g, 'a')
      .replace(/[^a]/g, '')
      .length || 1;
  }

  // Emotional and coaching metric calculations
  private calculateStressLevel(pitch: AudioFeatures['pitch'], volume: AudioFeatures['volume']): number {
    // Higher pitch variance + volume inconsistency = higher stress
    const pitchStress = Math.min(50, (pitch.variance / 1000) * 100);
    const volumeStress = Math.min(50, 100 - volume.consistency);
    return Math.min(100, pitchStress + volumeStress);
  }

  private calculateConfidenceLevel(pitch: AudioFeatures['pitch'], volume: AudioFeatures['volume']): number {
    // Consistent volume + moderate pitch variation = confidence
    const volumeConfidence = volume.consistency;
    const pitchConfidence = Math.max(0, Math.min(100, 100 - pitch.monotoneScore + 20));
    return Math.min(100, (volumeConfidence + pitchConfidence) / 2);
  }

  private calculateEnergyLevel(volume: AudioFeatures['volume']): number {
    // Higher average volume + good dynamic range = energy
    const normalizedVolume = Math.min(100, volume.average * 1000);
    const dynamicEnergy = Math.min(100, volume.dynamic_range * 500);
    return Math.min(100, (normalizedVolume + dynamicEnergy) / 2);
  }

  private calculateNervousness(pitch: AudioFeatures['pitch']): number {
    // High pitch variance = nervousness
    return Math.min(100, (pitch.variance / 1000) * 100);
  }

  private calculateAuthenticity(pitch: AudioFeatures['pitch'], volume: AudioFeatures['volume']): number {
    // Natural variation without extreme inconsistency
    const pitchNaturalness = Math.max(0, 100 - Math.abs(pitch.monotoneScore - 30)); // Sweet spot around 30
    const volumeNaturalness = Math.max(0, 100 - Math.abs(volume.consistency - 70)); // Sweet spot around 70
    return Math.min(100, (pitchNaturalness + volumeNaturalness) / 2);
  }

  private calculateClarityScore(): number {
    // Based on HNR and spectral clarity
    const hnr = this.calculateHNR();
    return Math.min(100, Math.max(0, (hnr / 20) * 100));
  }

  private calculateArticulationScore(): number {
    // Based on spectral centroid and voice breaks
    const spectralCentroid = this.calculateSpectralCentroid();
    const voiceBreaks = this.detectVoiceBreaks();
    const spectralScore = Math.min(100, (spectralCentroid / 2000) * 100);
    const articulationPenalty = Math.min(50, voiceBreaks * 5);
    return Math.max(0, spectralScore - articulationPenalty);
  }

  private calculateFlowScore(pitch: AudioFeatures['pitch']): number {
    // Smooth pitch transitions = good flow
    return Math.max(0, 100 - pitch.monotoneScore + 20);
  }

  private calculateProfessionalTone(pitch: AudioFeatures['pitch'], volume: AudioFeatures['volume']): number {
    // Balanced pitch variation + consistent volume = professional
    const pitchProfessionalism = Math.max(0, 100 - Math.abs(pitch.monotoneScore - 25)); // Slightly varied is professional
    const volumeProfessionalism = volume.consistency;
    return Math.min(100, (pitchProfessionalism + volumeProfessionalism) / 2);
  }

  generateVocalDeliveryInsights(features: AudioFeatures): VocalDeliveryInsights {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];
    const coachingTips: string[] = [];

    // Analyze strengths
    if (features.coaching_metrics.clarity_score > 80) {
      strengths.push("Excellent speech clarity and pronunciation");
    }
    if (features.emotional_markers.confidence_level > 80) {
      strengths.push("Strong vocal confidence and authority");
    }
    if (features.volume.consistency > 80) {
      strengths.push("Consistent and controlled volume delivery");
    }
    if (features.pitch.monotoneScore < 30) {
      strengths.push("Good vocal variety and intonation");
    }
    if (features.rhythm.speaking_rate >= 140 && features.rhythm.speaking_rate <= 160) {
      strengths.push("Optimal speaking pace for engagement");
    }

    // Analyze improvement areas
    if (features.emotional_markers.stress_level > 60) {
      improvementAreas.push("Reduce vocal stress indicators");
      recommendations.push("Practice deep breathing exercises before speaking");
      coachingTips.push("Take slow, deep breaths between key points to maintain vocal calm");
    }

    if (features.pitch.monotoneScore > 70) {
      improvementAreas.push("Increase vocal variety and intonation");
      recommendations.push("Practice emphasizing key words with pitch changes");
      coachingTips.push("Use rising intonation for questions and falling for statements");
    }

    if (features.rhythm.speaking_rate < 120) {
      improvementAreas.push("Increase speaking pace for better engagement");
      recommendations.push("Practice speaking at 140-160 words per minute");
      coachingTips.push("Use a metronome app to practice consistent speaking rhythm");
    }

    if (features.rhythm.speaking_rate > 180) {
      improvementAreas.push("Slow down speaking pace for clarity");
      recommendations.push("Practice pausing between key points");
      coachingTips.push("Use strategic 2-second pauses to emphasize important information");
    }

    if (features.volume.consistency < 60) {
      improvementAreas.push("Improve volume consistency");
      recommendations.push("Practice maintaining steady vocal projection");
      coachingTips.push("Speak from your diaphragm rather than your throat");
    }

    if (features.voice_quality.voice_breaks > 5) {
      improvementAreas.push("Reduce voice breaks and maintain vocal stability");
      recommendations.push("Work on breath support and vocal warm-ups");
      coachingTips.push("Do vocal warm-ups: humming, lip trills, and 'ma-me-mi-mo-mu' exercises");
    }

    if (features.emotional_markers.nervousness > 70) {
      improvementAreas.push("Manage presentation nervousness");
      recommendations.push("Practice relaxation techniques and mental preparation");
      coachingTips.push("Visualize successful delivery and practice progressive muscle relaxation");
    }

    // Calculate professional score
    const professionalScore = Math.round(
      (features.coaching_metrics.clarity_score +
       features.coaching_metrics.articulation_score +
       features.coaching_metrics.flow_score +
       features.coaching_metrics.professional_tone +
       features.emotional_markers.confidence_level) / 5
    );

    // Add general coaching tips if needed
    if (strengths.length === 0) {
      coachingTips.push("Focus on one improvement area at a time for best results");
      coachingTips.push("Record yourself regularly to track vocal progress");
    }

    if (features.timing.speech_to_pause_ratio < 2) {
      coachingTips.push("Use strategic pauses - they create impact and help audience processing");
    }

    return {
      strengths,
      improvement_areas: improvementAreas,
      specific_recommendations: recommendations,
      coaching_tips: coachingTips,
      professional_score: professionalScore
    };
  }
}

export const createAudioAnalysisEngine = (): AudioAnalysisEngine => {
  return new AudioAnalysisEngine();
};