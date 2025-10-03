// Conversation State Management Hook
// Extracted from monolithic AdvisoryConversation component

import { useState, useCallback, useMemo } from 'react';
import { ApplicationMode } from '../../../types';

export interface ConversationMode {
  id: ApplicationMode;
  name: string;
  description: string;
  icon: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'advisor' | 'system';
  content: string;
  timestamp: Date;
  advisorId?: string;
  advisorName?: string;
  isLoading?: boolean;
}

export interface ConversationSettings {
  selectedAdvisors: string[];
  temperature: number;
  maxTokens: number;
  includeDocuments: boolean;
  autoSave: boolean;
}

export interface ConversationState {
  // Core conversation data
  messages: ConversationMessage[];
  selectedMode: ConversationMode;
  isTyping: boolean;

  // UI state
  showSettings: boolean;
  showAdvisorSelector: boolean;
  showDocumentUpload: boolean;

  // Conversation settings
  settings: ConversationSettings;

  // Loading states
  isGeneratingResponse: boolean;
  isProcessingDocument: boolean;
}

const DEFAULT_SETTINGS: ConversationSettings = {
  selectedAdvisors: [],
  temperature: 0.7,
  maxTokens: 2000,
  includeDocuments: true,
  autoSave: true,
};

const CONVERSATION_MODES: ConversationMode[] = [
  {
    id: 'advisory_conversation',
    name: 'General Advisory',
    description: 'Strategic business consultation and advice',
    icon: '💼'
  },
  {
    id: 'due_diligence',
    name: 'Due Diligence',
    description: 'Investment analysis and risk assessment',
    icon: '🔍'
  },
  {
    id: 'strategic_planning',
    name: 'Strategic Planning',
    description: 'Long-term strategy and planning',
    icon: '🎯'
  },
  {
    id: 'pitch_practice',
    name: 'Pitch Practice',
    description: 'Practice and refine your pitch',
    icon: '🎤'
  }
];

export function useConversationState(initialMode: ApplicationMode = 'advisory_conversation') {
  // Core state
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [selectedMode, setSelectedMode] = useState<ConversationMode>(() =>
    CONVERSATION_MODES.find(mode => mode.id === initialMode) || CONVERSATION_MODES[0]
  );
  const [isTyping, setIsTyping] = useState(false);

  // UI state
  const [showSettings, setShowSettings] = useState(false);
  const [showAdvisorSelector, setShowAdvisorSelector] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);

  // Settings
  const [settings, setSettings] = useState<ConversationSettings>(DEFAULT_SETTINGS);

  // Loading states
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false);
  const [isProcessingDocument, setIsProcessingDocument] = useState(false);

  // Actions
  const addMessage = useCallback((message: Omit<ConversationMessage, 'id' | 'timestamp'>) => {
    const newMessage: ConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<ConversationMessage>) => {
    setMessages(prev => prev.map(msg =>
      msg.id === id ? { ...msg, ...updates } : msg
    ));
  }, []);

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(msg => msg.id !== id));
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const updateSettings = useCallback((updates: Partial<ConversationSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const toggleSettings = useCallback(() => {
    setShowSettings(prev => !prev);
  }, []);

  const toggleAdvisorSelector = useCallback(() => {
    setShowAdvisorSelector(prev => !prev);
  }, []);

  const toggleDocumentUpload = useCallback(() => {
    setShowDocumentUpload(prev => !prev);
  }, []);

  // Computed values
  const state = useMemo<ConversationState>(() => ({
    messages,
    selectedMode,
    isTyping,
    showSettings,
    showAdvisorSelector,
    showDocumentUpload,
    settings,
    isGeneratingResponse,
    isProcessingDocument,
  }), [
    messages,
    selectedMode,
    isTyping,
    showSettings,
    showAdvisorSelector,
    showDocumentUpload,
    settings,
    isGeneratingResponse,
    isProcessingDocument,
  ]);

  const actions = useMemo(() => ({
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    updateSettings,
    setSelectedMode,
    setIsTyping,
    setIsGeneratingResponse,
    setIsProcessingDocument,
    toggleSettings,
    toggleAdvisorSelector,
    toggleDocumentUpload,
  }), [
    addMessage,
    updateMessage,
    removeMessage,
    clearMessages,
    updateSettings,
    toggleSettings,
    toggleAdvisorSelector,
    toggleDocumentUpload,
  ]);

  return {
    state,
    actions,
    modes: CONVERSATION_MODES,
  };
}