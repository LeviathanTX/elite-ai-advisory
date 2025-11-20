/**
 * Professional Audio Analysis Engine for Pitch Coaching
 * Provides real-time audio processing and speech analysis capabilities
 */

export interface AudioFeatures {
  // Fundamental frequency analysis
  pitch: {
    fundamental: number[]; // F0 values over time
    mean: number; // Average pitch
    variance: number; // Pitch variability
    range: number; // Pitch range (max - min)
    monotoneScore: number; // 0-100, higher = more monotone
  };

  // Volume and energy analysis
  volume: {
    rms: number[]; // RMS energy over time
    peak: number; // Peak volume
    average: number; // Average volume
    dynamic_range: number; // Volume variation
    consistency: number; // Volume consistency score
  };

  // Speaking pace and rhythm
  rhythm: {
    speaking_rate: number; // Words per minute (actual)
    syllable_rate: number; // Syllables per minute
    pause_rate: number; // Pauses per minute
    rhythm_regularity: number; // Rhythm consistency score
  };

  // Voice quality metrics
  voice_quality: {
    jitter: number; // Pitch perturbation
    shimmer: number; // Amplitude perturbation
    hnr: number; // Harmonics-to-noise ratio
    spectral_centroid: number; // Voice brightness
    voice_breaks: number; // Number of voice breaks detected
  };

  // Emotional and stress indicators
  emotional_markers: {
    stress_level: number; // 0-100, vocal stress indicators
    confidence_level: number; // 0-100, vocal confidence
    energy_level: number; // 0-100, vocal energy
    nervousness: number; // 0-100, nervousness indicators
    authenticity: number; // 0-100, vocal authenticity
    authority: number; // 0-100, vocal authority and command
    credibility: number; // 0-100, believability and trustworthiness
    persuasiveness: number; // 0-100, convincing power
    warmth: number; // 0-100, vocal warmth and approachability
  };

  // Filler word analysis
  filler_words: {
    total_count: number;
    um_uh_count: number; // "um", "uh"
    like_count: number; // "like" as filler
    you_know_count: number; // "you know"
    basically_count: number; // "basically", "actually"
    so_count: number; // "so" as filler
    other_count: number; // other hesitations
    filler_rate: number; // fillers per minute
    most_common: string; // most frequently used filler
  };

  // Voice quality descriptors
  vocal_qualities: {
    tone_description: string; // warm, cold, neutral, harsh, smooth
    strength_level: string; // weak, moderate, strong, powerful
    authority_level: string; // tentative, confident, authoritative, commanding
    richness: string; // thin, moderate, rich, resonant
    steadiness: string; // shaky, uneven, steady, rock-solid
  };

  // Pause and timing analysis
  timing: {
    total_speech_time: number; // Total speaking time
    total_pause_time: number; // Total pause time
    pause_count: number; // Number of pauses
    average_pause_length: number; // Average pause duration
    longest_pause: number; // Longest pause
    speech_to_pause_ratio: number; // Ratio of speech to pause
  };

  // Professional coaching metrics
  coaching_metrics: {
    clarity_score: number; // 0-100, pronunciation clarity
    articulation_score: number; // 0-100, articulation quality
    flow_score: number; // 0-100, speech flow quality
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
    const fillerWordAnalysis = this.analyzeFillerWords(transcript, recordingDuration);
    const vocalQualities = this.analyzeVocalQualities(pitchFeatures, volumeFeatures, emotionalFeatures);

    return {
      pitch: pitchFeatures,
      volume: volumeFeatures,
      rhythm: this.calculateRhythmMetrics(transcript, recordingDuration),
      voice_quality: voiceQualityFeatures,
      emotional_markers: emotionalFeatures,
      timing: timingFeatures,
      coaching_metrics: coachingFeatures,
      filler_words: fillerWordAnalysis,
      vocal_qualities: vocalQualities,
    };
  }

