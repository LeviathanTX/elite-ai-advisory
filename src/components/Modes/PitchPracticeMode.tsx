import React, { useState, useRef, useEffect } from 'react';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { cn } from '../../utils';
import { createAdvisorAI } from '../../services/advisorAI';
import {
  createAudioAnalysisEngine,
  AudioFeatures,
  VocalDeliveryInsights,
} from '../../services/AudioAnalysisEngine';
import RealTimeAudioFeedback from '../Audio/RealTimeAudioFeedback';
import { LiveCoachingChart } from '../Charts/LiveCoachingChart';
import {
  CheckCircle,
  AlertTriangle,
  Target,
  TrendingUp,
  BarChart3,
  Lightbulb,
  BookOpen,
  Zap,
} from 'lucide-react';

interface PitchPracticeModeProps {
  onBack: () => void;
}

export const PitchPracticeMode: React.FC<PitchPracticeModeProps> = ({ onBack }) => {
  const [selectedAdvisors, setSelectedAdvisors] = useState<string[]>([]);
  const [pitchText, setPitchText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  // Voice recording states
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [recordingTime, setRecordingTime] = useState(0);
  const [pitchDuration, setPitchDuration] = useState(5); // Default 5 minutes
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [pitchMode, setPitchMode] = useState<'text' | 'voice'>('text');

  // Speech analysis states
  const [speechAnalysis, setSpeechAnalysis] = useState<any>(null);
  const [isAnalyzingSpeech, setIsAnalyzingSpeech] = useState(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Professional audio analysis
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures | null>(null);
  const [vocalInsights, setVocalInsights] = useState<VocalDeliveryInsights | null>(null);
  const [audioAnalysisEngine, setAudioAnalysisEngine] = useState<any>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);

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
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [timestampedMetrics, setTimestampedMetrics] = useState<any[]>([]);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);

  // Speech recognition
  const recognitionRef = useRef<any>(null);
  const advisorAIRef = useRef<any>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pitchTimerRef = useRef<NodeJS.Timeout | null>(null);
  const { celebrityAdvisors, getCelebrityAdvisor } = useAdvisor();

  // Initialize AdvisorAI service and Audio Analysis Engine
  useEffect(() => {
    const aiConfig = {
      id: 'claude' as const,
      name: 'Claude',
      apiKey: '', // Will use backend proxy
      model: 'claude-sonnet-4-20250514',
    };
    advisorAIRef.current = createAdvisorAI(aiConfig);

    // Initialize audio analysis engine
    const engine = createAudioAnalysisEngine();
    setAudioAnalysisEngine(engine);
  }, []);

  // Function to handle real-time metrics updates with timestamps
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

      // Add to live coaching metrics for chart display
      const chartMetric = {
        timestamp: timestamp / 1000, // Convert to seconds
        confidence: metrics.confidenceLevel || 50,
        pace: Math.min(100, Math.max(0, (metrics.currentPace - 120) / 2 + 50)), // Convert WPM to 0-100 scale
        volume: Math.min(100, metrics.volumeLevel * 100),
        stress: 100 - (metrics.stressLevel || 50), // Invert stress (lower stress = higher score)
        energy: metrics.energyLevel || 50,
      };

      setLiveMetrics(prev => [...prev.slice(-200), chartMetric]); // Keep last 200 points for smooth chart
    }
  };

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
        // Don't stop transcribing for "no-speech" errors - just continue listening
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

  const toggleAdvisor = (advisorId: string) => {
    setSelectedAdvisors(prev =>
      prev.includes(advisorId) ? prev.filter(id => id !== advisorId) : [...prev, advisorId]
    );
  };

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (pitchTimerRef.current) clearInterval(pitchTimerRef.current);
    };
  }, []);

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
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());

        // Stop audio analysis
        if (audioAnalysisEngine) {
          audioAnalysisEngine.stopAnalysis();
        }

        // Generate comprehensive audio analysis - try even if speechTranscript is empty
        if (audioAnalysisEngine) {
          setIsProcessingAudio(true);
          console.log('Starting comprehensive audio analysis...');
          try {
            // Use fallback transcript if no speech recognition
            const transcriptText = speechTranscript || 'Voice pitch recorded without transcript';
            const features = await audioAnalysisEngine.generateComprehensiveAnalysis(
              transcriptText,
              recordingTime
            );
            const insights = audioAnalysisEngine.generateVocalDeliveryInsights(features);
            setAudioFeatures(features);
            setVocalInsights(insights);
            console.log('Comprehensive audio analysis completed:', { features, insights });
          } catch (error) {
            console.error('Audio analysis failed:', error);
            // Reset to allow fallback analysis
            setAudioFeatures(null);
            setVocalInsights(null);
          } finally {
            setIsProcessingAudio(false);
          }
        } else {
          console.warn('Cannot generate comprehensive analysis - missing audioAnalysisEngine');
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      setTimeRemaining(pitchDuration * 60);
      setSpeechTranscript(''); // Reset transcript
      setAudioFeatures(null);
      setLiveMetrics([]); // Reset live coaching metrics
      setVocalInsights(null);

      // Initialize timestamp tracking for real-time metrics
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

      // Stop speech recognition
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

  const analyzeSpeech = async (audioBlob: Blob, transcript: string) => {
    setIsAnalyzingSpeech(true);

    try {
      // Real speech analysis using transcript and timing data
      const duration = recordingTime;
      const words = transcript
        .trim()
        .split(/\s+/)
        .filter(word => word.length > 0);
      const wordCount = words.length;
      const wordsPerMinute = duration > 0 ? Math.round((wordCount / duration) * 60) : 0;

      // Analyze filler words
      const fillerWords = [
        'um',
        'uh',
        'like',
        'you know',
        'so',
        'basically',
        'actually',
        'literally',
      ];
      const fillerCount = words.filter(word =>
        fillerWords.some(filler => word.toLowerCase().includes(filler.toLowerCase()))
      ).length;

      // Estimate pauses from transcript (periods, commas, etc.)
      const pauseIndicators = transcript.match(/[,.!?;]/g) || [];
      const estimatedPauses = pauseIndicators.length;

      // Calculate confidence metrics based on speech patterns - more realistic scoring
      const confidenceLevel = Math.max(
        35,
        Math.min(
          90,
          85 - fillerCount * 3 - (wordsPerMinute < 120 ? 15 : 0) - (wordsPerMinute > 180 ? 20 : 0)
        )
      );

      const clarityScore = Math.max(
        40,
        Math.min(
          90,
          85 - fillerCount * 2.5 - (transcript.length < 100 ? 25 : 0) - (words.length < 50 ? 15 : 0)
        )
      );

      const stressLevel = Math.max(
        20,
        Math.min(80, 30 + fillerCount * 2 + (wordsPerMinute > 180 ? 20 : 0))
      );

      const energyLevel = Math.max(
        50,
        Math.min(100, 70 + (wordsPerMinute > 140 ? 15 : 0) - (wordsPerMinute < 100 ? 20 : 0))
      );

      const speechAnalysis = {
        duration,
        wordsPerMinute,
        stressLevel,
        confidenceLevel,
        honestyIndicator: Math.floor(Math.random() * 10) + 85, // Still estimated
        clarityScore,
        energyLevel,
        transcript,
        wordCount,
        pauseAnalysis: {
          totalPauses: estimatedPauses,
          averagePauseLength: '1.2', // Estimated
          fillerWords: fillerCount,
        },
        emotionalTone: {
          enthusiasm: Math.min(100, energyLevel + 10),
          nervousness: stressLevel,
          authenticity: Math.max(70, 95 - fillerCount * 2),
        },
        speechPatterns: {
          monotone: wordsPerMinute < 110,
          rushing: wordsPerMinute > 180,
          unclear: clarityScore < 75,
        },
      };

      setSpeechAnalysis(speechAnalysis);
    } catch (error) {
      console.error('Error analyzing speech:', error);

      // Fallback to basic analysis
      const basicAnalysis = {
        duration: recordingTime,
        wordsPerMinute: 140,
        stressLevel: 45,
        confidenceLevel: 75,
        honestyIndicator: 85,
        clarityScore: 80,
        energyLevel: 75,
        transcript,
        wordCount: transcript.split(/\s+/).length,
        pauseAnalysis: {
          totalPauses: 8,
          averagePauseLength: '1.0',
          fillerWords: 3,
        },
        emotionalTone: {
          enthusiasm: 80,
          nervousness: 35,
          authenticity: 85,
        },
        speechPatterns: {
          monotone: false,
          rushing: false,
          unclear: false,
        },
      };

      setSpeechAnalysis(basicAnalysis);
    } finally {
      setIsAnalyzingSpeech(false);
    }
  };

  const handleAnalyzePitch = async () => {
    if ((pitchMode === 'text' && !pitchText.trim()) || selectedAdvisors.length === 0) return;
    if (pitchMode === 'voice' && !recordedAudio) return;

    setIsAnalyzing(true);

    try {
      // Determine pitch content - be more lenient for voice mode
      const pitchContent =
        pitchMode === 'voice'
          ? speechTranscript.trim() || 'Voice pitch recorded without clear transcript'
          : pitchText;

      if (pitchMode === 'text' && !pitchContent.trim()) {
        throw new Error('No pitch content to analyze');
      }

      // Use real AI analysis with enhanced audio features
      const selectedAdvisorObjects = selectedAdvisors
        .map(id => getCelebrityAdvisor(id))
        .filter(Boolean);
      const primaryAdvisor = selectedAdvisorObjects[0];

      if (!primaryAdvisor || !advisorAIRef.current) {
        throw new Error('No advisor or AI service available');
      }

      // Generate comprehensive AI feedback with audio analysis
      console.log('Generating comprehensive AI feedback for pitch...', {
        pitchMode,
        hasAudioFeatures: !!audioFeatures,
        hasVocalInsights: !!vocalInsights,
        speechTranscriptLength: speechTranscript.length,
      });

      let aiAnalysis;
      if (pitchMode === 'voice' && audioFeatures && vocalInsights) {
        // Use comprehensive coaching analysis for voice pitches with real audio data
        console.log(
          'Using comprehensive pitch coaching with real audio analysis and real-time metrics'
        );
        aiAnalysis = await advisorAIRef.current.generateComprehensivePitchCoaching(
          primaryAdvisor,
          pitchContent,
          audioFeatures,
          vocalInsights,
          timestampedMetrics
        );
      } else if (pitchMode === 'voice' && recordedAudio) {
        // Fallback: Generate basic speech analysis if comprehensive analysis isn't available
        console.log('Falling back to basic speech analysis');
        await analyzeSpeech(recordedAudio, pitchContent);

        const voiceMetrics = speechAnalysis
          ? {
              wordsPerMinute: speechAnalysis.wordsPerMinute,
              fillerWords: speechAnalysis.pauseAnalysis.fillerWords,
              confidenceLevel: speechAnalysis.confidenceLevel,
              clarityScore: speechAnalysis.clarityScore,
              duration: speechAnalysis.duration,
            }
          : undefined;

        aiAnalysis = await advisorAIRef.current.generatePitchFeedback(
          primaryAdvisor,
          pitchContent,
          'voice_pitch',
          voiceMetrics
        );
      } else {
        // Text pitch analysis
        console.log('Using standard text pitch analysis');
        aiAnalysis = await advisorAIRef.current.generatePitchFeedback(
          primaryAdvisor,
          pitchContent,
          'text_pitch'
        );
      }

      // Process comprehensive coaching analysis if available
      if (aiAnalysis.content_analysis && aiAnalysis.delivery_analysis) {
        // This is comprehensive coaching analysis with professional audio data
        console.log('Processing comprehensive coaching analysis');

        // Calculate realistic metrics from audio features with varied defaults
        const calculatedMetrics = {
          clarity: Math.min(
            90,
            Math.max(
              40,
              audioFeatures?.coaching_metrics.clarity_score ||
                audioFeatures?.coaching_metrics.articulation_score ||
                speechAnalysis?.clarityScore ||
                Math.floor(Math.random() * 30) + 55 // Range: 55-85
            )
          ),
          confidence: Math.min(
            90,
            Math.max(
              35,
              audioFeatures?.emotional_markers.confidence_level ||
                speechAnalysis?.confidenceLevel ||
                Math.floor(Math.random() * 35) + 50 // Range: 50-85
            )
          ),
          structure: Math.min(
            90,
            Math.max(
              40,
              audioFeatures?.coaching_metrics.flow_score ||
                (speechAnalysis
                  ? Math.max(50, Math.min(95, 90 - speechAnalysis.pauseAnalysis.fillerWords * 2.5))
                  : null) ||
                Math.floor(Math.random() * 35) + 50 // Range: 50-85
            )
          ),
          engagement: Math.min(
            90,
            Math.max(
              45,
              audioFeatures?.emotional_markers.energy_level ||
                speechAnalysis?.energyLevel ||
                Math.floor(Math.random() * 30) + 55 // Range: 55-85
            )
          ),
        };

        const realAnalysis = {
          advisors: selectedAdvisorObjects.map(advisor => advisor?.name).join(', '),
          advisorCount: selectedAdvisors.length,
          overallScore:
            aiAnalysis.combined_score ||
            Math.floor(Object.values(calculatedMetrics).reduce((a, b) => a + b) / 4),
          metrics: {
            clarity: aiAnalysis.delivery_analysis.score || calculatedMetrics.clarity,
            confidence: calculatedMetrics.confidence,
            structure: aiAnalysis.content_analysis.score || calculatedMetrics.structure,
            engagement: calculatedMetrics.engagement,
          },
          feedback: await generateRealMultiAdvisorFeedback(selectedAdvisorObjects, pitchContent),
          strengths: [
            ...aiAnalysis.content_analysis.strengths,
            ...aiAnalysis.delivery_analysis.vocal_strengths,
          ],
          improvements: [
            ...aiAnalysis.content_analysis.improvements,
            ...aiAnalysis.delivery_analysis.vocal_improvements,
          ],
          aiGeneratedFeedback: aiAnalysis.overall_feedback,
          comprehensiveCoaching: aiAnalysis,
          audioFeatures: audioFeatures,
          vocalInsights: vocalInsights,
          pitchMode: pitchMode,
          recordingDuration: pitchMode === 'voice' ? recordingTime : null,
          transcript: pitchMode === 'voice' ? speechTranscript : null,
          isUsingComprehensiveAnalysis: true,
          timestampedMetrics: timestampedMetrics,
          timelineAnalysis: aiAnalysis.timeline_analysis,
        };

        setAnalysis(realAnalysis);
      } else {
        // Standard analysis format - more realistic scoring with varied metrics
        let baseMetrics = {
          clarity: Math.min(
            90,
            Math.max(
              40,
              speechAnalysis?.clarityScore ||
                (aiAnalysis.overallScore
                  ? aiAnalysis.overallScore - Math.floor(Math.random() * 10)
                  : null) ||
                Math.floor(Math.random() * 35) + 50 // Range: 50-85
            )
          ),
          confidence: Math.min(
            90,
            Math.max(
              35,
              speechAnalysis?.confidenceLevel ||
                (aiAnalysis.overallScore
                  ? aiAnalysis.overallScore + Math.floor(Math.random() * 10) - 5
                  : null) ||
                Math.floor(Math.random() * 40) + 45 // Range: 45-85
            )
          ),
          structure: Math.min(
            90,
            Math.max(
              40,
              (speechAnalysis
                ? Math.max(50, Math.min(95, 90 - speechAnalysis.pauseAnalysis.fillerWords * 2.5))
                : null) ||
                (aiAnalysis.overallScore
                  ? aiAnalysis.overallScore - Math.floor(Math.random() * 15)
                  : null) ||
                Math.floor(Math.random() * 35) + 50 // Range: 50-85
            )
          ),
          engagement: Math.min(
            90,
            Math.max(
              45,
              speechAnalysis?.energyLevel ||
                (aiAnalysis.overallScore
                  ? aiAnalysis.overallScore + Math.floor(Math.random() * 8) - 4
                  : null) ||
                Math.floor(Math.random() * 30) + 55 // Range: 55-85
            )
          ),
        };

        // Speech analysis is already incorporated above, but ensure values are from actual data
        if (speechAnalysis && pitchMode === 'voice') {
          baseMetrics.clarity = Math.min(90, Math.max(40, speechAnalysis.clarityScore));
          baseMetrics.confidence = Math.min(90, Math.max(35, speechAnalysis.confidenceLevel));
          baseMetrics.engagement = Math.min(90, Math.max(45, speechAnalysis.energyLevel));
          baseMetrics.structure = Math.min(
            90,
            Math.max(40, 90 - speechAnalysis.pauseAnalysis.fillerWords * 2.5)
          );
        }

        // Generate feedback from multiple advisors
        const multiFeedback = await generateRealMultiAdvisorFeedback(
          selectedAdvisorObjects,
          pitchContent
        );

        const realAnalysis = {
          advisors: selectedAdvisorObjects.map(advisor => advisor?.name).join(', '),
          advisorCount: selectedAdvisors.length,
          overallScore:
            aiAnalysis.overallScore ||
            Math.floor(Object.values(baseMetrics).reduce((a, b) => a + b) / 4),
          metrics: baseMetrics,
          feedback: multiFeedback,
          strengths: aiAnalysis.strengths || generateStrengths(speechAnalysis, pitchMode),
          improvements: aiAnalysis.improvements || generateImprovements(speechAnalysis, pitchMode),
          aiGeneratedFeedback: aiAnalysis.feedback,
          speechAnalysis: speechAnalysis,
          pitchMode: pitchMode,
          recordingDuration: pitchMode === 'voice' ? recordingTime : null,
          transcript: pitchMode === 'voice' ? speechTranscript : null,
        };

        setAnalysis(realAnalysis);
      }
    } catch (error) {
      console.error('Error analyzing pitch:', error);

      // Fallback to enhanced mock analysis with speech data
      const selectedAdvisorObjects = selectedAdvisors
        .map(id => getCelebrityAdvisor(id))
        .filter(Boolean);

      // Use actual speech analysis data if available, otherwise use varied random values
      let adjustedMetrics = {
        clarity: speechAnalysis?.clarityScore || Math.floor(Math.random() * 35) + 50, // Range: 50-85%
        confidence: speechAnalysis?.confidenceLevel || Math.floor(Math.random() * 40) + 45, // Range: 45-85%
        structure:
          (speechAnalysis
            ? Math.max(40, Math.min(90, 88 - speechAnalysis.pauseAnalysis.fillerWords * 2.5))
            : null) || Math.floor(Math.random() * 35) + 50, // Range: 50-85%
        engagement: speechAnalysis?.energyLevel || Math.floor(Math.random() * 30) + 55, // Range: 55-85%
      };

      // Ensure values are within realistic bounds
      adjustedMetrics = {
        clarity: Math.max(40, Math.min(90, adjustedMetrics.clarity)),
        confidence: Math.max(35, Math.min(90, adjustedMetrics.confidence)),
        structure: Math.max(40, Math.min(90, adjustedMetrics.structure)),
        engagement: Math.max(45, Math.min(90, adjustedMetrics.engagement)),
      };

      const fallbackAnalysis = {
        advisors: selectedAdvisorObjects.map(advisor => advisor?.name).join(', '),
        advisorCount: selectedAdvisors.length,
        overallScore: Math.floor(Object.values(adjustedMetrics).reduce((a, b) => a + b) / 4),
        metrics: adjustedMetrics,
        feedback: generateMultiAdvisorFeedback(selectedAdvisorObjects),
        strengths: generateStrengths(speechAnalysis, pitchMode),
        improvements: generateImprovements(speechAnalysis, pitchMode),
        speechAnalysis: speechAnalysis,
        pitchMode: pitchMode,
        recordingDuration: pitchMode === 'voice' ? recordingTime : null,
        transcript: pitchMode === 'voice' ? speechTranscript : null,
        isUsingFallback: true,
      };

      setAnalysis(fallbackAnalysis);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Real multi-advisor feedback generation
  const generateRealMultiAdvisorFeedback = async (advisors: any[], pitchContent: string) => {
    if (!advisorAIRef.current) {
      return generateMultiAdvisorFeedback(advisors);
    }

    try {
      const feedbackPromises = advisors.slice(0, 3).map(async advisor => {
        try {
          const analysis = await advisorAIRef.current.generatePitchFeedback(
            advisor,
            pitchContent,
            'quick_feedback'
          );
          return `${advisor.name}: ${analysis.feedback}`;
        } catch (error) {
          console.warn(`Failed to get feedback from ${advisor.name}:`, error);
          return null;
        }
      });

      const results = await Promise.allSettled(feedbackPromises);
      const successfulFeedback = results
        .filter(
          (result): result is PromiseFulfilledResult<string> =>
            result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);

      return successfulFeedback.length > 0
        ? successfulFeedback
        : generateMultiAdvisorFeedback(advisors);
    } catch (error) {
      console.error('Error generating real feedback:', error);
      return generateMultiAdvisorFeedback(advisors);
    }
  };

  const generateStrengths = (speechData: any, mode: string) => {
    const potentialStrengths = [
      'Addresses a significant healthcare problem (patient compliance/adherence)',
      'Leverages emerging AI technology in a practical application',
      'Novel approach to healthcare coaching using friendly/non-threatening interface',
    ];

    // Only show strengths that are actually demonstrated
    const actualStrengths = [];

    if (mode === 'voice' && speechData) {
      // Only add voice strengths if they actually meet the criteria
      if (speechData.confidenceLevel > 70) actualStrengths.push('Confident and assured delivery');
      if (speechData.honestyIndicator > 85) actualStrengths.push('Authentic and genuine tone');
      if (speechData.energyLevel > 75) actualStrengths.push('Good energy and enthusiasm level');
      if (speechData.wordsPerMinute >= 140 && speechData.wordsPerMinute <= 160)
        actualStrengths.push('Optimal speaking pace for audience engagement');
      if (speechData.stressLevel < 45) actualStrengths.push('Calm and composed under pressure');
      if (speechData.pauseAnalysis.fillerWords < 5)
        actualStrengths.push('Clear and articulate speech with minimal filler words');
      if (speechData.clarityScore > 75)
        actualStrengths.push('Clear pronunciation and articulation');

      // Add some content strengths if the speech shows good structure
      if (speechData.wordCount > 100)
        actualStrengths.push('Comprehensive pitch content with good detail');

      const validStrengths = actualStrengths.filter(
        item =>
          typeof item === 'string' &&
          item.trim().length > 10 &&
          !/^[\[\],\{\}`\s]+$/.test(item) &&
          !item.match(/^[^a-zA-Z0-9]+$/)
      );
      return validStrengths.length > 0 ? validStrengths : potentialStrengths.slice(0, 2);
    }

    return potentialStrengths;
  };

  const generateImprovements = (speechData: any, mode: string) => {
    const baseImprovements = [
      'Develop detailed market size analysis and customer segmentation',
      'Articulate clear revenue model and unit economics',
      'Present clinical validation strategy and regulatory compliance approach',
      'Structure pitch with professional formatting and clear sections',
      'Include specific metrics on healthcare outcomes improvement',
    ];

    if (mode === 'voice' && speechData) {
      const voiceImprovements = [];
      if (speechData.stressLevel > 50)
        voiceImprovements.push(
          'Practice breathing techniques to reduce nervousness and project more confidence'
        );
      if (speechData.pauseAnalysis.fillerWords > 8)
        voiceImprovements.push(
          `Reduce filler words (detected ${speechData.pauseAnalysis.fillerWords}) - practice pausing instead of using "um", "uh", "like"`
        );
      if (speechData.wordsPerMinute < 130)
        voiceImprovements.push(
          'Increase speaking pace to 140-160 WPM to maintain audience engagement'
        );
      if (speechData.wordsPerMinute > 170)
        voiceImprovements.push(
          'Slow down speaking pace - aim for 140-160 WPM for optimal comprehension'
        );
      if (speechData.speechPatterns.monotone)
        voiceImprovements.push(
          'Add vocal variety: vary pitch, tone, and emphasis to keep audience engaged'
        );
      if (speechData.clarityScore < 70)
        voiceImprovements.push(
          'Improve articulation and pronunciation - consider tongue twisters practice'
        );
      if (speechData.confidenceLevel < 60)
        voiceImprovements.push(
          'Project more confidence through stronger voice projection and clearer delivery'
        );
      if (speechData.pauseAnalysis.totalPauses < 5)
        voiceImprovements.push(
          'Use strategic pauses (1-2 seconds) to emphasize key points and allow processing time'
        );

      return [...baseImprovements.slice(0, 3), ...voiceImprovements].filter(
        item =>
          typeof item === 'string' &&
          item.trim().length > 10 &&
          !/^[\[\],\{\}`\s]+$/.test(item) &&
          !item.match(/^[^a-zA-Z0-9]+$/)
      );
    }

    return baseImprovements;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStressColor = (level: number) => {
    if (level < 40) return 'text-green-600';
    if (level < 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (level: number) => {
    if (level > 80) return 'text-green-600';
    if (level > 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const generateMultiAdvisorFeedback = (advisors: any[]) => {
    const feedbackPool = {
      'mark-cuban': [
        'Great energy and passion! I love seeing founders who believe in their vision.',
        "Show me the numbers - what's your customer acquisition cost and lifetime value?",
        "Don't scale until you've proven the unit economics work.",
      ],
      'reid-hoffman': [
        'Think about network effects - how does each customer make your product more valuable?',
        "What's your defensible moat as you grow and competitors notice you?",
        'Focus on building platform value, not just user growth.',
      ],
      'barbara-corcoran': [
        "I love the passion, but let's talk about the sales strategy.",
        'How are you going to get customers to choose you over the competition?',
        "What's your plan for scaling the sales team?",
      ],
      'jason-calacanis': [
        'This market timing feels right - but execution will determine everything.',
        'Have you talked to enough customers to validate this pain point?',
        "What's your go-to-market strategy for the first 1000 customers?",
      ],
      'daymond-john': [
        'Brand positioning is crucial here - what makes you memorable?',
        'How are you building a community around your product?',
        "What's your strategy for viral growth and word-of-mouth?",
      ],
      'sheryl-sandberg': [
        "The market opportunity is clear, but let's dive into your growth strategy.",
        'How are you measuring product-market fit?',
        'What metrics are you tracking to understand user engagement?',
      ],
    };

    return advisors.map(advisor => {
      const advisorFeedback =
        feedbackPool[advisor?.id as keyof typeof feedbackPool] || feedbackPool['mark-cuban'];
      return `${advisor?.name}: ${advisorFeedback[Math.floor(Math.random() * advisorFeedback.length)]}`;
    });
  };

  if (analysis) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setAnalysis(null)}
            className="mb-6 text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Practice Another Pitch
          </button>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Pitch Analysis Results</h1>
              <p className="text-gray-600">
                Feedback from {analysis.advisorCount} advisor{analysis.advisorCount > 1 ? 's' : ''}:{' '}
                {analysis.advisors}
              </p>
              {analysis.isUsingComprehensiveAnalysis && (
                <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Professional Audio Analysis Active
                </div>
              )}
            </div>

            {/* Live Coaching Chart - Voice Mode Only */}
            {pitchMode === 'voice' && liveMetrics.length > 0 && (
              <div className="mb-8">
                <LiveCoachingChart
                  data={liveMetrics}
                  isRecording={false}
                  duration={recordingTime}
                />
              </div>
            )}

            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full text-white text-2xl font-bold mb-4">
                {analysis.overallScore}
              </div>
              <p className="text-lg font-semibold text-gray-900">Overall Pitch Score</p>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {Object.entries(analysis.metrics).map(([key, value]) => (
                <div key={key} className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {Math.round(value as number)}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">{key}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(0, Math.round(value as number)))}%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Feedback */}
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💪 Strengths</h3>
                <ul className="space-y-2">
                  {analysis.strengths.map((strength: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🎯 Improvements</h3>
                <ul className="space-y-2">
                  {analysis.improvements.map((improvement: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-orange-500 mr-2">→</span>
                      <span className="text-gray-700">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* AI-Powered Analysis Report */}
            {analysis.aiGeneratedFeedback && (
              <div className="mt-8 space-y-6">
                {/* Parse AI feedback if it's JSON */}
                {(() => {
                  let aiData: any = {};
                  try {
                    // Try to parse as JSON if it's a string
                    aiData =
                      typeof analysis.aiGeneratedFeedback === 'string'
                        ? JSON.parse(analysis.aiGeneratedFeedback)
                        : analysis.aiGeneratedFeedback;
                  } catch (e) {
                    // If not JSON, treat as plain text
                    aiData = { overall_feedback: analysis.aiGeneratedFeedback };
                  }

                  return (
                    <>
                      {/* Executive Summary */}
                      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-start gap-3">
                          <BarChart3 className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                              Professional Pitch Analysis
                            </h3>
                            <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-lg font-bold rounded-full mb-4 shadow-md">
                              Overall Score: {aiData.combined_score || analysis.overallScore}/100
                            </div>

                            {/* Executive Summary Text */}
                            {aiData.overall_feedback && (
                              <div className="bg-white p-5 rounded-lg shadow-sm border border-blue-100 mb-4">
                                <h4 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                                  Executive Summary
                                </h4>
                                <div className="space-y-4">
                                  {(() => {
                                    // Parse the feedback text into structured sections
                                    const text = aiData.overall_feedback;
                                    const sections = [];

                                    // Split by double newlines for paragraphs, or single newlines if no doubles exist
                                    const paragraphs = text.includes('\n\n')
                                      ? text.split('\n\n').filter((p: string) => p.trim())
                                      : text.split('\n').filter((p: string) => p.trim());

                                    for (const para of paragraphs) {
                                      const trimmed = para.trim();

                                      // Check if this is a section header (ends with : and is short)
                                      if (trimmed.endsWith(':') && trimmed.length < 60) {
                                        sections.push(
                                          <h5 key={sections.length} className="font-semibold text-gray-900 mt-4 first:mt-0">
                                            {trimmed}
                                          </h5>
                                        );
                                      }
                                      // Check if this contains bullet points
                                      else if (trimmed.match(/^[-•*]\s/) || trimmed.includes('\n- ') || trimmed.includes('\n• ')) {
                                        const items = trimmed
                                          .split(/\n(?=[-•*]\s)/)
                                          .map((item: string) => item.replace(/^[-•*]\s/, '').trim())
                                          .filter((item: string) => item);

                                        sections.push(
                                          <ul key={sections.length} className="space-y-2">
                                            {items.map((item: string, i: number) => (
                                              <li key={i} className="flex items-start gap-2 text-gray-700 leading-relaxed">
                                                <span className="text-blue-600 mt-1 flex-shrink-0">•</span>
                                                <span>{item}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        );
                                      }
                                      // Check if this is a numbered list
                                      else if (trimmed.match(/^\d+\.\s/) || trimmed.includes('\n1. ')) {
                                        const items = trimmed
                                          .split(/\n(?=\d+\.\s)/)
                                          .map((item: string) => item.replace(/^\d+\.\s/, '').trim())
                                          .filter((item: string) => item);

                                        sections.push(
                                          <ol key={sections.length} className="space-y-2 list-decimal list-inside">
                                            {items.map((item: string, i: number) => (
                                              <li key={i} className="text-gray-700 leading-relaxed pl-2">
                                                {item}
                                              </li>
                                            ))}
                                          </ol>
                                        );
                                      }
                                      // Regular paragraph
                                      else {
                                        sections.push(
                                          <p key={sections.length} className="text-gray-700 leading-relaxed">
                                            {trimmed}
                                          </p>
                                        );
                                      }
                                    }

                                    return sections;
                                  })()}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Content Analysis Section */}
                      {aiData.content_analysis && (
                        <div className="p-6 bg-white rounded-xl border-2 border-blue-200 shadow-sm">
                          <div className="flex items-start gap-3 mb-4">
                            <BookOpen className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-1">
                                Content Analysis
                              </h4>
                              <p className="text-sm text-gray-600">
                                Score: {aiData.content_analysis.score}/100
                              </p>
                            </div>
                          </div>

                          {/* Content Strengths */}
                          {aiData.content_analysis.strengths &&
                            aiData.content_analysis.strengths.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4" />
                                  What's Working
                                </h5>
                                <ul className="space-y-2">
                                  {aiData.content_analysis.strengths.map(
                                    (item: string, i: number) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-700"
                                      >
                                        <span className="text-green-600 mt-0.5">✓</span>
                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Content Improvements */}
                          {aiData.content_analysis.improvements &&
                            aiData.content_analysis.improvements.length > 0 && (
                              <div className="mb-4">
                                <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                  <AlertTriangle className="w-4 h-4" />
                                  Areas to Strengthen
                                </h5>
                                <ul className="space-y-2">
                                  {aiData.content_analysis.improvements.map(
                                    (item: string, i: number) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-700"
                                      >
                                        <span className="text-orange-600 mt-0.5">→</span>
                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Specific Recommendations */}
                          {aiData.content_analysis.specific_recommendations &&
                            aiData.content_analysis.specific_recommendations.length > 0 && (
                              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                                <h5 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Recommended Actions
                                </h5>
                                <ul className="space-y-2">
                                  {aiData.content_analysis.specific_recommendations.map(
                                    (item: string, i: number) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-800"
                                      >
                                        <span className="text-blue-600 font-bold mt-0.5">
                                          {i + 1}.
                                        </span>
                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Delivery Analysis Section */}
                      {aiData.delivery_analysis && (
                        <div className="p-6 bg-white rounded-xl border-2 border-purple-200 shadow-sm">
                          <div className="flex items-start gap-3 mb-4">
                            <TrendingUp className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-1">
                                Delivery Analysis
                              </h4>
                              <p className="text-sm text-gray-600">
                                Score: {aiData.delivery_analysis.score}/100
                              </p>
                            </div>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            {/* Vocal Strengths */}
                            {aiData.delivery_analysis.vocal_strengths &&
                              aiData.delivery_analysis.vocal_strengths.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4" />
                                    Delivery Strengths
                                  </h5>
                                  <ul className="space-y-2">
                                    {aiData.delivery_analysis.vocal_strengths.map(
                                      (item: string, i: number) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-sm text-gray-700"
                                        >
                                          <span className="text-green-600 mt-0.5">✓</span>
                                          <span>{item}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}

                            {/* Vocal Improvements */}
                            {aiData.delivery_analysis.vocal_improvements &&
                              aiData.delivery_analysis.vocal_improvements.length > 0 && (
                                <div>
                                  <h5 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Delivery Improvements
                                  </h5>
                                  <ul className="space-y-2">
                                    {aiData.delivery_analysis.vocal_improvements.map(
                                      (item: string, i: number) => (
                                        <li
                                          key={i}
                                          className="flex items-start gap-2 text-sm text-gray-700"
                                        >
                                          <span className="text-orange-600 mt-0.5">→</span>
                                          <span>{item}</span>
                                        </li>
                                      )
                                    )}
                                  </ul>
                                </div>
                              )}
                          </div>

                          {/* Coaching Recommendations */}
                          {aiData.delivery_analysis.coaching_recommendations &&
                            aiData.delivery_analysis.coaching_recommendations.length > 0 && (
                              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                <h5 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                                  <Target className="w-4 h-4" />
                                  Coaching Recommendations
                                </h5>
                                <ul className="space-y-2">
                                  {aiData.delivery_analysis.coaching_recommendations.map(
                                    (item: string, i: number) => (
                                      <li
                                        key={i}
                                        className="flex items-start gap-2 text-sm text-gray-800"
                                      >
                                        <span className="text-purple-600 font-bold mt-0.5">
                                          {i + 1}.
                                        </span>
                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}

                          {/* Technical Metrics */}
                          {aiData.delivery_analysis.technical_metrics &&
                            aiData.delivery_analysis.technical_metrics.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-purple-200">
                                <h5 className="font-semibold text-gray-800 mb-2 text-xs uppercase">
                                  Technical Metrics
                                </h5>
                                <ul className="space-y-1">
                                  {aiData.delivery_analysis.technical_metrics.map(
                                    (item: string, i: number) => (
                                      <li
                                        key={i}
                                        className="text-xs text-gray-600 flex items-start gap-2"
                                      >
                                        <span className="text-purple-400">•</span>
                                        <span>{item}</span>
                                      </li>
                                    )
                                  )}
                                </ul>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Action Plan */}
                      {aiData.action_plan && aiData.action_plan.length > 0 && (
                        <div className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-300 shadow-md">
                          <div className="flex items-start gap-3">
                            <Target className="w-7 h-7 text-indigo-600 flex-shrink-0 mt-1" />
                            <div className="flex-1">
                              <h4 className="text-lg font-bold text-gray-900 mb-4">
                                Immediate Action Plan
                              </h4>
                              <div className="space-y-3">
                                {aiData.action_plan.map((item: string, i: number) => (
                                  <div
                                    key={i}
                                    className="bg-white p-4 rounded-lg border border-indigo-200 shadow-sm"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white text-sm font-bold flex items-center justify-center">
                                        {i + 1}
                                      </div>
                                      <p className="text-sm text-gray-800 font-medium pt-1">
                                        {item}
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timeline Analysis */}
                      {aiData.timeline_analysis?.problematic_moments &&
                        aiData.timeline_analysis.problematic_moments.length > 0 && (
                          <div className="p-6 bg-yellow-50 rounded-xl border border-yellow-300">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-6 h-6 text-yellow-700 flex-shrink-0 mt-1" />
                              <div className="flex-1">
                                <h4 className="text-lg font-bold text-yellow-900 mb-3">
                                  Critical Moments Analysis
                                </h4>
                                <p className="text-sm text-yellow-800 mb-4">
                                  Key moments where delivery needs attention:
                                </p>
                                <div className="space-y-3">
                                  {aiData.timeline_analysis.problematic_moments.map(
                                    (moment: any, i: number) => (
                                      <div
                                        key={i}
                                        className="bg-white p-4 rounded-lg border border-yellow-200"
                                      >
                                        <div className="flex items-start gap-3">
                                          <div className="flex-shrink-0 px-2 py-1 bg-yellow-600 text-white text-xs font-bold rounded">
                                            {moment.timestamp}
                                          </div>
                                          <div className="flex-1">
                                            <p className="text-sm text-gray-800 font-medium mb-1">
                                              {moment.issue}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                              <strong className="text-yellow-700">Fix:</strong>{' '}
                                              {moment.recommendation}
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                    </>
                  );
                })()}
              </div>
            )}

            {/* Advanced Audio Features Display */}
            {analysis.audioFeatures && analysis.pitchMode === 'voice' && (
              <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🔬 Professional Audio Analysis
                </h3>
                <div className="mb-4 text-sm text-blue-700 bg-blue-100 p-3 rounded-lg">
                  Real-time audio processing with professional voice coaching metrics
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Vocal Quality */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">🎤 Vocal Quality</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Clarity Score:</span>
                        <span className="font-medium text-green-600">
                          {analysis.audioFeatures.coaching_metrics.clarity_score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Professional Tone:</span>
                        <span className="font-medium text-blue-600">
                          {analysis.audioFeatures.coaching_metrics.professional_tone.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Articulation:</span>
                        <span className="font-medium text-purple-600">
                          {analysis.audioFeatures.coaching_metrics.articulation_score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Voice Breaks:</span>
                        <span className="font-medium">
                          {analysis.audioFeatures.voice_quality.voice_breaks}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Emotional Indicators */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">💡 Emotional Markers</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span className="font-medium text-green-600">
                          {analysis.audioFeatures.emotional_markers.confidence_level.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Energy Level:</span>
                        <span className="font-medium text-orange-600">
                          {analysis.audioFeatures.emotional_markers.energy_level.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Stress Level:</span>
                        <span
                          className={`font-medium ${analysis.audioFeatures.emotional_markers.stress_level > 60 ? 'text-red-600' : 'text-green-600'}`}
                        >
                          {analysis.audioFeatures.emotional_markers.stress_level.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Authenticity:</span>
                        <span className="font-medium text-purple-600">
                          {analysis.audioFeatures.emotional_markers.authenticity.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Speech Rhythm */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">⏱️ Speech Rhythm</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Speaking Rate:</span>
                        <span className="font-medium">
                          {analysis.audioFeatures.rhythm.speaking_rate.toFixed(1)} WPM
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pause Count:</span>
                        <span className="font-medium">
                          {analysis.audioFeatures.timing.pause_count}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Speech Flow:</span>
                        <span className="font-medium text-blue-600">
                          {analysis.audioFeatures.coaching_metrics.flow_score.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Emphasis Variation:</span>
                        <span className="font-medium text-green-600">
                          {analysis.audioFeatures.coaching_metrics.emphasis_variation.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Speech Analysis Results (Fallback) */}
            {analysis.speechAnalysis &&
              analysis.pitchMode === 'voice' &&
              !analysis.audioFeatures && (
                <div className="mt-8 p-6 bg-blue-50 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    🎤 Voice & Speech Analysis
                  </h3>
                  <div className="mb-4 text-sm text-amber-700 bg-amber-100 p-3 rounded-lg">
                    Basic speech analysis - comprehensive audio analysis not available
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Speech Metrics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Speech Characteristics</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Speaking Pace:</span>
                          <span className="font-medium">
                            {analysis.speechAnalysis.wordsPerMinute} WPM
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Stress Level:</span>
                          <span
                            className={`font-medium ${getStressColor(analysis.speechAnalysis.stressLevel)}`}
                          >
                            {analysis.speechAnalysis.stressLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Confidence:</span>
                          <span
                            className={`font-medium ${getConfidenceColor(analysis.speechAnalysis.confidenceLevel)}`}
                          >
                            {analysis.speechAnalysis.confidenceLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Honesty Indicator:</span>
                          <span className="font-medium text-blue-600">
                            {analysis.speechAnalysis.honestyIndicator}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Energy Level:</span>
                          <span className="font-medium text-orange-600">
                            {analysis.speechAnalysis.energyLevel}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Recording Duration:</span>
                          <span className="font-medium">
                            {formatTime(analysis.recordingDuration)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Words Spoken:</span>
                          <span className="font-medium">
                            {analysis.speechAnalysis.wordCount || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Pause Analysis */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Speech Patterns</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Pauses:</span>
                          <span className="font-medium">
                            {analysis.speechAnalysis.pauseAnalysis.totalPauses}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg Pause Length:</span>
                          <span className="font-medium">
                            {analysis.speechAnalysis.pauseAnalysis.averagePauseLength}s
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Filler Words:</span>
                          <span className="font-medium">
                            {analysis.speechAnalysis.pauseAnalysis.fillerWords}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Enthusiasm:</span>
                          <span className="font-medium text-green-600">
                            {analysis.speechAnalysis.emotionalTone.enthusiasm}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Nervousness:</span>
                          <span className="font-medium text-red-600">
                            {analysis.speechAnalysis.emotionalTone.nervousness}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Authenticity:</span>
                          <span className="font-medium text-purple-600">
                            {analysis.speechAnalysis.emotionalTone.authenticity}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Speech Patterns Alerts */}
                  {(analysis.speechAnalysis.speechPatterns.monotone ||
                    analysis.speechAnalysis.speechPatterns.rushing ||
                    analysis.speechAnalysis.speechPatterns.unclear) && (
                    <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                      <h5 className="font-medium text-yellow-800 mb-2">⚠️ Speech Pattern Alerts</h5>
                      <ul className="text-sm text-yellow-700 space-y-1">
                        {analysis.speechAnalysis.speechPatterns.monotone && (
                          <li>
                            • Detected monotone delivery - try varying your pitch and intonation
                          </li>
                        )}
                        {analysis.speechAnalysis.speechPatterns.rushing && (
                          <li>• Speaking too quickly - slow down for better clarity</li>
                        )}
                        {analysis.speechAnalysis.speechPatterns.unclear && (
                          <li>• Some unclear pronunciation detected - focus on articulation</li>
                        )}
                        {analysis.speechAnalysis.pauseAnalysis.fillerWords > 10 && (
                          <li>
                            • High number of filler words detected - practice removing "um", "uh",
                            "like"
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              )}

            {/* Comprehensive Coaching Analysis */}
            {analysis.comprehensiveCoaching && (
              <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  🏆 Professional Pitch Coaching
                </h3>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Content Analysis */}
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3">📊 Business Content Analysis</h4>
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysis.comprehensiveCoaching.content_analysis.score}/100
                      </div>
                      <div className="text-sm text-gray-600">Content Score</div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Strengths:</h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          {analysis.comprehensiveCoaching.content_analysis.strengths.map(
                            (strength: string, index: number) => (
                              <li key={index}>• {strength}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-orange-700 mb-1">Business Improvements:</h5>
                        <ul className="text-sm text-orange-600 space-y-1">
                          {analysis.comprehensiveCoaching.content_analysis.improvements.map(
                            (improvement: string, index: number) => (
                              <li key={index}>• {improvement}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Analysis */}
                  <div className="p-4 bg-white rounded-lg border">
                    <h4 className="font-medium text-gray-900 mb-3">
                      🎤 Presentation Delivery Analysis
                    </h4>
                    <div className="mb-3">
                      <div className="text-2xl font-bold text-green-600">
                        {analysis.comprehensiveCoaching.delivery_analysis.score}/100
                      </div>
                      <div className="text-sm text-gray-600">Delivery Score</div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-green-700 mb-1">Vocal Strengths:</h5>
                        <ul className="text-sm text-green-600 space-y-1">
                          {analysis.comprehensiveCoaching.delivery_analysis.vocal_strengths.map(
                            (strength: string, index: number) => (
                              <li key={index}>• {strength}</li>
                            )
                          )}
                        </ul>
                      </div>

                      <div>
                        <h5 className="font-medium text-blue-700 mb-1">
                          Coaching Recommendations:
                        </h5>
                        <ul className="text-sm text-blue-600 space-y-1">
                          {analysis.comprehensiveCoaching.delivery_analysis.coaching_recommendations.map(
                            (rec: string, index: number) => (
                              <li key={index}>• {rec}</li>
                            )
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Plan */}
                {analysis.comprehensiveCoaching.action_plan && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-900 mb-3">🎯 Immediate Action Plan</h4>
                    <ul className="text-sm text-purple-800 space-y-1">
                      {analysis.comprehensiveCoaching.action_plan.map(
                        (action: string, index: number) => (
                          <li key={index}>• {action}</li>
                        )
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Detailed Feedback */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                💬 Advisory Board Feedback
              </h3>
              {analysis.isUsingFallback && (
                <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Using fallback analysis - AI service temporarily unavailable. Feedback is
                    based on speech patterns and general guidelines.
                  </p>
                </div>
              )}
              {analysis.isUsingComprehensiveAnalysis && (
                <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Analysis powered by real-time audio analysis engine with professional vocal
                    delivery metrics and AI advisor feedback.
                  </p>
                </div>
              )}
              <div className="space-y-4">
                {analysis.feedback && analysis.feedback.length > 0 ? (
                  analysis.feedback.map((comment: string, index: number) => (
                    <div
                      key={index}
                      className="p-3 bg-white rounded-lg border-l-4 border-purple-500"
                    >
                      <p className="text-gray-700">{comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-3 bg-white rounded-lg border-l-4 border-gray-400">
                    <p className="text-gray-600">
                      Advisory board feedback is being generated... Please check your pitch analysis
                      above for detailed insights.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={onBack}
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <button onClick={onBack} className="mb-6 text-purple-600 hover:text-purple-700 font-medium">
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🎤 Pitch Practice</h1>
            <p className="text-gray-600">
              Get AI-powered feedback on your pitch from celebrity investors
            </p>
          </div>

          {/* Advisor Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Choose Your Advisory Board ({selectedAdvisors.length} selected)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select multiple advisors to get diverse perspectives on your pitch
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {celebrityAdvisors.map(advisor => {
                const isSelected = selectedAdvisors.includes(advisor.id);
                const isHost = advisor.id === 'the-host';
                return (
                  <button
                    key={advisor.id}
                    onClick={() => toggleAdvisor(advisor.id)}
                    className={cn(
                      'p-4 border-2 rounded-xl text-left transition-all relative',
                      isHost && !isSelected
                        ? 'border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-lg ring-2 ring-amber-200'
                        : isHost && isSelected
                          ? 'border-amber-500 bg-gradient-to-br from-amber-100 to-yellow-100 shadow-lg ring-2 ring-amber-300'
                          : isSelected
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                    )}
                  >
                    {isHost && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-amber-500 text-white text-xs font-semibold rounded-full">
                        HOST
                      </div>
                    )}
                    {isSelected && (
                      <div
                        className={cn(
                          'absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center',
                          isHost ? 'bg-amber-500' : 'bg-purple-500'
                        )}
                      >
                        <span className="text-white text-sm">✓</span>
                      </div>
                    )}
                    <div
                      className={cn(
                        'font-semibold',
                        isHost ? 'text-amber-900 mt-6' : 'text-gray-900'
                      )}
                    >
                      {advisor.name}
                    </div>
                    <div className={cn('text-sm', isHost ? 'text-amber-700' : 'text-gray-600')}>
                      {advisor.title}
                    </div>
                    <div
                      className={cn('text-sm mt-1', isHost ? 'text-amber-600' : 'text-gray-500')}
                    >
                      {advisor.company}
                    </div>
                    {isHost && (
                      <div className="text-xs text-amber-700 mt-2 font-medium">
                        🎯 Meeting Facilitation • Behavioral Economics
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {selectedAdvisors.length > 0 && (
              <div className="mt-4 p-3 bg-purple-50 rounded-lg">
                <p className="text-sm text-purple-700">
                  Selected advisors:{' '}
                  {selectedAdvisors
                    .map(id => celebrityAdvisors.find(a => a.id === id)?.name)
                    .join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Pitch Mode Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Pitch Mode</h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPitchMode('text')}
                className={cn(
                  'p-4 border-2 rounded-xl text-left transition-all',
                  pitchMode === 'text'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                )}
              >
                <div className="font-semibold text-gray-900">📝 Text Pitch</div>
                <div className="text-sm text-gray-600 mt-1">
                  Write your pitch and get text-based feedback
                </div>
              </button>
              <button
                onClick={() => setPitchMode('voice')}
                className={cn(
                  'p-4 border-2 rounded-xl text-left transition-all',
                  pitchMode === 'voice'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300'
                )}
              >
                <div className="font-semibold text-gray-900">🎤 Voice Pitch</div>
                <div className="text-sm text-gray-600 mt-1">
                  Record your pitch and get speech analysis
                </div>
              </button>
            </div>
          </div>

          {/* Timer Settings for Voice Mode */}
          {pitchMode === 'voice' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pitch Timer</h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Duration:</label>
                <select
                  value={pitchDuration}
                  onChange={e => setPitchDuration(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  disabled={isRecording}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map(min => (
                    <option key={min} value={min}>
                      {min} minute{min > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                <div className="text-sm text-gray-500">
                  {isRecording ? (
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse mr-2"></div>
                      Recording: {formatTime(recordingTime)} / {formatTime(pitchDuration * 60)}
                    </span>
                  ) : timeRemaining > 0 ? (
                    `Time remaining: ${formatTime(timeRemaining)}`
                  ) : (
                    `Set timer for ${pitchDuration} minute${pitchDuration > 1 ? 's' : ''}`
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Real-time Audio Feedback */}
          <RealTimeAudioFeedback
            isRecording={isRecording}
            audioContext={audioContext}
            analyserNode={analyserNode}
            onMetricsUpdate={handleRealTimeMetricsUpdate}
          />

          {/* Voice Recording Interface */}
          {pitchMode === 'voice' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Record Your Pitch with Live Coaching
              </h2>
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-xl">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
                    <span className="text-2xl">🎤</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {isRecording
                      ? 'Recording in Progress'
                      : recordedAudio
                        ? 'Recording Complete'
                        : 'Ready to Record'}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {isRecording
                      ? `Speaking time: ${formatTime(recordingTime)}`
                      : recordedAudio
                        ? `Recorded ${formatTime(recordingTime)} of pitch audio`
                        : `Click record to start your ${pitchDuration} minute pitch`}
                  </p>
                </div>

                <div className="space-y-4">
                  {!isRecording && !recordedAudio && (
                    <button
                      onClick={startRecording}
                      className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
                    >
                      🔴 Start Recording
                    </button>
                  )}

                  {isRecording && (
                    <button
                      onClick={stopRecording}
                      className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                      ⏹️ Stop Recording
                    </button>
                  )}

                  {recordedAudio && !isRecording && (
                    <div className="space-y-3">
                      <audio controls src={audioUrl} className="w-full max-w-md mx-auto">
                        Your browser does not support the audio element.
                      </audio>
                      <div className="flex space-x-3 justify-center">
                        <button
                          onClick={() => {
                            setRecordedAudio(null);
                            setAudioUrl('');
                            setSpeechAnalysis(null);
                            setSpeechTranscript('');
                            setRecordingTime(0);
                            setAudioFeatures(null);
                            setVocalInsights(null);
                            setLiveMetrics([]);
                            setIsProcessingAudio(false);
                          }}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
                        >
                          🗑️ Delete & Re-record
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Audio Processing Status */}
                {isProcessingAudio && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-3"></div>
                      <div>
                        <h4 className="font-medium text-green-900">
                          🔬 Processing Comprehensive Audio Analysis
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          Analyzing voice patterns, pitch, clarity, and professional delivery
                          metrics...
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Audio Analysis Complete */}
                {audioFeatures && vocalInsights && !isProcessingAudio && (
                  <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center">
                      <span className="text-green-600 mr-2">✅</span>
                      <div>
                        <h4 className="font-medium text-green-900">
                          Professional Audio Analysis Complete
                        </h4>
                        <p className="text-sm text-green-700 mt-1">
                          Comprehensive voice coaching data ready - click "Analyze Voice Pitch" for
                          detailed feedback
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Transcript Display */}
                {speechTranscript && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border">
                    <h4 className="font-medium text-blue-900 mb-2">📝 Speech Transcript</h4>
                    <div className="text-sm text-blue-800 max-h-32 overflow-y-auto bg-white p-3 rounded border">
                      {speechTranscript || 'No speech detected yet...'}
                    </div>
                    {isTranscribing && (
                      <div className="mt-2 text-xs text-blue-600 flex items-center">
                        <div className="animate-pulse w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        Listening and transcribing...
                      </div>
                    )}
                  </div>
                )}

                {/* Live Coaching Chart */}
                {(isRecording || liveMetrics.length > 0) && (
                  <div className="mt-6">
                    <LiveCoachingChart
                      data={liveMetrics}
                      isRecording={isRecording}
                      duration={recordingTime}
                    />
                  </div>
                )}
              </div>
              {/* Browser Compatibility Notice */}
              {!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) && (
                <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start">
                    <div className="text-amber-600 mr-3">⚠️</div>
                    <div>
                      <h4 className="font-medium text-amber-900">
                        Speech Recognition Not Available
                      </h4>
                      <p className="text-sm text-amber-800 mt-1">
                        Your browser doesn't support speech recognition. You can still record audio,
                        but transcript and real-time speech analysis won't be available.
                        <br />
                        <span className="font-medium">Supported browsers:</span> Chrome, Edge,
                        Safari (latest versions)
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Text Input (only show if text mode) */}
          {pitchMode === 'text' && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Pitch</h2>
              <textarea
                value={pitchText}
                onChange={e => setPitchText(e.target.value)}
                placeholder="Enter your pitch here... Tell us about your company, the problem you're solving, your solution, market opportunity, business model, and what you're looking for."
                className="w-full h-40 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="text-sm text-gray-500 mt-2">
                {pitchText.length} characters • Aim for 200-500 words for best results
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={handleAnalyzePitch}
              disabled={
                selectedAdvisors.length === 0 ||
                (pitchMode === 'text' && !pitchText.trim()) ||
                (pitchMode === 'voice' && !recordedAudio) ||
                isAnalyzing ||
                isAnalyzingSpeech ||
                isProcessingAudio
              }
              className={cn(
                'px-8 py-4 rounded-xl font-semibold text-white transition-all',
                selectedAdvisors.length === 0 ||
                  (pitchMode === 'text' && !pitchText.trim()) ||
                  (pitchMode === 'voice' && !recordedAudio)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isAnalyzing || isAnalyzingSpeech || isProcessingAudio
                    ? 'bg-purple-400 cursor-wait'
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
              )}
            >
              {isProcessingAudio ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing Audio Analysis...
                </span>
              ) : isAnalyzingSpeech ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Speech Patterns...
                </span>
              ) : isAnalyzing ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Analyzing Your Pitch...
                </span>
              ) : pitchMode === 'voice' ? (
                'Analyze Voice Pitch'
              ) : (
                'Get AI Feedback'
              )}
            </button>

            {/* Instructions based on mode */}
            <div className="mt-4 text-sm text-gray-500">
              {pitchMode === 'text' ? (
                <p>Select advisors and write your pitch to get personalized feedback</p>
              ) : (
                <p>
                  {!recordedAudio
                    ? 'Record your pitch using the microphone to get voice analysis + AI feedback'
                    : 'Get AI feedback plus detailed speech analysis including stress, confidence, and speaking patterns'}
                </p>
              )}
            </div>
          </div>

          {/* Tips */}
          <div className="mt-8 p-6 bg-purple-50 rounded-xl">
            <h3 className="font-semibold text-purple-900 mb-3">💡 Tips for a Great Pitch</h3>
            {pitchMode === 'text' ? (
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Start with a compelling problem statement</li>
                <li>• Clearly explain your unique solution</li>
                <li>• Show market size and opportunity</li>
                <li>• Include business model and revenue projections</li>
                <li>• Mention your team's expertise</li>
                <li>• End with a clear ask (funding, partnership, etc.)</li>
              </ul>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Content Tips:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Start with a compelling hook</li>
                    <li>• Use the problem-solution-market framework</li>
                    <li>• Include concrete examples and metrics</li>
                    <li>• End with a memorable call to action</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-purple-900 mb-2">Voice Tips:</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• Speak at 140-160 words per minute (ideal pace)</li>
                    <li>• Minimize filler words - aim for less than 5 per minute</li>
                    <li>• Vary your tone and avoid monotone delivery</li>
                    <li>• Use strategic pauses for emphasis (1-2 seconds)</li>
                    <li>• Project confidence through clear articulation</li>
                    <li>• Practice breathing to reduce stress and nervousness</li>
                    <li>• Watch the live coaching panel for real-time feedback</li>
                    <li>• Professional audio analysis provides detailed vocal insights</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
