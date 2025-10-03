import React, { useState, useEffect, useRef } from 'react';
import { cn } from '../../utils';

interface RealTimeMetrics {
  currentPace: number;
  volumeLevel: number;
  confidenceLevel: number;
  stressLevel: number;
  energyLevel: number;
  monotoneScore: number;
  recentFillerWords: number;
  currentPitch: number;
  speakingTime: number;
  pauseTime: number;
}

interface RealTimeAlert {
  type: 'warning' | 'tip' | 'success';
  message: string;
  timestamp: number;
}

interface RealTimeAudioFeedbackProps {
  isRecording: boolean;
  audioContext: AudioContext | null;
  analyserNode: AnalyserNode | null;
  onMetricsUpdate?: (metrics: RealTimeMetrics) => void;
}

export const RealTimeAudioFeedback: React.FC<RealTimeAudioFeedbackProps> = ({
  isRecording,
  audioContext,
  analyserNode,
  onMetricsUpdate
}) => {
  const [metrics, setMetrics] = useState<RealTimeMetrics>({
    currentPace: 0,
    volumeLevel: 0,
    confidenceLevel: 75,
    stressLevel: 30,
    energyLevel: 70,
    monotoneScore: 50,
    recentFillerWords: 0,
    currentPitch: 0,
    speakingTime: 0,
    pauseTime: 0
  });

  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  // Analysis buffers for real-time tracking
  const pitchHistoryRef = useRef<number[]>([]);
  const volumeHistoryRef = useRef<number[]>([]);
  const paceHistoryRef = useRef<number[]>([]);
  const analysisIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastAnalysisTimeRef = useRef<number>(0);

  useEffect(() => {
    if (isRecording && analyserNode) {
      startRealTimeAnalysis();
    } else {
      stopRealTimeAnalysis();
    }

    return () => stopRealTimeAnalysis();
  }, [isRecording, analyserNode]);

  const startRealTimeAnalysis = () => {
    if (!analyserNode) return;

    // Reset buffers
    pitchHistoryRef.current = [];
    volumeHistoryRef.current = [];
    paceHistoryRef.current = [];
    lastAnalysisTimeRef.current = Date.now();

    // Start real-time analysis loop
    analysisIntervalRef.current = setInterval(() => {
      if (!analyserNode) return;

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Float32Array(bufferLength);
      const timeArray = new Float32Array(bufferLength);

      analyserNode.getFloatFrequencyData(dataArray);
      analyserNode.getFloatTimeDomainData(timeArray);

      // Extract real-time features
      const currentPitch = extractPitch(timeArray);
      const currentVolume = calculateRMS(timeArray);
      const currentTime = Date.now();

      // Update history buffers (keep last 100 samples)
      if (currentPitch > 0) {
        pitchHistoryRef.current.push(currentPitch);
        if (pitchHistoryRef.current.length > 100) {
          pitchHistoryRef.current.shift();
        }
      }

      volumeHistoryRef.current.push(currentVolume);
      if (volumeHistoryRef.current.length > 100) {
        volumeHistoryRef.current.shift();
      }

      // Calculate real-time metrics
      const newMetrics = calculateRealTimeMetrics(currentPitch, currentVolume, currentTime);
      setMetrics(newMetrics);
      onMetricsUpdate?.(newMetrics);

      // Generate real-time alerts
      generateRealTimeAlerts(newMetrics);

    }, 200); // Update every 200ms for smooth real-time feedback
  };

  const stopRealTimeAnalysis = () => {
    if (analysisIntervalRef.current) {
      clearInterval(analysisIntervalRef.current);
      analysisIntervalRef.current = null;
    }
  };

  const extractPitch = (timeData: Float32Array): number => {
    // Simplified autocorrelation pitch detection
    const sampleRate = 44100;
    let maxCorrelation = 0;
    let bestPeriod = 0;

    for (let period = 20; period < timeData.length / 4; period++) {
      let correlation = 0;
      for (let i = 0; i < timeData.length - period; i++) {
        correlation += timeData[i] * timeData[i + period];
      }

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  };

  const calculateRMS = (timeData: Float32Array): number => {
    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      sum += timeData[i] * timeData[i];
    }
    return Math.sqrt(sum / timeData.length);
  };

  const calculateRealTimeMetrics = (currentPitch: number, currentVolume: number, currentTime: number): RealTimeMetrics => {
    const timeElapsed = (currentTime - lastAnalysisTimeRef.current) / 1000;

    // Calculate current pace (simplified estimation)
    const currentPace = paceHistoryRef.current.length > 0 ?
      paceHistoryRef.current.reduce((a, b) => a + b, 0) / paceHistoryRef.current.length : 140;

    // Calculate volume level (normalized)
    const volumeLevel = Math.min(100, currentVolume * 1000);

    // Calculate pitch-based metrics
    const pitchVariance = pitchHistoryRef.current.length > 1 ?
      pitchHistoryRef.current.reduce((sum, p, i, arr) => {
        const mean = arr.reduce((a, b) => a + b) / arr.length;
        return sum + Math.pow(p - mean, 2);
      }, 0) / pitchHistoryRef.current.length : 0;

    const monotoneScore = Math.min(100, Math.max(0, 100 - (pitchVariance / 1000) * 100));

    // Calculate confidence based on volume consistency and pitch control
    const volumeConsistency = volumeHistoryRef.current.length > 1 ?
      100 - (volumeHistoryRef.current.reduce((sum, v, i, arr) => {
        const mean = arr.reduce((a, b) => a + b) / arr.length;
        return sum + Math.pow(v - mean, 2);
      }, 0) / volumeHistoryRef.current.length) * 1000 : 75;

    const confidenceLevel = Math.min(100, Math.max(30, (volumeConsistency + (100 - monotoneScore)) / 2));

    // Calculate stress level (higher pitch variance + volume inconsistency = stress)
    const stressLevel = Math.min(100, Math.max(0, monotoneScore / 2 + (100 - volumeConsistency) / 2));

    // Calculate energy level (volume + pitch activity)
    const energyLevel = Math.min(100, Math.max(20, volumeLevel + (100 - monotoneScore) / 2));

    return {
      currentPace,
      volumeLevel,
      confidenceLevel,
      stressLevel,
      energyLevel,
      monotoneScore,
      recentFillerWords: 0, // Would need speech recognition for this
      currentPitch,
      speakingTime: timeElapsed,
      pauseTime: 0
    };
  };

  const generateRealTimeAlerts = (currentMetrics: RealTimeMetrics) => {
    const newAlerts: RealTimeAlert[] = [];
    const now = Date.now();

    // Remove old alerts (keep for 5 seconds)
    setAlerts(prev => prev.filter(alert => now - alert.timestamp < 5000));

    // Pace alerts
    if (currentMetrics.currentPace > 180) {
      newAlerts.push({
        type: 'warning',
        message: 'Speaking too fast - slow down for clarity',
        timestamp: now
      });
    } else if (currentMetrics.currentPace < 100 && currentMetrics.currentPace > 0) {
      newAlerts.push({
        type: 'tip',
        message: 'Speaking pace is slow - try to increase energy',
        timestamp: now
      });
    } else if (currentMetrics.currentPace >= 140 && currentMetrics.currentPace <= 160) {
      newAlerts.push({
        type: 'success',
        message: 'Perfect speaking pace!',
        timestamp: now
      });
    }

    // Volume alerts
    if (currentMetrics.volumeLevel < 20) {
      newAlerts.push({
        type: 'warning',
        message: 'Speak louder - project your voice more',
        timestamp: now
      });
    } else if (currentMetrics.volumeLevel > 80) {
      newAlerts.push({
        type: 'warning',
        message: 'Volume is very high - moderate your voice',
        timestamp: now
      });
    }

    // Monotone alerts
    if (currentMetrics.monotoneScore > 80) {
      newAlerts.push({
        type: 'tip',
        message: 'Add vocal variety - vary your pitch and tone',
        timestamp: now
      });
    } else if (currentMetrics.monotoneScore < 30) {
      newAlerts.push({
        type: 'success',
        message: 'Great vocal variety!',
        timestamp: now
      });
    }

    // Stress alerts
    if (currentMetrics.stressLevel > 70) {
      newAlerts.push({
        type: 'tip',
        message: 'Take a deep breath - you sound stressed',
        timestamp: now
      });
    }

    // Confidence alerts
    if (currentMetrics.confidenceLevel > 85) {
      newAlerts.push({
        type: 'success',
        message: 'Strong confident delivery!',
        timestamp: now
      });
    } else if (currentMetrics.confidenceLevel < 50) {
      newAlerts.push({
        type: 'tip',
        message: 'Project more confidence in your voice',
        timestamp: now
      });
    }

    // Add new unique alerts
    newAlerts.forEach(newAlert => {
      setAlerts(prev => {
        // Check if similar alert exists recently
        const hasRecent = prev.some(alert =>
          alert.message === newAlert.message &&
          now - alert.timestamp < 3000
        );

        if (!hasRecent) {
          return [...prev, newAlert];
        }
        return prev;
      });
    });
  };

  const getMetricColor = (value: number, ideal: [number, number], reverse: boolean = false) => {
    const [min, max] = ideal;
    const isInIdeal = value >= min && value <= max;

    if (isInIdeal) return 'text-green-600';
    if (reverse) {
      return value > max ? 'text-red-600' : 'text-yellow-600';
    } else {
      return value < min ? 'text-red-600' : 'text-yellow-600';
    }
  };

  const getAlertIcon = (type: RealTimeAlert['type']) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'tip': return '💡';
      default: return 'ℹ️';
    }
  };

  const getAlertColor = (type: RealTimeAlert['type']) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-300 text-green-800';
      case 'warning': return 'bg-red-100 border-red-300 text-red-800';
      case 'tip': return 'bg-blue-100 border-blue-300 text-blue-800';
      default: return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  if (!isRecording) return null;

  return (
    <div className={cn(
      "fixed right-4 top-20 w-80 z-50 transition-all duration-300",
      isVisible ? "translate-x-0" : "translate-x-full"
    )}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="absolute -left-8 top-4 bg-purple-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-purple-700 transition-colors"
        title={isVisible ? "Hide feedback" : "Show feedback"}
      >
        {isVisible ? '→' : '←'}
      </button>

      {/* Main Panel */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Live Coaching</h3>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
            <span className="text-xs text-gray-500">Real-time</span>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Speaking Pace</span>
            <span className={cn(
              "text-sm font-medium",
              getMetricColor(metrics.currentPace, [140, 160])
            )}>
              {metrics.currentPace.toFixed(0)} WPM
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Confidence</span>
            <span className={cn(
              "text-sm font-medium",
              getMetricColor(metrics.confidenceLevel, [70, 100])
            )}>
              {metrics.confidenceLevel.toFixed(0)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Energy Level</span>
            <span className={cn(
              "text-sm font-medium",
              getMetricColor(metrics.energyLevel, [60, 90])
            )}>
              {metrics.energyLevel.toFixed(0)}%
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Vocal Variety</span>
            <span className={cn(
              "text-sm font-medium",
              getMetricColor(metrics.monotoneScore, [20, 50], true)
            )}>
              {metrics.monotoneScore > 70 ? 'Low' : metrics.monotoneScore < 30 ? 'High' : 'Good'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Stress Level</span>
            <span className={cn(
              "text-sm font-medium",
              getMetricColor(metrics.stressLevel, [0, 40], true)
            )}>
              {metrics.stressLevel.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Volume Level Indicator */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm text-gray-600">Volume</span>
            <span className="text-xs text-gray-500">
              {metrics.volumeLevel < 20 ? 'Too quiet' :
               metrics.volumeLevel > 80 ? 'Too loud' : 'Good'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-200",
                metrics.volumeLevel < 20 ? "bg-red-500" :
                metrics.volumeLevel > 80 ? "bg-red-500" :
                metrics.volumeLevel > 40 ? "bg-green-500" : "bg-yellow-500"
              )}
              style={{ width: `${Math.min(100, metrics.volumeLevel)}%` }}
            />
          </div>
        </div>

        {/* Real-time Alerts */}
        <div className="space-y-2">
          {alerts.slice(-3).map((alert, index) => (
            <div
              key={`${alert.timestamp}-${index}`}
              className={cn(
                "p-2 rounded-lg border text-xs animate-fade-in",
                getAlertColor(alert.type)
              )}
            >
              <div className="flex items-start">
                <span className="mr-2">{getAlertIcon(alert.type)}</span>
                <span>{alert.message}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Tips */}
        <div className="mt-4 p-3 bg-purple-50 rounded-lg">
          <h4 className="text-xs font-medium text-purple-900 mb-2">Quick Tips</h4>
          <ul className="text-xs text-purple-800 space-y-1">
            <li>• Aim for 140-160 words per minute</li>
            <li>• Vary your pitch to avoid monotone</li>
            <li>• Project confidence through clear articulation</li>
            <li>• Use strategic pauses for emphasis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RealTimeAudioFeedback;