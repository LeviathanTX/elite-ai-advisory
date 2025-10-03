import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
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
import { cn, formatCurrency, calculatePercentage } from '../../utils';
import { ApplicationMode } from '../../types';

interface DashboardProps {
  onModeSelect: (mode: ApplicationMode) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onModeSelect }) => {
  const { user, signOut } = useAuth();
  const { currentTier, limits, usage, pricing } = useSubscription();
  const { celebrityAdvisors, customAdvisors, conversations } = useAdvisor();
  const {
    showHelpModal,
    showOnboarding,
    showDemoTour,
    helpSection,
    setShowHelpModal,
    setShowOnboarding,
    setShowDemoTour,
    markOnboardingComplete,
    markDemoTourComplete
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
    setLocalConversations(saved.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    ));
  };

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

  const modes: { 
    id: ApplicationMode; 
    title: string; 
    description: string; 
    icon: string;
    color: string;
  }[] = [
    {
      id: 'pitch_practice',
      title: 'Pitch Practice',
      description: 'AI-powered pitch analysis with real-time feedback and voice recording',
      icon: '🎤',
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'advisory_conversation',
      title: 'Advisory Board',
      description: 'Strategic planning, due diligence, consultations & document analysis',
      icon: '💼',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'test_document' as any,
      title: '🧪 Test Document Features',
      description: 'Test the new document management and MCP folder features',
      icon: '📄',
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const getUsagePercentage = (used: number, limit: number): number => {
    if (limit === -1) return 0; // unlimited
    return calculatePercentage(used, limit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dashboard-main">
      {isDemoMode && (
        <div className="bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium">
          🚀 DEMO MODE - All features are simulated for demonstration
        </div>
      )}
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Bearable Advisors</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user?.full_name || user?.email}
              </div>
              <span className={cn(
                "px-3 py-1 rounded-full text-xs font-medium",
                currentTier === 'founder' && "bg-blue-100 text-blue-800",
                currentTier === 'scale-up' && "bg-purple-100 text-purple-800",
                currentTier === 'enterprise' && "bg-green-100 text-green-800"
              )}>
                {currentTier.charAt(0).toUpperCase() + currentTier.slice(1)} Plan
              </span>
              <button
                onClick={() => onModeSelect('advisor_management')}
                className="text-purple-600 hover:text-purple-700 font-medium"
                data-tour="advisor-management"
              >
                Manage Advisors
              </button>
              <button
                onClick={() => setShowQuickStart(true)}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center"
                title="Quick Start Guide"
              >
                <HelpCircle className="w-4 h-4 mr-1" />
                Quick Start
              </button>
              <button
                onClick={() => setShowHelpModal(true)}
                className="text-gray-500 hover:text-gray-700 font-medium"
                title="Help & Support"
              >
                Help
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-500 hover:text-gray-700"
                data-tour="settings"
              >
                Settings
              </button>
              <button
                onClick={signOut}
                className="text-gray-500 hover:text-gray-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Usage Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 usage-stats">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">AI Advisor Hours</h3>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {usage.ai_advisor_hours_used}
              {limits.ai_advisor_hours !== -1 && ` / ${limits.ai_advisor_hours}`}
            </div>
            {limits.ai_advisor_hours !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${getUsagePercentage(usage.ai_advisor_hours_used, limits.ai_advisor_hours)}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Document Analyses</h3>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {usage.document_analyses_used}
              {limits.document_analyses !== -1 && ` / ${limits.document_analyses}`}
            </div>
            {limits.document_analyses !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${getUsagePercentage(usage.document_analyses_used, limits.document_analyses)}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Pitch Sessions</h3>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {usage.pitch_practice_sessions_used}
              {limits.pitch_practice_sessions !== -1 && ` / ${limits.pitch_practice_sessions}`}
            </div>
            {limits.pitch_practice_sessions !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${getUsagePercentage(usage.pitch_practice_sessions_used, limits.pitch_practice_sessions)}%` }}
                ></div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Custom Advisors</h3>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {customAdvisors.length}
              {limits.custom_advisors !== -1 && ` / ${limits.custom_advisors}`}
            </div>
            {limits.custom_advisors !== -1 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full" 
                  style={{ width: `${getUsagePercentage(customAdvisors.length, limits.custom_advisors)}%` }}
                ></div>
              </div>
            )}
          </div>
        </div>

        {/* Application Modes */}
        <div className="mb-8 advisory-modes">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Advisory Mode</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modes.map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  if (mode.id === 'test_document') {
                    setShowTestDocument(true);
                  } else {
                    onModeSelect(mode.id);
                  }
                }}
                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow text-left group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto",
                  "bg-gradient-to-r", mode.color
                )}>
                  <span className="text-2xl">{mode.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">{mode.title}</h3>
                <p className="text-sm text-gray-600 text-center">{mode.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Conversations */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
            {(isDemoMode ? localConversations : conversations).length > 0 ? (
              <div className="space-y-3">
                {(isDemoMode ? localConversations : conversations).slice(0, 5).map((conversation) => {
                  const advisor = conversation.advisor_type === 'celebrity'
                    ? celebrityAdvisors.find(a => a.id === conversation.advisor_id)
                    : customAdvisors.find(a => a.id === conversation.advisor_id);
                  
                  return (
                    <div key={conversation.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {advisor?.name.charAt(0) || '?'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {advisor?.name || 'Unknown Advisor'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {conversation.mode.replace('_', ' ')} • {conversation.messages.length} messages
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No conversations yet. Start by selecting a mode above!
              </p>
            )}
          </div>

          {/* Available Advisors */}
          <div className="bg-white rounded-xl p-6 shadow-sm available-advisors">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Advisors</h3>
            <div className="space-y-3">
              {celebrityAdvisors.slice(0, 6).map((advisor) => (
                <div key={advisor.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {advisor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{advisor.name}</p>
                    <p className="text-xs text-gray-500">{advisor.title}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Celebrity
                  </span>
                </div>
              ))}
              {customAdvisors.slice(0, 3).map((advisor) => (
                <div key={advisor.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-purple-600">
                      {advisor.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{advisor.name}</p>
                    <p className="text-xs text-gray-500">{advisor.title}</p>
                  </div>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Custom
                  </span>
                </div>
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
        onComplete={(preferences) => {
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