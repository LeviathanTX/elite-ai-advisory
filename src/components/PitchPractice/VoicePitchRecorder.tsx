import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Clock, RotateCcw } from 'lucide-react';
import { cn } from '../../utils';
import {
  createAudioAnalysisEngine,
  AudioFeatures,
  VocalDeliveryInsights,
} from '../../services/AudioAnalysisEngine';
import RealTimeAudioFeedback from '../Audio/RealTimeAudioFeedback';
import { LiveCoachingChart } from '../Charts/LiveCoachingChart';

export interface PitchRecordingResult {
  audioBlob: Blob;
  audioUrl: string;
  transcript: string;
  duration: number;
  audioFeatures: AudioFeatures | null;
  vocalInsights: VocalDeliveryInsights | null;
  timestampedMetrics: any[];
}

interface VoicePitchRecorderProps {
  onRecordingComplete: (result: PitchRecordingResult) => void;
  onCancel?: () => void;
  maxDuration?: number; // in minutes, default 5
  disabled?: boolean;
}

export const VoicePitchRecorder: React.FC<VoicePitchRecorderProps> = ({
  onRecordingComplete,
  onCancel,
  maxDuration = 5,
  disabled = false,
}) => {
  // Recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [pitchDuration, setPitchDuration] = useState(maxDuration);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Speech analysis states
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Professional audio analysis
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  const [vocalInsights, setVocalInsights] = useState<VocalDeliveryInsights | null>(null);
  const [audioAnalysisEngine, setAudioAnalysisEngine] = useState<any>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);

  // Live coaching metrics
  const [liveMetrics, setLiveMetrics] = useState<
    Array<{
      timestamp: number;
      confidence: number;
      pace: number;
      volume: number;
      stress: number;
      energy: number;
    }>
  >([]);
  const [realTimeMetrics, setRealTimeMetrics] = useState<any>(null);
  const [timestampedMetrics, setTimestampedMetrics] = useState<any[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // Refs
  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize audio analysis engine
  useEffect(() => {
    const engine = createAudioAnalysisEngine();
    setAudioAnalysisEngine(engine);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }

        if (finalTranscript) {
          setSpeechTranscript(prev => prev + finalTranscript + ' ');
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          setIsTranscribing(false);
        }
      };

      recognition.onend = () => {
        setIsTranscribing(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (pitchTimerRef.current) clearInterval(pitchTimerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Handle real-time metrics updates
  const handleRealTimeMetricsUpdate = (metrics: any) => {
    setRealTimeMetrics(metrics);

    if (recordingStartTime && isRecording) {
      const timestamp = Date.now() - recordingStartTime;
      const timestampedMetric = {
        ...metrics,
        timestamp,
        timeInSeconds: timestamp / 1000,
      };

      setTimestampedMetrics(prev => [...prev, timestampedMetric]);

      const chartMetric = {
        timestamp: timestamp / 1000,
        confidence: metrics.confidenceLevel || 50,
        pace: Math.min(100, Math.max(0, (metrics.currentPace - 120) / 2 + 50)),
        volume: Math.min(100, metrics.volumeLevel * 100),
        stress: 100 - (metrics.stressLevel || 50),
        energy: metrics.energyLevel || 50,
      };

      setLiveMetrics(prev => [...prev.slice(-200), chartMetric]);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });

      streamRef.current = stream;

      // Initialize audio context for real-time analysis
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();

      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);

      setAudioContext(audioCtx);
      setAnalyserNode(analyser);

      // Start professional audio analysis
      if (audioAnalysisEngine) {
        await audioAnalysisEngine.startAnalysis(stream);
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = event => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecordedAudio(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());

        // Stop audio analysis
        if (audioAnalysisEngine) {
          audioAnalysisEngine.stopAnalysis();
        }

        // Generate comprehensive audio analysis
        if (audioAnalysisEngine) {
          setIsProcessingAudio(true);
          try {
            const transcriptText = speechTranscript || 'Voice pitch recorded without transcript';
            const features = await audioAnalysisEngine.generateComprehensiveAnalysis(
              transcriptText,
              recordingTime
            );
            const insights = audioAnalysisEngine.generateVocalDeliveryInsights(features);
            setAudioFeatures(features);
            setVocalInsights(insights);
          } catch (error) {
            console.error('Audio analysis failed:', error);
            setAudioFeatures(null);
            setVocalInsights(null);
          } finally {
            setIsProcessingAudio(false);
          }
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTimeRemaining(pitchDuration * 60);
      setSpeechTranscript('');
      setAudioFeatures(null);
      setLiveMetrics([]);
      setVocalInsights(null);
      setRecordedAudio(null);
      setAudioUrl('');

      const startTime = Date.now();
      setRecordingStartTime(startTime);
      setTimestampedMetrics([]);

      // Start speech recognition
      if (recognitionRef.current) {
        setIsTranscribing(true);
        recognitionRef.current.start();
      }

      // Start recording timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Start pitch countdown timer
      pitchTimerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please ensure microphone permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (recognitionRef.current && isTranscribing) {
        recognitionRef.current.stop();
        setIsTranscribing(false);
      }

      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      if (pitchTimerRef.current) {
        clearInterval(pitchTimerRef.current);
      }
    }
  };

  const resetRecording = () => {
    setRecordedAudio(null);
    setAudioUrl('');
    setRecordingTime(0);
    setSpeechTranscript('');
    setAudioFeatures(null);
    setVocalInsights(null);
    setLiveMetrics([]);
    setTimestampedMetrics([]);
  };

  const handleSubmit = () => {
    if (recordedAudio && audioUrl) {
      onRecordingComplete({
        audioBlob: recordedAudio,
        audioUrl,
        transcript: speechTranscript,
        duration: recordingTime,
        audioFeatures,
        vocalInsights,
        timestampedMetrics,
      });
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Voice Pitch Recording</h3>
        <p className="text-gray-600 text-sm">
          Record your pitch and get AI-powered feedback from your selected advisors
        </p>
      </div>

      {/* Timer Duration Selector (before recording) */}
      {!isRecording && !recordedAudio && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock className="w-4 h-4 inline mr-1" />
            Pitch Duration
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="20"
              value={pitchDuration}
              onChange={(e) => setPitchDuration(parseInt(e.target.value))}
              className="flex-1"
              disabled={disabled}
            />
            <span className="text-sm font-medium text-gray-900 w-16">
              {pitchDuration} min
            </span>
          </div>
        </div>
      )}

      {/* Recording Interface */}
      <div className="flex flex-col items-center">
        {/* Recording Status */}
        {isRecording && (
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center space-x-2 text-red-600 mb-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              <span className="font-medium">Recording in Progress</span>
            </div>
            <div className="text-3xl font-mono font-bold text-gray-900">
              {formatTime(recordingTime)}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              Time remaining: {formatTime(timeRemaining)}
            </div>
          </div>
        )}

        {/* Real-time Audio Feedback (during recording) */}
        {isRecording && analyserNode && audioContext && (
          <div className="w-full mb-4">
            <RealTimeAudioFeedback
              isRecording={isRecording}
              audioContext={audioContext}
              analyserNode={analyserNode}
              onMetricsUpdate={handleRealTimeMetricsUpdate}
            />
          </div>
        )}

        {/* Live Coaching Chart (during recording) */}
        {isRecording && liveMetrics.length > 5 && (
          <div className="w-full mb-4">
            <LiveCoachingChart data={liveMetrics} isRecording={isRecording} duration={recordingTime} />
          </div>
        )}

        {/* Recording Controls */}
        {!recordedAudio && (
          <div className="flex items-center space-x-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                disabled={disabled}
                className={cn(
                  'flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all',
                  disabled
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-red-500 text-white hover:bg-red-600 hover:scale-105'
                )}
              >
                <Mic className="w-5 h-5" />
                <span>Start Recording</span>
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-900 transition-all"
              >
                <Square className="w-5 h-5" />
                <span>Stop Recording</span>
              </button>
            )}
          </div>
        )}

        {/* Processing indicator */}
        {isProcessingAudio && (
          <div className="mt-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Analyzing your pitch...</p>
          </div>
        )}

        {/* Recorded Audio Preview */}
        {recordedAudio && !isProcessingAudio && (
          <div className="w-full mt-4">
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-gray-900">Recording Complete</span>
                <span className="text-sm text-gray-500">{formatTime(recordingTime)}</span>
              </div>

              {/* Audio Player */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={togglePlayback}
                  className="p-2 bg-purple-100 text-purple-600 rounded-full hover:bg-purple-200"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                </button>
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                <div className="flex-1 h-2 bg-gray-200 rounded-full">
                  <div className="h-2 bg-purple-500 rounded-full w-0" />
                </div>
              </div>

              {/* Transcript Preview */}
              {speechTranscript && (
                <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                  <p className="text-xs text-gray-500 mb-1">Transcript</p>
                  <p className="text-sm text-gray-700 line-clamp-3">{speechTranscript}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center space-x-3">
              <button
                onClick={resetRecording}
                className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-record</span>
              </button>
              <button
                onClick={handleSubmit}
                className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
              >
                <span>Get AI Feedback</span>
              </button>
            </div>
          </div>
        )}

        {/* Cancel button */}
        {onCancel && !isRecording && (
          <button
            onClick={onCancel}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export default VoicePitchRecorder;
