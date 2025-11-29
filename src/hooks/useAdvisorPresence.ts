import { useState, useCallback, useMemo } from 'react';
import { CelebrityAdvisor, CustomAdvisor, ConversationMessage } from '../types';

type Advisor = CelebrityAdvisor | CustomAdvisor;

interface UseAdvisorPresenceProps {
  selectedAdvisorIds: string[];
  allAdvisors: Advisor[];
  messages: ConversationMessage[];
  isGenerating: boolean;
  currentGeneratingAdvisorId?: string | null;
}

interface UseAdvisorPresenceReturn {
  selectedAdvisors: Advisor[];
  speakingAdvisorId: string | null;
  typingAdvisorId: string | null;
  setSpeakingAdvisor: (id: string | null) => void;
  setTypingAdvisor: (id: string | null) => void;
  getRecentSpeaker: () => string | null;
}

export const useAdvisorPresence = ({
  selectedAdvisorIds,
  allAdvisors,
  messages,
  isGenerating,
  currentGeneratingAdvisorId,
}: UseAdvisorPresenceProps): UseAdvisorPresenceReturn => {
  const [manualSpeakingId, setManualSpeakingId] = useState<string | null>(null);
  const [manualTypingId, setManualTypingId] = useState<string | null>(null);

  // Get the full advisor objects for selected IDs
  const selectedAdvisors = useMemo(() => {
    return selectedAdvisorIds
      .map(id => allAdvisors.find(a => a.id === id))
      .filter((a): a is Advisor => a !== undefined);
  }, [selectedAdvisorIds, allAdvisors]);

  // Determine who is currently typing (generating a response)
  const typingAdvisorId = useMemo(() => {
    if (manualTypingId) return manualTypingId;
    if (isGenerating && currentGeneratingAdvisorId) {
      return currentGeneratingAdvisorId;
    }
    return null;
  }, [isGenerating, currentGeneratingAdvisorId, manualTypingId]);

  // Determine who was the most recent speaker based on messages
  const getRecentSpeaker = useCallback((): string | null => {
    // Look at the last few messages to find the most recent advisor
    // The global ConversationMessage type uses 'role'
    const recentAdvisorMessages = messages
      .filter(m => m.role === 'advisor')
      .slice(-3);

    if (recentAdvisorMessages.length > 0) {
      // Return the last advisor's ID (we track by order in selectedAdvisorIds)
      return null; // For now, we don't track specific advisor in messages
    }
    return null;
  }, [messages]);

  // Speaking is either manually set or the most recent speaker
  const speakingAdvisorId = useMemo(() => {
    if (manualSpeakingId) return manualSpeakingId;
    // Don't show as speaking if they're currently typing
    if (typingAdvisorId) return null;
    return getRecentSpeaker();
  }, [manualSpeakingId, typingAdvisorId, getRecentSpeaker]);

  const setSpeakingAdvisor = useCallback((id: string | null) => {
    setManualSpeakingId(id);
    // Clear after 3 seconds if set
    if (id) {
      setTimeout(() => setManualSpeakingId(null), 3000);
    }
  }, []);

  const setTypingAdvisor = useCallback((id: string | null) => {
    setManualTypingId(id);
  }, []);

  return {
    selectedAdvisors,
    speakingAdvisorId,
    typingAdvisorId,
    setSpeakingAdvisor,
    setTypingAdvisor,
    getRecentSpeaker,
  };
};

export default useAdvisorPresence;
