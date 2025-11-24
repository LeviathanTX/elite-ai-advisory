// Message List Component
// Extracted from monolithic AdvisoryConversation component

import React, { useEffect, useRef, useMemo } from 'react';
import { User, Bot, Copy, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ConversationMessage } from '../hooks/useConversationState';

interface MessageListProps {
  messages: ConversationMessage[];
  isGeneratingResponse: boolean;
  onCopyMessage: (content: string) => void;
  onRateMessage?: (messageId: string, rating: 'up' | 'down') => void;
}

interface MessageItemProps {
  message: ConversationMessage;
  onCopy: (content: string) => void;
  onRate?: (rating: 'up' | 'down') => void;
}

function MessageItem({ message, onCopy, onRate }: MessageItemProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  if (isSystem) return null; // Don't render system messages

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-4xl ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isUser ? 'ml-3' : 'mr-3'}`}>
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isUser ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Message Header */}
          <div
            className={`flex items-center space-x-2 mb-1 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <span className="text-sm font-medium text-gray-900">
              {isUser ? 'You' : message.advisorName || 'AI Advisor'}
            </span>
            <span className="text-xs text-gray-500">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>

          {/* Message Bubble */}
          <div
            className={`relative px-4 py-3 rounded-lg ${
              isUser ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900 border border-gray-200'
            }`}
          >
            {message.isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  ></div>
                </div>
                <span className="text-sm text-gray-500">Thinking...</span>
              </div>
            ) : (
              <div className="whitespace-pre-wrap break-words">{message.content}</div>
            )}
          </div>

          {/* Message Actions */}
          {!message.isLoading && !isUser && (
            <div className="flex items-center space-x-2 mt-2">
              <button
                onClick={() => onCopy(message.content)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Copy message"
              >
                <Copy className="w-4 h-4" />
              </button>

              {onRate && (
                <>
                  <button
                    onClick={() => onRate('up')}
                    className="p-1 text-gray-400 hover:text-green-600 rounded transition-colors"
                    title="Good response"
                  >
                    <ThumbsUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onRate('down')}
                    className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                    title="Poor response"
                  >
                    <ThumbsDown className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function MessageList({
  messages,
  isGeneratingResponse,
  onCopyMessage,
  onRateMessage,
}: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingResponse]);

  // Memoize visible messages to prevent unnecessary re-renders
  const visibleMessages = useMemo(() => messages.filter(msg => msg.role !== 'system'), [messages]);

  if (visibleMessages.length === 0 && !isGeneratingResponse) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-2xl">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Bot className="w-10 h-10 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Start Your Advisory Session</h3>
          <p className="text-gray-600 mb-8 text-lg">
            Your AI advisory team is ready to help. Ask questions, share documents, or begin a
            strategic discussion.
          </p>

          {/* Example Questions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm font-semibold text-blue-900 mb-1">💡 Try asking:</p>
              <p className="text-sm text-blue-800">
                "How can I improve my pitch deck for investors?"
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-left">
              <p className="text-sm font-semibold text-purple-900 mb-1">📊 Or ask:</p>
              <p className="text-sm text-purple-800">
                "What metrics should I track for my SaaS startup?"
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
              <p className="text-sm font-semibold text-green-900 mb-1">🎯 Strategy:</p>
              <p className="text-sm text-green-800">"How do I prioritize features for my MVP?"</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-left">
              <p className="text-sm font-semibold text-orange-900 mb-1">💰 Fundraising:</p>
              <p className="text-sm text-orange-800">
                "What's the best way to approach VCs in Austin?"
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">💡 Pro tip:</strong> Select specific advisors above
              and upload your pitch deck or business plan for more targeted, context-aware advice.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-6xl mx-auto px-6 py-4">
        {visibleMessages.map(message => (
          <MessageItem
            key={message.id}
            message={message}
            onCopy={onCopyMessage}
            onRate={onRateMessage ? rating => onRateMessage(message.id, rating) : undefined}
          />
        ))}

        {isGeneratingResponse && (
          <MessageItem
            message={{
              id: 'loading',
              role: 'advisor',
              content: '',
              timestamp: new Date(),
              isLoading: true,
            }}
            onCopy={() => {}}
          />
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
