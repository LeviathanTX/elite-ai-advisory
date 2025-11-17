import React, { createContext, useContext, useState, useEffect } from 'react';

interface HelpContextType {
  isFirstVisit: boolean;
  hasCompletedOnboarding: boolean;
  hasSeenDemoTour: boolean;
  showHelpModal: boolean;
  showOnboarding: boolean;
  showDemoTour: boolean;
  helpSection: string;
  setShowHelpModal: (show: boolean, section?: string) => void;
  setShowOnboarding: (show: boolean) => void;
  setShowDemoTour: (show: boolean) => void;
  markOnboardingComplete: (preferences?: OnboardingPreferences) => void;
  markDemoTourComplete: () => void;
  resetHelpState: () => void;
}

interface OnboardingPreferences {
  primaryGoals: string[];
  businessStage: string;
  industryFocus: string[];
  preferredAdvisors: string[];
  interestedFeatures: string[];
  experienceLevel: string;
  subscriptionInterest: string | null;
}

const HelpContext = createContext<HelpContextType | undefined>(undefined);

export const useHelp = () => {
  const context = useContext(HelpContext);
  if (context === undefined) {
    throw new Error('useHelp must be used within a HelpProvider');
  }
  return context;
};

interface HelpProviderProps {
  children: React.ReactNode;
}

export const HelpProvider: React.FC<HelpProviderProps> = ({ children }) => {
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [hasSeenDemoTour, setHasSeenDemoTour] = useState(false);
  const [showHelpModal, setShowHelpModalState] = useState(false);
  const [showOnboarding, setShowOnboardingState] = useState(false);
  const [showDemoTour, setShowDemoTourState] = useState(false);
  const [helpSection, setHelpSection] = useState('getting-started');

  // Load help state from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem('bearable-help-state');
    if (savedState) {
      try {
        const state = JSON.parse(savedState);
        setIsFirstVisit(state.isFirstVisit ?? true);
        setHasCompletedOnboarding(state.hasCompletedOnboarding ?? false);
        setHasSeenDemoTour(state.hasSeenDemoTour ?? false);
      } catch (error) {
        console.warn('Failed to parse help state from localStorage:', error);
      }
    }

    // Onboarding is now optional - users go directly to dashboard
    // Users can manually access help via the help button if needed
  }, []);

  // Save help state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      isFirstVisit,
      hasCompletedOnboarding,
      hasSeenDemoTour,
    };
    localStorage.setItem('bearable-help-state', JSON.stringify(state));
  }, [isFirstVisit, hasCompletedOnboarding, hasSeenDemoTour]);

  const setShowHelpModal = (show: boolean, section: string = 'getting-started') => {
    setShowHelpModalState(show);
    setHelpSection(section);
  };

  const setShowOnboarding = (show: boolean) => {
    setShowOnboardingState(show);
  };

  const setShowDemoTour = (show: boolean) => {
    setShowDemoTourState(show);
  };

  const markOnboardingComplete = (preferences?: OnboardingPreferences) => {
    setHasCompletedOnboarding(true);
    setIsFirstVisit(false);
    setShowOnboardingState(false);

    // Save preferences if provided
    if (preferences) {
      localStorage.setItem('elite-ai-onboarding-preferences', JSON.stringify(preferences));
    }

    // Optionally show demo tour after onboarding
    if (!hasSeenDemoTour) {
      setTimeout(() => {
        setShowDemoTourState(true);
      }, 1000);
    }
  };

  const markDemoTourComplete = () => {
    setHasSeenDemoTour(true);
    setShowDemoTourState(false);
  };

  const resetHelpState = () => {
    setIsFirstVisit(true);
    setHasCompletedOnboarding(false);
    setHasSeenDemoTour(false);
    setShowHelpModalState(false);
    setShowOnboardingState(false);
    setShowDemoTourState(false);
    localStorage.removeItem('elite-ai-help-state');
    localStorage.removeItem('elite-ai-onboarding-preferences');
  };

  const value: HelpContextType = {
    isFirstVisit,
    hasCompletedOnboarding,
    hasSeenDemoTour,
    showHelpModal,
    showOnboarding,
    showDemoTour,
    helpSection,
    setShowHelpModal,
    setShowOnboarding,
    setShowDemoTour,
    markOnboardingComplete,
    markDemoTourComplete,
    resetHelpState,
  };

  return <HelpContext.Provider value={value}>{children}</HelpContext.Provider>;
};