  private analyzePitch(): AudioFeatures['pitch'] {
    if (this.pitchBuffer.length === 0) {
      return {
        fundamental: [],
        mean: 0,
        variance: 0,
        range: 0,
        monotoneScore: 50,
      };
    }

    const validPitches = this.pitchBuffer.filter(p => p > 0);
    const mean = validPitches.reduce((a, b) => a + b, 0) / validPitches.length;
    const variance =
      validPitches.reduce((sum, pitch) => sum + Math.pow(pitch - mean, 2), 0) / validPitches.length;
    const range = Math.max(...validPitches) - Math.min(...validPitches);

    // Calculate monotone score (lower variance = higher monotone score)
    const monotoneScore = Math.max(0, Math.min(100, 100 - (variance / 1000) * 100));

    return {
      fundamental: this.pitchBuffer,
      mean,
      variance,
      range,
      monotoneScore,
    };
  }

  private analyzeVolume(): AudioFeatures['volume'] {
    if (this.volumeBuffer.length === 0) {
      return {
        rms: [],
        peak: 0,
        average: 0,
        dynamic_range: 0,
        consistency: 0,
      };
    }

    const peak = Math.max(...this.volumeBuffer);
    const average = this.volumeBuffer.reduce((a, b) => a + b, 0) / this.volumeBuffer.length;
    const dynamic_range = peak - Math.min(...this.volumeBuffer);

    // Calculate volume consistency (lower variance = higher consistency)
    const variance =
      this.volumeBuffer.reduce((sum, vol) => sum + Math.pow(vol - average, 2), 0) /
      this.volumeBuffer.length;
    const consistency = Math.max(0, Math.min(100, 100 - variance * 1000));

    return {
      rms: this.volumeBuffer,
      peak,
      average,
      dynamic_range,
      consistency,
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
      speech_to_pause_ratio: estimatedSpeechTime / Math.max(0.1, estimatedPauseTime),
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
      voice_breaks: voiceBreaks,
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

    // New advanced vocal quality metrics
    const authority = this.calculateAuthority(pitchFeatures, volumeFeatures, confidenceLevel);
    const credibility = this.calculateCredibility(pitchFeatures, volumeFeatures, authenticity);
    const persuasiveness = this.calculatePersuasiveness(authority, credibility, energyLevel);
    const warmth = this.calculateWarmth(pitchFeatures, volumeFeatures);

    return {
      stress_level: stressLevel,
      confidence_level: confidenceLevel,
      energy_level: energyLevel,
      nervousness: nervousness,
      authenticity: authenticity,
      authority: authority,
      credibility: credibility,
      persuasiveness: persuasiveness,
      warmth: warmth,
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
      professional_tone: professionalTone,
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

    return jitterSum / (this.pitchBuffer.length - 1) / 1000; // Normalize
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
    const noise =
      this.volumeBuffer.reduce((sum, vol) => sum + Math.pow(vol - avgVolume, 2), 0) /
      this.volumeBuffer.length;
    return Math.max(
      0,
      Math.min(40, 20 * Math.log10(avgVolume / Math.max(0.001, Math.sqrt(noise))))
    );
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

    return denominator > 0
      ? ((numerator / denominator) * (this.sampleRate / 2)) / latest.length
      : 1000;
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
    const pauseRate =
      duration > 0 ? (this.pitchBuffer.filter(p => p === 0).length / duration) * 60 : 0;

    // Rhythm regularity based on pitch and volume consistency
    const pitchVariance =
      this.pitchBuffer.length > 0
        ? this.pitchBuffer.reduce(
            (sum, p, i, arr) => sum + Math.pow(p - arr.reduce((a, b) => a + b) / arr.length, 2),
            0
          ) / this.pitchBuffer.length
        : 0;
    const rhythmRegularity = Math.max(0, Math.min(100, 100 - (pitchVariance / 10000) * 100));

    return {
      speaking_rate: speakingRate,
      syllable_rate: syllableRate,
      pause_rate: pauseRate,
      rhythm_regularity: rhythmRegularity,
    };
  }

  private estimateSyllables(text: string): number {
    // Simple syllable estimation
    return (
      text
        .toLowerCase()
        .replace(/[^a-z]/g, '')
        .replace(/[aeiouy]+/g, 'a')
        .replace(/[^a]/g, '').length || 1
    );
  }

  // Emotional and coaching metric calculations
  private calculateStressLevel(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume']
  ): number {
    // Higher pitch variance + volume inconsistency = higher stress
    const pitchStress = Math.min(50, (pitch.variance / 1000) * 100);
    const volumeStress = Math.min(50, 100 - volume.consistency);
    return Math.min(100, pitchStress + volumeStress);
  }

  private calculateConfidenceLevel(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume']
  ): number {
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

  private calculateAuthenticity(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume']
  ): number {
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

  private calculateProfessionalTone(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume']
  ): number {
    // Balanced pitch variation + consistent volume = professional
    const pitchProfessionalism = Math.max(0, 100 - Math.abs(pitch.monotoneScore - 25)); // Slightly varied is professional
    const volumeProfessionalism = volume.consistency;
    return Math.min(100, (pitchProfessionalism + volumeProfessionalism) / 2);
  }

  // NEW: Advanced vocal quality metrics
  private calculateAuthority(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume'],
    confidence: number
  ): number {
    // Authority = steady confident voice with good projection and moderate pitch
    // Lower pitch tends to sound more authoritative (but not too low)
    const pitchAuthority = pitch.mean > 100 && pitch.mean < 180 ? 100 : Math.max(0, 100 - Math.abs(pitch.mean - 140));
    const volumeAuthority = volume.average > 0.05 ? Math.min(100, volume.average * 1500) : 0; // Good projection
    const steadiness = volume.consistency; // Steady voice = authority
    const variationControl = Math.max(0, 100 - pitch.monotoneScore); // Some variation, not monotone

    // Combine factors with confidence being key
    return Math.min(100,
      confidence * 0.4 +
      pitchAuthority * 0.2 +
      volumeAuthority * 0.2 +
      steadiness * 0.1 +
      variationControl * 0.1
    );
  }

  private calculateCredibility(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume'],
    authenticity: number
  ): number {
    // Credibility = authentic, steady, clear voice without excessive nervousness
    const steadyPitch = Math.max(0, 100 - (pitch.variance / 2000) * 100); // Not too much variance
    const steadyVolume = volume.consistency;
    const naturalPacing = Math.max(0, 100 - Math.abs(pitch.monotoneScore - 35)); // Some natural variety

    // Authenticity is key for credibility
    return Math.min(100,
      authenticity * 0.5 +
      steadyPitch * 0.2 +
      steadyVolume * 0.2 +
      naturalPacing * 0.1
    );
  }

  private calculatePersuasiveness(
    authority: number,
    credibility: number,
    energy: number
  ): number {
    // Persuasiveness = combination of authority, credibility, and energy
    // Authority and credibility are most important
    return Math.min(100,
      authority * 0.4 +
      credibility * 0.4 +
      energy * 0.2
    );
  }

  private calculateWarmth(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume']
  ): number {
    // Warmth = moderate-to-higher pitch with good variation and consistent moderate volume
    const pitchWarmth = pitch.mean > 150 && pitch.mean < 220 ? 100 : Math.max(0, 100 - Math.abs(pitch.mean - 185));
    const volumeWarmth = Math.max(0, 100 - Math.abs(volume.average - 0.06) * 1000); // Moderate volume
    const variation = Math.max(0, 100 - pitch.monotoneScore); // Varied = warm
    const consistency = volume.consistency; // Consistent = warm

    return Math.min(100,
      pitchWarmth * 0.3 +
      volumeWarmth * 0.2 +
      variation * 0.3 +
      consistency * 0.2
    );
  }

  // NEW: Filler word detection and analysis
  private analyzeFillerWords(transcript: string, duration: number): AudioFeatures['filler_words'] {
    const text = transcript.toLowerCase();

    // Count different types of filler words
    const umUhRegex = /\b(um|uh|umm|uhh|er|err|ah)\b/g;
    const likeRegex = /\b(like)\b/g;
    const youKnowRegex = /\b(you know|y'know)\b/g;
    const basicallyRegex = /\b(basically|actually|literally)\b/g;
    const soRegex = /\b(so)\b/g; // At start of sentences or repeated

    const umUhMatches = text.match(umUhRegex) || [];
    const likeMatches = text.match(likeRegex) || [];
    const youKnowMatches = text.match(youKnowRegex) || [];
    const basicallyMatches = text.match(basicallyRegex) || [];
    const soMatches = text.match(soRegex) || [];

    // Filter "like" to only count filler usage (rough heuristic)
    const likeFillerCount = Math.floor(likeMatches.length * 0.6); // Assume 60% are filler
    const soFillerCount = Math.floor(soMatches.length * 0.4); // Assume 40% are filler (start of sentence)

    const umUhCount = umUhMatches.length;
    const youKnowCount = youKnowMatches.length;
    const basicallyCount = basicallyMatches.length;

    const totalCount = umUhCount + likeFillerCount + youKnowCount + basicallyCount + soFillerCount;
    const durationMinutes = Math.max(0.1, duration / 60);
    const fillerRate = totalCount / durationMinutes;

    // Determine most common filler
    const fillerCounts = {
      'um/uh': umUhCount,
      'like': likeFillerCount,
      'you know': youKnowCount,
      'basically/actually': basicallyCount,
      'so': soFillerCount,
    };
    const mostCommon = Object.entries(fillerCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    return {
      total_count: totalCount,
      um_uh_count: umUhCount,
      like_count: likeFillerCount,
      you_know_count: youKnowCount,
      basically_count: basicallyCount,
      so_count: soFillerCount,
      other_count: 0,
      filler_rate: Math.round(fillerRate * 10) / 10,
      most_common: totalCount > 0 ? mostCommon : 'none',
    };
  }

  // NEW: Vocal quality descriptors
  private analyzeVocalQualities(
    pitch: AudioFeatures['pitch'],
    volume: AudioFeatures['volume'],
    emotional: AudioFeatures['emotional_markers']
  ): AudioFeatures['vocal_qualities'] {
    // Tone description
    let toneDescription: string;
    if (emotional.warmth > 70) toneDescription = 'warm and engaging';
    else if (emotional.warmth > 50) toneDescription = 'pleasant and approachable';
    else if (emotional.warmth > 30) toneDescription = 'neutral and professional';
    else if (emotional.warmth > 15) toneDescription = 'cool and detached';
    else toneDescription = 'cold and distant';

    // Strength level
    let strengthLevel: string;
    const strength = (volume.average * 1000 + emotional.confidence_level) / 2;
    if (strength > 75) strengthLevel = 'powerful and commanding';
    else if (strength > 60) strengthLevel = 'strong and assertive';
    else if (strength > 40) strengthLevel = 'moderate and balanced';
    else if (strength > 25) strengthLevel = 'soft and gentle';
    else strengthLevel = 'weak and hesitant';

    // Authority level
    let authorityLevel: string;
    if (emotional.authority > 80) authorityLevel = 'highly commanding';
    else if (emotional.authority > 65) authorityLevel = 'authoritative and confident';
    else if (emotional.authority > 50) authorityLevel = 'confident and capable';
    else if (emotional.authority > 35) authorityLevel = 'somewhat uncertain';
    else authorityLevel = 'tentative and unsure';

    // Richness (based on spectral qualities and resonance)
    let richness: string;
    const resonance = pitch.mean < 160 ? 80 : Math.max(0, 100 - (pitch.mean - 160) / 2);
    if (resonance > 70) richness = 'rich and resonant';
    else if (resonance > 50) richness = 'full and well-rounded';
    else if (resonance > 30) richness = 'moderate depth';
    else richness = 'thin and reedy';

    // Steadiness
    let steadiness: string;
    const steadyScore = (volume.consistency + (100 - pitch.monotoneScore) + (100 - emotional.nervousness)) / 3;
    if (steadyScore > 75) steadiness = 'rock-solid and controlled';
    else if (steadyScore > 60) steadiness = 'steady and reliable';
    else if (steadyScore > 45) steadiness = 'moderately stable';
    else if (steadyScore > 30) steadiness = 'somewhat uneven';
    else steadiness = 'shaky and unstable';

    return {
      tone_description: toneDescription,
      strength_level: strengthLevel,
      authority_level: authorityLevel,
      richness: richness,
      steadiness: steadiness,
    };
  }

  generateVocalDeliveryInsights(features: AudioFeatures): VocalDeliveryInsights {
    const strengths: string[] = [];
    const improvementAreas: string[] = [];
    const recommendations: string[] = [];
    const coachingTips: string[] = [];

    // === VOCAL QUALITY DESCRIPTORS (Always include) ===
    strengths.push(`Your voice is ${features.vocal_qualities.tone_description} with ${features.vocal_qualities.richness}`);
    strengths.push(`Vocal strength: ${features.vocal_qualities.strength_level}`);
    strengths.push(`Authority level: ${features.vocal_qualities.authority_level}`);
    strengths.push(`Voice steadiness: ${features.vocal_qualities.steadiness}`);

    // === AUTHORITY & CREDIBILITY ANALYSIS ===
    if (features.emotional_markers.authority > 70) {
      strengths.push(`🎯 Strong vocal authority (${features.emotional_markers.authority.toFixed(0)}%) - Your voice commands attention and respect`);
      coachingTips.push('Continue to project confidence and maintain your commanding presence');
    } else if (features.emotional_markers.authority > 50) {
      improvementAreas.push(`⚡ Moderate authority (${features.emotional_markers.authority.toFixed(0)}%) - You sound capable but could be more commanding`);
      recommendations.push('Lower your pitch slightly and speak with more deliberate pacing to increase authority');
      coachingTips.push('Practice power poses before presenting to naturally boost your vocal authority');
    } else {
      improvementAreas.push(`❌ Low vocal authority (${features.emotional_markers.authority.toFixed(0)}%) - Your voice lacks command and assertiveness`);
      recommendations.push('Work on projecting confidence through deeper breathing and stronger volume');
      coachingTips.push('Record yourself and compare to authoritative speakers - note the difference in pace, pitch, and power');
    }

    if (features.emotional_markers.credibility > 70) {
      strengths.push(`✓ High credibility (${features.emotional_markers.credibility.toFixed(0)}%) - You sound believable and trustworthy`);
    } else if (features.emotional_markers.credibility > 50) {
      improvementAreas.push(`⚠ Moderate credibility (${features.emotional_markers.credibility.toFixed(0)}%) - Could sound more believable`);
      recommendations.push('Reduce vocal nervousness and maintain steadier pitch to increase believability');
      coachingTips.push('Speak as if you truly believe every word - authenticity builds credibility');
    } else {
      improvementAreas.push(`❌ Low credibility (${features.emotional_markers.credibility.toFixed(0)}%) - Your voice undermines your message`);
      recommendations.push('Work on vocal authenticity and reducing signs of nervousness or uncertainty');
      coachingTips.push('Practice until you can deliver your pitch naturally without reading or memorizing');
    }

    if (features.emotional_markers.persuasiveness > 70) {
      strengths.push(`💪 Highly persuasive (${features.emotional_markers.persuasiveness.toFixed(0)}%) - Your voice is convincing and compelling`);
    } else {
      improvementAreas.push(`📉 Limited persuasiveness (${features.emotional_markers.persuasiveness.toFixed(0)}%) - Your delivery lacks convincing power`);
      recommendations.push('Combine vocal authority with authentic credibility to become more persuasive');
      coachingTips.push('Watch and study TED Talks - note how great speakers use vocal variety to persuade');
    }

    // === FILLER WORDS ANALYSIS ===
    if (features.filler_words.total_count === 0) {
      strengths.push('🌟 Excellent - No filler words detected! Your speech is clean and professional');
    } else if (features.filler_words.filler_rate < 2) {
      strengths.push(`✓ Good filler word control - ${features.filler_words.total_count} fillers (${features.filler_words.filler_rate} per minute)`);
    } else if (features.filler_words.filler_rate < 5) {
      improvementAreas.push(`⚠ Moderate filler word usage - ${features.filler_words.total_count} total (${features.filler_words.filler_rate} per minute)`);
      improvementAreas.push(`Most common filler: "${features.filler_words.most_common}" - Work on eliminating this habit`);
      if (features.filler_words.um_uh_count > 0) {
        recommendations.push(`Reduce "um/uh" (${features.filler_words.um_uh_count} times) - Replace with brief pauses instead`);
      }
      if (features.filler_words.like_count > 0) {
        recommendations.push(`Reduce "like" as filler (${features.filler_words.like_count} times) - Be more deliberate with word choice`);
      }
      if (features.filler_words.you_know_count > 0) {
        recommendations.push(`Eliminate "you know" (${features.filler_words.you_know_count} times) - Trust that your audience is following along`);
      }
      coachingTips.push('Pause instead of using filler words - silence is more powerful than "um"');
    } else {
      improvementAreas.push(`❌ High filler word usage - ${features.filler_words.total_count} total (${features.filler_words.filler_rate} per minute) - This seriously undermines your credibility`);
      improvementAreas.push(`Biggest culprit: "${features.filler_words.most_common}" - Eliminate this immediately`);
      recommendations.push('Practice slowing down and pausing instead of using fillers');
      recommendations.push('Record yourself and count fillers - awareness is the first step to elimination');
      coachingTips.push('Use the "pause button" technique - physically pause when you feel a filler word coming');
      coachingTips.push('Practice your pitch until you can deliver it with zero filler words');
    }

    // === SPEAKING PACE ===
    if (features.rhythm.speaking_rate >= 140 && features.rhythm.speaking_rate <= 160) {
      strengths.push(`✓ Optimal speaking pace (${features.rhythm.speaking_rate.toFixed(0)} WPM) - Perfect for audience engagement`);
    } else if (features.rhythm.speaking_rate < 120) {
      improvementAreas.push(`🐌 Too slow (${features.rhythm.speaking_rate.toFixed(0)} WPM) - You risk losing your audience's attention`);
      recommendations.push('Speed up to 140-160 words per minute for optimal engagement');
      coachingTips.push('Practice with a timer - aim for 2.5 words per second');
    } else if (features.rhythm.speaking_rate < 140) {
      improvementAreas.push(`⚠ Slightly slow (${features.rhythm.speaking_rate.toFixed(0)} WPM) - Could be more energetic`);
      recommendations.push('Increase pace slightly while maintaining clarity');
    } else if (features.rhythm.speaking_rate <= 180) {
      improvementAreas.push(`⚠ Slightly fast (${features.rhythm.speaking_rate.toFixed(0)} WPM) - Slow down for better comprehension`);
      recommendations.push('Add more strategic pauses to improve pacing');
    } else {
      improvementAreas.push(`🏃 Too fast (${features.rhythm.speaking_rate.toFixed(0)} WPM) - You're rushing and losing clarity`);
      recommendations.push('Slow down significantly - take deliberate pauses between key points');
      coachingTips.push('Use pauses as emphasis - great speakers let important points breathe');
    }

    // === VOLUME & PROJECTION ===
    const volumePercent = Math.round(features.volume.average * 1000);
    if (volumePercent > 60) {
      strengths.push(`✓ Strong vocal projection (${volumePercent}%) - You can be heard clearly`);
    } else if (volumePercent > 40) {
      improvementAreas.push(`⚠ Moderate volume (${volumePercent}%) - Could project more strongly`);
      recommendations.push('Speak from your diaphragm to increase natural projection');
      coachingTips.push('Imagine speaking to the back of a large room');
    } else {
      improvementAreas.push(`❌ Weak projection (${volumePercent}%) - Your voice lacks power and presence`);
      recommendations.push('Work on breath support and diaphragmatic breathing for stronger projection');
      coachingTips.push('Practice vocal exercises to build strength: sustained "ah" sounds at increasing volumes');
    }

    if (features.volume.consistency > 75) {
      strengths.push(`✓ Excellent volume control - Your voice is steady and consistent`);
    } else if (features.volume.consistency < 50) {
      improvementAreas.push(`⚠ Inconsistent volume - Your voice fluctuates too much`);
      recommendations.push('Practice maintaining steady vocal energy throughout your delivery');
      coachingTips.push('Mark your script with energy levels to maintain consistency');
    }

    // === PITCH & VOCAL VARIETY ===
    if (features.pitch.monotoneScore < 30) {
      strengths.push(`✓ Great vocal variety - Your pitch variation keeps listeners engaged`);
    } else if (features.pitch.monotoneScore < 50) {
      improvementAreas.push(`⚠ Limited vocal variety - Add more pitch variation for emphasis`);
      recommendations.push('Emphasize key words by varying your pitch');
      coachingTips.push('Go UP on important new ideas, DOWN on conclusions');
    } else {
      improvementAreas.push(`❌ Monotone delivery (${features.pitch.monotoneScore.toFixed(0)}%) - Your voice lacks emotional expression`);
      recommendations.push('Practice adding dramatic pitch changes to emphasize key points');
      coachingTips.push('Read children\'s books aloud with exaggerated expression to develop vocal variety');
    }

    // === CONFIDENCE & NERVOUSNESS ===
    if (features.emotional_markers.confidence_level > 80) {
      strengths.push(`💪 Strong confidence (${features.emotional_markers.confidence_level.toFixed(0)}%) - You sound self-assured`);
    } else if (features.emotional_markers.confidence_level > 60) {
      improvementAreas.push(`⚠ Moderate confidence (${features.emotional_markers.confidence_level.toFixed(0)}%) - Could sound more self-assured`);
      recommendations.push('Practice until mastery - confidence comes from preparation');
    } else {
      improvementAreas.push(`❌ Low confidence (${features.emotional_markers.confidence_level.toFixed(0)}%) - Your voice reveals uncertainty`);
      recommendations.push('Work on building genuine confidence through thorough preparation and practice');
      coachingTips.push('Do power poses for 2 minutes before presenting - it genuinely boosts confidence');
    }

    if (features.emotional_markers.nervousness > 60) {
      improvementAreas.push(`😰 High nervousness detected (${features.emotional_markers.nervousness.toFixed(0)}%) - Your voice reveals anxiety`);
      recommendations.push('Practice relaxation breathing: 4 seconds in, hold 4, out 4, hold 4');
      coachingTips.push('Reframe nervousness as excitement - they feel the same physiologically');
    }

    if (features.emotional_markers.stress_level > 60) {
      improvementAreas.push(`⚠ Vocal stress indicators present (${features.emotional_markers.stress_level.toFixed(0)}%)`);
      recommendations.push('Focus on breath control and speaking from a relaxed state');
      coachingTips.push('Drop your shoulders, relax your jaw, and breathe deeply before speaking');
    }

    // === VOICE QUALITY ISSUES ===
    if (features.voice_quality.voice_breaks > 5) {
      improvementAreas.push(`❌ Frequent voice breaks (${features.voice_quality.voice_breaks}) - Indicates poor breath support`);
      recommendations.push('Work with a voice coach on breath support exercises');
      coachingTips.push('Warm up your voice: humming, lip trills, sirens from low to high pitch');
    }

    // === AUTHENTICITY & WARMTH ===
    if (features.emotional_markers.authenticity > 70) {
      strengths.push(`✓ Authentic delivery (${features.emotional_markers.authenticity.toFixed(0)}%) - You sound genuine and real`);
    } else {
      improvementAreas.push(`⚠ Limited authenticity (${features.emotional_markers.authenticity.toFixed(0)}%) - Work on sounding more natural`);
      recommendations.push('Speak conversationally - imagine talking to a friend, not performing');
    }

    if (features.emotional_markers.warmth > 60) {
      strengths.push(`😊 Warm and approachable voice (${features.emotional_markers.warmth.toFixed(0)}%)`);
    } else if (features.emotional_markers.warmth < 40) {
      improvementAreas.push(`❄️ Cold vocal tone (${features.emotional_markers.warmth.toFixed(0)}%) - Could be more personable`);
      recommendations.push('Add warmth by smiling while speaking - it genuinely affects your tone');
      coachingTips.push('Think of someone you care about while delivering your pitch');
    }

    // Calculate professional score
    const professionalScore = Math.round(
      (features.coaching_metrics.clarity_score +
        features.coaching_metrics.articulation_score +
        features.emotional_markers.authority +
        features.emotional_markers.credibility +
        features.emotional_markers.persuasiveness +
        (100 - Math.min(100, features.filler_words.filler_rate * 20))) / 6
    );

    // Add summary coaching tip
    coachingTips.push('🎯 Focus Area: Work on your top 1-2 weaknesses first for maximum impact');
    coachingTips.push('📹 Record and review: Film yourself weekly to track improvement');

    return {
      strengths,
      improvement_areas: improvementAreas,
      specific_recommendations: recommendations,
      coaching_tips: coachingTips,
      professional_score: professionalScore,
    };
  }
}

export const createAudioAnalysisEngine = (): AudioAnalysisEngine => {
  return new AudioAnalysisEngine();
};
