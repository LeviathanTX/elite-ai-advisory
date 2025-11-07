// Message Input Component
// Extracted from monolithic AdvisoryConversation component

import React, { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Send, Mic, MicOff, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isGeneratingResponse: boolean;
  disabled?: boolean;
  placeholder?: string;
  supportVoice?: boolean;
  supportAttachments?: boolean;
  maxLength?: number;
}

export function MessageInput({
  onSendMessage,
  isGeneratingResponse,
  disabled = false,
  placeholder = 'Ask your advisory team anything...',
  supportVoice = false,
  supportAttachments = false,
  maxLength = 2000,
}: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
    }
  }, []);

  const handleInputChange = useCallback(
    (value: string) => {
      if (value.length <= maxLength) {
        setInput(value);
      }
    },
    [maxLength]
  );

  const handleSend = useCallback(() => {
    const trimmedInput = input.trim();
    if (trimmedInput && !isGeneratingResponse && !disabled) {
      onSendMessage(trimmedInput);
      setInput('');

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  }, [input, isGeneratingResponse, disabled, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleVoiceToggle = useCallback(() => {
    if (!supportVoice) return;

    setIsRecording(prev => !prev);
    // TODO: Implement voice recording functionality
  }, [supportVoice]);

  const handleAttachment = useCallback(() => {
    if (!supportAttachments) return;

    // TODO: Implement file attachment functionality
    console.log('Attachment clicked');
  }, [supportAttachments]);

  const canSend = input.trim().length > 0 && !isGeneratingResponse && !disabled;

  return (
    <div className="bg-white border-t border-gray-200 px-6 py-4">
      <div className="max-w-6xl mx-auto">
        <div className="relative">
          {/* Input Container */}
          <div className="flex items-end space-x-3">
            {/* Attachment Button */}
            {supportAttachments && (
              <button
                onClick={handleAttachment}
                disabled={disabled}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Attach file"
              >
                <Paperclip className="w-5 h-5" />
              </button>
            )}

            {/* Text Input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  handleInputChange(e.target.value);
                  adjustTextareaHeight();
                }}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                disabled={disabled || isGeneratingResponse}
                className="w-full px-4 py-3 pr-20 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ minHeight: '52px', maxHeight: '120px' }}
                rows={1}
              />

              {/* Character Counter */}
              {input.length > maxLength * 0.8 && (
                <div className="absolute bottom-1 right-1 text-xs text-gray-400">
                  {input.length}/{maxLength}
                </div>
              )}
            </div>

            {/* Voice Button */}
            {supportVoice && (
              <button
                onClick={handleVoiceToggle}
                disabled={disabled}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  isRecording
                    ? 'text-red-600 bg-red-50 hover:bg-red-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
                title={isRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
            )}

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={!canSend}
              className={`p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                canSend ? 'text-white bg-blue-600 hover:bg-blue-700' : 'text-gray-400 bg-gray-100'
              }`}
              title="Send message"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          {/* Status Indicator */}
          {isGeneratingResponse && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex space-x-1">
                <div className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></div>
                <div
                  className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: '0.2s' }}
                ></div>
                <div
                  className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"
                  style={{ animationDelay: '0.4s' }}
                ></div>
              </div>
              <span>Your advisors are thinking...</span>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {supportVoice && <span>• Voice input supported</span>}
          </div>

          {input.length === 0 && (
            <div className="flex items-center space-x-2">
              <Smile className="w-4 h-4" />
              <span>Start typing your question...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
