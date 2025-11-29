import React, { useState, useEffect } from 'react';
import { HelpCircle, LogOut, Settings, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { useAdvisor } from '../../contexts/AdvisorContext';
import { useHelp } from '../../contexts/HelpContext';
import { SettingsModal } from '../Settings/SettingsModal';
import { TestDocumentManagement } from '../Testing/TestDocumentManagement';
import { HelpModal } from '../Help/HelpModal';
import { DemoTour } from '../Help/DemoTour';
import { OnboardingFlow } from '../Help/OnboardingFlow';
import { QuickStartGuide } from '../Help/QuickStartGuide';
import { EmailVerificationBanner } from '../Auth/EmailVerificationBanner';
import { Avatar } from '../Common/Avatar';
import { cn } from '../../utils';
import { ApplicationMode } from '../../types';
import { analytics } from '../../services/analytics';

interface DashboardProps {
  onModeSelect: (mode: ApplicationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onModeSelect }) => {
  const { user, signOut } = useAuth();
  const { currentTier } = useSubscription();
  const { celebrityAdvisors, customAdvisors, conversations, setActiveConversation } = useAdvisor();
  const {
    showHelpModal,
    showOnboarding,
    showDemoTour,
    helpSection,
    setShowHelpModal,
    setShowOnboarding,
    setShowDemoTour,
    markOnboardingComplete,
    markDemoTourComplete,
  } = useHelp();
  const [showSettings, setShowSettings] = useState(false);
  const [showTestDocument, setShowTestDocument] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [localConversations, setLocalConversations] = useState<any[]>([]);

  const isDemoMode = !process.env.REACT_APP_SUPABASE_URL;

  // Load conversations from localStorage in demo mode
  const loadLocalConversations = () => {
    const saved: any[] = [];

    console.log('Dashboard: Loading conversations from localStorage...');
    console.log('Total localStorage items:', localStorage.length);

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('conversation-')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '');
          console.log('Dashboard: Found conversation:', key, data);
          saved.push({
            id: data.id,
            title: data.title || 'Untitled Conversation',
            mode: data.mode || 'general',
            advisor_type: 'celebrity', // Default for now
            advisor_id: data.advisors?.[0]?.id || 'unknown',
            messages: data.messages || [],
            updated_at: data.lastUpdated || new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error loading conversation:', error);
        }
      }
    }

    console.log('Dashboard: Loaded conversations:', saved);
    setLocalConversations(
      saved.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    );
  };

  // Track dashboard view
  useEffect(() => {
    analytics.trackNavigation.dashboardView();
  }, []);

  useEffect(() => {
    if (isDemoMode) {
      loadLocalConversations();

      // Listen for localStorage changes to keep conversations in sync
      const handleStorageChange = () => {
        loadLocalConversations();
      };

      // Check for new conversations periodically
      const interval = setInterval(loadLocalConversations, 5000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [isDemoMode]);

  // Reload conversations from AdvisorContext when returning to Dashboard
  useEffect(() => {
    console.log('Dashboard mounted - conversations:', conversations.length);
    // Conversations are automatically loaded by AdvisorContext when user is available
  }, [conversations]);

  const modes: {
    id: ApplicationMode;
    title: string;
    description: string;
    icon: string;
    color: string;
  }[] = [
    {
      id: 'pitch_practice',
      title: 'Practice Your Pitch',
      description: 'Perfect your elevator pitch with AI coaching before facing the Sharks',
      icon: '🎤',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'advisory_conversation',
      title: 'Swim with the Sharks',
      description: 'Discuss your ideas with the Sharks',
      icon: '🦈',
      color: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-black dashboard-main">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero/shark-tank-hero.png"
          alt="Shark Tank Advisors"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-black/50 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">BEAR TRAP</h1>
              <span className="ml-3 text-amber-400 text-sm">Shark Tank Advisory</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-300">Welcome, {user?.full_name || user?.email}</div>
              <button
                onClick={() => onModeSelect('advisor_management')}
                className="text-amber-400 hover:text-amber-300 font-medium flex items-center"
                data-tour="advisor-management"
              >
                <Users className="w-4 h-4 mr-1" />
                Advisors
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-white"
                data-tour="settings"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={async () => {
                  try {
                    await signOut();
                    window.location.reload();
                  } catch (error) {
                    window.location.reload();
                  }
                }}
                className="text-gray-400 hover:text-white"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Email Verification Banner */}
        <EmailVerificationBanner />

        {/* Application Modes */}
        <div className="mb-8 advisory-modes">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Choose Your Advisory Mode</h2>
              <p className="text-sm text-gray-400 mt-1">
                Select how you want to work with your Shark Tank advisors today
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map(mode => (
              <button
                key={mode.id}
                onClick={() => {
                  if (mode.id === 'test_document') {
                    setShowTestDocument(true);
                  } else {
                    analytics.trackNavigation.modeSelected(mode.id);
                    onModeSelect(mode.id);
                  }
                }}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 hover:scale-[1.02] transition-all text-left group border border-white/20 hover:border-amber-400/50"
              >
                <div className="flex items-start space-x-4">
                  <div
                    className={cn(
                      'w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0',
                      'bg-gradient-to-r',
                      mode.color
                    )}
                  >
                    <span className="text-2xl">{mode.icon}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1 group-hover:text-amber-400 transition-colors">
                      {mode.title}
                    </h3>
                    <p className="text-sm text-gray-300">{mode.description}</p>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </button>
            ))}
          </div>

          {/* Quick Start Tips */}
          {(isDemoMode ? localConversations : conversations).length === 0 && (
            <div className="mt-6 bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🦈</span>
                </div>
                <div>
                  <h4 className="font-semibold text-amber-400 mb-2">Ready to Face the Sharks?</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>
                      <strong className="text-white">First time?</strong> Practice your pitch before
                      entering the tank
                    </li>
                    <li>
                      <strong className="text-white">Got a business idea?</strong> Swim with the
                      Sharks and get brutally honest feedback
                    </li>
                    <li>
                      <strong className="text-white">Have a pitch deck?</strong> Upload it to show
                      the Sharks your numbers
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Conversations */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Recent Conversations</h3>
              {(isDemoMode ? localConversations : conversations).length > 0 && (
                <button
                  onClick={() => onModeSelect('advisory_conversation')}
                  className="text-sm text-amber-400 hover:text-amber-300 font-medium"
                >
                  View All
                </button>
              )}
            </div>
            {(isDemoMode ? localConversations : conversations).length > 0 ? (
              <div className="space-y-2">
                {(isDemoMode ? localConversations : conversations).slice(0, 5).map(conversation => {
                  const advisor =
                    conversation.advisor_type === 'celebrity'
                      ? celebrityAdvisors.find(a => a.id === conversation.advisor_id)
                      : customAdvisors.find(a => a.id === conversation.advisor_id);

                  return (
                    <button
                      key={conversation.id}
                      onClick={() => {
                        setActiveConversation(conversation);
                        onModeSelect('advisory_conversation');
                      }}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-white/20"
                    >
                      <Avatar
                        avatar_emoji={advisor?.avatar_emoji}
                        avatar_image={advisor?.avatar_image}
                        avatar_url={(advisor as any)?.avatar_url}
                        name={advisor?.name || 'Unknown'}
                        size="md"
                      />
                      <div className="flex-1 min-w-0 text-left">
                        <p className="text-sm font-medium text-white truncate">
                          {advisor?.name || 'Unknown Advisor'}
                        </p>
                        <p className="text-xs text-gray-400 capitalize">
                          {conversation.mode.replace('_', ' ')} • {conversation.messages.length}{' '}
                          message{conversation.messages.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-500 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-8 h-8 text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <p className="text-gray-300 font-medium mb-1">No conversations yet</p>
                <p className="text-sm text-gray-500">
                  Select a mode above to start your first advisory session
                </p>
              </div>
            )}
          </div>

          {/* Available Advisors - Shark Tank Cast */}
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 available-advisors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">The Sharks</h3>
              <button
                onClick={() => onModeSelect('advisor_management')}
                className="text-sm text-amber-400 hover:text-amber-300 font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-2">
              {celebrityAdvisors.slice(0, 8).map(advisor => (
                <button
                  key={advisor.id}
                  onClick={() => onModeSelect('advisory_conversation')}
                  className="w-full flex items-center space-x-3 p-3 hover:bg-white/10 rounded-lg transition-colors border border-transparent hover:border-amber-400/30"
                  title={`Start conversation with ${advisor.name}`}
                >
                  <Avatar
                    avatar_emoji={advisor.avatar_emoji}
                    avatar_image={advisor.avatar_image}
                    avatar_url={advisor.avatar_url}
                    name={advisor.name}
                    size="md"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white">{advisor.name}</p>
                    <p className="text-xs text-gray-400 truncate">{advisor.title}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-400 flex-shrink-0">
                    Shark
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />

      {showTestDocument && (
        <div className="fixed inset-0 bg-white z-50 overflow-auto">
          <div className="p-4">
            <button
              onClick={() => setShowTestDocument(false)}
              className="mb-4 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              ← Back to Dashboard
            </button>
            <TestDocumentManagement />
          </div>
        </div>
      )}

      {/* Help System Modals */}
      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        initialSection={helpSection}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onComplete={preferences => {
          markOnboardingComplete(preferences);
          console.log('Onboarding completed with preferences:', preferences);
        }}
      />

      <DemoTour
        isOpen={showDemoTour}
        onClose={() => setShowDemoTour(false)}
        onComplete={() => {
          markDemoTourComplete();
          console.log('Demo tour completed');
        }}
      />

      <QuickStartGuide
        isOpen={showQuickStart}
        onClose={() => setShowQuickStart(false)}
        onStartDemo={() => {
          setShowQuickStart(false);
          setShowDemoTour(true);
        }}
        onStartConversation={() => {
          setShowQuickStart(false);
          onModeSelect('advisory_conversation');
        }}
      />
    </div>
  );
};
