import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdvisorProvider } from './contexts/AdvisorContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { HelpProvider } from './contexts/HelpContext';
import { AuthModal } from './components/Auth/AuthModal';
import { Dashboard } from './components/Dashboard/Dashboard';
import { PitchPracticeMode } from './components/Modes/PitchPracticeMode';
import { ConversationManager } from './components/Conversations/ConversationManager';
import { AdvisorManagement } from './components/Advisory/AdvisorManagement';
import TermsOfService from './components/Legal/TermsOfService';
import { ApplicationMode } from './types';
import { formatCurrency } from './utils';

// Create a client
const queryClient = new QueryClient();

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const isDemoMode = !process.env.REACT_APP_SUPABASE_URL;
  const [showTermsOfService, setShowTermsOfService] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      {isDemoMode && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-500 text-black text-center py-2 px-4 text-sm font-medium z-50">
          🚀 DEMO MODE - Try the full experience! Sign up with any email/password.
        </div>
      )}
      <div className="max-w-4xl mx-auto px-6 text-center">
        {/* Hero Section */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">Bearable Advisors</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Transform your strategic decision-making with a virtual board of world-class business
            advisors powered by cutting-edge AI technology.
          </p>

          {/* Status Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-medium mb-8">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Platform Successfully Deployed
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              🎤
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Pitch Practice</h3>
            <p className="text-sm text-gray-600">
              AI-powered pitch analysis with real-time feedback
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              🧠
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Strategic Planning</h3>
            <p className="text-sm text-gray-600">
              Multi-advisor discussions with celebrity insights
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              📊
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Due Diligence</h3>
            <p className="text-sm text-gray-600">
              Investment-grade analysis and VC memo generation
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 mx-auto">
              ⚡
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Consultation</h3>
            <p className="text-sm text-gray-600">Instant expert advice for immediate decisions</p>
          </div>
        </div>

        {/* Celebrity Advisors */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Celebrity Advisory Board</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {[
              'Jeff',
              'Gordon Daugherty',
              'Mark Cuban',
              'Reid Hoffman',
              'Jason Calacanis',
              'Barbara Corcoran',
            ].map(name => (
              <div key={name} className="bg-gray-50 rounded-lg px-4 py-2">
                <span className="font-medium text-gray-700">{name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Subscription Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Founder</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatCurrency(97)}
              <span className="text-lg text-gray-500">/mo</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 20 AI advisor hours</li>
              <li>• 10 document analyses</li>
              <li>• Basic pitch practice</li>
              <li>• Email support</li>
            </ul>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 shadow-sm border-2 border-blue-200 relative">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Scale-Up</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatCurrency(247)}
              <span className="text-lg text-gray-500">/mo</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 50 AI advisor hours</li>
              <li>• Unlimited pitch practice</li>
              <li>• Custom advisor creation</li>
              <li>• External data integration</li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Enterprise</h3>
            <div className="text-3xl font-bold text-blue-600 mb-4">
              {formatCurrency(497)}
              <span className="text-lg text-gray-500">/mo</span>
            </div>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• 150 AI advisor hours</li>
              <li>• Unlimited everything</li>
              <li>• API access</li>
              <li>• White-label options</li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">
            Ready to Transform Your Strategic Decision-Making?
          </h2>
          <p className="text-blue-100 mb-6">
            Join thousands of entrepreneurs who've revolutionized their advisory experience
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                console.log('Start Free Trial clicked');
                onGetStarted();
              }}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </button>
            <button className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Watch Demo
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-500 text-sm">
              Bearable Advisors - Where strategy meets innovation ✨
            </p>
            <div className="flex space-x-6 text-sm">
              <button
                onClick={() => setShowTermsOfService(true)}
                className="text-gray-600 hover:text-gray-900 transition-colors underline"
              >
                Terms of Service
              </button>
              <button
                onClick={() => {
                  /* TODO: Add Privacy Policy */
                }}
                className="text-gray-600 hover:text-gray-900 transition-colors underline"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Terms of Service Modal */}
      <TermsOfService isOpen={showTermsOfService} onClose={() => setShowTermsOfService(false)} />
    </div>
  );
}

function AuthenticatedApp() {
  const { user, loading } = useAuth();
  const [selectedMode, setSelectedMode] = useState<ApplicationMode | null>(null);

  // Mock user for development mode
  const mockUser = {
    id: 'dev-user-123',
    email: 'developer@eliteai.com',
    full_name: 'Developer User',
    subscription_tier: 'enterprise' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your advisory platform...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || mockUser;

  if (!currentUser) {
    return null; // This will be handled by the main App component
  }

  return (
    <HelpProvider>
      <SettingsProvider>
        <SubscriptionProvider>
          <AdvisorProvider>
            {selectedMode ? (
              (() => {
                const handleBackToDashboard = () => setSelectedMode(null);

                switch (selectedMode) {
                  case 'pitch_practice':
                    return <PitchPracticeMode onBack={handleBackToDashboard} />;
                  case 'advisory_conversation':
                    return <ConversationManager onBack={handleBackToDashboard} />;
                  case 'advisor_management':
                    return <AdvisorManagement onBack={handleBackToDashboard} />;
                  default:
                    return (
                      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                        <div className="max-w-4xl mx-auto px-6 text-center">
                          <h1 className="text-4xl font-bold text-gray-900 mb-6">
                            {selectedMode
                              ? (selectedMode as string).replace('_', ' ').toUpperCase()
                              : ''}{' '}
                            Mode
                          </h1>
                          <p className="text-xl text-gray-600 mb-8">
                            This mode is under development. Full implementation coming soon!
                          </p>
                          <button
                            onClick={() => setSelectedMode(null)}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                          >
                            Back to Dashboard
                          </button>
                        </div>
                      </div>
                    );
                }
              })()
            ) : (
              <Dashboard onModeSelect={setSelectedMode} />
            )}
          </AdvisorProvider>
        </SubscriptionProvider>
      </SettingsProvider>
    </HelpProvider>
  );
}

function AppContent() {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  console.log('AppContent render:', { user, showAuthModal });

  // DEVELOPMENT MODE: Bypass authentication
  const isDevelopmentMode = false; // Disabled to test real authentication

  if (user || isDevelopmentMode) {
    return <AuthenticatedApp />;
  }

  return (
    <>
      <LandingPage
        onGetStarted={() => {
          console.log('Setting showAuthModal to true');
          setShowAuthModal(true);
        }}
      />
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          console.log('Closing auth modal');
          setShowAuthModal(false);
        }}
      />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
