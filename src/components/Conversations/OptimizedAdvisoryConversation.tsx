// Optimized Advisory Conversation Component
// Refactored from 1,342-line monolith using best practices

import React, { memo, useCallback, useEffect, useMemo } from 'react';
import { ConversationHeader } from './components/ConversationHeader';
import { MessageList } from './components/MessageList';
import { MessageInput } from './components/MessageInput';
import {
  useConversationStore,
  useActiveConversation,
  useUIState,
} from '../../stores/conversationStore';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { DocumentStorage } from '../../services/DocumentStorage';
import { AdvisorAI } from '../../services/advisorAI';
import { ApplicationMode } from '../../types';
import { usePerformanceMonitor } from '../../utils/performance';
import { environment } from '../../config/environment';

interface OptimizedAdvisoryConversationProps {
  onBack: () => void;
  initialMode?: ApplicationMode;
  conversationId?: string;
}

export const OptimizedAdvisoryConversation = memo(function OptimizedAdvisoryConversation({
  onBack,
  initialMode = 'advisory_conversation',
  conversationId,
}: OptimizedAdvisoryConversationProps) {
  const { start: startPerf, end: endPerf } = usePerformanceMonitor(
    'conversation-render',
    environment.isDebugMode()
  );

  // Global state
  const {
    createConversation,
    setActiveConversation,
    addMessage,
    updateMessage,
    setIsGeneratingResponse,
    selectAdvisors,
    toggleSettings,
    toggleAdvisorSelector,
    toggleDocumentUpload,
  } = useConversationStore();

  const activeConversation = useActiveConversation();
  const uiState = useUIState();

  // Advisor context
  const { celebrityAdvisors, customAdvisors } = useAdvisor();

  // Initialize conversation if needed
  useEffect(() => {
    startPerf();

    if (conversationId) {
      setActiveConversation(conversationId);
    } else if (!activeConversation) {
      const newConversationId = createConversation(initialMode);
      setActiveConversation(newConversationId);
    }

    return () => {
      endPerf();
    };
  }, [
    conversationId,
    activeConversation,
    createConversation,
    setActiveConversation,
    initialMode,
    startPerf,
    endPerf,
  ]);

  // Memoized conversation modes
  const conversationModes = useMemo(
    () => [
      {
        id: 'advisory_conversation' as ApplicationMode,
        name: 'General Advisory',
        description: 'Strategic business consultation and advice',
        icon: '💼',
      },
      {
        id: 'due_diligence' as ApplicationMode,
        name: 'Due Diligence',
        description: 'Investment analysis and risk assessment',
        icon: '🔍',
      },
      {
        id: 'strategic_planning' as ApplicationMode,
        name: 'Strategic Planning',
        description: 'Long-term strategy and planning',
        icon: '🎯',
      },
      {
        id: 'pitch_practice' as ApplicationMode,
        name: 'Pitch Practice',
        description: 'Practice and refine your pitch',
        icon: '🎤',
      },
    ],
    []
  );

  // Current mode derived from conversation
  const currentMode = useMemo(() => {
    const modeId = activeConversation?.mode || initialMode;
    return conversationModes.find(mode => mode.id === modeId) || conversationModes[0];
  }, [activeConversation?.mode, initialMode, conversationModes]);

  // Memoized advisor data
  const allAdvisors = useMemo(
    () => [...celebrityAdvisors, ...customAdvisors],
    [celebrityAdvisors, customAdvisors]
  );

  const selectedAdvisorData = useMemo(
    () => allAdvisors.filter(advisor => activeConversation?.selectedAdvisors.includes(advisor.id)),
    [allAdvisors, activeConversation?.selectedAdvisors]
  );

  // Handle message sending
  const handleSendMessage = useCallback(
    async (content: string) => {
      if (!activeConversation || uiState.isGeneratingResponse) return;

      try {
        // Add user message
        const userMessageId = addMessage(activeConversation.id, {
          role: 'user',
          content,
          advisorId: undefined,
          advisorName: undefined,
        });

        setIsGeneratingResponse(true);

        // Get document context if available
        const documentStorage = DocumentStorage.getInstance();
        const documents = activeConversation.documentIds
          .map(id => documentStorage.getDocument(id))
          .filter(Boolean);

        // Generate responses from selected advisors
        const advisorsToQuery =
          selectedAdvisorData.length > 0
            ? selectedAdvisorData
            : [celebrityAdvisors[0]].filter(Boolean); // Fallback to first advisor

        const responses = await Promise.allSettled(
          advisorsToQuery.map(async advisor => {
            const aiConfig = {
              id: advisor.ai_service || 'claude',
              name: `${advisor.name} AI`,
              apiKey: '', // Handled securely by new architecture
              model: 'claude-3-5-sonnet-20241022',
            };

            const advisorAI = new AdvisorAI(aiConfig);

            // Add loading message
            const loadingMessageId = addMessage(activeConversation.id, {
              role: 'advisor',
              content: '',
              advisorId: advisor.id,
              advisorName: advisor.name,
              isLoading: true,
            });

            try {
              let response: string;

              // Handle Host advisor specially with behavioral economics and facilitation
              if (advisor.id === 'the-host') {
                response = await advisorAI.generateHostFacilitationResponse(advisor, content, {
                  messageCount: activeConversation.messages.length,
                  participantCount: Math.max(selectedAdvisorData.length, 1),
                  lastMessageTime: new Date(),
                  hasAgenda: false, // TODO: Implement agenda detection
                  agendaText: undefined, // TODO: Extract agenda from documents or conversation
                });
              } else {
                // Regular advisor response
                const bio = (advisor as any).bio || (advisor as any).background_context || '';
                const systemPrompt = `You are ${advisor.name}, ${advisor.title}${advisor.company ? ` at ${advisor.company}` : ''}. ${bio}

Your communication style: ${advisor.communication_style || (advisor as any).personality_description || 'Professional and insightful'}

Context: This is a ${currentMode.name.toLowerCase()} session.

${documents.length > 0 ? `Documents provided:\n${documents.map((doc, i) => `Document ${i + 1}: ${doc?.extractedText?.substring(0, 500)}...`).join('\n\n')}` : ''}

Please provide advice in your characteristic style and expertise.`;

                response = await advisorAI.generateResponseWithCustomPrompt(systemPrompt, content, {
                  maxTokens: 2000,
                  temperature: 0.7,
                });
              }

              // Update message with response
              updateMessage(activeConversation.id, loadingMessageId, {
                content: response,
                isLoading: false,
              });

              return { advisor, response, success: true };
            } catch (error) {
              // Update message with error
              updateMessage(activeConversation.id, loadingMessageId, {
                content: `I apologize, but I'm having trouble processing your request right now. Please try again in a moment.`,
                isLoading: false,
              });

              console.error(`Error generating response for ${advisor.name}:`, error);
              return { advisor, error, success: false };
            }
          })
        );

        if (environment.isDebugMode()) {
          console.log('Generated responses:', responses);
        }
      } catch (error) {
        console.error('Error handling message:', error);
      } finally {
        setIsGeneratingResponse(false);
      }
    },
    [
      activeConversation,
      uiState.isGeneratingResponse,
      addMessage,
      updateMessage,
      setIsGeneratingResponse,
      selectedAdvisorData,
      celebrityAdvisors,
      currentMode.id,
    ]
  );

  // Handle mode change
  const handleModeChange = useCallback(
    (newMode: (typeof conversationModes)[0]) => {
      if (activeConversation) {
        // Update conversation mode
        // This would require adding updateConversationMode to store
        console.log('Mode change requested:', newMode);
      }
    },
    [activeConversation]
  );

  // Handle copy message
  const handleCopyMessage = useCallback((content: string) => {
    navigator.clipboard?.writeText(content).then(() => {
      // Could show toast notification here
      console.log('Message copied to clipboard');
    });
  }, []);

  // Handle message rating
  const handleRateMessage = useCallback((messageId: string, rating: 'up' | 'down') => {
    // Could implement message rating system
    console.log(`Message ${messageId} rated:`, rating);
  }, []);

  if (!activeConversation) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <ConversationHeader
        selectedMode={currentMode}
        selectedAdvisorCount={selectedAdvisorData.length}
        documentCount={activeConversation.documentIds.length}
        showSettings={uiState.showSettings}
        onBack={onBack}
        onModeChange={handleModeChange}
        onToggleSettings={toggleSettings}
        onToggleAdvisorSelector={toggleAdvisorSelector}
        onToggleDocumentUpload={toggleDocumentUpload}
        modes={conversationModes}
      />

      {/* Messages */}
      <MessageList
        messages={activeConversation.messages}
        isGeneratingResponse={uiState.isGeneratingResponse}
        onCopyMessage={handleCopyMessage}
        onRateMessage={handleRateMessage}
      />

      {/* Input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        isGeneratingResponse={uiState.isGeneratingResponse}
        placeholder={`Ask your ${selectedAdvisorData.length > 1 ? 'advisory team' : 'advisor'} anything...`}
        supportVoice={false} // TODO: Implement voice input
        supportAttachments={false} // TODO: Implement file attachments
        maxLength={2000}
      />
    </div>
  );
});

export default OptimizedAdvisoryConversation;
