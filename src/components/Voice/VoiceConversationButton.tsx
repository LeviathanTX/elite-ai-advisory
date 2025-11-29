/**
 * VoiceConversationButton Component
 *
 * A button that enables voice conversations with AI advisors using Gemini Live API.
 * Shows visual feedback for connection, listening, and speaking states.
 */

import React, { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useGeminiVoice } from '../../hooks/useGeminiVoice';
import { cn } from '../../utils';

interface VoiceConversationButtonProps {
  advisorId: string;
  advisorName: string;
  systemPrompt: string;
  onTranscript?: (text: string) => void;
  onResponse?: (text: string) => void;
  className?: string;
  variant?: 'default' | 'compact' | 'floating';
}

export const VoiceConversationButton = memo(function VoiceConversationButton({
  advisorId,
  advisorName,
  systemPrompt,
  onTranscript,
  onResponse,
  className,
  variant = 'default',
}: VoiceConversationButtonProps) {
  const [showPanel, setShowPanel] = useState(false);

  const {
    isConnected,
    isListening,
    isSpeaking,
    error,
    transcript,
    response,
    connect,
    disconnect,
    startListening,
    stopListening,
    hasMicrophonePermission,
    requestMicrophonePermission,
  } = useGeminiVoice({
    advisorId,
    systemPrompt,
    onTranscript: (text, isFinal) => {
      if (isFinal && onTranscript) {
        onTranscript(text);
      }
    },
    onResponse: (text) => {
      onResponse?.(text);
    },
  });

  const handleToggleConnection = useCallback(async () => {
    if (isConnected) {
      disconnect();
    } else {
      // Check microphone permission first
      if (hasMicrophonePermission === false) {
        const granted = await requestMicrophonePermission();
        if (!granted) return;
      }
      await connect();
    }
  }, [isConnected, disconnect, connect, hasMicrophonePermission, requestMicrophonePermission]);

  const handleToggleListening = useCallback(async () => {
    if (isListening) {
      stopListening();
    } else {
      await startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Compact variant - just a mic button
  if (variant === 'compact') {
    return (
      <button
        onClick={handleToggleConnection}
        className={cn(
          'p-2 rounded-full transition-all duration-200',
          isConnected
            ? 'bg-green-500 text-white hover:bg-green-600'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
          isListening && 'animate-pulse bg-red-500 hover:bg-red-600',
          className
        )}
        title={isConnected ? (isListening ? 'Stop listening' : 'Start voice') : 'Start voice conversation'}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>
    );
  }

  // Floating variant - expandable panel
  if (variant === 'floating') {
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500">
                <h3 className="text-white font-bold">Voice Conversation</h3>
                <p className="text-white/80 text-sm">with {advisorName}</p>
              </div>

              <div className="p-4">
                {/* Status */}
                <div className="flex items-center gap-2 mb-4">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      isConnected ? 'bg-green-500' : 'bg-gray-300'
                    )}
                  />
                  <span className="text-sm text-gray-600">
                    {isConnected
                      ? isListening
                        ? 'Listening...'
                        : isSpeaking
                          ? `${advisorName} is speaking...`
                          : 'Connected'
                      : 'Disconnected'}
                  </span>
                </div>

                {/* Error */}
                {error && (
                  <div className="mb-4 p-2 bg-red-50 text-red-600 text-sm rounded-lg">{error}</div>
                )}

                {/* Transcript */}
                {transcript && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">You said:</p>
                    <p className="text-sm text-gray-700">{transcript}</p>
                  </div>
                )}

                {/* Response */}
                {response && (
                  <div className="mb-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-600 mb-1">{advisorName}:</p>
                    <p className="text-sm text-gray-700">{response}</p>
                  </div>
                )}

                {/* Controls */}
                <div className="flex gap-2">
                  <button
                    onClick={handleToggleConnection}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors',
                      isConnected
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-green-100 text-green-600 hover:bg-green-200'
                    )}
                  >
                    {isConnected ? (
                      <>
                        <PhoneOff className="w-4 h-4" />
                        End
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4" />
                        Connect
                      </>
                    )}
                  </button>

                  {isConnected && (
                    <button
                      onClick={handleToggleListening}
                      className={cn(
                        'flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-medium transition-colors',
                        isListening
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                      )}
                    >
                      {isListening ? (
                        <MicOff className="w-4 h-4" />
                      ) : (
                        <Mic className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main floating button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPanel(!showPanel)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-colors',
            isConnected
              ? isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
              : 'bg-amber-500 hover:bg-amber-600'
          )}
        >
          {isListening ? (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Mic className="w-6 h-6 text-white" />
            </motion.div>
          ) : isSpeaking ? (
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
            >
              <Volume2 className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </motion.button>
      </div>
    );
  }

  // Default variant - inline button with expanded state
  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      {/* Connection button */}
      <button
        onClick={handleToggleConnection}
        disabled={!process.env.REACT_APP_GEMINI_API_KEY}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200',
          isConnected
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-amber-100 text-amber-700 hover:bg-amber-200',
          !process.env.REACT_APP_GEMINI_API_KEY && 'opacity-50 cursor-not-allowed'
        )}
        title={
          !process.env.REACT_APP_GEMINI_API_KEY
            ? 'Gemini API key not configured'
            : isConnected
              ? 'Disconnect voice'
              : 'Start voice conversation'
        }
      >
        {isConnected ? (
          <>
            <PhoneOff className="w-4 h-4" />
            <span className="hidden sm:inline">End Voice</span>
          </>
        ) : (
          <>
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">Voice Chat</span>
          </>
        )}
      </button>

      {/* Mic button (only when connected) */}
      <AnimatePresence>
        {isConnected && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={handleToggleListening}
            className={cn(
              'p-2 rounded-full transition-all duration-200',
              isListening
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
            )}
          >
            {isListening ? (
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                <MicOff className="w-5 h-5" />
              </motion.div>
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Status indicator */}
      {isConnected && (
        <div className="flex items-center gap-1 text-sm text-gray-500">
          {isListening && (
            <span className="flex items-center gap-1 text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Listening
            </span>
          )}
          {isSpeaking && (
            <span className="flex items-center gap-1 text-green-500">
              <Volume2 className="w-4 h-4 animate-pulse" />
              Speaking
            </span>
          )}
        </div>
      )}

      {/* Error display */}
      {error && <span className="text-sm text-red-500">{error}</span>}
    </div>
  );
});

export default VoiceConversationButton;
