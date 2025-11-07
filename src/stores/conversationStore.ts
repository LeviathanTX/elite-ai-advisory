// Conversation Store - Zustand Implementation
// Replaces heavy Context API usage with optimized state management

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware/persist';
import {
  ConversationMessage,
  ConversationSettings,
} from '../components/Conversations/hooks/useConversationState';
import { ApplicationMode } from '../types';

export interface ConversationState {
  // Active conversation
  activeConversationId: string | null;
  conversations: Map<string, Conversation>;

  // UI state (not persisted)
  isGeneratingResponse: boolean;
  isProcessingDocument: boolean;
  showSettings: boolean;
  showAdvisorSelector: boolean;
  showDocumentUpload: boolean;

  // Settings (persisted)
  globalSettings: ConversationSettings;
}

export interface Conversation {
  id: string;
  title: string;
  mode: ApplicationMode;
  messages: ConversationMessage[];
  selectedAdvisors: string[];
  documentIds: string[];
  settings: ConversationSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConversationActions {
  // Conversation management
  createConversation: (mode: ApplicationMode, title?: string) => string;
  setActiveConversation: (id: string | null) => void;
  deleteConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;

  // Message management
  addMessage: (
    conversationId: string,
    message: Omit<ConversationMessage, 'id' | 'timestamp'>
  ) => string;
  updateMessage: (
    conversationId: string,
    messageId: string,
    updates: Partial<ConversationMessage>
  ) => void;
  removeMessage: (conversationId: string, messageId: string) => void;
  clearMessages: (conversationId: string) => void;

  // Settings
  updateGlobalSettings: (updates: Partial<ConversationSettings>) => void;
  updateConversationSettings: (
    conversationId: string,
    updates: Partial<ConversationSettings>
  ) => void;

  // UI state
  setIsGeneratingResponse: (isGenerating: boolean) => void;
  setIsProcessingDocument: (isProcessing: boolean) => void;
  toggleSettings: () => void;
  toggleAdvisorSelector: () => void;
  toggleDocumentUpload: () => void;

  // Advisors
  selectAdvisors: (conversationId: string, advisorIds: string[]) => void;
  addAdvisor: (conversationId: string, advisorId: string) => void;
  removeAdvisor: (conversationId: string, advisorId: string) => void;

  // Documents
  addDocument: (conversationId: string, documentId: string) => void;
  removeDocument: (conversationId: string, documentId: string) => void;

  // Utilities
  getConversation: (id: string) => Conversation | undefined;
  getActiveConversation: () => Conversation | undefined;
  searchConversations: (query: string) => Conversation[];
}

const DEFAULT_SETTINGS: ConversationSettings = {
  selectedAdvisors: [],
  temperature: 0.7,
  maxTokens: 2000,
  includeDocuments: true,
  autoSave: true,
};

function createConversation(mode: ApplicationMode, title?: string): Conversation {
  const id = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const now = new Date();

  return {
    id,
    title: title || `${mode.replace('_', ' ')} Session`,
    mode,
    messages: [],
    selectedAdvisors: [],
    documentIds: [],
    settings: { ...DEFAULT_SETTINGS },
    createdAt: now,
    updatedAt: now,
  };
}

export const useConversationStore = create<ConversationState & ConversationActions>()(
  subscribeWithSelector(
    immer(
      persist(
        (set, get) => ({
          // Initial state
          activeConversationId: null,
          conversations: new Map(),
          isGeneratingResponse: false,
          isProcessingDocument: false,
          showSettings: false,
          showAdvisorSelector: false,
          showDocumentUpload: false,
          globalSettings: { ...DEFAULT_SETTINGS },

          // Actions
          createConversation: (mode: ApplicationMode, title?: string) => {
            const conversation = createConversation(mode, title);

            set(state => {
              state.conversations.set(conversation.id, conversation);
              state.activeConversationId = conversation.id;
            });

            return conversation.id;
          },

          setActiveConversation: (id: string | null) => {
            set(state => {
              state.activeConversationId = id;
            });
          },

          deleteConversation: (id: string) => {
            set(state => {
              state.conversations.delete(id);
              if (state.activeConversationId === id) {
                state.activeConversationId = null;
              }
            });
          },

          updateConversationTitle: (id: string, title: string) => {
            set(state => {
              const conversation = state.conversations.get(id);
              if (conversation) {
                conversation.title = title;
                conversation.updatedAt = new Date();
              }
            });
          },

          addMessage: (
            conversationId: string,
            message: Omit<ConversationMessage, 'id' | 'timestamp'>
          ) => {
            const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newMessage: ConversationMessage = {
              ...message,
              id: messageId,
              timestamp: new Date(),
            };

            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                conversation.messages.push(newMessage);
                conversation.updatedAt = new Date();
              }
            });

            return messageId;
          },

          updateMessage: (
            conversationId: string,
            messageId: string,
            updates: Partial<ConversationMessage>
          ) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
                if (messageIndex !== -1) {
                  Object.assign(conversation.messages[messageIndex], updates);
                  conversation.updatedAt = new Date();
                }
              }
            });
          },

          removeMessage: (conversationId: string, messageId: string) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                conversation.messages = conversation.messages.filter(m => m.id !== messageId);
                conversation.updatedAt = new Date();
              }
            });
          },

          clearMessages: (conversationId: string) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                conversation.messages = [];
                conversation.updatedAt = new Date();
              }
            });
          },

          updateGlobalSettings: (updates: Partial<ConversationSettings>) => {
            set(state => {
              Object.assign(state.globalSettings, updates);
            });
          },

          updateConversationSettings: (
            conversationId: string,
            updates: Partial<ConversationSettings>
          ) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                Object.assign(conversation.settings, updates);
                conversation.updatedAt = new Date();
              }
            });
          },

          setIsGeneratingResponse: (isGenerating: boolean) => {
            set(state => {
              state.isGeneratingResponse = isGenerating;
            });
          },

          setIsProcessingDocument: (isProcessing: boolean) => {
            set(state => {
              state.isProcessingDocument = isProcessing;
            });
          },

          toggleSettings: () => {
            set(state => {
              state.showSettings = !state.showSettings;
            });
          },

          toggleAdvisorSelector: () => {
            set(state => {
              state.showAdvisorSelector = !state.showAdvisorSelector;
            });
          },

          toggleDocumentUpload: () => {
            set(state => {
              state.showDocumentUpload = !state.showDocumentUpload;
            });
          },

          selectAdvisors: (conversationId: string, advisorIds: string[]) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                conversation.selectedAdvisors = [...advisorIds];
                conversation.updatedAt = new Date();
              }
            });
          },

          addAdvisor: (conversationId: string, advisorId: string) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation && !conversation.selectedAdvisors.includes(advisorId)) {
                conversation.selectedAdvisors.push(advisorId);
                conversation.updatedAt = new Date();
              }
            });
          },

          removeAdvisor: (conversationId: string, advisorId: string) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                conversation.selectedAdvisors = conversation.selectedAdvisors.filter(
                  id => id !== advisorId
                );
                conversation.updatedAt = new Date();
              }
            });
          },

          addDocument: (conversationId: string, documentId: string) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation && !conversation.documentIds.includes(documentId)) {
                conversation.documentIds.push(documentId);
                conversation.updatedAt = new Date();
              }
            });
          },

          removeDocument: (conversationId: string, documentId: string) => {
            set(state => {
              const conversation = state.conversations.get(conversationId);
              if (conversation) {
                conversation.documentIds = conversation.documentIds.filter(id => id !== documentId);
                conversation.updatedAt = new Date();
              }
            });
          },

          getConversation: (id: string) => {
            return get().conversations.get(id);
          },

          getActiveConversation: () => {
            const { activeConversationId, conversations } = get();
            return activeConversationId ? conversations.get(activeConversationId) : undefined;
          },

          searchConversations: (query: string) => {
            const { conversations } = get();
            const lowerQuery = query.toLowerCase();

            return Array.from(conversations.values()).filter(
              conversation =>
                conversation.title.toLowerCase().includes(lowerQuery) ||
                conversation.messages.some(message =>
                  message.content.toLowerCase().includes(lowerQuery)
                )
            );
          },
        }),
        {
          name: 'elite-ai-conversations',
          partialize: state => ({
            conversations: Array.from(state.conversations.entries()),
            globalSettings: state.globalSettings,
          }),
          onRehydrateStorage: () => state => {
            if (state && Array.isArray(state.conversations)) {
              // Convert array back to Map
              state.conversations = new Map(state.conversations as any);
            }
          },
        }
      )
    )
  )
);

// Selector hooks for performance optimization
export const useActiveConversation = () =>
  useConversationStore(state => {
    const { activeConversationId, conversations } = state;
    return activeConversationId ? conversations.get(activeConversationId) : undefined;
  });

export const useConversationMessages = (conversationId?: string) =>
  useConversationStore(state => {
    if (!conversationId) return [];
    return state.conversations.get(conversationId)?.messages || [];
  });

export const useConversationSettings = (conversationId?: string) =>
  useConversationStore(state => {
    if (!conversationId) return state.globalSettings;
    return state.conversations.get(conversationId)?.settings || state.globalSettings;
  });

export const useUIState = () =>
  useConversationStore(state => ({
    isGeneratingResponse: state.isGeneratingResponse,
    isProcessingDocument: state.isProcessingDocument,
    showSettings: state.showSettings,
    showAdvisorSelector: state.showAdvisorSelector,
    showDocumentUpload: state.showDocumentUpload,
  }));
