// Voice Chat Button Component for Advisor Conversations
import React, { useState } from 'react';
import { useVoiceConversation } from '../../hooks/useVoiceConversation';
import type { CelebrityAdvisor } from '../../types';

interface VoiceChatButtonProps {
  advisor: CelebrityAdvisor;
  onClose?: () => void;
}

export const VoiceChatButton: React.FC<VoiceChatButtonProps> = ({ advisor, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    state,
    messages,
    connect,
    disconnect,
    startListening,
    stopListening,
    interrupt,
    error
  } = useVoiceConversation({
    advisorId: advisor.id,
    advisorName: advisor.name,
    systemPrompt: advisor.system_prompt || `You are ${advisor.name}, providing business advice.`
  });

  const handleToggleVoice = async () => {
    if (!state.isConnected) {
      setIsOpen(true);
      await connect();
    } else if (state.isListening) {
      stopListening();
    } else {
      await startListening();
    }
  };

  const handleClose = () => {
    disconnect();
    setIsOpen(false);
    onClose?.();
  };

  if (!isOpen) {
    return (
      <button
        onClick={handleToggleVoice}
        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
        title="Start voice conversation"
      >
        <MicrophoneIcon className="w-5 h-5" />
        <span>Voice Chat</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-lg font-bold">{advisor.name[0]}</span>
              </div>
              <div>
                <h3 className="font-semibold">{advisor.name}</h3>
                <p className="text-sm opacity-80">
                  {state.isConnected ? 'Connected' : 'Connecting...'}
                </p>
              </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-white/20 rounded-full">
              <XIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status */}
        <div className="px-6 py-3 border-b dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm">
            {state.isSpeaking && (
              <span className="flex items-center gap-1 text-purple-600">
                <SpeakerIcon className="w-4 h-4 animate-pulse" />
                Speaking...
              </span>
            )}
            {state.isListening && (
              <span className="flex items-center gap-1 text-green-600">
                <MicrophoneIcon className="w-4 h-4 animate-pulse" />
                Listening...
              </span>
            )}
            {state.isProcessing && !state.isSpeaking && (
              <span className="flex items-center gap-1 text-blue-600">
                <SpinnerIcon className="w-4 h-4 animate-spin" />
                Processing...
              </span>
            )}
            {error && (
              <span className="text-red-500">{error}</span>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto px-6 py-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center">
              {state.isConnected ? 'Press the microphone to start talking' : 'Connecting...'}
            </p>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Controls */}
        <div className="px-6 py-4 border-t dark:border-gray-700 flex items-center justify-center gap-4">
          {state.isSpeaking && (
            <button
              onClick={interrupt}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Interrupt
            </button>
          )}
          <button
            onClick={handleToggleVoice}
            disabled={!state.isConnected}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              state.isListening
                ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                : 'bg-purple-600 hover:bg-purple-700'
            } text-white disabled:opacity-50`}
          >
            <MicrophoneIcon className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Icons
const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
  </svg>
);

const SpeakerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
  </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SpinnerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
  </svg>
);

export default VoiceChatButton;
